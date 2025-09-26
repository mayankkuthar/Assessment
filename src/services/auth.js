import { userService } from './sqlite-database.js';

// Local authentication service
export const authService = {
  // Current user session stored in memory
  currentUser: null,
  currentSession: null,
  
  // Initialize auth service - check for existing session
  async initialize() {
    try {
      // Check for session in localStorage
      const sessionId = localStorage.getItem('assessment_session');
      if (sessionId) {
        const session = await userService.validateSession(sessionId);
        if (session) {
          this.currentUser = {
            id: session.user_id,
            email: session.email,
            role: session.role
          };
          this.currentSession = {
            id: sessionId,
            expires_at: session.expires_at
          };
          return this.currentUser;
        } else {
          // Session is invalid, clear it
          localStorage.removeItem('assessment_session');
        }
      }
      return null;
    } catch (error) {
      console.error('Error initializing auth:', error);
      localStorage.removeItem('assessment_session');
      return null;
    }
  },

  // Sign up new user
  async signUp(email, password, role = 'user') {
    try {
      const user = await userService.createUser(email, password, role);
      
      // Auto login after signup
      const session = await userService.createSession(user.id);
      
      this.currentUser = user;
      this.currentSession = session;
      
      // Store session in localStorage
      localStorage.setItem('assessment_session', session.id);
      
      return { user, session, error: null };
    } catch (error) {
      console.error('Error signing up:', error);
      return { user: null, session: null, error: error.message };
    }
  },

  // Sign in existing user
  async signIn(email, password) {
    try {
      const user = await userService.validateUser(email, password);
      if (!user) {
        return { user: null, session: null, error: 'Invalid email or password' };
      }
      
      // Create new session
      const session = await userService.createSession(user.id);
      
      this.currentUser = user;
      this.currentSession = session;
      
      // Store session in localStorage
      localStorage.setItem('assessment_session', session.id);
      
      return { user, session, error: null };
    } catch (error) {
      console.error('Error signing in:', error);
      return { user: null, session: null, error: error.message };
    }
  },

  // Sign out current user
  async signOut() {
    try {
      if (this.currentSession) {
        await userService.deleteSession(this.currentSession.id);
      }
      
      this.currentUser = null;
      this.currentSession = null;
      localStorage.removeItem('assessment_session');
      
      return { error: null };
    } catch (error) {
      console.error('Error signing out:', error);
      // Clear local state even if server signout fails
      this.currentUser = null;
      this.currentSession = null;
      localStorage.removeItem('assessment_session');
      
      return { error: error.message };
    }
  },

  // Get current user
  getUser() {
    return this.currentUser;
  },

  // Get current session
  getSession() {
    return this.currentSession;
  },

  // Check if user is authenticated
  isAuthenticated() {
    return this.currentUser !== null;
  },

  // Check if user has admin role
  isAdmin() {
    return this.currentUser?.role === 'admin';
  },

  // Create default admin user if none exists
  async createDefaultAdmin() {
    try {
      // Try to create default admin account
      const defaultEmail = 'admin@assessment.local';
      const defaultPassword = 'admin123';
      
      const result = await userService.createUser(defaultEmail, defaultPassword, 'admin');
      console.log('✅ Default admin user created:', defaultEmail);
      console.log('🔑 Default password:', defaultPassword);
      console.log('⚠️  Please change the default password after login!');
      
      return result;
    } catch (error) {
      if (error.message.includes('already exists')) {
        // Admin already exists, that's fine
        return null;
      }
      console.error('Error creating default admin:', error);
      throw error;
    }
  }
};

// Authentication hook for local auth system
export function useAuth() {
  const [user, setUser] = React.useState(authService.getUser());
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const initializeAuth = async () => {
      try {
        const user = await authService.initialize();
        setUser(user);
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const signUp = async (email, password, role) => {
    setLoading(true);
    try {
      const result = await authService.signUp(email, password, role);
      if (result.user) {
        setUser(result.user);
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    setLoading(true);
    try {
      const result = await authService.signIn(email, password);
      if (result.user) {
        setUser(result.user);
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const result = await authService.signOut();
      setUser(null);
      return result;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    isAuthenticated: authService.isAuthenticated(),
    isAdmin: authService.isAdmin()
  };
}

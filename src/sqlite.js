// Local authentication system for the assessment tool
import { authApi } from './services/api.js';

// Simple state management for auth
let currentUser = null;
const authListeners = [];

// Local authentication system
export const auth = {
  // Get current user from localStorage or API
  getUser: async () => {
    try {
      if (currentUser) {
        return { data: { user: currentUser }, error: null };
      }
      
      // Try to get from localStorage first
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        currentUser = JSON.parse(storedUser);
        return { data: { user: currentUser }, error: null };
      }
      
      // Fallback to API
      return await authApi.getUser();
    } catch (error) {
      return { data: { user: null }, error: error.message };
    }
  },
  
  // Get session (compatibility with existing code)
  getSession: async () => {
    try {
      const userResult = await auth.getUser();
      return {
        data: { 
          session: userResult.data.user ? { user: userResult.data.user } : null 
        },
        error: null
      };
    } catch (error) {
      return { data: { session: null }, error: error.message };
    }
  },
  
  // User registration
  signUp: async ({ email, password, options = {} }) => {
    try {
      const role = options.data?.role || 'user';
      const user_name = options.data?.user_name || email.split('@')[0];
      const profile = options.data?.profile || 'user';
      
      const result = await authApi.signUp(email, password, role, user_name, profile);
      
      if (result.user && !result.error) {
        currentUser = result.user;
        // Store in localStorage
        localStorage.setItem('currentUser', JSON.stringify(result.user));
        // Notify listeners
        authListeners.forEach(callback => {
          callback('SIGNED_IN', { user: result.user });
        });
      }
      
      return result;
    } catch (error) {
      return { user: null, session: null, error: error.message };
    }
  },
  
  // User login
  signInWithPassword: async ({ email, password }) => {
    try {
      const result = await authApi.signIn(email, password);
      
      if (result.user && !result.error) {
        currentUser = result.user;
        // Store in localStorage
        localStorage.setItem('currentUser', JSON.stringify(result.user));
        // Notify listeners
        authListeners.forEach(callback => {
          callback('SIGNED_IN', { 
            user: result.user,
            access_token: 'local-token',
            token_type: 'bearer'
          });
        });
        
        console.log('✅ User signed in:', result.user.email, 'Role:', result.user.role);
      }
      
      return result;
    } catch (error) {
      return { user: null, session: null, error: error.message };
    }
  },
  
  // User logout
  signOut: async () => {
    try {
      const result = await authApi.signOut();
      currentUser = null;
      // Remove from localStorage
      localStorage.removeItem('currentUser');
      
      // Notify listeners
      authListeners.forEach(callback => {
        callback('SIGNED_OUT', null);
      });
      
      console.log('👋 User signed out');
      
      return result;
    } catch (error) {
      return { error: error.message };
    }
  },
  
  // Listen for auth state changes
  onAuthStateChange: (callback) => {
    // Add to listeners
    authListeners.push(callback);
    
    // Initial call with current state
    auth.getUser().then(({ data }) => {
      if (data.user) {
        callback('SIGNED_IN', { 
          user: data.user,
          access_token: 'local-token',
          token_type: 'bearer'
        });
      } else {
        callback('SIGNED_OUT', null);
      }
    });
    
    // Return unsubscribe function
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            const index = authListeners.indexOf(callback);
            if (index > -1) {
              authListeners.splice(index, 1);
            }
          }
        }
      }
    };
  },

  // Password reset (not available in local mode)
  resetPasswordForEmail: async (email, options = {}) => {
    console.log('Password reset not implemented in local mode');
    return { error: 'Password reset not available in local mode' };
  },

  // Email resend (not available in local mode)
  resend: async (options) => {
    console.log('Email resend not implemented in local mode');
    return { error: 'Email verification not available in local mode' };
  }
};

// Export for backward compatibility
export const supabase = { auth };

console.log('✅ Local authentication system initialized');

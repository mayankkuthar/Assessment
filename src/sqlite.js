// Replacement for src/supabase.js using API calls
import { authApi } from './services/api.js';

// Simple state management for auth
let currentUser = null;
const authListeners = [];

// Create a Supabase-like interface for easier migration
export const supabase = {
  auth: {
    getUser: async () => {
      try {
        if (currentUser) {
          return { data: { user: currentUser }, error: null };
        }
        return await authApi.getUser();
      } catch (error) {
        return { data: { user: null }, error: error.message };
      }
    },
    
    getSession: async () => {
      try {
        const userResult = await supabase.auth.getUser();
        return {
          data: { session: userResult.data.user ? { user: userResult.data.user } : null },
          error: null
        };
      } catch (error) {
        return { data: { session: null }, error: error.message };
      }
    },
    
    signUp: async ({ email, password, options = {} }) => {
      try {
        const role = options.data?.role || 'user';
        const user_name = options.data?.user_name || email.split('@')[0];
        const profile = options.data?.profile || 'user';
        
        const result = await authApi.signUp(email, password, role, user_name, profile);
        
        if (result.user && !result.error) {
          currentUser = result.user;
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
    
    signInWithPassword: async ({ email, password }) => {
      try {
        const result = await authApi.signIn(email, password);
        
        if (result.user && !result.error) {
          currentUser = result.user;
          // Notify listeners with proper session format
          authListeners.forEach(callback => {
            callback('SIGNED_IN', { 
              user: result.user,
              access_token: 'mock-token',
              token_type: 'bearer'
            });
          });
          
          // Don't refresh - let React handle the state change
          console.log('✅ User signed in:', result.user.email, 'Role:', result.user.role);
        }
        
        return result;
      } catch (error) {
        return { user: null, session: null, error: error.message };
      }
    },
    
    signOut: async () => {
      try {
        const result = await authApi.signOut();
        currentUser = null;
        
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
    
    onAuthStateChange: (callback) => {
      // Add to listeners
      authListeners.push(callback);
      
      // Initial call with current state
      supabase.auth.getUser().then(({ data }) => {
        if (data.user) {
          callback('SIGNED_IN', { 
            user: data.user,
            access_token: 'mock-token',
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

    // Add some missing Supabase methods
    resetPasswordForEmail: async (email, options = {}) => {
      // Mock implementation
      console.log('Password reset not implemented in SQLite version');
      return { error: 'Password reset not available in offline mode' };
    },

    resend: async (options) => {
      // Mock implementation  
      console.log('Email resend not implemented in SQLite version');
      return { error: 'Email verification not available in offline mode' };
    }
  },

  // Mock database methods that some components might use
  from: (table) => ({
    select: () => ({
      eq: () => ({
        single: async () => ({ data: null, error: { message: 'Database queries not available in basic mode' } })
      }),
      head: true
    }),
    insert: () => ({
      select: () => ({
        single: async () => ({ data: null, error: { message: 'Database queries not available in basic mode' } })
      })
    })
  })
};

console.log('✅ SQLite API client initialized - Supabase replacement ready');

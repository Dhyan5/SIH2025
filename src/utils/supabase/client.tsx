import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

const supabaseUrl = `https://${projectId}.supabase.co`;

export const createClient = () => {
  try {
    // Validate credentials before creating client
    if (!projectId || !publicAnonKey) {
      console.warn('Supabase credentials missing, falling back to demo mode');
      return createMockClient();
    }

    return createSupabaseClient(supabaseUrl, publicAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        // Add timeout for auth operations
        storageKey: 'brainpath-auth',
        flowType: 'pkce'
      },
      // Add global request timeout
      global: {
        headers: {
          'X-Client-Info': 'brainpath-web'
        }
      }
    });
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
    return createMockClient();
  }
};

// Create a mock client for fallback
const createMockClient = () => {
  console.log('Using mock Supabase client - demo accounts will work');
  return {
    auth: {
      signUp: async () => {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
        return Promise.reject(new Error('Supabase service unavailable. Please use demo accounts for immediate access.'));
      },
      signInWithPassword: async () => {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
        return Promise.reject(new Error('Supabase service unavailable. Please use demo accounts for immediate access.'));
      },
      signOut: () => Promise.resolve({ error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: null }, error: null })
    }
  } as any;
};

export const supabase = createClient();
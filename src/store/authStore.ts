import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  signIn: async (email: string, password: string) => {
    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      // Ensure profile exists after sign in
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({ 
            id: data.user.id,
            username: data.user.email?.split('@')[0], // Set a default username
            points: 0
          })
          .select()
          .single();

        // If insert fails due to conflict (profile exists), ignore the error
        if (profileError && !profileError.message.includes('duplicate key')) {
          throw profileError;
        }
        
        set({ user: data.user });
      }
    } catch (error) {
      throw error;
    }
  },
  signUp: async (email: string, password: string) => {
    try {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;

      // Create profile for new user
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({ 
            id: data.user.id,
            username: email.split('@')[0], // Set a default username
            points: 0
          })
          .select()
          .single();

        if (profileError) throw profileError;
        
        set({ user: data.user });
      }
    } catch (error) {
      throw error;
    }
  },
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    set({ user: null });
  },
}));

// Initialize auth state
supabase.auth.onAuthStateChange((event, session) => {
  useAuthStore.setState({ 
    user: session?.user || null, 
    loading: false 
  });
});
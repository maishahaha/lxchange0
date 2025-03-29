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
        await supabase
          .from('profiles')
          .upsert({ id: data.user.id }, { onConflict: 'id' });
        
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
        await supabase
          .from('profiles')
          .upsert({ id: data.user.id }, { onConflict: 'id' });
        
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
import { supabase } from './supabaseClient.js';

// login
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'http://localhost:4321/auth/callback' 
    }
  });
  if (error) throw error;
  return data;
};

// logout
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

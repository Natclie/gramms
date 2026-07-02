import { supabase } from './supabaseClient.js';

// login
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${import.meta.env.PUBLIC_SITE_URL}/auth/callback`
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
import { supabase } from './supabaseClient.js';

// links del usuario
export const getUserLinks = async (userId) => {
  const { data, error } = await supabase
    .from('urls')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};
// crear link
export const createLink = async (userId, originalUrl, shortSlug) => {
  const { data, error } = await supabase
    .from('urls')
    .insert([
      {
        original_url: originalUrl,
        short_slug: shortSlug,
        user_id: userId
      }
    ]);
  if (error) throw error;
  return data;
};

// borrar link
export const deleteLink = async (id) => {
  const { error } = await supabase.from('urls').delete().eq('user_id', id);
  if (error) throw error;
};

import { supabase } from '../../lib/supabaseClient.js';

export async function GET({ url, redirect }) {
  const code = url.searchParams.get('code');

  if (!code) {
    return redirect('/login?error=missing_code');
  }

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('Error intercambiando código:', error.message);
    return redirect('/login?error=auth_failed');
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError) {
    console.error('Error obteniendo usuario:', userError.message);
    return redirect('/login?error=user_fetch_failed');
  }

  // Actualizar user_metadata con avatar_url desde Google si viene en raw_user_metadata
  if (user && user.raw_user_metadata?.picture && !user.user_metadata?.avatar_url) {
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        avatar_url: user.raw_user_metadata.picture,
        full_name: user.raw_user_metadata.name || user.user_metadata?.full_name,
      },
    });

    if (updateError) {
      console.error('Error actualizando user_metadata:', updateError.message);
    }
  }

  console.log('Usuario logueado:', user.id);

  return redirect('/dash'); 
}

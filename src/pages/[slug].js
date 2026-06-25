export const prerender = false;

import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
);

export async function GET({ params, redirect }) {
  const slug = params.slug;

  const { data, error } = await supabase
    .from('urls')
    .select('original_url')
    .eq('short_slug', slug)

    .single();

  if (error) {
    console.error(error);
    return new Response('Error consultando la base de datos', { status: 500 });
  }

  if (data) {
    return redirect(data.original_url, 301);
  }

  return new Response('URL no encontrada', { status: 404 });
}

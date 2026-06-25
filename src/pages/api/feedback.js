import { createClient } from '@supabase/supabase-js';

export const prerender = false;

const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
);

const jsonResponse = (payload, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export async function POST({ request }) {
  let body;
  try {
    body = await request.json();
  } catch (error) {
    return jsonResponse({ error: 'Payload inválido' }, 400);
  }

  const subject = typeof body.subject === 'string' ? body.subject.trim() : '';
  const feed = typeof body.feed === 'string' ? body.feed.trim() : '';
  const username = typeof body.username === 'string' && body.username.trim().length > 0 ? body.username.trim() : null;

  if (!subject) {
    return jsonResponse({ error: 'El subject es obligatorio.' }, 400);
  }

  if (!feed) {
    return jsonResponse({ error: 'El feedback es obligatorio.' }, 400);
  }

  const { data, error } = await supabase.from('feedback').insert([
    {
      subject,
      feed,
      username,
    },
  ]);

  if (error) {
    console.error('Error insertando feedback:', error);
    return jsonResponse({ error: 'Error al guardar el feedback.' }, 500);
  }

  return jsonResponse({ feedback: data?.[0] || null });
}

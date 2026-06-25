import { createClient } from '@supabase/supabase-js';

export const prerender = false;

const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
);

const RATE_LIMIT_WINDOW_MS = 60_000; // 60 seconds
const MAX_REQUESTS_PER_WINDOW = 6; // max requests per IP per window
const rateLimits = new Map();

const cleanIp = (ip) => {
  if (!ip) return 'unknown';
  return ip.split(',')[0].trim();
};

const getClientIp = (request) => {
  return (
    cleanIp(request.headers.get('x-forwarded-for')) ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    'unknown'
  );
};

const generateSlug = () => Math.random().toString(36).substring(2, 8);

const isValidSlug = (value) => typeof value === 'string' && /^[a-zA-Z0-9_-]{4,16}$/.test(value);

const getRateLimitStatus = (ip) => {
  const now = Date.now();
  const entry = rateLimits.get(ip);

  if (!entry || now - entry.firstRequest > RATE_LIMIT_WINDOW_MS) {
    const newEntry = { count: 1, firstRequest: now };
    rateLimits.set(ip, newEntry);
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1 };
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, remaining: 0 };
  }

  entry.count += 1;
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - entry.count };
};

const jsonResponse = (payload, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export async function POST({ request }) {
  const ip = getClientIp(request);
  const rateLimit = getRateLimitStatus(ip);

  if (!rateLimit.allowed) {
    return jsonResponse(
      { error: 'Demasiadas solicitudes. Intenta de nuevo en unos segundos.' },
      429
    );
  }

  let body;

  try {
    body = await request.json();
  } catch (error) {
    return jsonResponse({ error: 'Payload inválido.' }, 400);
  }

  const originalUrl = typeof body.url === 'string' ? body.url.trim() : '';
  let shortSlug = typeof body.slug === 'string' ? body.slug.trim() : '';
  const userId = typeof body.userId === 'string' ? body.userId.trim() : null;

  if (!originalUrl) {
    return jsonResponse({ error: 'La URL es obligatoria.' }, 400);
  }

  if (!shortSlug || !isValidSlug(shortSlug)) {
    shortSlug = generateSlug();
  }

  try {
    const { data: existing, error: existingError } = await supabase
      .from('urls')
      .select('short_slug, original_url')
      .eq('original_url', originalUrl)
      .eq('user_id', userId)
      .maybeSingle();

    if (existingError) {
      console.error('Error consultando URL existente:', existingError);
      return jsonResponse({ error: 'Error del servidor al buscar URL existente.' }, 500);
    }

    if (existing) {
      return jsonResponse({ short_slug: existing.short_slug });
    }

    const maxAttempts = 3;
    let attemptSlug = shortSlug;
    let insertResult = null;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const payload = {
        original_url: originalUrl,
        short_slug: attemptSlug,
        user_id: userId,
      };

      const { data, error } = await supabase.from('urls').insert([payload]);

      if (!error) {
        insertResult = data?.[0];
        break;
      }

      const slugTaken =
        error.details?.includes('already exists') ||
        error.code === '23505' ||
        error.message?.includes('duplicate');

      if (slugTaken) {
        attemptSlug = generateSlug();
        continue;
      }

      console.error('Error insertando URL:', error);
      return jsonResponse({ error: 'Error del servidor al crear la URL.' }, 500);
    }

    if (!insertResult) {
      return jsonResponse(
        { error: 'No se pudo generar un slug único. Intenta de nuevo.' },
        500
      );
    }

    return jsonResponse({ short_slug: insertResult.short_slug });
  } catch (error) {
    console.error('Error en el endpoint /api/shorten:', error);
    return jsonResponse({ error: 'Error interno del servidor.' }, 500);
  }
}

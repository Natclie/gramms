import { r as __exportAll } from "./rolldown-runtime_CE-6LUnI.mjs";
import { createClient } from "@supabase/supabase-js";
//#region src/pages/api/shorten.js
var shorten_exports = /* @__PURE__ */ __exportAll({
	POST: () => POST,
	prerender: () => false
});
var supabase = createClient("https://lmjiypkpinjboiuglhln.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxtaml5cGtwaW5qYm9pdWdsaGxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3ODYxNzQsImV4cCI6MjA3MDM2MjE3NH0.ZvwBGTpuQY1FvWA1GJHnnMED9dUouecbg9YMvDMMe3Q");
var RATE_LIMIT_WINDOW_MS = 6e4;
var MAX_REQUESTS_PER_WINDOW = 6;
var rateLimits = /* @__PURE__ */ new Map();
var cleanIp = (ip) => {
	if (!ip) return "unknown";
	return ip.split(",")[0].trim();
};
var getClientIp = (request) => {
	return cleanIp(request.headers.get("x-forwarded-for")) || request.headers.get("x-real-ip") || request.headers.get("cf-connecting-ip") || "unknown";
};
var generateSlug = () => Math.random().toString(36).substring(2, 8);
var isValidSlug = (value) => typeof value === "string" && /^[a-zA-Z0-9_-]{4,16}$/.test(value);
var getRateLimitStatus = (ip) => {
	const now = Date.now();
	const entry = rateLimits.get(ip);
	if (!entry || now - entry.firstRequest > RATE_LIMIT_WINDOW_MS) {
		const newEntry = {
			count: 1,
			firstRequest: now
		};
		rateLimits.set(ip, newEntry);
		return {
			allowed: true,
			remaining: MAX_REQUESTS_PER_WINDOW - 1
		};
	}
	if (entry.count >= MAX_REQUESTS_PER_WINDOW) return {
		allowed: false,
		remaining: 0
	};
	entry.count += 1;
	return {
		allowed: true,
		remaining: MAX_REQUESTS_PER_WINDOW - entry.count
	};
};
var jsonResponse = (payload, status = 200) => new Response(JSON.stringify(payload), {
	status,
	headers: { "Content-Type": "application/json" }
});
async function POST({ request }) {
	if (!getRateLimitStatus(getClientIp(request)).allowed) return jsonResponse({ error: "Demasiadas solicitudes. Intenta de nuevo en unos segundos." }, 429);
	let body;
	try {
		body = await request.json();
	} catch (error) {
		return jsonResponse({ error: "Payload inválido." }, 400);
	}
	const originalUrl = typeof body.url === "string" ? body.url.trim() : "";
	let shortSlug = typeof body.slug === "string" ? body.slug.trim() : "";
	const userId = typeof body.userId === "string" ? body.userId.trim() : null;
	if (!originalUrl) return jsonResponse({ error: "La URL es obligatoria." }, 400);
	if (!shortSlug || !isValidSlug(shortSlug)) shortSlug = generateSlug();
	try {
		const { data: existing, error: existingError } = await supabase.from("urls").select("short_slug, original_url").eq("original_url", originalUrl).eq("user_id", userId).maybeSingle();
		if (existingError) {
			console.error("Error consultando URL existente:", existingError);
			return jsonResponse({ error: "Error del servidor al buscar URL existente." }, 500);
		}
		if (existing) return jsonResponse({ short_slug: existing.short_slug });
		const maxAttempts = 3;
		let attemptSlug = shortSlug;
		let insertResult = null;
		for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
			const payload = {
				original_url: originalUrl,
				short_slug: attemptSlug,
				user_id: userId
			};
			const { data, error } = await supabase.from("urls").insert([payload]);
			if (!error) {
				insertResult = data?.[0];
				break;
			}
			if (error.details?.includes("already exists") || error.code === "23505" || error.message?.includes("duplicate")) {
				attemptSlug = generateSlug();
				continue;
			}
			console.error("Error insertando URL:", error);
			return jsonResponse({ error: "Error del servidor al crear la URL." }, 500);
		}
		if (!insertResult) return jsonResponse({ error: "No se pudo generar un slug único. Intenta de nuevo." }, 500);
		return jsonResponse({ short_slug: insertResult.short_slug });
	} catch (error) {
		console.error("Error en el endpoint /api/shorten:", error);
		return jsonResponse({ error: "Error interno del servidor." }, 500);
	}
}
//#endregion
//#region \0virtual:astro:page:src/pages/api/shorten@_@js
var page = () => shorten_exports;
//#endregion
export { page };

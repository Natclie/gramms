import { r as __exportAll } from "./rolldown-runtime_CE-6LUnI.mjs";
import { createClient } from "@supabase/supabase-js";
//#region src/pages/api/feedback.js
var feedback_exports = /* @__PURE__ */ __exportAll({
	POST: () => POST,
	prerender: () => false
});
var supabase = createClient("https://lmjiypkpinjboiuglhln.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxtaml5cGtwaW5qYm9pdWdsaGxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3ODYxNzQsImV4cCI6MjA3MDM2MjE3NH0.ZvwBGTpuQY1FvWA1GJHnnMED9dUouecbg9YMvDMMe3Q");
var jsonResponse = (payload, status = 200) => new Response(JSON.stringify(payload), {
	status,
	headers: { "Content-Type": "application/json" }
});
async function POST({ request }) {
	let body;
	try {
		body = await request.json();
	} catch (error2) {
		return jsonResponse({ error: "Payload inválido" }, 400);
	}
	const subject = typeof body.subject === "string" ? body.subject.trim() : "";
	const feed = typeof body.feed === "string" ? body.feed.trim() : "";
	const username = typeof body.username === "string" && body.username.trim().length > 0 ? body.username.trim() : null;
	if (!subject) return jsonResponse({ error: "El subject es obligatorio." }, 400);
	if (!feed) return jsonResponse({ error: "El feedback es obligatorio." }, 400);
	const { data, error } = await supabase.from("feedback").insert([{
		subject,
		feed,
		username
	}]);
	if (error) {
		console.error("Error insertando feedback:", error);
		return jsonResponse({ error: "Error al guardar el feedback." }, 500);
	}
	return jsonResponse({ feedback: data?.[0] || null });
}
//#endregion
//#region \0virtual:astro:page:src/pages/api/feedback@_@js
var page = () => feedback_exports;
//#endregion
export { page };

import { r as __exportAll } from "./rolldown-runtime_CE-6LUnI.mjs";
import { createClient } from "@supabase/supabase-js";
//#region src/pages/[slug].js
var _slug__exports = /* @__PURE__ */ __exportAll({
	GET: () => GET,
	prerender: () => false
});
var supabase = createClient("https://lmjiypkpinjboiuglhln.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxtaml5cGtwaW5qYm9pdWdsaGxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3ODYxNzQsImV4cCI6MjA3MDM2MjE3NH0.ZvwBGTpuQY1FvWA1GJHnnMED9dUouecbg9YMvDMMe3Q");
async function GET({ params, redirect }) {
	const slug = params.slug;
	const { data, error } = await supabase.from("urls").select("original_url").eq("short_slug", slug).single();
	if (error) {
		console.error(error);
		return new Response("Error consultando la base de datos", { status: 500 });
	}
	if (data) return redirect(data.original_url, 301);
	return new Response("URL no encontrada", { status: 404 });
}
//#endregion
//#region \0virtual:astro:page:src/pages/[slug]@_@js
var page = () => _slug__exports;
//#endregion
export { page };

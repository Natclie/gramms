import { supabase } from "../src/lib/supabaseClient.js";

export default function Login() {
  const signInWithGoogle = async () => {
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}/dash` },
  });
};

const signInWithGithub = async () => {
  await supabase.auth.signInWithOAuth({
    provider: "github",
    options: { redirectTo: `${window.location.origin}/dash` },
  });
};

  return (
    <div className="flex w-full justify-center bg-[#1c222b]">
      <div className="shadow-2xl items-center max-w-xl p-6 rounded-2xl border-slate-700/30 border text-slate-200">
        <div className="text-center [&_span]:text-slate-300">
          <h1 className="font-bold text-3xl">GRAMM</h1>
          <p className="my-2 text-md [&_SPAN]:font-semibold text-slate-400">
            ¡Con una cuenta podrás ingresar al <span>dashboard</span>, ver tu <span>historial</span> de URLs y <span>administrarlas</span> completamente <span>gratis</span>!
          </p>
        </div>

        {/* login */}
        <div className="flex flex-col items-center gap-3 mt-4">
          <button
            onClick={signInWithGithub}
            className="flex items-center gap-2 border text-white bg-slate-800 border-slate-700 hover:bg-slate-700 duration-50 rounded-2xl py-2 px-4 w-52 justify-center cursor-pointer"
          >
            <img src="/github-color.svg" alt="icon github" className="w-6" />
            Seguir con GitHub
          </button>

          <button
            onClick={signInWithGoogle}
            className="flex items-center gap-2 border text-white bg-slate-800 border-slate-700 hover:bg-slate-700 duration-50 rounded-2xl py-2 px-4 w-52 justify-center cursor-pointer"
          >
            <img src="/google-color.svg" alt="icon google" className="w-6" />
            Seguir con Google
          </button>
        </div>

        <div className="text-center text-xs mt-3">
          <p>
            Servicio seguro gracias a{" "}
            <a
              className="font-semibold underline"
              href="https://supabase.com/"
              target="_blank"
              rel="noreferrer"
            >
              Supabase
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

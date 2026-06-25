import { useState, useEffect } from "react";

import { useNavigate } from 'react-router-dom';

import { supabase } from "../src/lib/supabaseClient.js";

export default function ShortenerForm() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [slug, setSlug] = useState(() => Math.random().toString(36).substring(2, 8));
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Simple math captcha state
  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState(null);
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaError, setCaptchaError] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUser(data.user);
    });

    // generate initial captcha
    generateCaptcha();
  }, []);

  const handleDashboardClick = () => {
    if (user) {
      navigate('/dash'); 
    } else {
      window.location.href = '/log';
    }
  };

  const generateSlug = () => {
    setSlug(Math.random().toString(36).substring(2, 8));
  };

  // generate a simple addition captcha
  function generateCaptcha() {
    const a = Math.floor(Math.random() * 9) + 1; // 1-9
    const b = Math.floor(Math.random() * 9) + 1;
    setCaptchaQuestion(`¿${a} + ${b}?`);
    setCaptchaAnswer(a + b);
    setCaptchaInput("");
    setCaptchaError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!url) return;

    // validate captcha on submit
    if (captchaAnswer === null || parseInt(captchaInput, 10) !== captchaAnswer) {
      setCaptchaError("Por favor, responde correctamente a la pregunta.");
      return;
    }

    const insertData = {
      url,
      slug,
      userId: user?.id || null,
    };

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(insertData),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.error || 'Error al acortar la URL.');
        return;
      }

      setShortUrl(`${window.location.origin}/${result.short_slug}`);
      setUrl("");
      generateSlug();
      generateCaptcha();
    } catch (error) {
      console.error("Error acortando URL:", error);
      setErrorMessage("Error al contactar el servidor. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col  items-center gap-4 p-2 rounded-xl border-slate-700 [&_span]:font-semibold">

      <div className="text-center [&_span]:font-semibold">
        <h2 className="text-5xl text-slate-200 font-bold m-3">Empieza a mejorar y administrar tus enlaces</h2>
        <p className="text-xl m-3 text-slate-400">¡Dile adiós a los enlaces super largos, <span>fácil</span> y <span>rápido</span>!</p>
      </div>

      <div>
        <input
          type="url"
          placeholder="Pega una URL aquí"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="py-1 px-2 border rounded-xl border-slate-700 w-full text-slate-200 focus:border-gray-300"
          required
        />

        <div className="flex items-center justify-between mt-2 w-full gap-2">
          <div className="flex items-center ">
            <input
              type="text"
              placeholder="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="py-1 px-2 border duration-100 cursor-default rounded-l-xl w-32 text-slate-200 border-slate-700"
              required
              readOnly
            />
            <button
              type="button"
              onClick={generateSlug}
              className="border-1 duration-50 bg-slate-800 cursor-pointer border-l-0 px-1 py-[5px] rounded-r-xl border-slate-700 hover:bg-slate-700 text-sm"
              title="Generar otro slug"
            >
              <img className="w-5.5" src="/repeat.svg" alt="repeat icon svg" />
            </button>
            {/* Captcha next to slug */}
            <div className="flex items-center gap-2 ml-2">
              <div className="py-1 px-3 overflow-hidden rounded-xl bg-slate-800 border text-slate-200 border-slate-700">{captchaQuestion}</div>
              <input required
                type="number"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                className="py-1 px-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 w-16"
                inputMode="numeric"
              />
            </div>
          </div>
        </div>
        {captchaError && <p className="text-xs text-center text-red-400 mt-1">{captchaError}</p>}

        {/* Acortar button below, full width, same style as dashboard */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl border-slate-700 py-1 gap-1 hover:bg-slate-700 duration-50 text-slate-200 bg-slate-800 px-4 border w-full justify-center cursor-pointer flex mt-3 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <img className="w-4.5" src="/scissors.svg" alt="tijeras icono svg" />
          {isSubmitting ? 'Procesando...' : 'Acortar'}
        </button>

        {errorMessage && (
          <p className="text-xs text-center text-red-400 mt-2">{errorMessage}</p>
        )}

        <div className="flex gap-2 text-slate-200 mt-2">
          <button
            type="button"
            onClick={handleDashboardClick}
            className="rounded-xl border-slate-700 py-1 hover:bg-slate-700 duration-50 text-slate-200 bg-slate-800 px-4 border w-full justify-center cursor-pointer flex"
          >
            <img className="w-6" src="dashboard.svg" alt="" />
            Dashboard
          </button>
        </div>
      </div>

      {shortUrl && (
        <p className="mt-2 text-slate-200">
          Tu URL acortada es:{" "}
          <a
            href={shortUrl}
            className="text-slate-200 font-semibold"
            target="_blank"
            rel="noopener noreferrer"
          >
            {shortUrl}
          </a>
        </p>
      )}
    </form>
  );
}

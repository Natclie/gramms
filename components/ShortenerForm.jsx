import { useState, useEffect } from "react";
import QRCode from "qrcode";

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
  // QR states
  const [showQr, setShowQr] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [qrLink, setQrLink] = useState("");
  const [qrSlug, setQrSlug] = useState("");
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState(null);
  const [copyMsg, setCopyMsg] = useState("");

  async function generateQrForUrl(url, slug) {
    setQrLink(url);
    setQrSlug(slug);
    setQrError(null);
    setQrLoading(true);
    setQrDataUrl("");

    try {
      const dataUrl = await QRCode.toDataURL(url, {
        width: 160,
        margin: 0,
        color: { dark: "#000000", light: "#ffffff" },
      });
      setQrDataUrl(dataUrl);
    } catch (error) {
      console.error("QR generation error:", error);
      setQrError("No se pudo generar el QR. Intenta de nuevo.");
    } finally {
      setQrLoading(false);
    }
  }

  const downloadQr = () => {
    if (!qrDataUrl) return;
    const linkEl = document.createElement("a");
    linkEl.href = qrDataUrl;
    linkEl.download = `qr-${qrSlug}.png`;
    document.body.appendChild(linkEl);
    linkEl.click();
    document.body.removeChild(linkEl);
  };

  const printQr = () => {
    if (!qrDataUrl) return;
    const w = window.open("");
    if (!w) return;
    const html = `<!doctype html><html><head><title>Imprimir QR</title></head><body style="margin:0;display:flex;align-items:center;justify-content:center;"><img src="${qrDataUrl}" style="max-width:100%;height:auto;"/></body></html>`;
    w.document.write(html);
    w.document.close();
    w.focus();
    // give the image a moment to load then print
    setTimeout(() => {
      w.print();
      w.close();
    }, 300);
  };

  const copyShortUrl = async () => {
    if (!shortUrl) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shortUrl);
      } else {
        const ta = document.createElement('textarea');
        ta.value = shortUrl;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopyMsg('Copiado');
      setTimeout(() => setCopyMsg(''), 2000);
    } catch (err) {
      console.error('Copy failed', err);
      setCopyMsg('Error');
      setTimeout(() => setCopyMsg(''), 2000);
    }
  };

  useEffect(() => {
    // `deleteId` was removed from this component; only watch showQr now.
    const activeModal = (typeof deleteId !== 'undefined' && deleteId) || showQr;
    document.body.style.overflow = activeModal ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showQr]);

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
      // generate QR immediately to the right of the shortened link
      generateQrForUrl(`${window.location.origin}/${result.short_slug}`, result.short_slug);
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

  const getShortUrlDisplay = () => {
    if (!shortUrl) return null;

    try {
      const parsed = new URL(shortUrl);
      const slug = parsed.pathname.replace(/^\/+/, "");
      return {
        domain: parsed.hostname,
        slug,
      };
    } catch {
      return {
        domain: shortUrl.replace(/^https?:\/\//, ""),
        slug: "",
      };
    }
  };

  const shortUrlDisplay = getShortUrlDisplay();

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col items-center  gap-5 rounded-[28px] border border-slate-800/80 bg-slate-900/70 p-3 shadow-[0_12px_40px_rgba(0,0,0,0.22)] sm:p-5">
      <div className="text-center [&_span]:font-semibold">
        <h2 className="m-3 text-2xl font-semibold tracking-tight text-slate-100 sm:text-4xl md:text-4xl">
          Empieza a mejorar y administrar tus enlaces
        </h2>
        <p className="m-3 text-base text-slate-400 sm:text-lg">
          Dile adiós a los enlaces largos con una experiencia <span>simple</span>, <span>rápida</span> y <span>limpia</span>.
        </p>
      </div>

      <div className="flex w-full max-w-4xl flex-col gap-4 rounded-[24px] border border-slate-800/80 bg-slate-950/70 px-4 py-3 sm:px-5">
        <div className="flex w-full flex-col gap-3 md:flex-row md:items-stretch">
          <input
            type="url"
            placeholder="Pega una URL aquí"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full rounded-2xl border border-slate-800 bg-slate-900/90 px-4 py-2 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
            required
          />

          <div className="flex flex-col gap-2 md:min-w-[18rem]">
            <div className="flex items-stretch">
              <input
                required
                type="text"
                placeholder={captchaQuestion}
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                className="w-full rounded-l-2xl border border-r-0 border-slate-800 bg-slate-900/90 px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-0"
                inputMode="numeric"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center cursor-pointer justify-center gap-2 rounded-r-2xl border border-slate-800 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-cyan-400/40 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <img className="w-4" src="/scissors.svg" alt="tijeras icono svg" />
                {isSubmitting ? "Procesando..." : "Acortar"}
              </button>
            </div>
            {captchaError && <p className="text-xs text-red-400">{captchaError}</p>}
            {errorMessage && <p className="text-xs text-red-400">{errorMessage}</p>}
          </div>
        </div>

        <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-stretch">
          {!shortUrl && (
            <div className="flex flex-1 items-center justify-center rounded-[20px] border  border-slate-800/70 px-4 py-5 text-center text-lg font-medium text-slate-400 sm:text-xl">
              Seguro, rápido y siempre disponible
            </div>
          )}

          {shortUrl && (
            <div className="flex flex-1 flex-col justify-between rounded-[20px] border border-slate-800/80 bg-slate-900/70 p-3 sm:p-4">
              <div className="flex min-h-[3.5rem] items-center justify-center px-4 py-3">
                <a
                  href={shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center font-semibold tracking-wide text-slate-400 transition-colors hover:text-slate-200 sm:text-xl"
                >
                  <span className="text-2xl text-slate-500">{shortUrlDisplay?.domain}</span>
                  {shortUrlDisplay?.slug ? (
                    <span className="ml-1 text-2xl font-semibold text-cyan-300">/{shortUrlDisplay.slug}</span>
                  ) : null}
                </a>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyShortUrl}
                    className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 transition hover:border-cyan-400/30 hover:bg-slate-700"
                  >
                    <img loading="lazy" className="w-4" src="copy.svg" alt="copy icon" />
                    Copiar
                  </button>
                  {copyMsg && <span className="text-sm text-emerald-400">{copyMsg}</span>}
                </div>

                <button className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 transition hover:border-cyan-400/30 hover:bg-slate-700">
                  <img loading="lazy" className="w-4" src="share.svg" alt="share icon" />
                  Compartir
                </button>
                <button
                  onClick={downloadQr}
                  className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 transition hover:border-cyan-400/30 hover:bg-slate-700"
                >
                  <img className="w-5" src="download.svg" alt="download icon" />
                  Descargar
                </button>
                <button
                  onClick={printQr}
                  className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 transition hover:border-cyan-400/30 hover:bg-slate-700"
                >
                  <img className="w-5" src="print.svg" alt="print icon" />
                  Imprimir
                </button>
              </div>
            </div>
          )}

          {shortUrl && (
            <div className="flex flex-col items-center justify-center rounded-[20px] border border-slate-800/80 bg-slate-900/70 p-3 sm:min-w-[11rem]">
              {qrLoading && <div className="text-sm text-slate-400">Generando QR...</div>}
              {qrError && <div className="text-sm text-red-400">{qrError}</div>}
              {qrDataUrl && (
                <div className="flex flex-col items-center gap-2">
                  <img src={qrDataUrl} alt="QR icon" className="w-32 rounded-xl bg-white p-2" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </form>
  );
}

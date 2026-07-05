import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { supabase } from "../src/lib/supabaseClient.js";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [links, setLinks] = useState([]);
  const [user, setUser] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [showQr, setShowQr] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [qrLink, setQrLink] = useState("");
  const [qrSlug, setQrSlug] = useState("");
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate("/");
      } else {
        setUser(data.session.user);
        fetchLinks(data.session.user.id);
      }
    };
    
    getSession();
  }, []);

  const fetchLinks = async (userId) => {
    const { data, error } = await supabase
      .from("urls")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (!error) {
      setLinks(data);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleDelete = async (id) => {
    await supabase.from("urls").delete().eq("id", id);
    setLinks((prev) => prev.filter((link) => link.id !== id));
    setDeleteId(null);
  };

  const openQrPopup = async (shortSlug) => {
    const url = `${window.location.origin}/${shortSlug}`;
    setQrLink(url);
    setQrSlug(shortSlug);
    setQrError(null);
    setShowQr(true);
    setQrLoading(true);
    setQrDataUrl("");

    try {
      const dataUrl = await QRCode.toDataURL(url, {
        width: 280,
        margin: 0,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });
      setQrDataUrl(dataUrl);
    } catch (error) {
      console.error("QR generation error:", error);
      setQrError("No se pudo generar el QR. Intenta de nuevo.");
    } finally {
      setQrLoading(false);
    }
  };

  const downloadQr = () => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `qr-${qrSlug}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    const activeModal = deleteId || showQr;
    document.body.style.overflow = activeModal ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [deleteId, showQr]);

function timeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return ` ${seconds} segundos`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return ` ${minutes} minutos`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return ` ${hours} horas`;
  const days = Math.floor(hours / 24);
  if (days < 30) return ` ${days} dia(s)`;
  const months = Math.floor(days / 30);
  if (months < 12) return ` ${months} mes(es)`;
  const years = Math.floor(months / 12);
  return ` ${years}a`;
}
  return (
    <div className="mx-auto min-h-screen w-full bg-slate-950 px-4 pb-28 pt-24 text-slate-100 sm:px-6 lg:px-8 [&_span]:font-semibold">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 rounded-[24px] border border-slate-800/80 bg-slate-900/70 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.22)] sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="text-sm text-cyan-300">Panel de enlaces</p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-100">
            Hola <span>{user?.user_metadata?.full_name || user?.email}</span>
          </h1>
        </div>
        <a
          href="/"
          className="inline-flex items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-200 transition hover:bg-cyan-400/20"
        >
          Crear Link
        </a>
      </div>

      <div className="mx-auto mt-6 max-w-7xl">
        <div className="grid grid-cols-1 gap-4 [&_button]:cursor-pointer md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {links.length > 0 ? (
            links.map((link) => (
              <div
                key={link.id}
                className="flex min-h-[8rem] flex-col rounded-[22px] border border-slate-800/80 bg-slate-900/70 p-4 shadow-[0_10px_25px_rgba(0,0,0,0.16)] transition hover:border-cyan-400/20"
              >
                <div className="flex items-start justify-between gap-2 text-sm">
                  <p className="font-semibold text-cyan-300">/{link.short_slug}</p>
                  <p className="text-xs text-slate-400">Hace {timeAgo(link.created_at)}</p>
                </div>
                <a
                  href={link.original_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 break-all text-sm font-medium text-slate-200 truncate transition hover:text-cyan-200"
                >
                  {link.original_url}
                </a>
                <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                  <span>
                    {new Date(link.created_at).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <div className="relative flex items-center gap-2">
                    <button className="rounded-full border border-slate-800 bg-slate-800/80 p-2 transition hover:border-cyan-400/30 hover:bg-slate-700" onClick={() => openQrPopup(link.short_slug)}>
                      <img loading="lazy" className="w-4" src="/qr.svg" alt="stats icon" />
                    </button>
                    <a target="_blank" href={link.short_slug} className="rounded-full border border-slate-800 bg-slate-800/80 p-2 transition hover:border-cyan-400/30 hover:bg-slate-700">
                      <img loading="lazy" className="w-4" src="/arrow.svg" alt="arrow icon" />
                    </a>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          `${window.location.origin}/${link.short_slug}`,
                          link.id
                        )
                      }
                      className="rounded-full border border-slate-800 bg-slate-800/80 p-2 transition hover:border-cyan-400/30 hover:bg-slate-700"
                    >
                      <img loading="lazy" className="w-4" src="/copy.svg" alt="copy icon" />
                    </button>
                    {copiedId === link.id && (
                      <span className="absolute -top-10 left-1/2 -translate-x-1/2 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white shadow z-10">
                        ¡Copiado!
                      </span>
                    )}
                    <button
                      onClick={() => setDeleteId(link.id)}
                      className="rounded-full border border-slate-800 bg-slate-800/80 p-2 transition hover:border-cyan-400/30 hover:bg-slate-700"
                    >
                      <img loading="lazy" className="w-4" src="/trash.svg" alt="delete icon" />
                    </button>
                  </div>
                </div>
                {deleteId === link.id && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="min-w-[260px] rounded-[20px] border border-slate-700/60 bg-slate-900 p-6 text-center text-slate-200 shadow-lg">
                      <p className="mb-4 font-semibold">¿Deseas eliminar este enlace de forma permanente?</p>
                      <div className="flex justify-center gap-4">
                        <button
                          className="w-24 rounded-full border border-slate-700 bg-slate-800 px-3 py-2 text-sm transition hover:bg-slate-700"
                          onClick={() => handleDelete(link.id)}
                        >
                          Sí
                        </button>
                        <button
                          className="w-24 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-sm text-cyan-200 transition hover:bg-cyan-400/20"
                          onClick={() => setDeleteId(null)}
                        >
                          No
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-full rounded-[22px] border border-dashed border-slate-800 bg-slate-900/60 p-8 text-center text-slate-400">
              <p className="text-lg text-slate-200">No tienes links creados.</p>
              <p className="mt-2 text-sm">Crea tu primer enlace desde el inicio para empezar.</p>
            </div>
          )}
        </div>
      </div>

      {showQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowQr(false)}>
          <div className="relative w-full max-w-md rounded-[24px] border border-slate-800/80 bg-slate-900 p-6 text-slate-200 shadow-lg" onClick={(event) => event.stopPropagation()}>
            <button className="absolute right-3 top-3 cursor-pointer text-slate-400 hover:text-white" onClick={() => setShowQr(false)}>
              <img loading="lazy" className="w-5" src="/close.svg" alt="close icon" />
            </button>
            <h2 className="mb-3 text-lg font-semibold">QR del enlace</h2>
            <p className="mb-4 break-all text-sm text-slate-400">{qrLink}</p>

            {qrLoading ? (
              <div className="py-10 text-center">Generando QR...</div>
            ) : qrError ? (
              <div className="text-center text-red-400">{qrError}</div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <img loading="lazy" src={qrDataUrl} alt={`QR ${qrLink}`} className="h-60 w-60 rounded-2xl bg-white p-2" />
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white transition hover:bg-slate-700" onClick={downloadQr} type="button">
                    <img loading="lazy" className="w-5" src="/download.svg" alt="download icon" />
                    Descargar
                  </button>
                  <a href={qrLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-800">
                    <img loading="lazy" className="w-5" src="/arrow.svg" alt="open icon" />
                    Abrir enlace
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
import { useEffect, useState } from "react";
import { supabase } from "../src/lib/supabaseClient.js";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [links, setLinks] = useState([]);
  const [user, setUser] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
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
useEffect(() => {
  if (deleteId) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "auto";
  }

  return () => {
    document.body.style.overflow = "auto";
  };
}, [deleteId]);
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
    <div className="w-full bg-[#1c222b] min-h-screen pb-25 mx-auto p-4 [&_span]:font-semibold">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">
          <p className="font-normal text-slate-200">Hola <span>{user?.user_metadata?.full_name || user?.email}</span></p>
        </h1>
        <a href="/" className="bg-slate-800 border-slate-700 hover:bg-slate-700 duration-50 text-white px-4 py-1 rounded-2xl">Crear Link</a>
      </div>

      <div className="space-y-4 flex justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 justify-center">
          {links.length > 0 ? (
            links.map((link) => (
              <div
                key={link.id}
                className="shadow-md min-w-2xs w-sm h-27 p-4 rounded-lg border-slate-700/30 border flex flex-col"
              >
                <div className="flex justify-between items-center text-sm">
                  <p className="font-semibold text-slate-200">/{link.short_slug}</p>
                  <p className="text-xs text-slate-400">Hace {timeAgo( link.created_at)}</p>
                </div>
                <a
                  href={link.original_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 mt-1 break-all"
                >
                  <p className="text-slate-200 truncate font-semibold">{link.original_url}</p>
                </a>
                <div className="flex text-slate-400 justify-between items-center mt-2 text-xs ">
                  <span>
                    {new Date(link.created_at).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <div className="flex gap-3 relative">
                    <a target="_blank" href={link.short_slug}>
                        <img className="w-6.5" src="/arrow.svg" alt="arrow icon" />
                    </a>
                      {/*alerta copiado */}
                    <button
                      onClick={() =>
                        copyToClipboard(
                          `${window.location.origin}/${link.short_slug}`,
                          link.id
                        )
                      }
                      className="cursor-pointer"
                    >
                      <img className="w-4.5" src="/copy.svg" alt="copy icon" />
                    </button>
                    {copiedId === link.id && (
                      <span className="absolute -top-10 left-2.5 -translate-x-1/2 bg-slate-800 duration-50 border-slate-700 text-white px-3 py-2 rounded-xl text-xs shadow z-10">
                        ¡Copiado!
                      </span>
                    )}
                    <button
                      onClick={() => setDeleteId(link.id)}
                      className="cursor-pointer"
                    >
                      <img className="w-4.5" src="/trash.svg" alt="delete icon" />
                    </button>
                  </div>
                </div>
                {/* popup confirmacion */}
                {deleteId === link.id && (
                  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className=" bg-[#1c222b] border-slate-700/30 border text-slate-200 rounded-lg shadow-lg p-6 min-w-[260px] text-center">
                      <p className="mb-4 font-semibold">¿Deseas eliminar este enlace de forma permanente?</p>
                      <div className="flex justify-center gap-4">
                        <button
                          className="cursor-pointer duration-50 hover:bg-slate-700 border-slate-700/30 border p-1 w-24 rounded-2xl"
                          onClick={() => handleDelete(link.id)}
                        >
                          Sí
                        </button>
                        <button
                          className="bg-slate-800 duration-50 hover:bg-slate-700 border-slate-700/30 cursor-pointer text-white p-1 w-24 rounded-2xl"
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
            <div className="absolute w-full left-0 top-25 -translate-y-1/2 text-slate-200">
                <div>
                  <p className="text-center border border-slate-700/30 p-4 rounded-lg">
                    No tienes links creados.
                  </p>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
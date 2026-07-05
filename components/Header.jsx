import { useState, useEffect, useRef } from "react";
import { supabase } from "../src/lib/supabaseClient.js";

export default function Header() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();
  const handleDashboardClick = () => {
  window.location.href = user ? "/dash" : "/log";
  };

  useEffect(() => {
    // Cargar usuario actual
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Escuchar cambios de sesión
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    // Cerrar menú al hacer clic fuera
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      listener.subscription.unsubscribe();
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <header className="fixed top-0 z-20 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-sm text-slate-100">
      <div className="flex items-center justify-between py-2 px-4 w-full">
        <a className="flex items-center gap-2 text-xl font-semibold tracking-tight" href="/">
          <span>GRAMM</span>
        </a>
        <ul className="flex items-center gap-2">
          <li>
            <button
              type="button"
              onClick={handleDashboardClick}
              className="flex items-center gap-2 cursor-pointer rounded-full border border-slate-800 bg-slate-900/80 px-3 py-2 text-sm text-slate-200 transition hover:border-cyan-400/30 hover:bg-slate-800"
            >
              <img className="w-6" src="dashboard.svg" alt="Dashboard icon" />
              Dashboard
            </button>
          </li>
          <li>
            <a
              href="/feedback"
              className="hover:text-white flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 px-3 py-2 text-sm text-slate-200 transition hover:border-cyan-400/30 hover:bg-slate-800"
            >
              <img className="w-6" src="chat.svg" alt="Feedback icon" />
              Feedback
            </a>
          </li>

          {user ? (
            <li className="relative" ref={menuRef}>
              <img
                src={user.user_metadata?.avatar_url || user.raw_user_metadata?.picture || "/default-avatar.png"}
                alt="Perfil icon"
                className="h-9 w-9 cursor-pointer rounded-full object-cover ring-1 ring-slate-700"
                onClick={() => setMenuOpen((open) => !open)}
              />
              {menuOpen && (
                <ul className="absolute right-0 z-10 mt-3 min-w-[9rem] rounded-2xl border border-slate-700 bg-slate-900 p-1 shadow-lg">
                  <li>
                    <button
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-200 transition hover:bg-slate-800"
                      onClick={handleLogout}
                    >
                      <img className="w-4" src="/logout.svg" alt="logout icon" />
                      Cerrar sesión
                    </button>
                  </li>
                </ul>
              )}
            </li>
          ) : (
            <li>
              <a href="/log" className="flex h-10.5 w-10.5 items-center justify-center rounded-full border border-slate-800  bg-slate-900/80 transition hover:border-cyan-400/30 hover:bg-slate-800">
                <img className="w-5" src="/user.svg" alt="user svg icon" />
              </a>
            </li>
          )}
        </ul>
      </div>
    </header>
  );
}

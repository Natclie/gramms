import { useState, useEffect, useRef } from "react";
import { supabase } from "../src/lib/supabaseClient.js";

export default function Header() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();

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
    <header className="w-full z-10 shadow-md fixed bg-[#1c222b] text-slate-200">
      <div className="flex justify-between px-5 py-3">
        <a className="text-2xl font-bold" href="/">GRAMM</a>

        <ul className="flex gap-2 items-center">
          <li className="flex gap-3 border-slate-200 border px-2 py-0.5 rounded-2xl">
            {/*
            <a target="_blank" href="https://github.com/natclie">
              <img className="w-5" src="github-thin.svg" alt="GitHub" />
            </a>
            
            */}
            <a href="/feedback">
              Feedback
            </a>
          </li>

          {user ? (
            <li className="relative" ref={menuRef}>
              <img
                src={user.user_metadata?.avatar_url || user.raw_user_metadata?.picture || "/default-avatar.png"}
                alt="Perfil"
                className="w-8 h-8 rounded-full cursor-pointer object-cover"
                onClick={() => setMenuOpen((open) => !open)}
              />
              {menuOpen && (
                <ul className="absolute right-0 pt-0 mt-3 border duration-50 cursor-pointer hover:bg-slate-700 bg-slate-800 text-slate-200 border-slate-700 shadow-lg rounded-2xl z-10">
                  <li>
                    <button
                      className="px-1 py-2 w-29 text-center cursor-pointer text-sm flex gap-2"
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
              <a href="/log">
                <img className="w-6" src="/user.svg" alt="user svg icon" />
              </a>
            </li>
          )}
        </ul>
      </div>
    </header>
  );
}

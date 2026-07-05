import { useEffect, useState } from 'react';
import { supabase } from '../src/lib/supabaseClient.js';

export default function Feedback() {
    const [subject, setSubject] = useState('');
    const [feed, setFeed] = useState('');
    const [username, setUsername] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const loadSession = async () => {
            const { data } = await supabase.auth.getSession();
            const user = data?.session?.user;
            if (user) {
                setIsLoggedIn(true);
                setUsername(user.user_metadata?.full_name || user.email || '');
            }
        };

        loadSession();
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage('');
        setStatusMessage('');

        if (!subject.trim()) {
            setErrorMessage('El subject es obligatorio.');
            return;
        }

        if (!feed.trim()) {
            setErrorMessage('El feedback es obligatorio.');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject: subject.trim(),
                    feed: feed.trim(),
                    username: username.trim() || null,
                }),
            });

            const result = await response.json();
            if (!response.ok) {
                setErrorMessage(result.error || 'Error al enviar feedback.');
                return;
            }

            setStatusMessage('Feedback enviado correctamente. Gracias.');
            setSubject('');
            setFeed('');
            if (!isLoggedIn) {
                setUsername('');
            }
        } catch (error) {
            console.error('Error enviando feedback:', error);
            setErrorMessage('Error de conexión. Intenta de nuevo.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full items-center justify-center px-4 py-16">
            <div className="w-full max-w-xl rounded-[28px] border border-slate-800/80 bg-slate-900/70 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.22)] sm:p-7">
                <div className="mb-6 border-b border-slate-800/80 pb-4 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-100">Feedback</h1>
                    <p className="mt-2 text-sm text-slate-400">Comparte tus ideas, bugs o sugerencias para mejorar la experiencia.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm text-slate-400">Usuario (opcional)</label>
                        <input
                            type="text"
                            placeholder="Tu nombre o alias"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={isLoggedIn}
                            className="w-full rounded-2xl border border-slate-800 bg-slate-950/70 px-3 py-2.5 text-slate-200 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-60"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm text-slate-400">Asunto</label>
                        <input
                            type="text"
                            placeholder="Ej. Sugerencia de mejora"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full rounded-2xl border border-slate-800 bg-slate-950/70 px-3 py-2.5 text-slate-200 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm text-slate-400">Feedback</label>
                        <textarea
                            placeholder="Cuéntanos qué te gustaría ver o mejorar"
                            value={feed}
                            onChange={(e) => setFeed(e.target.value)}
                            className="min-h-[10rem] w-full rounded-2xl border border-slate-800 bg-slate-950/70 px-3 py-2.5 text-slate-200 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                            rows="8"
                        />
                    </div>

                    {errorMessage && <p className="w-full text-center text-sm text-red-400">{errorMessage}</p>}
                    {statusMessage && <p className="w-full text-center text-sm text-emerald-400">{statusMessage}</p>}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full cursor-pointer rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-3 py-2.5 text-sm font-medium text-cyan-200 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isSubmitting ? 'Enviando...' : 'Enviar feedback'}
                    </button>
                </form>
            </div>
        </div>
    );
}
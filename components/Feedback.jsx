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
        <div className="w-full h-screen flex justify-center items-center">
            <div className="w-full max-w-md bg-[#1c222b] border border-slate-700 rounded-xl py-2">
                <div className="flex flex-col mb-2 gap-4 pb-3 items-center border-b border-slate-700">
                    <h1 className="text-xl font-bold text-slate-200">Feedback</h1>
                </div>
                <div className="px-4">
                    <form onSubmit={handleSubmit}>
                        <label className="block text-slate-400 text-sm mb-1">Usuario (opcional)</label>
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={isLoggedIn}
                            className="w-full rounded-xl bg-slate-900 border border-slate-700 text-slate-200 py-2 px-3 mb-4 disabled:cursor-not-allowed disabled:opacity-60"
                        />
                        <label className="block text-slate-400 text-sm mb-1">Asunto</label>
                        <input
                            type="text"
                            placeholder="Subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full rounded-xl bg-slate-900 border border-slate-700 text-slate-200 py-2 px-3 mb-4"
                        />
                        <label className="block text-slate-400 text-sm mb-1">Feedback</label>
                        <textarea
                            placeholder="Tu feedback"
                            value={feed}
                            onChange={(e) => setFeed(e.target.value)}
                            className="w-full rounded-xl bg-slate-900 border border-slate-700 text-slate-200 py-2 px-3 mb-4"
                            rows="8"
                        />
                        {errorMessage && <p className="text-xs w-full text-center text-red-400 mb-3">{errorMessage}</p>}
                        {statusMessage && <p className="text-xs text-green-400 mb-3">{statusMessage}</p>}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full rounded-xl bg-slate-800 border border-slate-700 text-slate-200 py-1 px-3 hover:bg-slate-700 duration-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isSubmitting ? 'Enviando...' : 'Enviar'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
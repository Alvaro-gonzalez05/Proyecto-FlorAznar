'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import MarkdownText from '@/app/components/MarkdownText';

interface CoachingPlan {
    contexto: string;
    etapas: {
        numero: number;
        titulo: string;
        descripcion: string;
        preguntas: string[];
    }[];
}

interface SynthesisAction {
    titulo: string;
    descripcion: string;
}

interface Synthesis {
    sintesis: string;
    acciones: SynthesisAction[];
}

interface CoachingSession {
    id: string;
    client_token: string;
    nombre_cliente: string | null;
    ai_coaching_plan: CoachingPlan;
    estado: string;
    etapa_actual: number;
    etapas_completadas: number[];
    respuestas_cliente: Record<number, Record<number, string>>;
    acciones_ia: string;
    sintesis_publicada?: boolean;
}

export default function CoachingSesionPage() {
    const params = useParams();
    const token = params.token as string;

    const [session, setSession] = useState<CoachingSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Navigation state
    const [currentEtapa, setCurrentEtapa] = useState(1);
    const [currentPregunta, setCurrentPregunta] = useState(0);

    // Answers state — local copy
    const [respuestas, setRespuestas] = useState<Record<number, Record<number, string>>>({});
    const [currentAnswer, setCurrentAnswer] = useState('');

    // UI states
    const [saving, setSaving] = useState(false);
    const [showIntro, setShowIntro] = useState(true);
    const [completed, setCompleted] = useState(false);
    const [synthesis, setSynthesis] = useState<Synthesis | null>(null);
    const [sintesisPublicada, setSintesisPublicada] = useState(false);
    const [animating, setAnimating] = useState(false);

    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (!token) return;
        fetchSession();
    }, [token]);

    const fetchSession = async () => {
        setLoading(true);
        try {
            const { data, error: fetchError } = await supabase
                .from('coaching_sessions')
                .select('*')
                .eq('client_token', token)
                .single();

            if (fetchError || !data) {
                setError('No se encontró tu sesión. Verificá el link que te envió tu coach.');
                return;
            }

            setSession(data);

            // Restore existing answers
            const savedRespuestas = data.respuestas_cliente || {};
            setRespuestas(savedRespuestas);

            // Determine where to resume
            const etapasComp: number[] = data.etapas_completadas || [];
            const publicada = data.sintesis_publicada === true;
            setSintesisPublicada(publicada);
            if (data.estado === 'completado') {
                setCompleted(true);
                if (publicada && data.acciones_ia) {
                    try { setSynthesis(JSON.parse(data.acciones_ia)); } catch { /* ignore */ }
                }
                setShowIntro(false);
            } else if (etapasComp.length > 0) {
                const nextEtapa = Math.min(etapasComp.length + 1, 3);
                setCurrentEtapa(nextEtapa);
                setShowIntro(false);
            }
        } catch {
            setError('Error al cargar tu sesión. Intentá de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    // Load current answer when navigating
    useEffect(() => {
        if (!session) return;
        const saved = respuestas[currentEtapa]?.[currentPregunta] || '';
        setCurrentAnswer(saved);
        setTimeout(() => textareaRef.current?.focus(), 150);
    }, [currentEtapa, currentPregunta]);

    // Debounced save to Supabase
    const saveAnswerDebounced = useCallback((etapa: number, pregunta: number, value: string, allRespuestas: Record<number, Record<number, string>>) => {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(async () => {
            if (!session) return;
            setSaving(true);
            try {
                await supabase
                    .from('coaching_sessions')
                    .update({ respuestas_cliente: allRespuestas, estado: 'en_progreso' })
                    .eq('id', session.id)
                    .eq('client_token', token);
            } finally {
                setSaving(false);
            }
        }, 1500);
    }, [session, token]);

    const handleAnswerChange = (value: string) => {
        setCurrentAnswer(value);
        const newRespuestas = {
            ...respuestas,
            [currentEtapa]: { ...(respuestas[currentEtapa] || {}), [currentPregunta]: value }
        };
        setRespuestas(newRespuestas);
        saveAnswerDebounced(currentEtapa, currentPregunta, value, newRespuestas);
    };

    const animateTransition = (fn: () => void) => {
        setAnimating(true);
        setTimeout(() => {
            fn();
            setAnimating(false);
            setTimeout(() => textareaRef.current?.focus(), 100);
        }, 300);
    };

    const handleNext = () => {
        if (!session) return;
        const plan = session.ai_coaching_plan;
        const etapa = plan.etapas[currentEtapa - 1];

        if (currentPregunta < etapa.preguntas.length - 1) {
            // Next question in same stage
            animateTransition(() => setCurrentPregunta(p => p + 1));
        }
        // If on last question, "Completar etapa" button handles it
    };

    const handlePrev = () => {
        if (currentPregunta > 0) {
            animateTransition(() => setCurrentPregunta(p => p - 1));
        } else if (currentEtapa > 1) {
            // Go back to previous stage
            const prevEtapa = currentEtapa - 1;
            const prevPlan = session?.ai_coaching_plan.etapas[prevEtapa - 1];
            const lastIdx = (prevPlan?.preguntas.length || 1) - 1;
            animateTransition(() => {
                setCurrentEtapa(prevEtapa);
                setCurrentPregunta(lastIdx);
            });
        }
    };

    const handleCompleteEtapa = async () => {
        if (!session) return;
        const plan = session.ai_coaching_plan;
        const etapasComp = session.etapas_completadas || [];

        // Save current answer first
        const newRespuestas = {
            ...respuestas,
            [currentEtapa]: { ...(respuestas[currentEtapa] || {}), [currentPregunta]: currentAnswer }
        };

        const newEtapasComp = [...new Set([...etapasComp, currentEtapa])].sort((a, b) => a - b);
        const allDone = newEtapasComp.length === 3;

        setSaving(true);
        try {
            await supabase
                .from('coaching_sessions')
                .update({
                    respuestas_cliente: newRespuestas,
                    etapas_completadas: newEtapasComp,
                    etapa_actual: allDone ? 3 : currentEtapa + 1,
                    estado: allDone ? 'completado' : 'en_progreso',
                })
                .eq('id', session.id)
                .eq('client_token', token);

            setRespuestas(newRespuestas);
            setSession(prev => prev ? { ...prev, etapas_completadas: newEtapasComp, respuestas_cliente: newRespuestas } : prev);

            if (allDone) {
                // El cliente NO ve la síntesis automáticamente.
                // Flor genera y publica la síntesis manualmente desde su panel.
                setCompleted(true);
            } else {
                // Move to next stage
                animateTransition(() => {
                    setCurrentEtapa(e => e + 1);
                    setCurrentPregunta(0);
                });
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-off-white flex items-center justify-center p-6">
                <div className="text-center">
                    <div className="w-12 h-12 border-2 border-black-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-xs uppercase tracking-[0.4em] font-semibold text-slate-400">Cargando tu sesión</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-off-white flex items-center justify-center p-6">
                <div className="max-w-sm w-full bg-white rounded-[2rem] soft-shadow border border-slate-50 p-8 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-rose-mist border border-rose-100 flex items-center justify-center mx-auto mb-5">
                        <span className="material-symbols-outlined text-error text-3xl">error</span>
                    </div>
                    <p className="text-[10px] uppercase tracking-[0.4em] font-semibold text-slate-400 mb-2">Sesión</p>
                    <h1 className="font-serif text-2xl font-bold text-black-accent mb-3">No encontrada</h1>
                    <p className="text-slate-500 text-sm leading-relaxed">{error}</p>
                </div>
            </div>
        );
    }

    if (!session) return null;

    const plan = session.ai_coaching_plan;
    const etapasComp: number[] = session.etapas_completadas || [];

    // ── INTRO SCREEN ──
    if (showIntro) {
        return (
            <div className="min-h-[100dvh] bg-off-white flex items-center justify-center p-3 sm:p-6">
                <div className="w-full max-w-5xl">
                    {/* Card: vertical en mobile, horizontal en desktop. Crece con el contenido. */}
                    <div className="bg-white rounded-[2rem] relative overflow-hidden soft-shadow border border-slate-50 w-full flex flex-col lg:flex-row">
                        {/* Aura blobs background */}
                        <div className="absolute inset-0 overflow-hidden rounded-[2rem] pointer-events-none">
                            <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[80%] bg-[#e6f4f1] rounded-full filter blur-[80px] opacity-100 animate-aura-1 transform-gpu"></div>
                            <div className="absolute top-[10%] -right-[10%] w-[55%] h-[70%] bg-[#f0eafc] rounded-full filter blur-[80px] opacity-100 animate-aura-2 transform-gpu"></div>
                            <div className="absolute -bottom-[20%] left-[20%] w-[55%] h-[70%] bg-[#fff1e6] rounded-full filter blur-[80px] opacity-100 animate-aura-3 transform-gpu"></div>
                        </div>

                        {/* LEFT (desktop) / TOP (mobile): hero — sticky en desktop para que acompañe el scroll del lado largo */}
                        <div className="relative z-10 p-5 sm:p-7 lg:p-10 lg:w-[42%] lg:flex-shrink-0 lg:border-r lg:border-slate-100/70 lg:self-start lg:sticky lg:top-0">
                            <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.35em] sm:tracking-[0.4em] font-semibold text-slate-400 mb-1.5 sm:mb-2">Coaching Numerológico</p>
                            <h1 className="font-serif italic text-[clamp(1.75rem,5.5vw,3.5rem)] text-black-accent leading-[1.05] mb-2 sm:mb-3">
                                {session.nombre_cliente ? <>Hola, <span className="not-italic font-bold">{session.nombre_cliente.split(' ')[0]}</span></> : 'Bienvenido'}
                            </h1>
                            <p className="text-[12px] sm:text-sm text-slate-700/80 leading-relaxed">
                                Sesión personalizada diseñada por <span className="font-bold text-black-accent">Florencia Aznar</span> a partir de tu mapa numerológico.
                            </p>
                        </div>

                        {/* RIGHT (desktop) / BOTTOM (mobile): contexto + etapas + CTA — crece con el contenido */}
                        <div className="relative z-10 p-5 sm:p-7 lg:p-10 lg:flex-1 lg:min-w-0 flex flex-col border-t lg:border-t-0 border-slate-100/70">
                            <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.35em] sm:tracking-[0.4em] font-semibold text-slate-400 mb-2">Tu sesión</p>

                            <MarkdownText
                                text={plan.contexto}
                                className="text-slate-700 text-[12px] sm:text-sm leading-relaxed mb-3 sm:mb-4"
                                classes={{
                                    h2: 'font-serif text-[15px] sm:text-base font-bold text-black-accent mt-3 mb-1.5',
                                    h3: 'text-[10px] uppercase tracking-[0.3em] font-semibold text-slate-400 mt-3 mb-1',
                                    p: 'mb-2 leading-relaxed',
                                    ul: 'list-disc list-outside pl-4 space-y-1 my-2 marker:text-slate-300',
                                    li: 'leading-relaxed',
                                    strong: 'font-bold text-black-accent',
                                }}
                            />

                            <div className="space-y-1.5 sm:space-y-2 mt-2">
                                {plan.etapas.map((etapa, idx) => {
                                    const palettes = ['bg-mint', 'bg-lavender', 'bg-peach'];
                                    const bg = palettes[idx % palettes.length];
                                    return (
                                        <div key={etapa.numero} className={`flex items-center gap-3 p-2 sm:p-3 rounded-2xl ${bg} border border-slate-50`}>
                                            <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center text-black-accent text-[11px] font-black flex-shrink-0">
                                                {etapa.numero}
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-black-accent text-[12px] sm:text-sm font-bold truncate">{etapa.titulo}</p>
                                                <p className="text-slate-500 text-[10px] uppercase tracking-widest font-semibold mt-0.5">{etapa.preguntas.length} preguntas</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => setShowIntro(false)}
                                className="mt-5 sm:mt-6 w-full bg-black-accent text-white px-6 py-3 sm:py-3.5 rounded-full font-bold text-[11px] sm:text-xs tracking-[0.2em] uppercase inline-flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-black/10"
                            >
                                Comenzar sesión
                                <span className="material-symbols-outlined text-lg">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ── COMPLETED SCREEN ──
    if (completed) {
        return (
            <div className="min-h-screen bg-off-white p-4 sm:p-6 flex items-start sm:items-center justify-center">
                <div className="max-w-xl w-full py-8">
                    {/* Hero card with aura */}
                    <div className="bg-white rounded-[2rem] p-7 sm:p-9 mb-6 relative overflow-hidden soft-shadow border border-slate-50 text-center">
                        <div className="absolute inset-0 overflow-hidden rounded-[2rem] pointer-events-none">
                            <div className="absolute -top-[10%] -left-[10%] w-[80%] h-[80%] bg-[#e6f4f1] rounded-full filter blur-[80px] opacity-100 animate-aura-1 transform-gpu"></div>
                            <div className="absolute top-[10%] -right-[10%] w-[70%] h-[70%] bg-[#fff1e6] rounded-full filter blur-[80px] opacity-100 animate-aura-3 transform-gpu"></div>
                        </div>
                        <div className="relative z-10">
                            <div className="w-14 h-14 rounded-full bg-mint border border-emerald-100 flex items-center justify-center mx-auto mb-5">
                                <span className="material-symbols-outlined text-emerald-600 text-3xl">check_circle</span>
                            </div>
                            <p className="text-[10px] uppercase tracking-[0.4em] font-semibold text-slate-400 mb-2">Sesión finalizada</p>
                            <h1 className="font-serif italic text-3xl sm:text-4xl text-black-accent mb-2">
                                <span className="not-italic font-bold">¡Completaste tu sesión!</span>
                            </h1>
                            <p className="text-slate-600 text-sm">Gracias por tu honestidad y tu tiempo.</p>
                        </div>
                    </div>

                    {sintesisPublicada && synthesis ? (
                        <div>
                            <div className="bg-white rounded-[2rem] soft-shadow border border-slate-50 p-7 mb-5">
                                <p className="text-[10px] uppercase tracking-[0.4em] font-semibold text-slate-400 mb-3">Tu proceso en síntesis</p>
                                <p className="text-slate-700 text-[15px] leading-relaxed whitespace-pre-wrap">{synthesis.sintesis}</p>
                            </div>

                            <p className="text-[10px] uppercase tracking-[0.4em] font-semibold text-slate-400 mb-3 px-2">Tu plan de acción</p>
                            <div className="space-y-3">
                                {synthesis.acciones.map((accion, i) => {
                                    const palettes = ['bg-mint', 'bg-lavender', 'bg-peach'];
                                    const bg = palettes[i % palettes.length];
                                    return (
                                        <div key={i} className={`${bg} rounded-[2rem] border border-slate-50 p-6 soft-shadow`}>
                                            <div className="flex items-start gap-4">
                                                <span className="w-9 h-9 rounded-full bg-white border border-slate-100 flex items-center justify-center text-black-accent text-xs font-black flex-shrink-0 mt-0.5">
                                                    {i + 1}
                                                </span>
                                                <div className="min-w-0">
                                                    <p className="text-black-accent font-bold mb-1">{accion.titulo}</p>
                                                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{accion.descripcion}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-[2rem] soft-shadow border border-slate-50 p-7 sm:p-8">
                            <div className="flex items-start gap-4">
                                <div className="w-11 h-11 rounded-full bg-lavender border border-purple-100 flex items-center justify-center flex-shrink-0">
                                    <span className="material-symbols-outlined text-on-secondary">schedule</span>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] uppercase tracking-[0.4em] font-semibold text-slate-400 mb-1">Próximo paso</p>
                                    <h3 className="font-serif text-xl text-black-accent font-bold mb-2">Pronto Flor se va a comunicar con vos</h3>
                                    <p className="text-slate-600 text-sm leading-relaxed">
                                        Tus respuestas ya quedaron guardadas. <strong className="text-black-accent">Flor las va a leer</strong> y te va a enviar tu <strong className="text-black-accent">síntesis personalizada</strong> junto al <strong className="text-black-accent">plan de acción</strong> hecho a medida para vos.
                                    </p>
                                    <p className="text-slate-400 text-xs mt-3">Podés cerrar esta ventana. Cuando esté lista, recibirás una notificación por parte de Flor.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ── QUESTION SCREEN ──
    const etapa = plan.etapas[currentEtapa - 1];
    const totalPreguntas = etapa.preguntas.length;
    const pregunta = etapa.preguntas[currentPregunta];
    const isLastQuestion = currentPregunta === totalPreguntas - 1;
    const isFirstEtapa = currentEtapa === 1;
    const isFirstQuestion = currentPregunta === 0;

    const overallProgress = etapasComp.length / 3;
    const stageProgress = (currentPregunta + 1) / totalPreguntas;

    return (
        <div className="h-[100dvh] bg-off-white flex flex-col overflow-hidden">
            {/* Top bar */}
            <div className="px-4 sm:px-6 pt-4 pb-3 sm:pt-5 sm:pb-4 border-b border-slate-100 bg-white/90 backdrop-blur-md flex-shrink-0">
                <div className="max-w-2xl mx-auto">
                    <div className="flex items-center justify-between mb-2.5 sm:mb-3 gap-3">
                        <div className="min-w-0">
                            <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.35em] sm:tracking-[0.4em] font-semibold text-slate-400">Florencia Aznar</p>
                            <p className="text-black-accent text-[13px] sm:text-sm font-bold truncate mt-0.5">Etapa {currentEtapa}: {etapa.titulo}</p>
                        </div>
                        <span className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-bold whitespace-nowrap">
                            {currentPregunta + 1} / {totalPreguntas}
                        </span>
                    </div>
                    {/* Stage progress bar */}
                    <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-black-accent rounded-full transition-all duration-500"
                            style={{ width: `${stageProgress * 100}%` }}
                        />
                    </div>

                    {/* Stages pills */}
                    <div className="flex gap-2 mt-2.5 sm:mt-3">
                        {plan.etapas.map(e => {
                            const isActive = e.numero === currentEtapa;
                            const isDone = etapasComp.includes(e.numero);
                            return (
                                <button
                                    key={e.numero}
                                    onClick={() => {
                                        if (isDone || isActive) {
                                            animateTransition(() => {
                                                setCurrentEtapa(e.numero);
                                                setCurrentPregunta(0);
                                            });
                                        }
                                    }}
                                    className={`flex-1 py-1.5 sm:py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${
                                        isActive
                                            ? 'bg-black-accent text-white shadow-md shadow-black/10'
                                            : isDone
                                            ? 'bg-mint text-emerald-700 border border-emerald-100 hover:scale-[1.02]'
                                            : 'bg-slate-50 text-slate-300 cursor-not-allowed border border-slate-100'
                                    }`}
                                >
                                    {isDone ? '✓' : e.numero}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className={`flex-1 min-h-0 flex flex-col px-3 sm:px-6 py-4 sm:py-6 transition-opacity duration-300 ${animating ? 'opacity-0' : 'opacity-100'}`}>
                <div className="max-w-2xl mx-auto w-full flex-1 min-h-0 flex">
                    <div className="bg-white rounded-[2rem] soft-shadow border border-slate-50 p-4 sm:p-6 lg:p-8 w-full flex flex-col min-h-0 gap-3 sm:gap-4">
                        {/* Question — compacta para no comerse el textarea */}
                        <div className="flex-shrink-0">
                            <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.35em] sm:tracking-[0.4em] font-semibold text-slate-400 mb-1.5 sm:mb-2">Pregunta {currentPregunta + 1} de {totalPreguntas}</p>
                            <h2 className="font-serif text-black-accent text-[clamp(1rem,2.5vw,1.375rem)] font-bold leading-snug">{pregunta}</h2>
                        </div>

                        {/* Answer textarea (fills remaining space) */}
                        <textarea
                            ref={textareaRef}
                            value={currentAnswer}
                            onChange={e => handleAnswerChange(e.target.value)}
                            placeholder="Escribí tu respuesta aquí..."
                            className="flex-1 min-h-[120px] w-full bg-cream-soft border border-slate-100 rounded-2xl px-4 sm:px-5 py-3 sm:py-4 text-black-accent placeholder-slate-400 text-[14px] sm:text-[15px] leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-black-accent/10 focus:border-black-accent/30 transition-all"
                        />

                        {/* Save indicator */}
                        <p className={`text-[10px] sm:text-[11px] mt-2 sm:mt-3 transition-opacity flex items-center gap-1.5 uppercase tracking-[0.2em] font-semibold flex-shrink-0 ${saving ? 'text-black-accent opacity-100' : 'text-slate-400 opacity-70'}`}>
                            <span className="material-symbols-outlined text-[14px]">{saving ? 'sync' : 'check'}</span>
                            {saving ? 'Guardando' : 'Guardado automáticamente'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom navigation */}
            <div className="px-3 sm:px-6 pb-4 sm:pb-6 pt-3 sm:pt-4 border-t border-slate-100 bg-white flex-shrink-0">
                <div className="max-w-2xl mx-auto flex gap-2 sm:gap-3">
                    {/* Back */}
                    {(!isFirstQuestion || !isFirstEtapa) && (
                        <button
                            onClick={handlePrev}
                            className="px-4 sm:px-6 py-2.5 sm:py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] transition-colors border border-slate-100 whitespace-nowrap"
                        >
                            ← Anterior
                        </button>
                    )}

                    {/* Next / Complete stage */}
                    {!isLastQuestion ? (
                        <button
                            onClick={handleNext}
                            className="flex-1 py-2.5 sm:py-3 bg-black-accent text-white rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl shadow-black/10 inline-flex items-center justify-center gap-2"
                        >
                            Siguiente
                            <span className="material-symbols-outlined text-base">arrow_forward</span>
                        </button>
                    ) : (
                        <button
                            onClick={handleCompleteEtapa}
                            disabled={saving}
                            className="flex-1 py-2.5 sm:py-3 bg-mint hover:bg-[#dcf3eb] text-emerald-700 border border-emerald-100 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2"
                        >
                            {saving ? 'Guardando...' : currentEtapa < 3 ? `Completar etapa ${currentEtapa}` : 'Finalizar sesión'}
                            <span className="material-symbols-outlined text-base">{currentEtapa < 3 ? 'arrow_forward' : 'check'}</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

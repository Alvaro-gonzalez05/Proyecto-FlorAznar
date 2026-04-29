'use client';

import React, { useEffect, useRef, useState } from 'react';
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
    ai_coaching_plan: CoachingPlan | null;
    estado: string;
    etapas_completadas: number[];
    respuestas_cliente: Record<string, Record<string, string>>;
    notas_flor: string;
    acciones_ia: string;
    sintesis_publicada?: boolean;
    created_at: string;
}

export default function CoachingPanelPage() {
    const params = useParams();
    const sessionId = params.id as string;

    const [session, setSession] = useState<CoachingSession | null>(null);
    const [plan, setPlan] = useState<CoachingPlan | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'plan' | 'respuestas' | 'acciones'>('plan');
    const [clientLink, setClientLink] = useState('');
    const [linkCopied, setLinkCopied] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<{ etapa: number; idx: number } | null>(null);
    const [editText, setEditText] = useState('');
    const [localPlan, setLocalPlan] = useState<CoachingPlan | null>(null);
    const [savingPlan, setSavingPlan] = useState(false);
    const [planSaved, setPlanSaved] = useState(false);
    const [notasFlor, setNotasFlor] = useState('');
    const [savingNotas, setSavingNotas] = useState(false);
    const [synthesis, setSynthesis] = useState<Synthesis | null>(null);
    const [generatingSynthesis, setGeneratingSynthesis] = useState(false);
    const [savingSynthesis, setSavingSynthesis] = useState(false);
    const [synthesisSaved, setSynthesisSaved] = useState(false);
    const [sintesisPublicada, setSintesisPublicada] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [exportingPdf, setExportingPdf] = useState(false);

    useEffect(() => {
        if (!sessionId) return;
        fetchSession();
    }, [sessionId]);

    // ── Realtime: escuchar cambios del cliente y refrescar al toque ──
    useEffect(() => {
        if (!sessionId) return;

        const channel = supabase
            .channel(`coaching_session_${sessionId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'coaching_sessions',
                    filter: `id=eq.${sessionId}`,
                },
                (payload) => {
                    const newRow = payload.new as CoachingSession;
                    if (!newRow) return;
                    setSession((prev) => {
                        // Preservar campos locales que Flor está editando para no pisar su trabajo
                        if (!prev) return newRow;
                        return {
                            ...newRow,
                            notas_flor: prev.notas_flor ?? newRow.notas_flor,
                            ai_coaching_plan: prev.ai_coaching_plan ?? newRow.ai_coaching_plan,
                        };
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [sessionId]);

    const fetchSession = async () => {
        setLoading(true);
        try {
            const { data, error: fetchError } = await supabase
                .from('coaching_sessions')
                .select('*')
                .eq('id', sessionId)
                .single();

            if (fetchError || !data) {
                setError('No se encontró la sesión de coaching.');
                return;
            }

            setSession(data);
            setPlan(data.ai_coaching_plan);
            setLocalPlan(data.ai_coaching_plan ? JSON.parse(JSON.stringify(data.ai_coaching_plan)) : null);
            setNotasFlor(data.notas_flor || '');

            if (data.acciones_ia) {
                try {
                    setSynthesis(JSON.parse(data.acciones_ia));
                } catch { /* ignore */ }
            }
            setSintesisPublicada(data.sintesis_publicada === true);

            const baseUrl = window.location.origin;
            setClientLink(`${baseUrl}/coaching/sesion/${data.client_token}`);
        } catch {
            setError('Error al cargar la sesión.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyLink = () => {
        if (!clientLink) return;
        navigator.clipboard.writeText(clientLink);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2500);
    };

    const startEditQuestion = (etapa: number, idx: number, text: string) => {
        setEditingQuestion({ etapa, idx });
        setEditText(text);
    };

    const saveEditQuestion = () => {
        if (!localPlan || !editingQuestion) return;
        const updated = JSON.parse(JSON.stringify(localPlan)) as CoachingPlan;
        const etapaIdx = updated.etapas.findIndex(e => e.numero === editingQuestion.etapa);
        if (etapaIdx >= 0) {
            updated.etapas[etapaIdx].preguntas[editingQuestion.idx] = editText;
        }
        setLocalPlan(updated);
        setEditingQuestion(null);
    };

    const deleteQuestion = (etapa: number, idx: number) => {
        if (!localPlan) return;
        const updated = JSON.parse(JSON.stringify(localPlan)) as CoachingPlan;
        const etapaIdx = updated.etapas.findIndex(e => e.numero === etapa);
        if (etapaIdx >= 0 && updated.etapas[etapaIdx].preguntas.length > 1) {
            updated.etapas[etapaIdx].preguntas.splice(idx, 1);
        }
        setLocalPlan(updated);
    };

    const addQuestion = (etapa: number) => {
        if (!localPlan) return;
        const updated = JSON.parse(JSON.stringify(localPlan)) as CoachingPlan;
        const etapaIdx = updated.etapas.findIndex(e => e.numero === etapa);
        if (etapaIdx >= 0) {
            updated.etapas[etapaIdx].preguntas.push('Nueva pregunta...');
            // auto-open for edit
            const newIdx = updated.etapas[etapaIdx].preguntas.length - 1;
            setLocalPlan(updated);
            setTimeout(() => startEditQuestion(etapa, newIdx, 'Nueva pregunta...'), 50);
            return;
        }
        setLocalPlan(updated);
    };

    const savePlan = async () => {
        if (!localPlan) return;
        setSavingPlan(true);
        try {
            const { error: updateError } = await supabase
                .from('coaching_sessions')
                .update({ ai_coaching_plan: localPlan })
                .eq('id', sessionId);
            if (!updateError) {
                setPlan(localPlan);
                setPlanSaved(true);
                setTimeout(() => setPlanSaved(false), 2500);
            }
        } finally {
            setSavingPlan(false);
        }
    };

    const saveNotas = async () => {
        setSavingNotas(true);
        try {
            await supabase
                .from('coaching_sessions')
                .update({ notas_flor: notasFlor })
                .eq('id', sessionId);
        } finally {
            setSavingNotas(false);
        }
    };

    const handleGenerateSynthesis = async () => {
        if (!session) return;
        setGeneratingSynthesis(true);
        try {
            const res = await fetch('/api/coaching/generate-synthesis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId: session.id, token: session.client_token }),
            });
            if (res.ok) {
                const data = await res.json();
                setSynthesis(data.synthesis);
                // Al regenerar, vuelve a borrador (no publicada)
                setSintesisPublicada(false);
                await supabase
                    .from('coaching_sessions')
                    .update({ sintesis_publicada: false })
                    .eq('id', session.id);
                setActiveTab('acciones');
            }
        } finally {
            setGeneratingSynthesis(false);
        }
    };

    const updateSynthesisField = (field: 'sintesis', value: string) => {
        setSynthesis(prev => prev ? { ...prev, [field]: value } : prev);
        setSynthesisSaved(false);
    };

    const updateAccionField = (idx: number, field: 'titulo' | 'descripcion', value: string) => {
        setSynthesis(prev => {
            if (!prev) return prev;
            const acciones = prev.acciones.map((a, i) => i === idx ? { ...a, [field]: value } : a);
            return { ...prev, acciones };
        });
        setSynthesisSaved(false);
    };

    const addAccion = () => {
        setSynthesis(prev => prev ? { ...prev, acciones: [...prev.acciones, { titulo: 'Nueva acción', descripcion: '' }] } : prev);
        setSynthesisSaved(false);
    };

    const removeAccion = (idx: number) => {
        setSynthesis(prev => prev ? { ...prev, acciones: prev.acciones.filter((_, i) => i !== idx) } : prev);
        setSynthesisSaved(false);
    };

    const handleSaveSynthesis = async () => {
        if (!session || !synthesis) return;
        setSavingSynthesis(true);
        try {
            const { error: upErr } = await supabase
                .from('coaching_sessions')
                .update({ acciones_ia: JSON.stringify(synthesis) })
                .eq('id', session.id);
            if (!upErr) {
                setSynthesisSaved(true);
                setTimeout(() => setSynthesisSaved(false), 2000);
            }
        } finally {
            setSavingSynthesis(false);
        }
    };

    const handlePublishToClient = async () => {
        if (!session || !synthesis) return;
        if (!confirm('¿Publicar esta síntesis al cliente?\n\nUna vez publicada, el cliente la verá al ingresar a su link.')) return;
        setPublishing(true);
        try {
            const { error: upErr } = await supabase
                .from('coaching_sessions')
                .update({
                    acciones_ia: JSON.stringify(synthesis),
                    sintesis_publicada: true,
                })
                .eq('id', session.id);
            if (!upErr) {
                setSintesisPublicada(true);
                setSynthesisSaved(true);
                setTimeout(() => setSynthesisSaved(false), 2000);
            }
        } finally {
            setPublishing(false);
        }
    };

    const handleUnpublish = async () => {
        if (!session) return;
        if (!confirm('¿Despublicar la síntesis? El cliente dejará de verla.')) return;
        setPublishing(true);
        try {
            await supabase
                .from('coaching_sessions')
                .update({ sintesis_publicada: false })
                .eq('id', session.id);
            setSintesisPublicada(false);
        } finally {
            setPublishing(false);
        }
    };

    const handleExportPdf = async () => {
        if (!session) return;
        if (!synthesis || !synthesis.sintesis) {
            alert('Primero generá y guardá la síntesis del proceso para poder exportarla.');
            return;
        }
        setExportingPdf(true);
        try {
            const payload = {
                nombreCliente: session.nombre_cliente || 'Cliente',
                sintesis: synthesis.sintesis,
                acciones: synthesis.acciones || [],
                fecha: session.created_at,
            };
            sessionStorage.setItem('coachingExport', JSON.stringify(payload));
            window.open('/exportar?tab=coaching', '_blank');
        } finally {
            setExportingPdf(false);
        }
    };

    const hasResponses = session && Object.keys(session.respuestas_cliente || {}).length > 0;
    const etapasCompletadas: number[] = session?.etapas_completadas || [];
    const allCompleted = etapasCompletadas.length === 3;

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[60vh] p-6">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">Cargando sesión de coaching...</p>
                </div>
            </div>
        );
    }

    if (error || !session || !localPlan) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[60vh] p-6">
                <div className="text-center max-w-md">
                    <p className="text-red-500 text-lg mb-4 font-medium">{error || 'Error cargando la sesión.'}</p>
                    <button onClick={() => window.history.back()} className="text-indigo-600 hover:text-indigo-700 underline font-semibold">Volver</button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 p-6 lg:p-10 bg-slate-50/50 min-h-screen">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <button
                            onClick={() => window.history.back()}
                            className="text-slate-500 hover:text-slate-800 text-sm mb-2 flex items-center gap-1 transition-colors font-medium"
                        >
                            ← Volver
                        </button>
                        <h1 className="text-xs uppercase tracking-[0.5em] font-bold text-indigo-600 mb-1">Coaching Numerológico</h1>
                        <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-800">
                            {session.nombre_cliente || 'Sesión de coaching'}
                        </h2>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {/* Estado badge */}
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                            session.estado === 'completado' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                            session.estado === 'en_progreso' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                            'bg-indigo-100 text-indigo-700 border border-indigo-200'
                        }`}>
                            {session.estado === 'completado' ? '✓ Completado' :
                             session.estado === 'en_progreso' ? '● En progreso' : '○ Pendiente'}
                        </span>

                        {/* Export PDF */}
                        <button
                            onClick={handleExportPdf}
                            disabled={exportingPdf}
                            className="px-5 py-2 rounded-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[16px]">download</span>
                            {exportingPdf ? 'Exportando...' : 'Exportar PDF'}
                        </button>
                    </div>
                </div>

                {/* Client Link Box */}
                <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-5 mb-6">
                    <p className="text-[10px] text-slate-400 mb-2 font-bold uppercase tracking-widest">Link para el cliente</p>
                    <div className="flex gap-2 items-center">
                        <input
                            type="text"
                            readOnly
                            value={clientLink}
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-600 font-mono truncate"
                        />
                        <button
                            onClick={handleCopyLink}
                            className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                                linkCopied
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-md'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[16px]">{linkCopied ? 'check' : 'content_copy'}</span>
                            {linkCopied ? 'Copiado' : 'Copiar link'}
                        </button>
                    </div>
                </div>

                {/* Etapas progress */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    {[1, 2, 3].map(n => {
                        const completada = etapasCompletadas.includes(n);
                        return (
                            <div key={n} className={`rounded-2xl p-4 border text-center transition-colors ${
                                completada
                                    ? 'bg-emerald-50 border-emerald-200'
                                    : 'bg-white border-slate-200 shadow-sm'
                            }`}>
                                <p className={`text-[10px] font-bold uppercase tracking-widest ${completada ? 'text-emerald-600' : 'text-slate-400'}`}>
                                    {completada ? '✓ Completada' : `Etapa ${n}`}
                                </p>
                                <p className="text-slate-800 font-semibold text-sm mt-1 truncate">
                                    {localPlan.etapas[n - 1]?.titulo}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mb-6 bg-white border border-slate-200 rounded-2xl p-1 w-fit shadow-sm">
                    {(['plan', 'respuestas', 'acciones'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                                activeTab === tab
                                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                            }`}
                        >
                            {tab === 'plan' ? 'Plan' : tab === 'respuestas' ? 'Respuestas' : 'Síntesis y Acciones'}
                        </button>
                    ))}
                </div>

                {/* ── TAB: PLAN ── */}
                {activeTab === 'plan' && (
                    <div>
                        {/* Contexto */}
                        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 mb-5">
                            <h3 className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-3">Contexto Numerológico</h3>
                            <MarkdownText text={localPlan.contexto} className="text-slate-700 text-[15px]" />
                        </div>

                        {/* Etapas */}
                        {localPlan.etapas.map((etapa) => (
                            <div key={etapa.numero} className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 mb-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-black flex-shrink-0">
                                        {etapa.numero}
                                    </span>
                                    <div>
                                        <h3 className="text-slate-800 font-bold text-base">{etapa.titulo}</h3>
                                        <p className="text-slate-500 text-sm">{etapa.descripcion}</p>
                                    </div>
                                </div>

                                <div className="space-y-2 mt-4">
                                    {etapa.preguntas.map((pregunta, idx) => (
                                        <div key={idx} className="group flex items-start gap-2">
                                            <span className="text-indigo-500 text-xs font-bold mt-1.5 w-5 flex-shrink-0">{idx + 1}.</span>
                                            {editingQuestion?.etapa === etapa.numero && editingQuestion?.idx === idx ? (
                                                <div className="flex-1 flex gap-2">
                                                    <textarea
                                                        value={editText}
                                                        onChange={e => setEditText(e.target.value)}
                                                        className="flex-1 bg-slate-50 border border-indigo-300 rounded-xl px-3 py-2 text-sm text-slate-800 resize-none min-h-[60px] focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                                                        autoFocus
                                                    />
                                                    <div className="flex flex-col gap-1">
                                                        <button onClick={saveEditQuestion} className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs rounded-lg font-bold">✓</button>
                                                        <button onClick={() => setEditingQuestion(null)} className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-600 text-xs rounded-lg font-bold">✕</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex-1 flex items-start justify-between gap-2 py-1">
                                                    <p className="text-slate-700 text-sm leading-relaxed flex-1">{pregunta}</p>
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                                        <button
                                                            onClick={() => startEditQuestion(etapa.numero, idx, pregunta)}
                                                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs rounded"
                                                            title="Editar"
                                                        >✎</button>
                                                        <button
                                                            onClick={() => deleteQuestion(etapa.numero, idx)}
                                                            className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-500 text-xs rounded"
                                                            title="Eliminar"
                                                        >✕</button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => addQuestion(etapa.numero)}
                                    className="mt-3 text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 transition-colors"
                                >
                                    + Agregar pregunta
                                </button>
                            </div>
                        ))}

                        {/* Save plan */}
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={savePlan}
                                disabled={savingPlan}
                                className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-md ${
                                    planSaved ? 'bg-emerald-500 text-white' : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white'
                                } disabled:opacity-50`}
                            >
                                {savingPlan ? 'Guardando...' : planSaved ? '✓ Guardado' : 'Guardar cambios al plan'}
                            </button>
                        </div>

                        {/* Notas de Flor */}
                        <div className="mt-8 bg-white border border-slate-200 rounded-3xl shadow-sm p-6">
                            <h3 className="text-[10px] font-bold text-purple-600 uppercase tracking-widest mb-3">Mis notas internas</h3>
                            <textarea
                                value={notasFlor}
                                onChange={e => setNotasFlor(e.target.value)}
                                onBlur={saveNotas}
                                placeholder="Notas privadas para vos sobre este cliente (no las verá el cliente)..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-700 text-sm resize-none min-h-[120px] focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300 transition-all"
                            />
                            <p className="text-xs text-slate-400 mt-2">Se guarda automáticamente al salir del campo.</p>
                        </div>
                    </div>
                )}

                {/* ── TAB: RESPUESTAS ── */}
                {activeTab === 'respuestas' && (
                    <div>
                        {!hasResponses ? (
                            <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl shadow-sm">
                                <span className="material-symbols-outlined text-slate-300 text-6xl">forum</span>
                                <p className="text-slate-700 text-lg mt-3 mb-1 font-bold">Todavía no hay respuestas</p>
                                <p className="text-sm text-slate-500">El cliente aún no ha completado ninguna etapa.</p>
                                <div className="mt-6 p-5 bg-indigo-50 rounded-2xl border border-indigo-200 max-w-sm mx-auto">
                                    <p className="text-xs text-indigo-700 font-bold mb-2 uppercase tracking-wider">Compartí este link con tu cliente:</p>
                                    <p className="text-indigo-700 text-xs font-mono break-all bg-white rounded-lg p-2 border border-indigo-100">{clientLink}</p>
                                    <button onClick={handleCopyLink} className="mt-3 px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white text-xs font-bold uppercase tracking-wider rounded-full transition-colors shadow-md">
                                        {linkCopied ? '✓ Copiado' : 'Copiar'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                {localPlan.etapas.map((etapa) => {
                                    const respEtapa = session.respuestas_cliente?.[etapa.numero] || {};
                                    const completada = etapasCompletadas.includes(etapa.numero);
                                    return (
                                        <div key={etapa.numero} className={`bg-white border rounded-3xl shadow-sm p-6 mb-4 ${completada ? 'border-emerald-200' : 'border-slate-200'}`}>
                                            <div className="flex items-center gap-2 mb-4">
                                                <span className={`w-8 h-8 rounded-2xl flex items-center justify-center text-xs font-black ${completada ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                                    {completada ? '✓' : etapa.numero}
                                                </span>
                                                <h3 className="text-slate-800 font-bold">{etapa.titulo}</h3>
                                                {completada && <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 ml-auto">Completada</span>}
                                            </div>
                                            {etapa.preguntas.map((pregunta, idx) => (
                                                <div key={idx} className="mb-4 last:mb-0">
                                                    <p className="text-sm font-bold text-indigo-700 mb-1">{pregunta}</p>
                                                    {respEtapa[idx] ? (
                                                        <p className="text-slate-700 text-sm leading-relaxed bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">{respEtapa[idx]}</p>
                                                    ) : (
                                                        <p className="text-slate-400 text-sm italic">Sin respuesta</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* ── TAB: SÍNTESIS Y ACCIONES ── */}
                {activeTab === 'acciones' && (
                    <div>
                        {!synthesis ? (
                            <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl shadow-sm">
                                {allCompleted ? (
                                    <div>
                                        <span className="material-symbols-outlined text-emerald-500 text-6xl">verified</span>
                                        <p className="text-slate-800 text-lg font-bold mt-3 mb-1">El cliente completó las 3 etapas</p>
                                        <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">Generá la síntesis y el plan de acción personalizado basado en sus respuestas.</p>
                                        <button
                                            onClick={handleGenerateSynthesis}
                                            disabled={generatingSynthesis}
                                            className="px-7 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold uppercase tracking-wider text-xs rounded-full transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto shadow-lg"
                                        >
                                            {generatingSynthesis ? (
                                                <>
                                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    Generando síntesis...
                                                </>
                                            ) : (
                                                <>
                                                    <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                                                    Generar síntesis con IA
                                                </>
                                            )}
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        <span className="material-symbols-outlined text-slate-300 text-6xl">hourglass_empty</span>
                                        <p className="text-slate-700 text-lg font-bold mt-3 mb-1">Todavía no hay síntesis</p>
                                        <p className="text-sm text-slate-500">Disponible cuando el cliente complete las 3 etapas.</p>
                                        <div className="mt-4 flex justify-center gap-2">
                                            {[1, 2, 3].map(n => (
                                                <span key={n} className={`px-3 py-1 rounded-full text-xs font-bold ${etapasCompletadas.includes(n) ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                                                    Etapa {n} {etapasCompletadas.includes(n) ? '✓' : ''}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div>
                                {/* Estado de publicación */}
                                <div className={`rounded-3xl p-4 mb-5 border flex items-start gap-3 ${
                                    sintesisPublicada
                                        ? 'bg-emerald-50 border-emerald-200'
                                        : 'bg-amber-50 border-amber-200'
                                }`}>
                                    <span className={`material-symbols-outlined mt-0.5 ${sintesisPublicada ? 'text-emerald-600' : 'text-amber-600'}`}>
                                        {sintesisPublicada ? 'visibility' : 'edit_note'}
                                    </span>
                                    <div className="flex-1">
                                        <p className={`text-sm font-bold ${sintesisPublicada ? 'text-emerald-800' : 'text-amber-800'}`}>
                                            {sintesisPublicada ? 'Publicada al cliente' : 'Borrador (no visible al cliente)'}
                                        </p>
                                        <p className={`text-xs mt-0.5 ${sintesisPublicada ? 'text-emerald-700' : 'text-amber-700'}`}>
                                            {sintesisPublicada
                                                ? 'El cliente ya puede ver esta síntesis y plan de acción al ingresar a su link.'
                                                : 'Edita lo que necesites y luego presioná "Publicar al cliente" para que pueda verlo.'}
                                        </p>
                                    </div>
                                </div>

                                {/* Síntesis editable */}
                                <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 mb-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-[10px] font-bold text-purple-600 uppercase tracking-widest">Síntesis del proceso</h3>
                                        <span className="text-[10px] text-slate-400 font-medium">Editable</span>
                                    </div>
                                    <textarea
                                        value={synthesis.sintesis}
                                        onChange={e => updateSynthesisField('sintesis', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-700 text-sm leading-relaxed resize-y min-h-[150px] focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all"
                                    />
                                </div>

                                {/* Acciones editables */}
                                <h3 className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-3">Plan de acción</h3>
                                <div className="space-y-4">
                                    {synthesis.acciones.map((accion, i) => (
                                        <div key={i} className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6">
                                            <div className="flex items-start gap-4">
                                                <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-black flex-shrink-0 mt-1">
                                                    {i + 1}
                                                </span>
                                                <div className="flex-1 space-y-3">
                                                    <input
                                                        type="text"
                                                        value={accion.titulo}
                                                        onChange={e => updateAccionField(i, 'titulo', e.target.value)}
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-bold text-base focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all"
                                                        placeholder="Título de la acción"
                                                    />
                                                    <textarea
                                                        value={accion.descripcion}
                                                        onChange={e => updateAccionField(i, 'descripcion', e.target.value)}
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-600 text-sm leading-relaxed resize-y min-h-[160px] focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all"
                                                        placeholder="Descripción detallada de la acción a realizar..."
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => removeAccion(i)}
                                                    className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-500 text-sm rounded-lg transition-colors flex-shrink-0"
                                                    title="Eliminar acción"
                                                >✕</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={addAccion}
                                    className="mt-3 text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 transition-colors"
                                >
                                    + Agregar acción
                                </button>

                                {/* Acciones */}
                                <div className="mt-6 flex flex-wrap gap-3">
                                    <button
                                        onClick={handleSaveSynthesis}
                                        disabled={savingSynthesis}
                                        className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-full transition-all flex items-center gap-2 disabled:opacity-50 ${
                                            synthesisSaved ? 'bg-emerald-500 text-white' : 'bg-slate-800 hover:bg-slate-900 text-white'
                                        }`}
                                    >
                                        <span className="material-symbols-outlined text-[16px]">save</span>
                                        {savingSynthesis ? 'Guardando...' : synthesisSaved ? 'Guardado ✓' : 'Guardar cambios'}
                                    </button>

                                    {sintesisPublicada ? (
                                        <button
                                            onClick={handleUnpublish}
                                            disabled={publishing}
                                            className="px-5 py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider rounded-full transition-colors disabled:opacity-50 flex items-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">visibility_off</span>
                                            {publishing ? 'Despublicando...' : 'Despublicar'}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handlePublishToClient}
                                            disabled={publishing}
                                            className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-bold uppercase tracking-wider rounded-full transition-all disabled:opacity-50 flex items-center gap-2 shadow-md"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">send</span>
                                            {publishing ? 'Publicando...' : 'Publicar al cliente'}
                                        </button>
                                    )}

                                    <button
                                        onClick={handleGenerateSynthesis}
                                        disabled={generatingSynthesis}
                                        className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-full transition-colors disabled:opacity-50 flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">refresh</span>
                                        {generatingSynthesis ? 'Regenerando...' : 'Regenerar con IA'}
                                    </button>
                                    <button
                                        onClick={handleExportPdf}
                                        disabled={exportingPdf}
                                        className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white text-xs font-bold uppercase tracking-wider rounded-full transition-colors disabled:opacity-50 flex items-center gap-2 shadow-md"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">download</span>
                                        {exportingPdf ? 'Exportando...' : 'Exportar PDF'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
        </div>
    );
}

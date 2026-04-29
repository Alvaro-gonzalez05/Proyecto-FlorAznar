'use client';

import React, { useEffect, useState } from 'react';
import { TYPE_TRANSLATIONS, DEFAULT_PROMPTS } from '@/lib/defaultPrompts';
import { gsap } from 'gsap';

export default function PromptsPage() {
    const [prompts, setPrompts] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const promptKeys = [
        { id: 'global_instruction', name: 'INSTRUCCIÓN MAESTRA GLOBAL (Afecta a todas las tarjetas)' },
        // Per-card section prompts
        { id: 'vibracion_interna', name: 'Vibración Interna' },
        { id: 'alma', name: 'Número de Alma' },
        { id: 'personalidad', name: 'Número de Personalidad' },
        { id: 'mision', name: 'Misión' },
        { id: 'camino_de_vida', name: 'Camino de Vida' },
        { id: 'fecha', name: 'Talento / Karma / Memoria (Fecha)' },
        { id: 'ciclos', name: 'Ciclos y Desafíos' },
        { id: 'subconsciente', name: 'Subconsciente I y O' },
        { id: 'inconsciente', name: 'Inconsciente y Sombra' },
        { id: 'ser_interior', name: 'Ser Interior (Q, R, S)' },
        { id: 'casas_9', name: 'Las 9 Casas' },
        { id: 'anio_personal', name: 'Año y Mes Personal' },
        { id: 'letras_faltantes', name: 'Letras Faltantes / Deudas Kármicas' },
        { id: 'fuerza', name: 'Número de Fuerza' },
        { id: 'equilibrio', name: 'Número de Equilibrio' },
        { id: 'regalo_divino', name: 'Regalo Divino' },
        { id: 'planos_existenciales', name: 'Planos Existenciales' },
        // Sistema Familiar
        { id: 'herencia_familiar', name: 'Herencia Familiar' },
        { id: 'evolucion_familiar', name: 'Evolución Familiar' },
        { id: 'expresion_profesional', name: 'Expresión Profesional' },
        { id: 'potencial_evolutivo', name: 'Potencial Evolutivo' },
        { id: 'linaje_individual', name: 'Linaje Individual (genérico)' },
        // Full report prompts
        { id: 'resumen_analista', name: 'Resumen Analista (Reporte Técnico + Coaching)' },
        { id: 'resumen_cliente', name: 'Resumen Cliente (Reporte Amigable)' },
    ];

    // Sub-prompts that appear nested under "Resumen Analista" (Coaching Numerológico)
    const COACHING_SUB_PROMPTS = [
        { id: 'coaching_etapa_1', name: 'Etapa 1 — Autoconocimiento y Patrones' },
        { id: 'coaching_etapa_2', name: 'Etapa 2 — Bloqueos y Recursos' },
        { id: 'coaching_etapa_3', name: 'Etapa 3 — Acción y Transformación' },
        { id: 'coaching_sintesis', name: 'Síntesis y Acciones Finales (al completar el cliente)' },
    ];
    
    const [selectedId, setSelectedId] = useState<string>(promptKeys[0].id);
    const [editText, setEditText] = useState<string>('');
    const [saveMessage, setSaveMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    // Coaching sub-prompt state (only used when "resumen_analista" is selected)
    const [coachingTexts, setCoachingTexts] = useState<Record<string, string>>({});
    const [savingCoachingId, setSavingCoachingId] = useState<string | null>(null);
    const [coachingSavedId, setCoachingSavedId] = useState<string | null>(null);

    useEffect(() => {
        const fetchPrompts = async () => {
            try {
                const res = await fetch('/api/prompts');
                if (res.ok) {
                    const data = await res.json();
                    // Merge DB prompts with defaults, ensuring missing keys have default values
                    setPrompts({ ...DEFAULT_PROMPTS, ...(data.prompts || {}) });
                } else {
                    setPrompts(DEFAULT_PROMPTS);
                }
            } catch (e) {
                console.error('Error fetching prompts', e);
                setPrompts(DEFAULT_PROMPTS);
            } finally {
                setLoading(false);
            }
        };
        fetchPrompts();
    }, []);

    useEffect(() => {
        if (!loading && prompts[selectedId]) {
            setEditText(prompts[selectedId]);
            setSaveMessage(null);
        }
    }, [selectedId, loading, prompts]);

    // Sync coaching sub-prompt textareas when prompts load or when switching to resumen_analista
    useEffect(() => {
        if (loading) return;
        const next: Record<string, string> = {};
        for (const sub of COACHING_SUB_PROMPTS) {
            next[sub.id] = prompts[sub.id] ?? DEFAULT_PROMPTS[sub.id] ?? '';
        }
        setCoachingTexts(next);
    }, [loading, prompts]);

    const handleSaveCoaching = async (subId: string) => {
        setSavingCoachingId(subId);
        try {
            const res = await fetch('/api/prompts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: subId, prompt_text: coachingTexts[subId] || '' })
            });
            if (res.ok) {
                setPrompts(prev => ({ ...prev, [subId]: coachingTexts[subId] || '' }));
                setCoachingSavedId(subId);
                setTimeout(() => setCoachingSavedId(null), 2000);
            }
        } finally {
            setSavingCoachingId(null);
        }
    };

    const handleResetCoaching = (subId: string) => {
        if (confirm('¿Restaurar el texto por defecto para esta etapa?')) {
            setCoachingTexts(prev => ({ ...prev, [subId]: DEFAULT_PROMPTS[subId] || '' }));
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setSaveMessage(null);
        try {
            const res = await fetch('/api/prompts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: selectedId, prompt_text: editText })
            });

            if (res.ok) {
                setPrompts(prev => ({ ...prev, [selectedId]: editText }));
                setSaveMessage({ text: 'Prompt guardado exitosamente', type: 'success' });
                // Make the success message disappear after 3 seconds
                setTimeout(() => setSaveMessage(null), 3000);
            } else {
                setSaveMessage({ text: 'Error al guardar el prompt', type: 'error' });
            }
        } catch (e) {
            setSaveMessage({ text: 'Problema de red al guardar', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        if (confirm('¿Estás seguro de que quieres volver al texto por defecto para este prompt?')) {
            const defaultText = DEFAULT_PROMPTS[selectedId] || '';
            setEditText(defaultText);
        }
    };

    // Animation on mount
    useEffect(() => {
        gsap.fromTo('.prompt-stagger', 
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, stagger: 0.05, duration: 0.6, ease: 'power2.out' }
        );
    }, []);

    if (loading) {
        return (
            <div className="flex-1 p-6 lg:p-10 flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <span className="material-symbols-outlined text-indigo-500 animate-spin-slow text-5xl mb-4">settings</span>
                    <h2 className="text-slate-500 font-bold uppercase tracking-widest text-sm">Cargando Configuraciones...</h2>
                </div>
            </div>
        );
    }

    const selectedName = promptKeys.find(p => p.id === selectedId)?.name;

    return (
        <div className="flex-1 p-6 lg:p-10 flex flex-col h-full bg-slate-50/50">
            <header className="mb-8 prompt-stagger">
                <h1 className="text-xs uppercase tracking-[0.5em] font-bold text-slate-500 mb-2">Configuración AI</h1>
                <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-800">
                    Gestor de Prompts
                </h2>
                <p className="text-sm text-slate-500 mt-2 max-w-2xl leading-relaxed">
                    Ajusta el tono, enfoque y reglas con las que la inteligencia artificial interpreta los cáculos numerológicos. Puedes editar las instrucciones para las tarjetas individuales o para los roles de Analista y Cliente.
                </p>
            </header>

            <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-0 prompt-stagger">
                {/* Sidebar Menu */}
                <div className="w-full lg:w-1/3 xl:w-1/4 flex flex-col bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-5 border-b border-slate-100 bg-slate-50/80">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px]">list_alt</span>
                            Áreas de Análisis
                        </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                        {promptKeys.map((item) => {
                            const isGroupStart = item.id === 'global_instruction' || item.id === 'resumen_analista';
                            const isActive = selectedId === item.id;
                            
                            return (
                                <React.Fragment key={item.id}>
                                    {item.id === 'global_instruction' && (
                                        <div className="px-4 py-2 mt-2 mb-1 text-[10px] font-bold uppercase text-indigo-400 tracking-wider">Reglas Base</div>
                                    )}
                                    {item.id === 'vibracion_interna' && (
                                        <div className="px-4 py-2 mt-4 mb-1 text-[10px] font-bold uppercase text-teal-400 tracking-wider">Tarjetas Específicas</div>
                                    )}
                                    {item.id === 'herencia_familiar' && (
                                        <div className="px-4 py-2 mt-4 mb-1 text-[10px] font-bold uppercase text-violet-400 tracking-wider">Sistema Familiar</div>
                                    )}
                                    {item.id === 'resumen_analista' && (
                                        <div className="px-4 py-2 mt-4 mb-1 text-[10px] font-bold uppercase text-purple-400 tracking-wider">Reportes Completos</div>
                                    )}
                                    
                                    <button
                                        onClick={() => setSelectedId(item.id)}
                                        className={`w-full text-left px-4 py-3 rounded-xl mb-1 text-sm transition-all duration-200 flex items-start gap-3 group
                                            ${isActive 
                                                ? 'bg-indigo-50 text-indigo-700 font-bold shadow-sm border border-indigo-100/50' 
                                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800 font-medium'
                                            }
                                        `}
                                    >
                                        <span className={`material-symbols-outlined text-[18px] mt-0.5 ${isActive ? 'text-indigo-500' : 'text-slate-400 group-hover:text-slate-600'}`}>
                                            {item.id === 'global_instruction' ? 'public' : 
                                             item.id.includes('resumen') ? 'summarize' :
                                             ['herencia_familiar','evolucion_familiar','expresion_profesional','potencial_evolutivo','linaje_individual'].includes(item.id) ? 'family_history' :
                                             'psychology'}
                                        </span>
                                        <span className="leading-snug">{item.name}</span>
                                    </button>
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>

                {/* Editor Area */}
                <div className="w-full lg:w-2/3 xl:w-3/4 flex flex-col bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-50 to-white">
                        <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Editando Prompt Para</p>
                            <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                                {selectedId === 'global_instruction' ? (
                                    <span className="material-symbols-outlined text-indigo-500">public</span>
                                ) : (
                                    <span className="material-symbols-outlined text-indigo-500">edit_note</span>
                                )}
                                {selectedName}
                            </h2>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleReset}
                                className="px-4 py-2.5 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800 text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                                Restaurar
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-6 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                            >
                                {saving ? (
                                    <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                                ) : (
                                    <span className="material-symbols-outlined text-[16px]">save</span>
                                )}
                                {saving ? 'Guardando' : 'Guardar'}
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 p-6 relative flex flex-col bg-slate-50/30 overflow-y-auto custom-scrollbar">
                        {saveMessage && (
                            <div className={`absolute top-8 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full text-sm font-bold shadow-lg z-10 flex items-center gap-2 animate-fade-in-up
                                ${saveMessage.type === 'success' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-red-100 text-red-800 border border-red-200'}
                            `}>
                                <span className="material-symbols-outlined text-[18px]">
                                    {saveMessage.type === 'success' ? 'check_circle' : 'error'}
                                </span>
                                {saveMessage.text}
                            </div>
                        )}

                        {/* Main editor textarea — always visible (incluido para Resumen Analista) */}
                        <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="flex-1 w-full min-h-[400px] bg-white border border-slate-200 rounded-2xl p-6 text-slate-700 text-[14px] font-mono leading-relaxed focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-shadow shadow-inner resize-none custom-scrollbar"
                            placeholder="Introduce las instrucciones para la IA aquí..."
                        />

                        <div className="mt-4 flex items-start gap-3 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                            <span className="material-symbols-outlined text-indigo-400 mt-0.5">info</span>
                            <p className="text-xs text-indigo-900/70 leading-relaxed font-medium">
                                {selectedId === 'global_instruction'
                                    ? 'Estas instrucciones sirven de "System Prompt" o comportamiento base para todas las consultas individuales, asegurando el uso de la bibliografía correcta.'
                                    : selectedId.includes('resumen')
                                        ? 'Los datos numerológicos completos de la persona se inyectan automáticamente al final del prompt cada vez que se ejecuta. Solo enfocate en dictar el tono, formato y estilo de la respuesta — no hace falta usar variables ni placeholders.'
                                        : selectedId === 'linaje_individual'
                                            ? 'Este prompt es genérico y se reutiliza para todos los nombres y apellidos del desglose de linajes. El sistema reemplaza automáticamente {tipo} (nombre/apellido), {palabra} (ej: Silvia, Rojas) y {numero} (ej: 27/9) antes de enviarlo a la IA.'
                                            : ['herencia_familiar', 'evolucion_familiar', 'expresion_profesional', 'potencial_evolutivo'].includes(selectedId)
                                                ? 'Este prompt se usa para el análisis del Sistema Familiar (requiere 3+ apellidos). La IA recibe los valores calculados del mapa familiar junto con estas instrucciones.'
                                                : 'Para consultas de secciones individuales, la IA recibe qué sección es, de qué persona y los valores que debe interpretar en su contexto. Define aquí cualquier particularidad que la IA deba de tener en cuenta solo en esta sección.'}
                            </p>
                        </div>

                        {/* ── Coaching Numerológico sub-prompts (only for Resumen Analista) ── */}
                        {selectedId === 'resumen_analista' && (
                            <div className="mt-8 pt-6 border-t-2 border-dashed border-teal-200">
                                <div className="mb-4 flex items-start gap-3 bg-gradient-to-r from-teal-50 to-emerald-50 p-4 rounded-2xl border border-teal-200">
                                    <span className="material-symbols-outlined text-teal-500 mt-0.5">self_improvement</span>
                                    <div className="text-xs text-teal-900/80 leading-relaxed">
                                        <p className="font-bold mb-1">Coaching Numerológico — 3 Etapas + Síntesis Final</p>
                                        <p>Estos prompts se usan al iniciar una sesión de coaching desde el Resumen Analista. Cada etapa recibe automáticamente <b>los datos numerológicos completos</b> y el <b>Resumen Analista IA</b> previamente generado. Solo escribí <b>cómo</b> querés que la coach analice y formule las preguntas. El sistema se encarga del formato técnico (JSON, cantidad de preguntas) automáticamente.</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {COACHING_SUB_PROMPTS.map((sub, idx) => {
                                        const isFinal = sub.id === 'coaching_sintesis';
                                        return (
                                            <div key={sub.id} className={`bg-white rounded-2xl border ${isFinal ? 'border-purple-200' : 'border-teal-200'} overflow-hidden shadow-sm`}>
                                                <div className={`flex items-center justify-between gap-3 px-4 py-3 border-b ${isFinal ? 'bg-purple-50 border-purple-100' : 'bg-teal-50/60 border-teal-100'}`}>
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        {!isFinal && (
                                                            <span className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                                                                {idx + 1}
                                                            </span>
                                                        )}
                                                        {isFinal && (
                                                            <span className="material-symbols-outlined text-purple-500 text-[20px]">flag</span>
                                                        )}
                                                        <p className={`text-sm font-bold truncate ${isFinal ? 'text-purple-900' : 'text-teal-900'}`}>{sub.name}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2 flex-shrink-0">
                                                        <button
                                                            onClick={() => handleResetCoaching(sub.id)}
                                                            className="px-3 py-1.5 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800 text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1"
                                                            title="Restaurar por defecto"
                                                        >
                                                            <span className="material-symbols-outlined text-[14px]">restart_alt</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleSaveCoaching(sub.id)}
                                                            disabled={savingCoachingId === sub.id}
                                                            className={`px-4 py-1.5 rounded-full text-white text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 disabled:opacity-50 ${
                                                                coachingSavedId === sub.id
                                                                    ? 'bg-emerald-500'
                                                                    : isFinal ? 'bg-purple-600 hover:bg-purple-700' : 'bg-teal-600 hover:bg-teal-700'
                                                            }`}
                                                        >
                                                            {savingCoachingId === sub.id ? (
                                                                <span className="material-symbols-outlined text-[14px] animate-spin">sync</span>
                                                            ) : coachingSavedId === sub.id ? (
                                                                <span className="material-symbols-outlined text-[14px]">check</span>
                                                            ) : (
                                                                <span className="material-symbols-outlined text-[14px]">save</span>
                                                            )}
                                                            {coachingSavedId === sub.id ? 'Guardado' : 'Guardar'}
                                                        </button>
                                                    </div>
                                                </div>
                                                <textarea
                                                    value={coachingTexts[sub.id] || ''}
                                                    onChange={e => setCoachingTexts(prev => ({ ...prev, [sub.id]: e.target.value }))}
                                                    className="w-full bg-white p-4 text-slate-700 text-[13px] font-mono leading-relaxed focus:outline-none resize-none custom-scrollbar min-h-[220px]"
                                                    placeholder={`Prompt para ${sub.name}...`}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

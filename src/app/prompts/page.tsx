'use client';

import React, { useEffect, useState } from 'react';
import { TYPE_TRANSLATIONS, DEFAULT_PROMPTS } from '@/lib/defaultPrompts';
import { gsap } from 'gsap';

export default function PromptsPage() {
    const [prompts, setPrompts] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Add global instruction manually since it's not in TYPE_TRANSLATIONS
    const promptKeys = [
        { id: 'global_instruction', name: 'Instrucción Global (Para todas las tarjetas individuales)' },
        ...Object.entries(TYPE_TRANSLATIONS).map(([id, name]) => ({ id, name }))
    ];
    
    const [selectedId, setSelectedId] = useState<string>(promptKeys[0].id);
    const [editText, setEditText] = useState<string>('');
    const [saveMessage, setSaveMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        const fetchPrompts = async () => {
            try {
                const res = await fetch('/api/prompts');
                if (res.ok) {
                    const data = await res.json();
                    setPrompts(data.prompts || DEFAULT_PROMPTS);
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
                                             item.id.includes('resumen') ? 'summarize' : 'psychology'}
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

                    <div className="flex-1 p-6 relative flex flex-col bg-slate-50/30">
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
                        
                        <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="flex-1 w-full h-full bg-white border border-slate-200 rounded-2xl p-6 text-slate-700 text-[14px] font-mono leading-relaxed focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-shadow shadow-inner resize-none custom-scrollbar"
                            placeholder="Introduce las instrucciones para la IA aquí..."
                        />
                        
                        <div className="mt-4 flex items-start gap-3 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                            <span className="material-symbols-outlined text-indigo-400 mt-0.5">info</span>
                            <p className="text-xs text-indigo-900/70 leading-relaxed font-medium">
                                {selectedId === 'global_instruction' 
                                    ? 'Estas instrucciones sirven de "System Prompt" o comportamiento base para todas las consultas individuales, asegurando el uso de la bibliografía correcta.' 
                                    : selectedId.includes('resumen')
                                        ? 'Este prompt incluye por defecto la macro variable especial [DATOS_PERSONA] internamente para inyectar los datos numerológicos. Solo enfócate en dictar el formato y estilo de la respuesta final.'
                                        : 'Para consultas de secciones individuales, la IA recibe qué sección es, de qué persona y los valores que debe interpretar en su contexto. Define aquí cualquier particularidad que la IA deba de tener en cuenta solo en esta sección.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

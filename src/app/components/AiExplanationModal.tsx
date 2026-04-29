'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface ExplanationModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    num: string | number;
    precalculatedText?: string;
    isLoading?: boolean;
    onRegenerate?: () => void;
    onCoaching?: () => void;
    coachingLoading?: boolean;
}

/** Build rich section data from the full numerology result for detailed AI analysis */
function buildSectionData(title: string, storedResult: any): any {
    if (!storedResult) return null;
    const pp = storedResult.primeraParte;
    if (!pp) return null;

    const titleLower = title.toLowerCase();

    // Vibración Interna — include per-word breakdown
    if (titleLower.includes('vibración interna') || titleLower.includes('vibracion interna')) {
        const viArray = pp.vibracionInterna || [];
        return {
            individuales: viArray.map((v: any) => ({
                nombre: v.word,
                valor: v.reduction?.label || v.reduction?.sequence?.join('/') || v.reduction?.digit,
            })),
            nota: 'Si hay varios nombres, se analizan por separado. No se suma un total.',
        };
    }

    // Alma
    if (titleLower === 'alma') {
        return {
            total: pp.calculoAlma?.label,
            alternativa: pp.almaAlternative?.label,
            desglosePorPalabra: pp.almaPerWord?.map((a: any) => ({
                palabra: a.word,
                vocales: a.vowelLetters?.map((l: any) => `${l.letter}=${l.value}`).join(', '),
                subtotal: a.vowelReduction?.label || a.vowelReduction?.sequence?.join('/'),
            })),
        };
    }

    // Personalidad
    if (titleLower === 'personalidad') {
        return {
            total: pp.calculoPersonalidad?.label,
            alternativa: pp.personalidadAlternative?.label,
            desglosePorPalabra: pp.personalidadPerWord?.map((p: any) => ({
                palabra: p.word,
                consonantes: p.consonantLetters?.map((l: any) => `${l.letter}=${l.value}`).join(', '),
                subtotal: p.consonantReduction?.label || p.consonantReduction?.sequence?.join('/'),
            })),
        };
    }

    // Misión
    if (titleLower.includes('misión') || titleLower.includes('mision')) {
        return {
            total: pp.calculoMision?.label,
            especiales: pp.misionEspeciales?.map((m: any) => m.label),
            alma: pp.calculoAlma?.label,
            personalidad: pp.calculoPersonalidad?.label,
            nota: 'Se analizan todas las combinaciones de sumas horizontales buscando maestros y kármicos.'
        };
    }

    // Camino de Vida
    if (titleLower.includes('camino de vida')) {
        const fn = pp.fechaNacimiento;
        return {
            total: fn?.caminoDeVida?.label,
            alternativa: fn?.caminoDeVidaAlternative?.label,
            dia: fn?.dia,
            diaReduccion: fn?.diaReduction?.label,
            mes: fn?.mes,
            mesReduccion: fn?.mesReduction?.label,
            anio: fn?.anio,
            anioReduccion: fn?.anioReduction?.label,
        };
    }

    // Talento
    if (titleLower.includes('talento') || titleLower.includes('don')) {
        return {
            valor: pp.fechaNacimiento?.talento?.label,
            dia: pp.fechaNacimiento?.dia,
            explicacion: 'El talento viene del día de nacimiento',
        };
    }

    // Karma
    if (titleLower.includes('karma')) {
        return {
            valor: pp.fechaNacimiento?.karmaMes?.label,
            mes: pp.fechaNacimiento?.mes,
            explicacion: 'El karma viene del mes de nacimiento',
        };
    }

    // Memoria de Vida Pasada
    if (titleLower.includes('memoria') || titleLower.includes('pasado') || titleLower.includes('pasada')) {
        return {
            valor: pp.fechaNacimiento?.memoriaVidaPasada?.label,
            anio: pp.fechaNacimiento?.anio,
            explicacion: 'La memoria de vida pasada viene del año de nacimiento',
        };
    }

    // Subconsciente I
    if (titleLower.includes('subconsciente i') && !titleLower.includes('subconsciente o')) {
        const ciclos = pp.ciclos;
        return {
            valor: ciclos?.subconscienteI?.label || ciclos?.subconscienteI?.digit,
            formula: 'Suma de los 3 primeros ciclos de realización',
            ciclo1: ciclos?.ciclosReduction?.[0]?.label || ciclos?.ciclosReduction?.[0]?.digit,
            ciclo2: ciclos?.ciclosReduction?.[1]?.label || ciclos?.ciclosReduction?.[1]?.digit,
            ciclo3: ciclos?.ciclosReduction?.[2]?.label || ciclos?.ciclosReduction?.[2]?.digit,
        };
    }

    // Subconsciente O
    if (titleLower.includes('subconsciente o')) {
        const ciclos = pp.ciclos;
        return {
            valor: ciclos?.subconscienteO?.label || ciclos?.subconscienteO?.digit,
            formula: 'Suma de los 3 primeros desafíos',
            desafio1: ciclos?.desafiosReduction?.[0]?.label || ciclos?.desafiosReduction?.[0]?.digit,
            desafio2: ciclos?.desafiosReduction?.[1]?.label || ciclos?.desafiosReduction?.[1]?.digit,
            desafio3: ciclos?.desafiosReduction?.[2]?.label || ciclos?.desafiosReduction?.[2]?.digit,
        };
    }

    // Inconsciente
    if (titleLower.includes('inconsciente') && !titleLower.includes('subconsciente')) {
        const ciclos = pp.ciclos;
        return {
            valor: ciclos?.inconsciente?.label || ciclos?.inconsciente?.digit,
            formula: '4to ciclo de realización + Camino de Vida',
            ciclo4: ciclos?.ciclosReduction?.[3]?.label || ciclos?.ciclosReduction?.[3]?.digit,
            caminoDeVida: pp.fechaNacimiento?.caminoDeVida?.label,
        };
    }

    // Sombra
    if (titleLower.includes('sombra')) {
        const ciclos = pp.ciclos;
        return {
            valor: ciclos?.sombra?.label || ciclos?.sombra?.digit,
            formula: 'Subconsciente O + Camino de Vida',
            subconscienteO: ciclos?.subconscienteO?.label || ciclos?.subconscienteO?.digit,
            caminoDeVida: pp.fechaNacimiento?.caminoDeVida?.label,
            explicacion: 'La sombra representa los puntos ciegos, miedos inconscientes y aspectos a integrar',
        };
    }

    // Ser Interior
    if (titleLower.includes('ser interior')) {
        const ciclos = pp.ciclos;
        return {
            Q: ciclos?.serInterior?.Q?.digit,
            R: ciclos?.serInterior?.R?.digit,
            S: ciclos?.serInterior?.S?.digit,
            explicacion: 'El Ser Interior representa la triada Q-R-S de la esencia profunda',
        };
    }

    // Cuadro de las 9 Casas
    if (titleLower.includes('9 casas') || titleLower.includes('casas')) {
        const casas = pp.casas;
        const CASAS_NOMBRES: Record<number, string> = {
            1: 'El Rey (Ego, identidad, padre)',
            2: 'La Reina (Emociones, madre, pareja)',
            3: 'El Príncipe (Creatividad, niño interior)',
            4: 'La Cocina (Trabajo, cuerpo, raíces)',
            5: 'Sala de Guardia (Libertad, cambio, sexualidad)',
            6: 'Habitación del Amor (Afectos, maternidad)',
            7: 'La Biblioteca (Espiritualidad, conocimiento)',
            8: 'Sala de Administración (Talentos, poder)',
            9: 'La Capilla (Conciencia universal, servicio)',
        };
        const casasData: any[] = [];
        for (let i = 1; i <= 9; i++) {
            casasData.push({
                casa: i,
                nombre: CASAS_NOMBRES[i],
                habitante: casas?.habitantes?.[i] ?? '-',
                puenteIniciatico: casas?.puenteIniciatico?.[i] ?? '-',
            });
        }
        return {
            casas: casasData,
            puenteDeEvolucion: casas?.puenteDeEvolucion,
            caminoDeVida: pp.fechaNacimiento?.caminoDeVida?.label,
            explicacion: 'Analiza CADA casa con su habitante, qué significa ese número en esa casa, y dale una visión global al final',
        };
    }

    // Año Personal / Mes Personal
    if (titleLower.includes('año personal') || titleLower.includes('anio personal')) {
        return {
            valor: pp.potenciadores?.anioPersonal?.label || pp.potenciadores?.anioPersonal?.digit,
            explicacion: 'El año personal indica la energía del ciclo anual actual',
        };
    }

    if (titleLower.includes('mes personal')) {
        return {
            valor: pp.potenciadores?.mesPersonal?.label || pp.potenciadores?.mesPersonal?.digit,
            anioPersonal: pp.potenciadores?.anioPersonal?.label || pp.potenciadores?.anioPersonal?.digit,
            explicacion: 'El mes personal es un sub-ciclo dentro del año personal',
        };
    }

    // Número de Fuerza
    if (titleLower.includes('fuerza')) {
        return {
            valor: pp.potenciadores?.numeroDeFuerza?.label || pp.potenciadores?.numeroDeFuerza?.digit,
            mision: pp.calculoMision?.label,
            caminoDeVida: pp.fechaNacimiento?.caminoDeVida?.label,
            formula: 'Misión + Camino de Vida',
        };
    }

    // Lecciones Kármicas
    if (titleLower.includes('lecciones') || titleLower.includes('kármicas') || titleLower.includes('letras_faltantes')) {
        const conteo = pp.deudasKarmicasNombre || {};
        const faltantes: number[] = [];
        const presentes: Record<number, number> = {};
        for (let i = 1; i <= 9; i++) {
            const count = conteo[i] || 0;
            if (count === 0) faltantes.push(i);
            else presentes[i] = count;
        }
        return {
            faltantes,
            presentes,
            explicacion: `Los números faltantes (valor 0) representan las lecciones kármicas que esta persona debe trabajar en esta vida. Son: ${faltantes.join(', ') || 'ninguno'}`,
        };
    }

    return null;
}

export default function AiExplanationModal({ isOpen, onClose, title, num, precalculatedText, isLoading, onRegenerate, onCoaching, coachingLoading }: ExplanationModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;

        // Animation in
        gsap.set(overlayRef.current, { autoAlpha: 0 });
        gsap.set(modalRef.current, { y: 30, scale: 0.95, autoAlpha: 0 });

        const tl = gsap.timeline();
        tl.to(overlayRef.current, { autoAlpha: 1, duration: 0.3, ease: 'power2.out' })
            .to(modalRef.current, { y: 0, scale: 1, autoAlpha: 1, duration: 0.4, ease: 'back.out(1.5)' }, '-=0.1');

    }, [isOpen]);

    const handleClose = () => {
        const tl = gsap.timeline({ onComplete: onClose });
        tl.to(modalRef.current, { y: 20, scale: 0.95, autoAlpha: 0, duration: 0.3, ease: 'power2.in' })
            .to(overlayRef.current, { autoAlpha: 0, duration: 0.2 }, '-=0.2');
    };

    if (!isOpen) return null;

    // Ensure displayText is always a string (Gemini may return objects/nested data)
    const rawText = precalculatedText;
    const displayText = (() => {
        if (!rawText) return null;
        if (typeof rawText === 'string') return rawText;
        // Convert object to readable paragraphs
        if (typeof rawText === 'object') {
            const parts: string[] = [];
            for (const [key, val] of Object.entries(rawText as Record<string, any>)) {
                if (typeof val === 'string') {
                    parts.push(val);
                } else if (typeof val === 'object' && val !== null) {
                    parts.push(JSON.stringify(val));
                }
            }
            return parts.join('\n\n');
        }
        return String(rawText);
    })();

    return (
        <div className="fixed inset-0 z-[10005] flex items-center justify-center p-4 sm:p-6" style={{ pointerEvents: 'auto' }}>
            <div
                ref={overlayRef}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={handleClose}
            ></div>

            <div
                ref={modalRef}
                className="relative bg-white/95 backdrop-blur-xl w-full max-w-2xl rounded-[2.5rem] p-8 md:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-white max-h-[85vh] flex flex-col overflow-hidden"
            >
                {/* Header elements */}
                <div className="flex justify-between items-start mb-6 shrink-0 gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-500 shadow-inner">
                            <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                        </div>
                        <div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-1">
                                Significado Profundo
                            </h3>
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none">
                                {title} <span className="text-slate-400 font-light ml-2">{num}</span>
                            </h2>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {onRegenerate && (
                            <button
                                onClick={onRegenerate}
                                disabled={isLoading}
                                className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-indigo-500 hover:bg-slate-100 transition-colors disabled:opacity-50"
                                title="Regenerar explicación con IA"
                            >
                                <span className={`material-symbols-outlined text-[20px] ${isLoading ? 'animate-spin' : ''}`}>sync</span>
                            </button>
                        )}
                        <button
                            onClick={handleClose}
                            className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[20px]">close</span>
                        </button>
                    </div>
                </div>

                {/* Content area */}
                <div
                    ref={contentRef}
                    className="flex-1 overflow-y-auto pr-2 custom-scrollbar styling-text relative"
                >
                    {isLoading ? (
                        <div className="py-12 text-center text-slate-400 font-medium flex flex-col items-center">
                            <span className="material-symbols-outlined text-4xl mb-4 animate-spin-slow opacity-60 text-indigo-500">sync</span>
                            <p className="text-sm">Generando análisis detallado con IA...</p>
                        </div>
                    ) : !displayText ? (
                        <div className="py-8 text-center text-slate-400 font-medium">
                            <span className="material-symbols-outlined text-4xl mb-2 opacity-50">hourglass_empty</span>
                            <p>No se pudo generar la explicación para este concepto.</p>
                        </div>
                    ) : (
                        <div className="text-slate-600 space-y-3 text-[15px] leading-relaxed font-medium">
                            {(() => {
                                // Inline renderer for **bold** segments
                                const renderInline = (text: string, keyPrefix: string) => {
                                    const parts = text.split(/(\*\*[^*]+\*\*)/g);
                                    return parts.map((part, i) => {
                                        if (part.startsWith('**') && part.endsWith('**')) {
                                            return <strong key={`${keyPrefix}-b-${i}`} className="font-bold text-slate-800">{part.slice(2, -2)}</strong>;
                                        }
                                        return <span key={`${keyPrefix}-t-${i}`}>{part}</span>;
                                    });
                                };

                                const lines = displayText.split('\n');
                                const elements: React.ReactNode[] = [];
                                let bulletBuffer: string[] = [];

                                const flushBullets = (idx: number) => {
                                    if (bulletBuffer.length === 0) return;
                                    elements.push(
                                        <ul key={`ul-${idx}`} className="list-disc list-outside pl-5 space-y-2 my-3 marker:text-indigo-400">
                                            {bulletBuffer.map((b, i) => (
                                                <li key={`li-${idx}-${i}`} className="text-slate-600">{renderInline(b, `li-${idx}-${i}`)}</li>
                                            ))}
                                        </ul>
                                    );
                                    bulletBuffer = [];
                                };

                                lines.forEach((rawLine, idx) => {
                                    const line = rawLine.trimEnd();
                                    const trimmed = line.trim();

                                    // Bullet item
                                    if (/^[-*]\s+/.test(trimmed)) {
                                        bulletBuffer.push(trimmed.replace(/^[-*]\s+/, ''));
                                        return;
                                    }
                                    flushBullets(idx);

                                    if (!trimmed) return;

                                    // ### subheader
                                    if (trimmed.startsWith('### ')) {
                                        elements.push(
                                            <h5 key={idx} className="text-sm font-bold text-slate-700 mt-5 mb-1">
                                                {renderInline(trimmed.slice(4), `h5-${idx}`)}
                                            </h5>
                                        );
                                        return;
                                    }
                                    // ## header
                                    if (trimmed.startsWith('## ')) {
                                        elements.push(
                                            <h4 key={idx} className="text-[11px] font-black uppercase tracking-[0.18em] text-indigo-600 mt-7 mb-2">
                                                {renderInline(trimmed.slice(3), `h4-${idx}`)}
                                            </h4>
                                        );
                                        return;
                                    }
                                    // # header
                                    if (trimmed.startsWith('# ')) {
                                        elements.push(
                                            <h3 key={idx} className="text-base font-black text-slate-800 mt-6 mb-2">
                                                {renderInline(trimmed.slice(2), `h3-${idx}`)}
                                            </h3>
                                        );
                                        return;
                                    }
                                    // ALL CAPS short line treated as header (legacy)
                                    if (trimmed === trimmed.toUpperCase() && trimmed.length < 50 && /[A-ZÁÉÍÓÚÑ]/.test(trimmed)) {
                                        elements.push(
                                            <h4 key={idx} className="text-[11px] font-black uppercase tracking-[0.18em] text-indigo-600 mt-6 mb-2">
                                                {trimmed}
                                            </h4>
                                        );
                                        return;
                                    }

                                    elements.push(
                                        <p key={idx}>{renderInline(trimmed, `p-${idx}`)}</p>
                                    );
                                });

                                flushBullets(lines.length);
                                return elements;
                            })()}

                            {onCoaching && (
                                <div className="mt-8 pt-6 border-t border-slate-200">
                                    <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-3">Siguiente paso</p>
                                    <button
                                        onClick={() => { onCoaching(); }}
                                        disabled={coachingLoading}
                                        className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
                                    >
                                        {coachingLoading ? (
                                            <><span className="material-symbols-outlined text-base animate-spin">sync</span> Generando sesión de coaching...</>
                                        ) : (
                                            <><span className="material-symbols-outlined text-base">self_improvement</span> Iniciar Sesión de Coaching Numerológico</>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

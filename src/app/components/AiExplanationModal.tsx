'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface ExplanationModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    num: string | number;
    precalculatedText?: string;
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

export default function AiExplanationModal({ isOpen, onClose, title, num, precalculatedText }: ExplanationModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [generatedText, setGeneratedText] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        setGeneratedText(null);
        setLoading(false);

        // Animation in
        gsap.set(overlayRef.current, { autoAlpha: 0 });
        gsap.set(modalRef.current, { y: 30, scale: 0.95, autoAlpha: 0 });

        const tl = gsap.timeline();
        tl.to(overlayRef.current, { autoAlpha: 1, duration: 0.3, ease: 'power2.out' })
            .to(modalRef.current, { y: 0, scale: 1, autoAlpha: 1, duration: 0.4, ease: 'back.out(1.5)' }, '-=0.1');

        // If no precalculated text, fetch from AI on demand
        if (!precalculatedText && title && num) {
            const cacheKey = `ai_section_${title}_${num}`;
            const cached = sessionStorage.getItem(cacheKey);
            if (cached) {
                setGeneratedText(cached);
            } else {
                setLoading(true);
                // Get full context from sessionStorage
                let contextStr = '';
                let nombre = '';
                let sectionData: any = null;
                try {
                    const storedResult = sessionStorage.getItem('numerologyResult');
                    if (storedResult) {
                        const d = JSON.parse(storedResult);
                        const pp = d.primeraParte;
                        const cdv = pp?.fechaNacimiento?.caminoDeVida?.label || '';
                        const alma = pp?.calculoAlma?.label || '';
                        const mision = pp?.calculoMision?.label || '';
                        const pers = pp?.calculoPersonalidad?.label || '';
                        const viLabels = pp?.vibracionInterna?.map((v: any) => `${v.word}=${v.reduction?.label || v.reduction?.digit}`).join(', ') || '';
                        contextStr = `Camino de Vida: ${cdv}, Alma: ${alma}, Personalidad: ${pers}, Misión: ${mision}, Vibraciones Internas: ${viLabels}`;
                        nombre = d.nombreCompleto || '';
                        sectionData = buildSectionData(title, d);
                    }
                } catch { /* ignore */ }

                fetch('/api/explain', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ section: title, value: String(num), context: contextStr, nombre, sectionData })
                })
                    .then(res => res.json())
                    .then(result => {
                        if (result.explanation) {
                            setGeneratedText(result.explanation);
                            sessionStorage.setItem(cacheKey, result.explanation);
                        } else {
                            setGeneratedText('No se pudo generar la explicación. Intenta de nuevo.');
                        }
                    })
                    .catch(() => {
                        setGeneratedText('Error de conexión al generar la explicación.');
                    })
                    .finally(() => setLoading(false));
            }
        }
    }, [isOpen, title, num, precalculatedText]);

    const handleClose = () => {
        const tl = gsap.timeline({ onComplete: onClose });
        tl.to(modalRef.current, { y: 20, scale: 0.95, autoAlpha: 0, duration: 0.3, ease: 'power2.in' })
            .to(overlayRef.current, { autoAlpha: 0, duration: 0.2 }, '-=0.2');
    };

    if (!isOpen) return null;

    // Ensure displayText is always a string (Gemini may return objects/nested data)
    const rawText = precalculatedText || generatedText;
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
                    <button
                        onClick={handleClose}
                        className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>

                {/* Content area */}
                <div
                    ref={contentRef}
                    className="flex-1 overflow-y-auto pr-2 custom-scrollbar styling-text relative"
                >
                    {loading ? (
                        <div className="py-12 text-center text-slate-400 font-medium">
                            <span className="material-symbols-outlined text-4xl mb-3 animate-spin-slow opacity-60">auto_awesome</span>
                            <p className="text-sm">Generando análisis detallado con IA...</p>
                        </div>
                    ) : !displayText ? (
                        <div className="py-8 text-center text-slate-400 font-medium">
                            <span className="material-symbols-outlined text-4xl mb-2 opacity-50">hourglass_empty</span>
                            <p>No se pudo generar la explicación para este concepto.</p>
                        </div>
                    ) : (
                        <div className="text-slate-600 space-y-4 text-[15px] leading-relaxed font-medium">
                            {displayText.split('\n').map((paragraph, index) => {
                                if (!paragraph.trim()) return <br key={index} />;

                                // Make capitalized headers bold
                                const isHeader = paragraph === paragraph.toUpperCase() && paragraph.length < 50;
                                if (isHeader) {
                                    return <h4 key={index} className="text-xs font-black uppercase tracking-widest text-slate-800 mt-6 mb-2">{paragraph}</h4>;
                                }

                                return <p key={index}>{paragraph}</p>;
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

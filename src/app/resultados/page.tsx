'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import AiExplanationModal from '../components/AiExplanationModal';
import { buildDatosEstructurados } from '../../lib/buildDatosEstructurados';
import { buildAiMetricsPayload } from '@/lib/buildAiMetricsPayload';
import DiamanteCiclos from './DiamanteCiclos';
import EditableReportModal from '../components/EditableReportModal';
import { reducirANumeros } from '../../lib/numerology';

type NumerologyResult = any;

const CASAS_INFO: Record<number, { nombre: string; temas: string }> = {
    1: { nombre: 'El Rey', temas: 'Ego, identidad, figura paterna, liderazgo' },
    2: { nombre: 'La Reina', temas: 'Emociones, figura materna, pareja' },
    3: { nombre: 'El Príncipe', temas: 'Creatividad, niño interior, expresión' },
    4: { nombre: 'La Cocina', temas: 'Trabajo, cuerpo, raíces familiares' },
    5: { nombre: 'Sala de Guardia', temas: 'Libertad, cambio, sexualidad' },
    6: { nombre: 'Hab. del Amor', temas: 'Afectos, maternidad/paternidad' },
    7: { nombre: 'La Biblioteca', temas: 'Espiritualidad, conocimiento' },
    8: { nombre: 'Sala de Admin.', temas: 'Talentos, poder, realización' },
    9: { nombre: 'La Capilla', temas: 'Conciencia universal, servicio' },
};

const HABITANTES_INFO: Record<number, string> = {
    0: 'Aspecto kármico a desarrollar — gran potencial latente',
    1: 'Autonomía, liderazgo, dinamismo, impaciencia, orgullo',
    2: 'Sensibilidad, ternura, intuición, duda, inseguridad',
    3: 'Creatividad, alegría, comunicación, dispersión, necesidad de aprobación',
    4: 'Estructura, responsabilidad, disciplina, rigidez, miedos',
    5: 'Libertad, aventura, cambio, inestabilidad, rebeldía',
    6: 'Amor, servicio, armonía, vulnerabilidad, sacrificio',
    7: 'Sabiduría, perfección, introspección, aislamiento, soberbia',
    8: 'Poder, estrategia, realización, dominación, materialismo',
    9: 'Idealismo, humanismo, compasión, ilusión, desánimo',
};

/** Helper to display a numerology number, showing full chain */
function displayNum(n: any): string {
    if (n === null || n === undefined || n === '') return '-';
    if (typeof n === 'number' || typeof n === 'string') {
        const parsed = Number(n);
        if (!isNaN(parsed)) n = reducirANumeros(parsed);
    }
    if (!n || typeof n !== 'object') return String(n);
    if (n.label) return n.label;
    if (n.sequence && n.sequence.length > 1) {
        let lbl = n.sequence.join('/');
        if (n.isMaster) lbl += ' MAESTRO';
        if (n.isKarmic) lbl += ' KÁRMICO';
        return lbl;
    }
    if (n.isMaster) return `${n.masterValue}/${n.digit} MAESTRO`;
    if (n.isKarmic) return `${n.karmicValue}/${n.digit} KÁRMICO`;
    return String(n.digit ?? n);
}

function displayNumShort(n: any): string {
    if (!n) return '-';
    if (n.sequence && n.sequence.length > 1) return n.sequence.join('/');
    return String(n.digit);
}

/** Muestra solo el dígito reducido (sin cadena completa). Para casas: Año 30/58/87, Ind.Inc., Puentes */
function digitOnly(n: any): string | number {
    if (n === null || n === undefined) return '-';
    if (typeof n === 'object' && 'digit' in n) return n.digit;
    const v = Number(n);
    if (isNaN(v)) return '-';
    return v > 9 ? reducirANumeros(v).digit : v;
}

export default function ResultadosPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLElement>(null);
    const sidebarRef = useRef<HTMLElement>(null);
    const mainSectionRef = useRef<HTMLElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const [data, setData] = useState<NumerologyResult | null>(null);
    const [showingCards, setShowingCards] = useState(false);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
    const isTransitioning = useRef(false);
    const transitionDirection = useRef(1);
    const isFirstRender = useRef(true);

    const [explanations, setExplanations] = useState<Record<string, string>>({});
    const [analistaLoading, setAnalistaLoading] = useState(false);
    const [clienteLoading, setClienteLoading] = useState(false);
    const [clienteModalOpen, setClienteModalOpen] = useState(false);
    const [clienteReportText, setClienteReportText] = useState('');
    const [explanationState, setExplanationState] = useState<{ isOpen: boolean, title: string, num: string | number, text?: string, metricKey?: string, isLoading?: boolean }>({
        isOpen: false,
        title: '',
        num: '',
        text: undefined,
        metricKey: undefined,
        isLoading: false
    });

    const getMetricKeyFromTitle = (title: string, fallbackText?: string): string => {
        // Reverse mapping or hints from title
        const map: Record<string, string> = {
            'Vibración Interna': 'vibracion_interna',
            'Misión': 'mision',
            'Alma': 'alma',
            'Personalidad': 'personalidad',
            'Camino de Vida / Día de Nacimiento': 'camino_de_vida',
            'Número de Fuerza': 'fuerza',
            'Número de Sombra': 'sombra',
            'Conteo de Letras / Deudas Kármicas': 'letras_faltantes',
            'Subconsciente I': 'subconsciente_i',
            'Subconsciente O': 'subconsciente_o',
            'Inconsciente': 'inconsciente',
            'Día (Don/Talento)': 'talento',
            'Mes (Karma/Tensión)': 'karma_mes',
            'Año (Memoria de Vida Pasada)': 'pasado',
            'Ciclo de Vida Actual': 'ciclo_actual',
            'Análisis de Ciclos y Desafíos': 'ciclos_desafios',
            '1er Ciclo': 'ciclo_1',
            '2do Ciclo': 'ciclo_2',
            '3er Ciclo': 'ciclo_3',
            '4to Ciclo': 'ciclo_4',
            '1er Desafío': 'desafio_1',
            '2do Desafío': 'desafio_2',
            '3er Desafío': 'desafio_3',
            '4to Desafío': 'desafio_4',
            'Cuadro de las 9 Casas': 'casas_9',
            'Número de Equilibrio': 'equilibrio',
            'Regalo Divino': 'regalo_divino',
            'Planos Existenciales': 'planos_existenciales',
            'Herencia Familiar': 'herencia_familiar',
            'Evolución Familiar': 'evolucion_familiar',
            'Campo de Expresión': 'expresion_profesional',
            'Expresión Profesional': 'expresion_profesional',
            'Potencial Evolutivo': 'potencial_evolutivo',
            'Año Personal': 'anio_personal',
            'Mes Personal': 'mes_personal'
        };
        for (const [k, v] of Object.entries(map)) {
            if (title.includes(k)) return v;
        }
        // Hack: if we can't find it, we might check if 'fallbackText' has something unique or we return the title
        return title; 
    };

    const openExplanation = async (title: string, num: string | number, text?: string, forceRegenerate = false) => {
        if (num === 'Atención') {
            setExplanationState({ isOpen: true, title, num, text });
            return;
        }
        
        let metricKey = getMetricKeyFromTitle(title);

        if (!forceRegenerate && explanations[metricKey]) {
            setExplanationState({ isOpen: true, title, num, text: explanations[metricKey], metricKey });
            return;
        }

        // If text was explicitly provided (and we aren't regenerating), just show it
        if (!forceRegenerate && text && text !== '') {
            setExplanationState({ isOpen: true, title, num, text, metricKey });
            return;
        }

        setExplanationState({ isOpen: true, title, num, isLoading: true, metricKey });

        try {
            const storedPayload = sessionStorage.getItem('aiMetricsPayload');
            const payloadObj = storedPayload ? JSON.parse(storedPayload) : {};
            let numValue = payloadObj[metricKey];
            
            if (!numValue || numValue === '') numValue = num;

            // Special handling for full reports that need the entire dataset
            if (metricKey === 'resumen_analista' || title === 'Resumen Analista IA') {
                const dataStr = sessionStorage.getItem('numerologyResult');
                const res = await fetch('/api/full-report', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type: 'analista', dataStr })
                });

                if (res.ok) {
                    const data = await res.json();
                    sessionStorage.setItem('resumenAnalista', data.summary);
                    setExplanationState({ isOpen: true, title, num, text: data.summary, metricKey });
                } else {
                    setExplanationState({ isOpen: true, title, num, text: 'Error al generar la explicación.', metricKey });
                }
                return;
            }

            // Normal single card explanations
            const res = await fetch('/api/explanation/single', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: metricKey, numValue }),
            });

            if (res.ok) {
                const data = await res.json();
                
                setExplanations(prev => {
                    const newExps = { ...prev, [metricKey]: data.explanation };
                    sessionStorage.setItem('geminiExplanations', JSON.stringify(newExps));
                    return newExps;
                });
                
                setExplanationState({ isOpen: true, title, num, text: data.explanation, metricKey });
            } else {
                setExplanationState({ isOpen: true, title, num, text: 'Error al generar la explicación.', metricKey });
            }
        } catch (e) {
            setExplanationState({ isOpen: true, title, num, text: 'No se pudo conectar.', metricKey });
        }
    };

    const closeExplanation = () => {
        setExplanationState(prev => ({ ...prev, isOpen: false }));
    };

    const handleLinajeExplanation = async (linaje: any, forceRegenerate = false) => {
        const tipo: string = linaje.tipo || 'nombre';
        const palabra: string = linaje.nombre;
        const numStr = displayNum(linaje.reduccion);
        const title = `Linaje de ${palabra.charAt(0) + palabra.slice(1).toLowerCase()}`;
        const metricKey = `linaje_${palabra.toLowerCase()}`;

        if (!forceRegenerate && explanations[metricKey]) {
            setExplanationState({ isOpen: true, title, num: numStr, text: explanations[metricKey], metricKey });
            return;
        }

        setExplanationState({ isOpen: true, title, num: numStr, isLoading: true, metricKey });

        try {
            const res = await fetch('/api/explanation/single', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'linaje_individual', numValue: numStr, tipo, palabra }),
            });

            if (res.ok) {
                const resData = await res.json();
                setExplanations(prev => {
                    const newExps = { ...prev, [metricKey]: resData.explanation };
                    sessionStorage.setItem('geminiExplanations', JSON.stringify(newExps));
                    return newExps;
                });
                setExplanationState({ isOpen: true, title, num: numStr, text: resData.explanation, metricKey });
            } else {
                setExplanationState({ isOpen: true, title, num: numStr, text: 'Error al generar la explicación.', metricKey });
            }
        } catch (e) {
            setExplanationState({ isOpen: true, title, num: numStr, text: 'No se pudo conectar.', metricKey });
        }
    };

    const handleRegenerateCliente = async () => {
        setClienteLoading(true);
        try {
            const dataStr = sessionStorage.getItem('numerologyResult');
            const storedExplanations = sessionStorage.getItem('geminiExplanations');
            const explicaciones = storedExplanations ? JSON.parse(storedExplanations) : {};
            const res = await fetch('/api/full-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'cliente', dataStr, explicaciones })
            });
            if (res.ok) {
                const data = await res.json();
                sessionStorage.setItem('clientReportEdited', data.summary);
                setClienteReportText(data.summary);
            } else {
                alert('Ocurrió un error al regenerar el reporte de cliente.');
            }
        } catch(e) {
            alert('Error al conectar para regenerar el reporte de cliente.');
        } finally {
            setClienteLoading(false);
        }
    };

    // Total de cartas estático, mostramos Sistema Familiar aunque caiga en fallback
    const totalCards = 15;

    // Agregar estilos para las partículas flotantes
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes float1 {
                0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
                50% { transform: translate(20px, -30px) scale(1.1); opacity: 0.6; }
            }
            @keyframes float2 {
                0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.4; }
                50% { transform: translate(-30px, 20px) scale(0.9); opacity: 0.7; }
            }
            @keyframes float3 {
                0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.5; }
                50% { transform: translate(25px, 25px) scale(1.05); opacity: 0.8; }
            }
        `;
        document.head.appendChild(style);
        return () => {
            document.head.removeChild(style);
        };
    }, []);

    useEffect(() => {
        // Read numerology results from sessionStorage
        const stored = sessionStorage.getItem('numerologyResult');
        const storedExplanations = sessionStorage.getItem('geminiExplanations');
        const storedCliente = sessionStorage.getItem('clientReportEdited');

        if (storedExplanations) {
            try {
                const parsed = JSON.parse(storedExplanations);
                if (parsed && typeof parsed === 'object') {
                    setExplanations(parsed);
                }
            } catch {
                // Ignore parsing errors for explanations
            }
        }

        if (storedCliente) setClienteReportText(storedCliente);

        if (stored) {
            try {
                const parsedData = JSON.parse(stored);
                const metricsPayload = buildAiMetricsPayload(parsedData);
                sessionStorage.setItem('aiMetricsPayload', JSON.stringify(metricsPayload));
                setData(parsedData);
                setShowingCards(true);
            } catch {
                // Invalid data, ignore
            }
        }
    }, []);

    // Entrada o transición dinámica de cada tarjeta
    useEffect(() => {
        if (!showingCards || !data) return;
        const currentCard = cardRefs.current[currentCardIndex];
        if (currentCard) {
            let durationStart = 0.5;
            let delayStart = 0;

            if (isFirstRender.current) {
                isFirstRender.current = false;
                durationStart = 0.85;
                delayStart = 0.05;
            }

            // Solo hacemos un Fade In puro
            gsap.set(currentCard, { xPercent: -50, yPercent: -50, y: 0, opacity: 0, scale: 1 });
            gsap.to(currentCard, {
                opacity: 1,
                duration: durationStart,
                delay: delayStart,
                ease: 'power2.out',
            });
        }
    }, [currentCardIndex, showingCards, data]);

    const clearAllCards = () => {
        cardRefs.current.forEach(card => {
            if (card) gsap.set(card, { clearProps: 'all' });
        });
    };

    const finishPresentation = () => {
        const overlay = overlayRef.current;
        const activeCard = cardRefs.current[currentCardIndex];
        const targets = [overlay, activeCard].filter(Boolean);
        gsap.to(targets, {
            opacity: 0,
            scale: 0.96,
            duration: 0.45,
            ease: 'power2.inOut',
            onComplete: () => {
                clearAllCards();
                setShowingCards(false);
                animateFinalLayout();
                isTransitioning.current = false;
            }
        });
    };

    const handleNextCard = () => {
        if (isTransitioning.current) return;
        isTransitioning.current = true;
        transitionDirection.current = 1;

        const currentCard = cardRefs.current[currentCardIndex];

        if (currentCardIndex >= totalCards - 1) {
            finishPresentation();
        } else {
            if (currentCard) {
                gsap.to(currentCard, {
                    opacity: 0,
                    duration: 0.35,
                    ease: 'power2.inOut',
                    onComplete: () => {
                        gsap.set(currentCard, { y: 0, opacity: 0, scale: 1 });
                        setCurrentCardIndex(prev => prev + 1);
                        isTransitioning.current = false;
                    }
                });
            } else {
                setCurrentCardIndex(prev => prev + 1);
                isTransitioning.current = false;
            }
        }
    };

    const handlePreviousCard = () => {
        if (isTransitioning.current || currentCardIndex === 0) return;
        isTransitioning.current = true;
        transitionDirection.current = -1;

        const currentCard = cardRefs.current[currentCardIndex];

        if (currentCard) {
            gsap.to(currentCard, {
                opacity: 0,
                duration: 0.35,
                ease: 'power2.inOut',
                onComplete: () => {
                    gsap.set(currentCard, { y: 0, opacity: 0, scale: 1 });
                    setCurrentCardIndex(prev => prev - 1);
                    isTransitioning.current = false;
                }
            });
        }
    };

    const handleSkipAnimation = () => {
        if (isTransitioning.current) return;
        isTransitioning.current = true;
        const overlay = overlayRef.current;
        gsap.to(overlay, {
            opacity: 0,
            duration: 0.4,
            ease: 'power2.out',
            onComplete: () => {
                clearAllCards();
                setShowingCards(false);
                animateFinalLayout();
                isTransitioning.current = false;
            }
        });
    };

    const animateFinalLayout = () => {
        const header = headerRef.current;
        const sidebar = sidebarRef.current;
        const gridItems = containerRef.current ? Array.from(containerRef.current.children) as HTMLElement[] : [];

        gsap.set([header, sidebar, ...gridItems].filter(Boolean), {
            autoAlpha: 0,
            y: 22,
        });

        const tl = gsap.timeline({ defaults: { ease: 'expo.out', duration: 0.7 } });

        tl.to(header, { autoAlpha: 1, y: 0 });

        if (gridItems.length > 0) {
            tl.to(gridItems, {
                autoAlpha: 1,
                y: 0,
                stagger: 0.07,
                clearProps: 'transform',
            }, '-=0.5');
        }

        tl.to(sidebar, { autoAlpha: 1, y: 0 }, '-=0.5');
    };

    // Section order for the bento grid layout per mejoras_ui_tercera_ronda.md §6
    const sectionOrder: Record<number, number> = {
        0: 0,   // Vibración Interna
        1: 1,   // Misión
        2: 2,   // Alma
        3: 3,   // Camino de Vida
        4: 4,   // Personalidad
        11: 5,  // Cuadro del Nombre Completo
        12: 6,  // Cuadro de Fecha de Nacimiento
        8: 7,   // Atributos de la Fecha (Talento, Karma, Memoria)
        13: 8,  // Ciclos de Realización y Desafíos
        5: 9,   // Frecuencias Potenciadoras
        6: 10,  // Planos Existenciales
        7: 11,  // Tránsito Actual (Año/Mes Personal)
        14: 13, // Cuadro de las 9 Casas
        9: 12,  // Conteo de Letras / Deudas Kármicas
        10: 14, // Sistema Familiar
    };

    const getCardStyle = (cardIndex: number, wide = false): React.CSSProperties => {
        if (!showingCards) return { opacity: 1, order: sectionOrder[cardIndex] ?? cardIndex }; // Forzamos visibilidad luego de que GSAP lo revele
        if (currentCardIndex === cardIndex) {
            return {
                position: 'fixed',
                top: '44%', // Ligeramente más arriba del centro para dar espacio constante a los controles 
                left: '50%',
                // NO se declara transform acá, GSAP se lo inyecta vía xPercent/yPercent para evitar baking de píxeles
                width: cardIndex === 10 ? '90vw' : '85vw',
                maxWidth: cardIndex === 10 ? '1000px' : (cardIndex === 5 ? '700px' : (wide ? '650px' : '500px')),
                maxHeight: '68vh', // Estricto para pantallas delgadas
                overflowY: 'auto', // Todas pueden scrollear suavemente si es necesario
                zIndex: 9999,
                opacity: 0,
                display: 'flex',
                flexDirection: 'column',
            };
        }
        if (currentCardIndex > cardIndex) {
            return {
                display: 'none' // Evita superposiciones invisibles en el DOM
            };
        }
        return { opacity: 0, display: 'none' };
    };

    useEffect(() => {
        if (!showingCards && data) {
            animateFinalLayout();
        }
    }, [showingCards, data]);

    const formatDate = (dateStr: string) => {
        const [year, month, day] = dateStr.split('-');
        const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        return `${parseInt(day)} de ${months[parseInt(month) - 1]}, ${year}`;
    };

    if (!data) {
        return (
            <div className="flex items-center justify-center h-full w-full">
                <div className="text-center space-y-4">
                    <span className="material-symbols-outlined text-5xl text-slate-300">hourglass_empty</span>
                    <p className="text-sm text-slate-400 uppercase tracking-widest font-bold">Cargando resultados...</p>
                </div>
            </div>
        );
    }



    return (
        <div className="flex flex-col xl:flex-row h-full w-full overflow-hidden">
            {showingCards && (
                <>
                    <div
                        ref={overlayRef}
                        className="fixed inset-0 bg-white/60 backdrop-blur-md"
                        style={{ zIndex: 9998 }}
                    ></div>
                    <div className="fixed top-6 md:top-8 left-1/2 transform -translate-x-1/2 flex gap-1.5 md:gap-2 pointer-events-none" style={{ zIndex: 10001 }}>
                        {Array.from({ length: totalCards }).map((_, i) => (
                            <div
                                key={i}
                                className={`h-1.5 rounded-full transition-all duration-300 ${i === currentCardIndex ? 'w-10 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' :
                                    i < currentCardIndex ? 'w-4 bg-indigo-300' : 'w-4 bg-slate-200'
                                    }`}
                            />
                        ))}
                    </div>

                    <div className="fixed bottom-6 md:bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col md:flex-row items-center gap-4 w-[90%] md:w-auto justify-center" style={{ zIndex: 10001 }}>
                        {currentCardIndex > 0 && (
                            <button
                                onClick={handlePreviousCard}
                                className="backdrop-blur-xl text-slate-800 px-6 py-4 rounded-full font-bold text-sm tracking-wider uppercase flex items-center gap-3 hover:scale-105 active:scale-95 transition-all duration-300 w-full md:w-auto justify-center"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(200,200,200,0.5) 40%, rgba(220,220,220,0.4) 70%, rgba(255,255,255,0.6) 100%)',
                                    border: '1px solid rgba(255,255,255,0.8)',
                                    boxShadow: '0 8px 32px rgba(100,100,100,0.1), inset 0 1.5px 0 rgba(255,255,255,0.9)',
                                }}
                            >
                                <span className="material-symbols-outlined text-xl">
                                    arrow_back
                                </span>
                                Atrás
                            </button>
                        )}
                        <button
                            onClick={handleNextCard}
                            className="backdrop-blur-xl text-slate-800 px-8 py-4 rounded-full font-bold text-sm tracking-wider uppercase flex items-center gap-3 hover:scale-105 active:scale-95 transition-all duration-300 w-full md:w-auto justify-center"
                            style={{
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(190,210,255,0.5) 40%, rgba(220,190,255,0.4) 70%, rgba(255,255,255,0.6) 100%)',
                                border: '1px solid rgba(255,255,255,0.8)',
                                boxShadow: '0 8px 32px rgba(120,100,200,0.18), inset 0 1.5px 0 rgba(255,255,255,0.9)',
                            }}
                        >
                            {currentCardIndex >= totalCards - 1 ? 'Finalizar Recorrido' : 'Siguiente Resultado'}
                            <span className="material-symbols-outlined text-xl">
                                {currentCardIndex >= totalCards - 1 ? 'check_circle' : 'arrow_forward'}
                            </span>
                        </button>
                        <button
                            onClick={handleSkipAnimation}
                            className="text-slate-500 px-6 py-3 rounded-full font-bold text-xs tracking-wider uppercase flex items-center gap-2 hover:bg-white/40 transition-all duration-300"
                        >
                            Ver Todo
                        </button>
                    </div>
                </>
            )}

            <section ref={mainSectionRef} className={`flex-1 p-6 lg:p-10 ${showingCards ? 'overflow-hidden' : 'overflow-y-auto'}`} id="results-container">
                <header ref={headerRef} className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6 opacity-0">
                    <div>
                        <h1 className="text-xs uppercase tracking-[0.5em] font-bold text-slate-500 mb-1">Resultado de Análisis</h1>
                        <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight">Síntesis Energética</h2>
                    </div>
                    <div className="flex items-center gap-6 self-end lg:self-auto">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold">{data.nombreCompleto}</p>
                            <p className="text-xs text-slate-500">{formatDate(data.fechaNacimiento)}</p>
                        </div>
                        <button
                            onClick={() => {
                                let val = sessionStorage.getItem('resumenAnalista');
                                const storedGlobal = sessionStorage.getItem('geminiExplanations');
                                if (!val && storedGlobal) {
                                    try {
                                        val = JSON.parse(storedGlobal).resumen_analista;
                                    } catch {}
                                }
                                if (val) {
                                    openExplanation('Resumen Analista IA', 'Uso Profesional', val);
                                } else {
                                    openExplanation('Resumen Analista IA', 'Uso Profesional'); // will trigger generic loading & /api/full-report fetch
                                }
                            }}
                            className={`bg-indigo-600 text-white px-4 py-3 md:px-6 md:py-3 rounded-full font-bold text-[10px] md:text-xs tracking-[0.1em] md:tracking-[0.15em] uppercase flex items-center gap-2 hover:scale-[1.05] active:scale-[0.95] transition-all shadow-xl group`}
                            title="Ver resumen técnico exclusivo para Analista"
                        >
                            Resumen Analista
                            <span className="material-symbols-outlined text-sm md:text-base group-hover:rotate-12 transition-transform">psychology</span>
                        </button>
                        <button
                            onClick={async () => {
                                let val = clienteReportText || sessionStorage.getItem('clientReportEdited');
                                const storedGlobal = sessionStorage.getItem('geminiExplanations');
                                if (!val && storedGlobal) {
                                    try {
                                        val = JSON.parse(storedGlobal).resumen_cliente;
                                    } catch {}
                                }
                                if (val) {
                                    if (!clienteReportText) setClienteReportText(val);
                                    setClienteModalOpen(true);
                                } else {
                                    // Generate client report on the fly 
                                    setClienteLoading(true);
                                    try {
                                        const dataStr = sessionStorage.getItem('numerologyResult');
                                        const res = await fetch('/api/full-report', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ type: 'cliente', dataStr })
                                        });
                                        if (res.ok) {
                                            const data = await res.json();
                                            sessionStorage.setItem('clientReportEdited', data.summary);
                                            setClienteReportText(data.summary);
                                            setClienteModalOpen(true);
                                        } else {
                                            alert('Ocurrió un error al procesar el reporte de cliente.');
                                        }
                                    } catch(e) {
                                        alert('Error al conectar para generar el reporte de cliente.');
                                    } finally {
                                        setClienteLoading(false);
                                    }
                                }
                            }}
                            className={`bg-purple-600 text-white px-4 py-3 md:px-6 md:py-3 rounded-full font-bold text-[10px] md:text-xs tracking-[0.1em] md:tracking-[0.15em] uppercase flex items-center gap-2 hover:scale-[1.05] active:scale-[0.95] transition-all shadow-xl group ${clienteLoading ? 'opacity-70 pointer-events-none' : ''}`}
                            title="Ver o editar reporte fluido para el Cliente"
                        >
                            {clienteLoading ? 'Generando...' : 'Reporte Cliente'}
                            <span className={`material-symbols-outlined text-sm md:text-base group-hover:rotate-12 transition-transform ${clienteLoading ? 'animate-spin' : ''}`}>
                                {clienteLoading ? 'sync' : 'edit_document'}
                            </span>
                        </button>
                        <Link href="/exportar" className="bg-black-accent text-white px-6 py-3 md:px-8 md:py-4 rounded-full font-bold text-[10px] md:text-xs tracking-[0.2em] uppercase flex items-center gap-3 hover:scale-[1.05] active:scale-[0.95] transition-all shadow-xl group">
                            Previsualizar PDF
                            <span className="material-symbols-outlined text-base md:text-xl group-hover:translate-x-1 transition-transform">picture_as_pdf</span>
                        </Link>
                    </div>
                </header>

                <div ref={containerRef} className="bento-grid" style={{
                    // Cuando mostramos las tarjetas en presentación, escondemos todo del grid normal que no sea el actual
                    opacity: showingCards ? 1 : ''
                }}>
                    {/* 0. Vibración Interna */}
                    <div
                        ref={(el) => { cardRefs.current[0] = el }}
                        className="col-span-4 md:col-span-2 row-span-2 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-[3rem] p-10 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300 hover:-translate-y-2 shadow-xl hover:shadow-2xl"
                        style={getCardStyle(0)}
                    >
                        <button
                            onClick={(e) => { e.stopPropagation(); openExplanation('Vibración Interna', 'Múltiples Nombres', explanations['vibracion_interna']); }}
                            className="absolute top-6 right-6 bg-white/50 hover:bg-white text-indigo-500 rounded-full p-2 transition-colors shadow-sm z-20 group"
                            title="Ver Significado Profundo"
                        >
                            <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                        </button>
                        <div className="absolute inset-0 sacred-geo-bg opacity-40"></div>
                        <div className="relative z-10 text-center flex flex-col items-center justify-center w-full">
                            <h3 className="text-sm font-extrabold uppercase tracking-widest mb-6 md:mb-10 text-slate-600">Vibración Interna</h3>
                            
                            {/* Nombres en paralelo */}
                            <div className="flex flex-wrap items-start justify-center gap-8 md:gap-12 w-full mb-8">
                                {(data?.primeraParte?.vibracionInterna || []).map((v: any, idx: number) => (
                                    <div key={idx} className="flex flex-col items-center">
                                        <div className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-2 truncate max-w-[120px]">
                                            {v.word}
                                        </div>
                                        <div className="relative flex flex-col items-center">
                                            {/* Círculo decorativo pequeño detrás */}
                                            <div className="absolute inset-0 scale-150 opacity-10">
                                                <svg viewBox="0 0 100 100" className="w-full h-full text-indigo-500 animate-spin-slow">
                                                    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
                                                </svg>
                                            </div>
                                            
                                            <span className="text-2xl font-bold text-slate-400 mb-1">
                                                {v.reduction?.sequence?.join('/') || v.reduction?.digit}
                                            </span>
                                            <span className="text-6xl md:text-7xl font-thin tracking-tighter text-black-accent relative">
                                                {v.reduction?.digit}
                                                {v.reduction?.isMaster && (
                                                    <span className="absolute -top-2 -right-4 text-amber-500/40 text-2xl material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                                                )}
                                                {v.reduction?.isKarmic && (
                                                    <span className="absolute -top-2 -right-4 text-rose-500/40 text-2xl material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <p className="text-dark-gray text-[10px] md:text-xs leading-relaxed max-w-xs mx-auto font-medium text-slate-500 italic">
                                Resultados individuales por nombre de pila
                            </p>
                        </div>
                    </div>

                    {/* 1. Misión */}
                    <div
                        ref={(el) => { cardRefs.current[1] = el }}
                        className="col-span-2 md:col-span-1 row-span-1 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-[2rem] p-6 lg:p-8 flex flex-col justify-between soft-relief transition-transform duration-300 hover:-translate-y-2 hover:shadow-lg relative"
                        style={getCardStyle(1)}
                    >
                        <button
                            onClick={(e) => { e.stopPropagation(); openExplanation('Misión', displayNum(data?.primeraParte?.calculoMision), explanations['mision']); }}
                            className="absolute top-4 right-4 bg-white/50 hover:bg-white text-teal-600 rounded-full p-1.5 transition-colors shadow-sm z-20 group"
                            title="Ver Significado Profundo"
                        >
                            <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                        </button>
                        <div>
                            <span className="material-symbols-outlined text-teal-600 mb-4 bg-white/60 p-2 rounded-xl">psychology</span>
                            <h4 className="text-[10px] font-black text-teal-900 uppercase tracking-widest">Misión</h4>
                        </div>
                        <div>
                            <div className="flex flex-col gap-1 mb-1">
                                <span className="text-4xl lg:text-5xl font-light text-teal-950">{displayNum(data?.primeraParte?.calculoMision)}</span>
                                {data?.primeraParte?.misionEspeciales?.map((esp: any, i: number) => (
                                    <div key={i} className={`text-[10px] px-2 py-0.5 rounded-full font-bold w-fit ${esp.isMaster ? 'bg-amber-100/50 text-amber-600' : 'bg-red-100/50 text-red-600'}`}>
                                        También: {displayNumShort(esp)} {esp.isMaster ? 'MAESTRO' : 'KÁRMICO'}
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-teal-900/70 font-semibold leading-snug">Propósito central.</p>
                        </div>
                    </div>

                    {/* 2. Alma */}
                    <div
                        ref={(el) => { cardRefs.current[2] = el }}
                        className="col-span-2 md:col-span-1 row-span-1 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-[2rem] p-6 lg:p-8 flex flex-col justify-between soft-relief transition-transform duration-300 hover:-translate-y-2 hover:shadow-lg relative"
                        style={getCardStyle(2)}
                    >
                        <button
                            onClick={(e) => { e.stopPropagation(); openExplanation('Alma', displayNum(data?.primeraParte?.calculoAlma), explanations['alma']); }}
                            className="absolute top-4 right-4 bg-white/50 hover:bg-white text-indigo-600 rounded-full p-1.5 transition-colors shadow-sm z-20 group"
                            title="Ver Significado Profundo"
                        >
                            <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                        </button>
                        <div>
                            <span className="material-symbols-outlined text-indigo-600 mb-4 bg-white/60 p-2 rounded-xl">favorite</span>
                            <h4 className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">Alma</h4>
                        </div>
                        <div>
                            <div className="flex items-baseline gap-2 flex-wrap mb-1">
                                <span className="text-4xl lg:text-5xl font-light text-indigo-950">{displayNum(data?.primeraParte?.calculoAlma)}</span>
                                {data?.primeraParte?.almaAlternative?.isKarmic && (
                                    <span className="text-[10px] bg-red-100/50 text-red-600 px-2 py-0.5 rounded-full font-bold">Alt: {displayNumShort(data?.primeraParte?.almaAlternative)} KÁRMICO</span>
                                )}
                                {data?.primeraParte?.almaAlternative?.isMaster && (
                                    <span className="text-[10px] bg-amber-100/50 text-amber-600 px-2 py-0.5 rounded-full font-bold">Alt: {displayNumShort(data?.primeraParte?.almaAlternative)} MAESTRO</span>
                                )}
                            </div>
                            <p className="text-xs text-indigo-900/70 font-semibold leading-snug">Deseo interno.</p>
                        </div>
                    </div>

                    {/* 3. Camino de Vida */}
                    <div
                        ref={(el) => { cardRefs.current[3] = el }}
                        className="col-span-2 md:col-span-1 row-span-1 bg-gradient-to-br from-orange-50 to-amber-50 rounded-[2rem] p-6 lg:p-8 flex flex-col justify-between soft-relief transition-transform duration-300 hover:-translate-y-2 hover:shadow-lg relative"
                        style={getCardStyle(3)}
                    >
                        <button
                            onClick={(e) => { e.stopPropagation(); openExplanation('Camino de Vida', displayNum(data?.primeraParte?.fechaNacimiento?.caminoDeVida), explanations['camino_de_vida']); }}
                            className="absolute top-4 right-4 bg-white/50 hover:bg-white text-orange-600 rounded-full p-1.5 transition-colors shadow-sm z-20 group"
                            title="Ver Significado Profundo"
                        >
                            <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                        </button>
                        <div>
                            <span className="material-symbols-outlined text-orange-600 mb-4 bg-white/60 p-2 rounded-xl">timeline</span>
                            <h4 className="text-[10px] font-black text-orange-900 uppercase tracking-widest">Camino de Vida</h4>
                        </div>
                        <div>
                            <div className="text-4xl lg:text-5xl font-light mb-1 text-orange-950">{displayNum(data?.primeraParte?.fechaNacimiento?.caminoDeVida)}</div>
                            <p className="text-xs text-orange-900/70 font-semibold leading-snug">Sendero principal.</p>
                        </div>
                    </div>

                    {/* 4. Personalidad */}
                    <div
                        ref={(el) => { cardRefs.current[4] = el }}
                        className="col-span-2 md:col-span-1 row-span-1 bg-gradient-to-br from-rose-50 to-pink-50 rounded-[2rem] p-6 lg:p-8 flex flex-col justify-between soft-relief transition-transform duration-300 hover:-translate-y-2 hover:shadow-lg relative"
                        style={getCardStyle(4)}
                    >
                        <button
                            onClick={(e) => { e.stopPropagation(); openExplanation('Personalidad', displayNum(data?.primeraParte?.calculoPersonalidad), explanations['personalidad']); }}
                            className="absolute top-4 right-4 bg-white/50 hover:bg-white text-rose-600 rounded-full p-1.5 transition-colors shadow-sm z-20 group"
                            title="Ver Significado Profundo"
                        >
                            <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                        </button>
                        <div>
                            <span className="material-symbols-outlined text-rose-600 mb-4 bg-white/60 p-2 rounded-xl">wb_sunny</span>
                            <h4 className="text-[10px] font-black text-rose-900 uppercase tracking-widest">Personalidad</h4>
                        </div>
                        <div>
                            <div className="flex items-baseline gap-2 flex-wrap mb-1">
                                <span className="text-4xl lg:text-5xl font-light text-rose-950">{displayNum(data?.primeraParte?.calculoPersonalidad)}</span>
                                {data?.primeraParte?.personalidadAlternative?.isKarmic && (
                                    <span className="text-[10px] bg-red-100/50 text-red-600 px-2 py-0.5 rounded-full font-bold">Alt: {displayNumShort(data?.primeraParte?.personalidadAlternative)} KÁRMICO</span>
                                )}
                                {data?.primeraParte?.personalidadAlternative?.isMaster && (
                                    <span className="text-[10px] bg-amber-100/50 text-amber-600 px-2 py-0.5 rounded-full font-bold">Alt: {displayNumShort(data?.primeraParte?.personalidadAlternative)} MAESTRO</span>
                                )}
                            </div>
                            <p className="text-xs text-rose-900/70 font-semibold leading-snug">Percepción externa.</p>
                        </div>
                    </div>

                    {/* 5. Potenciadores y Atributos - Reemplaza Diamante */}
                    <div
                        ref={(el) => { cardRefs.current[5] = el }}
                        className="col-span-4 md:col-span-2 row-span-2 bg-white rounded-[3rem] p-8 lg:p-10 border border-slate-100 flex flex-col transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl relative overflow-hidden"
                        style={getCardStyle(5, true)}
                    >
                        <div className="absolute -right-10 -top-10 text-slate-50 opacity-50">
                            <span className="material-symbols-outlined text-[200px]">bolt</span>
                        </div>
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2 relative z-10 text-slate-800">
                            <span className="material-symbols-outlined text-amber-500">battery_charging_full</span>
                            Frecuencias Potenciadoras
                        </h3>
                        <div className="grid grid-cols-2 gap-4 relative z-10">
                            <div className="bg-slate-50 rounded-2xl p-4 flex flex-col gap-1 border border-slate-100/50 relative group">
                                <button onClick={(e) => { e.stopPropagation(); openExplanation('Número de Fuerza', displayNum(data?.primeraParte?.potenciadores?.numeroDeFuerza), explanations['fuerza']); }} className="absolute top-2 right-2 bg-white/50 hover:bg-white text-slate-400 hover:text-amber-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all shadow-sm" title="Ver Significado Profundo">
                                    <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                                </button>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Número de Fuerza</p>
                                <p className="text-3xl font-light text-slate-800">{displayNum(data?.primeraParte?.potenciadores?.numeroDeFuerza)}</p>
                                <p className="text-[10px] text-slate-500">Misión + Camino de Vida</p>
                            </div>
                            <div className="bg-slate-50 rounded-2xl p-4 flex flex-col gap-1 border border-slate-100/50 relative group">
                                <button onClick={(e) => { e.stopPropagation(); openExplanation('Número de Equilibrio', displayNum(data?.primeraParte?.potenciadores?.numeroDeEquilibrio), explanations['equilibrio']); }} className="absolute top-2 right-2 bg-white/50 hover:bg-white text-slate-400 hover:text-amber-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all shadow-sm" title="Ver Significado Profundo">
                                    <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                                </button>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Número de Equilibrio</p>
                                <p className="text-3xl font-light text-slate-800">{displayNum(data?.primeraParte?.potenciadores?.numeroDeEquilibrio)}</p>
                                <p className="text-[10px] text-slate-500">Iniciales del nombre</p>
                            </div>
                            <div className="bg-slate-50 rounded-2xl p-4 flex flex-col gap-1 border border-slate-100/50 relative group">
                                <button onClick={(e) => { e.stopPropagation(); openExplanation('Número de Sombra', displayNum(data?.primeraParte?.ciclos?.sombra), explanations['sombra']); }} className="absolute top-2 right-2 bg-white/50 hover:bg-white text-slate-400 hover:text-indigo-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all shadow-sm" title="Ver Significado Profundo">
                                    <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                                </button>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Número de Sombra</p>
                                <p className="text-3xl font-light text-slate-800">{displayNum(data?.primeraParte?.ciclos?.sombra)}</p>
                                <p className="text-[10px] text-slate-500">Puntos ciegos o miedos</p>
                            </div>
                            <div className="bg-slate-50 rounded-2xl p-4 flex flex-col gap-1 border border-slate-100/50 relative group">
                                <button onClick={(e) => { e.stopPropagation(); openExplanation('Regalo Divino', displayNum(data?.primeraParte?.potenciadores?.regaloDivino), explanations['regalo_divino']); }} className="absolute top-2 right-2 bg-white/50 hover:bg-white text-slate-400 hover:text-amber-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all shadow-sm" title="Ver Significado Profundo">
                                    <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                                </button>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Regalo Divino</p>
                                <p className="text-3xl font-light text-slate-800">{displayNum(data?.primeraParte?.potenciadores?.regaloDivino)}</p>
                                <p className="text-[10px] text-slate-500">Don de nacimiento</p>
                            </div>
                        </div>
                    </div>

                    {/* 6. Planos Existenciales */}
                    <div
                        ref={(el) => { cardRefs.current[6] = el }}
                        className="col-span-2 md:col-span-1 row-span-1 bg-white border border-slate-100 rounded-[2rem] p-6 lg:p-8 flex flex-col justify-center transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl"
                        style={getCardStyle(6)}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">layers</span>
                                Planos Existenciales
                            </p>
                            <button onClick={(e) => { e.stopPropagation(); openExplanation('Planos Existenciales', '', explanations['planos_existenciales']); }} className="bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-indigo-500 rounded-full p-1.5 transition-all shadow-sm" title="Ver análisis de Planos Existenciales">
                                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                            </button>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-600 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>Mental</span>
                                <span className="text-sm font-bold">{data?.primeraParte?.planosExistenciales?.mental || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-600 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>Físico</span>
                                <span className="text-sm font-bold">{data?.primeraParte?.planosExistenciales?.fisico || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-600 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>Emotivo</span>
                                <span className="text-sm font-bold">{data?.primeraParte?.planosExistenciales?.emotivo || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-600 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>Intuitivo</span>
                                <span className="text-sm font-bold">{data?.primeraParte?.planosExistenciales?.intuitivo || 0}</span>
                            </div>
                        </div>
                    </div>

                    {/* 7. Ciclos y Calendario */}
                    <div
                        ref={(el) => { cardRefs.current[7] = el }}
                        className="col-span-2 md:col-span-1 row-span-1 bg-slate-900 text-white rounded-[2rem] p-6 lg:p-8 flex flex-col justify-center relative overflow-hidden transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl"
                        style={getCardStyle(7)}
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <span className="material-symbols-outlined text-6xl">calendar_month</span>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Tránsito Actual</p>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative group">
                                <button onClick={(e) => { e.stopPropagation(); openExplanation('Año Personal', displayNum(data?.primeraParte?.potenciadores?.anioPersonal), explanations['anio_personal']); }} className="absolute -top-1 -right-1 bg-white/20 hover:bg-white text-white/50 hover:text-indigo-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all shadow-sm z-10" title="Ver Significado Profundo">
                                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                                </button>
                                <p className="text-[9px] text-slate-400 font-bold uppercase mb-1">Año Personal</p>
                                <p className="text-3xl font-light">{displayNum(data?.primeraParte?.potenciadores?.anioPersonal)}</p>
                            </div>
                            <div className="relative group">
                                <button onClick={(e) => { e.stopPropagation(); openExplanation('Mes Personal', displayNum(data?.primeraParte?.potenciadores?.mesPersonal), explanations['mes_personal']); }} className="absolute -top-1 -right-1 bg-white/20 hover:bg-white text-white/50 hover:text-indigo-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all shadow-sm z-10" title="Ver Significado Profundo">
                                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                                </button>
                                <p className="text-[9px] text-slate-400 font-bold uppercase mb-1">Mes Personal</p>
                                <p className="text-3xl font-light">{displayNum(data?.primeraParte?.potenciadores?.mesPersonal)}</p>
                            </div>
                        </div>
                    </div>

                    {/* 8. Atributos de la Fecha */}
                    <div
                        ref={(el) => { cardRefs.current[8] = el }}
                        className="col-span-4 md:col-span-2 row-span-1 bg-white border border-slate-100 rounded-[2rem] p-6 lg:p-8 flex flex-col justify-center transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl"
                        style={getCardStyle(8)}
                    >
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">calendar_today</span>
                            Atributos de la Fecha
                        </p>
                        <div className="grid grid-cols-3 gap-3 text-center">
                            <div className="bg-blue-50/50 rounded-xl p-3 border border-blue-100/50 relative group">
                                <button onClick={(e) => { e.stopPropagation(); openExplanation('Don o Talento', displayNum(data?.primeraParte?.fechaNacimiento?.talento), explanations['talento']); }} className="absolute -top-1 -right-1 bg-white/50 hover:bg-white text-blue-400 hover:text-blue-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all shadow-sm z-10" title="Ver Significado Profundo">
                                    <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                                </button>
                                <p className="text-[9px] font-bold text-blue-800 uppercase mb-1">Talento</p>
                                <p className="text-2xl font-light text-blue-900">{displayNum(data?.primeraParte?.fechaNacimiento?.talento)}</p>
                            </div>
                            <div className="bg-pink-50/50 rounded-xl p-3 border border-pink-100/50 relative group">
                                <button onClick={(e) => { e.stopPropagation(); openExplanation('Karma a trabajar', displayNum(data?.primeraParte?.fechaNacimiento?.karmaMes), explanations['karma_mes']); }} className="absolute -top-1 -right-1 bg-white/50 hover:bg-white text-pink-400 hover:text-pink-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all shadow-sm z-10" title="Ver Significado Profundo">
                                    <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                                </button>
                                <p className="text-[9px] font-bold text-pink-800 uppercase mb-1">Karma</p>
                                <p className="text-2xl font-light text-pink-900">{displayNum(data?.primeraParte?.fechaNacimiento?.karmaMes)}</p>
                            </div>
                            <div className="bg-teal-50/50 rounded-xl p-3 border border-teal-100/50 relative group">
                                <button onClick={(e) => { e.stopPropagation(); openExplanation('Memoria de Vida Pasada', displayNum(data?.primeraParte?.fechaNacimiento?.memoriaVidaPasada), explanations['pasado']); }} className="absolute -top-1 -right-1 bg-white/50 hover:bg-white text-teal-400 hover:text-teal-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all shadow-sm z-10" title="Ver Significado Profundo">
                                    <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                                </button>
                                <p className="text-[9px] font-bold text-teal-800 uppercase mb-1">Pasado</p>
                                <p className="text-2xl font-light text-teal-900">{displayNum(data?.primeraParte?.fechaNacimiento?.memoriaVidaPasada)}</p>
                            </div>
                        </div>
                    </div>

                    {/* 9. Deudas Kármicas Letras */}
                    <div
                        ref={(el) => { cardRefs.current[9] = el }}
                        className="col-span-4 md:col-span-2 row-span-1 bg-gradient-to-r from-red-50 to-orange-50 rounded-[2rem] p-6 lg:p-8 flex flex-col justify-center transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl border border-red-100/50"
                        style={getCardStyle(9, true)}
                    >
                        <div className="flex items-center gap-3 justify-between mb-4 relative group w-full">
                            <p className="text-[10px] font-black uppercase tracking-widest text-red-800 flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">history_toggle_off</span>
                                Conteo de Letras Nombres
                            </p>
                            <button onClick={(e) => {
                                e.stopPropagation();
                                const faltantes = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(n => (data?.primeraParte?.deudasKarmicasNombre?.[n] || 0) === 0).join(', ');
                                openExplanation('Lecciones Kármicas', faltantes || 'Ninguna', explanations['letras_faltantes']);
                            }} className="bg-white/50 hover:bg-white text-red-400 hover:text-red-600 rounded-full p-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all shadow-sm z-20" title="Ver Significado Profundo">
                                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2 text-center items-center justify-between max-w-full">
                            {([1, 2, 3, 4, 5, 6, 7, 8, 9]).map(num => {
                                const count = data?.primeraParte?.deudasKarmicasNombre?.[num] || 0;
                                return (
                                    <div key={num} className={`p-2 rounded flex-1 min-w-[30px] ${count === 0 ? 'bg-red-200/50 text-red-900' : 'bg-white/60 text-slate-600'}`}>
                                        <p className="text-[9px] font-bold mb-1">Nº{num}</p>
                                        <p className="text-sm font-semibold">{count}</p>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* 10. EL SISTEMA FAMILIAR */}
                    <div
                        ref={(el) => { cardRefs.current[10] = el }}
                        className="col-span-4 row-span-2 bg-white border border-slate-100 rounded-[3rem] p-8 lg:p-12 transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl relative overflow-hidden flex flex-col"
                        style={getCardStyle(10, true)}
                    >
                        {data?.segundaParte ? (
                            <>
                                <div className="absolute top-0 right-0 opacity-[0.03] pointer-events-none transform translate-x-1/4 -translate-y-1/4">
                                    <span className="material-symbols-outlined text-[300px]">family_history</span>
                                </div>
                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-3xl text-indigo-400 border border-indigo-100/50 shadow-sm">
                                            <span className="material-symbols-outlined text-3xl">family_history</span>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Sistema Familiar</h3>
                                            <p className="text-sm font-medium text-slate-500 uppercase tracking-widest mt-1">Legado evolutivo y mapa del clan</p>
                                        </div>
                                    </div>

                                    <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">

                                        {/* Left Side: 4 Stats */}
                                        <div className="lg:col-span-7 grid grid-cols-2 gap-4">
                                            <div className="bg-gradient-to-br from-indigo-50 to-blue-50/60 rounded-[2.5rem] p-8 border border-indigo-100 flex flex-col items-center justify-center text-center shadow-[inset_0_2px_10px_rgba(255,255,255,1)] hover:shadow-md transition-shadow relative group">
                                                <button onClick={(e) => { e.stopPropagation(); openExplanation('Herencia Familiar', displayNum(data.segundaParte.herenciaFamiliar), explanations['herencia_familiar']); }} className="absolute top-4 right-4 bg-white/50 hover:bg-white text-indigo-500 rounded-full p-1.5 transition-colors shadow-sm opacity-0 group-hover:opacity-100" title="Ver Significado Profundo">
                                                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                                                </button>
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-3">Herencia</p>
                                                <p className="text-5xl md:text-6xl font-light text-slate-700">{displayNum(data.segundaParte.herenciaFamiliar)}</p>
                                            </div>
                                            <div className="bg-gradient-to-br from-violet-50 to-fuchsia-50/60 rounded-[2.5rem] p-8 border border-violet-100 flex flex-col items-center justify-center text-center shadow-[inset_0_2px_10px_rgba(255,255,255,1)] hover:shadow-md transition-shadow relative group">
                                                <button onClick={(e) => { e.stopPropagation(); openExplanation('Evolución Familiar', displayNum(data.segundaParte.evolucionFamiliar), explanations['evolucion_familiar']); }} className="absolute top-4 right-4 bg-white/50 hover:bg-white text-violet-500 rounded-full p-1.5 transition-colors shadow-sm opacity-0 group-hover:opacity-100" title="Ver Significado Profundo">
                                                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                                                </button>
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-400 mb-3">Evolución</p>
                                                <p className="text-5xl md:text-6xl font-light text-slate-700">{displayNum(data.segundaParte.evolucionFamiliar)}</p>
                                            </div>
                                            <div className="bg-gradient-to-br from-emerald-50 to-teal-50/60 rounded-[2.5rem] p-8 border border-emerald-100 flex flex-col items-center justify-center text-center shadow-[inset_0_2px_10px_rgba(255,255,255,1)] hover:shadow-md transition-shadow relative group">
                                                <button onClick={(e) => { e.stopPropagation(); openExplanation('Campo de Expresión', displayNum(data.segundaParte.campoDeExpresion), explanations['expresion_profesional']); }} className="absolute top-4 right-4 bg-white/50 hover:bg-white text-emerald-500 rounded-full p-1.5 transition-colors shadow-sm opacity-0 group-hover:opacity-100" title="Ver Significado Profundo">
                                                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                                                </button>
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/70 mb-3">Expresión</p>
                                                <p className="text-5xl md:text-6xl font-light text-slate-700">{displayNum(data.segundaParte.campoDeExpresion)}</p>
                                            </div>
                                            <div className="bg-gradient-to-br from-amber-50 to-orange-50/60 rounded-[2.5rem] p-8 border border-amber-100 flex flex-col items-center justify-center text-center shadow-[inset_0_2px_10px_rgba(255,255,255,1)] hover:shadow-md transition-shadow relative group">
                                                <button onClick={(e) => { e.stopPropagation(); openExplanation('Potencial Evolutivo', displayNum(data.segundaParte.potencialEvolutivo), explanations['potencial_evolutivo']); }} className="absolute top-4 right-4 bg-white/50 hover:bg-white text-amber-500 rounded-full p-1.5 transition-colors shadow-sm opacity-0 group-hover:opacity-100" title="Ver Significado Profundo">
                                                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                                                </button>
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500/70 mb-3">Potencial</p>
                                                <p className="text-5xl md:text-6xl font-light text-slate-700">{displayNum(data.segundaParte.potencialEvolutivo)}</p>
                                            </div>
                                        </div>

                                        <div className="lg:col-span-5 flex flex-col gap-4">
                                            <div className="bg-slate-50/70 rounded-[2.5rem] border border-slate-100 p-8 flex-1 flex flex-col shadow-inner">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex justify-between items-center">
                                                    Desglose de Linajes
                                                    <span className="material-symbols-outlined text-[18px] text-slate-300">account_tree</span>
                                                </p>
                                                <div className="flex-1 space-y-3 mb-6 flex flex-col justify-center">
                                                    {data.segundaParte.linajes.map((linaje: any, idx: number) => (
                                                        <div key={idx} className="flex justify-between items-center bg-white px-5 py-4 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 transition-all hover:border-slate-300 relative group">
                                                            <span className="text-sm font-bold capitalize text-slate-600">{linaje.nombre.toLowerCase()}</span>
                                                            <div className="flex items-center gap-3">
                                                                <button onClick={(e) => { e.stopPropagation(); handleLinajeExplanation(linaje); }} className="bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-indigo-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all shadow-sm" title="Ver Significado Profundo">
                                                                    <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                                                                </button>
                                                                <div className="bg-slate-50 px-3 py-1 rounded-xl border border-slate-200">
                                                                    <span className="font-bold text-slate-800 text-lg">{displayNum(linaje.reduccion)}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="mt-auto pt-6 border-t border-slate-200/60 text-center bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
                                                    <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">Puente de Evolución</p>
                                                    <p className="text-4xl font-light text-slate-800">{displayNum(data.segundaParte.puentes.evolucion)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col justify-center items-center text-center h-full relative z-10 w-full py-12">
                                <div className="bg-slate-50 p-6 rounded-[3rem] mb-6 flex items-center justify-center border border-slate-100">
                                    <span className="material-symbols-outlined text-[80px] text-slate-200">family_history</span>
                                </div>
                                <h3 className="text-2xl font-black text-slate-400 tracking-tight mb-3">
                                    Análisis Ancestral No Disponible
                                </h3>
                                <p className="text-slate-500 text-sm max-w-md font-medium leading-relaxed">
                                    El sistema requiere extraer información de al menos 3 palabras combinadas (nombres y apellidos) en el documento de identidad para estructurar el linaje familiar de forma precisa.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* 11. CUADRO DEL NOMBRE COMPLETO — UNIFICADO */}
                    <div
                        ref={(el) => { cardRefs.current[11] = el }}
                        className="col-span-4 row-span-1 bg-white border border-slate-100 rounded-[2rem] p-6 lg:p-8 flex flex-col transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl overflow-x-auto"
                        style={getCardStyle(11, true)}
                    >
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">abc</span>
                            Cuadro del Nombre Completo
                        </p>
                        {/* Letter grid per word */}
                        <div className="flex gap-3 flex-wrap mb-5">
                            {data?.primeraParte?.wordsBreakdown?.map((wb: any, i: number) => (
                                <div key={i} className={`rounded-2xl p-4 border flex-1 min-w-[120px] ${wb.isNombre ? 'bg-slate-50 border-slate-100' : 'bg-amber-50/50 border-amber-200/50 border-dashed'}`}>
                                    {!wb.isNombre && (
                                        <p className="text-[7px] text-amber-600 font-black uppercase tracking-widest text-center mb-1">Apellido</p>
                                    )}
                                    <div className="flex gap-1 justify-center mb-1 flex-wrap">
                                        {wb.letters?.map((l: any, j: number) => (
                                            <span key={j} className="text-xs font-bold text-slate-700 w-6 text-center">{l.letter}</span>
                                        ))}
                                    </div>
                                    <div className="flex gap-1 justify-center mb-2 flex-wrap">
                                        {wb.letters?.map((l: any, j: number) => (
                                            <span key={j} className={`text-xs w-6 text-center font-semibold ${l.isVowel ? 'text-indigo-600' : 'text-rose-500'}`}>{l.value}</span>
                                        ))}
                                    </div>
                                    <div className="text-center border-t border-slate-200 pt-2">
                                        <p className="text-lg font-light text-slate-800">{displayNumShort(wb.reduction)}</p>
                                        <p className="text-[8px] text-slate-400 uppercase font-bold">{wb.word}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ALMA (vocales) */}
                        <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100/50 mb-3">
                            <p className="text-[9px] font-black uppercase tracking-widest text-indigo-700 mb-2 flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block"></span>
                                Alma (vocales)
                            </p>
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                                {data?.primeraParte?.almaPerWord?.map((a: any, i: number) => (
                                    <React.Fragment key={i}>
                                        {i > 0 && <span className="text-indigo-300 text-sm font-light">+</span>}
                                        <span className="text-xs text-indigo-700">
                                            <span className="font-semibold">{a.vowelLetters?.map((l: any) => `${l.letter}=${l.value}`).join(', ')}</span>
                                            <span className="text-indigo-500 ml-1">= {displayNumShort(a.vowelReduction)}</span>
                                        </span>
                                    </React.Fragment>
                                ))}
                            </div>
                            <div className="flex items-baseline gap-2 flex-wrap">
                                <span className="text-lg font-bold text-indigo-900">{displayNum(data?.primeraParte?.calculoAlma)}</span>
                                {data?.primeraParte?.almaAlternative?.isKarmic && (
                                    <span className="text-[10px] text-red-600 font-bold">Alt: {displayNumShort(data?.primeraParte?.almaAlternative)} KÁRMICO</span>
                                )}
                                {data?.primeraParte?.almaAlternative?.isMaster && (
                                    <span className="text-[10px] text-amber-600 font-bold">Alt: {displayNumShort(data?.primeraParte?.almaAlternative)} MAESTRO</span>
                                )}
                            </div>
                        </div>

                        {/* PERSONALIDAD (consonantes) */}
                        <div className="bg-rose-50/50 rounded-xl p-4 border border-rose-100/50 mb-3">
                            <p className="text-[9px] font-black uppercase tracking-widest text-rose-700 mb-2 flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-rose-400 inline-block"></span>
                                Personalidad (consonantes)
                            </p>
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                                {data?.primeraParte?.personalidadPerWord?.map((p: any, i: number) => (
                                    <React.Fragment key={i}>
                                        {i > 0 && <span className="text-rose-300 text-sm font-light">+</span>}
                                        <span className="text-xs text-rose-700">
                                            <span className="font-semibold">{p.consonantLetters?.map((l: any) => `${l.letter}=${l.value}`).join(', ')}</span>
                                            <span className="text-rose-500 ml-1">= {displayNumShort(p.consonantReduction)}</span>
                                        </span>
                                    </React.Fragment>
                                ))}
                            </div>
                            <div className="flex items-baseline gap-2 flex-wrap">
                                <span className="text-lg font-bold text-rose-900">{displayNum(data?.primeraParte?.calculoPersonalidad)}</span>
                                {data?.primeraParte?.personalidadAlternative?.isMaster && (
                                    <span className="text-[10px] text-amber-600 font-bold">Alt: {displayNumShort(data?.primeraParte?.personalidadAlternative)} MAESTRO</span>
                                )}
                                {data?.primeraParte?.personalidadAlternative?.isKarmic && (
                                    <span className="text-[10px] text-red-600 font-bold">Alt: {displayNumShort(data?.primeraParte?.personalidadAlternative)} KÁRMICO</span>
                                )}
                            </div>
                        </div>

                        {/* MISIÓN = ALMA + PERSONALIDAD */}
                        <div className="bg-teal-50/50 rounded-xl p-4 border border-teal-100/50">
                            <p className="text-[9px] font-black uppercase tracking-widest text-teal-700 mb-2 flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-teal-400 inline-block"></span>
                                Misión = Alma + Personalidad
                            </p>
                            <div className="flex items-baseline gap-2 flex-wrap">
                                <span className="text-xs text-teal-600">
                                    {data?.primeraParte?.almaTotal} + {data?.primeraParte?.personalidadTotal} = {data?.primeraParte?.misionTotal}
                                </span>
                                <span className="text-lg font-bold text-teal-900">{displayNum(data?.primeraParte?.calculoMision)}</span>
                                {data?.primeraParte?.misionAlternative?.isMaster && (
                                    <span className="text-[10px] text-amber-600 font-bold">Alt: {displayNumShort(data?.primeraParte?.misionAlternative)} MAESTRO</span>
                                )}
                                {data?.primeraParte?.misionAlternative?.isKarmic && (
                                    <span className="text-[10px] text-red-600 font-bold">Alt: {displayNumShort(data?.primeraParte?.misionAlternative)} KÁRMICO</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 12. CUADRO DE FECHA DE NACIMIENTO */}
                    <div
                        ref={(el) => { cardRefs.current[12] = el }}
                        className="col-span-4 md:col-span-2 row-span-1 bg-gradient-to-br from-amber-50 to-orange-50 rounded-[2rem] p-6 lg:p-8 flex flex-col transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl"
                        style={getCardStyle(12, true)}
                    >
                        <p className="text-[10px] font-black uppercase tracking-widest text-orange-800 mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">event</span>
                            Cuadro de Fecha de Nacimiento
                        </p>
                        <div className="grid grid-cols-4 gap-3 text-center">
                            <div className="bg-white/70 rounded-xl p-3 border border-orange-100">
                                <p className="text-[9px] font-bold text-orange-700 uppercase mb-1">Día</p>
                                <p className="text-2xl font-light text-orange-900">{data?.primeraParte?.fechaNacimiento?.dia}</p>
                                {(() => {
                                    const d = data?.primeraParte?.fechaNacimiento;
                                    if (!d) return null;
                                    const dayStr = String(d.dia);
                                    if (dayStr.length > 1) {
                                        return <p className="text-[9px] text-orange-600 mt-1">{dayStr.split('').join('+')}={displayNumShort(d.diaReduction)}</p>;
                                    }
                                    return <p className="text-xs font-semibold text-orange-600 mt-1">{displayNumShort(d.diaReduction)}</p>;
                                })()}
                                {data?.primeraParte?.fechaNacimiento?.diaReduction?.isMaster && (
                                    <p className="text-[8px] text-amber-700 font-bold">MAESTRO</p>
                                )}
                            </div>
                            <div className="bg-white/70 rounded-xl p-3 border border-orange-100">
                                <p className="text-[9px] font-bold text-orange-700 uppercase mb-1">Mes</p>
                                <p className="text-2xl font-light text-orange-900">{data?.primeraParte?.fechaNacimiento?.mes}</p>
                                <p className="text-xs font-semibold text-orange-600 mt-1">{displayNumShort(data?.primeraParte?.fechaNacimiento?.mesReduction)}</p>
                            </div>
                            <div className="bg-white/70 rounded-xl p-3 border border-orange-100">
                                <p className="text-[9px] font-bold text-orange-700 uppercase mb-1">Año</p>
                                <p className="text-2xl font-light text-orange-900">{data?.primeraParte?.fechaNacimiento?.anio}</p>
                                {(() => {
                                    const d = data?.primeraParte?.fechaNacimiento;
                                    if (!d) return null;
                                    const yearStr = String(d.anio);
                                    return <p className="text-[9px] text-orange-600 mt-1">{yearStr.split('').join('+')}={displayNumShort(d.anioReduction)}</p>;
                                })()}
                            </div>
                            <div className="bg-orange-100/50 rounded-xl p-3 border border-orange-200">
                                <p className="text-[9px] font-bold text-orange-800 uppercase mb-1">Camino de Vida</p>
                                <p className="text-xl font-bold text-orange-950">{displayNumShort(data?.primeraParte?.fechaNacimiento?.caminoDeVida)}</p>
                                {data?.primeraParte?.fechaNacimiento?.caminoDeVida?.isMaster && (
                                    <p className="text-[8px] text-amber-700 font-bold">MAESTRO ✨</p>
                                )}
                                {(() => {
                                    const d = data?.primeraParte?.fechaNacimiento;
                                    if (!d) return null;
                                    const diaVal = d.diaReduction?.isMaster && d.diaReduction?.masterValue ? d.diaReduction.masterValue : d.diaReduction?.digit;
                                    const mesVal = d.mesReduction?.digit;
                                    const anioDigits = String(d.anio).split('').reduce((a: number, c: string) => a + parseInt(c), 0);
                                    return <p className="text-[8px] text-orange-600 mt-1">{diaVal}+{mesVal}+{anioDigits}={d.caminoDeVida?.sequence?.[0]}</p>;
                                })()}
                            </div>
                        </div>
                        {data?.primeraParte?.fechaNacimiento?.caminoDeVidaAlternative && (
                            <p className="text-[9px] text-center text-orange-600 mt-3 font-medium">
                                Alternativa: {displayNum(data?.primeraParte?.fechaNacimiento?.caminoDeVidaAlternative)}
                            </p>
                        )}
                    </div>

                    {/* 13. CICLOS DE REALIZACIÓN */}
                    <div
                        ref={(el) => { cardRefs.current[13] = el }}
                        className="col-span-4 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-[3rem] transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl relative overflow-hidden flex flex-col lg:flex-row"
                        style={getCardStyle(13, true)}
                    >
                        <div className="absolute top-0 right-0 opacity-5 pointer-events-none">
                            <span className="material-symbols-outlined text-[200px]">cycle</span>
                        </div>
                        
                        {/* LEFT: GRAPHIC */}
                        <div className="flex-1 p-8 lg:p-10 relative z-10 flex flex-col items-center border-b lg:border-b-0 lg:border-r border-white/10">
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 self-start">
                                <span className="material-symbols-outlined text-indigo-300">category</span>
                                Mapa del Diamante (Ciclos y Desafíos)
                            </h3>
                            <div className="w-full overflow-hidden flex items-center justify-center">
                                <DiamanteCiclos data={data?.primeraParte} />
                            </div>
                        </div>

                        {/* RIGHT: INDIVIDUAL CYCLE / DESAFÍO CARDS */}
                        <div className="flex-1 p-6 lg:p-8 relative z-10 flex flex-col max-h-full">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-indigo-300 shrink-0">
                                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                                Análisis Evolutivo
                            </h3>

                            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-5">
                                {/* CICLOS */}
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400/70 mb-3">Ciclos de Realización</p>
                                    <div className="space-y-2">
                                        {(
                                            [
                                                { key: 'ciclo_1', label: '1er Ciclo', idx: 0 },
                                                { key: 'ciclo_2', label: '2do Ciclo', idx: 1 },
                                                { key: 'ciclo_3', label: '3er Ciclo', idx: 2 },
                                                { key: 'ciclo_4', label: '4to Ciclo', idx: 3 },
                                            ] as const
                                        ).map(({ key, label, idx }) => {
                                            const ciclos = data?.primeraParte?.ciclos;
                                            const val = ciclos?.ciclosReduction?.[idx];
                                            const ages = ciclos?.edadesCiclos;
                                            const isCurrent = ciclos?.cicloActual === idx + 1;
                                            const ageLabel =
                                                idx === 0 ? `0–${ages?.[0] ?? '?'} años` :
                                                idx === 1 ? `${ages?.[0] ?? '?'}–${ages?.[1] ?? '?'} años` :
                                                idx === 2 ? `${ages?.[1] ?? '?'}–${ages?.[2] ?? '?'} años` :
                                                `${ages?.[2] ?? '?'}+ años`;
                                            const text = explanations?.[key];
                                            return (
                                                <div
                                                    key={key}
                                                    className={`group rounded-xl border p-3 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg ${
                                                        isCurrent
                                                            ? 'bg-indigo-500/15 border-indigo-400/40 hover:border-indigo-400/70'
                                                            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-indigo-500/30'
                                                    }`}
                                                    onClick={(e) => { e.stopPropagation(); openExplanation(label, displayNum(val), text); }}
                                                >
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <span className="text-2xl font-black text-white shrink-0">{displayNum(val)}</span>
                                                            <div className="min-w-0">
                                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                                    <span className="text-[11px] font-bold text-indigo-300">{label}</span>
                                                                    {isCurrent && (
                                                                        <span className="text-[9px] font-black uppercase tracking-wider bg-indigo-500/30 text-indigo-200 px-1.5 py-0.5 rounded-full">Actual</span>
                                                                    )}
                                                                </div>
                                                                <p className="text-[10px] text-white/40">{ageLabel}</p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 hover:bg-indigo-500/30 rounded-full p-1"
                                                            onClick={(e) => { e.stopPropagation(); openExplanation(label, displayNum(val), undefined, true); }}
                                                            title="Regenerar explicación"
                                                        >
                                                            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                                                        </button>
                                                    </div>
                                                    {text ? (
                                                        <p className="mt-2 text-[12px] leading-relaxed text-white/70 line-clamp-3">{text}</p>
                                                    ) : (
                                                        <p className="mt-2 text-[11px] text-white/30 italic">Generando análisis...</p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* DESAFÍOS */}
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-rose-400/70 mb-3">Desafíos</p>
                                    <div className="space-y-2">
                                        {(
                                            [
                                                { key: 'desafio_1', label: '1er Desafío', idx: 0 },
                                                { key: 'desafio_2', label: '2do Desafío', idx: 1 },
                                                { key: 'desafio_3', label: '3er Desafío (Mayor)', idx: 2 },
                                                { key: 'desafio_4', label: '4to Desafío', idx: 3 },
                                            ] as const
                                        ).map(({ key, label, idx }) => {
                                            const ciclos = data?.primeraParte?.ciclos;
                                            const val = ciclos?.desafiosReduction?.[idx];
                                            const text = explanations?.[key];
                                            return (
                                                <div
                                                    key={key}
                                                    className="group rounded-xl border bg-white/5 border-white/10 p-3 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg hover:bg-white/10 hover:border-rose-500/30"
                                                    onClick={(e) => { e.stopPropagation(); openExplanation(label, displayNum(val), text); }}
                                                >
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-2xl font-black text-white shrink-0">{displayNum(val)}</span>
                                                            <span className="text-[11px] font-bold text-rose-300">{label}</span>
                                                        </div>
                                                        <button
                                                            className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 hover:bg-rose-500/30 rounded-full p-1"
                                                            onClick={(e) => { e.stopPropagation(); openExplanation(label, displayNum(val), undefined, true); }}
                                                            title="Regenerar explicación"
                                                        >
                                                            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                                                        </button>
                                                    </div>
                                                    {text ? (
                                                        <p className="mt-2 text-[12px] leading-relaxed text-white/70 line-clamp-3">{text}</p>
                                                    ) : (
                                                        <p className="mt-2 text-[11px] text-white/30 italic">Generando análisis...</p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 14. CUADRO DE LAS 9 CASAS */}
                    <div
                        ref={(el) => { cardRefs.current[14] = el }}
                        className="col-span-4 row-span-2 bg-white border border-slate-100 rounded-[3rem] p-6 lg:p-8 flex flex-col transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl overflow-x-auto"
                        style={getCardStyle(14, true)}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">grid_view</span>
                                Cuadro de las 9 Casas
                            </p>
                            <button
                                onClick={(e) => { e.stopPropagation(); openExplanation('Cuadro de las 9 Casas', 'Análisis completo', explanations['casas_9']); }}
                                className="bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-indigo-500 rounded-full p-1.5 transition-all shadow-sm"
                                title="Ver análisis de las 9 Casas"
                            >
                                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr className="border-b-2 border-slate-200">
                                        <th className="text-left py-2 px-3 text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap"></th>
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(casa => (
                                            <th key={casa} className="text-center py-2 px-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-indigo-50 text-indigo-600 text-xs font-bold">{casa}</span>
                                            </th>
                                        ))}
                                    </tr>
                                    <tr className="border-b border-slate-100 bg-slate-50/50">
                                        <td className="py-1.5 px-3 text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">Nombre</td>
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(casa => (
                                            <td key={casa} className="py-1.5 px-2 text-center text-[11px] font-medium text-slate-600 whitespace-nowrap">
                                                {CASAS_INFO[casa]?.nombre}
                                            </td>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {(() => {
                                        const casas = data?.primeraParte?.casas;
                                        const rows = [
                                            { label: 'Habitante', render: (c: number) => { const h = casas?.habitantes?.[c]; return <span className={`font-bold text-base ${h === 0 ? 'text-red-500' : 'text-slate-800'}`} title={HABITANTES_INFO[h as number] || ''}>{displayNum(h)}</span>; } },
                                            { label: 'Año 30',    render: (c: number) => <span className="text-slate-700">{digitOnly(casas?.anos30?.[c])}</span> },
                                            { label: 'Año 58',    render: (c: number) => <span className="text-slate-700">{digitOnly(casas?.anos58?.[c])}</span> },
                                            { label: 'Año 87',    render: (c: number) => <span className="text-slate-700">{digitOnly(casas?.anos87?.[c])}</span> },
                                            { label: 'Ind. Inconsc.', render: (c: number) => <span className="text-slate-700">{digitOnly(casas?.induccionInconsciente?.[c])}</span> },
                                            { label: 'P. Iniciático', render: (c: number) => <span className="text-slate-700">{digitOnly(casas?.puenteIniciatico?.[c])}</span> },
                                            { label: 'P. Evolución',  render: (c: number) => <span className="font-bold text-indigo-700">{digitOnly(casas?.propuestaEvolucion?.[c])}</span> },
                                        ];
                                        return rows.map((row, ri) => (
                                            <tr key={row.label} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${ri % 2 === 0 ? '' : 'bg-slate-50/30'}`}>
                                                <td className="py-2 px-3 text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">{row.label}</td>
                                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(c => (
                                                    <td key={c} className="py-2 px-2 text-center text-sm font-semibold">{row.render(c)}</td>
                                                ))}
                                            </tr>
                                        ));
                                    })()}
                                </tbody>
                            </table>
                        </div>
                        {/* CONTEO DE LETRAS DEL NOMBRE COMPLETO */}
                        {(() => {
                            const letterCounts: Record<string, number> = {};
                            const letterOrder: string[] = [];
                            (data?.primeraParte?.wordsBreakdown ?? []).forEach((wb: any) => {
                                (wb.letters ?? []).forEach((ld: any) => {
                                    const l = ld.letter?.toUpperCase();
                                    if (l) {
                                        if (!letterCounts[l]) letterOrder.push(l);
                                        letterCounts[l] = (letterCounts[l] || 0) + 1;
                                    }
                                });
                            });
                            if (letterOrder.length === 0) return null;
                            return (
                                <div className="mt-4 border-t border-slate-100 pt-4">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Conteo de letras</p>
                                    <div className="flex flex-wrap gap-2">
                                        {letterOrder.map(letter => (
                                            <div key={letter} className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
                                                <span className="text-sm font-black text-indigo-600">{letter}</span>
                                                <span className="text-[10px] text-slate-400">×</span>
                                                <span className="text-sm font-bold text-slate-700">{letterCounts[letter]}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                    {/* We no longer render FullReportSection here */}
                </div>
            </section>

            <AiExplanationModal
                isOpen={explanationState.isOpen}
                onClose={closeExplanation}
                title={explanationState.title}
                num={explanationState.num}
                precalculatedText={explanationState.text}
                isLoading={explanationState.isLoading}
                onRegenerate={explanationState.metricKey ? () => openExplanation(explanationState.title, explanationState.num, undefined, true) : undefined}
            />

            <EditableReportModal
                isOpen={clienteModalOpen}
                onClose={() => setClienteModalOpen(false)}
                initialText={clienteReportText}
                isLoading={clienteLoading}
                onRegenerate={handleRegenerateCliente}
            />
        </div>
    );
}

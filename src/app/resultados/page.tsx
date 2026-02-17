
'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import type { NumerologyResult } from '@/lib/numerology';

/** Helper to display a numerology number, showing special notation if present */
function displayNum(n: { reduced: number; special: string | null } | undefined): string {
    if (!n) return '-';
    return n.special || String(n.reduced);
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
    const totalCards = 8;
    const isTransitioning = useRef(false);

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
        if (stored) {
            try {
                const parsedData = JSON.parse(stored);
                setData(parsedData);
                
                // Siempre mostrar presentación la primera vez
                setShowingCards(true);
            } catch {
                // Invalid data, ignore
            }
        }
    }, []);

    // Entrada de la primera tarjeta
    useEffect(() => {
        if (!data || !showingCards) return;
        const firstCard = cardRefs.current[0];
        if (firstCard) {
            // gsap.set antes del paint para evitar el flash en posición inicial
            gsap.set(firstCard, { left: '115%', opacity: 0, scale: 0.97 });
            gsap.to(firstCard, {
                left: '50%',
                opacity: 1,
                scale: 1,
                duration: 0.85,
                ease: 'expo.out',
                delay: 0.05,
            });
        }
    }, [data, showingCards]);

    // Entrada de cada tarjeta nueva
    useEffect(() => {
        if (!showingCards || currentCardIndex === 0) return;
        const currentCard = cardRefs.current[currentCardIndex];
        if (currentCard) {
            gsap.set(currentCard, { left: '115%', opacity: 0, scale: 0.97 });
            gsap.to(currentCard, {
                left: '50%',
                opacity: 1,
                scale: 1,
                duration: 0.72,
                ease: 'expo.out',
            });
        }
    }, [currentCardIndex, showingCards]);

    const clearAllCards = () => {
        cardRefs.current.forEach(card => {
            if (card) gsap.set(card, { clearProps: 'all' });
        });
    };

    const finishPresentation = () => {
        // Fade out overlay y tarjeta activa juntos
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

        const currentCard = cardRefs.current[currentCardIndex];

        if (currentCardIndex >= totalCards - 1) {
            finishPresentation();
        } else {
            // Animar salida de la tarjeta actual hacia la izquierda
            if (currentCard) {
                gsap.to(currentCard, {
                    left: '-15%',
                    opacity: 0,
                    scale: 0.94,
                    duration: 0.38,
                    ease: 'power2.in',
                    onComplete: () => {
                        // Limpiar GSAP para que React tome control del posicionamiento de fondo
                        gsap.set(currentCard, { clearProps: 'left,scale' });
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

        // Preparar elementos ocultos
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

    /** Genera el inline style para cada tarjeta según el estado de la presentación */
    const getCardStyle = (cardIndex: number, wide = false): React.CSSProperties => {
        if (!showingCards) return {};
        if (currentCardIndex === cardIndex) {
            // Tarjeta activa: empieza fuera de pantalla a la derecha, GSAP la anima al centro
            return {
                position: 'fixed',
                top: '38%',
                left: '115%',
                transform: 'translate(-50%, -50%)',
                width: '85vw',
                maxWidth: wide ? '550px' : '500px',
                height: 'auto',
                zIndex: 9999,
                opacity: 0,
            };
        }
        if (currentCardIndex > cardIndex) {
            // Visitada: aparece en el grid con blur, CSS transition suave solo en opacity y filter
            return {
                opacity: 1,
                filter: 'blur(3px)',
                transition: 'opacity 0.55s ease-out, filter 0.55s ease-out',
            };
        }
        // Aún no visitada: oculta
        return { opacity: 0 };
    };

    // Animar grid cuando se entra directo sin presentación (reload)
    useEffect(() => {
        if (!showingCards && data) {
            animateFinalLayout();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showingCards, data]);

    // Format birth date for display
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
            {/* Overlay con partículas cuando se muestran las tarjetas */}
            {showingCards && (
                <div 
                    ref={overlayRef}
                    className="fixed inset-0 bg-white/50 backdrop-blur-sm"
                    style={{ zIndex: 9998 }}
                >
                    {/* Indicador de progreso */}
                    <div className="absolute top-8 left-1/2 transform -translate-x-1/2 flex gap-2">
                        {Array.from({ length: totalCards }).map((_, i) => (
                            <div 
                                key={i}
                                className={`h-1 rounded-full transition-all duration-300 ${
                                    i <= currentCardIndex ? 'w-8 bg-indigo-500' : 'w-4 bg-slate-300'
                                }`}
                            />
                        ))}
                    </div>

                    {/* Botones de navegación */}
                    <div className="fixed bottom-64 left-1/2 transform -translate-x-1/2 flex items-center gap-4" style={{ zIndex: 10000 }}>
                        <button
                            onClick={handleNextCard}
                            className="backdrop-blur-xl text-slate-800 px-8 py-4 rounded-full font-bold text-sm tracking-wider uppercase flex items-center gap-3 hover:scale-105 active:scale-95 transition-all duration-300"
                            style={{
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(190,210,255,0.35) 40%, rgba(220,190,255,0.3) 70%, rgba(255,255,255,0.45) 100%)',
                                border: '1px solid rgba(255,255,255,0.75)',
                                boxShadow: '0 8px 32px rgba(120,100,200,0.18), inset 0 1.5px 0 rgba(255,255,255,0.85), inset 0 -1px 0 rgba(180,160,255,0.15)',
                            }}
                        >
                            {currentCardIndex >= totalCards - 1 ? 'Completar' : 'Siguiente Resultado'}
                            <span className="material-symbols-outlined text-xl">
                                {currentCardIndex >= totalCards - 1 ? 'check_circle' : 'arrow_forward'}
                            </span>
                        </button>
                        <button
                            onClick={handleSkipAnimation}
                            className="backdrop-blur-xl text-slate-600 px-6 py-4 rounded-full font-bold text-sm tracking-wider uppercase flex items-center gap-2 hover:scale-105 active:scale-95 transition-all duration-300"
                            style={{
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(200,230,255,0.25) 50%, rgba(255,255,255,0.35) 100%)',
                                border: '1px solid rgba(255,255,255,0.6)',
                                boxShadow: '0 6px 24px rgba(100,140,200,0.12), inset 0 1.5px 0 rgba(255,255,255,0.8), inset 0 -1px 0 rgba(160,190,255,0.1)',
                            }}
                        >
                            Omitir Animación
                            <span className="material-symbols-outlined text-xl">
                                skip_next
                            </span>
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <section ref={mainSectionRef} className="flex-1 p-6 lg:p-10 overflow-y-auto" id="results-container">
                <header ref={headerRef} className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 opacity-0">
                    <div>
                        <h1 className="text-xs uppercase tracking-[0.5em] font-bold text-slate-500 mb-1">Resultado de Análisis</h1>
                        <h2 className="text-3xl font-extrabold tracking-tight">Síntesis Energética</h2>
                    </div>
                    <div className="flex items-center gap-4 self-end md:self-auto">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold">{data.nombreCompleto}</p>
                            <p className="text-xs text-slate-500">{formatDate(data.fechaNacimiento)}</p>
                        </div>
                    </div>
                </header>

                <div ref={containerRef} className="bento-grid">
                    {/* Main Card - Vibración Interna */}
                    <div 
                        ref={(el) => { cardRefs.current[0] = el }}
                        className={`col-span-4 md:col-span-2 row-span-2 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-[3rem] soft-relief p-10 flex flex-col items-center justify-center relative overflow-hidden transition-transform duration-300 hover:-translate-y-2 hover:shadow-lg shadow-2xl ${
                            !showingCards ? 'opacity-100' : ''
                        }`}
                        style={getCardStyle(0)}
                    >
                        <div className="absolute inset-0 sacred-geo-bg opacity-40"></div>
                        <div className="spiritual-aura"></div>
                        <div className="relative z-10 text-center">
                            <h3 className="text-sm font-extrabold uppercase tracking-widest mb-10 text-slate-600">Vibración Interna</h3>
                            <div className="relative w-64 h-64 md:w-72 md:h-72 mb-8 flex items-center justify-center">
                                <svg className="absolute inset-0 w-full h-full text-black-accent/10" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" fill="none" r="45" stroke="currentColor" strokeWidth="0.25"></circle>
                                    <circle cx="50" cy="50" fill="none" r="32" stroke="currentColor" strokeWidth="0.25"></circle>
                                    <path d="M50 5 L50 95 M5 50 L95 50" stroke="currentColor" strokeWidth="0.25"></path>
                                    <polygon fill="none" points="50,5 95,50 50,95 5,50" stroke="currentColor" strokeWidth="0.25"></polygon>
                                </svg>
                                <div className="flex flex-col items-center justify-center">
                                    <span className="text-7xl md:text-8xl font-thin tracking-tighter text-black-accent relative">
                                        {displayNum(data.vibracionInterna)}
                                        {data.vibracionInterna.special && (
                                            <span className="absolute -top-4 -right-4 text-amber-500/40 text-4xl material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                                        )}
                                    </span>
                                    <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mt-2">
                                        {data.vibracionInterna.special ? 'Número Maestro' : 'Esencia Vital'}
                                    </span>
                                </div>
                            </div>
                            <p className="text-dark-gray text-sm leading-relaxed max-w-xs mx-auto font-medium">
                                Tu vibración central irradia una frecuencia única que define tu potencial energético.
                            </p>
                        </div>
                    </div>

                    {/* Misión */}
                    <div 
                        ref={(el) => { cardRefs.current[1] = el }}
                        className={`col-span-2 md:col-span-1 row-span-1 pastel-gradient-mint rounded-[2rem] p-6 lg:p-8 flex flex-col justify-between soft-relief group hover:scale-[1.03] transition-all duration-300 hover:-translate-y-2 shadow-2xl ${
                            !showingCards ? 'opacity-100' : ''
                        }`}
                        style={getCardStyle(1)}
                    >
                        <div>
                            <span className="material-symbols-outlined text-teal-600 mb-4 bg-white/50 p-2 rounded-xl" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                            <h4 className="text-[10px] font-black text-teal-900 uppercase tracking-widest">Misión</h4>
                        </div>
                        <div>
                            <div className="text-4xl lg:text-5xl font-light mb-1 text-teal-950">{displayNum(data.mision)}</div>
                            <p className="text-xs text-teal-900/70 font-semibold leading-snug">Propósito central de tu existencia.</p>
                        </div>
                    </div>

                    {/* Alma */}
                    <div 
                        ref={(el) => { cardRefs.current[2] = el }}
                        className={`col-span-2 md:col-span-1 row-span-1 pastel-gradient-lavender rounded-[2rem] p-6 lg:p-8 flex flex-col justify-between soft-relief group hover:scale-[1.03] transition-all duration-300 hover:-translate-y-2 shadow-2xl ${
                            !showingCards ? 'opacity-100' : ''
                        }`}
                        style={getCardStyle(2)}
                    >
                        <div>
                            <span className="material-symbols-outlined text-indigo-600 mb-4 bg-white/50 p-2 rounded-xl" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                            <h4 className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">Alma</h4>
                        </div>
                        <div>
                            <div className="text-4xl lg:text-5xl font-light mb-1 text-indigo-950">{displayNum(data.alma)}</div>
                            <p className="text-xs text-indigo-900/70 font-semibold leading-snug">Tu deseo interno más profundo.</p>
                        </div>
                    </div>

                    {/* Camino de Vida */}
                    <div 
                        ref={(el) => { cardRefs.current[3] = el }}
                        className={`col-span-2 md:col-span-1 row-span-1 pastel-gradient-peach rounded-[2rem] p-6 lg:p-8 flex flex-col justify-between soft-relief group hover:scale-[1.03] transition-all duration-300 hover:-translate-y-2 shadow-2xl ${
                            !showingCards ? 'opacity-100' : ''
                        }`}
                        style={getCardStyle(3)}
                    >
                        <div>
                            <span className="material-symbols-outlined text-orange-600 mb-4 bg-white/50 p-2 rounded-xl" style={{ fontVariationSettings: "'FILL' 1" }}>flare</span>
                            <h4 className="text-[10px] font-black text-orange-900 uppercase tracking-widest">Camino de Vida</h4>
                        </div>
                        <div>
                            <div className="text-4xl lg:text-5xl font-light mb-1 text-orange-950">{displayNum(data.caminoDeVida)}</div>
                            <p className="text-xs text-orange-900/70 font-semibold leading-snug">Tu sendero principal en esta vida.</p>
                        </div>
                    </div>

                    {/* Personalidad */}
                    <div 
                        ref={(el) => { cardRefs.current[4] = el }}
                        className={`col-span-2 md:col-span-1 row-span-1 pastel-gradient-rose rounded-[2rem] p-6 lg:p-8 flex flex-col justify-between soft-relief group hover:scale-[1.03] transition-all duration-300 hover:-translate-y-2 shadow-2xl ${
                            !showingCards ? 'opacity-100' : ''
                        }`}
                        style={getCardStyle(4)}
                    >
                        <div>
                            <span className="material-symbols-outlined text-rose-600 mb-4 bg-white/50 p-2 rounded-xl" style={{ fontVariationSettings: "'FILL' 1" }}>wb_sunny</span>
                            <h4 className="text-[10px] font-black text-rose-900 uppercase tracking-widest">Personalidad</h4>
                        </div>
                        <div>
                            <div className="text-4xl lg:text-5xl font-light mb-1 text-rose-950">{displayNum(data.personalidad)}</div>
                            <p className="text-xs text-rose-900/70 font-semibold leading-snug">Cómo te percibe el mundo externo.</p>
                        </div>
                    </div>

                    {/* Diamante - Realizaciones y Desafíos */}
                    <div 
                        ref={(el) => { cardRefs.current[5] = el }}
                        className={`col-span-4 md:col-span-2 row-span-2 bg-white rounded-[3rem] soft-relief p-8 md:p-10 overflow-hidden flex flex-col justify-center transition-transform duration-300 hover:-translate-y-2 hover:shadow-lg shadow-2xl ${
                            !showingCards ? 'opacity-100' : ''
                        }`}
                        style={getCardStyle(5, true)}
                    >
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-400">diamond</span>
                            Diamante Numerológico
                        </h3>
                        <div className="space-y-5">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Realizaciones</p>
                                <div className="grid grid-cols-4 gap-3">
                                    {(['r1', 'r2', 'r3', 'r4'] as const).map((key, i) => (
                                        <div key={key} className="bg-teal-50 rounded-xl p-3 text-center">
                                            <p className="text-[9px] font-bold text-teal-600 uppercase mb-1">R{i + 1}</p>
                                            <p className="text-2xl font-light text-teal-900">{displayNum(data.diamante.realizaciones[key])}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Desafíos</p>
                                <div className="grid grid-cols-4 gap-3">
                                    <div className="bg-rose-50 rounded-xl p-3 text-center">
                                        <p className="text-[9px] font-bold text-rose-600 uppercase mb-1">D1</p>
                                        <p className="text-2xl font-light text-rose-900">{displayNum(data.diamante.desafios.d1)}</p>
                                    </div>
                                    <div className="bg-rose-50 rounded-xl p-3 text-center">
                                        <p className="text-[9px] font-bold text-rose-600 uppercase mb-1">D2</p>
                                        <p className="text-2xl font-light text-rose-900">{displayNum(data.diamante.desafios.d2)}</p>
                                    </div>
                                    <div className="bg-rose-50 rounded-xl p-3 text-center">
                                        <p className="text-[9px] font-bold text-rose-600 uppercase mb-1">Mayor</p>
                                        <p className="text-2xl font-light text-rose-900">{displayNum(data.diamante.desafios.mayor)}</p>
                                    </div>
                                    <div className="bg-rose-50 rounded-xl p-3 text-center">
                                        <p className="text-[9px] font-bold text-rose-600 uppercase mb-1">Extra</p>
                                        <p className="text-2xl font-light text-rose-900">{displayNum(data.diamante.desafios.extra)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Planes Existenciales */}
                    <div 
                        ref={(el) => { cardRefs.current[6] = el }}
                        className={`col-span-2 md:col-span-1 row-span-1 bg-white rounded-[2rem] p-6 lg:p-8 soft-relief flex flex-col justify-center group hover:bg-slate-50 transition-all duration-300 hover:-translate-y-2 shadow-2xl ${
                            !showingCards ? 'opacity-100' : ''
                        }`}
                        style={getCardStyle(6)}
                    >
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Planos Existenciales</p>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-600">Mental (1,8)</span>
                                <span className="text-sm font-bold">{data.planesExistenciales.mental}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-600">Físico (4,5)</span>
                                <span className="text-sm font-bold">{data.planesExistenciales.fisico}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-600">Emotivo (2,3,6)</span>
                                <span className="text-sm font-bold">{data.planesExistenciales.emotivo}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-600">Intuitivo (7,9)</span>
                                <span className="text-sm font-bold">{data.planesExistenciales.intuitivo}</span>
                            </div>
                        </div>
                    </div>

                    {/* Regalo Divino */}
                    <div 
                        ref={(el) => { cardRefs.current[7] = el }}
                        className={`col-span-2 md:col-span-1 row-span-1 bg-slate-900 rounded-[2rem] p-6 lg:p-8 text-white soft-relief flex flex-col justify-center relative overflow-hidden transition-transform duration-300 hover:-translate-y-2 hover:shadow-lg shadow-2xl ${
                            !showingCards ? 'opacity-100' : ''
                        }`}
                        style={getCardStyle(7)}
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-20">
                            <span className="material-symbols-outlined text-4xl">auto_awesome</span>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Regalo Divino</p>
                        <div className="text-4xl font-light mb-3">{displayNum(data.regaloDivino)}</div>
                        <p className="text-xs text-slate-400 font-medium">Don innato que traes a esta vida.</p>
                    </div>
                </div>
            </section>

            {/* Right Sidebar - Info Panel */}
            <aside ref={sidebarRef} className="w-full xl:w-96 border-t xl:border-t-0 xl:border-l border-slate-100 p-8 pb-32 bg-white flex flex-col gap-8 shrink-0 opacity-0">
                <div>
                    <h3 className="text-xs font-black uppercase tracking-widest mb-8 text-slate-800">Atributos de la Fecha</h3>
                    <div className="space-y-4">
                        <div className="p-5 bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-slate-50 rounded-2xl border border-indigo-100/50 soft-relief">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Talento (Día)</p>
                            <p className="text-2xl font-light flex items-center gap-2">
                                {displayNum(data.talento)}
                            </p>
                        </div>
                        <div className="p-5 bg-gradient-to-br from-pink-50/50 via-purple-50/30 to-slate-50 rounded-2xl border border-pink-100/50 soft-relief">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Karma (Mes)</p>
                            <p className="text-2xl font-light flex items-center gap-2">
                                {displayNum(data.karma)}
                            </p>
                        </div>
                        <div className="p-5 bg-gradient-to-br from-teal-50/50 via-green-50/30 to-slate-50 rounded-2xl border border-teal-100/50 soft-relief">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Vidas Pasadas (Año)</p>
                            <p className="text-2xl font-light flex items-center gap-2">
                                {displayNum(data.vidasPasadas)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sacred Geometry Decoration */}
                <div className="flex items-center justify-center py-8">
                    <div className="w-48 h-48 relative">
                        <svg className="w-full h-full animate-spin-slow opacity-30" viewBox="0 0 200 200" style={{ animationDuration: '30s' }}>
                            {/* Outer circle */}
                            <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-slate-400" />
                            <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-slate-300" />
                            <circle cx="100" cy="100" r="70" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-slate-300" />
                            
                            {/* Seed of Life pattern */}
                            <circle cx="100" cy="100" r="35" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-slate-600" />
                            <circle cx="100" cy="65" r="35" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-slate-600" />
                            <circle cx="130.3" cy="82.5" r="35" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-slate-600" />
                            <circle cx="130.3" cy="117.5" r="35" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-slate-500" />
                            <circle cx="100" cy="135" r="35" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-slate-500" />
                            <circle cx="69.7" cy="117.5" r="35" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-slate-500" />
                            <circle cx="69.7" cy="82.5" r="35" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-slate-500" />
                            
                            {/* Geometric lines */}
                            <line x1="100" y1="10" x2="100" y2="190" stroke="currentColor" strokeWidth="0.3" className="text-slate-300" />
                            <line x1="10" y1="100" x2="190" y2="100" stroke="currentColor" strokeWidth="0.3" className="text-slate-300" />
                            <line x1="25" y1="25" x2="175" y2="175" stroke="currentColor" strokeWidth="0.3" className="text-slate-300" />
                            <line x1="175" y1="25" x2="25" y2="175" stroke="currentColor" strokeWidth="0.3" className="text-slate-300" />
                            
                            {/* Decorative dots */}
                            <circle cx="100" cy="10" r="2" fill="currentColor" className="text-slate-500" />
                            <circle cx="190" cy="100" r="2" fill="currentColor" className="text-slate-500" />
                            <circle cx="100" cy="190" r="2" fill="currentColor" className="text-slate-500" />
                            <circle cx="10" cy="100" r="2" fill="currentColor" className="text-slate-500" />
                            <circle cx="175" cy="25" r="2" fill="currentColor" className="text-slate-400" />
                            <circle cx="25" cy="175" r="2" fill="currentColor" className="text-slate-400" />
                            <circle cx="175" cy="175" r="2" fill="currentColor" className="text-slate-400" />
                            <circle cx="25" cy="25" r="2" fill="currentColor" className="text-slate-400" />
                            
                            {/* Center accent */}
                            <circle cx="100" cy="100" r="4" fill="currentColor" className="text-slate-700" />
                        </svg>
                    </div>
                </div>

                <div className="mt-auto">
                    <div className="bg-teal-50 rounded-[2rem] p-8 border border-teal-100 soft-relief relative overflow-hidden">
                        <div className="absolute -top-4 -right-4 text-teal-200/50">
                            <span className="material-symbols-outlined text-6xl">all_inclusive</span>
                        </div>
                        <p className="text-xs font-black uppercase mb-3 text-teal-800 tracking-widest">Camino de Vida</p>
                        <p className="text-4xl font-light text-teal-900 mb-2">{displayNum(data.caminoDeVida)}</p>
                        <p className="text-xs text-teal-900/80 leading-relaxed font-semibold">La síntesis de tu fecha de nacimiento y el sendero principal de tu existencia.</p>
                    </div>
                </div>
            </aside>

            {/* Floating Action Button */}
            <Link href="/exportar" className="fixed bottom-10 right-10 bg-black-accent text-white px-10 py-5 rounded-full font-bold text-xs tracking-[0.2em] uppercase flex items-center gap-4 hover:scale-[1.05] active:scale-[0.95] transition-all shadow-2xl z-50 group">
                Previsualizar PDF
                <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">picture_as_pdf</span>
            </Link>
        </div>
    );
}

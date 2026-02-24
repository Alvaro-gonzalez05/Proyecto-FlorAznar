'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';

type NumerologyResult = any;

/** Helper to display a numerology number, showing special notation if present */
function displayNum(n: { digit: number; isMaster: boolean, isKarmic: boolean, masterValue?: number, karmicValue?: number } | undefined): string {
    if (!n) return '-';
    if (n.isMaster) return `${n.masterValue}/${n.digit}`;
    if (n.isKarmic) return `${n.karmicValue}/${n.digit}`;
    return String(n.digit);
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

    // Total de cartas estático, mostramos Sistema Familiar aunque caiga en fallback
    const totalCards = 11;

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
            gsap.set(firstCard, { y: 60, opacity: 0, scale: 0.95 });
            gsap.to(firstCard, {
                y: 0,
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
            gsap.set(currentCard, { y: 60, opacity: 0, scale: 0.95 });
            gsap.to(currentCard, {
                y: 0,
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
            if (currentCard) {
                gsap.to(currentCard, {
                    y: -50,
                    opacity: 0,
                    scale: 1.05,
                    duration: 0.38,
                    ease: 'power2.in',
                    onComplete: () => {
                        gsap.set(currentCard, { clearProps: 'y,scale,opacity' });
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

    const getCardStyle = (cardIndex: number, wide = false): React.CSSProperties => {
        if (!showingCards) return { opacity: 1 }; // Forzamos visibilidad luego de que GSAP lo revele
        if (currentCardIndex === cardIndex) {
            return {
                position: 'fixed',
                top: '46%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '85vw',
                maxWidth: wide ? '650px' : '500px',
                maxHeight: '80vh',
                overflowY: 'auto',
                zIndex: 9999,
                opacity: 0,
            };
        }
        if (currentCardIndex > cardIndex) {
            return {
                opacity: 0,
                filter: 'blur(3px)',
                transition: 'opacity 0.2s ease-out',
                display: 'none' // Evita que se amontonen las tarjetas visitadas tras la central
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
                        <div className="absolute inset-0 sacred-geo-bg opacity-40"></div>
                        <div className="relative z-10 text-center">
                            <h3 className="text-sm font-extrabold uppercase tracking-widest mb-10 text-slate-600">Vibración Interna</h3>
                            <div className="relative w-64 h-64 md:w-72 md:h-72 mb-8 flex items-center justify-center mx-auto">
                                <svg className="absolute inset-0 w-full h-full text-black-accent/10 animate-spin-slow" viewBox="0 0 100 100" style={{ animationDuration: '40s' }}>
                                    <circle cx="50" cy="50" fill="none" r="45" stroke="currentColor" strokeWidth="0.25"></circle>
                                    <circle cx="50" cy="50" fill="none" r="32" stroke="currentColor" strokeWidth="0.25"></circle>
                                    <path d="M50 5 L50 95 M5 50 L95 50" stroke="currentColor" strokeWidth="0.25"></path>
                                    <polygon fill="none" points="50,5 95,50 50,95 5,50" stroke="currentColor" strokeWidth="0.25"></polygon>
                                </svg>
                                <div className="flex flex-col items-center justify-center">
                                    <span className="text-7xl md:text-8xl font-thin tracking-tighter text-black-accent relative">
                                        {displayNum(data?.primeraParte?.vibracionInterna)}
                                        {data?.primeraParte?.vibracionInterna?.isMaster && (
                                            <span className="absolute -top-4 -right-4 text-amber-500/40 text-4xl material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                                        )}
                                        {data?.primeraParte?.vibracionInterna?.isKarmic && (
                                            <span className="absolute -top-4 -right-4 text-rose-500/40 text-4xl material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                                        )}
                                    </span>
                                    <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mt-2">
                                        {data?.primeraParte?.vibracionInterna?.isMaster ? 'Número Maestro' : data?.primeraParte?.vibracionInterna?.isKarmic ? 'Deuda Kármica' : 'Esencia Vital'}
                                    </span>
                                </div>
                            </div>
                            <p className="text-dark-gray text-sm leading-relaxed max-w-xs mx-auto font-medium">
                                Tu vibración central irradia una frecuencia única que define tu potencial energético.
                            </p>
                        </div>
                    </div>

                    {/* 1. Misión */}
                    <div
                        ref={(el) => { cardRefs.current[1] = el }}
                        className="col-span-2 md:col-span-1 row-span-1 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-[2rem] p-6 lg:p-8 flex flex-col justify-between soft-relief transition-transform duration-300 hover:-translate-y-2 hover:shadow-lg"
                        style={getCardStyle(1)}
                    >
                        <div>
                            <span className="material-symbols-outlined text-teal-600 mb-4 bg-white/60 p-2 rounded-xl">psychology</span>
                            <h4 className="text-[10px] font-black text-teal-900 uppercase tracking-widest">Misión</h4>
                        </div>
                        <div>
                            <div className="text-4xl lg:text-5xl font-light mb-1 text-teal-950">{displayNum(data?.primeraParte?.calculoMision)}</div>
                            <p className="text-xs text-teal-900/70 font-semibold leading-snug">Propósito central.</p>
                        </div>
                    </div>

                    {/* 2. Alma */}
                    <div
                        ref={(el) => { cardRefs.current[2] = el }}
                        className="col-span-2 md:col-span-1 row-span-1 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-[2rem] p-6 lg:p-8 flex flex-col justify-between soft-relief transition-transform duration-300 hover:-translate-y-2 hover:shadow-lg"
                        style={getCardStyle(2)}
                    >
                        <div>
                            <span className="material-symbols-outlined text-indigo-600 mb-4 bg-white/60 p-2 rounded-xl">favorite</span>
                            <h4 className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">Alma</h4>
                        </div>
                        <div>
                            <div className="text-4xl lg:text-5xl font-light mb-1 text-indigo-950">{displayNum(data?.primeraParte?.calculoAlma)}</div>
                            <p className="text-xs text-indigo-900/70 font-semibold leading-snug">Deseo interno.</p>
                        </div>
                    </div>

                    {/* 3. Camino de Vida */}
                    <div
                        ref={(el) => { cardRefs.current[3] = el }}
                        className="col-span-2 md:col-span-1 row-span-1 bg-gradient-to-br from-orange-50 to-amber-50 rounded-[2rem] p-6 lg:p-8 flex flex-col justify-between soft-relief transition-transform duration-300 hover:-translate-y-2 hover:shadow-lg"
                        style={getCardStyle(3)}
                    >
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
                        className="col-span-2 md:col-span-1 row-span-1 bg-gradient-to-br from-rose-50 to-pink-50 rounded-[2rem] p-6 lg:p-8 flex flex-col justify-between soft-relief transition-transform duration-300 hover:-translate-y-2 hover:shadow-lg"
                        style={getCardStyle(4)}
                    >
                        <div>
                            <span className="material-symbols-outlined text-rose-600 mb-4 bg-white/60 p-2 rounded-xl">wb_sunny</span>
                            <h4 className="text-[10px] font-black text-rose-900 uppercase tracking-widest">Personalidad</h4>
                        </div>
                        <div>
                            <div className="text-4xl lg:text-5xl font-light mb-1 text-rose-950">{displayNum(data?.primeraParte?.calculoPersonalidad)}</div>
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
                            <div className="bg-slate-50 rounded-2xl p-4 flex flex-col gap-1 border border-slate-100/50">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Número de Fuerza</p>
                                <p className="text-3xl font-light text-slate-800">{displayNum(data?.primeraParte?.potenciadores?.numeroDeFuerza)}</p>
                                <p className="text-[10px] text-slate-500">Misión + Camino de Vida</p>
                            </div>
                            <div className="bg-slate-50 rounded-2xl p-4 flex flex-col gap-1 border border-slate-100/50">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Número de Equilibrio</p>
                                <p className="text-3xl font-light text-slate-800">{displayNum(data?.primeraParte?.potenciadores?.numeroDeEquilibrio)}</p>
                                <p className="text-[10px] text-slate-500">Iniciales del nombre</p>
                            </div>
                            <div className="bg-slate-50 rounded-2xl p-4 flex flex-col gap-1 border border-slate-100/50">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Número de Sombra</p>
                                <p className="text-3xl font-light text-slate-800">{displayNum(data?.primeraParte?.potenciadores?.numeroDeSombra)}</p>
                                <p className="text-[10px] text-slate-500">Puntos ciegos o miedos</p>
                            </div>
                            <div className="bg-slate-50 rounded-2xl p-4 flex flex-col gap-1 border border-slate-100/50">
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
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">layers</span>
                            Planos Existenciales
                        </p>
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
                            <div>
                                <p className="text-[9px] text-slate-400 font-bold uppercase mb-1">Año Personal</p>
                                <p className="text-3xl font-light">{displayNum(data?.primeraParte?.potenciadores?.anioPersonal)}</p>
                            </div>
                            <div>
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
                            <div className="bg-blue-50/50 rounded-xl p-3 border border-blue-100/50">
                                <p className="text-[9px] font-bold text-blue-800 uppercase mb-1">Talento</p>
                                <p className="text-2xl font-light text-blue-900">{displayNum(data?.primeraParte?.fechaNacimiento?.talento)}</p>
                            </div>
                            <div className="bg-pink-50/50 rounded-xl p-3 border border-pink-100/50">
                                <p className="text-[9px] font-bold text-pink-800 uppercase mb-1">Karma</p>
                                <p className="text-2xl font-light text-pink-900">{displayNum(data?.primeraParte?.fechaNacimiento?.karmaMes)}</p>
                            </div>
                            <div className="bg-teal-50/50 rounded-xl p-3 border border-teal-100/50">
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
                        <div className="flex items-center gap-3 justify-between mb-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-red-800 flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">history_toggle_off</span>
                                Conteo de Letras Nombres
                            </p>
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
                                            <div className="bg-gradient-to-br from-indigo-50 to-blue-50/60 rounded-[2.5rem] p-8 border border-indigo-100 flex flex-col items-center justify-center text-center shadow-[inset_0_2px_10px_rgba(255,255,255,1)] hover:shadow-md transition-shadow">
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-3">Herencia</p>
                                                <p className="text-5xl md:text-6xl font-light text-slate-700">{displayNum(data.segundaParte.herenciaFamiliar)}</p>
                                            </div>
                                            <div className="bg-gradient-to-br from-violet-50 to-fuchsia-50/60 rounded-[2.5rem] p-8 border border-violet-100 flex flex-col items-center justify-center text-center shadow-[inset_0_2px_10px_rgba(255,255,255,1)] hover:shadow-md transition-shadow">
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-400 mb-3">Evolución</p>
                                                <p className="text-5xl md:text-6xl font-light text-slate-700">{displayNum(data.segundaParte.evolucionFamiliar)}</p>
                                            </div>
                                            <div className="bg-gradient-to-br from-emerald-50 to-teal-50/60 rounded-[2.5rem] p-8 border border-emerald-100 flex flex-col items-center justify-center text-center shadow-[inset_0_2px_10px_rgba(255,255,255,1)] hover:shadow-md transition-shadow">
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/70 mb-3">Expresión</p>
                                                <p className="text-5xl md:text-6xl font-light text-slate-700">{displayNum(data.segundaParte.campoDeExpresion)}</p>
                                            </div>
                                            <div className="bg-gradient-to-br from-amber-50 to-orange-50/60 rounded-[2.5rem] p-8 border border-amber-100 flex flex-col items-center justify-center text-center shadow-[inset_0_2px_10px_rgba(255,255,255,1)] hover:shadow-md transition-shadow">
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500/70 mb-3">Potencial</p>
                                                <p className="text-5xl md:text-6xl font-light text-slate-700">{displayNum(data.segundaParte.potencialEvolutivo)}</p>
                                            </div>
                                        </div>

                                        {/* Right Side: Linajes & Puente */}
                                        <div className="lg:col-span-5 flex flex-col gap-4">
                                            <div className="bg-slate-50/70 rounded-[2.5rem] border border-slate-100 p-8 flex-1 flex flex-col shadow-inner">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex justify-between items-center">
                                                    Desglose de Linajes
                                                    <span className="material-symbols-outlined text-[18px] text-slate-300">account_tree</span>
                                                </p>
                                                <div className="flex-1 space-y-3 mb-6 flex flex-col justify-center">
                                                    {data.segundaParte.linajes.map((linaje: any, idx: number) => (
                                                        <div key={idx} className="flex justify-between items-center bg-white px-5 py-4 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 transition-all hover:border-slate-300">
                                                            <span className="text-sm font-bold capitalize text-slate-600">{linaje.nombre.toLowerCase()}</span>
                                                            <div className="bg-slate-50 px-3 py-1 rounded-xl border border-slate-200">
                                                                <span className="font-bold text-slate-800 text-lg">{displayNum(linaje.reduccion)}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="mt-auto pt-6 border-t border-slate-200/60 text-center bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
                                                    <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">Puente de Evolución</p>
                                                    <p className="text-4xl font-light text-slate-800">{data.segundaParte.puentes.evolucion}</p>
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
                </div>
            </section>
        </div>
    );
}


'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';

export default function ResultadosPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLElement>(null);
    const sidebarRef = useRef<HTMLElement>(null);
    const mainSectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Efecto "Materialización Energética"
            // En lugar de moverse, los elementos se "solidifican" desde la energía
            const tl = gsap.timeline({ 
                defaults: { ease: "power2.out", duration: 1 }
            });

            const header = headerRef.current;
            const sidebar = sidebarRef.current;
            const gridItems = containerRef.current ? Array.from(containerRef.current.children) : [];

            // 1. Estado Inicial Místico:
            // Invisible + Un poco pequeño + BORROSO (Blur)
            // Esto da la sensación de que se están formando desde el éter
            gsap.set([header, sidebar, ...gridItems], { 
                autoAlpha: 0, 
                scale: 0.95, 
                filter: "blur(10px)" 
            });

            // 2. Secuencia de Enfoque

            // Header
            tl.to(header, { 
                autoAlpha: 1, 
                scale: 1, 
                filter: "blur(0px)" // Se enfoca suavemente
            });

            // Grid Cards (Una por una)
            if (gridItems.length > 0) {
                tl.to(gridItems, {
                    autoAlpha: 1,
                    scale: 1,
                    filter: "blur(0px)",
                    stagger: 0.1, // Ritmo constante
                    clearProps: "transform" // Liberar el transform para que funcionen los hovers CSS
                }, "-=0.6"); // Empieza mientras el header termina
            }

            // Sidebar
            tl.to(sidebar, { 
                autoAlpha: 1, 
                scale: 1, 
                filter: "blur(0px)" 
            }, "-=0.4");

        }); 

        return () => ctx.revert();
    }, []);

    return (
        <div className="flex flex-col xl:flex-row h-full w-full overflow-hidden">
            {/* Main Content Area */}
            <section ref={mainSectionRef} className="flex-1 p-6 lg:p-10 overflow-y-auto" id="results-container">
                <header ref={headerRef} className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 opacity-0">
                    <div>
                        <h1 className="text-xs uppercase tracking-[0.5em] font-bold text-slate-500 mb-1">Resultado de Análisis</h1>
                        <h2 className="text-3xl font-extrabold tracking-tight">Síntesis Energética</h2>
                    </div>
                    <div className="flex items-center gap-4 self-end md:self-auto">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold">Sofía Martínez</p>
                            <p className="text-xs text-slate-500">24 de Mayo, 1990</p>
                        </div>
                    </div>
                </header>

                <div ref={containerRef} className="bento-grid">
                    {/* Main Card - Essence */}
                    <div className="col-span-4 md:col-span-2 row-span-2 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-[3rem] soft-relief p-10 flex flex-col items-center justify-center relative overflow-hidden transition-transform duration-300 hover:-translate-y-2 hover:shadow-lg opacity-0">
                        <div className="absolute inset-0 sacred-geo-bg opacity-40"></div>
                        <div className="spiritual-aura"></div>
                        <div className="relative z-10 text-center">
                            <h3 className="text-sm font-extrabold uppercase tracking-widest mb-10 text-slate-600">Esencia Vital</h3>
                            <div className="relative w-64 h-64 md:w-72 md:h-72 mb-8 flex items-center justify-center">
                                <svg className="absolute inset-0 w-full h-full text-black-accent/10" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" fill="none" r="45" stroke="currentColor" strokeWidth="0.25"></circle>
                                    <circle cx="50" cy="50" fill="none" r="32" stroke="currentColor" strokeWidth="0.25"></circle>
                                    <path d="M50 5 L50 95 M5 50 L95 50" stroke="currentColor" strokeWidth="0.25"></path>
                                    <polygon fill="none" points="50,5 95,50 50,95 5,50" stroke="currentColor" strokeWidth="0.25"></polygon>
                                </svg>
                                <div className="flex flex-col items-center justify-center">
                                    <span className="text-7xl md:text-8xl font-thin tracking-tighter text-black-accent relative">
                                        33
                                        <span className="absolute -top-4 -right-4 text-amber-500/40 text-4xl material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                                    </span>
                                    <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mt-2">Número Maestro</span>
                                </div>
                            </div>
                            <p className="text-dark-gray text-sm leading-relaxed max-w-xs mx-auto font-medium">
                                Tu vibración central irradia una frecuencia de servicio universal y compasión elevada.
                            </p>
                        </div>
                    </div>

                    {/* Mission */}
                    <div className="col-span-2 md:col-span-1 row-span-1 pastel-gradient-mint rounded-[2rem] p-6 lg:p-8 flex flex-col justify-between soft-relief group hover:scale-[1.03] transition-all duration-300 hover:-translate-y-2 opacity-0">
                        <div>
                            <span className="material-symbols-outlined text-teal-600 mb-4 bg-white/50 p-2 rounded-xl" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                            <h4 className="text-[10px] font-black text-teal-900 uppercase tracking-widest">Misión</h4>
                        </div>
                        <div>
                            <div className="text-4xl lg:text-5xl font-light mb-1 text-teal-950">11</div>
                            <p className="text-xs text-teal-900/70 font-semibold leading-snug">Iluminación e intuición espiritual superior.</p>
                        </div>
                    </div>

                    {/* Soul */}
                    <div className="col-span-2 md:col-span-1 row-span-1 pastel-gradient-lavender rounded-[2rem] p-6 lg:p-8 flex flex-col justify-between soft-relief group hover:scale-[1.03] transition-all duration-300 hover:-translate-y-2 opacity-0">
                        <div>
                            <span className="material-symbols-outlined text-indigo-600 mb-4 bg-white/50 p-2 rounded-xl" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                            <h4 className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">Alma</h4>
                        </div>
                        <div>
                            <div className="text-4xl lg:text-5xl font-light mb-1 text-indigo-950">7</div>
                            <p className="text-xs text-indigo-900/70 font-semibold leading-snug">Búsqueda profunda de la verdad interna.</p>
                        </div>
                    </div>

                    {/* Destiny */}
                    <div className="col-span-2 md:col-span-1 row-span-1 pastel-gradient-peach rounded-[2rem] p-6 lg:p-8 flex flex-col justify-between soft-relief group hover:scale-[1.03] transition-all duration-300 hover:-translate-y-2 opacity-0">
                        <div>
                            <span className="material-symbols-outlined text-orange-600 mb-4 bg-white/50 p-2 rounded-xl" style={{ fontVariationSettings: "'FILL' 1" }}>flare</span>
                            <h4 className="text-[10px] font-black text-orange-900 uppercase tracking-widest">Destino</h4>
                        </div>
                        <div>
                            <div className="text-4xl lg:text-5xl font-light mb-1 text-orange-950">22</div>
                            <p className="text-xs text-orange-900/70 font-semibold leading-snug">Capacidad para materializar sueños grandes.</p>
                        </div>
                    </div>

                    {/* Personality */}
                    <div className="col-span-2 md:col-span-1 row-span-1 pastel-gradient-rose rounded-[2rem] p-6 lg:p-8 flex flex-col justify-between soft-relief group hover:scale-[1.03] transition-all duration-300 hover:-translate-y-2 opacity-0">
                        <div>
                            <span className="material-symbols-outlined text-rose-600 mb-4 bg-white/50 p-2 rounded-xl" style={{ fontVariationSettings: "'FILL' 1" }}>wb_sunny</span>
                            <h4 className="text-[10px] font-black text-rose-900 uppercase tracking-widest">Personalidad</h4>
                        </div>
                        <div>
                            <div className="text-4xl lg:text-5xl font-light mb-1 text-rose-950">9</div>
                            <p className="text-xs text-rose-900/70 font-semibold leading-snug">Carisma humanitario y cierre de ciclos.</p>
                        </div>
                    </div>

                    {/* Cycles Trend */}
                    <div className="col-span-4 md:col-span-2 row-span-2 bg-white rounded-[3rem] soft-relief p-8 md:p-10 overflow-hidden flex flex-col justify-center transition-transform duration-300 hover:-translate-y-2 hover:shadow-lg opacity-0">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-400">update</span>
                            Tendencias de Ciclo Actual
                        </h3>
                        <div className="space-y-6">
                            <div className="flex gap-4 items-start">
                                <div className="w-1.5 h-12 bg-teal-300 rounded-full shadow-sm shrink-0"></div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 truncate">Vibración Anual</p>
                                    <p className="text-sm text-dark-gray font-medium leading-snug">Año 5: Un periodo de expansión, libertad y cambios significativos en tu estructura profesional.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="w-1.5 h-12 bg-indigo-300 rounded-full shadow-sm shrink-0"></div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 truncate">Desafío Mayor</p>
                                    <p className="text-sm text-dark-gray font-medium leading-snug">Número 2: Aprender a colaborar sin perder tu identidad y gestionar las emociones sensibles.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="w-1.5 h-12 bg-orange-300 rounded-full shadow-sm shrink-0"></div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 truncate">Oportunidad</p>
                                    <p className="text-sm text-dark-gray font-medium leading-snug">Conexión con el elemento aire para comunicar ideas visionarias a gran escala.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Compatibility */}
                    <div className="col-span-2 md:col-span-1 row-span-1 bg-white rounded-[2rem] p-6 lg:p-8 soft-relief flex items-center justify-center group hover:bg-slate-50 transition-all duration-300 hover:-translate-y-2 opacity-0">
                        <div className="text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Compatibilidad</p>
                            <div className="flex justify-center -space-x-3">
                                <div className="w-10 h-10 rounded-full bg-mint border-4 border-white flex items-center justify-center text-xs font-black shadow-sm">1</div>
                                <div className="w-10 h-10 rounded-full bg-lavender border-4 border-white flex items-center justify-center text-xs font-black shadow-sm">5</div>
                                <div className="w-10 h-10 rounded-full bg-peach border-4 border-white flex items-center justify-center text-xs font-black shadow-sm">8</div>
                            </div>
                        </div>
                    </div>

                    {/* Potential */}
                    <div className="col-span-2 md:col-span-1 row-span-1 bg-slate-900 rounded-[2rem] p-6 lg:p-8 text-white soft-relief flex flex-col justify-center relative overflow-hidden transition-transform duration-300 hover:-translate-y-2 hover:shadow-lg opacity-0">
                        <div className="absolute top-0 right-0 p-4 opacity-20">
                            <span className="material-symbols-outlined text-4xl">bolt</span>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Potencial Actual</p>
                        <div className="text-4xl font-light mb-3">94%</div>
                        <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                            <div className="w-[94%] bg-gradient-to-r from-teal-400 to-indigo-400 h-full rounded-full"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Right Sidebar - Info Panel */}
            <aside ref={sidebarRef} className="w-full xl:w-96 border-t xl:border-t-0 xl:border-l border-slate-100 p-8 pb-32 bg-white flex flex-col gap-8 shrink-0 opacity-0">
                <div>
                    <h3 className="text-xs font-black uppercase tracking-widest mb-8 text-slate-800">Atributos Clave</h3>
                    <div className="space-y-4">
                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 soft-relief">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Elemento Dominante</p>
                            <p className="text-sm font-bold flex items-center gap-2">
                                <span className="material-symbols-outlined text-teal-500 text-lg">air</span>
                                Éter / Aire
                            </p>
                        </div>
                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 soft-relief">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Color de Aura</p>
                            <p className="text-sm font-bold flex items-center gap-3">
                                <span className="w-4 h-4 rounded-full bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.5)]"></span>
                                Violeta Cristalino
                            </p>
                        </div>
                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 soft-relief">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Arquetipo</p>
                            <p className="text-sm font-bold italic text-indigo-900">El Visionario Maestro</p>
                        </div>
                    </div>
                </div>
                
                <div className="mt-auto">
                    <div className="bg-teal-50 rounded-[2rem] p-8 border border-teal-100 soft-relief relative overflow-hidden">
                        <div className="absolute -top-4 -right-4 text-teal-200/50">
                            <span className="material-symbols-outlined text-6xl">calendar_month</span>
                        </div>
                        <p className="text-xs font-black uppercase mb-3 text-teal-800 tracking-widest">Próximo Hito</p>
                        <p className="text-xs text-teal-900/80 leading-relaxed font-semibold mb-6">Tu próximo pico energético ocurre en 12 días durante la Luna Nueva.</p>
                        <div className="h-1.5 bg-white/60 rounded-full w-full">
                            <div className="h-full bg-teal-500 w-1/3 rounded-full shadow-sm"></div>
                        </div>
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

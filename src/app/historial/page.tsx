
'use client';

import Link from 'next/link';
import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function HistorialPage() {
    const headerRef = useRef<HTMLElement>(null);
    const controlsRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    const sidebarRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ 
                defaults: { ease: "expo.out", duration: 1.5 } // Usamos expo.out para una sensación premium y suave
            });

            const gridItems = gridRef.current ? Array.from(gridRef.current.children) : [];
            const sidebarElements = sidebarRef.current ? Array.from(sidebarRef.current.children) : [];
            
            // 1. Estado Inicial: "Etereo"
            // Más desplazamiento, un poco de escala y blur
            gsap.set([headerRef.current, controlsRef.current, ...gridItems, ...sidebarElements], {
                autoAlpha: 0,
                y: 40, 
                scale: 0.95, // Efecto de "crecimiento" al aparecer
                filter: "blur(8px)", 
                willChange: "transform, opacity, filter"
            });

            // 2. Orquestación Cinematográfica
            
            // Header: Aparece majestuosamente
            tl.to(headerRef.current, {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                filter: "blur(0px)",
                clearProps: "willChange,filter" // Limpiar filter es clave para nitidez
            });

            // Controles: Se deslizan suavemente justo después
            tl.to(controlsRef.current, {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                filter: "blur(0px)",
                clearProps: "willChange,filter"
            }, "<0.1"); 

            // Grid Cards: Cascada rápida y fluida
            if (gridItems.length > 0) {
                tl.to(gridItems, {
                    autoAlpha: 1,
                    y: 0,
                    scale: 1,
                    filter: "blur(0px)",
                    stagger: {
                        amount: 0.6, // Tiempo total para que aparezcan todos
                        from: "start"
                    }, 
                    clearProps: "transform,willChange,filter" // Solo limpiamos lo necesario
                }, "<0.2"); // Solapamiento agresivo
            }

            // Sidebar: Cierra la composición
            if (sidebarElements.length > 0) {
                tl.to(sidebarElements, {
                    autoAlpha: 1,
                    y: 0,
                    scale: 1,
                    filter: "blur(0px)",
                    stagger: 0.1,
                    clearProps: "willChange,filter"
                }, "<0.4"); 
            }
        });

        return () => ctx.revert();
    }, []);

    return (
        <div className="flex flex-col lg:flex-row h-full overflow-hidden">
            {/* Main Content */}
            <main className="flex-1 overflow-y-auto px-8 lg:px-12 py-10 scrollbar-hide">
                <header ref={headerRef} className="mb-12 opacity-0">
                    <div className="flex items-center gap-2 text-slate-400 mb-4">
                        <Link href="/" className="flex items-center gap-2 hover:text-black-accent transition-colors">
                            <span className="material-symbols-outlined text-sm">home</span>
                            <span className="text-xs uppercase tracking-widest font-bold">Dashboard</span>
                        </Link>
                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                        <span className="text-xs uppercase tracking-widest font-bold text-black-accent">Registro</span>
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-light tracking-tight text-black-accent">
                        Tu Registro de <span className="font-bold">Consultas</span>
                    </h1>
                </header>

                <div ref={controlsRef} className="flex flex-col md:flex-row gap-4 mb-10 items-center justify-between opacity-0">
                    <div className="relative w-full md:w-96">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input className="w-full pl-12 pr-4 py-3 bg-white border-none rounded-2xl soft-shadow text-sm focus:ring-2 focus:ring-lavender transition-all" placeholder="Buscar por nombre o fecha..." type="text" />
                    </div>
                    <div className="flex gap-3">
                        <button className="px-6 py-3 bg-white rounded-xl text-xs font-bold uppercase tracking-widest border border-slate-100 flex items-center gap-2 hover:bg-slate-50 transition-colors">
                            <span className="material-symbols-outlined text-sm">filter_list</span> Filtrar
                        </button>
                        <Link href="/nueva-consulta" className="px-6 py-3 bg-black-accent text-white rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-all">
                            <span className="material-symbols-outlined text-sm">add</span> Nueva
                        </Link>
                    </div>
                </div>

                <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 pb-12">
                    {/* Card 1 */}
                    <div className="opacity-0 bg-white p-7 rounded-3xl border border-slate-50 soft-shadow group hover:border-mint hover:-translate-y-2 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
                        <div className="flex justify-between items-start mb-8">
                            <div className="w-12 h-12 bg-mint rounded-2xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-emerald-800/60">fingerprint</span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[9px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full mb-2">Enviado</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">#0124</span>
                            </div>
                        </div>
                        <h4 className="text-xl font-bold mb-1 tracking-tight group-hover:text-emerald-900 transition-colors">Sofía Martínez</h4>
                        <div className="flex flex-col gap-1 mb-6">
                            <div className="flex items-center gap-2 text-slate-400">
                                <span className="material-symbols-outlined text-sm">cake</span>
                                <p className="text-xs tracking-wider">24 OCT 1992</p>
                            </div>
                            <div className="flex items-center gap-2 text-slate-400">
                                <span className="material-symbols-outlined text-sm">calendar_today</span>
                                <p className="text-xs tracking-wider">Hace 2 horas</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between pt-5 border-t border-slate-50">
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Arquetipo</span>
                                <span className="text-xl font-light italic">Destino <span className="font-bold not-italic">11</span></span>
                            </div>
                            <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-mint group-hover:text-emerald-800 transition-all">
                                <span className="material-symbols-outlined text-lg">arrow_outward</span>
                            </button>
                        </div>
                    </div>

                    {/* Card 2 */}
                    <div className="opacity-0 bg-white p-7 rounded-3xl border border-slate-50 soft-shadow group hover:border-lavender hover:-translate-y-2 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
                        <div className="flex justify-between items-start mb-8">
                            <div className="w-12 h-12 bg-lavender rounded-2xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-purple-800/60">self_improvement</span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[9px] font-bold uppercase tracking-widest bg-amber-50 text-amber-600 px-3 py-1 rounded-full mb-2">Pendiente</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">#0123</span>
                            </div>
                        </div>
                        <h4 className="text-xl font-bold mb-1 tracking-tight group-hover:text-purple-900 transition-colors">Julián Ricci</h4>
                        <div className="flex flex-col gap-1 mb-6">
                            <div className="flex items-center gap-2 text-slate-400">
                                <span className="material-symbols-outlined text-sm">cake</span>
                                <p className="text-xs tracking-wider">12 FEB 1985</p>
                            </div>
                            <div className="flex items-center gap-2 text-slate-400">
                                <span className="material-symbols-outlined text-sm">calendar_today</span>
                                <p className="text-xs tracking-wider">Ayer, 14:20</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between pt-5 border-t border-slate-50">
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Arquetipo</span>
                                <span className="text-xl font-light italic">Alma <span className="font-bold not-italic">7</span></span>
                            </div>
                            <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-lavender group-hover:text-purple-800 transition-all">
                                <span className="material-symbols-outlined text-lg">arrow_outward</span>
                            </button>
                        </div>
                    </div>

                    {/* Card 3 */}
                    <div className="opacity-0 bg-white p-7 rounded-3xl border border-slate-50 soft-shadow group hover:border-peach hover:-translate-y-2 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
                        <div className="flex justify-between items-start mb-8">
                            <div className="w-12 h-12 bg-peach rounded-2xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-orange-800/60">all_inclusive</span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[9px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full mb-2">Enviado</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">#0122</span>
                            </div>
                        </div>
                        <h4 className="text-xl font-bold mb-1 tracking-tight group-hover:text-orange-900 transition-colors">Elena Vargas</h4>
                        <div className="flex flex-col gap-1 mb-6">
                            <div className="flex items-center gap-2 text-slate-400">
                                <span className="material-symbols-outlined text-sm">cake</span>
                                <p className="text-xs tracking-wider">05 SEP 1978</p>
                            </div>
                            <div className="flex items-center gap-2 text-slate-400">
                                <span className="material-symbols-outlined text-sm">calendar_today</span>
                                <p className="text-xs tracking-wider">22 May, 09:15</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between pt-5 border-t border-slate-50">
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Arquetipo</span>
                                <span className="text-xl font-light italic">Ciclo <span className="font-bold not-italic">22</span></span>
                            </div>
                            <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-peach group-hover:text-orange-800 transition-all">
                                <span className="material-symbols-outlined text-lg">arrow_outward</span>
                            </button>
                        </div>
                    </div>

                    {/* Card 4 */}
                    <div className="opacity-0 bg-white p-7 rounded-3xl border border-slate-50 soft-shadow group hover:border-mint hover:-translate-y-2 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
                        <div className="flex justify-between items-start mb-8">
                            <div className="w-12 h-12 bg-mint rounded-2xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-emerald-800/60">diversity_3</span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[9px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full mb-2">Enviado</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">#0121</span>
                            </div>
                        </div>
                        <h4 className="text-xl font-bold mb-1 tracking-tight group-hover:text-emerald-900 transition-colors">Lucas G.</h4>
                        <div className="flex flex-col gap-1 mb-6">
                            <div className="flex items-center gap-2 text-slate-400">
                                <span className="material-symbols-outlined text-sm">cake</span>
                                <p className="text-xs tracking-wider">30 DIC 1995</p>
                            </div>
                            <div className="flex items-center gap-2 text-slate-400">
                                <span className="material-symbols-outlined text-sm">calendar_today</span>
                                <p className="text-xs tracking-wider">18 May, 18:30</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between pt-5 border-t border-slate-50">
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Arquetipo</span>
                                <span className="text-xl font-light italic">Esencia <span className="font-bold not-italic">3</span></span>
                            </div>
                            <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-mint group-hover:text-emerald-800 transition-all">
                                <span className="material-symbols-outlined text-lg">arrow_outward</span>
                            </button>
                        </div>
                    </div>

                    {/* Card 5 */}
                    <div className="opacity-0 bg-white p-7 rounded-3xl border border-slate-50 soft-shadow group hover:border-lavender hover:-translate-y-2 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
                        <div className="flex justify-between items-start mb-8">
                            <div className="w-12 h-12 bg-lavender rounded-2xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-purple-800/60">psychology</span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[9px] font-bold uppercase tracking-widest bg-amber-50 text-amber-600 px-3 py-1 rounded-full mb-2">Pendiente</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">#0120</span>
                            </div>
                        </div>
                        <h4 className="text-xl font-bold mb-1 tracking-tight group-hover:text-purple-900 transition-colors">Ana Paula F.</h4>
                        <div className="flex flex-col gap-1 mb-6">
                            <div className="flex items-center gap-2 text-slate-400">
                                <span className="material-symbols-outlined text-sm">cake</span>
                                <p className="text-xs tracking-wider">15 JUN 1988</p>
                            </div>
                            <div className="flex items-center gap-2 text-slate-400">
                                <span className="material-symbols-outlined text-sm">calendar_today</span>
                                <p className="text-xs tracking-wider">15 May, 11:45</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between pt-5 border-t border-slate-50">
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Arquetipo</span>
                                <span className="text-xl font-light italic">Misión <span className="font-bold not-italic">8</span></span>
                            </div>
                            <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-lavender group-hover:text-purple-800 transition-all">
                                <span className="material-symbols-outlined text-lg">arrow_outward</span>
                            </button>
                        </div>
                    </div>

                    {/* New Analysis Card */}
                    <Link href="/nueva-consulta" className="bg-off-white p-7 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center group hover:border-black-accent/10 hover:-translate-y-2 hover:shadow-lg transition-all duration-300 cursor-pointer opacity-0">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 soft-shadow">
                            <span className="material-symbols-outlined text-slate-300 text-3xl">add</span>
                        </div>
                        <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Nuevo Análisis</p>
                        <p className="text-xs text-slate-300 mt-1 max-w-[150px]">Comienza una nueva lectura personalizada</p>
                    </Link>
                </div>
            </main>

            {/* Right Info Sidebar */}
            <aside ref={sidebarRef} className="w-80 border-l border-slate-100 p-8 bg-white hidden xl:flex flex-col shrink-0">
                <h3 className="text-sm font-bold uppercase tracking-widest mb-10 text-slate-400 opacity-0">Resumen del Mes</h3>
                <div className="space-y-8 opacity-0">
                    <div className="bg-off-white rounded-3xl p-8 border border-slate-50 relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-mint rounded-full blur-3xl opacity-50"></div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 relative z-10">Total Consultas</div>
                        <div className="text-5xl font-light mb-2 relative z-10 tracking-tighter">124</div>
                        <div className="flex items-center gap-2 text-emerald-600 relative z-10">
                            <span className="material-symbols-outlined text-sm">trending_up</span>
                            <span className="text-xs font-bold">+12% vs mes anterior</span>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Estados de Entrega</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center bg-emerald-50/30 p-4 rounded-2xl">
                                <div className="flex items-center gap-3">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    <span className="text-sm font-medium">Completados</span>
                                </div>
                                <span className="text-sm font-bold">118</span>
                            </div>
                            <div className="flex justify-between items-center bg-amber-50/30 p-4 rounded-2xl">
                                <div className="flex items-center gap-3">
                                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                    <span className="text-sm font-medium">Pendientes</span>
                                </div>
                                <span className="text-sm font-bold">6</span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 opacity-0">
                        <div className="bg-slate-900 text-white rounded-[2rem] p-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <span className="material-symbols-outlined text-6xl">auto_awesome</span>
                            </div>
                            <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-4">Meta Mensual</p>
                            <div className="flex items-end justify-between mb-2">
                                <h4 className="text-2xl font-light">82<span className="text-sm text-slate-500">/150</span></h4>
                                <span className="text-xs font-bold text-lavender">54%</span>
                            </div>
                            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-lavender h-full w-[54%] rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-auto pt-10">
                    <button className="w-full py-4 border border-slate-200 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-lg">download</span>
                        Exportar Reporte
                    </button>
                </div>
            </aside>
        </div>
    );
}


'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { supabase } from '@/lib/supabase';
import { Toaster, sileo } from 'sileo';
import 'sileo/styles.css';

// Helper function for Birthdays (prevents timezone shifts for YYYY-MM-DD)
function formatBirthday(dateString: string) {
    if (!dateString) return '-';
    // Split to ensure we treat it as local date parts
    const [year, month, day] = dateString.split('-').map(Number);
    if (!year || !month || !day) return dateString;

    const date = new Date(year, month - 1, day);
    const formatter = new Intl.DateTimeFormat('es-AR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
    return formatter.format(date).toUpperCase();
}

// Helper function to format the created_at DB timestamp
function formatDateDisplay(dateString: string) {
    const date = new Date(dateString);
    const formatter = new Intl.DateTimeFormat('es-AR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'America/Argentina/Buenos_Aires'
    });
    return formatter.format(date).toUpperCase();
}
function formatTimeDisplay(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Argentina/Buenos_Aires'
    });
}

export default function HistorialPage() {
    const headerRef = useRef<HTMLElement>(null);
    const controlsRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    const sidebarRef = useRef<HTMLElement>(null);
    const observerTarget = useRef<HTMLDivElement>(null);

    const [consults, setConsults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const isFirstLoad = useRef(true);
    const pageRef = useRef(0);
    const loadingMoreRef = useRef(false);
    const hasMoreRef = useRef(true);
    const ITEMS_PER_PAGE = 6;

    // Search & Date filter
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const nameRef = useRef('');
    const dateRef = useRef('');
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const dateInputRef = useRef<HTMLInputElement>(null);
    const initialLoadDone = useRef(false);

    const router = useRouter();

    const handleViewResults = (consult: any) => {
        if (consult.numerologia_data) {
            sessionStorage.setItem('numerologyResult', JSON.stringify(consult.numerologia_data));
        }
        if (consult.explicaciones_ia) {
            sessionStorage.setItem('geminiExplanations', JSON.stringify(consult.explicaciones_ia));
        }
        if (consult.id) {
            sessionStorage.setItem('consultaId', consult.id);
        }
        sessionStorage.removeItem('aiMetricsPayload');
        sessionStorage.removeItem('resumenAnalista');
        sessionStorage.removeItem('clientReportEdited');
        router.push('/resultados');
    };

    const handleDeleteConsult = (consult: any, e: React.MouseEvent) => {
        e.stopPropagation();

        sileo.action({
            title: "¿Eliminar Consulta?",
            description: `¿Estás segura de eliminar el registro de ${consult.nombre_completo}? Esta acción no se puede deshacer.`,
            fill: "#ffffff",
            icon: <span className="material-symbols-outlined text-red-500">warning</span>,
            styles: {
                title: "sileo-red-text font-bold",
                button: "sileo-red-button transition-colors",
                badge: "sileo-neutral-badge"
            },
            button: {
                title: "Confirmar Borrado",
                onClick: async () => {
                    try {
                        const { error } = await supabase
                            .from('consultas')
                            .delete()
                            .eq('id', consult.id);

                        if (error) {
                            console.error("Error de Supabase:", error);
                            // Si el error es de permisos (RLS), avisamos al usuario
                            if (error.code === '42501' || error.message.includes('policy')) {
                                alert("¡Atención! La base de datos rechazó el borrado. Debes habilitar el permiso de 'DELETE' en tu panel de Supabase para la tabla 'consultas'.");
                                return;
                            }
                            throw error;
                        }

                        // Actualizar estado local
                        setConsults(prev => prev.filter(c => c.id !== consult.id));
                        setTotalCount(prev => Math.max(0, prev - 1));

                        sileo.success({
                            title: "Eliminado",
                            description: "La consulta ha sido borrada exitosamente.",
                            duration: 3000
                        });
                    } catch (err: any) {
                        console.error("Error completo en borrado:", err);
                        sileo.error({
                            title: "Error",
                            description: "No se pudo eliminar de la base de datos.",
                            duration: 4000
                        });
                    }
                }
            }
        });
    };

    // Data Fetch with Pagination + Filters
    const fetchHistory = useCallback(async (pageToLoad: number) => {
        try {
            // Only show full-page loading on very first load
            if (pageToLoad === 0 && !initialLoadDone.current) {
                setLoading(true);
            } else if (pageToLoad > 0) {
                setLoadingMore(true);
                loadingMoreRef.current = true;
            }

            const from = pageToLoad * ITEMS_PER_PAGE;
            const to = from + ITEMS_PER_PAGE - 1;

            let query = supabase
                .from('consultas')
                .select('*', pageToLoad === 0 ? { count: 'exact' } : undefined)
                .order('created_at', { ascending: false });

            // Apply name filter (server-side)
            const term = nameRef.current.trim();
            if (term) {
                // Use ILIKE with wildcards for partial match
                query = query.ilike('nombre_completo', `%${term}%`);
            }

            // Apply date filter (server-side)
            if (dateRef.current) {
                const startOfDay = `${dateRef.current}T00:00:00`;
                const endOfDay = `${dateRef.current}T23:59:59`;
                query = query.gte('created_at', startOfDay).lte('created_at', endOfDay);
            }

            const { data, error, count } = await query.range(from, to);

            // Handle potential errors, but be permissive if data exists
            if (error) {
                if (data === null) {
                    console.warn("Supabase fetch error:", error);
                    // Often an abortion or network hiccup, don't crash the app
                    return; 
                }
                // If data exists despite error, log warning but continue
                console.warn("Supabase returned data with error warning:", error);
            }

            if (data) {
                if (pageToLoad === 0) {
                    setConsults(data);
                    if (count !== null) setTotalCount(count);
                } else {
                    setConsults(prev => [...prev, ...data]);
                }
                
                if (data.length < ITEMS_PER_PAGE) {
                    setHasMore(false);
                    hasMoreRef.current = false;
                }
            }

            initialLoadDone.current = true;
        } catch (err: any) {
            console.error("Error fetching history:", err?.message || err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
            loadingMoreRef.current = false;
        }
    }, []);

    // Reset pagination and re-fetch when filters change
    const resetAndFetch = useCallback(() => {
        pageRef.current = 0;
        hasMoreRef.current = true;
        setHasMore(true);
        setConsults([]);
        fetchHistory(0);
    }, [fetchHistory]);

    // Initial Data Fetch
    useEffect(() => {
        fetchHistory(0);
    }, [fetchHistory]);

    // Debounced search handler
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        nameRef.current = value;

        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            resetAndFetch();
        }, 500);
    };

    // Date picker handler
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSelectedDate(value);
        dateRef.current = value;
        resetAndFetch();
    };

    // Clear date filter
    const clearDateFilter = () => {
        setSelectedDate('');
        dateRef.current = '';
        resetAndFetch();
    };

    // Infinite Scroll Observer — stable, no state in deps
    useEffect(() => {
        const target = observerTarget.current;
        if (!target) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMoreRef.current && !loadingMoreRef.current) {
                    const nextPage = pageRef.current + 1;
                    pageRef.current = nextPage;
                    fetchHistory(nextPage);
                }
            },
            { threshold: 0, rootMargin: '100px' }
        );

        observer.observe(target);

        return () => {
            observer.unobserve(target);
        };
    }, [fetchHistory]);

    // Estadísticas reales
    const totalConsultas = totalCount;

    const guardadasCount = consults.filter(c =>
        c.explicaciones_ia &&
        typeof c.explicaciones_ia === 'object' &&
        Object.keys(c.explicaciones_ia).length > 0
    ).length;
    const sinGuardarCount = totalConsultas - guardadasCount;
    const mensualGoal = 100; // Meta arbitraria para el progreso
    const metaPercentage = totalConsultas > 0 ? Math.round((totalConsultas / mensualGoal) * 100) : 0;

    useEffect(() => {
        if (loading) return;
        if (!isFirstLoad.current) return;

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
            
            isFirstLoad.current = false;
        });

        return () => ctx.revert();
    }, [loading]);

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
                        <input
                            className="w-full pl-12 pr-28 py-3 bg-white border-none rounded-2xl soft-shadow text-sm focus:ring-2 focus:ring-lavender transition-all"
                            placeholder="Buscar por nombre..."
                            type="text"
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                        {/* Calendar picker inside the input */}
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            {selectedDate && (
                                <button
                                    onClick={clearDateFilter}
                                    className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                                    title="Limpiar fecha"
                                >
                                    <span className="material-symbols-outlined text-sm">close</span>
                                </button>
                            )}
                            <button
                                onClick={() => dateInputRef.current?.showPicker()}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
                                    selectedDate
                                        ? 'bg-lavender/20 text-purple-700'
                                        : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                                }`}
                                title="Filtrar por fecha"
                            >
                                <span className="material-symbols-outlined text-sm">calendar_month</span>
                                {selectedDate ? new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }).toUpperCase() : 'Fecha'}
                            </button>
                            <input
                                ref={dateInputRef}
                                type="date"
                                value={selectedDate}
                                onChange={handleDateChange}
                                className="absolute opacity-0 w-0 h-0 pointer-events-none"
                                tabIndex={-1}
                            />
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/nueva-consulta" className="px-6 py-3 bg-black-accent text-white rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-all">
                            <span className="material-symbols-outlined text-sm">add</span> Nueva
                        </Link>
                    </div>
                </div>

                <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 pb-12">
                    {loading ? (
                        <div className="col-span-full py-20 flex justify-center items-center">
                            <span className="material-symbols-outlined text-5xl text-slate-300 animate-spin">refresh</span>
                        </div>
                    ) : consults.length === 0 ? (
                        <div className="col-span-full py-20 flex flex-col items-center text-center">
                            <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">folder_open</span>
                            <h3 className="text-xl font-bold text-slate-400">{searchTerm.trim() ? 'Sin coincidencias' : 'Sin registros'}</h3>
                            <p className="text-slate-400 mt-2 max-w-sm">{searchTerm.trim() ? `No se encontraron registros para "${searchTerm.trim()}"` : 'Aún no tienes análisis numerológicos guardados en el historial.'}</p>
                        </div>
                    ) : (
                        consults.map((consult, index) => {
                            // Extract numbers
                            const mainNumber = consult.numerologia_data?.primeraParte?.vibracionInterna?.digit || '-';
                            const destinyNumber = consult.numerologia_data?.primeraParte?.calculoMision?.digit || '-';

                            const styles = [
                                { border: 'hover:border-mint', bg: 'bg-mint', text: 'text-emerald-900', hoverBg: 'group-hover:bg-mint', hoverText: 'group-hover:text-emerald-800', iconBg: 'bg-mint/30', iconText: 'text-emerald-800/60', icon: 'fingerprint', tag: 'Esencia' },
                                { border: 'hover:border-lavender', bg: 'bg-lavender', text: 'text-purple-900', hoverBg: 'group-hover:bg-lavender', hoverText: 'group-hover:text-purple-800', iconBg: 'bg-lavender/30', iconText: 'text-purple-800/60', icon: 'self_improvement', tag: 'Cálculo' },
                                { border: 'hover:border-peach', bg: 'bg-peach', text: 'text-orange-900', hoverBg: 'group-hover:bg-peach', hoverText: 'group-hover:text-orange-800', iconBg: 'bg-peach/30', iconText: 'text-orange-800/60', icon: 'all_inclusive', tag: 'Registro' }
                            ];
                            const st = styles[index % styles.length];

                            return (
                                <div key={consult.id} className={`${isFirstLoad.current && index < ITEMS_PER_PAGE ? 'opacity-0' : 'opacity-100'} bg-white p-7 rounded-3xl border border-slate-50 soft-shadow group ${st.border} hover:-translate-y-2 hover:shadow-lg transition-all duration-300 relative overflow-hidden`}>
                                    <div className="flex justify-between items-start mb-8">
                                        <div className={`w-12 h-12 ${st.bg} rounded-2xl flex items-center justify-center`}>
                                            <span className={`material-symbols-outlined ${st.iconText}`}>{st.icon}</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            {consult.explicaciones_ia && Object.keys(consult.explicaciones_ia).length > 0 ? (
                                                <span className="text-[9px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full mb-2">Guardado</span>
                                            ) : (
                                                <span className="text-[9px] font-bold uppercase tracking-widest bg-amber-50 text-amber-700 px-3 py-1 rounded-full mb-2">Incompleto</span>
                                            )}
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">#{consult.id.slice(0, 4)}</span>
                                        </div>
                                    </div>
                                    <h4 className={`text-xl font-bold mb-1 tracking-tight ${st.text} transition-colors capitalize`}>{consult.nombre_completo.toLowerCase()}</h4>
                                    <div className="flex flex-col gap-1 mb-6">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <span className="material-symbols-outlined text-sm">cake</span>
                                            <p className="text-xs tracking-wider">{formatBirthday(consult.fecha_nacimiento)}</p>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <span className="material-symbols-outlined text-sm">calendar_today</span>
                                            <p className="text-xs tracking-wider">{formatDateDisplay(consult.created_at)} - {formatTimeDisplay(consult.created_at)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-5 border-t border-slate-50">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Vibración</span>
                                            <span className="text-xl font-light italic">Esencia <span className="font-bold not-italic">{mainNumber}</span></span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={(e) => handleDeleteConsult(consult, e)}
                                                className={`w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 transition-all text-slate-300`}
                                                title="Eliminar"
                                            >
                                                <span className="material-symbols-outlined text-lg">delete</span>
                                            </button>
                                            <button
                                                onClick={() => handleViewResults(consult)}
                                                className={`w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center ${st.hoverBg} ${st.hoverText} transition-all`}
                                                title="Reabrir Análisis"
                                            >
                                                <span className="material-symbols-outlined text-lg">arrow_outward</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}

                    {/* New Analysis Card */}
                    <Link href="/nueva-consulta" className="bg-off-white p-7 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center group hover:border-black-accent/10 hover:-translate-y-2 hover:shadow-lg transition-all duration-300 cursor-pointer">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 soft-shadow">
                            <span className="material-symbols-outlined text-slate-300 text-3xl">add</span>
                        </div>
                        <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Nuevo Análisis</p>
                        <p className="text-xs text-slate-300 mt-1 max-w-[150px]">Comienza una nueva lectura personalizada</p>
                    </Link>
                </div>

                {/* Sentinel for Infinite Scroll */}
                <div ref={observerTarget} className="h-20 w-full flex justify-center items-center">
                    {loadingMore && (
                         <span className="material-symbols-outlined text-3xl text-slate-300 animate-spin">refresh</span>
                    )}
                </div>
            </main>

            {/* Right Info Sidebar */}
            <aside ref={sidebarRef} className="w-80 border-l border-slate-100 p-8 bg-white hidden xl:flex flex-col shrink-0">
                <h3 className="text-sm font-bold uppercase tracking-widest mb-10 text-slate-400 opacity-0">Resumen del Mes</h3>
                <div className="space-y-8 opacity-0">
                    <div className="bg-off-white rounded-3xl p-8 border border-slate-50 relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-mint rounded-full blur-3xl opacity-50"></div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 relative z-10">Total Consultas</div>
                        <div className="text-5xl font-light mb-2 relative z-10 tracking-tighter">{totalConsultas}</div>
                        <div className="flex items-center gap-2 text-slate-400 relative z-10">
                            <span className="material-symbols-outlined text-sm">history</span>
                            <span className="text-xs font-bold">Historial Completo</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Estados de Guardado</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center bg-emerald-50/30 p-4 rounded-2xl">
                                <div className="flex items-center gap-3">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    <span className="text-sm font-medium">Guardadas</span>
                                </div>
                                <span className="text-sm font-bold">{guardadasCount}</span>
                            </div>
                            <div className="flex justify-between items-center bg-amber-50/30 p-4 rounded-2xl">
                                <div className="flex items-center gap-3">
                                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                    <span className="text-sm font-medium">Sin Guardar</span>
                                </div>
                                <span className="text-sm font-bold">{sinGuardarCount}</span>
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
                                <h4 className="text-2xl font-light">{totalConsultas}<span className="text-sm text-slate-500">/{mensualGoal}</span></h4>
                                <span className="text-xs font-bold text-lavender">{metaPercentage}%</span>
                            </div>
                            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-lavender h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(metaPercentage, 100)}%` }}></div>
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
            <Toaster position="bottom-center" theme="system" />
        </div>
    );
}

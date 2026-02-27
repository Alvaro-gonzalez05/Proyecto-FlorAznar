'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { useRightSidebar } from '../components/RightSidebarContext';
import { supabase } from '@/lib/supabase';
import { Toaster, sileo } from 'sileo';
import 'sileo/styles.css';

// Helper to format Date to Argentina (Date only)
const formatDateOnly = (date: Date) => {
    return new Intl.DateTimeFormat('es-AR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'America/Argentina/Buenos_Aires'
    }).format(date);
};

// Helper for Month/Year display
const formatMonthYear = (date: Date) => {
    return new Intl.DateTimeFormat('es-AR', {
        month: 'long',
        year: 'numeric',
        timeZone: 'America/Argentina/Buenos_Aires'
    }).format(date);
};

export default function AgendaPage() {
    const { setContent } = useRightSidebar();
    const router = useRouter();
    const headerRef = useRef(null);
    const calendarRef = useRef(null);

    // Date state
    const [currentDate, setCurrentDate] = useState(new Date());
    const [sessions, setSessions] = useState<any[]>([]);
    const [pendingRequests, setPendingRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [draggedId, setDraggedId] = useState<string | null>(null);
    const [dragOverDay, setDragOverDay] = useState<number | null>(null);
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [editingSession, setEditingSession] = useState<any | null>(null);

    const modalRef = useRef<HTMLDivElement>(null);
    const modalContentRef = useRef<HTMLDivElement>(null);
    const dayDialogRef = useRef<HTMLDivElement>(null);
    const dayDialogContentRef = useRef<HTMLDivElement>(null);

    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Modal Animations
    useEffect(() => {
        if (isModalOpen && modalRef.current && modalContentRef.current) {
            gsap.fromTo(modalRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
            gsap.fromTo(modalContentRef.current, { scale: 0.8, opacity: 0, y: 40 }, { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: 'power4.out', delay: 0.1 });
        }
    }, [isModalOpen]);

    const closeModal = () => {
        if (modalRef.current && modalContentRef.current) {
            const tl = gsap.timeline({ onComplete: () => setIsModalOpen(false) });
            tl.to(modalContentRef.current, { scale: 0.9, opacity: 0, y: 20, duration: 0.3, ease: 'power2.in' });
            tl.to(modalRef.current, { opacity: 0, duration: 0.2 }, "-=0.1");
        } else {
            setIsModalOpen(false);
        }
    };

    // Day Dialog animations
    useEffect(() => {
        if (selectedDay !== null && dayDialogRef.current && dayDialogContentRef.current) {
            gsap.fromTo(dayDialogRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
            gsap.fromTo(dayDialogContentRef.current, { scale: 0.85, opacity: 0, y: 30 }, { scale: 1, opacity: 1, y: 0, duration: 0.45, ease: 'power4.out', delay: 0.1 });
        }
    }, [selectedDay]);

    const closeDayDialog = () => {
        if (dayDialogRef.current && dayDialogContentRef.current) {
            const tl = gsap.timeline({ onComplete: () => { setSelectedDay(null); setEditingSession(null); } });
            tl.to(dayDialogContentRef.current, { scale: 0.9, opacity: 0, y: 15, duration: 0.25, ease: 'power2.in' });
            tl.to(dayDialogRef.current, { opacity: 0, duration: 0.2 }, '-=0.1');
        } else {
            setSelectedDay(null);
            setEditingSession(null);
        }
    };

    // Session management handlers
    const handleUnlink = async (id: string, clientName: string) => {
        try {
            const { error } = await supabase.from('sesiones').update({ estado: 'pendiente', fecha_hora: null }).eq('id', id);
            if (error) throw error;
            fetchSessions();
            closeDayDialog();
            sileo.success({ title: "Desvinculada", description: `${clientName} volvió a solicitudes pendientes.`, duration: 3000 });
        } catch {
            sileo.error({ title: "Error", description: "No se pudo desvincular.", duration: 4000 });
        }
    };

    const handleDelete = (id: string, clientName: string) => {
        sileo.action({
            title: `¿Eliminar a ${clientName}?`,
            fill: "#ffffff",
            styles: {
                title: "sileo-red-text font-bold",
                button: "sileo-red-button transition-colors",
                badge: "sileo-neutral-badge"
            },
            button: {
                title: "Eliminar",
                onClick: async () => {
                    try {
                        const { error } = await supabase.from('sesiones').delete().eq('id', id);
                        if (error) throw error;
                        fetchSessions();
                        closeDayDialog();
                        sileo.success({ title: "Eliminada", description: "Sesión borrada.", duration: 3000 });
                    } catch {
                        sileo.error({ title: "Error", description: "No se pudo eliminar.", duration: 4000 });
                    }
                }
            }
        });
    };

    const handleEditSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingSession) return;
        const fd = new FormData(e.currentTarget);
        try {
            const { error } = await supabase.from('sesiones').update({
                cliente_nombre: fd.get('edit_nombre') as string,
                apellido: fd.get('edit_apellido') as string || null,
                telefono: fd.get('edit_telefono') as string || null,
                fecha_nacimiento: fd.get('edit_nacimiento') as string || null,
            }).eq('id', editingSession.id);
            if (error) throw error;
            setEditingSession(null);
            fetchSessions();
            sileo.success({ title: "Actualizada", description: "Los datos de la sesión fueron editados correctamente.", duration: 3000 });
        } catch {
            sileo.error({ title: "Error", description: "No se pudieron guardar los cambios.", duration: 4000 });
        }
    };

    // Navigate to consultation
    const handleStartConsulta = (session: any) => {
        // Store pre-fill data for nueva-consulta page
        sessionStorage.setItem('agendaPrefill', JSON.stringify({
            nombre: session.cliente_nombre || '',
            apellido: session.apellido || '',
            fechaNacimiento: session.fecha_nacimiento || ''
        }));

        closeDayDialog();
        router.push('/nueva-consulta');
    };

    // Fetch data from Supabase
    const fetchSessions = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('sesiones')
                .select('*')
                .order('created_at', { ascending: false });

            if (!error && data) {
                setSessions(data);
                const pending = data.filter(s => s.estado === 'pendiente');
                setPendingRequests(pending);
            }
        } catch (err) {
            console.error("Error fetching sessions:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, [currentDate]);

    // Handle Drag & Drop
    const handleDrop = async (e: React.DragEvent, day: number) => {
        e.preventDefault();
        const sessionId = e.dataTransfer.getData('sessionId');
        setDraggedId(null);
        setDragOverDay(null);

        if (!sessionId) return;

        // Date for the drop (using local noon to avoid timezone issues when only using date)
        const droppedDate = new Date(currentYear, currentMonth, day, 12, 0, 0);

        const { error } = await supabase
            .from('sesiones')
            .update({
                fecha_hora: droppedDate.toISOString().split('T')[0], // Store only the date part
                estado: 'confirmada'
            })
            .eq('id', sessionId);

        if (!error) {
            fetchSessions();
        }
    };

    const handleDragStart = (e: React.DragEvent, id: string) => {
        e.dataTransfer.setData('sessionId', id);
        setDraggedId(id);
    };

    const handleDragEnd = () => {
        setDraggedId(null);
        setDragOverDay(null);
    };

    const handleDragOver = (e: React.DragEvent, day: number) => {
        e.preventDefault();
        if (dragOverDay !== day) setDragOverDay(day);
    };

    // Sidebar Content Logic
    useEffect(() => {
        setContent(
            <>
                <div className="flex items-center justify-between mb-8 text-black-accent">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Solicitudes Pendientes</h3>
                    <span className="w-6 h-6 rounded-full bg-black-accent text-white flex items-center justify-center text-xs font-bold">
                        {pendingRequests.length}
                    </span>
                </div>
                <div className="flex-1 overflow-y-auto scrollbar-hide space-y-6 pr-1">
                    {pendingRequests.length === 0 ? (
                        <div className="text-center py-10 text-slate-400">
                            <span className="material-symbols-outlined text-4xl mb-2 opacity-30">drag_indicator</span>
                            <p className="text-xs font-medium">No hay solicitudes.<br />Crea una para agendar.</p>
                        </div>
                    ) : (
                        pendingRequests.map((req, idx) => {
                            // Cycle through project colors for variety
                            const colors = [
                                'bg-gradient-to-br from-purple-50 to-lavender/30 border-purple-100 text-purple-900',
                                'bg-gradient-to-br from-emerald-50 to-mint/30 border-emerald-100 text-emerald-900',
                                'bg-gradient-to-br from-orange-50 to-peach/30 border-orange-100 text-orange-900',
                                'bg-gradient-to-br from-slate-50 to-slate-200/30 border-slate-200 text-slate-800'
                            ];
                            const colorClass = colors[idx % colors.length];
                            const iconColors = [
                                'bg-purple-500/10 text-purple-600',
                                'bg-emerald-500/10 text-emerald-600',
                                'bg-orange-500/10 text-orange-600',
                                'bg-slate-500/10 text-slate-600'
                            ];
                            const iconColorClass = iconColors[idx % iconColors.length];

                            return (
                                <div
                                    key={req.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, req.id)}
                                    onDragEnd={handleDragEnd}
                                    className={`p-6 rounded-[2rem] border transition-all group relative backdrop-blur-sm ${draggedId === req.id
                                        ? 'bg-transparent border-dashed border-slate-300 opacity-50 scale-95 shadow-none'
                                        : `${colorClass} card-shadow hover:-translate-y-1.5 cursor-grab active:cursor-grabbing hover:shadow-2xl`
                                        }`}
                                >
                                    <div className={`absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${draggedId === req.id ? 'opacity-0' : 'bg-white/50 text-slate-400 group-hover:bg-black-accent group-hover:text-white'}`}>
                                        <span className="material-symbols-outlined text-lg">drag_pan</span>
                                    </div>

                                    <div className="flex items-center gap-4 mb-5">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3 ${draggedId === req.id ? 'bg-slate-100' : 'bg-white shadow-sm'}`}>
                                            <span className={`material-symbols-outlined text-2xl ${draggedId === req.id ? 'text-slate-300' : colorClass.split(' ').pop()?.replace('text-', 'text-')}`}>person_search</span>
                                        </div>
                                        <div>
                                            <h4 className={`font-bold text-base leading-tight transition-colors ${draggedId === req.id ? 'text-slate-300' : 'text-black-accent'}`}>
                                                {req.cliente_nombre} {req.apellido}
                                            </h4>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-current opacity-40"></div>
                                                <span className="text-[10px] uppercase tracking-wider font-bold opacity-60">Solicitud Nueva</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-5">
                                        <span className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-colors bg-white/60 border-white/40 shadow-sm`}>
                                            Numerología
                                        </span>
                                        {req.telefono && (
                                            <span className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold flex items-center gap-2 transition-colors bg-white/60 border-white/40 shadow-sm`}>
                                                <span className="material-symbols-outlined text-xs">call</span>
                                                {req.telefono}
                                            </span>
                                        )}
                                    </div>

                                    <div className={`text-[10px] text-center font-bold uppercase tracking-[0.2em] py-3 rounded-2xl border transition-all ${draggedId === req.id
                                        ? 'bg-slate-100 text-slate-400 border-dashed border-slate-300'
                                        : 'bg-black-accent text-white border-transparent shadow-lg shadow-black/5 group-hover:bg-slate-800'
                                        }`}>
                                        {draggedId === req.id ? 'Soltar para agendar' : 'Agendar ahora'}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </>
        );
    }, [pendingRequests, draggedId, setContent]);

    // Calendar Generation
    const nextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    const prevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));

    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const calendarDays = [];
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
        calendarDays.push({ day: daysInPrevMonth - i, currentMonth: false });
    }
    for (let i = 1; i <= daysInMonth; i++) {
        calendarDays.push({ day: i, currentMonth: true });
    }
    const remainingSlots = (calendarDays.length > 35 ? 42 : 35) - calendarDays.length;
    for (let i = 1; i <= remainingSlots; i++) {
        calendarDays.push({ day: i, currentMonth: false });
    }

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(headerRef.current, { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' });
            gsap.fromTo(calendarRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, delay: 0.2, ease: 'power3.out' });
        });
        return () => { ctx.revert(); setContent(null); };
    }, [setContent]);

    const isToday = (day: number) => {
        const today = new Date();
        return today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear;
    };

    const getSessionsForDay = (day: number) => {
        return sessions.filter(s => {
            if (!s.fecha_hora) return false;
            // Handle both timestamp and date strings
            const sDate = new Date(s.fecha_hora);
            const adjustDate = new Date(sDate.getTime() + sDate.getTimezoneOffset() * 60000);
            return adjustDate.getDate() === day && adjustDate.getMonth() === currentMonth && adjustDate.getFullYear() === currentYear && s.estado === 'confirmada';
        });
    };

    const handleSaveSession = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newSession = {
            cliente_nombre: formData.get('nombre') as string,
            apellido: formData.get('apellido') as string || null,
            fecha_nacimiento: formData.get('nacimiento') as string || null,
            telefono: formData.get('telefono') as string || null,
            tipo_sesion: 'Numerología',
            estado: 'pendiente'
        };

        const { error } = await supabase.from('sesiones').insert([newSession]);
        if (!error) { closeModal(); fetchSessions(); }
    };

    return (
        <div className="px-4 md:px-6 lg:px-8 py-4 md:py-6 bg-cream-soft relative h-full flex flex-col overflow-hidden">
            <header ref={headerRef} className="mb-3 md:mb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-3 shrink-0">
                <div>
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                        <span className="material-symbols-outlined text-sm">home</span>
                        <span className="text-[10px] lg:text-xs uppercase tracking-widest font-bold">Dashboard</span>
                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                        <span className="text-[10px] lg:text-xs uppercase tracking-widest font-bold text-black-accent">Agenda</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-light tracking-tight text-black-accent">
                        Calendario de <span className="font-bold">Sesiones</span>
                    </h1>
                </div>
                <div className="flex items-center gap-3 lg:gap-4">
                    <button onClick={() => setIsModalOpen(true)} className="bg-black-accent text-white px-4 lg:px-6 py-2 lg:py-2.5 rounded-xl lg:rounded-2xl text-[10px] lg:text-xs font-bold uppercase tracking-widest shadow-lg hover:scale-[1.02] transition-all flex items-center gap-1.5 lg:gap-2">
                        <span className="material-symbols-outlined text-sm">add</span>
                        Nueva Solicitud
                    </button>
                    <div className="flex items-center gap-1 lg:gap-2 bg-white px-3 lg:px-4 py-1.5 lg:py-2 rounded-xl lg:rounded-2xl border border-slate-100 shadow-sm cursor-pointer hover:border-slate-200 transition-colors">
                        <span onClick={prevMonth} className="material-symbols-outlined text-slate-400 hover:text-black-accent text-xl">chevron_left</span>
                        <span className="text-xs lg:text-sm font-semibold uppercase tracking-widest w-32 lg:w-40 text-center">
                            {formatMonthYear(currentDate)}
                        </span>
                        <span onClick={nextMonth} className="material-symbols-outlined text-slate-400 hover:text-black-accent text-xl">chevron_right</span>
                    </div>
                </div>
            </header>

            <div ref={calendarRef} className="bg-white rounded-2xl md:rounded-3xl p-3 md:p-5 soft-shadow border border-white/50 flex-1 flex flex-col relative min-h-0">
                <div className="grid grid-cols-7 mb-2 md:mb-3 text-center border-b border-slate-50 pb-2">
                    {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                        <div key={day} className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{day}</div>
                    ))}
                </div>

                <div className="grid grid-cols-7 flex-1 gap-1 md:gap-2">
                    {calendarDays.map((dateObj, idx) => {
                        const daySessions = dateObj.currentMonth ? getSessionsForDay(dateObj.day) : [];
                        const today = dateObj.currentMonth && isToday(dateObj.day);
                        const isOver = dateObj.currentMonth && dragOverDay === dateObj.day;

                        return (
                            <div
                                key={idx}
                                onClick={() => dateObj.currentMonth && !draggedId && setSelectedDay(dateObj.day)}
                                onDragOver={(e) => handleDragOver(e, dateObj.day)}
                                onDragLeave={() => setDragOverDay(null)}
                                onDrop={(e) => dateObj.currentMonth && handleDrop(e, dateObj.day)}
                                className={`p-1.5 md:p-2 border rounded-xl md:rounded-2xl transition-all relative group flex flex-col cursor-pointer ${!dateObj.currentMonth ? 'opacity-10 border-transparent cursor-default' :
                                    isOver ? 'border-black-accent ring-2 ring-black-accent/5 bg-slate-50/50 scale-[1.03] z-20' :
                                        today ? 'border-black-accent shadow-md bg-white z-10' : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50/30'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-0.5">
                                    <span className={`text-xs md:text-sm ${today || isOver ? 'font-bold text-black-accent' : 'font-light text-slate-400'}`}>{dateObj.day}</span>
                                    {today && <span className="text-[7px] md:text-[8px] bg-black-accent text-white px-1.5 py-0.5 rounded-full font-bold leading-none">HOY</span>}
                                </div>

                                {isOver && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none animate-pulse">
                                        <span className="material-symbols-outlined text-black-accent text-lg md:text-2xl">calendar_add_on</span>
                                        <span className="text-[7px] md:text-[9px] font-bold text-black-accent uppercase tracking-widest">Asignar</span>
                                    </div>
                                )}

                                <div className={`flex-1 space-y-0.5 overflow-hidden ${isOver ? 'opacity-20 transition-opacity' : ''}`}>
                                    {daySessions.map(session => (
                                        <div
                                            key={session.id}
                                            className="bg-lavender/40 border border-purple-100 text-purple-900 px-1.5 py-0.5 md:p-1.5 rounded-lg text-[7px] md:text-[9px] font-bold cursor-pointer transition-all hover:bg-lavender truncate flex items-center gap-1"
                                        >
                                            <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-purple-500 shrink-0"></div>
                                            {session.cliente_nombre.split(' ')[0]}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div ref={modalRef} onClick={(e) => e.target === modalRef.current && closeModal()} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 cursor-pointer">
                    <div ref={modalContentRef} className="bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl cursor-default">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-3xl font-light tracking-tight">Nueva <span className="font-bold">Solicitud</span></h2>
                            <button onClick={closeModal} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-black-accent hover:text-white transition-all">
                                <span className="material-symbols-outlined text-lg">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSaveSession} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-[.2em] text-slate-400 ml-1">Nombre (Obligatorio)</label>
                                <input name="nombre" required className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-black-accent/10 transition-all font-medium placeholder:text-slate-300" placeholder="Ej. Ana" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-[.2em] text-slate-400 ml-1">Apellido (Opcional)</label>
                                <input name="apellido" className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-black-accent/10 transition-all font-medium placeholder:text-slate-300" placeholder="Ej. Pérez" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-[.2em] text-slate-400 ml-1">Nacimiento</label>
                                    <input name="nacimiento" type="date" className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-black-accent/10 transition-all font-medium" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-[.2em] text-slate-400 ml-1">Teléfono</label>
                                    <input name="telefono" className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-black-accent/10 transition-all font-medium placeholder:text-slate-300" placeholder="+54..." />
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-black-accent text-white py-5 rounded-[1.5rem] font-bold text-xs uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl shadow-black/10 mt-4 active:scale-[0.98]">
                                Crear Solicitud
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Day Detail Dialog */}
            {selectedDay !== null && (
                <div ref={dayDialogRef} onClick={(e) => e.target === dayDialogRef.current && closeDayDialog()} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 cursor-pointer">
                    <div ref={dayDialogContentRef} className="bg-white rounded-[2rem] w-full max-w-lg p-8 shadow-2xl cursor-default max-h-[80vh] flex flex-col">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-6 shrink-0">
                            <div>
                                <h2 className="text-2xl font-light tracking-tight text-black-accent">
                                    <span className="font-bold">{selectedDay}</span>{' '}
                                    {formatMonthYear(currentDate)}
                                </h2>
                                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-1">Actividad del día</p>
                            </div>
                            <button onClick={closeDayDialog} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-black-accent hover:text-white transition-all">
                                <span className="material-symbols-outlined text-lg">close</span>
                            </button>
                        </div>

                        {/* Sessions List */}
                        <div className="flex-1 overflow-y-auto space-y-4 scrollbar-hide">
                            {(() => {
                                const daySessions = getSessionsForDay(selectedDay);
                                if (daySessions.length === 0) {
                                    return (
                                        <div className="text-center py-16">
                                            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4">
                                                <span className="material-symbols-outlined text-3xl text-slate-300">event_busy</span>
                                            </div>
                                            <p className="text-sm font-medium text-slate-400">No hay sesiones agendadas</p>
                                            <p className="text-[10px] text-slate-300 uppercase tracking-widest mt-1">Arrastra una solicitud para agendar aquí</p>
                                        </div>
                                    );
                                }

                                return daySessions.map(session => (
                                    <div key={session.id} className="bg-slate-50 rounded-2xl p-5 border border-slate-100 transition-all hover:border-slate-200">
                                        {editingSession?.id === session.id ? (
                                            /* Inline Edit Form */
                                            <form onSubmit={handleEditSave} className="space-y-3">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className="material-symbols-outlined text-sm text-slate-400">edit</span>
                                                    <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Editando</span>
                                                </div>
                                                <input name="edit_nombre" defaultValue={session.cliente_nombre} required className="w-full bg-white rounded-xl p-3 text-sm font-medium border border-slate-100 focus:ring-2 focus:ring-black-accent/10" placeholder="Nombre" />
                                                <div className="grid grid-cols-2 gap-3">
                                                    <input name="edit_apellido" defaultValue={session.apellido || ''} className="w-full bg-white rounded-xl p-3 text-sm font-medium border border-slate-100 focus:ring-2 focus:ring-black-accent/10" placeholder="Apellido" />
                                                    <input name="edit_telefono" defaultValue={session.telefono || ''} className="w-full bg-white rounded-xl p-3 text-sm font-medium border border-slate-100 focus:ring-2 focus:ring-black-accent/10" placeholder="Teléfono" />
                                                </div>
                                                <div>
                                                    <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 ml-1 mb-1 block">Fecha de Nacimiento</label>
                                                    <input name="edit_nacimiento" type="date" defaultValue={session.fecha_nacimiento || ''} className="w-full bg-white rounded-xl p-3 text-sm font-medium border border-slate-100 focus:ring-2 focus:ring-black-accent/10" />
                                                </div>
                                                <div className="flex gap-2 pt-1">
                                                    <button type="submit" className="flex-1 py-2.5 bg-black-accent text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all">Guardar</button>
                                                    <button type="button" onClick={() => setEditingSession(null)} className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all">Cancelar</button>
                                                </div>
                                            </form>
                                        ) : (
                                            /* Session Display */
                                            <>
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-lavender/30 flex items-center justify-center">
                                                            <span className="material-symbols-outlined text-purple-700">person</span>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-sm text-black-accent">{session.cliente_nombre} {session.apellido}</h4>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <span className="text-[9px] uppercase tracking-widest font-bold text-purple-600 bg-lavender/30 px-2 py-0.5 rounded-full">Confirmada</span>
                                                                <span className="text-[9px] uppercase tracking-widest font-bold text-slate-400">Numerología</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {session.telefono && (
                                                    <div className="flex items-center gap-2 text-slate-500 text-xs mb-4 pl-1">
                                                        <span className="material-symbols-outlined text-sm">call</span>
                                                        <span>{session.telefono}</span>
                                                    </div>
                                                )}

                                                {/* Actions */}
                                                <div className="flex gap-2 pt-2 border-t border-slate-100">
                                                    <button onClick={() => setEditingSession(session)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white border border-slate-200 text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-100 transition-all">
                                                        <span className="material-symbols-outlined text-sm">edit</span>
                                                        Editar
                                                    </button>
                                                    <button onClick={() => handleUnlink(session.id, session.cliente_nombre)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white border border-slate-200 text-[10px] font-bold uppercase tracking-widest text-orange-600 hover:bg-orange-50 transition-all">
                                                        <span className="material-symbols-outlined text-sm">undo</span>
                                                        Desvincular
                                                    </button>
                                                    <button onClick={() => handleDelete(session.id, session.cliente_nombre)} className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all">
                                                        <span className="material-symbols-outlined text-sm">delete</span>
                                                    </button>
                                                    <button onClick={() => handleStartConsulta(session)} className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-lavender/30 border border-purple-100 text-[10px] font-bold uppercase tracking-widest text-purple-700 hover:bg-lavender transition-all" title="Iniciar Consulta">
                                                        <span className="material-symbols-outlined text-sm">arrow_outward</span>
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ));
                            })()}
                        </div>
                    </div>
                </div>
            )}
            <Toaster position="bottom-center" theme="system" />
        </div>
    );
}

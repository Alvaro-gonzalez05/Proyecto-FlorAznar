'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';
import { gsap } from 'gsap';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { RightSidebarProvider, useRightSidebar } from './RightSidebarContext';
import TransitionLink from './TransitionLink';
import { supabase } from '@/lib/supabase';

interface DashboardLayoutProps {
    children: ReactNode;
}

function DashboardLayoutInner({ children }: DashboardLayoutProps) {
    const leftSidebarRef = useRef(null);
    const sidebarRef = useRef(null);
    const indicatorRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();
    const router = useRouter();
    const [activePath, setActivePath] = useState(pathname);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const { content: rightSidebarContent } = useRightSidebar();
    
    // Close user menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (isUserMenuOpen) {
                const target = e.target as HTMLElement;
                if (!target.closest('.user-menu-container')) {
                    setIsUserMenuOpen(false);
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isUserMenuOpen]);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        // Do not close the menu, because we want to animate it!
        await supabase.auth.signOut();
        setTimeout(() => {
            setIsLoggingOut(false);
            setIsUserMenuOpen(false);
            router.refresh();
            router.push('/login');
        }, 2500);
    };

    // Sincronizar activePath con pathname para navegación del navegador (atrás/adelante)
    useEffect(() => {
        setActivePath(pathname);
        setIsLoggingOut(false);
        setIsUserMenuOpen(false);
    }, [pathname]);

    // Navigation items
    const navItems = [
        { href: '/dashboard', icon: 'grid_view', label: 'Inicio' },
        { href: '/historial', icon: 'history', label: 'Historial' },
        { href: '/agenda', icon: 'calendar_month', label: 'Agenda' },
        { href: '/nueva-consulta', icon: 'add', label: 'Nueva Consulta' },
        { href: '/prompts', icon: 'auto_awesome', label: 'Prompts IA' },
    ];

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Set initial state for left sidebar
            gsap.set(leftSidebarRef.current, {
                x: -50,
                opacity: 0
            });

            // Left sidebar animation - slide from left to right
            gsap.to(leftSidebarRef.current, {
                x: 0,
                opacity: 1,
                duration: 1,
                ease: 'power3.out',
                clearProps: 'transform'
            });
        });

        return () => ctx.revert();
    }, []); // Solo se ejecuta una vez al montar

    // Animar sidebar derecho cuando estamos en home o agenda
    useEffect(() => {
        if ((pathname === '/dashboard' || pathname === '/agenda') && sidebarRef.current) {
            const ctx = gsap.context(() => {
                gsap.fromTo(sidebarRef.current,
                    {
                        x: 50,
                        opacity: 0
                    },
                    {
                        x: 0,
                        opacity: 1,
                        duration: 1,
                        delay: 0.5,
                        ease: 'power3.out',
                    }
                );
            });

            return () => ctx.revert();
        }
    }, [pathname]);

    // Mover indicador a la posición activa basado en activePath
    useEffect(() => {
        const activeIndex = navItems.findIndex(item => item.href === activePath);

        if (activeIndex !== -1 && indicatorRef.current) {
            // Calcular posición basada en el índice
            // Cada item tiene gap de 2rem (32px) entre ellos
            const itemHeight = 48; // h-12 = 48px
            const gap = 32; // gap-8 = 32px
            const position = activeIndex * (itemHeight + gap);

            gsap.to(indicatorRef.current, {
                y: position,
                duration: 0.5,
                ease: 'power3.out',
            });
        }
    }, [activePath, navItems]);

    // Rutas públicas que no deben tener el dashboard (sidebar, padding de la app, etc.)
    const publicRoutes = ['/', '/login', '/leer'];
    if (publicRoutes.includes(pathname)) {
        return <>{children}</>;
    }

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Left Sidebar - Navigation */}
            <aside ref={leftSidebarRef} className="w-20 border-r border-slate-100 flex flex-col items-center py-8 bg-white hidden lg:flex relative z-50">
                <nav className="flex flex-col gap-8 relative">
                    {/* Animated Indicator */}
                    <div
                        ref={indicatorRef}
                        className="absolute left-0 w-full h-12 bg-black-accent rounded-2xl z-0"
                        style={{ top: 0 }}
                    />

                    {navItems.map((item, index) => {
                        const isActive = activePath === item.href;
                        return (
                            <div key={item.href} title={item.label}>
                                <TransitionLink
                                    href={item.href}
                                    onClick={() => setActivePath(item.href)}
                                    className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-colors relative z-10 group ${isActive ? 'text-white' : 'text-slate-400 hover:text-black-accent'}`}
                                >
                                    <span className="material-symbols-outlined">{item.icon}</span>
                                </TransitionLink>
                            </div>
                        );
                    })}
                </nav>

                <div className="mt-auto relative w-full flex justify-center user-menu-container">
                    <button 
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="w-10 h-10 rounded-full bg-black-accent flex items-center justify-center border border-white shadow-sm hover:scale-105 transition-transform"
                    >
                        <span className="text-white text-xs font-bold">FL</span>
                    </button>

                    {/* User Dropdown */}
                    {(isUserMenuOpen || isLoggingOut) && (
                        <div className="absolute bottom-12 left-6 w-48 bg-white rounded-2xl shadow-[0_10px_40px_-5px_rgba(0,0,0,0.3)] border border-slate-100 overflow-hidden z-[9999] animate-in fade-in slide-in-from-bottom-2 duration-200">
                            {isLoggingOut ? (
                                <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#e6f4f1] via-[#f0eafc] to-[#fff1e6] animate-in fade-in zoom-in duration-500">
                                    <span className="material-symbols-outlined text-[2.5rem] text-on-secondary-container mb-3 animate-bounce">waving_hand</span>
                                    <h2 className="text-base font-bold text-center text-slate-800 mb-1">¡Hasta Pronto!</h2>
                                    <p className="text-xs text-center text-slate-500 leading-tight">Cerrando sesión...</p>
                                </div>
                            ) : (
                                <div className="flex flex-col w-full opacity-100 transition-opacity duration-300">
                                    <div className="p-3 border-b border-slate-50">
                                        <p className="text-xs font-bold text-black-accent">Mi Cuenta</p>
                                    </div>
                                    <div className="p-2 space-y-1">
                                    <Link href="/configuracion" onClick={() => setIsUserMenuOpen(false)} className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:text-black-accent hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[18px]">settings</span>
                                            Configuración
                                        </Link>
                                        <button 
                                            onClick={handleLogout}
                                            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-2 font-medium"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">logout</span>
                                            Cerrar sesión
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content - Dynamic */}
            <main className="flex-1 overflow-y-auto flex flex-col h-full relative">
                {children}
            </main>

            {/* Right Sidebar - Home and Agenda */}
            {(pathname === '/' || pathname === '/agenda') && (
                <aside ref={sidebarRef} className="w-80 border-l border-slate-100 p-8 bg-white hidden xl:flex flex-col shrink-0">
                    {rightSidebarContent || (
                        <>
                            <h3 className="text-sm font-bold uppercase tracking-widest mb-8">Tendencia del Día</h3>
                            <div className="bg-off-white rounded-3xl p-6 border border-slate-50 mb-6">
                                <div className="text-4xl font-bold mb-2">9</div>
                                <p className="text-sm font-medium text-slate-600 leading-relaxed">
                                    Un día para cerrar ciclos. La energía del número 9 favorece la limpieza y el desapego de lo que ya no sirve.
                                </p>
                            </div>
                            <div className="mt-auto">
                                <div className="bg-slate-900 text-white rounded-[2rem] p-6">
                                    <p className="text-xs uppercase tracking-widest text-slate-400 mb-4">Próximo Taller</p>
                                    <h4 className="text-lg font-semibold mb-6">Geometría Sagrada en la Carta Natal</h4>
                                    <button className="w-full py-3 bg-white text-black-accent rounded-full text-xs font-bold uppercase tracking-widest hover:bg-opacity-90 transition-all">
                                        Inscribirse
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </aside>
            )}
        </div>
    );
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <RightSidebarProvider>
            <DashboardLayoutInner>{children}</DashboardLayoutInner>
        </RightSidebarProvider>
    );
}

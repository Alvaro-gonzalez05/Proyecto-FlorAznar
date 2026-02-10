'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';
import { gsap } from 'gsap';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RightSidebarProvider, useRightSidebar } from './RightSidebarContext';
import TransitionLink from './TransitionLink';

interface DashboardLayoutProps {
    children: ReactNode;
}

function DashboardLayoutInner({ children }: DashboardLayoutProps) {
    const leftSidebarRef = useRef(null);
    const sidebarRef = useRef(null);
    const indicatorRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();
    const [activePath, setActivePath] = useState(pathname);
    const { content: rightSidebarContent } = useRightSidebar();

    // Sincronizar activePath con pathname para navegación del navegador (atrás/adelante)
    useEffect(() => {
        setActivePath(pathname);
    }, [pathname]);

    // Navigation items
    const navItems = [
        { href: '/', icon: 'grid_view' },
        { href: '/historial', icon: 'history' },
        { href: '/nueva-consulta', icon: 'add' },
        { href: '/perfil', icon: 'person' },
        { href: '/configuracion', icon: 'settings' },
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
            });
        });

        return () => ctx.revert();
    }, []); // Solo se ejecuta una vez al montar

    // Animar sidebar derecho cuando estamos en home
    useEffect(() => {
        if (pathname === '/' && sidebarRef.current) {
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

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Left Sidebar - Navigation */}
            <aside ref={leftSidebarRef} className="w-20 border-r border-slate-100 flex flex-col items-center py-8 bg-white hidden lg:flex relative">
                <nav className="flex flex-col gap-8 relative">
                    {/* Animated Indicator */}
                    <div
                        ref={indicatorRef}
                        className="absolute left-0 w-full h-12 bg-black-accent rounded-2xl -z-10"
                        style={{ top: 0 }}
                    />

                    {navItems.map((item, index) => {
                        const isActive = activePath === item.href;
                        return (
                            <TransitionLink
                                key={item.href}
                                href={item.href}
                                onClick={() => setActivePath(item.href)}
                                className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-colors relative z-10 ${isActive ? 'text-white' : 'text-slate-400 hover:text-black-accent'}`}
                            >
                                <span className="material-symbols-outlined">{item.icon}</span>
                            </TransitionLink>
                        );
                    })}
                </nav>

                <div className="mt-auto">
                    <div className="w-10 h-10 rounded-full bg-black-accent flex items-center justify-center border border-white shadow-sm">
                        <span className="text-white text-xs font-bold">FL</span>
                    </div>
                </div>
            </aside>

            {/* Main Content - Dynamic */}
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>

            {/* Right Sidebar - Only on Home Page */}
            {pathname === '/' && (
                <aside ref={sidebarRef} className="w-80 border-l border-slate-100 p-8 bg-white hidden xl:flex flex-col">
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

'use client';

import { useEffect, useRef, useState, FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import Link from 'next/link';
import TransitionLink from '../components/TransitionLink';

export default function NuevaConsultaPage() {
    const formRef = useRef(null);
    const illustrationRef = useRef(null);
    const headerRef = useRef(null);
    const loadingRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Simple entrance animation without complex GSAP states/refs dependencies that might race
        if (isLoading && loadingRef.current) {
            // Just ensure it's visible
            loadingRef.current.style.opacity = "1";
        }
    }, [isLoading]);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Staggered entrance animations
            const timeline = gsap.timeline({ delay: 0.3 });

            timeline.fromTo(headerRef.current,
                { y: -20, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.6,
                    ease: 'power3.out',
                }
            );

            timeline.fromTo(formRef.current,
                { x: -30, opacity: 0 },
                {
                    x: 0,
                    opacity: 1,
                    duration: 0.8,
                    ease: 'power3.out',
                }, '-=0.3'
            );

            timeline.fromTo(illustrationRef.current,
                { x: 30, opacity: 0 },
                {
                    x: 0,
                    opacity: 1,
                    duration: 0.8,
                    ease: 'power3.out',
                }, '-=0.6'
            );
        });

        return () => ctx.revert();
    }, []);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simular tiempo de carga y redirigir
        setTimeout(() => {
            router.push('/resultados');
        }, 3000);
    };

    return (
        <main className="flex-1 flex flex-col relative overflow-hidden">
            {/* Background Shapes */}
            <div className="absolute rounded-full blur-3xl opacity-40 bg-mint w-96 h-96 -top-20 -right-20"></div>
            <div className="absolute rounded-full blur-3xl opacity-40 bg-lavender w-80 h-80 top-1/2 -right-10"></div>
            <div className="absolute rounded-full blur-3xl opacity-40 bg-peach w-64 h-64 bottom-0 left-1/4"></div>

            {/* Portal Loading Screen */}
            {isLoading && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[9999] bg-off-white flex flex-col items-center justify-center overflow-hidden">
                    <div className="relative w-96 h-96 flex items-center justify-center animate-in fade-in zoom-in duration-500">
                        {/* Aura Layers */}
                        <div className="absolute inset-0 bg-teal-100 rounded-full blur-[80px] animate-pulse"></div>
                        <div className="absolute inset-10 bg-purple-100 rounded-full blur-[60px] animate-pulse" style={{ animationDelay: '1s' }}></div>
                        <div className="absolute inset-20 bg-orange-100 rounded-full blur-[40px] animate-pulse" style={{ animationDelay: '2s' }}></div>
                        
                        {/* Rotating Gradients */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-teal-50 via-transparent to-transparent blur-2xl animate-spin" style={{ animationDuration: '8s' }}></div>
                        <div className="absolute inset-0 rounded-full bg-gradient-to-bl from-purple-50 via-transparent to-transparent blur-2xl animate-spin" style={{ animationDuration: '10s', animationDirection: 'reverse' }}></div>

                        {/* Center Core */}
                        <div className="relative z-10 flex flex-col items-center justify-center gap-8">
                            <div className="w-64 h-64 md:w-80 md:h-80 animate-[spin_15s_linear_infinite]">
                                <svg className="w-full h-full drop-shadow-xl opacity-90" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
                                    <desc>Geometría Sagrada Minimalista</desc>
                                    <g transform="translate(200, 200)">
                                        <circle cx="0" cy="0" r="140" fill="none" stroke="#1a1a1a" strokeWidth="0.5" strokeOpacity="0.3" />
                                        <circle cx="0" cy="0" r="160" fill="none" stroke="#1a1a1a" strokeWidth="0.3" strokeOpacity="0.2" />
                                        <g stroke="#1a1a1a" strokeWidth="0.8" fill="none" strokeOpacity="0.7">
                                            <circle cx="0" cy="0" r="50" />
                                            <circle cx="0" cy="-50" r="50" />
                                            <circle cx="43.3" cy="-25" r="50" />
                                            <circle cx="43.3" cy="25" r="50" />
                                            <circle cx="0" cy="50" r="50" />
                                            <circle cx="-43.3" cy="25" r="50" />
                                            <circle cx="-43.3" cy="-25" r="50" />
                                        </g>
                                        <g stroke="#1a1a1a" strokeWidth="0.5" fill="none" strokeOpacity="0.4" transform="rotate(30)">
                                            <path d="M0 -140 L0 140" />
                                            <path d="M-121.2 -70 L121.2 70" />
                                            <path d="M-121.2 70 L121.2 -70" />
                                        </g>
                                        <circle cx="0" cy="-140" r="2" fill="#1a1a1a" opacity="0.6" />
                                        <circle cx="121.2" cy="-70" r="2" fill="#1a1a1a" opacity="0.6" />
                                        <circle cx="121.2" cy="70" r="2" fill="#1a1a1a" opacity="0.6" />
                                        <circle cx="0" cy="140" r="2" fill="#1a1a1a" opacity="0.6" />
                                        <circle cx="-121.2" cy="70" r="2" fill="#1a1a1a" opacity="0.6" />
                                        <circle cx="-121.2" cy="-70" r="2" fill="#1a1a1a" opacity="0.6" />
                                        <circle cx="0" cy="0" r="3" fill="#1a1a1a" />
                                    </g>
                                </svg>
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="text-2xl font-light tracking-[0.2em] text-black-accent animate-pulse">CONECTANDO</h3>
                                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                                    Interpretando vibraciones
                                </p>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Header - Only visible when not loading (optional, but keep for transition effect) */}
            <header ref={headerRef} className={`flex justify-between items-center px-6 md:px-12 py-6 md:py-10 relative z-10 transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                <TransitionLink className="flex items-center gap-2 text-slate-400 hover:text-black-accent transition-colors group" href="/">
                    <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
                    <span className="text-xs md:text-sm font-semibold uppercase tracking-widest">Volver</span>
                </TransitionLink>
                <div className="flex items-center gap-3 md:gap-6">
                    <button className="material-symbols-outlined p-2 rounded-full hover:bg-slate-100 transition-colors text-xl md:text-2xl">notifications</button>
                    <button className="material-symbols-outlined p-2 rounded-full hover:bg-slate-100 transition-colors text-xl md:text-2xl">help_outline</button>
                </div>
            </header>

            {/* Main Content */}
            <section className={`flex-1 flex items-center justify-center px-4 md:px-8 py-6 md:py-0 relative z-10 overflow-y-auto transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-20 items-center my-auto">
                        <div ref={formRef} className="space-y-8 md:space-y-12">
                        <div className="space-y-2">
                            <h2 className="text-xs uppercase tracking-[0.4em] font-semibold text-slate-400">Paso 01</h2>
                            <h1 className="text-4xl md:text-6xl font-light tracking-tight">Nueva <span className="font-bold">Consulta</span></h1>
                        </div>

                        <form className="space-y-4 md:space-y-8" onSubmit={handleSubmit}>
                            <div className="space-y-3 md:space-y-6">
                                <div className="group">
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 ml-1 group-focus-within:text-black-accent transition-colors">
                                        Nombre Completo
                                    </label>
                                    <input
                                        className="w-full bg-white border-none rounded-2xl p-3 md:p-5 soft-shadow focus:ring-2 focus:ring-lavender transition-all text-base md:text-lg font-light placeholder:text-slate-300"
                                        placeholder="Ej. Sofía Martínez"
                                        type="text"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                                    <div className="group">
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 ml-1 group-focus-within:text-black-accent transition-colors">
                                            Fecha de Nacimiento
                                        </label>
                                        <div className="relative">
                                            <input
                                                className="w-full bg-white border-none rounded-2xl p-3 md:p-5 soft-shadow focus:ring-2 focus:ring-lavender transition-all text-base md:text-lg font-light placeholder:text-slate-300 appearance-none"
                                                type="date"
                                            />
                                            <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
                                                calendar_today
                                            </span>
                                        </div>
                                    </div>

                                    <div className="group">
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 ml-1 group-focus-within:text-black-accent transition-colors">
                                            Correo Electrónico
                                        </label>
                                        <input
                                            className="w-full bg-white border-none rounded-2xl p-3 md:p-5 soft-shadow focus:ring-2 focus:ring-lavender transition-all text-base md:text-lg font-light placeholder:text-slate-300"
                                            placeholder="cliente@ejemplo.com"
                                            type="email"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-3 md:pt-6">
                                <button
                                    className={`w-full bg-black-accent text-white py-3 md:py-6 rounded-2xl font-bold text-sm tracking-[0.2em] uppercase flex items-center justify-center gap-4 hover:bg-slate-800 transition-all shadow-xl shadow-black/10 active:scale-[0.99] ${isLoading ? 'opacity-80 cursor-wait' : ''}`}
                                    type="submit"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Procesando...' : 'Comenzar Análisis'}
                                    {!isLoading && <span className="material-symbols-outlined text-lg">auto_awesome</span>}
                                </button>
                                <p className="text-center text-[10px] text-slate-400 uppercase tracking-widest mt-3 md:mt-6 leading-relaxed">
                                    El análisis tomará aproximadamente 15 segundos en ser procesado.
                                </p>
                            </div>
                        </form>
                    </div>

                    {/* Illustration */}
                    <div ref={illustrationRef} className="hidden lg:flex justify-center relative">
                        <div className="relative w-full aspect-square flex items-center justify-center">
                            <svg className="w-full max-w-md drop-shadow-xl opacity-90 transition-transform duration-1000 ease-out hover:rotate-12" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
                                <desc>Geometría Sagrada Minimalista</desc>
                                
                                {/* Group centered at 200,200 for easier rotation/symmetries */}
                                <g transform="translate(200, 200)">
                                    
                                    {/* Delicate outer orbits */}
                                    <circle cx="0" cy="0" r="140" fill="none" stroke="#1a1a1a" strokeWidth="0.5" strokeOpacity="0.3" />
                                    <circle cx="0" cy="0" r="160" fill="none" stroke="#1a1a1a" strokeWidth="0.3" strokeOpacity="0.2" />
                                    
                                    {/* Seed of Life Pattern - Pure Strokes */}
                                    <g stroke="#1a1a1a" strokeWidth="0.8" fill="none" strokeOpacity="0.7">
                                        <circle cx="0" cy="0" r="50" />
                                        <circle cx="0" cy="-50" r="50" />
                                        <circle cx="43.3" cy="-25" r="50" />
                                        <circle cx="43.3" cy="25" r="50" />
                                        <circle cx="0" cy="50" r="50" />
                                        <circle cx="-43.3" cy="25" r="50" />
                                        <circle cx="-43.3" cy="-25" r="50" />
                                    </g>

                                    {/* Intersecting Geometry */}
                                    <g stroke="#1a1a1a" strokeWidth="0.5" fill="none" strokeOpacity="0.4" transform="rotate(30)">
                                        <path d="M0 -140 L0 140" />
                                        <path d="M-121.2 -70 L121.2 70" />
                                        <path d="M-121.2 70 L121.2 -70" />
                                    </g>

                                    {/* Tiny Accents - Minimalist dots */}
                                    <circle cx="0" cy="-140" r="2" fill="#1a1a1a" opacity="0.6" />
                                    <circle cx="121.2" cy="-70" r="2" fill="#1a1a1a" opacity="0.6" />
                                    <circle cx="121.2" cy="70" r="2" fill="#1a1a1a" opacity="0.6" />
                                    <circle cx="0" cy="140" r="2" fill="#1a1a1a" opacity="0.6" />
                                    <circle cx="-121.2" cy="70" r="2" fill="#1a1a1a" opacity="0.6" />
                                    <circle cx="-121.2" cy="-70" r="2" fill="#1a1a1a" opacity="0.6" />
                                    
                                    {/* Center point */}
                                    <circle cx="0" cy="0" r="3" fill="#1a1a1a" />
                                </g>
                            </svg>
                            
                            {/* Floating UI Elements for depth */}
                            <div className="absolute top-10 right-10 bg-white p-3 rounded-2xl shadow-xl animate-[bounce_3s_infinite]">
                                <span className="material-symbols-outlined text-black-accent">magic_button</span>
                            </div>
                            <div className="absolute bottom-20 left-0 bg-white p-3 rounded-2xl shadow-xl animate-[bounce_4s_infinite]" style={{ animationDelay: '1s' }}>
                                <span className="material-symbols-outlined text-black-accent">all_inclusive</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            {!isLoading && (
            <footer className="px-6 md:px-12 py-4 md:py-8 flex flex-col md:flex-row justify-between items-center gap 4 md:gap-0 relative z-10 transition-opacity duration-500">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">© 2024 Numerología Moderna</p>
                <div className="flex gap-6 md:gap-8">
                    <a className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] hover:text-black-accent transition-colors" href="#">Privacidad</a>
                    <a className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] hover:text-black-accent transition-colors" href="#">Términos</a>
                </div>
            </footer>
            )}
        </main>
    );
}

'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import Link from 'next/link';
import TransitionLink from '../components/TransitionLink';

export default function NuevaConsultaPage() {
    const formRef = useRef(null);
    const illustrationRef = useRef(null);
    const headerRef = useRef(null);

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

    return (
        <main className="flex-1 flex flex-col relative overflow-hidden">{/* Background Shapes */}
            {/* Background Shapes */}
            <div className="absolute rounded-full blur-3xl opacity-40 bg-mint w-96 h-96 -top-20 -right-20"></div>
            <div className="absolute rounded-full blur-3xl opacity-40 bg-lavender w-80 h-80 top-1/2 -right-10"></div>
            <div className="absolute rounded-full blur-3xl opacity-40 bg-peach w-64 h-64 bottom-0 left-1/4"></div>

            {/* Header */}
            <header ref={headerRef} className="flex justify-between items-center px-6 md:px-12 py-6 md:py-10 relative z-10">
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
            <section className="flex-1 flex items-center justify-center px-4 md:px-8 py-6 md:py-0 relative z-10 overflow-y-auto">
                <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-20 items-center my-auto">
                    {/* Form */}
                    <div ref={formRef} className="space-y-8 md:space-y-12">
                        <div className="space-y-2">
                            <h2 className="text-xs uppercase tracking-[0.4em] font-semibold text-slate-400">Paso 01</h2>
                            <h1 className="text-4xl md:text-6xl font-light tracking-tight">Nueva <span className="font-bold">Consulta</span></h1>
                        </div>

                        <form className="space-y-4 md:space-y-8">
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
                                    className="w-full bg-black-accent text-white py-3 md:py-6 rounded-2xl font-bold text-sm tracking-[0.2em] uppercase flex items-center justify-center gap-4 hover:bg-slate-800 transition-all shadow-xl shadow-black/10 active:scale-[0.99]"
                                    type="submit"
                                >
                                    Comenzar Análisis
                                    <span className="material-symbols-outlined text-lg">auto_awesome</span>
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
                            <svg className="w-full max-w-md animate-pulse" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="100" cy="100" fill="none" r="80" stroke="#e6f4f1" strokeWidth="0.5"></circle>
                                <circle cx="100" cy="100" fill="none" r="60" stroke="#f0eafc" strokeWidth="0.5"></circle>
                                <circle cx="100" cy="100" fill="none" r="40" stroke="#fff1e6" strokeWidth="0.5"></circle>
                                <path d="M100 20 L100 180 M20 100 L180 100" stroke="#1a1a1a" strokeOpacity="0.05" strokeWidth="0.5"></path>
                                <rect fill="none" height="114" stroke="#f0eafc" strokeWidth="0.5" transform="rotate(45 100 100)" width="114" x="43" y="43"></rect>
                                <rect fill="none" height="114" stroke="#e6f4f1" strokeWidth="0.5" width="114" x="43" y="43"></rect>
                                <polygon fill="none" points="100,30 165,140 35,140" stroke="#fff1e6" strokeOpacity="0.8" strokeWidth="0.5"></polygon>
                                <polygon fill="none" points="100,170 165,60 35,60" stroke="#f0eafc" strokeOpacity="0.8" strokeWidth="0.5"></polygon>
                                <circle cx="100" cy="100" fill="#1a1a1a" r="2"></circle>
                            </svg>
                            <div className="absolute top-1/4 right-0 w-4 h-4 rounded-full bg-peach"></div>
                            <div className="absolute bottom-1/4 left-0 w-3 h-3 rounded-full bg-mint"></div>
                            <div className="absolute top-10 left-1/4 w-2 h-2 rounded-full bg-lavender"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="px-6 md:px-12 py-4 md:py-8 flex flex-col md:flex-row justify-between items-center gap 4 md:gap-0 relative z-10">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">© 2024 Numerología Moderna</p>
                <div className="flex gap-6 md:gap-8">
                    <a className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] hover:text-black-accent transition-colors" href="#">Privacidad</a>
                    <a className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] hover:text-black-accent transition-colors" href="#">Términos</a>
                </div>
            </footer>
        </main>
    );
}

'use client';

import { useEffect, useRef, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import TransitionLink from '../components/TransitionLink';

export default function NuevaConsultaPage() {
    const formRef = useRef<HTMLDivElement>(null);
    const illustrationRef = useRef<HTMLDivElement>(null);
    const mandalaSvgRef = useRef<SVGSVGElement>(null);
    const headerRef = useRef<HTMLElement>(null);
    const footerRef = useRef<HTMLElement>(null);
    const loadingTextRef = useRef<HTMLDivElement>(null);
    const floatingEl1Ref = useRef<HTMLDivElement>(null);
    const floatingEl2Ref = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

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

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Capture form data
        const formData = new FormData(e.target as HTMLFormElement);
        const nombre = (formData.get('nombre') as string).trim();
        const apellido = (formData.get('apellido') as string).trim();
        const nombreCompleto = `${nombre} ${apellido}`;
        const fechaNacimiento = formData.get('fechaNacimiento') as string;

        const illustrationEl = illustrationRef.current;
        const svgEl = mandalaSvgRef.current;
        if (!illustrationEl || !svgEl) return;

        // Capture exact visual position of the mandala div
        const rect = illustrationEl.getBoundingClientRect();

        // Calculate how far the mandala center needs to move to reach viewport center
        const currentCenterX = rect.left + rect.width / 2;
        const currentCenterY = rect.top + rect.height / 2;
        const viewportCenterX = window.innerWidth / 2 + 40; // slightly to the right
        const viewportCenterY = window.innerHeight / 2 - 60; // offset up to leave room for text below

        // Delta = how much to translate from current position
        const deltaX = viewportCenterX - currentCenterX;
        const deltaY = viewportCenterY - currentCenterY;

        const tl = gsap.timeline();

        // 1. Fade out header (slides up)
        tl.to(headerRef.current, {
            opacity: 0,
            y: -30,
            duration: 0.5,
            ease: 'power2.inOut',
        }, 0);

        // 2. Fade out footer (slides down)
        tl.to(footerRef.current, {
            opacity: 0,
            y: 30,
            duration: 0.5,
            ease: 'power2.inOut',
        }, 0);

        // 3. Fade out form (slide left + fade)
        tl.to(formRef.current, {
            opacity: 0,
            x: -60,
            duration: 0.6,
            ease: 'power3.inOut',
        }, 0.05);

        // 4. Fade out floating icon elements
        tl.to([floatingEl1Ref.current, floatingEl2Ref.current], {
            opacity: 0,
            duration: 0.5,
            ease: 'power2.inOut',
        }, 0.2);

        // 5. Move the ENTIRE mandala div to viewport center using x/y translation
        tl.to(illustrationEl, {
            x: deltaX,
            y: deltaY,
            duration: 1.2,
            ease: 'power3.inOut',
        }, 0.4);

        // 5. Start spinning ONLY the SVG (not the floating icons)
        tl.to(svgEl, {
            rotation: 360,
            duration: 15,
            repeat: -1,
            ease: 'none',
            transformOrigin: '50% 50%',
        }, 1.2);

        // 6. Show loading text centered below the mandala
        //    Calculate where the mandala ends up and place text below it
        const mandalaFinalBottom = viewportCenterY + rect.height / 2;
        tl.add(() => {
            if (loadingTextRef.current) {
                loadingTextRef.current.style.display = 'flex';
                loadingTextRef.current.style.top = `${mandalaFinalBottom + 24}px`;
            }
        }, 1.4);
        tl.fromTo(loadingTextRef.current, {
            opacity: 0,
            y: 15,
        }, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
        }, 1.5);

        // 7. Change text to "ANALIZANDO" after a delay
        tl.add(() => {
            if (loadingTextRef.current) {
                const h3 = loadingTextRef.current.querySelector('h3');
                const p = loadingTextRef.current.querySelector('p');
                if (h3 && p) {
                    gsap.to([h3, p], {
                        opacity: 0,
                        y: -10,
                        duration: 0.4,
                        ease: 'power2.in',
                        onComplete: () => {
                            h3.textContent = 'ANALIZANDO';
                            p.textContent = 'Descifrando tu mapa numérico';
                            gsap.fromTo([h3, p], {
                                opacity: 0,
                                y: 10,
                            }, {
                                opacity: 1,
                                y: 0,
                                duration: 0.4,
                                ease: 'power2.out',
                            });
                        },
                    });
                }
            }
        }, 3.5);

        // 8. Call the API in parallel with the animation
        const apiCall = fetch('/api/numerology', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombreCompleto, fechaNacimiento }),
        }).then(async (res) => {
            if (!res.ok) throw new Error('Error en el cálculo');
            return res.json();
        });

        // 9. Navigate after BOTH animation + API complete
        tl.add(() => {
            apiCall.then((result) => {
                sessionStorage.setItem('numerologyResult', JSON.stringify(result));
                router.push('/resultados');
            }).catch(() => {
                alert('Hubo un error al calcular. Intenta de nuevo.');
                setIsLoading(false);
                window.location.reload();
            });
        }, 5.5);
    };

    return (
        <main className="flex-1 flex flex-col relative overflow-hidden">
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
                    <div ref={formRef} className="space-y-8 md:space-y-12">
                        <div className="space-y-2">
                            <h2 className="text-xs uppercase tracking-[0.4em] font-semibold text-slate-400">Paso 01</h2>
                            <h1 className="text-4xl md:text-6xl font-light tracking-tight">Nueva <span className="font-bold">Consulta</span></h1>
                        </div>

                        <form className="space-y-4 md:space-y-8" onSubmit={handleSubmit}>
                            <div className="space-y-3 md:space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                                    <div className="group">
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 ml-1 group-focus-within:text-black-accent transition-colors">
                                            Nombre
                                        </label>
                                        <input
                                            name="nombre"
                                            required
                                            className="w-full bg-white border-none rounded-2xl p-3 md:p-5 soft-shadow focus:ring-2 focus:ring-lavender transition-all text-base md:text-lg font-light placeholder:text-slate-300"
                                            placeholder="Ej. Sofía"
                                            type="text"
                                        />
                                    </div>
                                    <div className="group">
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 ml-1 group-focus-within:text-black-accent transition-colors">
                                            Apellido
                                        </label>
                                        <input
                                            name="apellido"
                                            required
                                            className="w-full bg-white border-none rounded-2xl p-3 md:p-5 soft-shadow focus:ring-2 focus:ring-lavender transition-all text-base md:text-lg font-light placeholder:text-slate-300"
                                            placeholder="Ej. Martínez"
                                            type="text"
                                        />
                                    </div>
                                </div>

                                <div className="group">
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 ml-1 group-focus-within:text-black-accent transition-colors">
                                        Fecha de Nacimiento
                                    </label>
                                    <div className="relative">
                                        <input
                                            name="fechaNacimiento"
                                            required
                                            className="w-full bg-white border-none rounded-2xl p-3 md:p-5 soft-shadow focus:ring-2 focus:ring-lavender transition-all text-base md:text-lg font-light placeholder:text-slate-300 appearance-none"
                                            type="date"
                                        />
                                        <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
                                            calendar_today
                                        </span>
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

                    {/* Illustration - Mandala (entire div moves to center on submit) */}
                    <div ref={illustrationRef} className="hidden lg:flex flex-col items-center justify-center relative overflow-hidden">
                        <div className="relative w-full aspect-square flex items-center justify-center overflow-hidden">
                            <svg ref={mandalaSvgRef} className="w-full max-w-md drop-shadow-xl opacity-90 transition-transform duration-1000 ease-out hover:rotate-12" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
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
                            <div ref={floatingEl1Ref} className="absolute top-10 right-10 bg-white p-3 rounded-2xl shadow-xl animate-[bounce_3s_infinite]">
                                <span className="material-symbols-outlined text-black-accent">magic_button</span>
                            </div>
                            <div ref={floatingEl2Ref} className="absolute bottom-20 left-0 bg-white p-3 rounded-2xl shadow-xl animate-[bounce_4s_infinite]" style={{ animationDelay: '1s' }}>
                                <span className="material-symbols-outlined text-black-accent">all_inclusive</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Loading text - fixed centered below mandala, shown during loading */}
            <div ref={loadingTextRef} className="fixed z-[60] left-1/2 -translate-x-1/2 flex-col items-center gap-3 text-center" style={{ display: 'none' }}>
                <h3 className="text-2xl font-light tracking-[0.2em] text-black-accent animate-pulse">CONECTANDO</h3>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    Interpretando vibraciones
                </p>
            </div>

            {/* Footer */}
            <footer ref={footerRef} className="px-6 md:px-12 py-4 md:py-8 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0 relative z-10">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">© 2024 Numerología Moderna</p>
                <div className="flex gap-6 md:gap-8">
                    <a className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] hover:text-black-accent transition-colors" href="#">Privacidad</a>
                    <a className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] hover:text-black-accent transition-colors" href="#">Términos</a>
                </div>
            </footer>
        </main>
    );
}

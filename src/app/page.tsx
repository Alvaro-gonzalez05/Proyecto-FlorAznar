'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import TransitionLink from './components/TransitionLink';

export default function Home() {
  const headerRef = useRef(null);
  const heroRef = useRef(null);
  const sectionTitleRef = useRef(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Staggered entrance animations for content
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

      timeline.fromTo(heroRef.current,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
        }, '-=0.3'
      );

      timeline.fromTo(sectionTitleRef.current,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power3.out',
        }, '-=0.4'
      );

      timeline.fromTo(cardsRef.current.filter(Boolean),
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.12,
          ease: 'power3.out',
        }, '-=0.3'
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="px-8 lg:px-12 py-6">
      <header ref={headerRef} className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xs uppercase tracking-[0.4em] font-semibold text-slate-400 mb-1">Módulo de Consultoría</h1>
          <p className="text-sm font-medium">Lunes, 24 de Mayo</p>
        </div>
        <div className="flex items-center gap-6">
          <button className="text-sm font-semibold flex items-center gap-2 border-b border-black-accent pb-1 px-1">
            Soporte Premium
          </button>
          <button className="material-symbols-outlined p-2 rounded-full hover:bg-slate-100">notifications</button>
        </div>
      </header>

      <section className="mb-6">
        <div 
          ref={heroRef} 
          className="bg-white rounded-[2rem] p-6 lg:p-8 relative overflow-hidden soft-shadow border border-slate-50 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl cursor-default group"
        >
          
          {/* Animated Aura Background */}
          <div className="absolute inset-0 overflow-hidden rounded-[2rem] pointer-events-none">
             <div className="absolute -top-[10%] -left-[10%] w-[80%] h-[80%] bg-[#e6f4f1] rounded-full filter blur-[80px] opacity-100 animate-aura-1 transform-gpu"></div>
             <div className="absolute top-[10%] -right-[10%] w-[70%] h-[70%] bg-[#f0eafc] rounded-full filter blur-[80px] opacity-100 animate-aura-2 transform-gpu"></div>
             <div className="absolute -bottom-[20%] left-[20%] w-[70%] h-[70%] bg-[#fff1e6] rounded-full filter blur-[80px] opacity-100 animate-aura-3 transform-gpu"></div>
          </div>

          <div className="absolute -top-10 -right-10 p-8 opacity-25 pointer-events-none z-0">
            <svg className="text-black-accent w-64 h-64 group-hover:rotate-45 transition-transform duration-[3s] ease-in-out" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5">
               {/* Centro */}
               <circle cx="50" cy="50" r="5" />
               <circle cx="50" cy="50" r="2" fill="currentColor" className="opacity-50" />
               
               {/* Flor Central */}
               <path d="M50 50 Q60 30 50 10 Q40 30 50 50 Z" />
               <path d="M50 50 Q70 40 90 50 Q70 60 50 50 Z" />
               <path d="M50 50 Q60 70 50 90 Q40 70 50 50 Z" />
               <path d="M50 50 Q30 60 10 50 Q30 40 50 50 Z" />
               
               {/* Pétalos Diagonales */}
               <path d="M50 50 Q65 35 80 20" />
               <path d="M50 50 Q80 20 65 35" transform="rotate(90 50 50)" />
               <path d="M50 50 Q65 65 80 80" />
               <path d="M50 50 Q35 65 20 80" />
               <path d="M50 50 Q35 35 20 20" />
               
               {/* Círculos Externos */}
               <circle cx="50" cy="50" r="25" strokeDasharray="1 2" />
               <circle cx="50" cy="50" r="38" opacity="0.5" />
               <circle cx="50" cy="50" r="45" opacity="0.3" strokeDasharray="4 1" />
            </svg>
          </div>
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-3xl lg:text-4xl font-light tracking-tight mb-3">
              Hola, <span className="font-bold">Flor</span>
            </h2>
            <p className="text-sm lg:text-base text-slate-700/80 leading-relaxed mb-4 max-w-lg">
              Hoy las energías sugieren un enfoque en la introspección y el equilibrio. Tienes 4 reportes listos para ser analizados.
            </p>
            <TransitionLink
              href="/nueva-consulta"
              className="bg-black-accent text-white px-6 py-3 rounded-full font-bold text-xs tracking-widest uppercase inline-flex items-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-black/10"
            >
              Nueva Consulta
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </TransitionLink>
          </div>
        </div>
      </section>

      <section>
        <div ref={sectionTitleRef} className="flex justify-between items-end mb-4">
          <div>
            <h3 className="text-xl font-semibold tracking-tight">Últimos Análisis</h3>
            <p className="text-slate-400 text-sm mt-1">Consultas procesadas recientemente</p>
          </div>
          <a className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-black-accent transition-colors" href="#">Ver todo</a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div ref={(el) => { cardsRef.current[0] = el; }} className="bg-white p-5 rounded-3xl border border-slate-50 soft-shadow group hover:border-mint hover:scale-[1.03] transition-all cursor-pointer">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-mint rounded-2xl flex items-center justify-center">
                <span className="material-symbols-outlined text-emerald-800/60">fingerprint</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full text-slate-400 group-hover:bg-mint/30 group-hover:text-emerald-800 transition-colors">Misión</span>
            </div>
            <h4 className="text-lg font-bold mb-1 tracking-tight">Sofía Martínez</h4>
            <p className="text-xs text-slate-400 tracking-wider mb-4">24 OCT 1992</p>
            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
              <span className="text-xl font-light">Destino <span className="font-bold">11</span></span>
              <span className="material-symbols-outlined text-slate-300 group-hover:translate-x-1 transition-transform">chevron_right</span>
            </div>
          </div>
          <div ref={(el) => { cardsRef.current[1] = el; }} className="bg-white p-5 rounded-3xl border border-slate-50 soft-shadow group hover:border-lavender hover:scale-[1.03] transition-all cursor-pointer">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-lavender rounded-2xl flex items-center justify-center">
                <span className="material-symbols-outlined text-purple-800/60">self_improvement</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full text-slate-400 group-hover:bg-lavender/30 group-hover:text-purple-800 transition-colors">Interior</span>
            </div>
            <h4 className="text-lg font-bold mb-1 tracking-tight">Julián Ricci</h4>
            <p className="text-xs text-slate-400 tracking-wider mb-4">12 FEB 1985</p>
            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
              <span className="text-xl font-light">Alma <span className="font-bold">7</span></span>
              <span className="material-symbols-outlined text-slate-300 group-hover:translate-x-1 transition-transform">chevron_right</span>
            </div>
          </div>
          <div ref={(el) => { cardsRef.current[2] = el; }} className="bg-white p-5 rounded-3xl border border-slate-50 soft-shadow group hover:border-peach hover:scale-[1.03] transition-all cursor-pointer">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-peach rounded-2xl flex items-center justify-center">
                <span className="material-symbols-outlined text-orange-800/60">all_inclusive</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full text-slate-400 group-hover:bg-peach/30 group-hover:text-orange-800 transition-colors">Ciclo</span>
            </div>
            <h4 className="text-lg font-bold mb-1 tracking-tight">Elena Vargas</h4>
            <p className="text-xs text-slate-400 tracking-wider mb-4">05 SEP 1978</p>
            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
              <span className="text-xl font-light">Personalidad <span className="font-bold">22</span></span>
              <span className="material-symbols-outlined text-slate-300 group-hover:translate-x-1 transition-transform">chevron_right</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

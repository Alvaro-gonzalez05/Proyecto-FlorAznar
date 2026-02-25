'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import TransitionLink from './components/TransitionLink';
import { supabase } from '@/lib/supabase';

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

export default function Home() {
  const headerRef = useRef(null);
  const heroRef = useRef(null);
  const sectionTitleRef = useRef(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  const [recentConsults, setRecentConsults] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const handleViewResults = (consult: any) => {
    if (consult.numerologia_data) {
      sessionStorage.setItem('numerologyResult', JSON.stringify(consult.numerologia_data));
    }
    if (consult.explicaciones_ia) {
      sessionStorage.setItem('geminiExplanations', JSON.stringify(consult.explicaciones_ia));
    }
    router.push('/resultados');
  };

  // Initial Data Fetch
  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Fetch total count
        const { count, error: countError } = await supabase
          .from('consultas')
          .select('*', { count: 'exact', head: true });

        if (!countError) setTotalCount(count || 0);

        // 2. Fetch last 3
        const { data, error } = await supabase
          .from('consultas')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);

        if (!error && data) {
          setRecentConsults(data);
        }
      } catch (err) {
        console.error("Error fetching homepage data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    // Only run GSAP context when loading is false to animate dynamic items
    if (loading) return;

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
  }, [loading, recentConsults]);

  return (
    <div className="px-8 lg:px-12 py-6">
      <header ref={headerRef} className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xs uppercase tracking-[0.4em] font-semibold text-slate-400 mb-1">Módulo de Consultoría</h1>
          <p className="text-sm font-medium capitalize">
            {new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'America/Argentina/Buenos_Aires' }).format(new Date())}
          </p>
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
              Hoy las energías sugieren un enfoque en la introspección y el equilibrio. Tienes <span className="font-bold text-black-accent">{totalCount} reportes</span> guardados en tu historial.
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
          <TransitionLink className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-black-accent transition-colors" href="/historial">Ver todo</TransitionLink>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-3 py-10 flex justify-center items-center">
              <span className="material-symbols-outlined animate-spin text-slate-300 text-3xl">refresh</span>
            </div>
          ) : recentConsults.length === 0 ? (
            <div className="col-span-3 py-10 flex flex-col justify-center items-center text-slate-400">
              <span className="material-symbols-outlined text-4xl mb-2 opacity-50">inbox</span>
              <p className="text-sm">Aún no hay análisis guardados.</p>
            </div>
          ) : (
            recentConsults.map((consult, index) => {
              // Extract a reliable main number to show
              // e.g., Vibración Interna or Camino de Vida
              const mainNumber = consult.numerologia_data?.primeraParte?.vibracionInterna?.digit || '-';

              // We assign rotating styling contexts for visual variety
              const styles = [
                { border: 'hover:border-mint', bg: 'bg-mint', text: 'text-emerald-800', hoverBg: 'group-hover:bg-mint/30', hoverText: 'group-hover:text-emerald-800', iconBg: 'bg-mint/30', iconText: 'text-emerald-800/60', icon: 'fingerprint', tag: 'Esencia' },
                { border: 'hover:border-lavender', bg: 'bg-lavender', text: 'text-purple-800', hoverBg: 'group-hover:bg-lavender/30', hoverText: 'group-hover:text-purple-800', iconBg: 'bg-lavender/30', iconText: 'text-purple-800/60', icon: 'self_improvement', tag: 'Cálculo' },
                { border: 'hover:border-peach', bg: 'bg-peach', text: 'text-orange-800', hoverBg: 'group-hover:bg-peach/30', hoverText: 'group-hover:text-orange-800', iconBg: 'bg-peach/30', iconText: 'text-orange-800/60', icon: 'all_inclusive', tag: 'Registro' }
              ];
              const st = styles[index % styles.length];

              return (
                <div
                  key={consult.id}
                  ref={(el) => { cardsRef.current[index] = el; }}
                  onClick={() => handleViewResults(consult)}
                  className={`bg-white p-5 rounded-3xl border border-slate-50 soft-shadow group ${st.border} hover:scale-[1.03] hover:-translate-y-2 hover:shadow-xl transition-all cursor-pointer`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className={`w-12 h-12 ${st.bg} rounded-2xl flex items-center justify-center`}>
                      <span className={`material-symbols-outlined ${st.iconText}`}>{st.icon}</span>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full text-slate-400 ${st.hoverBg} ${st.hoverText} transition-colors`}>{st.tag}</span>
                  </div>
                  <h4 className="text-lg font-bold mb-1 tracking-tight capitalize">{consult.nombre_completo.toLowerCase()}</h4>
                  <p className="text-xs text-slate-400 tracking-wider mb-4">{formatDateDisplay(consult.created_at)}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <span className="text-xl font-light">Vibración <span className="font-bold">{mainNumber}</span></span>
                    <span className="material-symbols-outlined text-slate-300 group-hover:translate-x-1 transition-transform">chevron_right</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}

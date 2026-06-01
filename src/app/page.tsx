'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const WHATSAPP_NUMBER = '5491130704788';
const TOTAL_TESTIMONIALS = 5;

const servicios = [
  {
    title: 'Pack de 3 Sesiones de Coaching Profundo',
    description: 'Un contenedor personalizado y de alta intensidad para cambios transformadores. Tres sesiones estratégicas adaptadas a tus metas únicas.',
    features: ['3 sesiones de coaching uno a uno', 'Seguimiento personalizado entre sesiones'],
    extra: '+ Opción de sumar el libro del Método RAP',
    whatsappMsg: 'Hola! Me interesa consultar disponibilidad para el Pack de 3 sesiones de coaching profundo. ¿Podrías darme más información?',
  },
  {
    title: 'Sesión Única de Autoconocimiento',
    description: 'Un análisis profundo de tu personalidad. Una sesión intensa donde vas a descubrir patrones, fortalezas y puntos ciegos que no sabías que tenías.',
    features: ['Análisis profundo de personalidad', 'Informe detallado con insights clave'],
    extra: '+ Opción de sumar el libro del Método RAP',
    whatsappMsg: 'Hola! Me interesa consultar disponibilidad para la Sesión única de autoconocimiento. ¿Podrías darme más información?',
  },
  {
    title: 'Proceso de Claridad Personal',
    description: 'El camino más completo. Incluye el análisis de personalidad, material exclusivo, 4 sesiones 1:1 conmigo y mi libro. Todo lo que necesitás para transformar tu vida de verdad.',
    features: ['Análisis de personalidad completo', 'Material exclusivo + 4 sesiones 1:1', 'Libro del Método RAP incluido'],
    extra: null,
    whatsappMsg: 'Hola! Me interesa consultar disponibilidad para el Proceso de claridad personal. ¿Podrías darme más información?',
  },
];

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentService, setCurrentService] = useState(0);
  const [isBookDropdownOpen, setIsBookDropdownOpen] = useState(false);
  const [purchaseThank, setPurchaseThank] = useState(false);
  const [bookHovered, setBookHovered] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [testimonialPaused, setTestimonialPaused] = useState(false);

  const handlePurchaseClick = (url: string) => {
    setPurchaseThank(true);
    setTimeout(() => { window.open(url, '_blank', 'noopener,noreferrer'); }, 600);
    setTimeout(() => { setPurchaseThank(false); setIsBookDropdownOpen(false); }, 2200);
  };

  const nextService = useCallback(() => {
    setCurrentService((prev) => (prev + 1) % servicios.length);
  }, []);

  const prevService = useCallback(() => {
    setCurrentService((prev) => (prev - 1 + servicios.length) % servicios.length);
  }, []);

  const nextTestimonial = useCallback(() => {
    setCurrentTestimonial((prev) => (prev + 1) % TOTAL_TESTIMONIALS);
  }, []);

  const prevTestimonial = useCallback(() => {
    setCurrentTestimonial((prev) => (prev - 1 + TOTAL_TESTIMONIALS) % TOTAL_TESTIMONIALS);
  }, []);

  useEffect(() => {
    const interval = setInterval(nextService, 5000);
    return () => clearInterval(interval);
  }, [nextService]);

  useEffect(() => {
    if (testimonialPaused) return;
    const timer = setInterval(nextTestimonial, 4500);
    return () => clearInterval(timer);
  }, [testimonialPaused, nextTestimonial]);

  useGSAP(() => {
    gsap.set(['.hero-nav', '.hero-badge', '.hero-title', '.hero-subtitle', '.hero-buttons', '.hero-image', '.hero-quote'], { opacity: 0 });
    gsap.fromTo('.hero-nav', { y: -40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, delay: 0.1, ease: 'power3.out' });
    gsap.fromTo('.hero-badge', { y: 30, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 0.7, delay: 0.3, ease: 'back.out(1.5)' });
    gsap.fromTo('.hero-title', { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: 0.5, ease: 'power3.out' });
    gsap.fromTo('.hero-subtitle', { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: 0.7, ease: 'power3.out' });
    gsap.fromTo('.hero-buttons', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: 0.9, ease: 'power3.out' });
    gsap.fromTo('.hero-image', { x: 100, opacity: 0, scale: 0.95 }, { x: 0, opacity: 1, scale: 1, duration: 1.3, delay: 0.4, ease: 'power3.out' });
    gsap.fromTo('.hero-quote', { y: 50, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 1, delay: 1.1, ease: 'power3.out' });

    gsap.from('.rap-title', { y: 60, opacity: 0, duration: 0.8, ease: 'power2.out', scrollTrigger: { trigger: '.rap-title', start: 'top 85%', toggleActions: 'play none none reverse' } });
    gsap.from('.rap-card', { y: 80, opacity: 0, duration: 0.7, stagger: 0.2, ease: 'power2.out', scrollTrigger: { trigger: '.rap-cards', start: 'top 80%', toggleActions: 'play none none reverse' } });
    gsap.from('.rap-letter', { y: 100, opacity: 0, scale: 0.8, duration: 0.8, stagger: 0.15, ease: 'back.out(1.4)', scrollTrigger: { trigger: '.rap-cards', start: 'top 80%', toggleActions: 'play none none reverse' } });

    gsap.from('.book-text', { x: -80, opacity: 0, duration: 0.9, ease: 'power2.out', scrollTrigger: { trigger: '.book-section', start: 'top 75%', toggleActions: 'play none none reverse' } });
    gsap.from('.book-mockup', { x: 80, opacity: 0, duration: 1, ease: 'power2.out', scrollTrigger: { trigger: '.book-section', start: 'top 75%', toggleActions: 'play none none reverse' } });

    gsap.from('.services-title', { y: 50, opacity: 0, duration: 0.8, ease: 'power2.out', scrollTrigger: { trigger: '.services-title', start: 'top 85%', toggleActions: 'play none none reverse' } });
    gsap.from('.service-card', { y: 60, opacity: 0, duration: 0.7, stagger: 0.2, ease: 'power2.out', scrollTrigger: { trigger: '.services-grid', start: 'top 80%', toggleActions: 'play none none reverse' } });

    gsap.from('.testimonial-images', { scale: 0.85, opacity: 0, duration: 0.9, ease: 'power2.out', scrollTrigger: { trigger: '.testimonials-section', start: 'top 75%', toggleActions: 'play none none reverse' } });
    gsap.from('.testimonial-quote', { x: 60, opacity: 0, duration: 0.9, ease: 'power2.out', scrollTrigger: { trigger: '.testimonials-section', start: 'top 75%', toggleActions: 'play none none reverse' } });

    gsap.from('.cta-section', { y: 60, opacity: 0, scale: 0.95, duration: 0.9, ease: 'power2.out', scrollTrigger: { trigger: '.cta-section', start: 'top 80%', toggleActions: 'play none none reverse' } });
    gsap.from('.landing-footer', { y: 30, opacity: 0, duration: 0.7, ease: 'power2.out', scrollTrigger: { trigger: '.landing-footer', start: 'top 90%', toggleActions: 'play none none reverse' } });

    gsap.to('.hero-blob-1', { y: -120, ease: 'none', scrollTrigger: { trigger: '.hero-section', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero-blob-2', { y: -80, ease: 'none', scrollTrigger: { trigger: '.hero-section', start: 'top top', end: 'bottom top', scrub: true } });
  }, { scope: containerRef });

  const tItemStyle = (idx: number): React.CSSProperties => ({
    position: 'absolute',
    top: 0, right: 0, bottom: 0, left: 0,
    opacity: idx === currentTestimonial ? 1 : 0,
    transform: idx === currentTestimonial ? 'translateY(0px)' : 'translateY(16px)',
    transition: 'opacity 0.7s ease, transform 0.7s ease',
    pointerEvents: idx === currentTestimonial ? 'auto' : 'none',
  });

  return (
    <div ref={containerRef} className="bg-surface font-body text-on-background selection:bg-secondary-container min-h-screen">

      {/* ── NAV ── */}
      <nav className="hero-nav fixed top-0 w-full z-50 bg-[#fcfaf8]/90 backdrop-blur-lg dark:bg-slate-950/90">
        <div className="flex justify-between items-center px-6 md:px-10 py-6 w-full max-w-screen-2xl mx-auto">
          <a className="text-2xl font-light tracking-[0.2em] uppercase text-[#1a1a1a] dark:text-white" href="#">Flor Aznar</a>
          <div className="hidden md:flex items-center gap-10">
            <a className="font-manrope tracking-tight text-sm font-bold border-b-2 border-[#1a1a1a] pb-1 text-[#1a1a1a]" href="#">Inicio</a>
            <a className="font-manrope tracking-tight text-sm font-medium text-slate-500 hover:text-[#1a1a1a] transition-colors" href="#rap">Método RAP</a>
            <a className="font-manrope tracking-tight text-sm font-medium text-slate-500 hover:text-[#1a1a1a] transition-colors" href="#book">Libro</a>
            <a className="font-manrope tracking-tight text-sm font-medium text-slate-500 hover:text-[#1a1a1a] transition-colors" href="#services">Servicios</a>
            <a className="font-manrope tracking-tight text-sm font-medium text-slate-500 hover:text-[#1a1a1a] transition-colors" href="#testimonials">Testimonios</a>
            <a className="font-manrope tracking-tight text-sm font-medium text-slate-500 hover:text-[#1a1a1a] transition-colors" href="#contact">Contacto</a>
          </div>
          <Link href="/login" className="hidden md:block">
            <button className="bg-primary text-on-primary rounded-full px-8 py-3 text-sm font-bold hover:opacity-80 transition-all duration-300">Ingresar al Sistema</button>
          </Link>
          <button className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Menú">
            <span className={`block w-6 h-0.5 bg-[#1a1a1a] transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-[#1a1a1a] transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-[#1a1a1a] transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </button>
        </div>
        <div className={`md:hidden transition-all duration-500 ease-in-out overflow-hidden ${isMobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="flex flex-col items-center gap-6 px-6 pb-8 pt-2">
            <a className="font-manrope text-sm font-bold text-[#1a1a1a]" href="#" onClick={() => setIsMobileMenuOpen(false)}>Inicio</a>
            <a className="font-manrope text-sm font-medium text-slate-500" href="#rap" onClick={() => setIsMobileMenuOpen(false)}>Método RAP</a>
            <a className="font-manrope text-sm font-medium text-slate-500" href="#book" onClick={() => setIsMobileMenuOpen(false)}>Libro</a>
            <a className="font-manrope text-sm font-medium text-slate-500" href="#services" onClick={() => setIsMobileMenuOpen(false)}>Servicios</a>
            <a className="font-manrope text-sm font-medium text-slate-500" href="#testimonials" onClick={() => setIsMobileMenuOpen(false)}>Testimonios</a>
            <a className="font-manrope text-sm font-medium text-slate-500" href="#contact" onClick={() => setIsMobileMenuOpen(false)}>Contacto</a>
            <Link href="/login" className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
              <button className="w-full bg-primary text-on-primary rounded-full px-8 py-3 text-sm font-bold hover:opacity-80 transition-all duration-300">Ingresar al Sistema</button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-20 lg:pt-24">

        {/* ── HERO ── */}
        <section className="hero-section relative min-h-screen md:h-screen md:min-h-[600px] flex items-center px-6 md:px-12 py-24 md:py-10 lg:py-0 overflow-hidden">
          <div className="absolute inset-0 ethereal-gradient opacity-60 -z-10"></div>
          <div className="hero-blob-1 absolute top-1/4 -right-20 w-96 h-96 bg-secondary rounded-full blur-[120px] opacity-40"></div>
          <div className="hero-blob-2 absolute bottom-1/4 -left-20 w-80 h-80 bg-surface-container-high rounded-full blur-[100px] opacity-50"></div>
          <div className="max-w-screen-2xl mx-auto w-full grid md:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="space-y-6">
              <div className="hero-badge inline-block px-4 py-1.5 rounded-full bg-[#9a3412]/5 backdrop-blur border border-[#9a3412]/25">
                <span className="text-[0.7rem] uppercase tracking-[0.4em] font-bold text-on-surface-variant">Evolución Consciente</span>
              </div>
              <h1 className="hero-title text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-light tracking-tight leading-[1.1]">
                Habita tu <span className="font-extrabold italic">máximo</span> potencial.
              </h1>
              <p className="hero-subtitle text-lg md:text-xl text-on-surface-variant max-w-lg font-light leading-relaxed">
                Un espacio de autoconocimiento y dirección personal para quienes buscan entenderse, desbloquearse y avanzar con claridad.
              </p>
              <div className="hero-buttons flex flex-col sm:flex-row gap-6 pt-4">
                <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hola Flor! Me gustaría saber más sobre el Método RAP y cómo podemos trabajar juntos.')}`} target="_blank" rel="noopener noreferrer" className="bg-primary text-on-primary rounded-full px-10 py-5 text-base font-bold flex items-center justify-center gap-3 hover:scale-[0.98] transition-transform">
                  Comenzar Ahora
                  <span className="material-symbols-outlined">arrow_forward</span>
                </a>
                <a href="#rap" className="bg-surface-bright/50 backdrop-blur rounded-full px-10 py-5 text-base font-medium border border-outline-variant hover:bg-surface-bright transition-all flex items-center justify-center">
                  Explorar Método
                </a>
              </div>
            </div>
            <div className="hero-image relative">
              <div className="aspect-[4/5] rounded-[3rem] overflow-hidden soft-shadow relative z-10 border-[12px] border-surface-bright/30">
                <img alt="Flor Aznar" className="w-full h-full object-cover object-top" src="/fotoflo.jpeg" />
              </div>
              <div className="hero-quote absolute -bottom-10 -left-10 bg-surface-bright p-8 rounded-xl soft-shadow z-20 max-w-[240px]">
                <p className="text-sm font-medium italic text-on-surface">&ldquo;El cambio no ocurre en la mente, ocurre en el ser.&rdquo;</p>
                <div className="mt-4 flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#9a3412]"></span>
                  <span className="w-2 h-2 rounded-full bg-surface-container-high"></span>
                  <span className="w-2 h-2 rounded-full bg-tertiary-container"></span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── EL PROBLEMA ── */}
        <section className="py-28 px-6 md:px-12 bg-surface" id="problema">
          <div className="max-w-screen-xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-start">
              <div className="space-y-6">
                <span className="text-[0.75rem] uppercase tracking-[0.4em] font-bold text-[#9a3412] mb-2 block">El problema</span>
                <h2 className="text-4xl md:text-5xl font-light leading-tight">Muchas veces el problema <span className="font-extrabold">no es la falta de capacidad.</span></h2>
                <p className="text-lg text-on-surface-variant font-light leading-relaxed">Es estar funcionando desde patrones mentales y emocionales que te hacen frenarte automáticamente cuando querés avanzar.</p>
                <p className="text-base text-on-surface-variant font-light leading-relaxed">Todos tenemos una manera de pensar, reaccionar y actuar. Y cuando no entendemos cómo funcionamos internamente, terminamos:</p>
                <ul className="space-y-3">
                  {['procrastinando', 'dudando constantemente de nosotros mismos', 'perdiendo claridad', 'dispersándonos', 'o repitiendo las mismas situaciones una y otra vez'].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-on-surface-variant">
                      <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant shrink-0"></span>{item}
                    </li>
                  ))}
                </ul>
                <div className="pt-4 border-l-4 border-[#9a3412]/50 pl-6">
                  <p className="text-lg font-medium text-on-surface">No se trata de hacer más.<br />Se trata de entender qué necesitás cambiar para empezar a avanzar de verdad.</p>
                </div>
              </div>
              <div className="bg-surface-dim/40 rounded-[3rem] p-10 space-y-6">
                <span className="text-[0.75rem] uppercase tracking-[0.4em] font-bold text-[#9a3412] block">¿Esto te pasa a vos?</span>
                <div className="space-y-4">
                  {[
                    { icon: 'psychology', bg: 'bg-secondary-container', color: 'text-on-secondary-container', text: 'Sobrepensás tanto las decisiones que terminás paralizándote.' },
                    { icon: 'trending_down', bg: 'bg-surface-container-high', color: 'text-primary', text: 'Empezás motivado/a, pero después te cuesta sostener.' },
                    { icon: 'hub', bg: 'bg-tertiary-container', color: 'text-on-tertiary-container', text: 'Tenés muchas ideas, pero te dispersás fácilmente.' },
                    { icon: 'loop', bg: 'bg-secondary-container', color: 'text-on-secondary-container', text: 'Sentís que repetís siempre los mismos patrones.' },
                    { icon: 'block', bg: 'bg-surface-container-high', color: 'text-primary', text: 'Probaste distintas formas de avanzar, pero seguís sintiéndote trabado/a.' },
                    { icon: 'trending_flat', bg: 'bg-tertiary-container', color: 'text-on-tertiary-container', text: 'Hacés mucho, pero sentís que no avanzás realmente.' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4 p-5 bg-surface-bright rounded-2xl soft-shadow">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${item.bg}`}>
                        <span className={`material-symbols-outlined text-sm ${item.color}`}>{item.icon}</span>
                      </div>
                      <p className="text-sm font-medium text-on-surface leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── ABOUT FLOR ── */}
        <section className="py-28 px-6 md:px-12 bg-surface" id="about-flor">
          <div className="max-w-screen-2xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="relative flex justify-center">
                <div className="aspect-[4/5] max-w-[400px] w-full rounded-[3rem] overflow-hidden soft-shadow border-[8px] border-surface-bright/30">
                  <img alt="Flor Aznar" className="w-full h-full object-cover object-top" src="/fotoflo.jpeg" />
                </div>
              </div>
              <div className="space-y-6">
                <span className="text-[0.75rem] uppercase tracking-[0.4em] font-bold text-[#9a3412] mb-2 block">¿Quién es Flor?</span>
                <h2 className="text-4xl md:text-5xl font-light leading-tight">Conocé a <span className="font-extrabold italic">Flor Aznar</span></h2>
                <div className="space-y-5 text-on-surface-variant text-base md:text-lg font-light leading-relaxed">
                  <p>Mi camino comenzó en el mundo del marketing. Soy Licenciada en Marketing y durante los años en los que ejercí mi profesión descubrí que lo que realmente me apasionaba era acompañar a las personas y ayudarlas a potenciarse para atravesar cualquier desafío.</p>
                  <p>Ese descubrimiento me llevó a adentrarme en el mundo del coaching. Me formé en EDPyN Barcelona (España), institución avalada por la ICF – Level 2, realicé un Máster en Recursos Humanos y actualmente continúo mi formación estudiando Counseling (Consultoría Psicológica).</p>
                  <p>A lo largo de este camino entendí algo fundamental: muchas veces las personas no avanzan en su vida no por falta de capacidad, sino porque no se conocen lo suficiente y terminan repitiendo patrones o creencias que las mantienen en el mismo lugar.</p>
                  <p className="font-medium text-on-surface italic">Hoy mi trabajo está enfocado en ayudar a las personas a conocerse más profundamente, comprender qué les está pasando y encontrar claridad para avanzar en su vida.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── MÉTODO RAP ── */}
        <section className="py-16 lg:py-24 xl:py-32 px-6 md:px-12 bg-surface" id="rap">
          <div className="max-w-screen-2xl mx-auto">
            <div className="rap-title flex flex-col md:flex-row justify-between items-end mb-12 lg:mb-24 gap-8">
              <div className="max-w-2xl">
                <span className="text-[0.75rem] uppercase tracking-[0.4em] font-bold text-[#9a3412] mb-6 block">El Mapa</span>
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-light">El Método RAP: <span className="font-extrabold text-on-surface">Una Evolución Radical</span></h2>
              </div>
              <p className="text-on-surface-variant max-w-sm pb-2">Un viaje estructurado desde la claridad interna hacia la manifestación externa, diseñado para líderes de alto impacto.</p>
            </div>
            <div className="rap-cards grid md:grid-cols-3 gap-12 relative">
              <div className="rap-card group relative pt-12">
                <div className="rap-letter absolute -top-6 left-0 text-[6rem] lg:text-[10rem] font-extrabold text-surface-dim opacity-30 select-none group-hover:text-secondary-container transition-colors duration-500">R</div>
                <div className="relative z-10 bg-surface-bright p-6 lg:p-10 rounded-[2rem] lg:rounded-xl soft-shadow h-full flex flex-col hover:-translate-y-2 transition-transform duration-500">
                  <div className="w-16 h-16 rounded-2xl bg-secondary-container flex items-center justify-center mb-8"><span className="material-symbols-outlined text-on-secondary-container text-3xl">visibility</span></div>
                  <h3 className="text-2xl font-bold mb-4">Reconocimiento</h3>
                  <p className="text-on-surface-variant leading-relaxed mb-8">Identifica las narrativas silenciosas y los techos de cristal invisibles que te alejan de tu frecuencia auténtica.</p>
                  <div className="mt-auto flex items-center gap-2 text-sm font-bold tracking-widest uppercase"><span>Fase 01</span><div className="h-px flex-grow bg-[#9a3412]/20"></div></div>
                </div>
              </div>
              <div className="rap-card group relative pt-24 md:pt-32">
                <div className="rap-letter absolute top-0 md:top-12 left-0 text-[6rem] lg:text-[10rem] font-extrabold text-surface-dim opacity-30 select-none group-hover:text-surface-container-high transition-colors duration-500">A</div>
                <div className="relative z-10 bg-surface-bright p-6 lg:p-10 rounded-[2rem] lg:rounded-xl soft-shadow h-full flex flex-col hover:-translate-y-2 transition-transform duration-500 border border-surface-container-high">
                  <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center mb-8"><span className="material-symbols-outlined text-primary text-3xl">bolt</span></div>
                  <h3 className="text-2xl font-bold mb-4">Acción</h3>
                  <p className="text-on-surface-variant leading-relaxed mb-8">Implementación estratégica de nuevos comportamientos. Traducimos la visión en hábitos de alto rendimiento.</p>
                  <div className="mt-auto flex items-center gap-2 text-sm font-bold tracking-widest uppercase"><span>Fase 02</span><div className="h-px flex-grow bg-[#9a3412]/20"></div></div>
                </div>
              </div>
              <div className="rap-card group relative pt-12 md:pt-4">
                <div className="rap-letter absolute -top-10 md:-top-16 left-0 text-[6rem] lg:text-[10rem] font-extrabold text-surface-dim opacity-30 select-none group-hover:text-tertiary-container transition-colors duration-500">P</div>
                <div className="relative z-10 bg-surface-bright p-6 lg:p-10 rounded-[2rem] lg:rounded-xl soft-shadow h-full flex flex-col hover:-translate-y-2 transition-transform duration-500">
                  <div className="w-16 h-16 rounded-2xl bg-tertiary-container flex items-center justify-center mb-8"><span className="material-symbols-outlined text-on-tertiary-container text-3xl">auto_awesome</span></div>
                  <h3 className="text-2xl font-bold mb-4">Potencial</h3>
                  <p className="text-on-surface-variant leading-relaxed mb-8">Encarnar tu versión más elevada. Crecimiento sostenible y la realización de tu visión en cada esfera de la vida.</p>
                  <div className="mt-auto flex items-center gap-2 text-sm font-bold tracking-widest uppercase"><span>Fase 03</span><div className="h-px flex-grow bg-[#9a3412]/20"></div></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CÓMO ES EL PROCESO ── */}
        <section className="py-20 px-6 md:px-12 bg-surface-dim/20" id="como-es">
          <div className="max-w-screen-xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="aspect-video rounded-[2.5rem] bg-[#1a1a1a] flex items-center justify-center soft-shadow relative overflow-hidden cursor-pointer group">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                <div className="relative z-10 w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-white text-5xl">play_arrow</span>
                </div>
                <div className="absolute bottom-8 left-8 right-8">
                  <p className="text-white/70 text-xs uppercase tracking-widest">Flor Aznar explica el proceso</p>
                </div>
              </div>
              <div className="space-y-6">
                <span className="text-[0.75rem] uppercase tracking-[0.4em] font-bold text-[#9a3412] block">¿Cómo es el proceso?</span>
                <p className="text-2xl font-light text-on-surface-variant leading-relaxed">Un proceso de <span className="font-semibold text-on-surface">tres etapas</span> diseñado para ayudarte a entender qué te frena y empezar a avanzar de verdad.</p>
                <p className="text-base text-on-surface-variant font-light leading-relaxed">No es un curso ni una lista de consejos. Es un acompañamiento personalizado donde trabajás directamente con lo que está pasando en tu vida hoy.</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center shrink-0"><span className="material-symbols-outlined text-on-secondary-container">calendar_month</span></div>
                  <div><p className="font-bold text-on-surface text-sm">30 días de proceso</p><p className="text-on-surface-variant text-sm font-light">Con acompañamiento personalizado en cada etapa</p></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center shrink-0"><span className="material-symbols-outlined text-primary">person</span></div>
                  <div><p className="font-bold text-on-surface text-sm">100% personalizado</p><p className="text-on-surface-variant text-sm font-light">Adaptado a lo que hoy te está pasando a vos</p></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── QUÉ INCLUYE ── */}
        <section className="py-32 px-6 md:px-12 bg-surface" id="incluye">
          <div className="max-w-screen-2xl mx-auto">
            <div className="text-center mb-20">
              <span className="text-[0.75rem] uppercase tracking-[0.4em] font-bold text-[#9a3412] mb-4 block">Lo que recibís</span>
              <h2 className="text-4xl md:text-5xl font-light">Qué <span className="font-extrabold italic">incluye</span> el proceso</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Card 1 */}
              <div className="p-8 rounded-[2rem] flex flex-col gap-5 hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden" style={{background:'#fff',boxShadow:'0 2px 24px rgba(185,83,26,0.06)'}}>
                <div className="absolute w-32 h-32 rounded-full pointer-events-none" style={{background:'radial-gradient(circle, rgba(185,83,26,0.10) 0%, transparent 70%)',top:0,right:0,transform:'translate(30%,-30%)'}}></div>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center relative z-10" style={{background:'#fdeee8'}}><span className="material-symbols-outlined text-2xl" style={{color:'#9a3412'}}>chat</span></div>
                <div className="relative z-10"><h3 className="text-xl font-bold mb-2">3 sesiones 1:1 personalizadas</h3><p className="text-on-surface-variant text-sm font-light leading-relaxed">Cada sesión está enfocada en una etapa específica del proceso y adaptada a lo que hoy te está pasando.</p></div>
              </div>
              {/* Card 2 */}
              <div className="p-8 rounded-[2rem] flex flex-col gap-5 hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden" style={{background:'#fff',boxShadow:'0 2px 24px rgba(185,83,26,0.06)'}}>
                <div className="absolute w-36 h-36 rounded-full pointer-events-none" style={{background:'radial-gradient(circle, rgba(185,83,26,0.09) 0%, transparent 70%)',bottom:0,left:0,transform:'translate(-30%,30%)'}}></div>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center relative z-10" style={{background:'#fdeee8'}}><span className="material-symbols-outlined text-2xl" style={{color:'#9a3412'}}>edit_note</span></div>
                <div className="relative z-10"><h3 className="text-xl font-bold mb-2">Ejercicios entre sesiones</h3><p className="text-on-surface-variant text-sm font-light leading-relaxed">Después de cada encuentro recibís ejercicios concretos para integrar lo trabajado. Porque el cambio pasa en lo que hacés después.</p></div>
              </div>
              {/* Card 3 */}
              <div className="p-8 rounded-[2rem] flex flex-col gap-5 hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden" style={{background:'#fff',boxShadow:'0 2px 24px rgba(185,83,26,0.06)'}}>
                <div className="absolute w-32 h-32 rounded-full pointer-events-none" style={{background:'radial-gradient(circle, rgba(185,83,26,0.09) 0%, transparent 70%)',top:0,left:0,transform:'translate(-30%,-30%)'}}></div>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center relative z-10" style={{background:'#fdeee8'}}><span className="material-symbols-outlined text-2xl" style={{color:'#9a3412'}}>support_agent</span></div>
                <div className="relative z-10"><h3 className="text-xl font-bold mb-2">Acompañamiento directo</h3><p className="text-on-surface-variant text-sm font-light leading-relaxed">Canal de consultas personalizado de lunes a viernes de 9 a 17hs. Si algo surge o necesitás orientación, estoy disponible.</p></div>
              </div>
              {/* Card 4 */}
              <div className="p-8 rounded-[2rem] flex flex-col gap-5 hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden" style={{background:'#fff',boxShadow:'0 2px 24px rgba(185,83,26,0.06)'}}>
                <div className="absolute w-36 h-36 rounded-full pointer-events-none" style={{background:'radial-gradient(circle, rgba(185,83,26,0.09) 0%, transparent 70%)',bottom:0,right:0,transform:'translate(30%,30%)'}}></div>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center relative z-10" style={{background:'#fdeee8'}}><span className="material-symbols-outlined text-2xl" style={{color:'#9a3412'}}>analytics</span></div>
                <div className="relative z-10"><h3 className="text-xl font-bold mb-2">Guía práctica con acciones concretas</h3><p className="text-on-surface-variant text-sm font-light leading-relaxed">Al finalizar recibís un análisis personalizado con anclajes para reconocer tus patrones y actuar diferente cuando aparezcan.</p></div>
              </div>
              {/* Card 5 */}
              <div className="p-8 rounded-[2rem] flex flex-col gap-5 hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden" style={{background:'#fff',boxShadow:'0 2px 24px rgba(185,83,26,0.06)'}}>
                <div className="absolute w-32 h-32 rounded-full pointer-events-none" style={{background:'radial-gradient(circle, rgba(185,83,26,0.09) 0%, transparent 70%)',top:0,right:0,transform:'translate(30%,-30%)'}}></div>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center relative z-10" style={{background:'#fdeee8'}}><span className="material-symbols-outlined text-2xl" style={{color:'#9a3412'}}>menu_book</span></div>
                <div className="relative z-10"><h3 className="text-xl font-bold mb-2">Libro de acompañamiento</h3><p className="text-on-surface-variant text-sm font-light leading-relaxed">Un recurso con herramientas y ejercicios para que puedas seguir integrando el proceso de manera autónoma.</p></div>
              </div>
              {/* Card 6 */}
              <div className="p-8 rounded-[2rem] flex flex-col gap-5 hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden" style={{background:'#fff',boxShadow:'0 2px 24px rgba(185,83,26,0.06)'}}>
                <div className="absolute w-36 h-36 rounded-full pointer-events-none" style={{background:'radial-gradient(circle, rgba(185,83,26,0.09) 0%, transparent 70%)',bottom:0,left:0,transform:'translate(-30%,30%)'}}></div>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center relative z-10" style={{background:'#fdeee8'}}><span className="material-symbols-outlined text-2xl" style={{color:'#9a3412'}}>manage_search</span></div>
                <div className="relative z-10"><h3 className="text-xl font-bold mb-2">Análisis previo a la primera sesión</h3><p className="text-on-surface-variant text-sm font-light leading-relaxed">Antes de arrancar hacemos un análisis inicial para que la primera sesión arranque con foco y sin tiempo perdido.</p></div>
                <div className="mt-auto pt-2 relative z-10"><span className="text-[0.65rem] uppercase tracking-widest font-bold" style={{color:'#9a3412'}}>Incluido sin costo adicional</span></div>
              </div>
            </div>
          </div>
        </section>

        {/* ── LIBRO ── */}
        <section className="book-section py-16 lg:py-24 xl:py-32 px-6 md:px-12 bg-surface overflow-hidden" id="book">
          <div className="max-w-screen-2xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center">
              <div className="book-text order-2 md:order-1 space-y-6">
                <span className="text-[0.75rem] uppercase tracking-[0.4em] font-bold text-[#7c2d12] mb-4 block">Publicación Reciente</span>
                <h2 className="text-3xl md:text-5xl lg:text-7xl font-light leading-tight">Volver al <span className="font-extrabold italic">Origen</span></h2>
                <p className="text-lg md:text-xl text-on-surface-variant max-w-lg font-light leading-relaxed">
                  Una guía práctica de autoconocimiento y transformación personal. Un libro para quienes quieren entenderse mejor, desbloquearse y empezar a construir una vida más alineada con quienes realmente son.
                </p>
                <div className="pt-6 flex flex-col sm:flex-row gap-4">
                  {/* Dropdown comprar */}
                  <div className="relative">
                    <button onClick={() => setIsBookDropdownOpen(!isBookDropdownOpen)} className="bg-primary text-on-primary rounded-full px-12 py-5 text-base font-bold hover:opacity-90 transition-all soft-shadow flex items-center gap-2">
                      Adquirir el libro
                      <span className={`material-symbols-outlined text-lg transition-transform duration-300 ${isBookDropdownOpen ? 'rotate-180' : ''}`}>expand_more</span>
                    </button>
                    {isBookDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsBookDropdownOpen(false)} />
                        <div className="absolute top-full left-0 mt-3 bg-white rounded-2xl soft-shadow border border-slate-100 overflow-hidden z-50 min-w-[260px]">
                          {purchaseThank ? (
                            <div className="flex flex-col items-center justify-center py-8 px-6 gap-3">
                              <span className="material-symbols-outlined text-4xl text-green-500 animate-bounce">shopping_cart_checkout</span>
                              <span className="text-sm font-bold text-[#1a1a1a]">¡Gracias por tu compra!</span>
                              <span className="text-xs text-slate-400">Redirigiendo...</span>
                            </div>
                          ) : (
                            <>
                              <button onClick={() => handlePurchaseClick('https://florenciaaznar.mitiendanube.com/productos/volver-al-origen/')} className="flex items-center gap-3 px-5 py-4 hover:bg-slate-50 transition-colors border-b border-slate-100 w-full text-left">
                                <img src="/logo-tiendanube.png" alt="Tienda Nube" className="w-7 h-7 flex-shrink-0 object-contain" />
                                <div><div className="text-sm font-bold text-[#1a1a1a]">Mi Tienda Nube</div><div className="text-xs text-slate-400">florenciaaznar.mitiendanube.com</div></div>
                              </button>
                              <button onClick={() => handlePurchaseClick('https://articulo.mercadolibre.com.ar/MLA-1739085787-volver-al-origen-_JM')} className="flex items-center gap-3 px-5 py-4 hover:bg-slate-50 transition-colors w-full text-left">
                                <img src="/logo-mercadolibre.png" alt="Mercado Libre" className="w-7 h-7 flex-shrink-0 object-contain" />
                                <div><div className="text-sm font-bold text-[#1a1a1a]">Mercado Libre</div><div className="text-xs text-slate-400">mercadolibre.com.ar</div></div>
                              </button>
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  {/* Pegar un vistazo */}
                  <Link href="/leer" className="border-2 border-primary text-primary rounded-full px-10 py-5 text-base font-bold hover:bg-primary/10 transition-all text-center">
                    Pegar un vistazo
                  </Link>
                </div>
              </div>

              {/* 3D Book */}
              <div className="book-mockup order-1 md:order-2 relative flex justify-center items-center">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full blur-[100px] -z-10 rounded-full" style={{background:'rgba(13,80,80,0.18)'}}></div>
                <div style={{perspective:'1400px',display:'flex',justifyContent:'center',padding:'20px 90px 60px 20px'}}>
                  <div
                    style={{
                      transform: bookHovered ? 'rotateY(-6deg)' : 'rotateY(-20deg)',
                      transformStyle: 'preserve-3d',
                      transition: 'transform 0.7s cubic-bezier(0.25,0.46,0.45,0.94)',
                      position: 'relative',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={() => setBookHovered(true)}
                    onMouseLeave={() => setBookHovered(false)}
                  >
                    <img src="/librofoto2.jpg" alt="Volver al Origen - Florencia Aznar"
                      style={{width:'310px',display:'block',borderRadius:'0 4px 4px 0',boxShadow:'18px 18px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,0,0,0.08)'}}
                    />
                    <div style={{position:'absolute',left:0,top:0,width:'100%',height:'100%',background:'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 50%, rgba(0,0,0,0.06) 100%)',borderRadius:'0 4px 4px 0',pointerEvents:'none'}} />
                    <div style={{position:'absolute',left:0,top:0,width:'38px',height:'100%',background:'linear-gradient(to right, #031818, #083535, #0c5050, #0e5a5a, #0c5050, #083535, #031818)',transform:'rotateY(90deg)',transformOrigin:'0% 50%',borderRadius:'4px 0 0 4px',boxShadow:'inset -2px 0 6px rgba(0,0,0,0.4)'}} />
                    <div style={{position:'absolute',right:'-8px',top:'1px',width:'8px',height:'calc(100% - 2px)',background:'repeating-linear-gradient(to bottom, #f2ece0, #f2ece0 1.5px, #ddd5c5 1.5px, #ddd5c5 3px)',borderRadius:'0 3px 3px 0',boxShadow:'2px 0 4px rgba(0,0,0,0.12)'}} />
                    <div style={{position:'absolute',bottom:'-35px',left:0,right:'-25%',height:'35px',background:'radial-gradient(ellipse at 38% 30%, rgba(0,0,0,0.32) 0%, transparent 65%)',filter:'blur(8px)'}} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SERVICIOS ── */}
        <section className="py-16 lg:py-24 xl:py-32 px-6 md:px-12 bg-surface-dim/30" id="services">
          <div className="max-w-screen-2xl mx-auto">
            <div className="services-title text-center mb-12 lg:mb-24">
              <span className="text-[0.75rem] uppercase tracking-[0.4em] font-bold text-[#9a3412] mb-4 block">Caminos</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-light">Nuestros <span className="font-extrabold italic">Servicios</span></h2>
            </div>
            <div className="services-grid grid md:grid-cols-12 gap-8">
              <div className="service-card md:col-span-7 bg-surface-bright rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row soft-shadow group relative">
                <div className="md:w-1/2 overflow-hidden">
                  <img alt="office interior" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCECIt-1Q_bK-afDeiw3emAlG-Y98qsYBHNSpy2dlGwWmZtgy0-PBmTKRSOXZBsPss6r18q4tUytlSoj_A6y1nxGfCICfgJ8mr24mMm5037vgTpXPtrMpcJB-FIkkWF4-gxmSTvf8aNQ0Cgb7Ss9taOVIfOpGuosUE1Y3EieSRgFtGiXh8oSjMsRUGzdN5lRiecgFsmqRJ7qSfU8qyM-TtSzzmSsYhsFf4yXnETqp0z9XfPLU17zW-LBtoWHSboVliaPyzMIFTl0fI" />
                </div>
                <div className="md:w-1/2 p-8 lg:p-12 flex flex-col">
                  <h3 className="text-2xl lg:text-3xl font-bold leading-tight mb-4 transition-all duration-500">{servicios[currentService].title}</h3>
                  <p className="text-on-surface-variant mb-6 font-light transition-all duration-500">{servicios[currentService].description}</p>
                  <ul className="space-y-3 mb-6">
                    {servicios[currentService].features.map((f, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm font-medium">
                        <span className="material-symbols-outlined text-on-secondary-container text-lg">check_circle</span>{f}
                      </li>
                    ))}
                  </ul>
                  {servicios[currentService].extra && <p className="text-sm font-medium text-on-secondary-container mb-6 italic">{servicios[currentService].extra}</p>}
                  <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(servicios[currentService].whatsappMsg)}`} target="_blank" rel="noopener noreferrer" className="mt-auto border-b border-[#9a3412] text-[#9a3412] w-fit pb-1 font-bold tracking-wider uppercase text-xs hover:opacity-70 transition-opacity">
                    Consultar Disponibilidad
                  </a>
                  <div className="flex items-center gap-3 mt-6">
                    <button onClick={prevService} className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-100 transition-colors" aria-label="Anterior">
                      <span className="material-symbols-outlined text-base">chevron_left</span>
                    </button>
                    {servicios.map((_, i) => (
                      <button key={i} onClick={() => setCurrentService(i)} className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === currentService ? 'bg-primary scale-125' : 'bg-slate-300 hover:bg-slate-400'}`} aria-label={`Servicio ${i + 1}`} />
                    ))}
                    <button onClick={nextService} className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-100 transition-colors" aria-label="Siguiente">
                      <span className="material-symbols-outlined text-base">chevron_right</span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="service-card md:col-span-5 bg-surface-container-high/40 backdrop-blur rounded-[2.5rem] p-8 lg:p-12 flex flex-col justify-between soft-shadow border border-white/50">
                <div>
                  <div className="w-14 h-14 rounded-full bg-surface-bright flex items-center justify-center mb-8 soft-shadow"><span className="material-symbols-outlined">groups</span></div>
                  <h3 className="text-3xl font-bold mb-4">Talleres Presenciales</h3>
                  <p className="text-on-surface-variant font-light mb-6">Experiencias grupales diseñadas para facilitar avances colectivos y aprendizaje entre pares.</p>
                </div>
                <div className="bg-surface-bright/80 p-6 rounded-2xl">
                  <div className="text-[0.65rem] uppercase tracking-[0.2em] font-bold text-on-surface-variant mb-2">Último Taller</div>
                  <div className="text-lg font-bold leading-snug">Workshop de Objetivos</div>
                  <div className="text-sm text-on-surface-variant mt-1 italic">Un método práctico para dejar de postergar(te)</div>
                  <div className="text-sm text-on-surface-variant mt-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">calendar_month</span> 28 de Marzo · Olga&apos;s Deli
                  </div>
                </div>
                <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hola! Me interesa consultar por los próximos talleres. ¿Podrías darme más información?')}`} target="_blank" rel="noopener noreferrer" className="mt-8 bg-primary text-on-primary rounded-full py-4 px-8 font-bold text-sm w-full hover:opacity-90 text-center block">
                  Consultar por Próximos Talleres
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── TESTIMONIOS ── */}
        <section
          className="testimonials-section py-16 lg:py-24 xl:py-32 px-6 md:px-12 bg-surface"
          id="testimonials"
          onMouseEnter={() => setTestimonialPaused(true)}
          onMouseLeave={() => setTestimonialPaused(false)}
        >
          <div className="max-w-screen-2xl mx-auto grid md:grid-cols-2 gap-10 lg:gap-20 items-center">

            {/* Izquierda: fotos + stat card */}
            <div className="testimonial-images relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-square rounded-2xl mt-12 overflow-hidden">
                  <img src="/marfoto.jpg" alt="Testimonio" className="w-full h-full object-cover object-top" />
                </div>
                <div className="aspect-square rounded-2xl overflow-hidden">
                  <img src="/fotoflores.jpg" alt="Testimonio" className="w-full h-full object-cover object-top" />
                </div>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface-bright p-12 rounded-[3rem] soft-shadow text-center min-w-[280px]">
                <div className="text-7xl font-extrabold tracking-tighter text-on-surface">150+</div>
                <div className="text-[0.75rem] uppercase tracking-[0.4em] font-bold text-[#9a3412] mt-4">Historias transformadas</div>
              </div>
            </div>

            {/* Derecha: carrusel */}
            <div className="testimonial-quote space-y-8">
              <div className="relative" style={{minHeight:'320px'}}>

                {/* Item 1 - Elena Rodríguez */}
                <div style={tItemStyle(0)}>
                  <div className="space-y-6">
                    <span className="material-symbols-outlined text-secondary-container" style={{fontSize:'3.5rem'}}>format_quote</span>
                    <h2 className="text-xl md:text-2xl font-light leading-relaxed text-on-surface">
                      &ldquo;Trabajar con Flor fue el catalizador que no sabía que necesitaba. El <strong>Método RAP</strong> me dio una estructura para entender mi propia ambición sin perder mi esencia.&rdquo;
                    </h2>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center overflow-hidden"><span className="material-symbols-outlined text-on-secondary-container">person</span></div>
                      <div><p className="font-bold text-sm uppercase tracking-wider">Elena Rodríguez</p><p className="text-xs text-on-surface-variant">CEO &amp; Directora Creativa</p></div>
                    </div>
                  </div>
                </div>

                {/* Item 2 - Video */}
                <div style={tItemStyle(1)}>
                  <div className="bg-[#1a1a1a] rounded-[2rem] overflow-hidden flex flex-col" style={{height:'100%',minHeight:'300px',background:'linear-gradient(160deg,#111 0%,#222 100%)'}}>
                    <div className="flex-grow flex items-center justify-center relative">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{background:'rgba(255,255,255,0.12)'}}>
                        <span className="material-symbols-outlined text-white" style={{fontSize:'2.5rem'}}>play_arrow</span>
                      </div>
                      <div className="absolute top-5 left-5 flex items-center gap-2 rounded-full px-3 py-1" style={{background:'rgba(255,255,255,0.1)'}}>
                        <span className="w-2 h-2 rounded-full" style={{background:'#f87171'}}></span>
                        <span className="text-white text-xs font-semibold tracking-widest">VIDEO</span>
                      </div>
                    </div>
                    <div className="p-6 border-t" style={{borderColor:'rgba(255,255,255,0.08)'}}>
                      <p className="font-bold text-white text-sm">Nombre Apellido</p>
                      <p className="text-xs mt-1" style={{color:'rgba(255,255,255,0.4)'}}>Descripción breve</p>
                    </div>
                  </div>
                </div>

                {/* Item 3 - Video */}
                <div style={tItemStyle(2)}>
                  <div className="bg-[#1a1a1a] rounded-[2rem] overflow-hidden flex flex-col" style={{height:'100%',minHeight:'300px',background:'linear-gradient(160deg,#111 0%,#222 100%)'}}>
                    <div className="flex-grow flex items-center justify-center relative">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{background:'rgba(255,255,255,0.12)'}}>
                        <span className="material-symbols-outlined text-white" style={{fontSize:'2.5rem'}}>play_arrow</span>
                      </div>
                      <div className="absolute top-5 left-5 flex items-center gap-2 rounded-full px-3 py-1" style={{background:'rgba(255,255,255,0.1)'}}>
                        <span className="w-2 h-2 rounded-full" style={{background:'#f87171'}}></span>
                        <span className="text-white text-xs font-semibold tracking-widest">VIDEO</span>
                      </div>
                    </div>
                    <div className="p-6 border-t" style={{borderColor:'rgba(255,255,255,0.08)'}}>
                      <p className="font-bold text-white text-sm">Nombre Apellido</p>
                      <p className="text-xs mt-1" style={{color:'rgba(255,255,255,0.4)'}}>Descripción breve</p>
                    </div>
                  </div>
                </div>

                {/* Item 4 - Texto */}
                <div style={tItemStyle(3)}>
                  <div className="space-y-8">
                    <span className="material-symbols-outlined text-secondary-container" style={{fontSize:'3.5rem'}}>format_quote</span>
                    <h2 className="text-xl md:text-2xl font-light leading-relaxed text-on-surface">&ldquo;[Testimonio escrito — agregá el texto real de esta persona]&rdquo;</h2>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center"><span className="material-symbols-outlined text-primary">person</span></div>
                      <div><p className="font-bold text-sm uppercase tracking-wider">Nombre Apellido</p><p className="text-xs text-on-surface-variant">Descripción breve</p></div>
                    </div>
                  </div>
                </div>

                {/* Item 5 - Texto */}
                <div style={tItemStyle(4)}>
                  <div className="space-y-8">
                    <span className="material-symbols-outlined text-secondary-container" style={{fontSize:'3.5rem'}}>format_quote</span>
                    <h2 className="text-xl md:text-2xl font-light leading-relaxed text-on-surface">&ldquo;[Testimonio escrito — agregá el texto real de esta persona]&rdquo;</h2>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-tertiary-container flex items-center justify-center"><span className="material-symbols-outlined text-on-tertiary-container">person</span></div>
                      <div><p className="font-bold text-sm uppercase tracking-wider">Nombre Apellido</p><p className="text-xs text-on-surface-variant">Descripción breve</p></div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Dots + flechas */}
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-3">
                  {Array.from({length: TOTAL_TESTIMONIALS}).map((_, i) => (
                    <button key={i} onClick={() => setCurrentTestimonial(i)} style={{height:'10px',width: i === currentTestimonial ? '2rem' : '10px',borderRadius:'999px',border:'none',padding:0,cursor:'pointer',transition:'all 0.4s ease',background: i === currentTestimonial ? '#1a1a1a' : '#e2e8f0'}} aria-label={`Testimonio ${i+1}`} />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={prevTestimonial} aria-label="Anterior" style={{width:'44px',height:'44px',borderRadius:'50%',border:'1.5px solid #e2e8f0',background:'#fff',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 1px 4px rgba(0,0,0,0.07)'}}>
                    <span className="material-symbols-outlined" style={{fontSize:'1.3rem',color:'#1a1a1a'}}>arrow_back</span>
                  </button>
                  <button onClick={nextTestimonial} aria-label="Siguiente" style={{width:'44px',height:'44px',borderRadius:'50%',border:'1.5px solid #e2e8f0',background:'#1a1a1a',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 1px 4px rgba(0,0,0,0.12)'}}>
                    <span className="material-symbols-outlined" style={{fontSize:'1.3rem',color:'#fff'}}>arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ── GARANTÍA ── */}
        <section className="py-24 px-6 md:px-12 bg-surface" id="garantia">
          <div className="max-w-screen-lg mx-auto">
            <div className="bg-surface-bright rounded-[3rem] p-12 md:p-16 soft-shadow relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-secondary-container/30 rounded-full blur-[80px]"></div>
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row items-start gap-8 mb-8">
                  <div className="w-20 h-20 rounded-[1.5rem] bg-secondary-container flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-on-secondary-container text-4xl">verified_user</span>
                  </div>
                  <div>
                    <span className="text-[0.75rem] uppercase tracking-[0.4em] font-bold text-[#9a3412] mb-2 block">Garantía</span>
                    <h2 className="text-3xl md:text-4xl font-light leading-tight">Tu inversión <span className="font-extrabold italic">está protegida.</span></h2>
                  </div>
                </div>
                <div className="space-y-5 text-on-surface-variant text-base md:text-lg font-light leading-relaxed max-w-2xl">
                  <p>Si al terminar el proceso sentís que seguís exactamente en el mismo punto y no lograste identificar con claridad qué patrones te estaban frenando, vas a tener <span className="font-semibold text-on-surface">15 días extra de acompañamiento sin costo adicional.</span></p>
                  <p className="font-medium text-on-surface italic">Porque si vos estás dispuesto/a a hacer el proceso, yo también estoy dispuesta a acompañarte hasta que algo real cambie.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── PRECIO ── */}
        <section className="py-24 px-6 md:px-12" id="precio" style={{background:'linear-gradient(160deg, #fde8dc 0%, #fdf8f3 50%, #e8f4f1 100%)'}}>
          <div className="max-w-screen-md mx-auto">
            <div className="text-center mb-12">
              <span className="text-[0.75rem] uppercase tracking-[0.4em] font-bold text-[#9a3412] mb-4 block">Inversión</span>
              <h2 className="text-4xl md:text-5xl font-light">Tu <span className="font-extrabold italic">inversión</span></h2>
            </div>
            <div className="rounded-[3rem] p-10 md:p-14 soft-shadow relative overflow-hidden" style={{background:'linear-gradient(135deg, #ffffff 0%, #fdf3ef 60%, #edf7f5 100%)'}}>
              <div className="absolute top-0 right-0 w-72 h-72 rounded-full blur-[90px] pointer-events-none" style={{background:'radial-gradient(circle, #fdddd2 0%, transparent 70%)',opacity:0.7}}></div>
              <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full blur-[70px] pointer-events-none" style={{background:'radial-gradient(circle, #b8e0d8 0%, transparent 70%)',opacity:0.6}}></div>
              <div className="relative z-10">
                <div className="text-center space-y-3 pb-10 border-b border-outline-variant">
                  <p className="text-sm uppercase tracking-widest text-on-surface-variant font-bold">Método R.A.P. completo</p>
                  <p className="text-on-surface-variant text-sm font-light">Consultá sobre planes de pago</p>
                </div>
                <ul className="flex flex-col gap-5 py-10">
                  {[
                    { title: '3 sesiones 1:1 personalizadas', desc: 'Encuentros individuales diseñados en función de tu proceso, tu ritmo y lo que necesitás trabajar.' },
                    { title: 'Ejercicios entre sesiones', desc: 'Después de cada encuentro recibís ejercicios concretos para integrar lo trabajado. Porque el cambio no pasa solo en la sesión, pasa en lo que hacés después.' },
                    { title: 'Acompañamiento directo entre sesiones', desc: 'Tenés un canal de consultas personalizado de lunes a viernes de 9 a 17hs. Si algo surge, si tenés una duda o necesitás orientación en el proceso, estoy disponible.' },
                    { title: 'Guía práctica con acciones concretas', desc: 'Al finalizar el proceso recibís un análisis personalizado con anclajes para reconocer tus patrones en el futuro y actuar diferente cuando aparezcan.' },
                    { title: 'Libro de acompañamiento', desc: 'Un recurso con herramientas y ejercicios para que puedas seguir integrando el proceso de manera autónoma, sin depender de un acompañamiento constante.' },
                    { title: 'Análisis previo a la primera sesión', desc: 'Antes de arrancar hacemos un análisis inicial para que la primera sesión arranque con foco y sin tiempo perdido.' },
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <span className="material-symbols-outlined text-on-secondary-container shrink-0 mt-0.5" style={{fontSize:'1.3rem'}}>check_circle</span>
                      <div>
                        <p className="font-semibold text-sm text-on-surface">{item.title}</p>
                        <p className="text-xs text-on-surface-variant font-light mt-0.5 leading-relaxed">{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="space-y-4">
                  <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hola! Me interesa reservar mi lugar en el Método RAP. ¿Podrías darme más información?')}`} target="_blank" rel="noopener noreferrer" className="w-full bg-primary text-on-primary rounded-full py-5 text-base font-bold hover:opacity-90 transition-all text-center block">
                    Reservar mi lugar
                  </a>
                  <p className="text-center text-xs text-on-surface-variant font-light">Garantía de 15 días adicionales incluida</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="px-6 md:px-12 py-16 lg:py-24 xl:py-32" id="contact">
          <div className="max-w-screen-2xl mx-auto">
            <div className="cta-section relative bg-primary text-on-primary rounded-[2rem] lg:rounded-[4rem] p-8 md:p-16 lg:p-24 overflow-hidden text-center">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary-container opacity-10 rounded-full blur-[100px]"></div>
              <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-surface-container-high opacity-10 rounded-full blur-[80px]"></div>
              <div className="relative z-10 max-w-3xl mx-auto space-y-12">
                <h2 className="text-3xl md:text-5xl lg:text-7xl font-light tracking-tight">¿Iniciamos la <span className="italic font-extrabold">conversación?</span></h2>
                <p className="text-on-primary/60 text-lg md:text-xl font-light">Toda evolución comienza con una sola pregunta. Contáctame para explorar cómo podemos trabajar juntos.</p>
                <div className="flex flex-col sm:flex-row justify-center gap-6">
                  <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hola! Me gustaría agendar una llamada de introducción contigo. ¿Cuándo tenés disponibilidad?')}`} target="_blank" rel="noopener noreferrer" className="bg-surface-bright text-primary rounded-full px-12 py-6 text-lg font-bold hover:scale-105 transition-transform flex items-center justify-center gap-3">
                    Agendar llamada de introducción
                    <span className="material-symbols-outlined">call</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <footer className="landing-footer w-full rounded-t-[2.5rem] mt-12 lg:mt-20 bg-[#ffffff] dark:bg-slate-900 shadow-[0_-10px_30px_-10px_rgba(0,0,0,0.08)]">
        <div className="flex flex-col md:flex-row justify-between items-center px-12 py-16 w-full gap-8 max-w-screen-2xl mx-auto">
          <div className="space-y-0 text-center md:text-left">
            <div className="text-lg font-black tracking-tight text-[#1a1a1a] dark:text-white">Flor Aznar</div>
            <div className="font-manrope text-[0.75rem] uppercase tracking-[0.4em] leading-relaxed text-[#1a1a1a] dark:text-slate-100">© 2026 Flor Aznar.</div>
            <div className="select-none -mt-2">
              <a href="https://codeadesarrollos.com" target="_blank" rel="noopener noreferrer" className="font-black text-[4rem] sm:text-[6rem] md:text-[8rem] uppercase tracking-[-0.04em] text-[#1a1a1a]/[0.04] leading-none hover:text-[#1a1a1a]/[0.15] transition-all duration-500">CODEA</a>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            <a className="font-manrope text-[0.75rem] uppercase tracking-[0.4em] leading-relaxed text-slate-400 hover:text-[#1a1a1a] hover:tracking-[0.5em] transition-all duration-500" href="https://www.instagram.com/metodo_rap?igsh=MTlxejF1cGRieTc0bQ%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a className="font-manrope text-[0.75rem] uppercase tracking-[0.4em] leading-relaxed text-slate-400 hover:text-[#1a1a1a] hover:tracking-[0.5em] transition-all duration-500" href="https://www.tiktok.com/@florenciaznar?_r=1&_t=ZS-95W9Hi2kJO4" target="_blank" rel="noopener noreferrer">TikTok</a>
          </div>
        </div>
      </footer>

    </div>
  );
}

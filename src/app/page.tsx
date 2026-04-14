'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const WHATSAPP_NUMBER = '5491130704788';

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

  const handlePurchaseClick = (url: string) => {
    setPurchaseThank(true);
    setTimeout(() => {
      window.open(url, '_blank', 'noopener,noreferrer');
    }, 600);
    setTimeout(() => {
      setPurchaseThank(false);
      setIsBookDropdownOpen(false);
    }, 2200);
  };

  const nextService = useCallback(() => {
    setCurrentService((prev) => (prev + 1) % servicios.length);
  }, []);

  const prevService = useCallback(() => {
    setCurrentService((prev) => (prev - 1 + servicios.length) % servicios.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(nextService, 5000);
    return () => clearInterval(interval);
  }, [nextService]);

  useGSAP(() => {
    // Set initial hidden state for hero elements to prevent flash
    gsap.set(['.hero-nav', '.hero-badge', '.hero-title', '.hero-subtitle', '.hero-buttons', '.hero-image', '.hero-quote'], { opacity: 0 });

    // Nav bar - slide down
    gsap.fromTo('.hero-nav', 
      { y: -40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, delay: 0.1, ease: 'power3.out' }
    );

    // Hero badge - scale in
    gsap.fromTo('.hero-badge',
      { y: 30, opacity: 0, scale: 0.9 },
      { y: 0, opacity: 1, scale: 1, duration: 0.7, delay: 0.3, ease: 'back.out(1.5)' }
    );

    // Hero title - sweep up
    gsap.fromTo('.hero-title',
      { y: 80, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, delay: 0.5, ease: 'power3.out' }
    );

    // Hero subtitle  
    gsap.fromTo('.hero-subtitle',
      { y: 60, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, delay: 0.7, ease: 'power3.out' }
    );

    // Hero buttons
    gsap.fromTo('.hero-buttons',
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, delay: 0.9, ease: 'power3.out' }
    );

    // Hero image - slide from right
    gsap.fromTo('.hero-image',
      { x: 100, opacity: 0, scale: 0.95 },
      { x: 0, opacity: 1, scale: 1, duration: 1.3, delay: 0.4, ease: 'power3.out' }
    );

    // Hero floating quote
    gsap.fromTo('.hero-quote',
      { y: 50, opacity: 0, scale: 0.9 },
      { y: 0, opacity: 1, scale: 1, duration: 1, delay: 1.1, ease: 'power3.out' }
    );

    // RAP Method section title
    gsap.from('.rap-title', {
      y: 60, opacity: 0, duration: 0.8, ease: 'power2.out',
      scrollTrigger: { trigger: '.rap-title', start: 'top 85%', toggleActions: 'play none none reverse' }
    });

    // RAP Cards - stagger from bottom
    gsap.from('.rap-card', {
      y: 80, opacity: 0, duration: 0.7, stagger: 0.2, ease: 'power2.out',
      scrollTrigger: { trigger: '.rap-cards', start: 'top 80%', toggleActions: 'play none none reverse' }
    });

    // RAP big letters
    gsap.from('.rap-letter', {
      y: 100, opacity: 0, scale: 0.8, duration: 0.8, stagger: 0.15, ease: 'back.out(1.4)',
      scrollTrigger: { trigger: '.rap-cards', start: 'top 80%', toggleActions: 'play none none reverse' }
    });

    // Book section - text from left, book from right
    gsap.from('.book-text', {
      x: -80, opacity: 0, duration: 0.9, ease: 'power2.out',
      scrollTrigger: { trigger: '.book-section', start: 'top 75%', toggleActions: 'play none none reverse' }
    });
    gsap.from('.book-mockup', {
      x: 80, opacity: 0, rotateY: 15, duration: 1, ease: 'power2.out',
      scrollTrigger: { trigger: '.book-section', start: 'top 75%', toggleActions: 'play none none reverse' }
    });

    // Services section title
    gsap.from('.services-title', {
      y: 50, opacity: 0, duration: 0.8, ease: 'power2.out',
      scrollTrigger: { trigger: '.services-title', start: 'top 85%', toggleActions: 'play none none reverse' }
    });

    // Services cards
    gsap.from('.service-card', {
      y: 60, opacity: 0, duration: 0.7, stagger: 0.2, ease: 'power2.out',
      scrollTrigger: { trigger: '.services-grid', start: 'top 80%', toggleActions: 'play none none reverse' }
    });

    // Testimonials - images scale in
    gsap.from('.testimonial-images', {
      scale: 0.85, opacity: 0, duration: 0.9, ease: 'power2.out',
      scrollTrigger: { trigger: '.testimonials-section', start: 'top 75%', toggleActions: 'play none none reverse' }
    });
    // Testimonials - quote slide in
    gsap.from('.testimonial-quote', {
      x: 60, opacity: 0, duration: 0.9, ease: 'power2.out',
      scrollTrigger: { trigger: '.testimonials-section', start: 'top 75%', toggleActions: 'play none none reverse' }
    });

    // CTA section
    gsap.from('.cta-section', {
      y: 60, opacity: 0, scale: 0.95, duration: 0.9, ease: 'power2.out',
      scrollTrigger: { trigger: '.cta-section', start: 'top 80%', toggleActions: 'play none none reverse' }
    });

    // Footer
    gsap.from('.landing-footer', {
      y: 30, opacity: 0, duration: 0.7, ease: 'power2.out',
      scrollTrigger: { trigger: '.landing-footer', start: 'top 90%', toggleActions: 'play none none reverse' }
    });

    // Parallax floating blobs in hero
    gsap.to('.hero-blob-1', {
      y: -120, ease: 'none',
      scrollTrigger: { trigger: '.hero-section', start: 'top top', end: 'bottom top', scrub: true }
    });
    gsap.to('.hero-blob-2', {
      y: -80, ease: 'none',
      scrollTrigger: { trigger: '.hero-section', start: 'top top', end: 'bottom top', scrub: true }
    });

  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="bg-surface font-body text-on-background selection:bg-secondary-container min-h-screen">
      {/* TopNavBar */}
      <nav className="hero-nav fixed top-0 w-full z-50 bg-[#fcfaf8]/90 backdrop-blur-lg dark:bg-slate-950/90">
      <div className="flex justify-between items-center px-6 md:px-10 py-6 w-full max-w-screen-2xl mx-auto">
      <a className="text-2xl font-light tracking-[0.2em] uppercase text-[#1a1a1a] dark:text-white" href="#">
                  Flor Aznar
              </a>
      {/* Desktop nav */}
      <div className="hidden md:flex items-center gap-10">
      <a className="font-manrope tracking-tight text-sm font-bold border-b-2 border-[#1a1a1a] dark:border-white pb-1 text-[#1a1a1a] dark:text-white" href="#">Inicio</a>
      <a className="font-manrope tracking-tight text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-[#1a1a1a] dark:hover:text-white transition-colors" href="#rap">Método RAP</a>
      <a className="font-manrope tracking-tight text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-[#1a1a1a] dark:hover:text-white transition-colors" href="#book">Libro</a>
      <a className="font-manrope tracking-tight text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-[#1a1a1a] dark:hover:text-white transition-colors" href="#services">Servicios</a>
      <a className="font-manrope tracking-tight text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-[#1a1a1a] dark:hover:text-white transition-colors" href="#testimonials">Testimonios</a>
      <a className="font-manrope tracking-tight text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-[#1a1a1a] dark:hover:text-white transition-colors" href="#contact">Contacto</a>
      </div>
      {/* Desktop login button */}
      <Link href="/login" className="hidden md:block">
        <button className="bg-primary text-on-primary rounded-full px-8 py-3 text-sm font-bold hover:opacity-80 transition-all duration-300">
                  Ingresar al Sistema
        </button>
      </Link>
      {/* Mobile hamburger */}
      <button
        className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Menú de navegación"
      >
        <span className={`block w-6 h-0.5 bg-[#1a1a1a] transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
        <span className={`block w-6 h-0.5 bg-[#1a1a1a] transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
        <span className={`block w-6 h-0.5 bg-[#1a1a1a] transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
      </button>
      </div>
      {/* Mobile menu */}
      <div className={`md:hidden transition-all duration-500 ease-in-out overflow-hidden ${isMobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="flex flex-col items-center gap-6 px-6 pb-8 pt-2">
          <a className="font-manrope text-sm font-bold text-[#1a1a1a]" href="#" onClick={() => setIsMobileMenuOpen(false)}>Inicio</a>
          <a className="font-manrope text-sm font-medium text-slate-500 hover:text-[#1a1a1a] transition-colors" href="#rap" onClick={() => setIsMobileMenuOpen(false)}>Método RAP</a>
          <a className="font-manrope text-sm font-medium text-slate-500 hover:text-[#1a1a1a] transition-colors" href="#book" onClick={() => setIsMobileMenuOpen(false)}>Libro</a>
          <a className="font-manrope text-sm font-medium text-slate-500 hover:text-[#1a1a1a] transition-colors" href="#services" onClick={() => setIsMobileMenuOpen(false)}>Servicios</a>
          <a className="font-manrope text-sm font-medium text-slate-500 hover:text-[#1a1a1a] transition-colors" href="#testimonials" onClick={() => setIsMobileMenuOpen(false)}>Testimonios</a>
          <a className="font-manrope text-sm font-medium text-slate-500 hover:text-[#1a1a1a] transition-colors" href="#contact" onClick={() => setIsMobileMenuOpen(false)}>Contacto</a>
          <Link href="/login" className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
            <button className="w-full bg-primary text-on-primary rounded-full px-8 py-3 text-sm font-bold hover:opacity-80 transition-all duration-300">
              Ingresar al Sistema
            </button>
          </Link>
        </div>
      </div>
      </nav>
      <main className="pt-20 lg:pt-24">
      {/* Hero Section */}
      <section className="hero-section relative min-h-screen md:h-screen md:min-h-[600px] flex items-center px-6 md:px-12 py-24 md:py-10 lg:py-0 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 ethereal-gradient opacity-60 -z-10"></div>
      <div className="hero-blob-1 absolute top-1/4 -right-20 w-96 h-96 bg-secondary rounded-full blur-[120px] opacity-40"></div>
      <div className="hero-blob-2 absolute bottom-1/4 -left-20 w-80 h-80 bg-surface-container-high rounded-full blur-[100px] opacity-50"></div>
      <div className="max-w-screen-2xl mx-auto w-full grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
      <div className="space-y-6">
      <div className="hero-badge inline-block px-4 py-1.5 rounded-full bg-surface-bright/80 backdrop-blur border border-outline-variant">
      <span className="text-[0.7rem] uppercase tracking-[0.4em] font-bold text-on-surface-variant">Evolución Consciente</span>
      </div>
      <h1 className="hero-title text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light tracking-tight leading-[1.1]">
                          Habita tu <span className="font-extrabold italic">máximo</span> potencial.
                      </h1>
      <p className="hero-subtitle text-lg md:text-xl text-on-surface-variant max-w-lg font-light leading-relaxed">
                          Un espacio diseñado para quienes buscan trascender lo cotidiano a través del coaching de alto rendimiento y una profunda visión humana.
                      </p>
      <div className="hero-buttons flex flex-col sm:flex-row gap-6 pt-4">
      <button className="bg-primary text-on-primary rounded-full px-8 py-4 text-sm md:text-base font-bold flex items-center justify-center gap-3 hover:scale-[0.98] transition-transform">
                              Comenzar Ahora
                              <span className="material-symbols-outlined">arrow_forward</span>
      </button>
      <button className="bg-surface-bright/50 backdrop-blur rounded-full px-8 py-4 text-sm md:text-base font-medium border border-outline-variant hover:bg-surface-bright transition-all">
                              Explorar Método
                          </button>
      </div>
      </div>
      <div className="hero-image relative">
      <div className="aspect-square lg:aspect-[4/5] max-h-[60vh] lg:max-h-[75vh] w-auto mx-auto rounded-[2rem] lg:rounded-[3rem] overflow-hidden soft-shadow relative z-10 border-[12px] border-surface-bright/30">
      <img alt="portrait" className="w-full h-full object-cover" src="/herosection.JPG" />
      </div>
      {/* Decorative Floating Element */}
      <div className="hero-quote absolute -bottom-10 -left-10 bg-surface-bright p-8 rounded-[3rem] soft-shadow z-20 max-w-[240px]">
      <p className="text-sm font-medium italic text-on-surface">"El cambio no ocurre en la mente, ocurre en el ser."</p>
      <div className="mt-4 flex gap-1">
      <span className="w-2 h-2 rounded-full bg-secondary-container"></span>
      <span className="w-2 h-2 rounded-full bg-surface-container-high"></span>
      <span className="w-2 h-2 rounded-full bg-tertiary-container"></span>
      </div>
      </div>
      </div>
      </div>
      </section>
      {/* RAP Method Section */}
      <section className="py-16 lg:py-24 xl:py-32 px-6 md:px-12 bg-surface" id="rap">
      <div className="max-w-screen-2xl mx-auto">
      <div className="rap-title flex flex-col md:flex-row justify-between items-end mb-12 lg:mb-24 gap-8">
      <div className="max-w-2xl">
      <span className="text-[0.75rem] uppercase tracking-[0.4em] font-bold text-on-surface-variant mb-6 block">El Mapa</span>
      <h2 className="text-3xl md:text-5xl lg:text-6xl font-light">El Método RAP: <span className="font-extrabold text-on-surface">Una Evolución Radical</span></h2>
      </div>
      <p className="text-on-surface-variant max-w-sm pb-2">Un viaje estructurado desde la claridad interna hacia la manifestación externa, diseñado para líderes de alto impacto.</p>
      </div>
      <div className="rap-cards grid md:grid-cols-3 gap-12 relative">
      {/* Reconocimiento */}
      <div className="rap-card group relative pt-12">
      <div className="rap-letter absolute -top-6 left-0 text-[6rem] lg:text-[8rem] xl:text-[10rem] font-extrabold text-surface-dim opacity-30 select-none group-hover:text-secondary-container transition-colors duration-500">R</div>
      <div className="relative z-10 bg-surface-bright p-6 lg:p-10 rounded-[2rem] lg:rounded-[3rem] soft-shadow h-full flex flex-col hover:-translate-y-2 transition-transform duration-500">
      <div className="w-16 h-16 rounded-2xl bg-secondary-container flex items-center justify-center mb-8">
      <span className="material-symbols-outlined text-on-secondary-container text-3xl">visibility</span>
      </div>
      <h3 className="text-2xl font-bold mb-4">Reconocimiento</h3>
      <p className="text-on-surface-variant leading-relaxed mb-8">Identifica las narrativas silenciosas y los techos de cristal invisibles que te alejan de tu frecuencia auténtica.</p>
      <div className="mt-auto flex items-center gap-2 text-sm font-bold tracking-widest uppercase">
      <span>Fase 01</span>
      <div className="h-px flex-grow bg-outline-variant"></div>
      </div>
      </div>
      </div>
      {/* Acción */}
      <div className="rap-card group relative pt-24 md:pt-32">
      <div className="rap-letter absolute top-0 md:top-12 left-0 text-[6rem] lg:text-[8rem] xl:text-[10rem] font-extrabold text-surface-dim opacity-30 select-none group-hover:text-surface-container-high transition-colors duration-500">A</div>
      <div className="relative z-10 bg-surface-bright p-6 lg:p-10 rounded-[2rem] lg:rounded-[3rem] soft-shadow h-full flex flex-col hover:-translate-y-2 transition-transform duration-500 border border-surface-container-high">
      <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center mb-8">
      <span className="material-symbols-outlined text-primary text-3xl">bolt</span>
      </div>
      <h3 className="text-2xl font-bold mb-4">Acción</h3>
      <p className="text-on-surface-variant leading-relaxed mb-8">Implementación estratégica de nuevos comportamientos. Traducimos la visión en hábitos de alto rendimiento.</p>
      <div className="mt-auto flex items-center gap-2 text-sm font-bold tracking-widest uppercase">
      <span>Fase 02</span>
      <div className="h-px flex-grow bg-outline-variant"></div>
      </div>
      </div>
      </div>
      {/* Potencial */}
      <div className="rap-card group relative pt-12 md:pt-4">
      <div className="rap-letter absolute -top-10 md:-top-16 left-0 text-[6rem] lg:text-[8rem] xl:text-[10rem] font-extrabold text-surface-dim opacity-30 select-none group-hover:text-tertiary-container transition-colors duration-500">P</div>
      <div className="relative z-10 bg-surface-bright p-6 lg:p-10 rounded-[2rem] lg:rounded-[3rem] soft-shadow h-full flex flex-col hover:-translate-y-2 transition-transform duration-500">
      <div className="w-16 h-16 rounded-2xl bg-tertiary-container flex items-center justify-center mb-8">
      <span className="material-symbols-outlined text-on-tertiary-container text-3xl">auto_awesome</span>
      </div>
      <h3 className="text-2xl font-bold mb-4">Potencial</h3>
      <p className="text-on-surface-variant leading-relaxed mb-8">Encarnar tu versión más elevada. Crecimiento sostenible y la realización de tu visión en cada esfera de la vida.</p>
      <div className="mt-auto flex items-center gap-2 text-sm font-bold tracking-widest uppercase">
      <span>Fase 03</span>
      <div className="h-px flex-grow bg-outline-variant"></div>
      </div>
      </div>
      </div>
      </div>
      </div>
      </section>
      {/* Book Section */}
      <section className="book-section py-16 lg:py-24 xl:py-32 px-6 md:px-12 bg-surface overflow-hidden" id="book">
      <div className="max-w-screen-2xl mx-auto">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
      <div className="book-text order-2 md:order-1 space-y-6">
      <span className="text-[0.75rem] uppercase tracking-[0.4em] font-bold text-[#7c2d12] mb-4 block">Publicación Reciente</span>
      <h2 className="text-3xl md:text-4xl lg:text-5xl lg:text-7xl font-light leading-tight">Volver al <span className="font-extrabold italic">Origen</span></h2>
      <p className="text-lg md:text-xl text-on-surface-variant max-w-lg font-light leading-relaxed">
                              Una guía práctica de autoconocimiento y transformación personal. Un viaje hacia tu interior para reconectar con quién sos de verdad, soltar lo que ya no te sirve y construir una vida desde tu esencia.
                          </p>
      <div className="pt-6 flex flex-col sm:flex-row gap-4">
      <div className="relative">
      <button onClick={() => setIsBookDropdownOpen(!isBookDropdownOpen)} className="bg-[#7c2d12] text-white rounded-full px-12 py-5 text-base font-bold hover:opacity-90 transition-all soft-shadow flex items-center gap-2">
                                  Adquirir el libro
                                  <span className={`material-symbols-outlined text-lg transition-transform duration-300 ${isBookDropdownOpen ? 'rotate-180' : ''}`}>expand_more</span>
                              </button>
      {isBookDropdownOpen && (
        <>
        <div className="fixed inset-0 z-40" onClick={() => setIsBookDropdownOpen(false)} />
        <div className="absolute top-full left-0 mt-3 bg-white rounded-2xl soft-shadow border border-slate-100 overflow-hidden z-50 min-w-[260px] animate-in fade-in slide-in-from-top-2">
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
      <Link href="/leer" className="border-2 border-[#7c2d12] text-[#7c2d12] rounded-full px-10 py-5 text-base font-bold hover:bg-[#7c2d12]/10 transition-all text-center">
                                  Pegar un vistazo
      </Link>
      </div>
      </div>
      <div className="book-mockup order-1 md:order-2 relative flex justify-center items-center">
      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-secondary-container/30 blur-[100px] -z-10 rounded-full"></div>
      {/* Book Mockup Wrapper */}
      <div className="relative w-full max-w-[300px] lg:max-w-[400px] transition-transform duration-700 hover:rotate-2">
      <div className="aspect-[3/4] rounded-xl lg:rounded-[2rem] book-shadow overflow-hidden">
      <img alt="Volver al Origen - Portada" className="w-full h-full object-cover" src="/portadalibro.jpeg" />
      </div>
      </div>
      </div>
      </div>
      </div>
      </section>

      {/* Services Section (Bento Style) */}
      <section className="py-16 lg:py-24 xl:py-32 px-6 md:px-12 bg-surface-dim/30" id="services">
      <div className="max-w-screen-2xl mx-auto">
      <div className="services-title text-center mb-12 lg:mb-24">
      <span className="text-[0.75rem] uppercase tracking-[0.4em] font-bold text-on-surface-variant mb-4 block">Caminos</span>
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-light">Nuestros <span className="font-extrabold italic">Servicios</span></h2>
      </div>
      <div className="services-grid grid md:grid-cols-12 gap-8">
      {/* Service Card - Rotating */}
      <div className="service-card md:col-span-7 bg-surface-bright rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row soft-shadow group relative">
      <div className="md:w-1/2 overflow-hidden">
      <img alt="minimalist and elegant office interior" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCECIt-1Q_bK-afDeiw3emAlG-Y98qsYBHNSpy2dlGwWmZtgy0-PBmTKRSOXZBsPss6r18q4tUytlSoj_A6y1nxGfCICfgJ8mr24mMm5037vgTpXPtrMpcJB-FIkkWF4-gxmSTvf8aNQ0Cgb7Ss9taOVIfOpGuosUE1Y3EieSRgFtGiXh8oSjMsRUGzdN5lRiecgFsmqRJ7qSfU8qyM-TtSzzmSsYhsFf4yXnETqp0z9XfPLU17zW-LBtoWHSboVliaPyzMIFTl0fI" />
      </div>
      <div className="md:w-1/2 p-8 lg:p-12 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl lg:text-3xl font-bold leading-tight transition-all duration-500">{servicios[currentService].title}</h3>
      </div>
      <p className="text-on-surface-variant mb-6 font-light transition-all duration-500">{servicios[currentService].description}</p>
      <ul className="space-y-3 mb-6">
      {servicios[currentService].features.map((f, i) => (
        <li key={i} className="flex items-center gap-3 text-sm font-medium">
          <span className="material-symbols-outlined text-on-secondary-container text-lg">check_circle</span>
          {f}
        </li>
      ))}
      </ul>
      {servicios[currentService].extra && (
        <p className="text-sm font-medium text-on-secondary-container mb-6 italic">{servicios[currentService].extra}</p>
      )}
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(servicios[currentService].whatsappMsg)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto border-b border-primary w-fit pb-1 font-bold tracking-wider uppercase text-xs hover:text-on-secondary-container transition-colors"
      >
        Consultar Disponibilidad
      </a>
      {/* Navigation dots */}
      <div className="flex items-center gap-3 mt-6">
        <button onClick={prevService} className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-100 transition-colors" aria-label="Servicio anterior">
          <span className="material-symbols-outlined text-base">chevron_left</span>
        </button>
        {servicios.map((_, i) => (
          <button key={i} onClick={() => setCurrentService(i)} className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === currentService ? 'bg-primary scale-125' : 'bg-slate-300 hover:bg-slate-400'}`} aria-label={`Servicio ${i + 1}`} />
        ))}
        <button onClick={nextService} className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-100 transition-colors" aria-label="Siguiente servicio">
          <span className="material-symbols-outlined text-base">chevron_right</span>
        </button>
      </div>
      </div>
      </div>
      {/* Talleres */}
      <div className="service-card md:col-span-5 bg-surface-container-high/40 backdrop-blur rounded-[2.5rem] p-8 lg:p-12 flex flex-col justify-between soft-shadow border border-white/50">
      <div>
      <div className="w-14 h-14 rounded-full bg-surface-bright flex items-center justify-center mb-8 soft-shadow">
      <span className="material-symbols-outlined">groups</span>
      </div>
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
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hola! Me interesa consultar por los próximos talleres. ¿Podrías darme más información?')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 bg-primary text-on-primary rounded-full py-4 px-8 font-bold text-sm w-full hover:opacity-90 text-center block"
      >
        Consultar por Próximos Talleres
      </a>
      </div>
      </div>
      </div>
      </section>
      {/* Social Proof / Stats */}
      <section className="testimonials-section py-16 lg:py-24 xl:py-32 px-6 md:px-12 bg-surface" id="testimonials">
      <div className="max-w-screen-2xl mx-auto grid md:grid-cols-2 gap-10 lg:gap-20 items-center">
      <div className="testimonial-images relative">
      <div className="grid grid-cols-2 gap-4">
      <div className="aspect-square rounded-2xl overflow-hidden mt-12">
      <img alt="abstract close-up of flowing water ripples" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQ3Ab09lHVxv8u8ojZBJGMzLVRKi5E6nE4GLW6a7dadQnto1K_WJugRFq_s1kjUYu1Xn0Sr9PM5HLLfG5JSmcsJVo42RtNkdn0fhDDBmC54nI1DhhOmG3TRCD9HW6-OyGhto2vEyK6aGyQzeCYTwPepsASaGTN03ImP7HTRcta_f8IuCaSSG_hmrTghuZplSyhfhiohY6Ti-dJzuxOOzqX8FC5hN81exBxIsODUKylDwdeN9SQtePwRgecAzPExmDXywgfbMBCYpM" />
      </div>
      <div className="aspect-square rounded-2xl overflow-hidden">
      <img alt="soft focus close-up of delicate white petals" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBA_apO8wPdM-fsZPoKOVo_UuQvAulJD8Ha-TaIRuvOiwWOJ1mwt2y6OaIRMoGNPKAU4VMGuwD2KceA7BIpQjxPh8bVEumNe3ojzMKDov94FYDpWgr_8FY7cuu1s4tMAxdR6rowRykjxk9X9TM8i3wmsjE8WdWHq2oTBkV0776nR7-fPGeoCN8u-pwve_XCgHSaJN4pEYliLctmrRriDMnE3ZrTm5wMo1LvVp8jZnGeaIeUpRPh3DCt8p_yEUoLz3j4JgN3KFkZDeQ" />
      </div>
      </div>
      {/* Stats Card */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface-bright p-12 rounded-[3rem] soft-shadow text-center min-w-[300px]">
      <div className="text-5xl lg:text-7xl font-extrabold tracking-tighter text-on-surface">150+</div>
      <div className="text-[0.75rem] uppercase tracking-[0.4em] font-bold text-on-surface-variant mt-4">Historias Reescritas</div>
      </div>
      </div>
      <div className="testimonial-quote space-y-10">
      <span className="material-symbols-outlined text-6xl text-secondary-container">format_quote</span>
      <h2 className="text-3xl md:text-4xl font-light leading-relaxed">
                          "Trabajar con Flor fue el catalizador que no sabía que necesitaba. El <span className="font-bold">Método RAP</span> me dio una estructura para entender mi propia ambición sin perder mi esencia."
                      </h2>
      <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden">
      <img alt="portrait of Elena Rodríguez" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBRFY1w4fIiXzBQCzE3d7tUwGMpdCPN8c6msG0yZv3oBKlw1gsqhMudgmvaZQfAFNmE1DfmFSahrcovtr_i6xFiy-EbDboIYsbG-VMY4b4OTDZdQOKHcNcJMD8zPEz36RrCNs46FXWYuRBOMZFzFMjCU-T-nSIfekKGn2MHQokjSUAP3wIuWandsOVQTEVtUgOJLUVv431QMThDKQmvbPlPEcJBIio7bhnfz5kVKBN6gzA4zeOB9DgtebYq_mbpWiICghW121QCy3I" />
      </div>
      <div>
      <div className="font-bold text-sm uppercase tracking-wider">Elena Rodríguez</div>
      <div className="text-xs text-on-surface-variant">CEO &amp; Directora Creativa</div>
      </div>
      </div>
      </div>
      </div>
      </section>
      {/* Final CTA */}
      <section className="px-6 md:px-12 py-16 lg:py-24 xl:py-32" id="contact">
      <div className="max-w-screen-2xl mx-auto">
      <div className="cta-section relative bg-primary text-on-primary rounded-[2rem] lg:rounded-[4rem] p-8 md:p-16 lg:p-24 overflow-hidden text-center">
      {/* Decorative Gradients in Dark */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary-container opacity-10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-surface-container-high opacity-10 rounded-full blur-[80px]"></div>
      <div className="relative z-10 max-w-3xl mx-auto space-y-12">
      <h2 className="text-3xl md:text-4xl lg:text-5xl lg:text-7xl font-light tracking-tight">¿Iniciamos la <span className="italic font-extrabold">conversación?</span></h2>
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
      {/* Footer */}
      <footer className="landing-footer w-full rounded-t-[2.5rem] mt-12 lg:mt-20 bg-[#ffffff] dark:bg-slate-900 shadow-[0_-10px_30px_-10px_rgba(0,0,0,0.08)]">
      <div className="flex flex-col md:flex-row justify-between items-center px-12 py-16 w-full gap-8 max-w-screen-2xl mx-auto">
      <div className="space-y-0 text-center md:text-left">
      <div className="text-lg font-black tracking-tight text-[#1a1a1a] dark:text-white">Flor Aznar</div>
      <div className="font-manrope text-[0.75rem] uppercase tracking-[0.4em] leading-relaxed text-[#1a1a1a] dark:text-slate-100">
                      © 2026 Flor Aznar.
                  </div>
      <div className="select-none -mt-2">
        <a href="https://codeadesarrollos.com" target="_blank" rel="noopener noreferrer" className="font-black text-[4rem] sm:text-[6rem] md:text-[8rem] uppercase tracking-[-0.04em] text-[#1a1a1a]/[0.04] leading-none hover:text-[#1a1a1a]/[0.15] transition-all duration-500">CODEA</a>
      </div>
      </div>
      <div className="flex flex-wrap justify-center gap-8">
      <a className="font-manrope text-[0.75rem] uppercase tracking-[0.4em] leading-relaxed text-slate-400 dark:text-slate-500 hover:text-[#1a1a1a] hover:tracking-[0.5em] transition-all duration-500" href="https://www.instagram.com/metodo_rap?igsh=MTlxejF1cGRieTc0bQ%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer">Instagram</a>
      <a className="font-manrope text-[0.75rem] uppercase tracking-[0.4em] leading-relaxed text-slate-400 dark:text-slate-500 hover:text-[#1a1a1a] hover:tracking-[0.5em] transition-all duration-500" href="https://www.tiktok.com/@florenciaznar?_r=1&_t=ZS-95W9Hi2kJO4" target="_blank" rel="noopener noreferrer">TikTok</a>
      </div>
      </div>
      </footer>
    </div>
  );
}

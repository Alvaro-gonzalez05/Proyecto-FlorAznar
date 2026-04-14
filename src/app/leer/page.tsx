'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LeerPage() {
  const [isBookDropdownOpen, setIsBookDropdownOpen] = useState(false);
  const [downloadCheck, setDownloadCheck] = useState(false);
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

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/Volver-al-Origen.pdf';
    link.download = 'Volver al Origen.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloadCheck(true);
    setTimeout(() => setDownloadCheck(false), 2000);
  };

  return (
    <div className="h-screen bg-[#faf7f4] flex flex-col overflow-hidden">
      {/* Header */}
      <nav className="w-full bg-[#faf7f4]/90 backdrop-blur-lg border-b border-outline-variant/30 flex-shrink-0">
        <div className="flex justify-between items-center px-3 sm:px-6 md:px-10 py-2 sm:py-5 max-w-screen-2xl mx-auto">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 text-on-surface-variant hover:text-[#1a1a1a] transition-colors">
            <span className="material-symbols-outlined text-lg sm:text-2xl">arrow_back</span>
            <span className="text-xs sm:text-sm font-medium">Volver al inicio</span>
          </Link>
          <span className="text-sm sm:text-lg font-light tracking-[0.15em] uppercase text-[#1a1a1a]">Flor Aznar</span>
        </div>
      </nav>

      <main className="flex-1 flex flex-col justify-center items-center px-3 sm:px-6 md:px-12 py-2 sm:py-6">
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
          <div className="text-center mb-5 sm:mb-8">
            <h1 className="text-5xl sm:text-4xl md:text-5xl lg:text-6xl font-light leading-tight">Empezá a <span className="font-extrabold italic">leer</span></h1>
            <p className="text-base sm:text-base md:text-lg uppercase tracking-[0.2em] sm:tracking-[0.3em] text-gray-400 mt-2 sm:mt-4 font-medium">Florencia Aznar · Método Rap</p>
          </div>
          <div className="w-full bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl soft-shadow overflow-hidden flex flex-row">
            <div className="w-1/3 flex-shrink-0">
              <div className="h-full overflow-hidden">
                <img alt="Volver al Origen - Portada" className="w-full h-full object-cover" src="/portadalibro.jpeg" />
              </div>
            </div>
            <div className="w-2/3 p-3 sm:p-4 md:p-8 flex flex-col justify-center gap-2 sm:gap-3">
              <h3 className="text-sm sm:text-lg md:text-2xl font-bold text-[#1a1a1a]">Volver al Origen</h3>
              <p className="text-[0.65rem] sm:text-sm md:text-base text-on-surface-variant font-light leading-relaxed line-clamp-3 sm:line-clamp-none">
                Una guía transformadora que combina coaching de alto rendimiento con herramientas prácticas para reconectar con tu esencia, liderar con autenticidad y desbloquear tu verdadero potencial.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <button onClick={handleDownload} className={`${downloadCheck ? 'bg-green-600' : 'bg-[#7c2d12]'} text-white rounded-full px-4 sm:px-8 py-2 sm:py-3 text-[0.65rem] sm:text-sm font-bold hover:opacity-90 transition-all flex items-center gap-2 sm:gap-3 duration-300`}>
                  <span className={`material-symbols-outlined text-base sm:text-lg transition-transform duration-300 ${downloadCheck ? 'scale-125' : ''}`}>{downloadCheck ? 'check_circle' : 'menu_book'}</span>
                  {downloadCheck ? (
                    <span>¡DESCARGADO!</span>
                  ) : (
                    <>
                      <span className="hidden sm:inline">LEER CAPÍTULOS GRATIS</span>
                      <span className="sm:hidden">LEER GRATIS</span>
                    </>
                  )}
                </button>
                <div className="relative">
                <button onClick={() => setIsBookDropdownOpen(!isBookDropdownOpen)} className="border-2 border-[#7c2d12] text-[#7c2d12] rounded-full px-4 sm:px-8 py-2 sm:py-3 text-[0.65rem] sm:text-sm font-bold hover:bg-[#7c2d12]/10 transition-all flex items-center gap-2 sm:gap-3 justify-center w-full">
                  <span className="material-symbols-outlined text-sm sm:text-lg">shopping_cart</span>
                  <span className="hidden sm:inline">COMPRAR LIBRO</span>
                  <span className="sm:hidden">COMPRAR</span>
                  <span className={`material-symbols-outlined text-sm transition-transform duration-300 ${isBookDropdownOpen ? 'rotate-180' : ''}`}>expand_more</span>
                </button>
                {isBookDropdownOpen && (
                  <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsBookDropdownOpen(false)} />
                  <div className="absolute bottom-full left-0 sm:left-auto sm:right-0 mb-2 bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden z-50 min-w-[240px]">
                    {purchaseThank ? (
                      <div className="flex flex-col items-center justify-center py-6 px-5 gap-2">
                        <span className="material-symbols-outlined text-3xl text-green-500 animate-bounce">shopping_cart_checkout</span>
                        <span className="text-xs sm:text-sm font-bold text-[#1a1a1a]">¡Gracias por tu compra!</span>
                        <span className="text-[0.6rem] sm:text-xs text-slate-400">Redirigiendo...</span>
                      </div>
                    ) : (
                    <>
                    <button onClick={() => handlePurchaseClick('https://florenciaaznar.mitiendanube.com/productos/volver-al-origen/')} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-100 w-full text-left">
                      <img src="/logo-tiendanube.png" alt="Tienda Nube" className="w-6 h-6 flex-shrink-0 object-contain" />
                      <div><div className="text-xs sm:text-sm font-bold text-[#1a1a1a]">Mi Tienda Nube</div><div className="text-[0.6rem] sm:text-xs text-slate-400">florenciaaznar.mitiendanube.com</div></div>
                    </button>
                    <button onClick={() => handlePurchaseClick('https://articulo.mercadolibre.com.ar/MLA-1739085787-volver-al-origen-_JM')} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors w-full text-left">
                      <img src="/logo-mercadolibre.png" alt="Mercado Libre" className="w-6 h-6 flex-shrink-0 object-contain" />
                      <div><div className="text-xs sm:text-sm font-bold text-[#1a1a1a]">Mercado Libre</div><div className="text-[0.6rem] sm:text-xs text-slate-400">mercadolibre.com.ar</div></div>
                    </button>
                    </>
                    )}
                  </div>
                  </>
                )}
                </div>
              </div>
            </div>
          </div>
          {/* Social Icons */}
          <div className="flex justify-center gap-4 mt-3 sm:mt-6">
            <a href="https://www.instagram.com/metodo_rap?igsh=MTlxejF1cGRieTc0bQ%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-[#1a1a1a] flex items-center justify-center hover:opacity-80 transition-opacity" aria-label="Instagram">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </a>
            <a href="https://www.tiktok.com/@florenciaznar?_r=1&_t=ZS-95W9Hi2kJO4" target="_blank" rel="noopener noreferrer" className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-[#1a1a1a] flex items-center justify-center hover:opacity-80 transition-opacity" aria-label="TikTok">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.75a8.18 8.18 0 004.77 1.52V6.84a4.84 4.84 0 01-1-.15z"/></svg>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

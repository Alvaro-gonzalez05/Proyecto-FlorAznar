
import Link from 'next/link';
import React from 'react';

export default function ExportPage() {
    return (
        <div className="flex flex-col h-full overflow-hidden relative bg-slate-50/50">
            <header className="px-12 py-8 flex justify-between items-center bg-white/80 backdrop-blur-md z-30 shrink-0 border-b border-slate-100">
                <div>
                    <h1 className="text-xs uppercase tracking-[0.4em] font-semibold text-slate-400 mb-1">Paso Final</h1>
                    <h2 className="text-2xl font-bold tracking-tight">Previsualización de Carta Natal</h2>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/resultados" className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-black-accent transition-colors">
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                        Volver al panel
                    </Link>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden relative z-10">
                {/* Preview Area */}
                <div className="flex-1 overflow-y-auto p-12 flex justify-center items-start">
                    <div className="bg-white w-full max-w-[600px] aspect-[1/1.414] rounded-sm pdf-preview-shadow relative overflow-hidden p-16 flex flex-col items-center justify-between transition-all duration-500">
                        {/* Elegant Minimal Background - No Blobs */}
                        <div className="absolute inset-0 sacred-geo-bg opacity-[0.03] text-amber-900"></div>
                        
                        {/* Golden/Silver Corner Accents */}
                        <div className="absolute top-8 right-8 w-16 h-16 border-t-2 border-r-2 border-amber-200/50 rounded-tr-3xl"></div>
                        <div className="absolute bottom-8 left-8 w-16 h-16 border-b-2 border-l-2 border-amber-200/50 rounded-bl-3xl"></div>

                        <div className="relative z-10 text-center flex flex-col items-center w-full">
                            <div className="mb-12">
                                <span className="material-symbols-outlined text-4xl font-extralight text-amber-500/50">stars</span>
                            </div>
                            <div className="w-full flex flex-col items-center">
                                <h3 className="text-xs uppercase tracking-[0.5em] font-semibold text-slate-400 mb-6">Carta Natal Numerológica</h3>
                                <h4 className="font-serif text-5xl mb-2 italic text-slate-800">Flor Martínez</h4>
                                {/* Gold Divider */}
                                <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-amber-400 to-transparent mb-12"></div>
                            </div>
                            
                            <div className="relative w-80 h-80 mb-12 flex items-center justify-center">
                                {/* Fine Gold/Silver Geometry - Complex Mandala Style */}
                                <svg className="w-full h-full absolute animate-[spin_60s_linear_infinite]" viewBox="0 0 200 200" style={{ animationDuration: '60s' }}>
                                    {/* Silver Layers */}
                                    <circle cx="100" cy="100" r="95" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
                                    <g stroke="#94a3b8" strokeWidth="0.3" fill="none" opacity="0.5">
                                        <rect x="50" y="50" width="100" height="100" />
                                        <rect x="50" y="50" width="100" height="100" transform="rotate(45 100 100)" />
                                    </g>
                                    
                                    {/* Gold Layers - Hexagram */}
                                    <g stroke="#d4af37" strokeWidth="0.4" fill="none" opacity="0.8">
                                        <polygon points="100,30 160.6,135 39.4,135" />
                                        <polygon points="100,170 39.4,65 160.6,65" />
                                    </g>

                                    {/* Inner Details */}
                                    <circle cx="100" cy="100" r="60" fill="none" stroke="#d4af37" strokeWidth="0.1" strokeDasharray="2 2" />
                                    <circle cx="100" cy="100" r="40" fill="none" stroke="#e2e8f0" strokeWidth="0.8" />
                                </svg>
                                
                                <div className="text-center z-10 relative">
                                    {/* Simple Black Number */}
                                    <div className="font-serif text-8xl italic tracking-tighter mb-1 text-black-accent">33</div>
                                    <div className="text-[9px] uppercase tracking-[0.3em] font-bold text-slate-400">Energía Vital</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-12 w-full max-w-sm">
                                <div className="text-center border-r border-slate-100 last:border-0 px-4">
                                    <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-slate-400 mb-3">Misión</p>
                                    <p className="font-serif text-2xl italic text-slate-700">11</p>
                                </div>
                                <div className="text-center px-4">
                                    <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-slate-400 mb-3">Destino</p>
                                    <p className="font-serif text-2xl italic text-slate-700">22</p>
                                </div>
                            </div>
                        </div>

                        <div className="relative z-10 text-center">
                            <p className="text-[10px] text-slate-300 font-medium tracking-widest mb-2">GENERADO POR</p>
                            <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Astral Bloom</p>
                        </div>
                    </div>
                </div>

                {/* Right Action Sidebar */}
                <aside className="w-96 border-l border-slate-100 bg-white p-10 flex flex-col shrink-0 overflow-y-auto">
                    <div className="mb-10">
                        <h3 className="text-lg font-bold mb-2">Finalizar y Enviar</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">Tu carta natal está lista. Puedes descargarla o enviarla directamente a tu cliente.</p>
                    </div>

                    <div className="space-y-4">
                        <button className="w-full bg-black-accent text-white h-16 rounded-2xl font-bold flex items-center justify-between px-8 hover:opacity-90 transition-all shadow-lg shadow-black/5">
                            Descargar PDF
                            <span className="material-symbols-outlined">download</span>
                        </button>
                        <button className="w-full bg-whatsapp-green text-emerald-900 h-16 rounded-2xl font-bold flex items-center justify-between px-8 hover:bg-[#dcf3eb] transition-all border border-emerald-100">
                            Compartir por WhatsApp
                            <span className="material-symbols-outlined">chat</span>
                        </button>
                        <button className="w-full bg-gmail-blue text-blue-900 h-16 rounded-2xl font-bold flex items-center justify-between px-8 hover:bg-[#deebfe] transition-all border border-blue-100">
                            Enviar por Gmail
                            <span className="material-symbols-outlined">mail</span>
                        </button>
                    </div>

                    <div className="mt-12 pt-10 border-t border-slate-100">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Detalles del Archivo</h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-500">Nombre del archivo</span>
                                <span className="text-sm font-semibold">carta_flor_m.pdf</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-500">Tamaño</span>
                                <span className="text-sm font-semibold">2.4 MB</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-500">Formato</span>
                                <span className="text-sm font-semibold">PDF Alta Resolución</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto bg-off-white rounded-3xl p-6 border border-slate-100">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-slate-100">
                                <span className="material-symbols-outlined text-slate-400">verified</span>
                            </div>
                            <p className="text-xs font-bold uppercase tracking-wider">Cifrado Seguro</p>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">Todos los datos están protegidos y el enlace de descarga expirará en 24 horas por seguridad.</p>
                    </div>
                </aside>
            </div>
        </div>
    );
}

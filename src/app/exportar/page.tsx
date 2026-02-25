'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';

export default function ExportPage() {
    const [resultData, setResultData] = useState<any>(null);
    const [aiExplanations, setAiExplanations] = useState<any>(null);

    // UI Expandable States
    const [showWspInput, setShowWspInput] = useState(false);
    const [wspNumber, setWspNumber] = useState('');
    const [showEmailInput, setShowEmailInput] = useState(false);
    const [emailAddr, setEmailAddr] = useState('');

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const stored = sessionStorage.getItem('numerologyResult');
        if (stored) {
            setResultData(JSON.parse(stored));
        }

        const storedAi = sessionStorage.getItem('geminiExplanations');
        if (storedAi) {
            setAiExplanations(JSON.parse(storedAi));
        }
    }, []);

    const handleDownloadPDF = () => {
        // Ejecuta el menú de impresión del navegador. El CSS de impresión (print:...) 
        // se encarga de mostrar el formato vectorizado multipágina ocultando la UI.
        window.print();
    };

    const handleWhatsAppShare = () => {
        if (!wspNumber) {
            setShowWspInput(true);
            return;
        }

        const text = `¡Hola! Aquí tienes tu análisis numerológico. Tu Vibración Interna es ${resultData?.primeraParte?.vibracionInterna?.digit || '...'} y tu Misión de Vida es ${resultData?.primeraParte?.calculoMision?.digit || '...'}. Adjunto el PDF generado.`;
        const url = `https://wa.me/${wspNumber.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
        setShowWspInput(false);
        setWspNumber('');
    };

    const handleGmailShare = () => {
        if (!emailAddr) {
            setShowEmailInput(true);
            return;
        }

        const subject = `Carta Natal Numerológica - ${resultData?.nombreCompleto || 'Cliente'}`;
        const body = `Hola,\n\nTe adjunto los resultados principales de tu Carta Natal Numerológica:\n\nVibración Interna: ${resultData?.primeraParte?.vibracionInterna?.digit || '-'}\nDestino / Misión: ${resultData?.primeraParte?.calculoMision?.digit || '-'}\n\nPor favor, responde a este correo si tienes dudas o si deseas recibir el archivo PDF adjunto.\n\nSaludos.`;
        const url = `mailto:${emailAddr}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = url;
        setShowEmailInput(false);
        setEmailAddr('');
    };

    if (!mounted) return null;

    const clientNameDisplay = resultData?.nombreCompleto || 'Cargando...';
    const vibracionDisplay = resultData?.primeraParte?.vibracionInterna?.digit || '...';
    const misionDisplay = resultData?.primeraParte?.calculoMision?.digit || '...';
    const destinoDisplay = resultData?.primeraParte?.fechaNacimiento?.caminoDeVida?.digit || '...';

    // Agrupación lógica de las secciones para mapear en el renderizado de impresión
    const printSections = [
        {
            groupName: "1. Esencia y Propósito",
            items: [
                { label: "Vibración Interna - Alma", value: resultData?.primeraParte?.vibracionInterna?.digit, text: aiExplanations?.vibracion_interna },
                { label: "Talento", value: resultData?.primeraParte?.fechaNacimiento?.talento?.digit, text: aiExplanations?.talento },
                { label: "Misión de Vida", value: resultData?.primeraParte?.calculoMision?.digit, text: aiExplanations?.mision },
                { label: "Personalidad Exterior", value: resultData?.primeraParte?.calculoPersonalidad?.digit, text: aiExplanations?.personalidad }
            ]
        },
        {
            groupName: "2. Ciclos y Potenciadores",
            items: [
                { label: "Camino de Vida", value: resultData?.primeraParte?.fechaNacimiento?.caminoDeVida?.digit, text: aiExplanations?.camino_de_vida },
                { label: "Número de Fuerza", value: resultData?.primeraParte?.potenciadores?.numeroDeFuerza?.digit, text: aiExplanations?.fuerza },
                { label: "Número de Sombra", value: resultData?.primeraParte?.potenciadores?.numeroDeSombra?.digit, text: aiExplanations?.sombra },
                { label: "Año Personal", value: resultData?.primeraParte?.potenciadores?.anioPersonal?.digit, text: aiExplanations?.anio_personal },
                { label: "Mes Personal", value: resultData?.primeraParte?.potenciadores?.mesPersonal?.digit, text: aiExplanations?.mes_personal }
            ]
        },
        {
            groupName: "3. Karmas y Memorias",
            items: [
                { label: "Memoria de Vida Pasada", value: resultData?.primeraParte?.fechaNacimiento?.memoriaVidaPasada?.digit, text: aiExplanations?.pasado },
                { label: "Deuda Kármica del Mes", value: resultData?.primeraParte?.fechaNacimiento?.karmaMes?.digit, text: aiExplanations?.karma_mes },
                { label: "Letras Faltantes y Deuda Nominal", value: "", text: aiExplanations?.letras_faltantes }
            ]
        },
        {
            groupName: "4. Sistema Familiar",
            items: [
                { label: "Herencia Familiar", value: resultData?.segundaParte?.herenciaFamiliar?.digit, text: aiExplanations?.sistema_familiar_herencia },
                { label: "Evolución Familiar", value: resultData?.segundaParte?.evolucionFamiliar?.digit, text: aiExplanations?.sistema_familiar_evolucion },
                { label: "Campo de Expresión", value: resultData?.segundaParte?.campoDeExpresion?.digit, text: aiExplanations?.sistema_familiar_expresion },
                { label: "Potencial Evolutivo", value: resultData?.segundaParte?.potencialEvolutivo?.digit, text: aiExplanations?.sistema_familiar_potencial }
            ]
        }
    ];

    // Añadir linajes dinámicamente si existen
    const linajesKeys = Object.keys(aiExplanations || {}).filter(k => k.startsWith('sistema_familiar_linaje_'));
    if (linajesKeys.length > 0 && resultData?.segundaParte?.linajes) {
        const linajeItems = linajesKeys.map((k, i) => ({
            label: `Linaje ${i + 1}`,
            value: resultData.segundaParte.linajes[i]?.reduccion?.digit,
            text: aiExplanations[k]
        }));
        printSections.push({
            groupName: "5. Ramas de Linajes",
            items: linajeItems
        });
    }

    return (
        <>
            {/* === PANTALLA WEB (Oculta al imprimir) === */}
            <div className="print:hidden flex flex-col h-full overflow-hidden relative bg-slate-50/50">
                <header className="px-12 py-8 flex justify-between items-center bg-white/80 backdrop-blur-md z-30 shrink-0 border-b border-slate-100">
                    <div>
                        <h1 className="text-xs uppercase tracking-[0.4em] font-semibold text-slate-400 mb-1">Paso Final</h1>
                        <h2 className="text-2xl font-bold tracking-tight">Menú de Exportación</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/resultados" className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-black-accent transition-colors">
                            <span className="material-symbols-outlined text-lg">arrow_back</span>
                            Volver al panel
                        </Link>
                    </div>
                </header>

                <div className="flex-1 flex overflow-hidden relative z-10">
                    {/* Preview Area (Simbolica) */}
                    <div className="flex-1 overflow-y-auto p-12 flex justify-center items-start">
                        <div className="bg-white w-full max-w-[600px] aspect-[1/1.414] rounded-sm pdf-preview-shadow relative overflow-hidden p-16 flex flex-col items-center justify-between">
                            <div className="absolute inset-0 sacred-geo-bg opacity-[0.03] text-amber-900"></div>
                            <div className="absolute top-8 right-8 w-16 h-16 border-t-2 border-r-2 border-amber-200/50 rounded-tr-3xl"></div>
                            <div className="absolute bottom-8 left-8 w-16 h-16 border-b-2 border-l-2 border-amber-200/50 rounded-bl-3xl"></div>

                            <div className="relative z-10 text-center flex flex-col items-center w-full">
                                <span className="material-symbols-outlined text-4xl font-extralight text-amber-500/50 mb-12">stars</span>
                                <h3 className="text-xs uppercase tracking-[0.5em] font-semibold text-slate-400 mb-6">Carta Natal Numerológica</h3>
                                <h4 className="font-serif text-5xl mb-2 italic text-slate-800 tracking-tight capitalize">{clientNameDisplay.toLowerCase()}</h4>
                                <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-amber-400 to-transparent mb-12"></div>

                                <div className="relative w-80 h-80 mb-12 flex items-center justify-center">
                                    <svg className="w-full h-full absolute animate-[spin_60s_linear_infinite]" viewBox="0 0 200 200">
                                        <circle cx="100" cy="100" r="95" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
                                        <g stroke="#d4af37" strokeWidth="0.4" fill="none" opacity="0.8">
                                            <polygon points="100,30 160.6,135 39.4,135" />
                                            <polygon points="100,170 39.4,65 160.6,65" />
                                        </g>
                                        <circle cx="100" cy="100" r="40" fill="none" stroke="#e2e8f0" strokeWidth="0.8" />
                                    </svg>
                                    <div className="text-center z-10 relative">
                                        <div className="font-serif text-8xl italic tracking-tighter mb-1 text-black-accent">{vibracionDisplay}</div>
                                        <div className="text-[9px] uppercase tracking-[0.3em] font-bold text-slate-400">Energía Vital</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-12 w-full max-w-sm">
                                    <div className="text-center border-r border-slate-100 last:border-0 px-4">
                                        <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-slate-400 mb-3">Misión</p>
                                        <p className="font-serif text-2xl italic text-slate-700">{misionDisplay}</p>
                                    </div>
                                    <div className="text-center px-4">
                                        <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-slate-400 mb-3">Cm. Vida</p>
                                        <p className="font-serif text-2xl italic text-slate-700">{destinoDisplay}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="relative z-10 text-center mt-12">
                                <p className="text-[10px] text-slate-300 font-medium tracking-widest mb-2">GENERADO POR</p>
                                <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Astral Bloom</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Action Sidebar */}
                    <aside className="w-96 border-l border-slate-100 bg-white p-10 flex flex-col shrink-0 overflow-y-auto">
                        <div className="mb-10">
                            <h3 className="text-lg font-bold mb-2">Opciones de Exportación</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">Se generará un documento multipágina con explicaciones dinámicas de la IA.</p>
                        </div>

                        <div className="space-y-4">
                            <button
                                onClick={handleDownloadPDF}
                                className="w-full bg-black-accent text-white h-16 rounded-2xl font-bold flex items-center justify-between px-8 hover:opacity-90 transition-all shadow-lg shadow-black/5"
                            >
                                Imprimir / Guardar PDF
                                <span className="material-symbols-outlined">print</span>
                            </button>

                            {/* WhatsApp Toggle */}
                            <div className="bg-whatsapp-green/20 rounded-2xl border border-emerald-100 overflow-hidden transition-all duration-300">
                                {showWspInput ? (
                                    <div className="p-4 flex flex-col gap-3">
                                        <label className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Número de WhatsApp</label>
                                        <input
                                            type="tel"
                                            placeholder="+54 9 11 1234 5678"
                                            value={wspNumber}
                                            onChange={(e) => setWspNumber(e.target.value)}
                                            className="w-full bg-white border-emerald-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-400 outline-none"
                                            autoFocus
                                        />
                                        <div className="flex gap-2">
                                            <button onClick={() => setShowWspInput(false)} className="flex-1 py-2 text-xs font-bold text-emerald-800/60 hover:text-emerald-900">Cancelar</button>
                                            <button onClick={handleWhatsAppShare} className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold tracking-widest uppercase hover:bg-emerald-700 shadow-xl shadow-emerald-900/10">Enviar Link</button>
                                        </div>
                                    </div>
                                ) : (
                                    <button onClick={() => setShowWspInput(true)} className="w-full text-emerald-900 h-16 bg-whatsapp-green font-bold flex items-center justify-between px-8 hover:bg-[#dcf3eb] transition-all">
                                        Mensaje WhatsApp
                                        <span className="material-symbols-outlined">chat</span>
                                    </button>
                                )}
                            </div>

                            {/* Gmail Toggle */}
                            <div className="bg-gmail-blue/20 rounded-2xl border border-blue-100 overflow-hidden transition-all duration-300">
                                {showEmailInput ? (
                                    <div className="p-4 flex flex-col gap-3">
                                        <label className="text-xs font-bold text-blue-900 uppercase tracking-wider">Correo Electrónico</label>
                                        <input
                                            type="email"
                                            placeholder="cliente@email.com"
                                            value={emailAddr}
                                            onChange={(e) => setEmailAddr(e.target.value)}
                                            className="w-full bg-white border-blue-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                                            autoFocus
                                        />
                                        <div className="flex gap-2">
                                            <button onClick={() => setShowEmailInput(false)} className="flex-1 py-2 text-xs font-bold text-blue-800/60 hover:text-blue-900">Cancelar</button>
                                            <button onClick={handleGmailShare} className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold tracking-widest uppercase hover:bg-blue-700 shadow-xl shadow-blue-900/10">Abrir Mail</button>
                                        </div>
                                    </div>
                                ) : (
                                    <button onClick={() => setShowEmailInput(true)} className="w-full text-blue-900 h-16 bg-gmail-blue font-bold flex items-center justify-between px-8 hover:bg-[#deebfe] transition-all">
                                        Enviar por Correo
                                        <span className="material-symbols-outlined">mail</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="mt-auto bg-off-white rounded-3xl p-6 border border-slate-100">
                            <div className="flex items-center gap-4 mb-3">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-slate-100">
                                    <span className="material-symbols-outlined text-slate-400">check_circle</span>
                                </div>
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-600">Alta Definición</p>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed">El reporte PDF nativo se renderizará con textos dinámicos vectorizados y saltos de página perfectos para formato A4.</p>
                        </div>
                    </aside>
                </div>
            </div>

            {/* === LAYOUT DE IMPRESIÓN (Solo visible al crear PDF via Print) === */}
            <div className="hidden print:block bg-white text-black min-h-screen font-sans">
                {/* Página 1: Portada (Ocupa toda la hoja y fuerza salto) */}
                <div className="h-screen w-full flex flex-col items-center justify-center relative break-after-page">
                    <div className="absolute top-12 left-12 right-12 bottom-12 border-2 border-amber-500/10 z-0"></div>
                    <div className="absolute top-20 right-20 w-32 h-32 border-t-4 border-r-4 border-amber-300/60 rounded-tr-[4rem]"></div>
                    <div className="absolute bottom-20 left-20 w-32 h-32 border-b-4 border-l-4 border-amber-300/60 rounded-bl-[4rem]"></div>

                    <div className="relative z-10 text-center w-full max-w-2xl px-10 flex flex-col items-center">
                        <h2 className="text-sm uppercase tracking-[0.4em] font-semibold text-slate-500 mb-8">Estudio Analítico &bull; Carta Natal</h2>
                        <h1 className="font-serif text-6xl capitalize text-slate-900 italic tracking-tight mb-8">
                            {clientNameDisplay.toLowerCase()}
                        </h1>
                        <div className="w-24 h-[2px] bg-amber-400 mb-12"></div>

                        <div className="flex justify-center gap-16 mb-24">
                            <div className="text-center">
                                <p className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-3">Vibración Interna</p>
                                <p className="font-serif text-5xl text-amber-600">{vibracionDisplay}</p>
                            </div>
                            <div className="w-[1px] bg-slate-200"></div>
                            <div className="text-center">
                                <p className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-3">Destino (Cm. Vida)</p>
                                <p className="font-serif text-5xl text-amber-600">{destinoDisplay}</p>
                            </div>
                        </div>

                        <p className="text-xs text-slate-400 tracking-[0.2em] uppercase">Generado Exclusivamente Por</p>
                        <p className="text-lg font-serif font-bold tracking-widest mt-2 text-slate-700">ASTRAL BLOOM</p>
                    </div>
                </div>

                {/* Páginas Siguientes: Desglose de Resultados generados por la Inteligencia Artificial */}
                <div className="p-16">
                    <h2 className="text-xs uppercase tracking-[0.5em] font-bold text-slate-400 text-center mb-16 pb-4 border-b border-slate-100">
                        Interpretación Profunda y Desglose Analítico
                    </h2>

                    {printSections.map((group, groupIndex) => {
                        const hasItems = group.items.some(item => item.text && item.text.trim() !== '');
                        if (!hasItems) return null;

                        return (
                            <div key={groupIndex} className="mb-16">
                                <h3 className="text-3xl font-serif text-amber-700 mb-8 uppercase tracking-widest underline decoration-amber-100 decoration-4 underline-offset-8">
                                    {group.groupName}
                                </h3>

                                <div className="space-y-10">
                                    {group.items.map((item, itemIndex) => {
                                        if (!item.text || item.text.trim() === '') return null;

                                        return (
                                            <div key={itemIndex} className="break-inside-avoid border-l-4 border-slate-100 pl-6 pb-2">
                                                <div className="flex items-center gap-4 mb-3">
                                                    <h4 className="text-xl font-bold tracking-tight text-slate-800 uppercase">
                                                        {item.label}
                                                    </h4>
                                                    {item.value && (
                                                        <span className="w-10 h-10 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center font-serif text-xl font-bold">
                                                            {item.value}
                                                        </span>
                                                    )}
                                                </div>
                                                <div
                                                    className="text-[15px] leading-[1.8] text-slate-700 font-sans whitespace-pre-wrap text-justify"
                                                >
                                                    {item.text}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
}

'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';

function displayNum(n: any): string {
    if (typeof n === 'number') return String(n);
    if (!n) return '-';
    if (n.isMaster) return `${n.masterValue}/${n.digit}`;
    if (n.isKarmic) return `${n.karmicValue}/${n.digit}`;
    return String(n.digit || '-');
}

export default function ExportPage() {
    const [resultData, setResultData] = useState<any>(null);
    const [aiExplanations, setAiExplanations] = useState<any>(null);
    const [showWspInput, setShowWspInput] = useState(false);
    const [wspNumber, setWspNumber] = useState('');
    const [showEmailInput, setShowEmailInput] = useState(false);
    const [emailAddr, setEmailAddr] = useState('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const stored = sessionStorage.getItem('numerologyResult');
        if (stored) setResultData(JSON.parse(stored));
        const storedAi = sessionStorage.getItem('geminiExplanations');
        if (storedAi) setAiExplanations(JSON.parse(storedAi));
    }, []);

    const handleDownloadPDF = () => {
        const originalTitle = document.title;
        document.title = `Carta Natal - ${clientName}`;
        window.print();
        // Restaurar título después de imprimir
        setTimeout(() => { document.title = originalTitle; }, 1000);
    };

    const handleWhatsAppShare = () => {
        if (!wspNumber) { setShowWspInput(true); return; }
        const message = `¡Hola! Aquí tienes los resultados principales de tu Carta Natal Numerológica`;
        window.open(`https://wa.me/${wspNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
        setShowWspInput(false); setWspNumber('');
    };

    const handleGmailShare = () => {
        if (!emailAddr) { setShowEmailInput(true); return; }
        const client = resultData?.nombreCompleto || 'Cliente';
        const subject = `Carta Natal Numerológica - ${client}`;
        const body = `¡Hola! Aquí tienes los resultados principales de tu Carta Natal Numerológica`;

        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${emailAddr}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(gmailUrl, '_blank');

        setShowEmailInput(false); setEmailAddr('');
    };

    if (!mounted) return null;

    const clientName = resultData?.nombreCompleto || 'Cargando...';
    const vibracionDisplay = displayNum(resultData?.primeraParte?.vibracionInterna);
    const misionDisplay = displayNum(resultData?.primeraParte?.calculoMision);
    const destinoDisplay = displayNum(resultData?.primeraParte?.fechaNacimiento?.caminoDeVida);

    const letrasKarmicasFaltantes = [1, 2, 3, 4, 5, 6, 7, 8, 9]
        .filter(n => (resultData?.primeraParte?.deudasKarmicasNombre?.[n] || 0) === 0)
        .join(', ');

    // Todos los resultados
    const allResults: Array<{ section: string; label: string; value: string; aiKey: string }> = [
        { section: "Esencia y Propósito", label: "Vibración Interna", value: displayNum(resultData?.primeraParte?.vibracionInterna), aiKey: "vibracion_interna" },
        { section: "Esencia y Propósito", label: "Alma", value: displayNum(resultData?.primeraParte?.calculoAlma), aiKey: "alma" },
        { section: "Esencia y Propósito", label: "Misión de Vida", value: displayNum(resultData?.primeraParte?.calculoMision), aiKey: "mision" },
        { section: "Esencia y Propósito", label: "Personalidad Exterior", value: displayNum(resultData?.primeraParte?.calculoPersonalidad), aiKey: "personalidad" },
        { section: "Sendero y Destino", label: "Camino de Vida", value: displayNum(resultData?.primeraParte?.fechaNacimiento?.caminoDeVida), aiKey: "camino_de_vida" },
        { section: "Atributos de la Fecha", label: "Talento / Don", value: displayNum(resultData?.primeraParte?.fechaNacimiento?.talento), aiKey: "talento" },
        { section: "Atributos de la Fecha", label: "Deuda Kármica del Mes", value: displayNum(resultData?.primeraParte?.fechaNacimiento?.karmaMes), aiKey: "karma_mes" },
        { section: "Atributos de la Fecha", label: "Memoria de Vida Pasada", value: displayNum(resultData?.primeraParte?.fechaNacimiento?.memoriaVidaPasada), aiKey: "pasado" },
        { section: "Potenciadores", label: "Número de Fuerza", value: displayNum(resultData?.primeraParte?.potenciadores?.numeroDeFuerza), aiKey: "fuerza" },
        { section: "Potenciadores", label: "Número de Sombra", value: displayNum(resultData?.primeraParte?.potenciadores?.numeroDeSombra), aiKey: "sombra" },
        { section: "Tránsito Actual", label: "Año Personal", value: displayNum(resultData?.primeraParte?.potenciadores?.anioPersonal), aiKey: "anio_personal" },
        { section: "Tránsito Actual", label: "Mes Personal", value: displayNum(resultData?.primeraParte?.potenciadores?.mesPersonal), aiKey: "mes_personal" },
        { section: "Lecciones Kármicas", label: "Letras Faltantes", value: letrasKarmicasFaltantes || "Ninguna", aiKey: "letras_faltantes" },
    ];

    if (resultData?.segundaParte) {
        allResults.push(
            { section: "Sistema Familiar", label: "Herencia Familiar", value: displayNum(resultData.segundaParte.herenciaFamiliar), aiKey: "sistema_familiar_herencia" },
            { section: "Sistema Familiar", label: "Evolución Familiar", value: displayNum(resultData.segundaParte.evolucionFamiliar), aiKey: "sistema_familiar_evolucion" },
            { section: "Sistema Familiar", label: "Campo de Expresión", value: displayNum(resultData.segundaParte.campoDeExpresion), aiKey: "sistema_familiar_expresion" },
            { section: "Sistema Familiar", label: "Potencial Evolutivo", value: displayNum(resultData.segundaParte.potencialEvolutivo), aiKey: "sistema_familiar_potencial" },
        );
        if (resultData.segundaParte.linajes) {
            resultData.segundaParte.linajes.forEach((linaje: any, idx: number) => {
                allResults.push({ section: "Linajes", label: `Linaje: ${(linaje.nombre || '?').toLowerCase()}`, value: displayNum(linaje.reduccion), aiKey: `sistema_familiar_linaje_${idx}` });
            });
        }
    }

    const validResults = allResults.filter(item => {
        return (item.value && item.value !== '-') || aiExplanations?.[item.aiKey]?.trim();
    });

    // ═══ CONTENIDO COMPARTIDO (se muestra en preview Y en impresión) ═══
    const PrintContent = () => (
        <div style={{ background: 'white', color: 'black', fontFamily: "'Manrope', sans-serif" }}>
            {/* ── PORTADA ── */}
            <div className="pdf-page-break" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: '3rem' }}>
                <div style={{ position: 'absolute', top: '2.5rem', left: '2.5rem', right: '2.5rem', bottom: '2.5rem', border: '2px solid rgba(212, 175, 55, 0.1)' }}></div>
                <div style={{ position: 'absolute', top: '4rem', right: '4rem', width: '6rem', height: '6rem', borderTop: '3px solid rgba(212, 175, 55, 0.5)', borderRight: '3px solid rgba(212, 175, 55, 0.5)', borderTopRightRadius: '3rem' }}></div>
                <div style={{ position: 'absolute', bottom: '4rem', left: '4rem', width: '6rem', height: '6rem', borderBottom: '3px solid rgba(212, 175, 55, 0.5)', borderLeft: '3px solid rgba(212, 175, 55, 0.5)', borderBottomLeftRadius: '3rem' }}></div>
                <div style={{ textAlign: 'center', position: 'relative', zIndex: 10 }}>
                    <p style={{ fontSize: '0.7rem', letterSpacing: '0.4em', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '1.5rem' }}>Estudio Analítico &bull; Carta Natal</p>
                    <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '3rem', fontStyle: 'italic', color: '#1e293b', textTransform: 'capitalize', marginBottom: '1.5rem' }}>{clientName.toLowerCase()}</h1>
                    <div style={{ width: '5rem', height: '2px', background: '#d4af37', margin: '0 auto 2.5rem' }}></div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', marginBottom: '4rem' }}>
                        {[
                            { lbl: 'Vibración', val: vibracionDisplay },
                            { lbl: 'Camino', val: destinoDisplay },
                            { lbl: 'Misión', val: misionDisplay },
                        ].map((d, i) => (
                            <div key={i} style={{ textAlign: 'center' }}>
                                <p style={{ fontSize: '0.6rem', letterSpacing: '0.3em', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{d.lbl}</p>
                                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', color: '#d97706' }}>{d.val}</p>
                            </div>
                        ))}
                    </div>
                    <p style={{ fontSize: '0.6rem', color: '#94a3b8', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Generado Exclusivamente Por</p>
                    <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1rem', fontWeight: 700, letterSpacing: '0.3em', color: '#475569', marginTop: '0.3rem' }}>FLORENCIA AZNAR</p>
                </div>
            </div>

            {/* ── RESUMEN GENERAL IA ── */}
            {aiExplanations?.resumen_general && (
                <div className="pdf-no-break" style={{ padding: '2.5rem 2rem', marginBottom: '1rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                        <p style={{ fontSize: '0.55rem', letterSpacing: '0.5em', fontWeight: 700, color: '#d97706', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Interpretación Integral</p>
                        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', color: '#1e293b', fontStyle: 'italic' }}>Síntesis Energética General</h2>
                        <div style={{ width: '3rem', height: '2px', background: '#d4af37', margin: '0.8rem auto 0' }}></div>
                    </div>
                    <p style={{ fontSize: '0.85rem', lineHeight: 1.9, color: '#475569', whiteSpace: 'pre-wrap', textAlign: 'justify' }}>{aiExplanations.resumen_general}</p>
                </div>
            )}

            {/* ── TODOS LOS RESULTADOS — Flujo continuo ── */}
            <div style={{ padding: '1rem 2rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
                    <p style={{ fontSize: '0.55rem', letterSpacing: '0.5em', fontWeight: 700, color: '#d97706', textTransform: 'uppercase' }}>Desglose Analítico — Interpretaciones de IA</p>
                </div>

                {validResults.map((item, idx) => {
                    const aiText = aiExplanations?.[item.aiKey];
                    return (
                        <div key={idx} className="pdf-no-break" style={{ borderLeft: '3px solid rgba(212, 175, 55, 0.3)', paddingLeft: '1.2rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #f8fafc', position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '-2px', top: '0.5rem', width: '3px', height: '1.5rem', background: '#d4af37', borderRadius: '2px' }}></div>
                            <p style={{ fontSize: '0.5rem', letterSpacing: '0.4em', fontWeight: 700, color: '#d97706', textTransform: 'uppercase', marginBottom: '0.3rem' }}>{item.section}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
                                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{item.label}</h4>
                                {item.value && item.value !== '-' && (
                                    <span style={{ padding: '0.2rem 0.8rem', borderRadius: '0.8rem', background: 'linear-gradient(135deg, #fffbeb, #fff7ed)', border: '1px solid rgba(212, 175, 55, 0.2)', fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', fontWeight: 700, color: '#b45309' }}>
                                        {item.value}
                                    </span>
                                )}
                            </div>
                            {aiText && (
                                <p style={{ fontSize: '0.8rem', lineHeight: 1.8, color: '#475569', whiteSpace: 'pre-wrap', textAlign: 'justify' }}>{aiText}</p>
                            )}
                            {!aiText && (
                                <p style={{ fontSize: '0.75rem', color: '#cbd5e1', fontStyle: 'italic' }}>Sin interpretación disponible.</p>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* ── CONTEO DE LETRAS + PLANOS ── */}
            {resultData?.primeraParte?.deudasKarmicasNombre && (
                <div className="pdf-page-before" style={{ padding: '2.5rem 2rem' }}>
                    <p style={{ fontSize: '0.55rem', letterSpacing: '0.5em', fontWeight: 700, color: '#d97706', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Análisis Vibracional</p>
                    <div style={{ width: '2rem', height: '2px', background: '#d4af37', marginBottom: '1.2rem' }}></div>
                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', color: '#1e293b', marginBottom: '0.5rem' }}>Conteo de Letras por Vibración</h2>
                    <p style={{ fontSize: '0.7rem', color: '#94a3b8', fontStyle: 'italic', marginBottom: '1.5rem' }}>Las vibraciones con valor 0 representan lecciones kármicas pendientes.</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: '0.5rem', marginBottom: '2rem' }}>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => {
                            const count = resultData.primeraParte.deudasKarmicasNombre[num] || 0;
                            const isKarma = count === 0;
                            return (
                                <div key={num} style={{ textAlign: 'center', padding: '0.8rem 0.3rem', borderRadius: '0.8rem', border: `1px solid ${isKarma ? '#fecaca' : '#e2e8f0'}`, background: isKarma ? '#fef2f2' : '#f8fafc' }}>
                                    <p style={{ fontSize: '0.5rem', fontWeight: 900, letterSpacing: '0.1em', color: isKarma ? '#b91c1c' : '#94a3b8', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Nº {num}</p>
                                    <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', fontWeight: 700, color: isKarma ? '#b91c1c' : '#475569' }}>{count}</p>
                                    {isKarma && <p style={{ fontSize: '0.4rem', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', marginTop: '0.2rem' }}>KARMA</p>}
                                </div>
                            );
                        })}
                    </div>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', color: '#1e293b', marginBottom: '0.8rem' }}>Planos Existenciales</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.6rem', marginBottom: '1.5rem' }}>
                        {[
                            { name: "Mental", value: resultData.primeraParte.planosExistenciales?.mental || 0, color: "#60a5fa" },
                            { name: "Físico", value: resultData.primeraParte.planosExistenciales?.fisico || 0, color: "#f87171" },
                            { name: "Emotivo", value: resultData.primeraParte.planosExistenciales?.emotivo || 0, color: "#4ade80" },
                            { name: "Intuitivo", value: resultData.primeraParte.planosExistenciales?.intuitivo || 0, color: "#c084fc" },
                        ].map((p, i) => (
                            <div key={i} style={{ textAlign: 'center', padding: '1rem', borderRadius: '0.8rem', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color, margin: '0 auto 0.5rem' }}></div>
                                <p style={{ fontSize: '0.5rem', fontWeight: 900, letterSpacing: '0.15em', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.3rem' }}>{p.name}</p>
                                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.2rem', fontWeight: 700, color: '#475569' }}>{p.value}</p>
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                        <div style={{ padding: '0.8rem', borderRadius: '0.8rem', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                            <p style={{ fontSize: '0.5rem', fontWeight: 900, letterSpacing: '0.15em', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Equilibrio</p>
                            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', fontWeight: 700, color: '#475569' }}>{displayNum(resultData.primeraParte.potenciadores?.numeroDeEquilibrio)}</p>
                        </div>
                        <div style={{ padding: '0.8rem', borderRadius: '0.8rem', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                            <p style={{ fontSize: '0.5rem', fontWeight: 900, letterSpacing: '0.15em', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Regalo Divino</p>
                            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', fontWeight: 700, color: '#475569' }}>{displayNum(resultData.primeraParte.potenciadores?.regaloDivino)}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* ── SISTEMA FAMILIAR ── */}
            {resultData?.segundaParte && (
                <div className="pdf-page-before" style={{ padding: '2.5rem 2rem' }}>
                    <p style={{ fontSize: '0.55rem', letterSpacing: '0.5em', fontWeight: 700, color: '#d97706', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Mapa del Clan</p>
                    <div style={{ width: '2rem', height: '2px', background: '#d4af37', marginBottom: '1.2rem' }}></div>
                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', color: '#1e293b', marginBottom: '1rem' }}>Sistema Familiar — Datos Completos</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        {[
                            { label: "Herencia", value: displayNum(resultData.segundaParte.herenciaFamiliar), bg: "#eef2ff", border: "#c7d2fe" },
                            { label: "Evolución", value: displayNum(resultData.segundaParte.evolucionFamiliar), bg: "#f5f3ff", border: "#ddd6fe" },
                            { label: "Expresión", value: displayNum(resultData.segundaParte.campoDeExpresion), bg: "#ecfdf5", border: "#a7f3d0" },
                            { label: "Potencial", value: displayNum(resultData.segundaParte.potencialEvolutivo), bg: "#fffbeb", border: "#fde68a" },
                        ].map((d, i) => (
                            <div key={i} style={{ textAlign: 'center', padding: '0.8rem', borderRadius: '0.8rem', background: d.bg, border: `1px solid ${d.border}` }}>
                                <p style={{ fontSize: '0.45rem', fontWeight: 900, letterSpacing: '0.15em', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.3rem' }}>{d.label}</p>
                                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', fontWeight: 700, color: '#475569' }}>{d.value}</p>
                            </div>
                        ))}
                    </div>
                    {resultData.segundaParte.habitantes && (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '0.6rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>Habitantes del Sistema</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: '0.4rem' }}>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                    <div key={num} style={{ textAlign: 'center', padding: '0.5rem', borderRadius: '0.5rem', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                        <p style={{ fontSize: '0.4rem', fontWeight: 700, color: '#94a3b8' }}>C{num}</p>
                                        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', fontWeight: 700, color: '#475569' }}>{resultData.segundaParte.habitantes[num] || 0}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {resultData.segundaParte.linajes && (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '0.6rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>Linajes</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                                {resultData.segundaParte.linajes.map((linaje: any, idx: number) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.8rem', borderRadius: '0.5rem', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'capitalize', color: '#475569' }}>{(linaje.nombre || '?').toLowerCase()}</span>
                                        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', background: 'white', padding: '0.15rem 0.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>{displayNum(linaje.reduccion)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        {resultData.segundaParte.puentes?.iniciatico && (
                            <div>
                                <h3 style={{ fontSize: '0.6rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>Puente Iniciático</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.3rem' }}>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                        <div key={num} style={{ textAlign: 'center', padding: '0.3rem', borderRadius: '0.4rem', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                            <p style={{ fontSize: '0.4rem', fontWeight: 700, color: '#94a3b8' }}>C{num}</p>
                                            <p style={{ fontWeight: 700, fontSize: '0.75rem', color: '#475569' }}>{resultData.segundaParte.puentes.iniciatico[num]}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', borderRadius: '0.8rem', border: '2px solid #e2e8f0' }}>
                            <p style={{ fontSize: '0.5rem', fontWeight: 900, letterSpacing: '0.15em', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Puente de Evolución</p>
                            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', fontWeight: 700, color: '#1e293b' }}>{resultData.segundaParte.puentes?.evolucion ?? '-'}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* ── PIE FINAL ── */}
            <div style={{ textAlign: 'center', padding: '2rem', borderTop: '1px solid #f1f5f9' }}>
                <p style={{ fontSize: '0.5rem', letterSpacing: '0.3em', color: '#cbd5e1', fontWeight: 700, textTransform: 'uppercase' }}>Carta Natal Numerológica — {clientName} — Florencia Aznar</p>
            </div>
        </div>
    );

    return (
        <>
            {/* ═══ PANTALLA WEB ═══ */}
            <div className="screen-only" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: '#f8fafc' }}>
                <header style={{ padding: '1.2rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #f1f5f9', flexShrink: 0 }}>
                    <div>
                        <h1 style={{ fontSize: '0.65rem', letterSpacing: '0.3em', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Paso Final</h1>
                        <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Exportar Carta Natal</h2>
                    </div>
                    <Link href="/resultados" className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-black-accent transition-colors">
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                        Volver
                    </Link>
                </header>

                <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                    {/* Previsualización */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', background: '#e2e8f0' }}>
                        <div style={{ maxWidth: '650px', margin: '0 auto' }}>
                            <div className="pdf-preview-shadow" style={{ background: 'white', borderRadius: '2px', overflow: 'hidden' }}>
                                <PrintContent />
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <aside className="screen-only" style={{ width: '20rem', borderLeft: '1px solid #f1f5f9', background: 'white', padding: '2rem', display: 'flex', flexDirection: 'column', flexShrink: 0, overflowY: 'auto' }}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.3rem' }}>Exportar</h3>
                            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{validResults.length} resultados con interpretaciones.</p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            <button onClick={handleDownloadPDF} className="bg-black-accent text-white font-bold hover:opacity-90 transition-all shadow-lg shadow-black/5" style={{ width: '100%', height: '3.2rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', border: 'none', cursor: 'pointer' }}>
                                Imprimir / Guardar PDF
                                <span className="material-symbols-outlined">print</span>
                            </button>

                            <div className="bg-whatsapp-green/20 rounded-2xl border border-emerald-100 overflow-hidden">
                                {showWspInput ? (
                                    <div style={{ padding: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <input type="tel" placeholder="+54 9 11 1234 5678" value={wspNumber} onChange={(e) => setWspNumber(e.target.value)} className="w-full bg-white border-emerald-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-400 outline-none" autoFocus />
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button onClick={() => setShowWspInput(false)} className="text-xs font-bold text-emerald-800/60" style={{ flex: 1, padding: '0.5rem', background: 'none', border: 'none', cursor: 'pointer' }}>Cancelar</button>
                                            <button onClick={handleWhatsAppShare} className="bg-emerald-600 text-white rounded-xl text-xs font-bold uppercase" style={{ flex: 1, padding: '0.5rem', border: 'none', cursor: 'pointer' }}>Enviar</button>
                                        </div>
                                    </div>
                                ) : (
                                    <button onClick={() => setShowWspInput(true)} className="w-full text-emerald-900 bg-whatsapp-green font-bold hover:bg-[#dcf3eb] transition-all" style={{ height: '3.2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', border: 'none', cursor: 'pointer' }}>
                                        WhatsApp <span className="material-symbols-outlined">chat</span>
                                    </button>
                                )}
                            </div>

                            <div className="bg-gmail-blue/20 rounded-2xl border border-blue-100 overflow-hidden">
                                {showEmailInput ? (
                                    <div style={{ padding: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <input type="email" placeholder="cliente@email.com" value={emailAddr} onChange={(e) => setEmailAddr(e.target.value)} className="w-full bg-white border-blue-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-400 outline-none" autoFocus />
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button onClick={() => setShowEmailInput(false)} className="text-xs font-bold text-blue-800/60" style={{ flex: 1, padding: '0.5rem', background: 'none', border: 'none', cursor: 'pointer' }}>Cancelar</button>
                                            <button onClick={handleGmailShare} className="bg-blue-600 text-white rounded-xl text-xs font-bold uppercase" style={{ flex: 1, padding: '0.5rem', border: 'none', cursor: 'pointer' }}>Enviar</button>
                                        </div>
                                    </div>
                                ) : (
                                    <button onClick={() => setShowEmailInput(true)} className="w-full text-blue-900 bg-gmail-blue font-bold hover:bg-[#deebfe] transition-all" style={{ height: '3.2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', border: 'none', cursor: 'pointer' }}>
                                        Email <span className="material-symbols-outlined">mail</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        <div style={{ marginTop: 'auto', background: '#fcfaf8', borderRadius: '1rem', padding: '1.2rem', border: '1px solid #d4af3733', boxShadow: '0 4px 12px rgba(212, 175, 55, 0.05)' }}>
                            <p style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.1em', color: '#b45309', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>info</span>
                                Guía de Envío
                            </p>
                            <p style={{ fontSize: '0.7rem', color: '#64748b', lineHeight: 1.6 }}>
                                1. <b>Guarda el PDF</b> usando el botón negro.<br />
                                2. Toca <b>WhatsApp</b> para abrir el chat del cliente.<br />
                                3. En WhatsApp, <b>adjunta el archivo</b> que descargaste.
                            </p>
                        </div>
                    </aside>
                </div>
            </div>

            {/* ═══ CONTENIDO DE IMPRESIÓN (oculto en web, visible al imprimir) ═══ */}
            <div className="print-only" style={{ display: 'none' }}>
                <PrintContent />
            </div>
        </>
    );
}

'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';

interface CoachingExportData {
    nombreCliente: string;
    sintesis: string;
    acciones: { titulo: string; descripcion: string }[];
    fecha?: string;
}

function displayNum(n: any): { value: string, label?: string } {
    if (typeof n === 'number') return { value: String(n) };
    if (!n) return { value: '-' };
    if (n.label) return { value: n.label };
    if (n.sequence && n.sequence.length > 1) {
        let lbl = n.sequence.join('/');
        if (n.isMaster) return { value: lbl, label: 'MAESTRO' };
        if (n.isKarmic) return { value: lbl, label: 'KÁRMICO' };
        return { value: lbl };
    }
    if (n.isMaster) return { value: `${n.masterValue}/${n.digit}`, label: 'MAESTRO' };
    if (n.isKarmic) return { value: `${n.karmicValue}/${n.digit}`, label: 'KÁRMICO' };
    return { value: String(n.digit || '-') };
}

const formatAIReport = (text: string) => {
    return text.split('\n').map((line, idx) => {
        if (!line.trim()) return <div key={idx} style={{ height: '0.8rem' }}></div>;
        
        let isList = false;
        if (line.trim().startsWith('* ')) {
            line = line.replace('* ', '• ');
            isList = true;
        }

        let isHeader = false;
        let fontSize = '0.85rem';
        let fontWeight = 400;
        let color = '#475569';
        let marginBottom = '0.8rem';
        let fontFamily = "'Manrope', sans-serif";
        
        if (line.startsWith('### ')) {
            isHeader = true;
            fontSize = '1.3rem';
            fontWeight = 800;
            color = '#1e293b';
            line = line.replace('### ', '');
            marginBottom = '1rem';
            fontFamily = "'Playfair Display', serif";
        } else if (line.startsWith('## ')) {
            isHeader = true;
            fontSize = '1.5rem';
            fontWeight = 800;
            color = '#1e293b';
            line = line.replace('## ', '');
            marginBottom = '1.2rem';
            fontFamily = "'Playfair Display', serif";
        } else if (line.startsWith('# ')) {
            isHeader = true;
            fontSize = '1.8rem';
            fontWeight = 800;
            color = '#1e293b';
            line = line.replace('# ', '');
            marginBottom = '1.5rem';
            fontFamily = "'Playfair Display', serif";
        }

        const parts = line.split(/(\*\*.*?\*\*)/g);
        const formattedParts = parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={pIdx} style={{ fontWeight: 800, color: '#334155' }}>{part.slice(2, -2)}</strong>;
            }
            return part;
        });

        if (isHeader) {
            return (
                <h3 key={idx} style={{ fontFamily, fontSize, fontWeight, color, marginTop: '1.5rem', marginBottom }}>
                    {formattedParts}
                </h3>
            );
        }

        return (
            <p key={idx} style={{ 
                fontSize: '0.85rem', 
                lineHeight: 1.9, 
                color: '#475569', 
                textAlign: 'justify', 
                marginBottom: isList ? '0.3rem' : '0.8rem',
                paddingLeft: isList ? '1rem' : '0'
            }}>
                {formattedParts}
            </p>
        );
    });
};

export default function ExportPage() {
    const [resultData, setResultData] = useState<any>(null);
    const [clientText, setClientText] = useState<string | null>(null);
    const [showWspInput, setShowWspInput] = useState(false);
    const [wspNumber, setWspNumber] = useState('');
    const [showEmailInput, setShowEmailInput] = useState(false);
    const [emailAddr, setEmailAddr] = useState('');
    const [mounted, setMounted] = useState(false);
    const [coachingData, setCoachingData] = useState<CoachingExportData | null>(null);
    const [activeTab, setActiveTab] = useState<'carta' | 'coaching'>('carta');

    useEffect(() => {
        setMounted(true);
        const stored = sessionStorage.getItem('numerologyResult');
        if (stored) setResultData(JSON.parse(stored));
        const storedClientText = sessionStorage.getItem('clientReportEdited');
        if (storedClientText) setClientText(storedClientText);
        const storedCoaching = sessionStorage.getItem('coachingExport');
        if (storedCoaching) {
            try {
                const parsed = JSON.parse(storedCoaching);
                setCoachingData(parsed);
                const tabParam = new URLSearchParams(window.location.search).get('tab');
                if (tabParam === 'coaching') {
                    setActiveTab('coaching');
                }
            } catch { /* ignore */ }
        }
    }, []);

    const handleDownloadPDF = () => {
        const originalTitle = document.title;
        const docTitle = activeTab === 'coaching'
            ? `Resumen de Coaching - ${coachingData?.nombreCliente || 'Cliente'}`
            : `Carta Numerológica - ${clientName}`;
        document.title = docTitle;
        window.print();
        setTimeout(() => { document.title = originalTitle; }, 1000);
    };

    const handleWhatsAppShare = () => {
        if (!wspNumber) { setShowWspInput(true); return; }
        const message = `¡Hola! Aquí tienes tu archivo de Carta Numerológica para descargar.`;
        window.open(`https://wa.me/${wspNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
        setShowWspInput(false); setWspNumber('');
    };

    const handleGmailShare = () => {
        if (!emailAddr) { setShowEmailInput(true); return; }
        const client = resultData?.nombreCompleto || 'Cliente';
        const subject = `Carta Numerológica - ${client}`;
        const body = `¡Hola! Aquí tienes tu Reporte Numerológico Completo.`;

        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${emailAddr}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(gmailUrl, '_blank');

        setShowEmailInput(false); setEmailAddr('');
    };

    if (!mounted) return null;

    const clientName = resultData?.nombreCompleto || 'Cargando...';
    const vibracionArr: any[] = resultData?.primeraParte?.vibracionInterna || [];
    const vibracionDisplay: { value: string; label?: string } = vibracionArr.length === 0
        ? { value: '-' }
        : vibracionArr.length === 1
            ? displayNum(vibracionArr[0].reduction)
            : (() => {
                const digits = vibracionArr.map((v: any) => {
                    const r = v.reduction;
                    if (r?.sequence?.length > 1) return r.sequence.join('/');
                    return String(r?.digit ?? '-');
                });
                const hasMaster = vibracionArr.some((v: any) => v.reduction?.isMaster);
                const hasKarmic = vibracionArr.some((v: any) => v.reduction?.isKarmic);
                return {
                    value: digits.join(' · '),
                    label: hasMaster ? 'MAESTRO' : hasKarmic ? 'KÁRMICO' : undefined,
                };
            })();
    const misionDisplay = displayNum(resultData?.primeraParte?.calculoMision);
    const destinoDisplay = displayNum(resultData?.primeraParte?.fechaNacimiento?.caminoDeVida);

    // ═══ CONTENIDO COMPARTIDO (se muestra en preview Y en impresión) ═══
    const PrintContent = () => (
        <div style={{ background: 'white', color: 'black', fontFamily: "'Manrope', sans-serif" }}>
            {/* ── PORTADA ── */}
            <div className={`pdf-page-break`} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: '3rem' }}>
                <div style={{ position: 'absolute', top: '2.5rem', left: '2.5rem', right: '2.5rem', bottom: '2.5rem', border: '2px solid rgba(212, 175, 55, 0.1)' }}></div>
                <div style={{ position: 'absolute', top: '4rem', right: '4rem', width: '6rem', height: '6rem', borderTop: '3px solid rgba(212, 175, 55, 0.5)', borderRight: '3px solid rgba(212, 175, 55, 0.5)', borderTopRightRadius: '3rem' }}></div>
                <div style={{ position: 'absolute', bottom: '4rem', left: '4rem', width: '6rem', height: '6rem', borderBottom: '3px solid rgba(212, 175, 55, 0.5)', borderLeft: '3px solid rgba(212, 175, 55, 0.5)', borderBottomLeftRadius: '3rem' }}></div>
                <div style={{ textAlign: 'center', position: 'relative', zIndex: 10, width: '100%', maxWidth: '80%' }}>
                    <p style={{ fontSize: '0.7rem', letterSpacing: '0.4em', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '1.5rem' }}>Estudio Analítico &bull; Carta Numerológica</p>
                    <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '3rem', fontStyle: 'italic', color: '#1e293b', textTransform: 'capitalize', marginBottom: '1.5rem', lineHeight: '1.3' }}>{clientName.toLowerCase()}</h1>
                    <div style={{ width: '5rem', height: '2px', background: '#d4af37', margin: '0 auto 3.5rem' }}></div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', marginBottom: '4rem', alignItems: 'flex-start' }}>
                        {[
                            { lbl: 'Vibración', num: vibracionDisplay },
                            { lbl: 'Camino', num: destinoDisplay },
                            { lbl: 'Misión', num: misionDisplay },
                        ].map((d, i) => (
                            <div key={i} style={{ textAlign: 'center', flex: 1 }}>
                                <p style={{ fontSize: '0.6rem', letterSpacing: '0.3em', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.8rem' }}>{d.lbl}</p>
                                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', color: '#d97706', lineHeight: 1 }}>{d.num.value}</p>
                                {d.num.label && <p style={{ fontSize: '0.75rem', fontWeight: 800, color: '#d97706', letterSpacing: '0.2em', marginTop: '0.4rem' }}>{d.num.label}</p>}
                            </div>
                        ))}
                    </div>
                    <p style={{ fontSize: '0.6rem', color: '#94a3b8', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Generado Exclusivamente Por</p>
                    <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1rem', fontWeight: 700, letterSpacing: '0.3em', color: '#475569', marginTop: '0.3rem' }}>FLORENCIA AZNAR</p>
                </div>
            </div>

            {/* ── REPORTE DEL CLIENTE (TEXTO INTEGRAL IA) ── */}
            {clientText ? (
                <div className="pdf-no-break" style={{ padding: '2.5rem 2rem', marginBottom: '1rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                        <p style={{ fontSize: '0.55rem', letterSpacing: '0.5em', fontWeight: 700, color: '#d97706', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Interpretación Integral</p>
                        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', color: '#1e293b', fontStyle: 'italic' }}>Reporte de Autoconocimiento</h2>
                        <div style={{ width: '3rem', height: '2px', background: '#d4af37', margin: '0.8rem auto 0' }}></div>
                    </div>
                    <div style={{ padding: '0 1rem' }}>
                        {formatAIReport(clientText)}
                    </div>
                </div>
            ) : (
                <div className="pdf-no-break" style={{ padding: '2.5rem 2rem', marginBottom: '1rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.85rem', lineHeight: 1.9, color: '#ef4444', fontStyle: 'italic' }}>
                        Aquí aparecerá el "Reporte Cliente". No se ha detectado el reporte. Vuelve a la página de Resultados y generalo usando el botón "Reporte Cliente" en la cabecera arriba de todo.
                    </p>
                </div>
            )}

            {/* ── PIE FINAL ── */}
            <div style={{ textAlign: 'center', padding: '2rem', borderTop: '1px solid #f1f5f9' }}>
                <p style={{ fontSize: '0.5rem', letterSpacing: '0.3em', color: '#cbd5e1', fontWeight: 700, textTransform: 'uppercase' }}>Carta Numerológica — {clientName} — Florencia Aznar</p>
            </div>
        </div>
    );

    // ═══ CONTENIDO COACHING ═══
    const coachingClientName = coachingData?.nombreCliente || 'Cliente';
    const coachingFecha = coachingData?.fecha
        ? new Date(coachingData.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })
        : new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });

    const CoachingPrintContent = () => (
        <div style={{ background: 'white', color: 'black', fontFamily: "'Manrope', sans-serif" }}>
            {/* ── PORTADA ── */}
            <div className="pdf-page-break" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: '3rem' }}>
                <div style={{ position: 'absolute', top: '2.5rem', left: '2.5rem', right: '2.5rem', bottom: '2.5rem', border: '2px solid rgba(212, 175, 55, 0.1)' }}></div>
                <div style={{ position: 'absolute', top: '4rem', right: '4rem', width: '6rem', height: '6rem', borderTop: '3px solid rgba(212, 175, 55, 0.5)', borderRight: '3px solid rgba(212, 175, 55, 0.5)', borderTopRightRadius: '3rem' }}></div>
                <div style={{ position: 'absolute', bottom: '4rem', left: '4rem', width: '6rem', height: '6rem', borderBottom: '3px solid rgba(212, 175, 55, 0.5)', borderLeft: '3px solid rgba(212, 175, 55, 0.5)', borderBottomLeftRadius: '3rem' }}></div>
                <div style={{ textAlign: 'center', position: 'relative', zIndex: 10, width: '100%', maxWidth: '80%' }}>
                    <p style={{ fontSize: '0.7rem', letterSpacing: '0.4em', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '1.5rem' }}>Resumen de Sesión &bull; Coaching Numerológico</p>
                    <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '3rem', fontStyle: 'italic', color: '#1e293b', textTransform: 'capitalize', marginBottom: '1.5rem', lineHeight: '1.3' }}>{coachingClientName.toLowerCase()}</h1>
                    <div style={{ width: '5rem', height: '2px', background: '#d4af37', margin: '0 auto 3.5rem' }}></div>
                    <p style={{ fontSize: '0.65rem', letterSpacing: '0.35em', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.6rem' }}>Fecha</p>
                    <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', color: '#d97706', fontStyle: 'italic', marginBottom: '4rem' }}>{coachingFecha}</p>
                    <p style={{ fontSize: '0.6rem', color: '#94a3b8', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Acompañamiento de</p>
                    <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1rem', fontWeight: 700, letterSpacing: '0.3em', color: '#475569', marginTop: '0.3rem' }}>FLORENCIA AZNAR</p>
                </div>
            </div>

            {/* ── SÍNTESIS ── */}
            {coachingData?.sintesis ? (
                <div className="pdf-no-break" style={{ padding: '2.5rem 2rem 1.5rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                        <p style={{ fontSize: '0.55rem', letterSpacing: '0.5em', fontWeight: 700, color: '#d97706', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Síntesis del Proceso</p>
                        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', color: '#1e293b', fontStyle: 'italic' }}>Tu Camino en Esta Etapa</h2>
                        <div style={{ width: '3rem', height: '2px', background: '#d4af37', margin: '0.8rem auto 0' }}></div>
                    </div>
                    <div style={{ padding: '0 1rem' }}>
                        {formatAIReport(coachingData.sintesis)}
                    </div>
                </div>
            ) : (
                <div className="pdf-no-break" style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.85rem', lineHeight: 1.9, color: '#ef4444', fontStyle: 'italic' }}>
                        No se ha detectado una síntesis publicada para esta sesión.
                    </p>
                </div>
            )}

            {/* ── PLAN DE ACCIÓN ── */}
            {coachingData?.acciones && coachingData.acciones.length > 0 && (
                <div className="pdf-no-break" style={{ padding: '1.5rem 2rem 2.5rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                        <p style={{ fontSize: '0.55rem', letterSpacing: '0.5em', fontWeight: 700, color: '#d97706', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Próximos Pasos</p>
                        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', color: '#1e293b', fontStyle: 'italic' }}>Plan de Acción</h2>
                        <div style={{ width: '3rem', height: '2px', background: '#d4af37', margin: '0.8rem auto 0' }}></div>
                    </div>
                    <div style={{ padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {coachingData.acciones.map((a, i) => (
                            <div key={i} className="pdf-no-break" style={{ borderLeft: '2px solid #d4af37', paddingLeft: '1rem' }}>
                                <p style={{ fontSize: '0.6rem', letterSpacing: '0.3em', fontWeight: 700, color: '#d97706', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Acción {String(i + 1).padStart(2, '0')}</p>
                                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.05rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.4rem' }}>{a.titulo}</h3>
                                <p style={{ fontSize: '0.85rem', lineHeight: 1.8, color: '#475569', textAlign: 'justify' }}>{a.descripcion}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── PIE FINAL ── */}
            <div style={{ textAlign: 'center', padding: '2rem', borderTop: '1px solid #f1f5f9' }}>
                <p style={{ fontSize: '0.5rem', letterSpacing: '0.3em', color: '#cbd5e1', fontWeight: 700, textTransform: 'uppercase' }}>Resumen de Coaching — {coachingClientName} — Florencia Aznar</p>
            </div>
        </div>
    );

    return (
        <>
            {/* ═══ PANTALLA WEB ═══ */}
            <div className="screen-only" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: '#f8fafc' }}>
                <header style={{ padding: '1.2rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #f1f5f9', flexShrink: 0, gap: '1.5rem', flexWrap: 'wrap' }}>
                    <div>
                        <h1 style={{ fontSize: '0.65rem', letterSpacing: '0.3em', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Paso Final</h1>
                        <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>
                            {activeTab === 'coaching' ? 'Exportar Resumen de Coaching' : 'Exportar Carta Numerológica'}
                        </h2>
                    </div>

                    {/* Tabs */}
                    <div style={{ display: 'inline-flex', background: '#f1f5f9', padding: '0.3rem', borderRadius: '999px', gap: '0.2rem' }}>
                        <button
                            onClick={() => setActiveTab('carta')}
                            style={{
                                padding: '0.55rem 1.2rem',
                                borderRadius: '999px',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                                background: activeTab === 'carta' ? 'white' : 'transparent',
                                color: activeTab === 'carta' ? '#1e293b' : '#64748b',
                                boxShadow: activeTab === 'carta' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                                transition: 'all 0.2s',
                            }}
                        >
                            Carta Numerológica
                        </button>
                        <button
                            onClick={() => coachingData && setActiveTab('coaching')}
                            disabled={!coachingData}
                            title={!coachingData ? 'Aún no se exportó un análisis de coaching' : ''}
                            style={{
                                padding: '0.55rem 1.2rem',
                                borderRadius: '999px',
                                border: 'none',
                                cursor: coachingData ? 'pointer' : 'not-allowed',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                                background: activeTab === 'coaching' ? 'white' : 'transparent',
                                color: activeTab === 'coaching' ? '#1e293b' : '#64748b',
                                opacity: coachingData ? 1 : 0.45,
                                boxShadow: activeTab === 'coaching' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                                transition: 'all 0.2s',
                            }}
                        >
                            Resumen de Coaching
                        </button>
                    </div>

                    <Link href={activeTab === 'coaching' ? '/historial' : '/resultados'} className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-black-accent transition-colors">
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                        Volver
                    </Link>
                </header>

                <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                    {/* Previsualización */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', background: '#e2e8f0' }}>
                        <div style={{ maxWidth: '650px', margin: '0 auto' }}>
                            <div className="pdf-preview-shadow" style={{ background: 'white', borderRadius: '2px', overflow: 'hidden' }}>
                                {activeTab === 'coaching' ? <CoachingPrintContent /> : <PrintContent />}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <aside className="screen-only" style={{ width: '20rem', borderLeft: '1px solid #f1f5f9', background: 'white', padding: '2rem', display: 'flex', flexDirection: 'column', flexShrink: 0, overflowY: 'auto' }}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.3rem' }}>Exportar Reporte</h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            <button onClick={handleDownloadPDF} className="bg-black-accent text-white font-bold hover:opacity-90 transition-all shadow-lg shadow-black/5" style={{ width: '100%', height: '3.2rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', border: 'none', cursor: 'pointer' }}>
                                Imprimir / Guardar PDF
                                <span className="material-symbols-outlined">print</span>
                            </button>

                            <div className="bg-whatsapp-green/20 rounded-2xl border border-emerald-100 overflow-hidden mt-4">
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
                {activeTab === 'coaching' ? <CoachingPrintContent /> : <PrintContent />}
            </div>
        </>
    );
}

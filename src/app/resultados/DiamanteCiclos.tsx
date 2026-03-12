'use client';

import React from 'react';

function displayNum(n: any, isDayNode: boolean = false): string {
    if (!n) return '-';
    let label = '';
    
    // Si es el nodo B (Día), forzamos a mostrar solo su valor maestro/kármico si lo tiene,
    // en lugar de mostrar la cadena completa (ej. 11/2 en vez de 29/11/2)
    if (isDayNode && (n.isMaster || n.isKarmic)) {
        label = n.isMaster ? `${n.masterValue}/${n.digit}` : `${n.karmicValue}/${n.digit}`;
    } else if (n.sequence && n.sequence.length > 1) {
        label = n.sequence.join('/');
    } else {
        label = String(n.digit);
    }

    if (n.isMaster) label += '\nMAESTRO';
    if (n.isKarmic) label += '\nKÁRMICO';
    return label;
}

export default function DiamanteCiclos({ data }: { data: any }) {
    if (!data?.ciclos || !data?.fechaNacimiento) return null;

    const A = data.fechaNacimiento.mesReduction;
    const B = data.fechaNacimiento.diaReduction;
    const C = data.fechaNacimiento.anioReduction;
    const D = data.fechaNacimiento.caminoDeVida;

    const E = data.ciclos.ciclosReduction[0];
    const F = data.ciclos.ciclosReduction[1];
    const G = data.ciclos.ciclosReduction[2];
    const H = data.ciclos.ciclosReduction[3];

    const K = data.ciclos.desafiosReduction[0];
    const L = data.ciclos.desafiosReduction[1];
    const M = data.ciclos.desafiosReduction[2];
    const N = data.ciclos.desafiosReduction[3];

    const O = data.ciclos.subconscienteO;
    const J = data.ciclos.inconsciente;
    const P = data.ciclos.sombra;

    const Q = data.ciclos.serInterior?.Q;
    const R = data.ciclos.serInterior?.R;
    const S = data.ciclos.serInterior?.S;

    const nodes = [
        { id: 'H', displayLabel: 'C4', x: 200, y: 40, label: 'H (4to Ciclo)', val: H, bg: '#ef4444', color: 'white' }, // red
        { id: 'G', displayLabel: 'C3', x: 200, y: 120, label: 'G (3er Ciclo)', val: G, bg: '#84cc16', color: 'black' }, // green
        { id: 'E', displayLabel: 'C1', x: 120, y: 200, label: 'E (1er Ciclo)', val: E, bg: '#bef264', color: 'black' }, // light green
        { id: 'F', displayLabel: 'C2', x: 280, y: 200, label: 'F (2do Ciclo)', val: F, bg: '#bef264', color: 'black' }, // light green
        
        { id: 'A', displayLabel: 'MES', x: 40, y: 300, label: 'A (Mes)', val: A, bg: '#fcd34d', color: 'black' }, // yellow
        { id: 'B', displayLabel: 'DÍA', x: 200, y: 300, label: 'B (Día)', val: B, bg: '#fbbf24', color: 'black' }, // amber
        { id: 'C', displayLabel: 'AÑO', x: 360, y: 300, label: 'C (Año)', val: C, bg: '#fcd34d', color: 'black' }, // yellow
        { id: 'D', displayLabel: 'C.VIDA', x: 440, y: 300, label: 'D (Camino)', val: D, bg: '#fde68a', color: 'black' }, // light yellow
        
        { id: 'J', displayLabel: 'INC.', x: 420, y: 120, label: 'J (Inconsc.)', val: J, bg: '#c084fc', color: 'white' }, // purple
        
        { id: 'K', displayLabel: 'D1', x: 120, y: 400, label: 'K (1er Des.)', val: K, bg: '#bae6fd', color: 'black' }, // blue
        { id: 'L', displayLabel: 'D2', x: 280, y: 400, label: 'L (2do Des.)', val: L, bg: '#bae6fd', color: 'black' }, // blue
        { id: 'O', displayLabel: 'SUB.O', x: 200, y: 400, label: 'O (Subc. O)', val: O, bg: '#f472b6', color: 'white' }, // pink
        
        { id: 'M', displayLabel: 'D3', x: 200, y: 480, label: 'M (3er Des.)', val: M, bg: '#e5e5e5', color: 'black' }, // gray
        { id: 'P', displayLabel: 'SOMBRA', x: 360, y: 480, label: 'P (Sombra)', val: P, bg: '#c084fc', color: 'white' }, // purple
        
        { id: 'N', displayLabel: 'D4', x: 200, y: 560, label: 'N (4to Des.)', val: N, bg: '#f5f5f5', color: 'black' }, // light gray
        
        { id: 'Q', displayLabel: 'Q', x: 120, y: 640, label: 'Q', val: Q, bg: '#d4a373', color: 'white' }, // brown
        { id: 'R', displayLabel: 'R', x: 200, y: 640, label: 'R', val: R, bg: '#d4a373', color: 'white' }, // brown
        { id: 'S', displayLabel: 'S', x: 280, y: 640, label: 'S', val: S, bg: '#d4a373', color: 'white' }, // brown
    ];

    const lines = [
        // Top triangle
        { from: 'H', to: 'E' }, { from: 'H', to: 'F' },
        { from: 'H', to: 'G' }, { from: 'G', to: 'E' }, { from: 'G', to: 'F' },
        // Middle connections
        { from: 'E', to: 'A' }, { from: 'E', to: 'B' },
        { from: 'F', to: 'B' }, { from: 'F', to: 'C' },
        { from: 'A', to: 'B' }, { from: 'B', to: 'C' },
        // Bottom triangles
        { from: 'A', to: 'K' }, { from: 'B', to: 'K' },
        { from: 'B', to: 'L' }, { from: 'C', to: 'L' },
        { from: 'K', to: 'O' }, { from: 'L', to: 'O' },
        { from: 'K', to: 'M' }, { from: 'L', to: 'M' },
        { from: 'M', to: 'N' },
        { from: 'N', to: 'Q' }, { from: 'N', to: 'S' },
        { from: 'Q', to: 'R' }, { from: 'R', to: 'S' },
    ];

    const dashedLines = [
        { from: 'J', to: 'H', color: '#ef4444' }, // red dotted
        { from: 'J', to: 'D', color: '#000000' }, 
        { from: 'D', to: 'C', color: '#000000' },
        { from: 'P', to: 'D', color: '#000000' },
        { from: 'P', to: 'O', color: '#000000' },
    ];

    return (
        <div className="w-full flex items-center justify-center pt-8 pb-12 overflow-x-auto">
            <div className="relative" style={{ width: '480px', height: '780px', minWidth: '480px' }}>
                <svg width="100%" height="100%" className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
                    {/* Solid Lines */}
                    {lines.map((l, i) => {
                        const n1 = nodes.find(n => n.id === l.from);
                        const n2 = nodes.find(n => n.id === l.to);
                        if (!n1 || !n2) return null;
                        return (
                            <line key={`l-${i}`} x1={n1.x} y1={n1.y} x2={n2.x} y2={n2.y} stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
                        );
                    })}
                    {/* Dashed Lines */}
                    {dashedLines.map((l, i) => {
                        const n1 = nodes.find(n => n.id === l.from);
                        const n2 = nodes.find(n => n.id === l.to);
                        if (!n1 || !n2) return null;
                        return (
                            <line key={`dl-${i}`} x1={n1.x} y1={n1.y} x2={n2.x} y2={n2.y} stroke={l.color === '#000000' ? "rgba(255,255,255,0.4)" : l.color} strokeWidth="1.5" strokeDasharray="4,4" />
                        );
                    })}
                </svg>

                {/* Nodes */}
                {nodes.map(n => {
                    const textStr = displayNum(n.val, n.id === 'B');
                    const lines = textStr.split('\n');
                    const hasSubtitle = lines.length > 1;
                    const mainText = lines[0];
                    const subtitle = hasSubtitle ? lines[1] : '';

                    const len = mainText.length;
                    let fontSize = '15px';
                    if (len > 3) fontSize = '13px';
                    if (len > 5) fontSize = '11px';
                    if (len > 7) fontSize = '9.5px';

                    return (
                        <div key={n.id} className="absolute flex flex-col items-center" style={{ left: n.x, top: n.y, transform: 'translate(-50%, -50%)', zIndex: 10 }}>
                            <div className="w-[52px] h-[52px] rounded-full flex flex-col items-center justify-center font-bold shadow-lg leading-[1.1] text-center" 
                                 style={{ backgroundColor: n.bg, color: n.color, border: '2px solid rgba(255,255,255,0.3)' }}>
                                <span style={{ fontSize }}>{mainText}</span>
                                {hasSubtitle && <span style={{ fontSize: '6px', opacity: 0.8 }}>{subtitle}</span>}
                            </div>
                            <span className="text-[10px] font-bold text-white/50 mt-1 uppercase tracking-wider">{n.displayLabel}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface ExplanationModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    num: string | number;
    precalculatedText?: string;
}

export default function AiExplanationModal({ isOpen, onClose, title, num, precalculatedText }: ExplanationModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;

        // Animation in
        gsap.set(overlayRef.current, { autoAlpha: 0 });
        gsap.set(modalRef.current, { y: 30, scale: 0.95, autoAlpha: 0 });

        const tl = gsap.timeline();
        tl.to(overlayRef.current, { autoAlpha: 1, duration: 0.3, ease: 'power2.out' })
            .to(modalRef.current, { y: 0, scale: 1, autoAlpha: 1, duration: 0.4, ease: 'back.out(1.5)' }, '-=0.1');

    }, [isOpen]);

    const handleClose = () => {
        const tl = gsap.timeline({ onComplete: onClose });
        tl.to(modalRef.current, { y: 20, scale: 0.95, autoAlpha: 0, duration: 0.3, ease: 'power2.in' })
            .to(overlayRef.current, { autoAlpha: 0, duration: 0.2 }, '-=0.2');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10005] flex items-center justify-center p-4 sm:p-6" style={{ pointerEvents: 'auto' }}>
            <div
                ref={overlayRef}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={handleClose}
            ></div>

            <div
                ref={modalRef}
                className="relative bg-white/95 backdrop-blur-xl w-full max-w-2xl rounded-[2.5rem] p-8 md:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-white max-h-[85vh] flex flex-col overflow-hidden"
            >
                {/* Header elements */}
                <div className="flex justify-between items-start mb-6 shrink-0 gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-500 shadow-inner">
                            <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                        </div>
                        <div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-1">
                                Significado Profundo
                            </h3>
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none">
                                {title} <span className="text-slate-400 font-light ml-2">{num}</span>
                            </h2>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>

                {/* Content area */}
                <div
                    ref={contentRef}
                    className="flex-1 overflow-y-auto pr-2 custom-scrollbar styling-text relative"
                >
                    {!precalculatedText ? (
                        <div className="py-8 text-center text-slate-400 font-medium">
                            <span className="material-symbols-outlined text-4xl mb-2 opacity-50">hourglass_empty</span>
                            <p>No se pudo generar la explicación para este concepto.</p>
                        </div>
                    ) : (
                        <div className="text-slate-600 space-y-4 text-[15px] leading-relaxed font-medium">
                            {precalculatedText.split('\n').map((paragraph, index) => {
                                if (!paragraph.trim()) return <br key={index} />;

                                // Make capitalized headers bold
                                const isHeader = paragraph === paragraph.toUpperCase() && paragraph.length < 50;
                                if (isHeader) {
                                    return <h4 key={index} className="text-xs font-black uppercase tracking-widest text-slate-800 mt-6 mb-2">{paragraph}</h4>;
                                }

                                return <p key={index}>{paragraph}</p>;
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

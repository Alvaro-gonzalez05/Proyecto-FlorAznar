'use client';

import React, { useEffect, useState } from 'react';
import { gsap } from 'gsap';

interface EditableReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialText: string;
    onRegenerate?: () => void;
    isLoading?: boolean;
    onChange?: (text: string) => void;
}

export default function EditableReportModal({ isOpen, onClose, initialText, onRegenerate, isLoading, onChange }: EditableReportModalProps) {
    const [text, setText] = useState(initialText);

    useEffect(() => {
        setText(initialText);
    }, [initialText]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('clientReportEdited', text);
        }
        if (onChange) onChange(text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [text]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            gsap.fromTo(
                '#editable-modal-overlay',
                { opacity: 0 },
                { opacity: 1, duration: 0.3, ease: 'power2.out' }
            );
            gsap.fromTo(
                '#editable-modal-content',
                { y: 50, opacity: 0, scale: 0.95 },
                { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.2)', delay: 0.1 }
            );
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    const handleClose = () => {
        gsap.to('#editable-modal-content', {
            y: 30,
            opacity: 0,
            scale: 0.95,
            duration: 0.3,
            ease: 'power2.in'
        });
        gsap.to('#editable-modal-overlay', {
            opacity: 0,
            duration: 0.3,
            ease: 'power2.in',
            onComplete: onClose
        });
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        alert('Reporte copiado al portapapeles!');
    };

    if (!isOpen) return null;

    return (
        <div id="editable-modal-overlay" className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md">
            <div
                id="editable-modal-content"
                className="bg-white rounded-[2rem] w-full max-w-5xl h-[85vh] max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="material-symbols-outlined text-indigo-500">edit_document</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-800 tracking-tight">Reporte para el Cliente</h2>
                            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mt-1">Puedes editar este texto antes de enviarlo</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        {onRegenerate && (
                            <button
                                onClick={onRegenerate}
                                disabled={isLoading}
                                className="bg-purple-100 hover:bg-purple-200 text-purple-600 p-2 md:px-6 md:py-2 rounded-full font-bold text-xs md:text-sm tracking-widest uppercase transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                            >
                                <span className={`material-symbols-outlined text-sm hidden md:block ${isLoading ? 'animate-spin' : ''}`}>sync</span>
                                {isLoading ? 'Generando...' : 'Regenerar'}
                            </button>
                        )}
                        <button
                            onClick={handleCopy}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 md:px-6 md:py-2 rounded-full font-bold text-xs md:text-sm tracking-widest uppercase transition-all shadow-md flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-sm hidden md:block">content_copy</span>
                            Copiar
                        </button>
                        <button
                            onClick={handleClose}
                            className="w-10 h-10 rounded-full bg-white text-slate-400 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 flex items-center justify-center transition-all"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-hidden p-6 bg-slate-50 relative">
                    {isLoading && (
                        <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-sm flex items-center justify-center">
                            <div className="flex flex-col items-center">
                                <span className="material-symbols-outlined text-4xl mb-4 animate-spin-slow opacity-60 text-purple-500">sync</span>
                                <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Generando nuevo reporte...</p>
                            </div>
                        </div>
                    )}
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        disabled={isLoading}
                        className="w-full h-full bg-white border border-slate-200 rounded-2xl p-6 text-slate-700 text-[15px] leading-relaxed focus:ring-2 focus:ring-indigo-300 focus:outline-none transition-shadow shadow-sm resize-none custom-scrollbar disabled:opacity-50"
                    />
                </div>
            </div>
        </div>
    );
}

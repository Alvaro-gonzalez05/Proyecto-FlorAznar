'use client';

import { useEffect, useRef, ReactNode } from 'react';
import { gsap } from 'gsap';

interface TemplateProps {
    children: ReactNode;
}

export default function Template({ children }: TemplateProps) {
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!contentRef.current) return;

        // El CSS ya lo tiene invisible, solo animamos la entrada
        const ctx = gsap.context(() => {
            gsap.to(contentRef.current, {
                opacity: 1,
                y: 0,
                duration: 0.4,
                ease: 'power2.out',
                delay: 0.35, // Esperar a que termine la salida
            });
        });

        return () => ctx.revert();
    }, []);

    return (
        <div ref={contentRef} className="page-transition-wrapper">
            {children}
        </div>
    );
}

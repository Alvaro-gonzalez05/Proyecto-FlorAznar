'use client';

import { useEffect, useRef, ReactNode, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { gsap } from 'gsap';

interface PageTransitionProps {
    children: ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
    const contentRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();
    const [displayChildren, setDisplayChildren] = useState(children);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (!contentRef.current) return;

        // Si la ruta cambió, animar salida y luego entrada
        if (children !== displayChildren && !isAnimating) {
            setIsAnimating(true);

            // Animación de SALIDA
            gsap.to(contentRef.current, {
                opacity: 0,
                y: -20,
                duration: 0.3,
                ease: 'power2.in',
                onComplete: () => {
                    // Actualizar contenido
                    setDisplayChildren(children);

                    // Scroll al inicio
                    window.scrollTo(0, 0);

                    // Animación de ENTRADA
                    gsap.fromTo(
                        contentRef.current,
                        {
                            opacity: 0,
                            y: 20,
                        },
                        {
                            opacity: 1,
                            y: 0,
                            duration: 0.4,
                            ease: 'power3.out',
                            onComplete: () => {
                                setIsAnimating(false);
                            },
                        }
                    );
                },
            });
        } else if (!isAnimating) {
            // Primera carga - solo entrada
            gsap.fromTo(
                contentRef.current,
                {
                    opacity: 0,
                    y: 20,
                },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.4,
                    delay: 0.1,
                    ease: 'power3.out',
                }
            );
        }
    }, [children, displayChildren, isAnimating]);

    return (
        <div ref={contentRef} style={{ opacity: 0 }}>
            {displayChildren}
        </div>
    );
}

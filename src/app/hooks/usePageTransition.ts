'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { gsap } from 'gsap';

export function usePageTransition() {
    const pathname = usePathname();
    const contentRef = useRef<HTMLDivElement>(null);
    const previousPathname = useRef<string>(pathname);

    useEffect(() => {
        if (!contentRef.current) return;

        // Si la ruta cambió, hacer animación de entrada
        if (previousPathname.current !== pathname) {
            const ctx = gsap.context(() => {
                gsap.fromTo(
                    contentRef.current,
                    {
                        opacity: 0,
                        y: 20,
                    },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.5,
                        ease: 'power3.out',
                    }
                );
            });

            previousPathname.current = pathname;

            return () => ctx.revert();
        }
    }, [pathname]);

    return contentRef;
}

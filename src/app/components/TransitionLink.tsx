'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { MouseEvent, ReactNode, useState } from 'react';
import { gsap } from 'gsap';

interface TransitionLinkProps {
    href: string;
    children: ReactNode;
    className?: string;
    onClick?: () => void;
}

export default function TransitionLink({ href, children, className, onClick }: TransitionLinkProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [isTransitioning, setIsTransitioning] = useState(false);

    const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();

        // Si ya estamos en esta ruta o ya hay una transición en curso, no hacer nada
        if (pathname === href || isTransitioning) return;

        setIsTransitioning(true);

        // Ejecutar onClick si existe
        if (onClick) onClick();

        // Buscar el contenedor de la página usando la clase específica
        const pageContent = document.querySelector('.page-transition-wrapper');

        // Buscar el sidebar derecho (solo visible en home)
        const rightSidebar = document.querySelector('aside.xl\\:flex.w-80');

        if (pageContent) {
            // Crear timeline para mejor control
            const timeline = gsap.timeline({
                onComplete: () => {
                    // Navegar después de la animación
                    router.push(href);
                    setIsTransitioning(false);
                },
            });

            // Animar contenido principal
            timeline.to(pageContent, {
                opacity: 0,
                y: -20,
                duration: 0.3,
                ease: 'power2.in',
            }, 0); // Comienza en tiempo 0

            // Si estamos en home y el sidebar derecho existe, animarlo también
            if (pathname === '/' && rightSidebar) {
                timeline.to(rightSidebar, {
                    x: 50,
                    opacity: 0,
                    duration: 0.3,
                    ease: 'power2.in',
                }, 0); // Comienza al mismo tiempo que el contenido (tiempo 0)
            }
        } else {
            // Si no hay contenedor, navegar directamente
            router.push(href);
            setIsTransitioning(false);
        }
    };

    return (
        <Link
            href={href}
            onClick={handleClick}
            className={className}
            style={{ pointerEvents: isTransitioning ? 'none' : 'auto' }}
        >
            {children}
        </Link>
    );
}

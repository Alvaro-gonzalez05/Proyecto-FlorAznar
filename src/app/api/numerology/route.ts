import { NextRequest, NextResponse } from 'next/server';
import { calcularEstructura } from '@/lib/numerology';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { nombreCompleto, fechaNacimiento, apellidosCompletos, anioActual, mesActual } = body;

        // Validación básica
        if (!nombreCompleto || typeof nombreCompleto !== 'string' || nombreCompleto.trim().length === 0) {
            return NextResponse.json(
                { error: 'El nombre completo es requerido' },
                { status: 400 }
            );
        }

        if (!fechaNacimiento || typeof fechaNacimiento !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(fechaNacimiento)) {
            return NextResponse.json(
                { error: 'La fecha de nacimiento es requerida (formato YYYY-MM-DD)' },
                { status: 400 }
            );
        }

        const apCompletos = Array.isArray(apellidosCompletos) ? apellidosCompletos : [];
        const yActual = typeof anioActual === 'number' ? anioActual : new Date().getFullYear();
        const mActual = typeof mesActual === 'number' ? mesActual : new Date().getMonth() + 1;

        const result = calcularEstructura(
            nombreCompleto.trim(),
            fechaNacimiento,
            apCompletos,
            yActual,
            mActual
        );

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error en cálculo numerológico:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}

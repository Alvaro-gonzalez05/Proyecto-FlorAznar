import { NextRequest, NextResponse } from 'next/server';
import { calculateNumerology } from '@/lib/numerology';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { nombreCompleto, fechaNacimiento } = body;

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

        const result = calculateNumerology(nombreCompleto.trim(), fechaNacimiento);

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error en cálculo numerológico:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}

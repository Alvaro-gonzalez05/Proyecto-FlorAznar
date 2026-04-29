import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
        return NextResponse.json({ error: 'sessionId requerido' }, { status: 400 });
    }

    try {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { cookies: { getAll() { return cookieStore.getAll(); }, setAll() {} } }
        );

        const { data: session, error } = await supabase
            .from('coaching_sessions')
            .select('*')
            .eq('id', sessionId)
            .single();

        if (error || !session) {
            return NextResponse.json({ error: 'Sesión no encontrada' }, { status: 404 });
        }

        return NextResponse.json({ session });
    } catch (err) {
        console.error('Error fetching session for PDF:', err);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}

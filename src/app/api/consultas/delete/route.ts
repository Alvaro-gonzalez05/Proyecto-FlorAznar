import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { id } = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        console.log("Infra Debug - URL exists:", !!supabaseUrl);
        console.log("Infra Debug - Key exists:", !!supabaseServiceKey);
        if (supabaseServiceKey) {
            console.log("Infra Debug - Key starts with:", supabaseServiceKey.substring(0, 5));
        }

        if (!supabaseUrl || !supabaseServiceKey) {
            return NextResponse.json({
                error: 'Supabase config missing',
                details: { url: !!supabaseUrl, key: !!supabaseServiceKey }
            }, { status: 500 });
        }

        // Usamos SERVICE_ROLE_KEY para saltar RLS en el servidor
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        const { error } = await supabaseAdmin
            .from('consultas')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Delete error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error('API Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

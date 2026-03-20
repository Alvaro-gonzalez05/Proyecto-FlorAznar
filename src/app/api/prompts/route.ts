import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { DEFAULT_PROMPTS } from '@/lib/defaultPrompts';

export async function GET() {
    try {
        const { data, error } = await supabase.from('prompts').select('*');
        if (error) {
            console.error('Error fetching prompts from Supabase:', error);
            // If table doesn't exist or other error, fallback to defaults
            return NextResponse.json({ prompts: DEFAULT_PROMPTS });
        }

        const promptsDict: Record<string, string> = { ...DEFAULT_PROMPTS };
        data?.forEach((row) => {
            if (row.id && row.prompt_text) {
                promptsDict[row.id] = row.prompt_text;
            }
        });

        return NextResponse.json({ prompts: promptsDict });
    } catch (err) {
        return NextResponse.json({ prompts: DEFAULT_PROMPTS });
    }
}

export async function POST(request: Request) {
    try {
        const { id, prompt_text } = await request.json();

        if (!id || !prompt_text) {
            return NextResponse.json({ error: 'Faltan campos' }, { status: 400 });
        }

        const { error } = await supabase.from('prompts').upsert({
            id,
            prompt_text,
            updated_at: new Date().toISOString()
        });

        if (error) {
            console.error('Error saving prompt to Supabase:', error);
            return NextResponse.json({ error: 'No se pudo guardar en base de datos. Asegúrate de ejecutar el script SQL de creación de tabla ' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

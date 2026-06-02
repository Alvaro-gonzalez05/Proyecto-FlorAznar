import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { DEFAULT_LANDING_CONTENT } from '@/lib/landing-content';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('landing_content')
      .select('content')
      .eq('id', 1)
      .single();

    if (error || !data) {
      return NextResponse.json(DEFAULT_LANDING_CONTENT);
    }

    return NextResponse.json({ ...DEFAULT_LANDING_CONTENT, ...data.content });
  } catch {
    return NextResponse.json(DEFAULT_LANDING_CONTENT);
  }
}

export async function POST(request: Request) {
  try {
    const content = await request.json();

    const { error } = await supabase
      .from('landing_content')
      .upsert({ id: 1, content, updated_at: new Date().toISOString() });

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

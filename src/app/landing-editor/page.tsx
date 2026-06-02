'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { DEFAULT_LANDING_CONTENT, LandingContent } from '@/lib/landing-content';

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };

// ── Editable field ──────────────────────────────────────────────
function EditableField({
  value,
  onChange,
  multiline = false,
  className = '',
  placeholder = '',
}: {
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  className?: string;
  placeholder?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLTextAreaElement & HTMLInputElement>(null);

  useEffect(() => { setDraft(value); }, [value]);

  const commit = useCallback(() => {
    setEditing(false);
    if (draft !== value) onChange(draft);
  }, [draft, value, onChange]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { setDraft(value); setEditing(false); }
    if (!multiline && e.key === 'Enter') { e.preventDefault(); commit(); }
    if (multiline && e.key === 'Enter' && e.ctrlKey) commit();
  };

  if (editing) {
    const shared = {
      ref,
      value: draft,
      onChange: (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => setDraft(e.target.value),
      onBlur: commit,
      onKeyDown: handleKey,
      autoFocus: true,
      className: `w-full bg-[#fdf6f0] border border-[#9a3412]/40 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#9a3412]/30 resize-none ${className}`,
    };
    return multiline
      ? <textarea {...shared} rows={4} />
      : <input {...shared} type="text" />;
  }

  return (
    <div
      onDoubleClick={() => setEditing(true)}
      title="Doble click para editar"
      className={`cursor-text group relative rounded-lg px-2 py-1 -mx-2 -my-1 hover:bg-[#9a3412]/5 transition-colors ${className}`}
    >
      <span className="whitespace-pre-wrap">{value || placeholder}</span>
      <span className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="material-symbols-outlined text-[#9a3412] text-sm">edit</span>
      </span>
    </div>
  );
}

// ── Section card ────────────────────────────────────────────────
function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <span className="material-symbols-outlined text-[#9a3412] text-xl">{icon}</span>
        <h2 className="font-bold text-sm uppercase tracking-widest text-slate-700">{title}</h2>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-[0.65rem] uppercase tracking-widest font-bold text-slate-400">{label}</p>
      {children}
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────────
export default function LandingEditorPage() {
  const [content, setContent] = useState<LandingContent>(DEFAULT_LANDING_CONTENT);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch('/api/landing-content')
      .then(r => r.json())
      .then(data => { setContent(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const update = useCallback((section: keyof LandingContent, field: string, value: string) => {
    setContent(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));

    // Auto-save with debounce
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      try {
        const updated = { ...content, [section]: { ...content[section], [field]: value } };
        await fetch('/api/landing-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated),
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } finally {
        setSaving(false);
      }
    }, 800);
  }, [content]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-[#9a3412] border-t-transparent animate-spin" />
          <p className="text-sm text-slate-400">Cargando contenido...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf7f4] pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-100 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#9a3412]">web</span>
          <div>
            <h1 className="font-bold text-base text-[#1a1a1a]">Editor de Landing</h1>
            <p className="text-xs text-slate-400">Doble click en cualquier texto para editarlo</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {saving && (
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm animate-spin">sync</span> Guardando...
            </span>
          )}
          {saved && (
            <span className="text-xs text-[#9a3412] flex items-center gap-1 font-bold">
              <span className="material-symbols-outlined text-sm">check_circle</span> Guardado
            </span>
          )}
          <a href="/" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs font-bold bg-[#9a3412] text-white rounded-full px-4 py-2 hover:bg-[#7c2d12] transition-colors">
            <span className="material-symbols-outlined text-sm">open_in_new</span>
            Ver landing
          </a>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">

        {/* HERO */}
        <Section title="Hero — Inicio" icon="home">
          <Field label="Badge">
            <EditableField value={content.hero.badge} onChange={v => update('hero', 'badge', v)} className="text-xs font-bold text-[#9a3412]" />
          </Field>
          <Field label="Título principal">
            <EditableField value={content.hero.title} onChange={v => update('hero', 'title', v)} className="text-2xl font-light" />
          </Field>
          <Field label="Subtítulo">
            <EditableField value={content.hero.subtitle} onChange={v => update('hero', 'subtitle', v)} multiline className="text-sm text-slate-500" />
          </Field>
        </Section>

        {/* RAP */}
        <Section title="Método RAP — Las 3 Fases" icon="psychology">
          {(['r', 'a', 'p'] as const).map((key) => {
            const labels = { r: 'R — Revelar', a: 'A — Avanzar', p: 'P — Potenciar' };
            return (
              <div key={key} className="border border-slate-100 rounded-2xl p-4 space-y-3">
                <p className="text-[0.65rem] font-bold uppercase tracking-widest text-[#9a3412]">{labels[key]}</p>
                <Field label="Etiqueta">
                  <EditableField value={content.rap[`${key}_label` as keyof typeof content.rap]} onChange={v => update('rap', `${key}_label`, v)} className="text-xs font-bold" />
                </Field>
                <Field label="Título de la card">
                  <EditableField value={content.rap[`${key}_title` as keyof typeof content.rap]} onChange={v => update('rap', `${key}_title`, v)} className="font-bold text-sm" />
                </Field>
                <Field label="Descripción">
                  <EditableField value={content.rap[`${key}_desc` as keyof typeof content.rap]} onChange={v => update('rap', `${key}_desc`, v)} multiline className="text-sm text-slate-500" />
                </Field>
              </div>
            );
          })}
        </Section>

        {/* LIBRO */}
        <Section title="Libro — Volver al Origen" icon="menu_book">
          <Field label="Título">
            <EditableField value={content.libro.title} onChange={v => update('libro', 'title', v)} className="text-2xl font-light" />
          </Field>
          <Field label="Descripción">
            <EditableField value={content.libro.desc} onChange={v => update('libro', 'desc', v)} multiline className="text-sm text-slate-500" />
          </Field>
        </Section>

        {/* PRECIO */}
        <Section title="Inversión — Precio" icon="payments">
          <Field label="Precio">
            <EditableField value={content.precio.price} onChange={v => update('precio', 'price', v)} className="text-4xl font-extrabold" />
          </Field>
          <Field label="Subtítulo del precio">
            <EditableField value={content.precio.subtitle} onChange={v => update('precio', 'subtitle', v)} className="text-sm text-slate-500" />
          </Field>
          <Field label="Nota bajo el botón">
            <EditableField value={content.precio.note} onChange={v => update('precio', 'note', v)} className="text-sm text-slate-500" />
          </Field>
          <Field label="Cita final (Enter para nueva línea)">
            <EditableField value={content.precio.quote} onChange={v => update('precio', 'quote', v)} multiline className="text-sm italic text-slate-500" />
          </Field>
        </Section>

        {/* CTA */}
        <Section title="CTA — Cierre" icon="chat">
          <Field label="Título">
            <EditableField value={content.cta.title} onChange={v => update('cta', 'title', v)} className="text-2xl font-light" />
          </Field>
          <Field label="Subtítulo">
            <EditableField value={content.cta.subtitle} onChange={v => update('cta', 'subtitle', v)} multiline className="text-sm text-slate-500" />
          </Field>
        </Section>

        {/* ABOUT */}
        <Section title="Sobre Flor" icon="person">
          {(['p1', 'p2', 'p3', 'p4'] as const).map((key, i) => (
            <Field key={key} label={`Párrafo ${i + 1}`}>
              <EditableField value={content.about[key]} onChange={v => update('about', key, v)} multiline className="text-sm text-slate-500" />
            </Field>
          ))}
        </Section>

        <p className="text-center text-xs text-slate-400 pt-4">Los cambios se guardan automáticamente y se reflejan en la landing al instante.</p>
      </div>
    </div>
  );
}

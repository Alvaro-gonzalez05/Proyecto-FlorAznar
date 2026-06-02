'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { DEFAULT_LANDING_CONTENT, LandingContent } from '@/lib/landing-content';

// ── Editable field ──────────────────────────────────────────────
function EditableField({
  value,
  onChange,
  multiline = false,
  className = '',
}: {
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => { if (!editing) setDraft(value); }, [value, editing]);

  const commit = () => {
    setEditing(false);
    if (draft.trim() !== value.trim()) onChange(draft);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { setDraft(value); setEditing(false); }
    if (!multiline && e.key === 'Enter') { e.preventDefault(); commit(); }
    if (multiline && e.key === 'Enter' && (e.ctrlKey || e.metaKey)) commit();
  };

  if (editing) {
    const base = `w-full bg-white border-2 border-[#9a3412]/50 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#9a3412] transition-colors ${className}`;
    return multiline
      ? <textarea className={`${base} resize-none`} rows={4} value={draft}
          onChange={e => setDraft(e.target.value)} onBlur={commit} onKeyDown={handleKey} autoFocus />
      : <input className={base} type="text" value={draft}
          onChange={e => setDraft(e.target.value)} onBlur={commit} onKeyDown={handleKey} autoFocus />;
  }

  return (
    <div
      onDoubleClick={() => setEditing(true)}
      onClick={() => setEditing(true)}
      title="Tocá para editar"
      className={`cursor-text group relative rounded-lg px-2 py-1.5 -mx-2 hover:bg-[#9a3412]/8 hover:outline hover:outline-1 hover:outline-[#9a3412]/25 transition-all ${className}`}
    >
      <span className="whitespace-pre-wrap">{value || <span className="text-slate-300 italic">Vacío</span>}</span>
      <span className="absolute -top-1.5 -right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-[#9a3412] text-white text-[0.55rem] px-1.5 py-0.5 rounded-full font-bold tracking-wide">
        editar
      </span>
    </div>
  );
}

// ── Section card ────────────────────────────────────────────────
function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/60">
        <span className="material-symbols-outlined text-[#9a3412]">{icon}</span>
        <h2 className="font-bold text-sm uppercase tracking-widest text-slate-600">{title}</h2>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <p className="text-[0.65rem] uppercase tracking-widest font-bold text-slate-400">{label}</p>
        {hint && <p className="text-[0.6rem] text-slate-300">{hint}</p>}
      </div>
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
  const [error, setError] = useState('');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contentRef = useRef<LandingContent>(DEFAULT_LANDING_CONTENT);

  // Keep ref always up to date
  useEffect(() => { contentRef.current = content; }, [content]);

  useEffect(() => {
    fetch('/api/landing-content')
      .then(r => r.json())
      .then(data => {
        const merged = { ...DEFAULT_LANDING_CONTENT, ...data };
        setContent(merged);
        contentRef.current = merged;
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Save using ref so we always send the latest full content
  const triggerSave = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      setError('');
      try {
        const res = await fetch('/api/landing-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(contentRef.current),
        });
        if (!res.ok) throw new Error('Error al guardar');
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } catch (e) {
        setError('No se pudo guardar. Revisá la tabla en Supabase.');
      } finally {
        setSaving(false);
      }
    }, 600);
  }, []);

  const update = useCallback((section: keyof LandingContent, field: string, value: string) => {
    setContent(prev => {
      const next = { ...prev, [section]: { ...(prev[section] as object), [field]: value } } as LandingContent;
      contentRef.current = next;
      return next;
    });
    triggerSave();
  }, [triggerSave]);

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-[#faf7f4]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#9a3412] border-t-transparent animate-spin" />
        <p className="text-xs text-slate-400">Cargando contenido...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#faf7f4] pb-24">

      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-100 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#9a3412] flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-sm">web</span>
          </div>
          <div>
            <h1 className="font-bold text-sm text-[#1a1a1a]">Editor de Landing</h1>
            <p className="text-[0.65rem] text-slate-400">Tocá cualquier texto para editarlo · Se guarda automáticamente</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
          {saving && (
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm" style={{animation:'spin 1s linear infinite'}}>sync</span>
              Guardando...
            </span>
          )}
          {saved && !saving && (
            <span className="text-xs text-[#9a3412] flex items-center gap-1.5 font-bold">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              Guardado
            </span>
          )}
          <a href="/" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-bold bg-[#9a3412] text-white rounded-full px-4 py-2 hover:bg-[#7c2d12] transition-colors">
            <span className="material-symbols-outlined text-sm">open_in_new</span>
            Ver landing
          </a>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-7 space-y-5">

        {/* HERO */}
        <Section title="Hero — Inicio" icon="home">
          <Field label="Badge superior">
            <EditableField value={content.hero.badge} onChange={v => update('hero', 'badge', v)}
              className="text-xs font-bold text-[#9a3412] uppercase tracking-widest" />
          </Field>
          <Field label="Título principal">
            <EditableField value={content.hero.title} onChange={v => update('hero', 'title', v)}
              className="text-xl font-light" />
          </Field>
          <Field label="Subtítulo" hint="(texto debajo del título)">
            <EditableField value={content.hero.subtitle} onChange={v => update('hero', 'subtitle', v)}
              multiline className="text-sm text-slate-500 leading-relaxed" />
          </Field>
        </Section>

        {/* RAP */}
        <Section title="Método RAP — Las 3 Fases" icon="psychology">
          {([
            { key: 'r', label: 'R — Revelar' },
            { key: 'a', label: 'A — Avanzar' },
            { key: 'p', label: 'P — Potenciar' },
          ] as const).map(({ key, label }) => (
            <div key={key} className="border border-slate-100 rounded-2xl p-4 space-y-3 bg-slate-50/30">
              <p className="text-[0.6rem] font-bold uppercase tracking-widest text-[#9a3412]">{label}</p>
              <Field label="Etiqueta">
                <EditableField
                  value={content.rap[`${key}_label` as keyof LandingContent['rap']]}
                  onChange={v => update('rap', `${key}_label`, v)}
                  className="text-xs font-bold" />
              </Field>
              <Field label="Título de la card">
                <EditableField
                  value={content.rap[`${key}_title` as keyof LandingContent['rap']]}
                  onChange={v => update('rap', `${key}_title`, v)}
                  className="font-bold text-sm" />
              </Field>
              <Field label="Descripción">
                <EditableField
                  value={content.rap[`${key}_desc` as keyof LandingContent['rap']]}
                  onChange={v => update('rap', `${key}_desc`, v)}
                  multiline className="text-sm text-slate-500 leading-relaxed" />
              </Field>
            </div>
          ))}
        </Section>

        {/* LIBRO */}
        <Section title="Libro — Volver al Origen" icon="menu_book">
          <Field label="Título del libro">
            <EditableField value={content.libro.title} onChange={v => update('libro', 'title', v)}
              className="text-xl font-light" />
          </Field>
          <Field label="Descripción">
            <EditableField value={content.libro.desc} onChange={v => update('libro', 'desc', v)}
              multiline className="text-sm text-slate-500 leading-relaxed" />
          </Field>
        </Section>

        {/* PRECIO */}
        <Section title="Inversión — Precio" icon="payments">
          <Field label="Precio">
            <EditableField value={content.precio.price} onChange={v => update('precio', 'price', v)}
              className="text-3xl font-extrabold" />
          </Field>
          <Field label="Subtítulo del precio">
            <EditableField value={content.precio.subtitle} onChange={v => update('precio', 'subtitle', v)}
              className="text-sm text-slate-500" />
          </Field>
          <Field label="Nota bajo el botón">
            <EditableField value={content.precio.note} onChange={v => update('precio', 'note', v)}
              className="text-sm text-slate-500" />
          </Field>
          <Field label="Cita final" hint="(Ctrl+Enter para guardar)">
            <EditableField value={content.precio.quote} onChange={v => update('precio', 'quote', v)}
              multiline className="text-sm italic text-slate-500 leading-relaxed" />
          </Field>
        </Section>

        {/* CTA */}
        <Section title="Cierre — ¿Iniciamos la conversación?" icon="chat">
          <Field label="Título">
            <EditableField value={content.cta.title} onChange={v => update('cta', 'title', v)}
              className="text-xl font-light" />
          </Field>
          <Field label="Subtítulo">
            <EditableField value={content.cta.subtitle} onChange={v => update('cta', 'subtitle', v)}
              multiline className="text-sm text-slate-500 leading-relaxed" />
          </Field>
        </Section>

        {/* ABOUT */}
        <Section title="Sobre Flor" icon="person">
          {(['p1', 'p2', 'p3', 'p4'] as const).map((key, i) => (
            <Field key={key} label={`Párrafo ${i + 1}`}>
              <EditableField value={content.about[key]} onChange={v => update('about', key, v)}
                multiline className="text-sm text-slate-500 leading-relaxed" />
            </Field>
          ))}
        </Section>

        <div className="flex items-center justify-center gap-2 pt-2 text-xs text-slate-300">
          <span className="material-symbols-outlined text-sm">auto_save</span>
          Los cambios se guardan solos y aparecen en la landing inmediatamente.
        </div>

      </div>
    </div>
  );
}

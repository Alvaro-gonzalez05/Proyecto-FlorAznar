'use client';

import React from 'react';

interface MarkdownTextProps {
    text: string;
    /** Tailwind classes for the wrapper. Defaults to slate-700 body text. */
    className?: string;
    /** Optional class overrides for headings/paragraphs/lists. */
    classes?: {
        h2?: string;
        h3?: string;
        p?: string;
        ul?: string;
        li?: string;
        strong?: string;
    };
}

/**
 * Lightweight markdown renderer that handles the subset our AI returns:
 * - `## ` → h2
 * - `### ` → h3
 * - `- ` / `* ` → bulleted list (consecutive lines grouped into one <ul>)
 * - `**text**` → bold inline
 * - blank lines → paragraph break
 */
export default function MarkdownText({ text, className, classes }: MarkdownTextProps) {
    const cls = {
        h2: classes?.h2 ?? 'text-[11px] font-black uppercase tracking-[0.18em] text-indigo-600 mt-6 mb-2',
        h3: classes?.h3 ?? 'text-sm font-bold text-slate-700 mt-4 mb-1',
        p: classes?.p ?? 'mb-3 leading-relaxed',
        ul: classes?.ul ?? 'list-disc list-outside pl-5 space-y-2 my-3 marker:text-indigo-400',
        li: classes?.li ?? 'leading-relaxed',
        strong: classes?.strong ?? 'font-bold text-slate-800',
    };

    const renderInline = (raw: string, keyPrefix: string) => {
        const parts = raw.split(/(\*\*[^*]+\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return (
                    <strong key={`${keyPrefix}-b-${i}`} className={cls.strong}>
                        {part.slice(2, -2)}
                    </strong>
                );
            }
            return <span key={`${keyPrefix}-t-${i}`}>{part}</span>;
        });
    };

    const lines = (text || '').split('\n');
    const elements: React.ReactNode[] = [];
    let bulletBuffer: string[] = [];

    const flushBullets = (idx: number) => {
        if (bulletBuffer.length === 0) return;
        elements.push(
            <ul key={`ul-${idx}`} className={cls.ul}>
                {bulletBuffer.map((b, i) => (
                    <li key={`li-${idx}-${i}`} className={cls.li}>
                        {renderInline(b, `li-${idx}-${i}`)}
                    </li>
                ))}
            </ul>
        );
        bulletBuffer = [];
    };

    lines.forEach((rawLine, idx) => {
        const trimmed = rawLine.trim();

        if (/^[-*]\s+/.test(trimmed)) {
            bulletBuffer.push(trimmed.replace(/^[-*]\s+/, ''));
            return;
        }
        flushBullets(idx);

        if (!trimmed) return;

        if (trimmed.startsWith('### ')) {
            elements.push(
                <h5 key={idx} className={cls.h3}>
                    {renderInline(trimmed.slice(4), `h5-${idx}`)}
                </h5>
            );
            return;
        }
        if (trimmed.startsWith('## ')) {
            elements.push(
                <h4 key={idx} className={cls.h2}>
                    {renderInline(trimmed.slice(3), `h4-${idx}`)}
                </h4>
            );
            return;
        }
        if (trimmed.startsWith('# ')) {
            elements.push(
                <h3 key={idx} className={cls.h2}>
                    {renderInline(trimmed.slice(2), `h3-${idx}`)}
                </h3>
            );
            return;
        }

        elements.push(
            <p key={idx} className={cls.p}>
                {renderInline(trimmed, `p-${idx}`)}
            </p>
        );
    });

    flushBullets(lines.length);

    return <div className={className}>{elements}</div>;
}

/**
 * numerologyDocs.ts
 *
 * Cache de dos capas para los archivos de bibliografía numerológica:
 *
 *  1. TEXT CACHE (module-level)
 *     Lee los .txt del disco UNA sola vez por proceso de servidor.
 *     Elimina el I/O repetido en cada request.
 *
 *  2. FILES API CACHE (module-level, 47h TTL)
 *     Sube los archivos a la Files API de Gemini una vez y guarda las URIs.
 *     Cada llamada a Gemini recibe las URIs en vez del texto completo,
 *     ahorrando ~57K tokens de entrada por request.
 *     Si el upload falla, hace fallback al texto inline automáticamente.
 */

import fs from 'fs/promises';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

// ── Global-level caches (persisten en el objeto global de Node, sobreviven
//    los hot-reloads de Next.js y son compartidos entre todas las rutas API) ──

interface FileUriCache {
    uri1: string;
    uri2: string;
    expiresAt: number; // Date.now() ms
}

declare global {
    // eslint-disable-next-line no-var
    var __numDocs_textCache: { file1: string; file2: string } | undefined;
    // eslint-disable-next-line no-var
    var __numDocs_fileUriCache: FileUriCache | undefined;
    // eslint-disable-next-line no-var
    var __numDocs_uploadPromise: Promise<{ uri1: string; uri2: string }> | undefined;
    // eslint-disable-next-line no-var
    var __numDocs_ai: GoogleGenAI | undefined;
}

function getSharedAi(): GoogleGenAI {
    if (!global.__numDocs_ai) {
        global.__numDocs_ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    }
    return global.__numDocs_ai;
}

// ── Capa 1: texto cacheado ───────────────────────────────────────────────────

async function getTexts(): Promise<{ file1: string; file2: string }> {
    if (!global.__numDocs_textCache) {
        const [file1, file2] = await Promise.all([
            fs.readFile(path.join(process.cwd(), 'informacionParte1.txt'), 'utf8').catch(() => ''),
            fs.readFile(path.join(process.cwd(), 'informacionParte2.txt'), 'utf8').catch(() => ''),
        ]);
        global.__numDocs_textCache = { file1, file2 };
    }
    return global.__numDocs_textCache;
}

/** Devuelve los textos cacheados (compatibilidad con código existente). */
export async function getDocTexts(): Promise<{ file1Text: string; file2Text: string }> {
    const t = await getTexts();
    return { file1Text: t.file1, file2Text: t.file2 };
}

// ── Capa 2: Files API con TTL de 47h ────────────────────────────────────────

async function getFileUris(): Promise<{ uri1: string; uri2: string }> {
    const now = Date.now();

    // Reutilizar URIs si todavía son válidas
    if (global.__numDocs_fileUriCache && global.__numDocs_fileUriCache.expiresAt > now) {
        return { uri1: global.__numDocs_fileUriCache.uri1, uri2: global.__numDocs_fileUriCache.uri2 };
    }

    // Si ya hay un upload en curso, esperar ese mismo (evita uploads duplicados por llamadas concurrentes)
    if (global.__numDocs_uploadPromise) {
        return global.__numDocs_uploadPromise;
    }

    // Iniciar upload y guardar la promise en global antes del primer await
    global.__numDocs_uploadPromise = (async () => {
        const ai = getSharedAi();
        const { file1, file2 } = await getTexts();

        const [uploaded1, uploaded2] = await Promise.all([
            ai.files.upload({
                file: new Blob([file1], { type: 'text/plain' }),
                config: { mimeType: 'text/plain', displayName: 'Numerologia-Parte1' },
            }),
            ai.files.upload({
                file: new Blob([file2], { type: 'text/plain' }),
                config: { mimeType: 'text/plain', displayName: 'Numerologia-Parte2' },
            }),
        ]);

        global.__numDocs_fileUriCache = {
            uri1: uploaded1.uri!,
            uri2: uploaded2.uri!,
            expiresAt: Date.now() + 47 * 60 * 60 * 1000,
        };
        global.__numDocs_uploadPromise = undefined; // liberar el lock

        console.log('[numerologyDocs] Archivos subidos a Files API:', global.__numDocs_fileUriCache.uri1, global.__numDocs_fileUriCache.uri2);
        return { uri1: global.__numDocs_fileUriCache.uri1, uri2: global.__numDocs_fileUriCache.uri2 };
    })();

    // Si el upload falla, limpiar el lock para que se pueda reintentar
    global.__numDocs_uploadPromise.catch(() => {
        global.__numDocs_uploadPromise = undefined;
    });

    return global.__numDocs_uploadPromise;
}

// ── API pública principal ───────────────────────────────────────────────────

/**
 * buildContentsWithDocs(textPrompt)
 *
 * Devuelve el parámetro `contents` listo para pasar a `ai.models.generateContent()`.
 *
 * - Si Files API funciona → devuelve Content[] con fileData parts + text part.
 *   Gemini recibe las URIs en lugar del texto (~57K tokens ahorrados).
 * - Si Files API falla   → devuelve un string con el texto inline (fallback seguro).
 */
export async function buildContentsWithDocs(textPrompt: string): Promise<any> {
    try {
        const { uri1, uri2 } = await getFileUris();
        return [
            {
                role: 'user',
                parts: [
                    { fileData: { fileUri: uri1, mimeType: 'text/plain' } },
                    { fileData: { fileUri: uri2, mimeType: 'text/plain' } },
                    { text: textPrompt },
                ],
            },
        ];
    } catch (err) {
        console.error('[numerologyDocs] Files API falló, usando texto inline:', err);
        const { file1Text, file2Text } = await getDocTexts();
        return `${textPrompt}\n\n--- DOCUMENTO 1 ---\n${file1Text}\n\n--- DOCUMENTO 2 ---\n${file2Text}`;
    }
}

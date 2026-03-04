import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import { simpleParser } from 'mailparser';

function stripHtml(input: string): string {
    return input.replace(/<[^>]+>/g, ' ');
}

export function normalizeForScan(input: string): string {
    return input
        .replace(/\r\n/g, '\n')
        .replace(/[ \t]+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

function flattenJsonValues(value: unknown, out: string[] = []): string[] {
    if (value === null || value === undefined) return out;
    if (Array.isArray(value)) {
        for (const v of value) flattenJsonValues(v, out);
        return out;
    }
    if (typeof value === 'object') {
        for (const v of Object.values(value as Record<string, unknown>)) {
            flattenJsonValues(v, out);
        }
        return out;
    }
    out.push(String(value));
    return out;
}

function safeJsonToText(raw: string): string {
    try {
        const parsed = JSON.parse(raw);
        const pretty = JSON.stringify(parsed, null, 2);
        const valuesOnly = flattenJsonValues(parsed).join('\n');
        return normalizeForScan(`${pretty}\n\n[values-only]\n${valuesOnly}`);
    } catch {
        return normalizeForScan(raw);
    }
}

/**
 * Extracts text from a PDF file.
 * Supports pdf-parse v1 function API and v2 class API.
 */
export async function extractPdfText(filePath: string): Promise<string> {
    const dataBuffer = fs.readFileSync(filePath);

    // v1: pdf(dataBuffer) -> { text }
    if (typeof (pdf as unknown as any) === 'function') {
        const data = await (pdf as unknown as any)(dataBuffer);
        return normalizeForScan(data?.text ?? '');
    }

    // v2: { PDFParse } export
    const mod: any = pdf as any;
    if (typeof mod?.PDFParse === 'function') {
        const parser = new mod.PDFParse({ data: dataBuffer });
        try {
            const result = await parser.getText();
            return normalizeForScan(result?.text ?? '');
        } finally {
            if (typeof parser.destroy === 'function') {
                await parser.destroy();
            }
        }
    }

    throw new Error('Unsupported pdf-parse module shape');
}

export async function extractDocxText(filePath: string): Promise<string> {
    const buffer = fs.readFileSync(filePath);
    const result = await mammoth.extractRawText({ buffer });
    return normalizeForScan(result.value || '');
}

export async function extractEmlText(filePath: string): Promise<string> {
    const raw = fs.readFileSync(filePath);
    const parsed = await simpleParser(raw);

    const headers = [
        `Subject: ${parsed.subject || ''}`,
        `From: ${parsed.from?.text || ''}`,
        `To: ${parsed.to?.text || ''}`,
        `Cc: ${parsed.cc?.text || ''}`,
        `Date: ${parsed.date?.toISOString?.() || ''}`,
    ].join('\n');

    const bodyText = parsed.text || stripHtml(String(parsed.html || ''));
    const attachments = (parsed.attachments || [])
        .map((a) => a.filename)
        .filter(Boolean) as string[];
    const attachText = attachments.length ? `Attachments: ${attachments.join(', ')}` : '';

    return normalizeForScan([headers, attachText, bodyText].filter(Boolean).join('\n\n'));
}

export class ContentExtractor {

    /**
     * Reads a file from disk and returns normalized text content.
     * Binary formats are extracted before scanning.
     */
    public async extractText(uri: vscode.Uri): Promise<string> {
        const filePath = uri.fsPath;
        const ext = path.extname(filePath).toLowerCase();

        try {
            if (ext === '.pdf') {
                return await extractPdfText(filePath);
            }

            if (ext === '.docx') {
                return await extractDocxText(filePath);
            }

            if (ext === '.eml') {
                return await extractEmlText(filePath);
            }

            if (ext === '.msg') {
                console.warn(`[AG] .msg parsing not yet implemented: ${filePath}`);
                return '';
            }

            const fileData = await vscode.workspace.fs.readFile(uri);
            const text = Buffer.from(fileData).toString('utf-8');

            if (ext === '.json') {
                return safeJsonToText(text);
            }

            return normalizeForScan(text);

        } catch (error) {
            console.warn(`[AG] Failed to parse ${filePath}:`, error);
            return '';
        }
    }
}

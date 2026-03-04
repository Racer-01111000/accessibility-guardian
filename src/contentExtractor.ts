import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import pdf from 'pdf-parse';

/**
 * Extracts text from a PDF file.
 * Supports pdf-parse v1 function API and v2 class API.
 */
export async function extractPdfText(filePath: string): Promise<string> {
    const dataBuffer = fs.readFileSync(filePath);

    // v1: pdf(dataBuffer) -> { text }
    if (typeof (pdf as unknown as any) === 'function') {
        const data = await (pdf as unknown as any)(dataBuffer);
        return data?.text ?? '';
    }

    // v2: { PDFParse } export
    const mod: any = pdf as any;
    if (typeof mod?.PDFParse === 'function') {
        const parser = new mod.PDFParse({ data: dataBuffer });
        try {
            const result = await parser.getText();
            return result?.text ?? '';
        } finally {
            if (typeof parser.destroy === 'function') {
                await parser.destroy();
            }
        }
    }

    throw new Error('Unsupported pdf-parse module shape');
}

export class ContentExtractor {

    /**
     * Reads a file from disk and returns its text content.
     * Lazy-loads heavy libraries to prevent startup crashes.
     */
    public async extractText(uri: vscode.Uri): Promise<string> {
        const filePath = uri.fsPath;
        const ext = path.extname(filePath).toLowerCase();

        try {
            let text: string;

            if (ext === '.pdf') {
                text = await extractPdfText(filePath);
                return text;
            }

            const fileData = await vscode.workspace.fs.readFile(uri);
            const buffer = Buffer.from(fileData);

            if (ext === '.docx') {
                console.log('📝 Loading DOCX Engine...');
                const mammoth = require('mammoth');
                const result = await mammoth.extractRawText({ buffer: buffer });
                text = result.value;
            } else {
                text = buffer.toString('utf-8');
            }

            return text;

        } catch (error) {
            console.error(`Failed to parse ${filePath}:`, error);
            return '';
        }
    }
}

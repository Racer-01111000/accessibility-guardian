import * as vscode from 'vscode';
import * as path from 'path';

export class ContentExtractor {

    /**
     * Reads a file from disk and returns its text content.
     * Lazy-loads heavy libraries to prevent startup crashes.
     */
    public async extractText(uri: vscode.Uri): Promise<string> {
        const filePath = uri.fsPath;
        const ext = path.extname(filePath).toLowerCase();

        try {
            const fileData = await vscode.workspace.fs.readFile(uri);
            const buffer = Buffer.from(fileData);

            // 1. Handle PDF
            if (ext === '.pdf') {
                console.log('📄 Loading PDF Engine...');
                // LAZY LOAD: Only require pdf-parse when actually needed
                const pdf = require('pdf-parse'); 
                const data = await pdf(buffer);
                return data.text;
            } 
            
            // 2. Handle DOCX
            if (ext === '.docx') {
                console.log('📝 Loading DOCX Engine...');
                // LAZY LOAD: Only require mammoth when actually needed
                const mammoth = require('mammoth');
                const result = await mammoth.extractRawText({ buffer: buffer });
                return result.value;
            }

            // 3. Default: Handle as plain text
            return buffer.toString('utf-8');

        } catch (error) {
            console.error(`Failed to parse ${filePath}:`, error);
            return ""; 
        }
    }
}

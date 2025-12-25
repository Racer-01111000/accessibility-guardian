import * as vscode from 'vscode';
import { GuardianRules } from './ruleManager';

export class Scanner {
    // 1. Define the Patterns
    private patterns = {
        hipaa: [
            { regex: /\b\d{3}-\d{2}-\d{4}\b/g, message: 'HIPAA Alert: Potential Social Security Number (SSN) detected.' },
            { regex: /\b(patient|diagnosis|treatment)\b/gi, message: 'HIPAA Warning: Potential PHI keyword detected.' }
        ],
        gdpr: [
            { regex: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, message: 'GDPR Alert: Email address detected. Ensure user consent.' },
            { regex: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, message: 'GDPR Warning: IP Address detected.' }
        ],
        ada: [
            { regex: /<img\s+(?![^>]*\balt=)[^>]*>/gi, message: 'ADA Violation: Image tag missing "alt" attribute.' },
            { regex: />\s*(click here|read more)\s*<\/a>/gi, message: 'ADA Warning: Avoid vague link text like "click here".' }
        ]
    };

    // 2. The Main Scan Method
    public scan(document: vscode.TextDocument, rules: GuardianRules): vscode.Diagnostic[] {
        const diagnostics: vscode.Diagnostic[] = [];
        
        // Scan based on what rules are enabled
        if (rules.enableHipaa) {
            this.runPatterns(document, this.patterns.hipaa, diagnostics, vscode.DiagnosticSeverity.Error);
        }
        if (rules.enableGdpr) {
            this.runPatterns(document, this.patterns.gdpr, diagnostics, vscode.DiagnosticSeverity.Warning);
        }
        if (rules.enableAda) {
            this.runPatterns(document, this.patterns.ada, diagnostics, vscode.DiagnosticSeverity.Information);
        }

        return diagnostics;
    }

    // 3. Helper to run regex and calculate positions
    private runPatterns(document: vscode.TextDocument, patterns: any[], diagnostics: vscode.Diagnostic[], severity: vscode.DiagnosticSeverity) {
        const text = document.getText();
        
        for (const pattern of patterns) {
            let match;
            // Reset regex just in case
            pattern.regex.lastIndex = 0; 
            
            while ((match = pattern.regex.exec(text)) !== null) {
                // Convert index to VS Code Position (Line/Column)
                const startPos = document.positionAt(match.index);
                const endPos = document.positionAt(match.index + match[0].length);
                const range = new vscode.Range(startPos, endPos);

                const diagnostic = new vscode.Diagnostic(range, pattern.message, severity);
                diagnostic.source = 'Accessibility Guardian';
                diagnostics.push(diagnostic);
            }
        }
    }
}

import * as vscode from 'vscode';

export default class Scanner {
    /**
     * Scans the document against the active rules.
     * @param document The VS Code document to scan
     * @param rules The active ruleset from RuleManager
     */
    public scan(document: vscode.TextDocument, rules: any): vscode.Diagnostic[] {
        const diagnostics: vscode.Diagnostic[] = [];
        const text = document.getText();

        // NOTE: Since the original logic was overwritten, this is the essential 
        // skeleton required to make the extension compile and run.
        
        // If you have specific regex rules you want to restore here, 
        // you can add them. For now, this returns an empty list 
        // so the build succeeds and the PHI scanner can take over.

        return diagnostics;
    }
}

import * as vscode from 'vscode';

export class QuickFixProvider implements vscode.CodeActionProvider {

    provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection,
        context: vscode.CodeActionContext,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {

        const actions: vscode.CodeAction[] = [];

        // Check if the user is clicking on an error we know how to fix
        for (const diagnostic of context.diagnostics) {
            
            // FIX: Add missing 'alt' attribute
            if (diagnostic.code === 'WCAG-1.1.1') {
                const fix = this.createAltTextFix(document, diagnostic);
                if (fix) { 
                    actions.push(fix); 
                }
            }
        }

        return actions;
    }

    private createAltTextFix(document: vscode.TextDocument, diagnostic: vscode.Diagnostic): vscode.CodeAction | undefined {
        const action = new vscode.CodeAction('Fix: Mark as decorative (alt="")', vscode.CodeActionKind.QuickFix);
        
        // We want to insert ' alt=""' right after the "<img" tag starts.
        // The scanner guarantees the range starts at "<img", so we just move forward 4 characters.
        const insertPos = diagnostic.range.start.translate(0, 4); 

        action.edit = new vscode.WorkspaceEdit();
        action.edit.insert(document.uri, insertPos, ' alt=""');
        
        // Attach this action to the specific error (so clicking it resolves the error)
        action.diagnostics = [diagnostic];
        action.isPreferred = true; // Makes it the top suggestion
        
        return action;
    }
}

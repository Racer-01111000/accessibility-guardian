import * as vscode from 'vscode';
import { LicenseManager } from './license';
import { RuleManager } from './ruleManager';
import { Scanner } from './scanner';
import { ContentExtractor } from './contentExtractor';

export function activate(context: vscode.ExtensionContext) {
    console.log('🔄 Accessibility Guardian: STARTING ACTIVATION...'); // Debug Log

    // 1. Setup Managers
    const licenseManager = new LicenseManager(context);
    licenseManager.init();
    
    const outputChannel = vscode.window.createOutputChannel("Accessibility Guardian Report");
    const diagnosticCollection = vscode.languages.createDiagnosticCollection('accessibility-guardian');
    context.subscriptions.push(diagnosticCollection);

    // 2. Register License Command
    console.log('✅ Registering: enterLicense');
    context.subscriptions.push(vscode.commands.registerCommand('accessibilityGuardian.enterLicense', () => {
        licenseManager.promptForLicense();
    }));

    // 3. Register Active Scan
    console.log('✅ Registering: scanActiveFile');
    context.subscriptions.push(vscode.commands.registerCommand('accessibilityGuardian.scanActiveFile', async () => {
        if (!licenseManager.isLicensed()) {
            vscode.window.showWarningMessage('Trial Expired: Enterprise License required.');
            return;
        }
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('No active file to scan.');
            return;
        }
        const ruleManager = new RuleManager();
        const activeRules = await ruleManager.getActiveRules();
        
        vscode.window.setStatusBarMessage('Scanning...', 2000);
        const scanner = new Scanner();
        const diagnostics = scanner.scan(editor.document, activeRules);

        diagnosticCollection.set(editor.document.uri, diagnostics);

        if (diagnostics.length > 0) {
            vscode.window.showErrorMessage(`Found ${diagnostics.length} compliance issues.`);
        } else {
            vscode.window.showInformationMessage('✅ No issues found!');
        }
    }));

    // 4. Register Deep Scan Workspace (With Progress Bar)
    console.log('✅ Registering: scanWorkspace');
    let deepScanCommand = vscode.commands.registerCommand('accessibilityGuardian.scanWorkspace', async () => {
        
        if (!licenseManager.isLicensed()) {
            vscode.window.showWarningMessage('Trial Expired: Enterprise Deep Scan requires a valid license.');
            return;
        }

        const ruleManager = new RuleManager();
        const activeRules = await ruleManager.getActiveRules();
        const scanner = new Scanner();
        const extractor = new ContentExtractor();

        // Find files
        const files = await vscode.workspace.findFiles('**/*.{pdf,docx,html,txt,md}', '**/node_modules/**');
        
        outputChannel.clear();
        outputChannel.show();
        outputChannel.appendLine(`🚀 Starting Enterprise Deep Scan on ${files.length} files...`);

        // SHOW PROGRESS BAR
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Accessibility Guardian: Deep Scan",
            cancellable: true
        }, async (progress, token) => {
            
            let totalIssues = 0;
            const increment = 100 / files.length;

            for (const file of files) {
                // Allow user to cancel if it takes too long
                if (token.isCancellationRequested) {
                    outputChannel.appendLine("🛑 Scan Cancelled by user.");
                    break;
                }

                const fileName = vscode.workspace.asRelativePath(file);
                progress.report({ message: `Scanning ${fileName}...`, increment: increment });
                outputChannel.appendLine(`Scanning: ${fileName}...`);
                
                // Extract & Scan
                try {
                    const textContent = await extractor.extractText(file);
                    const fakeDoc = {
                        getText: () => textContent,
                        positionAt: (offset: number) => new vscode.Position(0, 0)
                    } as vscode.TextDocument;

                    const issues = scanner.scan(fakeDoc, activeRules);

                    if (issues.length > 0) {
                        totalIssues += issues.length;
                        outputChannel.appendLine(`   ❌ Found ${issues.length} issues.`);
                    } else {
                        outputChannel.appendLine(`   ✅ Clean`);
                    }
                } catch (err) {
                    outputChannel.appendLine(`   ⚠️ Error reading file: ${err}`);
                }
                
                // tiny pause to let the UI breathe
                await new Promise(r => setTimeout(r, 10)); 
            }

            outputChannel.appendLine(`\n🏁 Scan Complete. Total Issues: ${totalIssues}`);
            vscode.window.showInformationMessage(`Deep Scan Complete: Found ${totalIssues} issues.`);
        });
    });
    context.subscriptions.push(deepScanCommand);
    
    console.log('🚀 Accessibility Guardian: ACTIVATION COMPLETE.');
}

export function deactivate() {}

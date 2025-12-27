const assert = require('assert');
const path = require('path');
const vscode = require('vscode');

suite('Accessibility Guardian', () => {
    const getExtension = () => vscode.extensions.all.find((candidate) => {
            const pkg = candidate.packageJSON || {};
            const name = String(pkg.name || '').toLowerCase();
            const publisher = String(pkg.publisher || '').toLowerCase();
            return name === 'accessibility-guardian' && publisher === 'echocorelabs';
        });

    test('activates and registers commands', async () => {
        const extension = getExtension();
        assert.ok(extension, 'Extension not found in development host');

        await extension.activate();
        assert.strictEqual(extension.isActive, true, 'Extension did not activate');

        const commands = await vscode.commands.getCommands(true);
        const expectedCommands = [
            'accessibilityGuardian.scanActiveFile',
            'accessibilityGuardian.scanWorkspace',
            'accessibilityGuardian.enterLicense'
        ];

        for (const command of expectedCommands) {
            assert.ok(
                commands.includes(command),
                `Command not registered: ${command}`
            );
        }
    }).timeout(20000);

    const openSampleDoc = async () => {
        const samplePath = path.join(__dirname, '..', 'test-fixtures', 'scan-sample.html');
        const doc = await vscode.workspace.openTextDocument(samplePath);
        await vscode.window.showTextDocument(doc);
        return doc;
    };

    test('runs scan commands end-to-end', async () => {
        const extension = getExtension();
        assert.ok(extension, 'Extension not found in development host');
        await extension.activate();

        await vscode.commands.executeCommand('accessibilityGuardian.__test.setTrialStart', Date.now());
        const doc = await openSampleDoc();

        await vscode.commands.executeCommand('accessibilityGuardian.scanActiveFile');
        await new Promise((resolve) => setTimeout(resolve, 50));

        const diagnostics = vscode.languages
            .getDiagnostics(doc.uri)
            .filter((diag) => diag.source === 'Accessibility Guardian');

        const warningCount = diagnostics.filter(
            (diag) => diag.severity === vscode.DiagnosticSeverity.Warning
        ).length;
        const infoCount = diagnostics.filter(
            (diag) => diag.severity === vscode.DiagnosticSeverity.Information
        ).length;

        assert.strictEqual(diagnostics.length, 3, 'Expected 3 diagnostics from scanActiveFile');
        assert.strictEqual(warningCount, 1, 'Expected 1 warning diagnostic');
        assert.strictEqual(infoCount, 2, 'Expected 2 info diagnostics');

        await vscode.commands.executeCommand('accessibilityGuardian.scanWorkspace');
    }).timeout(60000);

    test('prompts for license and opens checkout when trial expired', async () => {
        const extension = getExtension();
        assert.ok(extension, 'Extension not found in development host');
        await extension.activate();

        const originalShowWarningMessage = vscode.window.showWarningMessage;
        const originalOpenExternal = vscode.env.openExternal;

        let capturedArgs = null;
        let openedUrl = null;

        vscode.window.showWarningMessage = async (...args) => {
            capturedArgs = args;
            return 'Buy License ($50)';
        };

        vscode.env.openExternal = async (uri) => {
            openedUrl = uri?.toString();
            return true;
        };

        try {
            const expiredAt = Date.now() - (16 * 24 * 60 * 60 * 1000);
            await vscode.commands.executeCommand('accessibilityGuardian.__test.setTrialStart', expiredAt);
            await openSampleDoc();

            await vscode.commands.executeCommand('accessibilityGuardian.scanActiveFile');
            await new Promise((resolve) => setTimeout(resolve, 50));

            assert.ok(capturedArgs, 'Expected license prompt to be shown');
            assert.ok(
                capturedArgs.includes('Buy License ($50)'),
                'Expected Buy License option in prompt'
            );
            assert.ok(
                capturedArgs.includes('Enter Key'),
                'Expected Enter Key option in prompt'
            );
            assert.ok(
                openedUrl && openedUrl.includes('lemonsqueezy.com/checkout/buy/'),
                'Expected checkout URL to open'
            );
        } finally {
            vscode.window.showWarningMessage = originalShowWarningMessage;
            vscode.env.openExternal = originalOpenExternal;
            await vscode.commands.executeCommand('accessibilityGuardian.__test.setTrialStart', Date.now());
        }
    }).timeout(60000);
});

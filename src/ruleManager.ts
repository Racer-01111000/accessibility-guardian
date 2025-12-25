import * as vscode from 'vscode';

// 1. Define the Shape of our Rules
// This ensures TypeScript yells at us if we make a typo later.
export interface GuardianRules {
    enableHipaa: boolean; // For healthcare (PHI, SSN, MRN)
    enableGdpr: boolean;  // For EU privacy (IP addresses, emails)
    enableAda: boolean;   // For accessibility (Alt text, contrast, labels)
}

export class RuleManager {
    // 2. The "Safe Defaults"
    // If the user has no config file, we use these.
    private defaultRules: GuardianRules = {
        enableHipaa: true,  // Default: Protect sensitive data
        enableGdpr: false,  // Default: Off (too noisy for US users)
        enableAda: true     // Default: Always improve accessibility
    };

    /**
     * The Main Method: Returns the final set of rules to apply.
     */
    public async getActiveRules(): Promise<GuardianRules> {
        // A. Start with defaults
        let activeRules = { ...this.defaultRules };

        // B. Check if a workspace is open
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            return activeRules; // No folder open, just use defaults
        }

        // C. Look for .accessibility-guardian.json in the root
        const rootPath = workspaceFolders[0].uri;
        const configUri = vscode.Uri.joinPath(rootPath, '.accessibility-guardian.json');

        try {
            // Read the file
            const fileData = await vscode.workspace.fs.readFile(configUri);
            const fileString = Buffer.from(fileData).toString('utf8');
            const userConfig = JSON.parse(fileString);

            // D. Merge: Overwrite defaults with user settings
            // This is the "Enterprise" magic: The file wins.
            if (userConfig.enableHipaa !== undefined) activeRules.enableHipaa = userConfig.enableHipaa;
            if (userConfig.enableGdpr !== undefined) activeRules.enableGdpr = userConfig.enableGdpr;
            if (userConfig.enableAda !== undefined) activeRules.enableAda = userConfig.enableAda;

            console.log('✅ Loaded custom rules from .accessibility-guardian.json');
        } catch (error) {
            // If file doesn't exist or is invalid JSON, we just ignore it.
            // This is expected behavior for most users.
            console.log('ℹ️ No custom config found, using defaults.');
        }

        return activeRules;
    }
}

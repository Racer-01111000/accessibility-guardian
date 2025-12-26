import * as vscode from 'vscode';

const KEY_TRIAL_START = 'ag_trial_start_date';
const KEY_LICENSE_KEY = 'ag_license_key';
const TRIAL_DURATION_DAYS = 15;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

export class LicenseManager {
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.initializeTrial();
    }

    private initializeTrial() {
        // If no start date exists, set it to NOW.
        if (!this.context.globalState.get(KEY_TRIAL_START)) {
            this.context.globalState.update(KEY_TRIAL_START, Date.now());
        }
    }

    public getStatus(): { active: boolean; reason?: string; remainingDays: number } {
        // 1. Check if user already has a valid license key
        const licenseKey = this.context.globalState.get<string>(KEY_LICENSE_KEY);
        if (licenseKey === 'VALID-PAID-LICENSE') { // TODO: Replace with real Lemon Squeezy validation later
            return { active: true, remainingDays: 9999 };
        }

        // 2. Check Trial Status
        const startDate = this.context.globalState.get<number>(KEY_TRIAL_START) || Date.now();
        const elapsedMs = Date.now() - startDate;
        const elapsedDays = elapsedMs / MS_PER_DAY;
        const remaining = Math.max(0, Math.ceil(TRIAL_DURATION_DAYS - elapsedDays));

        if (elapsedDays > TRIAL_DURATION_DAYS) {
            return { active: false, reason: 'TRIAL_EXPIRED', remainingDays: 0 };
        }

        return { active: true, remainingDays: remaining };
    }

    public async promptForLicense() {
        const choice = await vscode.window.showWarningMessage(
            'Accessibility Guardian: Your 15-day free trial has expired.',
            'Buy License ($50)',
            'Enter Key'
        );

        if (choice === 'Buy License ($50)') {
            // Replace with your actual checkout URL
            vscode.env.openExternal(vscode.Uri.parse('https://echocorelabs.lemonsqueezy.com/checkout/buy/a874747b-6d18-4a5b-b780-3005182c3559'));
        } else if (choice === 'Enter Key') {
            const input = await vscode.window.showInputBox({ prompt: 'Paste your license key here' });
            if (input) {
                // TODO: Add real validation logic here
                if (input.startsWith('AG-')) { // Simple mock check
                    await this.context.globalState.update(KEY_LICENSE_KEY, 'VALID-PAID-LICENSE');
                    vscode.window.showInformationMessage('License activated! Thank you for supporting Accessibility Guardian.');
                } else {
                    vscode.window.showErrorMessage('Invalid license key.');
                }
            }
        }
    }
}

import * as vscode from 'vscode';
import axios from 'axios';

export class LicenseManager {
    private context: vscode.ExtensionContext;
    private storageKey: string = 'ecl_license_key';
    private statusKey: string = 'ecl_license_status';
    private installDateKey: string = 'ecl_install_date';

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    public init(): void {
        let installDate = this.context.globalState.get(this.installDateKey);
        if (!installDate) {
            this.context.globalState.update(this.installDateKey, Date.now());
        }
    }

    public isLicensed(): boolean {
        const status = this.context.globalState.get(this.statusKey);
        if (status === 'active') return true;
        
        const installDate = this.context.globalState.get<number>(this.installDateKey) || Date.now();
        const daysUsed = (Date.now() - installDate) / (1000 * 60 * 60 * 24);
        return daysUsed < 15;
    }

    public getStatus(): string {
        const status = this.context.globalState.get(this.statusKey);
        if (status === 'active') return "Pro License (Enterprise)";
        
        const installDate = this.context.globalState.get<number>(this.installDateKey) || Date.now();
        const daysUsed = (Date.now() - installDate) / (1000 * 60 * 60 * 24);
        const daysLeft = Math.max(0, 15 - Math.ceil(daysUsed));
        return daysLeft > 0 ? `Trial: ${daysLeft} days left` : "Trial Expired";
    }

    public async validateAndStoreKey(key: string): Promise<boolean> {
        console.log(`Checking key: ${key}`); // <--- THIS WILL PROVE NEW CODE IS RUNNING
        
        if (!key) return false;

        // --- BACKDOOR FOR TESTING ---
        if (key === 'DEV-TEST') {
            console.log("Backdoor activated!");
            await this.context.globalState.update(this.storageKey, key);
            await this.context.globalState.update(this.statusKey, 'active');
            return true;
        }
        // ----------------------------

        try {
            const response = await axios.post('https://api.lemonsqueezy.com/v1/licenses/activate', {
                license_key: key,
                instance_name: 'VSCode-Client'
            });

            if (response.data && response.data.activated) {
                await this.context.globalState.update(this.storageKey, key);
                await this.context.globalState.update(this.statusKey, 'active');
                return true;
            } else {
                return false; 
            }
        } catch (error) {
            console.error('License Validation Error:', error);
            return false;
        }
    }

    public async promptForLicense(): Promise<void> {
        let key = await vscode.window.showInputBox({
            prompt: 'Enter your Echo Core Labs Enterprise License Key',
            placeHolder: 'XXXX-XXXX-XXXX-XXXX',
            password: true,
            ignoreFocusOut: true
        });

        if (key) {
            key = key.trim();
            vscode.window.setStatusBarMessage('Verifying license with Lemon Squeezy...', 3000);
            
            const isValid = await this.validateAndStoreKey(key);

            if (isValid) {
                vscode.window.showInformationMessage('✅ License Verified! Enterprise modules unlocked.');
            } else {
                vscode.window.showErrorMessage('❌ Invalid or Expired License Key.');
            }
        }
    }
}

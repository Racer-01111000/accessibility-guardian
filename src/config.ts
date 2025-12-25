import * as vscode from 'vscode';

export type ConfigMap = Record<string, any>;

export function getConfig(): ConfigMap {
    const config = vscode.workspace.getConfiguration('accessibilityGuardian');

    return {
        'privacy.crossBorder.enabled': config.get('privacy.crossBorder.enabled', true),
        'privacy.crossBorder.highRiskVendors': config.get('privacy.crossBorder.highRiskVendors', []),
        'privacy.crossBorder.requireTransferMechanismDisclosure': config.get(
            'privacy.crossBorder.requireTransferMechanismDisclosure',
            true
        ),
        'privacy.crossBorder.requireSCCorAdequacyMention': config.get(
            'privacy.crossBorder.requireSCCorAdequacyMention',
            true
        ),
        'privacy.crossBorder.requireDPAControllerProcessorLanguage': config.get(
            'privacy.crossBorder.requireDPAControllerProcessorLanguage',
            false
        ),
        'privacy.crossBorder.severity': config.get('privacy.crossBorder.severity', 'warn')
    };
}

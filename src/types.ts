export type Severity = 'info' | 'warn' | 'error';

export interface Finding {
    id: string;
    severity: Severity;
    title: string;
    description: string;
    evidence?: Record<string, unknown>;
    remediation?: string;
    tags?: string[];
}

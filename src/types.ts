export interface Finding {
    code: string;
    message: string;
    severity: 'info' | 'warn' | 'error';
    start: number;
    end: number;
}

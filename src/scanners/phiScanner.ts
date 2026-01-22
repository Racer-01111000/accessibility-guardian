import * as vscode from 'vscode';

// =============================================================================
// PHI DEFINITIONS & DICTIONARIES
// =============================================================================

// 1. HARD PATTERNS (The "Must Catch" list)
const ssnPattern = /\b\d{3}-\d{2}-\d{4}\b/g;
const datePattern = /\b(?:\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|\d{4}[\/-]\d{1,2}[\/-]\d{1,2})\b/g;

// 2. MEDICAL VOCABULARY (Triggers "Diagnosis" Warnings)
// This list allows the scanner to flag specific medical conditions.
const medicalKeywords = [
    "COPD", "Cancer", "Diabetes", "HIV", "AIDS", "Hypertension",
    "Depression", "Anxiety", "Tumor", "Metastasis", "Chronic", 
    "Acute", "Syndrome", "Disorder", "Hepatitis", "Diagnosis", "Patient"
];
// Create a regex from the list: /\b(COPD|Cancer|...)\b/gi
const medicalRegex = new RegExp(`\\b(${medicalKeywords.join('|')})\\b`, 'gi');

// 3. NAME HEURISTICS (Context-Aware)
// Looks for "Name" or "Patient" followed by Capitalized Words
// OR looks for capitalized names inside specific HTML attributes like placeholder=""
const nameContextPattern = /(?:Name|Patient|placeholder)\s*[:=]\s*["']?([A-Z][a-z]+ [A-Z][a-z]+)/g;


// =============================================================================
// DECORATION TYPES (The "Paint")
// =============================================================================

const highRiskDecoration = vscode.window.createTextEditorDecorationType({
    borderWidth: '1px',
    borderStyle: 'solid',
    overviewRulerColor: 'red',
    overviewRulerLane: vscode.OverviewRulerLane.Right,
    light: { borderColor: '#FF0000', backgroundColor: 'rgba(255,0,0,0.1)' },
    dark: { borderColor: '#FF0000', backgroundColor: 'rgba(255,0,0,0.2)' },
    after: { contentText: ' ⚠️ PHI DETECTED', color: 'red', fontWeight: 'bold', margin: '0 0 0 5px' }
});

const mediumRiskDecoration = vscode.window.createTextEditorDecorationType({
    borderWidth: '1px',
    borderStyle: 'dashed',
    overviewRulerColor: 'yellow',
    overviewRulerLane: vscode.OverviewRulerLane.Right,
    light: { borderColor: '#FFAA00', backgroundColor: 'rgba(255,170,0,0.1)' },
    dark: { borderColor: '#FFAA00', backgroundColor: 'rgba(255,170,0,0.1)' },
    after: { contentText: ' ⚠️ Sensitive Data', color: '#e6b800', fontStyle: 'italic', margin: '0 0 0 5px' }
});

// =============================================================================
// MAIN SCANNER FUNCTION
// =============================================================================

export function scanDocumentForPHI(editor: vscode.TextEditor): number {
    if (!editor) { return 0; }
    
    const text = editor.document.getText();
    const highRiskRanges: vscode.Range[] = [];
    const mediumRiskRanges: vscode.Range[] = [];
    let totalErrors = 0;

    let match;

    // A. SCAN: Social Security Numbers (High Risk)
    while ((match = ssnPattern.exec(text))) {
        const startPos = editor.document.positionAt(match.index);
        const endPos = editor.document.positionAt(match.index + match[0].length);
        highRiskRanges.push(new vscode.Range(startPos, endPos));
        totalErrors++;
    }

    // B. SCAN: Dates (Medium Risk)
    // Note: We flag them visually, but we often don't increment 'totalErrors'
    // for dates alone to avoid annoyance. Uncomment totalErrors++ if you want stricter blocking.
    while ((match = datePattern.exec(text))) {
        const startPos = editor.document.positionAt(match.index);
        const endPos = editor.document.positionAt(match.index + match[0].length);
        mediumRiskRanges.push(new vscode.Range(startPos, endPos));
    }

    // C. SCAN: Medical Terms (Medium/High Risk)
    while ((match = medicalRegex.exec(text))) {
        const startPos = editor.document.positionAt(match.index);
        const endPos = editor.document.positionAt(match.index + match[0].length);
        mediumRiskRanges.push(new vscode.Range(startPos, endPos));
        totalErrors++;
    }

    // D. SCAN: Contextual Names (Medium Risk)
    // Catches: placeholder="Richard Wright" or Name: Richard Wright
    while ((match = nameContextPattern.exec(text))) {
        // match[1] is the actual name captured group
        // We need to calculate the exact position of the name inside the match
        const matchIndex = match.index + match[0].indexOf(match[1]);
        const startPos = editor.document.positionAt(matchIndex);
        const endPos = editor.document.positionAt(matchIndex + match[1].length);
        mediumRiskRanges.push(new vscode.Range(startPos, endPos));
        totalErrors++;
    }

    // APPLY VISUALS
    editor.setDecorations(highRiskDecoration, highRiskRanges);
    editor.setDecorations(mediumRiskDecoration, mediumRiskRanges);

    return totalErrors;
}

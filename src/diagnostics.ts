import * as vscode from 'vscode';
import { missingAltRule } from './rules/missing-alt';
import { unlabeledInputRule } from './rules/unlabeled-input';
import { headingHierarchyRule } from './rules/heading-hierarchy';
import { colorContrastRule } from './rules/color-contrast';
import { focusIndicatorRule } from './rules/focus-indicator';

const RULES = [
  missingAltRule,
  unlabeledInputRule,
  headingHierarchyRule,
  colorContrastRule,
  focusIndicatorRule
];

export function scanDocument(doc: vscode.TextDocument, coll: vscode.DiagnosticCollection) {
  if (doc.languageId !== 'html') return;
  const all: vscode.Diagnostic[] = [];
  for (const rule of RULES) {
    try { all.push(...rule.check(doc)); } catch (e) { console.error('[AG] rule failed:', rule.id, e); }
  }
  coll.set(doc.uri, all);
}


# Accessibility Guardian: The Official User Guide
Your companion for secure, accessible, and compliant code.

👋 Welcome!
Thank you for choosing Accessibility Guardian. We built this tool to help you catch the "Big 3" compliance risks—HIPAA, GDPR, and ADA—right inside your editor, long before they hit production.

This guide will walk you through getting set up, running your first scan, and unlocking the full power of the extension.

## 📚 Table of Contents
- Getting Started
- Your Free Trial
- How to Scan Your Code
- What We Detect (The "Big 3")
- Activating Your License
- Need Help?

## Chapter 1: Getting Started
Setting up is easy. Accessibility Guardian lives right inside VS Code, so you don't need to install any heavy external software.

1. Open VS Code.
2. Click the Extensions icon on the left sidebar (the blocks).
3. Search for Accessibility Guardian.
4. Click Install.

That's it! You are ready to scan.

## Chapter 2: Your Free Trial
We believe in trying before buying. When you first install the extension, you automatically start a 15-Day Free Trial.

- Full Access: You get every feature (Deep Scan, HIPAA checks, GDPR analysis) unlocked.
- No Credit Card: You don't need to enter payment info to start the trial.
- Expiration: After 15 days, the scanner will pause and ask for a license key to continue protecting your code.

## Chapter 3: How to Scan Your Code
There are two ways to use Accessibility Guardian, depending on what you are working on.

### 1. Scan Active File (The Quick Check)
Perfect for when you are writing code and want instant feedback on the file currently open.

1. Open any file (HTML, JS, TS, etc.).
2. Press Ctrl + Shift + P (or Cmd + Shift + P on Mac).
3. Type Scan Active File and press Enter.

Result: Compliance issues will appear as yellow squiggly lines under the problematic code. Hover over them to see how to fix it!

### 2. Deep Scan Workspace (The Audit)
Perfect for checking your entire project before a release.

1. Press Ctrl + Shift + P.
2. Type Deep Scan Workspace.

Result: A progress bar will show the scan status. Once finished, you will get a summary report of all issues found across your project files (including PDFs and DOCX files!).

## Chapter 4: What We Detect
We focus on the risks that matter most to modern developers.

### 🏥 HIPAA (Health Privacy)
We protect patient data by detecting:

- PHI in Filenames: Like john_doe_mri_scan.png.
- Unsafe Placeholders: Forms that ask for specific medical examples (e.g., "Enter Diagnosis").
- Social Security Numbers: Potential leaks of sensitive ID numbers.

### 🇪🇺 GDPR (Data Privacy)
We help you navigate EU/US data laws:

- Vendor Risks: Detects US-centric trackers (like Google Analytics) that may require special legal disclosures.
- Policy Gaps: Scans your privacy policy for missing keywords like "Standard Contractual Clauses" (SCCs) or "Adequacy."

### ♿ ADA (Accessibility)
We ensure your site is usable by everyone:

- Missing Labels: Form inputs without descriptions.
- Vague Links: Links that just say "Click Here" (bad for screen readers).
- Contrast Issues: Hard-to-read text colors.

## Chapter 5: Activating Your License
Loved the trial? You can unlock the Lifetime License for a one-time fee of $50. No subscriptions, no monthly bills.

How to Buy:

1. Run a scan. If your trial has expired, a popup will appear.
2. Click "Buy License ($50)".
3. Complete the secure checkout via Lemon Squeezy.
4. You will receive a License Key via email.

How to Activate:

1. Back in VS Code, run a scan again.
2. Click "Enter Key".
3. Paste your key (starts with AG-) and press Enter.

Success! You are protected forever.

## Chapter 6: Need Help?
We are here for you. If you spot a bug or have a feature request, reach out to us.

Publisher: Echo Core Labs

Support: [Link to your GitHub Issues or Email]

Website: [Your Website Link]

Happy Coding! — The Echo Core Labs Team

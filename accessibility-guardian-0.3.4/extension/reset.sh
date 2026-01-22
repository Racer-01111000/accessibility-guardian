#!/usr/bin/env bash
# ===============================
# Accessibility Guardian Reset Script
# by Echo + Rick
# ===============================

set -e  # Exit on first error
echo "🔧 Cleaning and rebuilding Accessibility Guardian..."

# 1. Stop any leftover node or debug processes
pkill -f "Extension Development Host" >/dev/null 2>&1 || true
pkill -f "code --extensionDevelopmentPath" >/dev/null 2>&1 || true

# 2. Remove build artifacts
rm -rf out dist .vscode-test || true
echo "🧹 Cleaned build directories."

# 3. Ensure dependencies are current
npm install --silent

# 4. Compile the TypeScript source
npm run build

# 5. Relaunch VS Code in extension dev mode
echo "🚀 Launching Extension Development Host..."
code --extensionDevelopmentPath="$(pwd)" --disable-gpu &
sleep 2
echo "✅ Done! Extension is rebuilding and launching."

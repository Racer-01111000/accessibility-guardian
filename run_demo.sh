#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
rm -rf out .vscode-test || true
npm run build
npx @vscode/vsce package -o accessibility-guardian.vsix
code --install-extension ./accessibility-guardian.vsix || true
printf '<img src="logo.png">\n' > /tmp/test.html
code /tmp/test.html
echo "✅ Installed and opened test file. Look for red squiggle under <img>."

// esbuild.config.js
const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['src/extension.ts'],
  bundle: true,
  platform: 'node',
  external: ['vscode'], // VS Code API stays external
  outfile: 'out/extension.js',
  sourcemap: true,
  minify: true,
  target: ['node18'],
}).catch(() => process.exit(1));

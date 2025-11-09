// esbuild.config.js  (CommonJS)
const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['src/extension.ts'],
  outfile: 'dist/extension.js',
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'cjs',
  external: ['vscode'],      // VS Code API is provided by host
  sourcemap: false,
  logLevel: 'info',
}).catch(() => process.exit(1));


import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const dist = path.resolve(root, 'dist');

const copyTargets = [
  'logo.png',
  'manifest.json',
  'metadata.json',
];

const runtimeBundles = [
  {
    entry: path.resolve(root, 'background/index.js'),
    outputFile: 'background/index.js',
    format: 'es',
  },
  {
    entry: path.resolve(root, 'content/main.js'),
    outputFile: 'content/main.js',
    format: 'iife',
    name: 'GeminiNexusContent',
  },
];

const requiredDistFiles = [
  'background/index.js',
  'content/main.js',
  'manifest.json',
  'sidepanel/index.html',
  'sandbox/index.html',
];

async function bundleRuntimeScripts() {
  for (const bundle of runtimeBundles) {
    await build({
      configFile: false,
      logLevel: 'silent',
      resolve: {
        alias: {
          '@': path.resolve(root, '.'),
        },
      },
      build: {
        emptyOutDir: false,
        outDir: dist,
        target: 'chrome120',
        lib: {
          entry: bundle.entry,
          formats: [bundle.format],
          name: bundle.name,
          fileName: () => bundle.outputFile,
        },
        rollupOptions: {
          output: {
            inlineDynamicImports: true,
          },
        },
      },
    });
  }
}

function ensureRequiredFiles() {
  const missing = requiredDistFiles.filter((file) => !existsSync(path.resolve(dist, file)));
  if (missing.length > 0) {
    throw new Error(`missing required build outputs: ${missing.join(', ')}`);
  }
}

if (!existsSync(dist)) {
  throw new Error('Build output directory not found. Run vite build before packaging the extension.');
}

rmSync(path.resolve(dist, 'background'), { recursive: true, force: true });
rmSync(path.resolve(dist, 'content'), { recursive: true, force: true });
await bundleRuntimeScripts();

for (const target of copyTargets) {
  const source = path.resolve(root, target);
  const destination = path.resolve(dist, target);
  if (!existsSync(source)) continue;
  rmSync(destination, { recursive: true, force: true });
  mkdirSync(path.dirname(destination), { recursive: true });
  cpSync(source, destination, { recursive: true });
}

ensureRequiredFiles();

console.log('Packaged extension assets into dist/');

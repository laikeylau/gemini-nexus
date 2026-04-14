import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(testDir, '../..');

describe('extension packaging contract', () => {
  test('uses Vite-based runtime bundling and validates canonical dist outputs', () => {
    const packageJson = JSON.parse(
      readFileSync(path.join(rootDir, 'package.json'), 'utf8')
    );
    const packageScript = readFileSync(
      path.join(rootDir, 'scripts/package-extension.mjs'),
      'utf8'
    );

    expect(packageJson.devDependencies.esbuild).toBeUndefined();
    expect(packageScript).toContain("from 'vite'");
    expect(packageScript).not.toContain("from 'esbuild'");
    expect(packageScript).toContain('content/main.js');
    expect(packageScript).not.toContain('content/index.js');
    expect(packageScript).toContain('background/index.js');
    expect(packageScript).toContain('missing required build outputs');
  });
});

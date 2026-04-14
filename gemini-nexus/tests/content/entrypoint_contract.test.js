import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(testDir, '../..');

describe('content entrypoint contract', () => {
  test('uses content/main.js as the only content script entrypoint', () => {
    const manifest = JSON.parse(
      readFileSync(path.join(rootDir, 'manifest.json'), 'utf8')
    );
    const mainSource = readFileSync(
      path.join(rootDir, 'content/main.js'),
      'utf8'
    );

    expect(manifest.content_scripts[0].js).toEqual(['content/main.js']);
    expect(mainSource).not.toContain("import './index.js';");
    expect(existsSync(path.join(rootDir, 'content/index.js'))).toBe(false);
  });
});

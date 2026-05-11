import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

async function exists(relativePath) {
  try {
    await stat(path.join(process.cwd(), relativePath));
    return true;
  } catch {
    return false;
  }
}

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(process.cwd(), relativePath), 'utf8'));
}

describe('project structure', () => {
  it('uses the repository root as the runnable extension project root', async () => {
    await expect(exists('.github/workflows/package-extension.yml')).resolves.toBe(true);
    await expect(exists('package.json')).resolves.toBe(true);
    await expect(exists('manifest.json')).resolves.toBe(true);
    await expect(exists('gemini-nexus/package.json')).resolves.toBe(false);
  });

  it('uses shared/ for cross-runtime utilities instead of lib/', async () => {
    await expect(exists('shared')).resolves.toBe(true);
    await expect(exists('lib')).resolves.toBe(false);
    await expect(exists('background/lib')).resolves.toBe(false);
  });

  it('keeps release version metadata synchronized', async () => {
    const packageJson = await readJson('package.json');
    const packageLock = await readJson('package-lock.json');
    const manifest = await readJson('manifest.json');
    const changelog = await readFile(path.join(process.cwd(), 'CHANGELOG.md'), 'utf8');
    const firstHeading = changelog.split('\n').find((line) => line.startsWith('## '));

    expect(manifest.version).toBe(packageJson.version);
    expect(packageLock.version).toBe(packageJson.version);
    expect(packageLock.packages[''].version).toBe(packageJson.version);
    expect(firstHeading).toContain(`v${packageJson.version}`);
  });
});

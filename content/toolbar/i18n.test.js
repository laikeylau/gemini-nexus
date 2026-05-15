// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest';

async function loadToolbarI18n({ language = 'en-US', storedLanguage = undefined } = {}) {
    vi.resetModules();
    Object.defineProperty(globalThis.navigator, 'language', {
        value: language,
        configurable: true,
    });
    globalThis.chrome = {
        storage: {
            local: {
                get: vi.fn((_keys, callback) => callback({ geminiLanguage: storedLanguage })),
            },
            onChanged: {
                addListener: vi.fn(),
            },
        },
    };
    await import('./i18n.js');
}

describe('toolbar i18n', () => {
    beforeEach(() => {
        delete window.GeminiToolbarStrings;
        delete window.GeminiToolbarI18n;
    });

    it('uses the saved app language before falling back to browser language', async () => {
        await loadToolbarI18n({ language: 'zh-CN', storedLanguage: 'en' });

        expect(window.GeminiToolbarStrings.askAi).toBe('Ask AI');

        window.GeminiToolbarI18n.setLanguagePreference('zh');
        expect(window.GeminiToolbarStrings.askAi).toBe('询问 AI');
    });
});

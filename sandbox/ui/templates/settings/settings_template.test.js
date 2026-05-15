// @vitest-environment jsdom

import { describe, expect, it } from 'vitest';
import { GeneralSettingsTemplate } from './general.js';
import { ConnectionSettingsTemplate } from './connection.js';
import { ShortcutsSettingsTemplate } from './shortcuts.js';

describe('settings templates', () => {
    it('moves explanatory copy into compact help buttons', () => {
        document.body.innerHTML =
            GeneralSettingsTemplate + ConnectionSettingsTemplate + ShortcutsSettingsTemplate;

        expect(document.querySelectorAll('.setting-desc')).toHaveLength(0);
        expect(document.querySelectorAll('.setting-radio-desc')).toHaveLength(0);

        const helpButtons = [...document.querySelectorAll('.setting-help')];
        const helpKeys = helpButtons.map((button) => button.getAttribute('data-i18n-title'));

        expect(helpKeys).toEqual(
            expect.arrayContaining([
                'textSelectionDesc',
                'imageToolsToggleDesc',
                'accountIndicesDesc',
                'contextModeDesc',
                'contextRecentTurnsDesc',
                'sidebarBehaviorAutoDesc',
                'mcpToolsDesc',
                'mcpHeadersDesc',
                'shortcutDesc',
            ])
        );
        expect(helpButtons.every((button) => button.type === 'button')).toBe(true);
        expect(helpButtons.every((button) => button.getAttribute('aria-label') === 'Help')).toBe(
            true
        );
    });
});

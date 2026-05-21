// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest';
import { ShortcutsSettingsTemplate } from '../../templates/settings/shortcuts.js';
import { ShortcutsSection } from './shortcuts.js';

describe('ShortcutsSection', () => {
    beforeEach(() => {
        document.body.innerHTML = ShortcutsSettingsTemplate;
    });

    it('restores and saves the OCR capture shortcut', () => {
        const section = new ShortcutsSection();

        section.setData({
            quickAsk: 'Ctrl+G',
            openPanel: 'Alt+S',
            browserControl: 'Ctrl+B',
            ocrCapture: 'Ctrl+Shift+O',
        });

        expect(document.getElementById('shortcut-ocr-capture').value).toBe('Ctrl+Shift+O');
        expect(section.getData()).toEqual({
            quickAsk: 'Ctrl+G',
            openPanel: 'Alt+S',
            browserControl: 'Ctrl+B',
            ocrCapture: 'Ctrl+Shift+O',
        });
    });
});

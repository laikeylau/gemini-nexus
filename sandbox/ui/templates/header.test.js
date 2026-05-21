// @vitest-environment jsdom

import { describe, expect, it } from 'vitest';
import { HeaderTemplate } from './header.js';

describe('HeaderTemplate', () => {
    it('keeps the standalone chat launcher visible as a normal header action', () => {
        document.body.innerHTML = HeaderTemplate;

        const launcher = document.getElementById('open-full-page-btn');
        const headerRight = document.querySelector('.header-right');

        expect(launcher).not.toBeNull();
        expect(headerRight.contains(launcher)).toBe(true);
        expect(launcher.classList.contains('icon-btn')).toBe(true);
        expect(launcher.classList.contains('corner-btn')).toBe(false);
        expect(launcher.getAttribute('data-i18n-title')).toBe('openFullPageTooltip');
    });
});

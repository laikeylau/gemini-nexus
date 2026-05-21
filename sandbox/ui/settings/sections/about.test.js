// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest';
import { AboutSection } from './about.js';

describe('AboutSection', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="about-settings-group">
                <button id="download-logs"></button>
                <span id="star-count"></span>
                <span id="app-current-version"></span>
                <span id="app-update-status"></span>
            </div>
        `;
    });

    it('renders update versions as text inside the release link', () => {
        const section = new AboutSection();

        section.displayUpdateStatus('<img src=x onerror="alert(1)">2.0.0', '1.0.0', true);

        const updateStatus = document.getElementById('app-update-status');
        const link = updateStatus.querySelector('a.app-update-link');
        expect(link).not.toBeNull();
        expect(link.textContent).toBe('Update available: <img src=x onerror="alert(1)">2.0.0');
        expect(updateStatus.querySelector('img')).toBeNull();
        expect(updateStatus.classList.contains('is-muted')).toBe(false);
        expect(updateStatus.hasAttribute('style')).toBe(false);
    });

    it('uses classes for star and latest-version presentation states', () => {
        const section = new AboutSection();

        section.displayStars(1200);
        const star = document.getElementById('star-count');
        expect(star.textContent).toBe('★ 1.2k');
        expect(star.classList.contains('is-visible')).toBe(true);
        expect(star.hasAttribute('style')).toBe(false);

        section.displayStars(0);
        expect(star.classList.contains('is-visible')).toBe(false);
        expect(star.hasAttribute('style')).toBe(false);

        section.displayUpdateStatus('1.0.0', '1.0.0', false);
        const updateStatus = document.getElementById('app-update-status');
        expect(updateStatus.classList.contains('is-muted')).toBe(true);
        expect(updateStatus.hasAttribute('style')).toBe(false);
    });
});

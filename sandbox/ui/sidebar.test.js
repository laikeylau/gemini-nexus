// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SidebarController } from './sidebar.js';

vi.mock('../core/i18n.js', () => ({
    t: (key) =>
        ({
            noConversations: 'No conversations yet.',
        })[key] || key,
}));

describe('SidebarController', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <input id="history-search">
            <div id="history-list"></div>
        `;
    });

    it('uses the shared empty state class without inline styles', () => {
        const listEl = document.getElementById('history-list');
        const controller = new SidebarController(
            {
                historyListEl: listEl,
                sidebar: null,
                sidebarOverlay: null,
                historyToggleBtn: null,
                closeSidebarBtn: null,
            },
            {}
        );

        controller.renderList([], null, {}, {});

        const empty = listEl.querySelector('.empty-list-state');
        expect(empty).toBeTruthy();
        expect(empty.textContent).toBe('No conversations yet.');
        expect(empty.hasAttribute('style')).toBe(false);
    });
});

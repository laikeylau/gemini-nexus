import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NavigationActions } from './navigation.js';

function createActions(groupContext = {}) {
    const connection = { currentTabId: 101, targetTabId: 101 };
    const waitHelper = {
        execute: vi.fn(async (fn) => fn()),
    };
    return new NavigationActions(connection, {}, waitHelper, groupContext);
}

describe('NavigationActions controlled tab group scope', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        globalThis.chrome = {
            tabs: {
                create: vi.fn(() => Promise.resolve({ id: 303, title: 'New', url: 'about:blank' })),
                group: vi.fn(() => Promise.resolve(7)),
                query: vi.fn((query) => {
                    if (query.groupId === 7) {
                        return Promise.resolve([
                            { id: 101, title: 'Grouped A', url: 'https://a.test/' },
                            { id: 202, title: 'Grouped B', url: 'https://b.test/' },
                        ]);
                    }
                    return Promise.resolve([
                        { id: 101, title: 'Grouped A', url: 'https://a.test/' },
                        { id: 202, title: 'Grouped B', url: 'https://b.test/' },
                        { id: 999, title: 'Outside', url: 'https://outside.test/' },
                    ]);
                }),
                remove: vi.fn(() => Promise.resolve()),
            },
            windows: {
                create: vi.fn(() =>
                    Promise.resolve({
                        id: 55,
                        tabs: [{ id: 404, title: 'Worker', url: 'https://worker.test/' }],
                    })
                ),
            },
        };
    });

    it('lists only tabs in the controlled group', async () => {
        const actions = createActions({ getControlledGroupId: () => 7 });

        const output = await actions.listPages();

        expect(chrome.tabs.query).toHaveBeenCalledWith({ currentWindow: true, groupId: 7 });
        expect(output).toContain('Grouped A');
        expect(output).toContain('Grouped B');
        expect(output).not.toContain('Outside');
    });

    it('selects pages by index from the controlled group only', async () => {
        const actions = createActions({ getControlledGroupId: () => 7 });

        const result = await actions.selectPage({ index: 1 });

        expect(result).toMatchObject({
            output: 'Selected page 1 (Background Mode): Grouped B',
            _meta: { switchTabId: 202 },
        });
    });

    it('closes pages by index from the controlled group only', async () => {
        const actions = createActions({ getControlledGroupId: () => 7 });

        const result = await actions.closePage({ index: 0 });

        expect(chrome.tabs.remove).toHaveBeenCalledWith(101);
        expect(result).toBe('Closed page 0: Grouped A');
    });

    it('adds newly opened pages to the controlled group', async () => {
        const actions = createActions({ getControlledGroupId: () => 7 });

        const result = await actions.newPage({ url: 'https://openai.com/' });

        expect(chrome.tabs.group).toHaveBeenCalledWith({ groupId: 7, tabIds: [303] });
        expect(result).toMatchObject({
            _meta: { switchTabId: 303 },
        });
    });

    it('does not add popup-window pages to the current-window controlled group', async () => {
        const actions = createActions({ getControlledGroupId: () => 7 });

        const result = await actions.newPage({ url: 'https://worker.test/', background: true });

        expect(chrome.windows.create).toHaveBeenCalledWith({
            url: 'https://worker.test/',
            type: 'popup',
            focused: false,
            width: 1280,
            height: 800,
        });
        expect(chrome.tabs.group).not.toHaveBeenCalled();
        expect(result).toMatchObject({
            _meta: {
                switchTabId: 404,
                allowOutsideControlledGroup: true,
            },
        });
    });
});

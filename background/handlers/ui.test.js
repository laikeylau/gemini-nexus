import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UIMessageHandler } from './ui.js';

describe('UIMessageHandler browser control tab ownership', () => {
    let controlManager;
    let handler;

    beforeEach(() => {
        controlManager = {
            setOwnerSidePanelTabId: vi.fn(),
            enableControl: vi.fn(),
            disableControl: vi.fn(),
            setTargetTab: vi.fn(),
            isTabControllable: vi.fn(() => true),
        };
        handler = new UIMessageHandler({}, controlManager, null, null);
    });

    it('scopes browser control toggle broadcasts to the requesting side panel tab', () => {
        const sendResponse = vi.fn();

        const handled = handler.handle(
            {
                action: 'TOGGLE_BROWSER_CONTROL',
                enabled: true,
                sidePanelTabId: 123,
            },
            {},
            sendResponse
        );

        expect(handled).toBe(true);
        expect(controlManager.setOwnerSidePanelTabId).toHaveBeenCalledWith(123);
        expect(controlManager.enableControl).toHaveBeenCalled();
        expect(sendResponse).toHaveBeenCalledWith({ status: 'processed' });
    });

    it('scopes manual tab switching broadcasts to the requesting side panel tab', async () => {
        const sendResponse = vi.fn();

        const handled = handler.handle(
            {
                action: 'SWITCH_TAB',
                tabId: 45,
                switchVisual: false,
                sidePanelTabId: 123,
            },
            {},
            sendResponse
        );

        expect(handled).toBe(true);
        await vi.waitFor(() => {
            expect(controlManager.setOwnerSidePanelTabId).toHaveBeenCalledWith(123);
            expect(controlManager.setTargetTab).toHaveBeenCalledWith(45);
            expect(sendResponse).toHaveBeenCalledWith({ status: 'switched' });
        });
    });

    it('does not manually switch browser control to an uncontrollable tab', async () => {
        controlManager.isTabControllable = vi.fn(() => Promise.resolve(false));
        const sendResponse = vi.fn();

        const handled = handler.handle(
            {
                action: 'SWITCH_TAB',
                tabId: 45,
                switchVisual: false,
                sidePanelTabId: 123,
            },
            {},
            sendResponse
        );

        expect(handled).toBe(true);
        await vi.waitFor(() =>
            expect(sendResponse).toHaveBeenCalledWith({
                status: 'error',
                error: 'Tab cannot be controlled.',
            })
        );
        expect(controlManager.setTargetTab).not.toHaveBeenCalled();
    });

    it('returns only controlled group tabs while browser control is scoped', async () => {
        globalThis.chrome = {
            runtime: {
                sendMessage: vi.fn(() => Promise.resolve()),
            },
            tabs: {
                query: vi.fn(({ groupId }) => {
                    if (groupId === 7) {
                        return Promise.resolve([
                            { id: 1, title: 'Inside', url: 'https://inside.test/' },
                        ]);
                    }
                    return Promise.resolve([
                        { id: 1, title: 'Inside', url: 'https://inside.test/' },
                        { id: 2, title: 'Outside', url: 'https://outside.test/' },
                    ]);
                }),
            },
        };
        controlManager.getControlledGroupId = vi.fn(() => 7);
        controlManager.getTargetTabId = vi.fn(() => 1);
        const sendResponse = vi.fn();

        const handled = handler.handle(
            { action: 'GET_OPEN_TABS', sidePanelTabId: 123 },
            {},
            sendResponse
        );

        expect(handled).toBe(true);
        await vi.waitFor(() =>
            expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
                expect.objectContaining({
                    action: 'OPEN_TABS_RESULT',
                    tabs: [expect.objectContaining({ id: 1, title: 'Inside' })],
                })
            )
        );
        expect(chrome.tabs.query).toHaveBeenCalledWith({ currentWindow: true, groupId: 7 });
    });

    it('returns tabs from the controlled popup window when the control scope has no group', async () => {
        globalThis.chrome = {
            runtime: {
                sendMessage: vi.fn(() => Promise.resolve()),
            },
            tabs: {
                query: vi.fn(({ windowId }) => {
                    if (windowId === 55) {
                        return Promise.resolve([
                            { id: 9, title: 'Worker', url: 'https://worker.test/', windowId: 55 },
                        ]);
                    }
                    return Promise.resolve([
                        { id: 1, title: 'Main', url: 'https://main.test/', windowId: 1 },
                    ]);
                }),
            },
        };
        controlManager.getControlledGroupId = vi.fn(() => null);
        controlManager.getControlledWindowId = vi.fn(() => 55);
        controlManager.getTargetTabId = vi.fn(() => 9);
        const sendResponse = vi.fn();

        const handled = handler.handle(
            { action: 'GET_OPEN_TABS', sidePanelTabId: 123 },
            {},
            sendResponse
        );

        expect(handled).toBe(true);
        await vi.waitFor(() =>
            expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
                expect.objectContaining({
                    action: 'OPEN_TABS_RESULT',
                    tabs: [expect.objectContaining({ id: 9, title: 'Worker' })],
                })
            )
        );
        expect(chrome.tabs.query).toHaveBeenCalledWith({ windowId: 55 });
    });

    it('reports side panel open failures to the requesting content script', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        globalThis.chrome = {
            storage: {
                local: {
                    set: vi.fn(() => Promise.resolve()),
                },
            },
            sidePanel: {
                open: vi.fn(() => Promise.reject(new Error('Panel unavailable'))),
                setOptions: vi.fn(() => Promise.resolve()),
            },
        };
        const sendResponse = vi.fn();
        const handler = new UIMessageHandler({}, controlManager, null, null);

        const handled = handler.handle(
            { action: 'OPEN_SIDE_PANEL' },
            { tab: { id: 9, windowId: 4 } },
            sendResponse
        );

        expect(handled).toBe(true);
        await vi.waitFor(() =>
            expect(sendResponse).toHaveBeenCalledWith({
                status: 'error',
                error: 'Panel unavailable',
            })
        );
    });
});

// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('RendererBridge message origin', () => {
    const originalCrypto = globalThis.crypto;

    beforeEach(async () => {
        vi.resetModules();
        globalThis.GeminiNexusIds = {
            createPrefixedId: vi.fn((prefix) => `${prefix}_SHARED_ID`),
        };
        globalThis.chrome = {
            runtime: {
                getURL: vi.fn((path) => `chrome-extension://id/${path}`),
            },
        };
        await import('./bridge.js');
    });

    it('ignores render responses that do not come from its sandbox iframe', async () => {
        const host = document.createElement('div');
        document.body.appendChild(host);
        const bridge = new window.GeminiRendererBridge(host);
        const promise = bridge.render('safe');
        const iframeWindow = host.querySelector('iframe').contentWindow;
        const requestId = Object.keys(bridge.callbacksByRequestId)[0];

        expect(requestId).not.toBe('0');
        expect(requestId).toBe('req_SHARED_ID');

        window.dispatchEvent(
            new MessageEvent('message', {
                source: window,
                data: {
                    action: 'RENDER_RESULT',
                    reqId: requestId,
                    html: '<img src=x onerror=alert(1)>',
                    fetchTasks: [],
                },
            })
        );
        window.dispatchEvent(
            new MessageEvent('message', {
                source: iframeWindow,
                data: {
                    action: 'RENDER_RESULT',
                    reqId: requestId,
                    html: '<p>safe</p>',
                    fetchTasks: [],
                },
            })
        );

        await expect(promise).resolves.toEqual({ html: '<p>safe</p>', fetchTasks: [] });
    });

    it('delegates request ID creation to the classic shared ID helper', () => {
        const host = document.createElement('div');
        document.body.appendChild(host);
        const bridge = new window.GeminiRendererBridge(host);

        expect(bridge.createRequestId()).toBe('req_SHARED_ID');
        expect(globalThis.GeminiNexusIds.createPrefixedId).toHaveBeenCalledWith('req');
    });

    it('keeps readable fallback request IDs without random helpers', () => {
        const host = document.createElement('div');
        document.body.appendChild(host);
        const bridge = new window.GeminiRendererBridge(host);
        delete globalThis.GeminiNexusIds;
        Object.defineProperty(globalThis, 'crypto', {
            value: {},
            configurable: true,
        });

        expect(bridge.createRequestId()).toBe('req_1');
        expect(bridge.createRequestId()).toBe('req_2');

        Object.defineProperty(globalThis, 'crypto', {
            value: originalCrypto,
            configurable: true,
        });
    });
});

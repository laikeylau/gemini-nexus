import { downloadFile, downloadText } from './downloads.js';
import {
    DEFAULT_CONTEXT_MODE,
    normalizeContextRecentTurns,
} from '../../shared/config/constants.js';
import {
    CONNECTION_STORAGE_KEYS,
    createConnectionSettingsPayload,
    createConnectionStorageUpdate,
} from '../../shared/settings/connection.js';
import { CUSTOM_SELECTION_TOOLS_STORAGE_KEY } from '../../shared/settings/selection_tools.js';
import {
    mergeSessionSaveWithCurrent,
    normalizeDeletedSessionIds,
    normalizeSessionSavePayload,
} from './session_merge.js';
import { publishHostContext } from './host_context.js';
import {
    restoreAccountIndices,
    restoreContextSettings,
    restoreCustomSelectionTools,
    restoreImageTools,
    restoreTextSelection,
    restoreTextSelectionBlacklist,
} from './preferences.js';

function getModelSaveKey(payload) {
    if (payload && typeof payload === 'object') {
        return payload.provider === 'openai' ? 'geminiOpenaiSelectedModel' : 'geminiModel';
    }

    return 'geminiModel';
}

function getModelSaveValue(payload) {
    if (payload && typeof payload === 'object') {
        return payload.model;
    }

    return payload;
}

const FORWARDED_RESPONSE_ACTIONS = new Set([
    'GET_LOGS',
    'CHECK_PAGE_CONTEXT',
    'MCP_TEST_CONNECTION',
    'MCP_LIST_TOOLS',
]);

export class MessageBridge {
    constructor(frameManager, stateManager) {
        this.frame = frameManager;
        this.state = stateManager;
    }

    init() {
        window.addEventListener('message', this.handleWindowMessage.bind(this));
        chrome.runtime.onMessage.addListener(this.handleRuntimeMessage.bind(this));
    }

    handleWindowMessage(event) {
        // Security check: Only accept messages from our direct iframe
        if (!this.frame.isWindow(event.source)) return;

        const { action, payload } = event.data || {};
        if (!action) return;

        switch (action) {
            case 'UI_READY':
                this.state.markUiReady();
                return void publishHostContext(this.frame, () => this.isRunningInTab());
            case 'OPEN_FULL_PAGE':
                this.openFullPage();
                return;
            case 'OPEN_SETTINGS_PAGE':
                this.openSettingsPage();
                return;
            case 'OPEN_EXTERNAL_URL':
                this.openExternalUrl(payload);
                return;
            case 'REQUEST_SCREEN_CAPTURE':
                this.requestScreenCapture();
                return;
            case 'FORWARD_TO_BACKGROUND':
                this.forwardToBackground(payload);
                return;
            case 'DOWNLOAD_IMAGE':
                downloadFile(payload.url, payload.filename);
                return;
            case 'DOWNLOAD_LOGS':
                downloadText(payload.text, payload.filename || 'gemini-nexus-logs.txt');
                return;
            case 'GET_TEXT_SELECTION':
                restoreTextSelection(this.frame);
                return;
            case 'GET_TEXT_SELECTION_BLACKLIST':
                restoreTextSelectionBlacklist(this.frame);
                return;
            case 'GET_CUSTOM_SELECTION_TOOLS':
                restoreCustomSelectionTools(this.frame);
                return;
            case 'GET_IMAGE_TOOLS':
                restoreImageTools(this.frame);
                return;
            case 'GET_ACCOUNT_INDICES':
                restoreAccountIndices(this.frame);
                return;
            case 'GET_CONTEXT_SETTINGS':
                restoreContextSettings(this.frame);
                return;
            case 'GET_CONNECTION_SETTINGS':
                this.restoreConnectionSettings();
                return;
            case 'SAVE_SESSIONS':
                this.saveSessionsSafely(payload);
                return;
            case 'SAVE_SHORTCUTS':
                this.state.save('geminiShortcuts', payload);
                return;
            case 'SAVE_MODEL':
                this.saveSelectedModel(payload);
                return;
            case 'SAVE_THEME':
                this.state.save('geminiTheme', payload);
                return;
            case 'SAVE_LANGUAGE':
                this.state.save('geminiLanguage', payload);
                return;
            case 'SAVE_TEXT_SELECTION':
                this.state.save('geminiTextSelectionEnabled', payload);
                return;
            case 'SAVE_TEXT_SELECTION_BLACKLIST':
                this.state.save('geminiTextSelectionBlacklist', payload || '');
                return;
            case 'SAVE_CUSTOM_SELECTION_TOOLS':
                this.state.save(
                    CUSTOM_SELECTION_TOOLS_STORAGE_KEY,
                    Array.isArray(payload) ? payload : []
                );
                return;
            case 'SAVE_IMAGE_TOOLS':
                this.state.save('geminiImageToolsEnabled', payload);
                return;
            case 'SAVE_SIDEBAR_BEHAVIOR':
                this.state.save('geminiSidebarBehavior', payload);
                return;
            case 'SAVE_SIDE_PANEL_SCOPE':
                this.state.save('geminiSidePanelScope', payload);
                return;
            case 'SAVE_SIDE_PANEL_SESSION_BINDING':
                this.saveSidePanelSessionBinding(payload);
                return;
            case 'SAVE_ACCOUNT_INDICES':
                this.state.save('geminiAccountIndices', payload);
                return;
            case 'SAVE_CONTEXT_SETTINGS':
                this.saveContextSettings(payload);
                return;
            case 'SAVE_CONNECTION_SETTINGS':
                this.saveConnectionSettings(payload);
                return;
            default:
                return;
        }
    }

    openFullPage() {
        const url = chrome.runtime.getURL('sidepanel/index.html');
        chrome.tabs.create({ url });
    }

    openSettingsPage() {
        this.isRunningInTab()
            .then((isTab) => {
                if (isTab) {
                    this.frame.postMessage({ action: 'OPEN_SETTINGS_MODAL' });
                    return;
                }

                const url = chrome.runtime.getURL('settings/index.html');
                chrome.tabs.create({ url });
            })
            .catch(() => {
                const url = chrome.runtime.getURL('settings/index.html');
                chrome.tabs.create({ url });
            });
    }

    isRunningInTab() {
        return new Promise((resolve) => {
            if (!chrome.tabs || typeof chrome.tabs.getCurrent !== 'function') {
                resolve(false);
                return;
            }

            chrome.tabs.getCurrent((tab) => {
                resolve(Boolean(tab && Number.isInteger(tab.id) && tab.id > 0));
            });
        });
    }

    openExternalUrl(payload) {
        const url = payload?.url;
        if (typeof url === 'string' && /^https?:\/\//i.test(url)) {
            chrome.tabs.create({ url });
        }
    }

    requestScreenCapture() {
        this._captureDisplayStill()
            .then((payload) => {
                this.postBackgroundMessage(payload);
            })
            .catch((error) => {
                this.postBackgroundMessage({
                    action: 'SCREEN_CAPTURE_ERROR',
                    error: error?.message || 'Screen capture failed',
                });
            });
    }

    forwardToBackground(payload) {
        const scopedPayload = this._attachCurrentTabContext(payload);
        chrome.runtime
            .sendMessage(scopedPayload)
            .then((response) => {
                if (response && FORWARDED_RESPONSE_ACTIONS.has(scopedPayload.action)) {
                    this.postBackgroundMessage(response);
                }
            })
            .catch((error) => console.warn('Error forwarding to background:', error));
    }

    restoreConnectionSettings() {
        chrome.storage.local.get(CONNECTION_STORAGE_KEYS, (result) => {
            this.frame.postMessage({
                action: 'RESTORE_CONNECTION_SETTINGS',
                payload: createConnectionSettingsPayload(result, { includeLegacyFallbacks: true }),
            });
        });
    }

    saveSelectedModel(payload) {
        const model = getModelSaveValue(payload);
        if (typeof model === 'string' && model.trim()) {
            this.state.save(getModelSaveKey(payload), model);
        }
    }

    saveSidePanelSessionBinding(payload) {
        const tabId = payload?.tabId;
        const sessionId = payload?.sessionId || null;
        if (!Number.isInteger(tabId) || tabId <= 0) return;

        chrome.storage.session.get(['geminiSidePanelSessionBindings'], (result) => {
            const bindings = result.geminiSidePanelSessionBindings || {};
            if (sessionId) {
                bindings[tabId] = sessionId;
            } else {
                delete bindings[tabId];
            }
            chrome.storage.session.set({ geminiSidePanelSessionBindings: bindings });
        });
    }

    saveContextSettings(payload) {
        this.state.save(
            'geminiContextMode',
            payload?.mode === 'recent' ? 'recent' : DEFAULT_CONTEXT_MODE
        );
        this.state.save(
            'geminiContextRecentTurns',
            normalizeContextRecentTurns(payload?.recentTurns)
        );
    }

    saveConnectionSettings(payload) {
        const storageUpdate = createConnectionStorageUpdate(payload);
        for (const [key, value] of Object.entries(storageUpdate)) {
            this.state.save(key, value);
        }
    }

    postBackgroundMessage(payload) {
        this.frame.postMessage({
            action: 'BACKGROUND_MESSAGE',
            payload,
        });
    }

    saveSessionsSafely(payload) {
        const { sessions, mutation } = normalizeSessionSavePayload(payload);
        if (!Array.isArray(sessions)) {
            this.state.save('geminiSessions', sessions);
            return;
        }

        chrome.storage.local.get(['geminiSessions', 'geminiDeletedSessionIds'], (result) => {
            const deletedSessionIds = normalizeDeletedSessionIds(result?.geminiDeletedSessionIds);
            if (mutation?.type === 'deleteSession' && mutation.sessionId) {
                deletedSessionIds[mutation.sessionId] = Date.now();
            }

            const merged = mergeSessionSaveWithCurrent(
                sessions,
                result?.geminiSessions,
                mutation,
                deletedSessionIds
            );
            this.state.save('geminiSessions', merged);
            chrome.storage.local.set({ geminiDeletedSessionIds: deletedSessionIds });
        });
    }

    handleRuntimeMessage(message) {
        if (!this._isMessageForCurrentTab(message)) return;

        if (message.action === 'SESSIONS_UPDATED') {
            this.state.updateSessions(message.sessions);
            this.frame.postMessage({
                action: 'RESTORE_SESSIONS',
                payload: message.sessions,
            });
            return;
        }

        // Forward all other background messages to sandbox (e.g. GEMINI_STREAM_UPDATE)
        this.frame.postMessage({
            action: 'BACKGROUND_MESSAGE',
            payload: message,
        });
    }

    async _captureDisplayStill() {
        const mediaDevices = navigator.mediaDevices;
        if (!mediaDevices || typeof mediaDevices.getDisplayMedia !== 'function') {
            throw new Error('Screen capture is not supported in this browser.');
        }

        const stream = await mediaDevices.getDisplayMedia({
            video: true,
            audio: false,
        });

        try {
            const video = document.createElement('video');
            video.srcObject = stream;
            video.muted = true;
            video.playsInline = true;

            const metadataReady = new Promise((resolve, reject) => {
                const cleanup = () => {
                    video.removeEventListener('loadedmetadata', handleReady);
                    video.removeEventListener('error', handleError);
                };
                const handleReady = () => {
                    cleanup();
                    resolve();
                };
                const handleError = () => {
                    cleanup();
                    reject(new Error('Failed to read selected screen.'));
                };

                video.addEventListener('loadedmetadata', handleReady, { once: true });
                video.addEventListener('error', handleError, { once: true });
            });
            await video.play();
            await metadataReady;

            const width = video.videoWidth || 1;
            const height = video.videoHeight || 1;
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const context = canvas.getContext('2d');
            if (!context) throw new Error('Failed to prepare screen capture.');
            context.drawImage(video, 0, 0, width, height);

            return {
                action: 'FETCH_IMAGE_RESULT',
                base64: canvas.toDataURL('image/png'),
                type: 'image/png',
                name: 'screen_capture.png',
            };
        } finally {
            stream.getTracks().forEach((track) => track.stop());
        }
    }

    _attachCurrentTabContext(payload) {
        if (!payload || typeof payload !== 'object' || payload.sidePanelTabId != null) {
            return payload;
        }

        const currentTabId = this.state.getCurrentTabId();
        if (!Number.isInteger(currentTabId) || currentTabId <= 0) {
            return payload;
        }

        return {
            ...payload,
            sidePanelTabId: currentTabId,
        };
    }

    _isMessageForCurrentTab(message) {
        if (!message || !Object.prototype.hasOwnProperty.call(message, 'tabId')) {
            return true;
        }

        const currentTabId = this.state.getCurrentTabId();
        return message.tabId == null || message.tabId === currentTabId;
    }
}

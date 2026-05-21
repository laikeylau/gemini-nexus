import {
    DEFAULT_CONTEXT_MODE,
    DEFAULT_CONTEXT_RECENT_TURNS,
} from '../../shared/config/constants.js';
import { CUSTOM_SELECTION_TOOLS_STORAGE_KEY } from '../../shared/settings/selection_tools.js';

export function restoreTextSelection(frame) {
    chrome.storage.local.get(['geminiTextSelectionEnabled'], (result) => {
        const enabled = result.geminiTextSelectionEnabled !== false;
        frame.postMessage({ action: 'RESTORE_TEXT_SELECTION', payload: enabled });
    });
}

export function restoreTextSelectionBlacklist(frame) {
    chrome.storage.local.get(['geminiTextSelectionBlacklist'], (result) => {
        frame.postMessage({
            action: 'RESTORE_TEXT_SELECTION_BLACKLIST',
            payload: result.geminiTextSelectionBlacklist || '',
        });
    });
}

export function restoreCustomSelectionTools(frame) {
    chrome.storage.local.get([CUSTOM_SELECTION_TOOLS_STORAGE_KEY], (result) => {
        frame.postMessage({
            action: 'RESTORE_CUSTOM_SELECTION_TOOLS',
            payload: Array.isArray(result[CUSTOM_SELECTION_TOOLS_STORAGE_KEY])
                ? result[CUSTOM_SELECTION_TOOLS_STORAGE_KEY]
                : [],
        });
    });
}

export function restoreImageTools(frame) {
    chrome.storage.local.get(['geminiImageToolsEnabled'], (result) => {
        const enabled = result.geminiImageToolsEnabled !== false;
        frame.postMessage({ action: 'RESTORE_IMAGE_TOOLS', payload: enabled });
    });
}

export function restoreAccountIndices(frame) {
    chrome.storage.local.get(['geminiAccountIndices'], (result) => {
        frame.postMessage({
            action: 'RESTORE_ACCOUNT_INDICES',
            payload: result.geminiAccountIndices || '0',
        });
    });
}

export function restoreContextSettings(frame) {
    chrome.storage.local.get(['geminiContextMode', 'geminiContextRecentTurns'], (result) => {
        frame.postMessage({
            action: 'RESTORE_CONTEXT_SETTINGS',
            payload: {
                mode: result.geminiContextMode || DEFAULT_CONTEXT_MODE,
                recentTurns: result.geminiContextRecentTurns || DEFAULT_CONTEXT_RECENT_TURNS,
            },
        });
    });
}

const BLOCKED_URL_PREFIXES = [
    'chrome://',
    'edge://',
    'chrome-extension://',
    'about:',
    'view-source:',
];

const BLOCKED_WEB_ORIGINS = new Set([
    'https://chrome.google.com',
    'https://chromewebstore.google.com',
]);

function hasGeminiNexusContentScript() {
    return Boolean(
        window.GeminiNexusContentReady === true ||
        window.GeminiMessageRouter ||
        document.getElementById('gemini-nexus-toolbar-host')
    );
}

export function isInjectableTabUrl(url) {
    if (typeof url !== 'string' || url.length === 0) return false;
    if (BLOCKED_URL_PREFIXES.some((prefix) => url.startsWith(prefix))) return false;
    if (/\.(?:mhtml|mht)(?:[?#].*)?$/i.test(url)) return false;

    try {
        const parsed = new URL(url);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
        if (BLOCKED_WEB_ORIGINS.has(parsed.origin)) return false;
        return true;
    } catch {
        return false;
    }
}

export function getContentScriptFiles(manifest = chrome.runtime.getManifest()) {
    const files = (manifest.content_scripts || []).flatMap((entry) => entry.js || []);
    return [...new Set(files)];
}

async function isAlreadyInjected(tabId, scripting = chrome.scripting) {
    const results = await scripting.executeScript({
        target: { tabId },
        func: hasGeminiNexusContentScript,
    });
    return results?.some((result) => result.result === true) === true;
}

export async function injectContentScriptsIntoTab(tab, options = {}) {
    const scripting = options.scripting || chrome.scripting;
    const manifest = options.manifest || chrome.runtime.getManifest();
    const tabId = tab?.id;
    const url = tab?.url || tab?.pendingUrl || '';

    if (!Number.isInteger(tabId) || !isInjectableTabUrl(url) || tab?.discarded === true) {
        return { tabId, status: 'skipped' };
    }

    try {
        if (await isAlreadyInjected(tabId, scripting)) {
            return { tabId, status: 'already-injected' };
        }

        await scripting.executeScript({
            target: { tabId },
            files: getContentScriptFiles(manifest),
        });
        return { tabId, status: 'injected' };
    } catch (error) {
        console.warn('[Gemini Nexus] Failed to inject content scripts into existing tab:', error);
        return { tabId, status: 'failed', error };
    }
}

export async function injectContentScriptsIntoOpenTabs(options = {}) {
    const tabsApi = options.tabs || chrome.tabs;
    const tabs = await tabsApi.query({});
    const results = [];

    for (const tab of tabs) {
        results.push(await injectContentScriptsIntoTab(tab, options));
    }

    return results;
}

export function setupContentScriptInjection() {
    chrome.runtime.onInstalled.addListener(() => {
        injectContentScriptsIntoOpenTabs().catch((error) => {
            console.warn('[Gemini Nexus] Failed to initialize existing tabs:', error);
        });
    });

    chrome.tabs.onUpdated.addListener(async (_tabId, changeInfo, tab) => {
        if (changeInfo.status !== 'complete') return;
        await injectContentScriptsIntoTab(tab);
    });

    chrome.tabs.onActivated.addListener(async ({ tabId }) => {
        try {
            const tab = await chrome.tabs.get(tabId);
            await injectContentScriptsIntoTab(tab);
        } catch (error) {
            console.warn('[Gemini Nexus] Failed to check activated tab:', error);
        }
    });
}

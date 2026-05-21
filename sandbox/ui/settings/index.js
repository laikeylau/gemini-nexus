import {
    saveShortcutsToStorage,
    saveThemeToStorage,
    saveLanguageToStorage,
    saveTextSelectionToStorage,
    requestTextSelectionFromStorage,
    saveTextSelectionBlacklistToStorage,
    requestTextSelectionBlacklistFromStorage,
    saveCustomSelectionToolsToStorage,
    requestCustomSelectionToolsFromStorage,
    saveSidebarBehaviorToStorage,
    saveSidePanelScopeToStorage,
    saveImageToolsToStorage,
    requestImageToolsFromStorage,
    saveAccountIndicesToStorage,
    requestAccountIndicesFromStorage,
    saveContextSettingsToStorage,
    requestContextSettingsFromStorage,
    saveConnectionSettingsToStorage,
    requestConnectionSettingsFromStorage,
    sendToBackground,
} from '../../../shared/messaging/index.js';
import { formatT, setLanguagePreference, getLanguagePreference, t } from '../../core/i18n.js';
import { SettingsView } from './view.js';
import { compareVersionStrings, fetchGithubMetadata } from './github_metadata.js';
import { formatLogDownloadText } from './log_download.js';
import {
    DEFAULT_CONTEXT_MODE,
    DEFAULT_CONTEXT_RECENT_TURNS,
    DEFAULT_MCP_HTTP_URL,
    DEFAULT_MCP_TRANSPORT,
    DEFAULT_OFFICIAL_BASE_URL,
    DEFAULT_OFFICIAL_MODELS,
    DEFAULT_PROVIDER,
    DEFAULT_SHORTCUTS,
    DEFAULT_SIDE_PANEL_SCOPE,
    DEFAULT_THINKING_LEVEL,
} from '../../../shared/config/constants.js';
import { createDefaultMcpServer } from '../../../shared/settings/connection.js';
import { normalizeOpenAIWebSearchSettings } from '../../../shared/settings/openai.js';
import { normalizeCustomSelectionTools } from '../../../shared/settings/selection_tools.js';

export class SettingsController {
    constructor(callbacks) {
        this.callbacks = callbacks || {};

        // State
        this.defaultShortcuts = { ...DEFAULT_SHORTCUTS };
        this.shortcuts = { ...this.defaultShortcuts };

        this.textSelectionEnabled = true;
        this.textSelectionBlacklist = '';
        this.customSelectionTools = [];
        this.imageToolsEnabled = true;
        this.accountIndices = '0';
        this.sidebarBehavior = 'auto';
        this.sidePanelScope = DEFAULT_SIDE_PANEL_SCOPE;
        this.contextSettings = {
            mode: DEFAULT_CONTEXT_MODE,
            recentTurns: DEFAULT_CONTEXT_RECENT_TURNS,
        };

        // Connection State
        this.connectionData = {
            provider: DEFAULT_PROVIDER,
            useOfficialApi: false, // Legacy support
            officialBaseUrl: DEFAULT_OFFICIAL_BASE_URL,
            apiKey: '',
            officialModel: DEFAULT_OFFICIAL_MODELS,
            thinkingLevel: DEFAULT_THINKING_LEVEL,
            officialWebSearch: false,
            openaiBaseUrl: '',
            openaiApiKey: '',
            openaiModel: '',
            openaiSelectedModel: '',
            openaiThinkingLevel: DEFAULT_THINKING_LEVEL,
            openaiUseResponsesApi: false,
            openaiWebSearch: false,
            // MCP (External Tools)
            mcpEnabled: false,
            mcpTransport: DEFAULT_MCP_TRANSPORT,
            mcpServerUrl: DEFAULT_MCP_HTTP_URL,
            mcpServers: [createDefaultMcpServer()],
            mcpActiveServerId: null,
        };

        // Initialize View
        this.view = new SettingsView({
            onOpen: () => this.handleOpen(),
            onSave: (data) => this.saveSettings(data),
            onReset: () => this.resetSettings(),

            onThemeChange: (theme) => this.setTheme(theme),
            onLanguageChange: (lang) => this.setLanguage(lang),

            onTextSelectionChange: (value) => {
                this.textSelectionEnabled = value === 'on' || value === true;
                saveTextSelectionToStorage(this.textSelectionEnabled);
            },
            onImageToolsChange: (value) => {
                this.imageToolsEnabled = value === 'on' || value === true;
                saveImageToolsToStorage(this.imageToolsEnabled);
            },
            onSidebarBehaviorChange: (value) => {
                this.sidebarBehavior = value || 'auto';
                saveSidebarBehaviorToStorage(this.sidebarBehavior);
            },
            onSidePanelScopeChange: (value) => {
                this.sidePanelScope = value || DEFAULT_SIDE_PANEL_SCOPE;
                saveSidePanelScopeToStorage(this.sidePanelScope);
            },
            onDownloadLogs: () => this.downloadLogs(),
        });

        // Listen for log data
        window.addEventListener('message', (messageEvent) => {
            const { action, payload } = messageEvent.data || {};
            if (action === 'BACKGROUND_MESSAGE' && payload?.logs) {
                this.saveLogFile(payload.logs);
            }
        });
    }

    open() {
        this.view.open();
    }

    close() {
        this.view.close();
    }

    normalizeAccountIndices(value) {
        const cleaned = String(value || '')
            .split(',')
            .map((part) => part.trim())
            .filter((part) => /^\d+$/.test(part))
            .join(',');
        return cleaned || '0';
    }

    handleOpen() {
        // Sync state to view
        this.view.setShortcuts(this.shortcuts);
        this.view.setLanguageValue(getLanguagePreference());
        this.view.setToggles(this.textSelectionEnabled, this.imageToolsEnabled);
        this.view.setTextSelectionBlacklist(this.textSelectionBlacklist);
        this.view.setCustomSelectionTools(this.customSelectionTools);
        this.view.setAccountIndices(this.accountIndices);
        this.view.setSidebarBehavior(this.sidebarBehavior);
        this.view.setSidePanelScope(this.sidePanelScope);
        this.view.setContextSettings(this.contextSettings);
        this.view.setConnectionSettings(this.connectionData);

        // Refresh from storage
        requestTextSelectionFromStorage();
        requestTextSelectionBlacklistFromStorage();
        requestCustomSelectionToolsFromStorage();
        requestImageToolsFromStorage();
        requestAccountIndicesFromStorage();
        requestContextSettingsFromStorage();
        requestConnectionSettingsFromStorage();

        this.refreshGithubMetadata();
    }

    saveSettings(data) {
        const previousProvider =
            this.connectionData.provider ||
            (this.connectionData.useOfficialApi ? 'official' : 'web');

        // Shortcuts
        this.shortcuts = data.shortcuts;
        saveShortcutsToStorage(this.shortcuts);

        // General Toggles
        this.textSelectionEnabled = data.textSelection;
        saveTextSelectionToStorage(this.textSelectionEnabled);

        this.textSelectionBlacklist = data.textSelectionBlacklist || '';
        saveTextSelectionBlacklistToStorage(this.textSelectionBlacklist);

        this.customSelectionTools = normalizeCustomSelectionTools(data.customSelectionTools);
        this.view.setCustomSelectionTools(this.customSelectionTools);
        saveCustomSelectionToolsToStorage(this.customSelectionTools);

        this.imageToolsEnabled = data.imageTools;
        saveImageToolsToStorage(this.imageToolsEnabled);

        // Accounts
        const accountIndices = this.normalizeAccountIndices(data.accountIndices);
        this.accountIndices = accountIndices;
        this.view.setAccountIndices(accountIndices);
        saveAccountIndicesToStorage(accountIndices);

        this.sidebarBehavior = data.sidebarBehavior || 'auto';
        saveSidebarBehaviorToStorage(this.sidebarBehavior);

        this.sidePanelScope = data.sidePanelScope || DEFAULT_SIDE_PANEL_SCOPE;
        saveSidePanelScopeToStorage(this.sidePanelScope);

        this.contextSettings = {
            mode: data.contextMode === 'recent' ? 'recent' : DEFAULT_CONTEXT_MODE,
            recentTurns: this.normalizeRecentTurns(data.contextRecentTurns),
        };
        saveContextSettingsToStorage(this.contextSettings);

        const openaiSettings = normalizeOpenAIWebSearchSettings(data.connection);

        // Connection
        this.connectionData = {
            provider: data.connection.provider,
            officialBaseUrl: data.connection.officialBaseUrl,
            apiKey: data.connection.apiKey,
            officialModel: data.connection.officialModel,
            thinkingLevel: data.connection.thinkingLevel,
            officialWebSearch: data.connection.officialWebSearch === true,
            openaiBaseUrl: data.connection.openaiBaseUrl,
            openaiApiKey: data.connection.openaiApiKey,
            openaiModel: data.connection.openaiModel,
            openaiSelectedModel: this.connectionData.openaiSelectedModel || '',
            openaiThinkingLevel: data.connection.openaiThinkingLevel || DEFAULT_THINKING_LEVEL,
            openaiUseResponsesApi: openaiSettings.useResponsesApi,
            openaiWebSearch: openaiSettings.webSearch,
            // MCP
            mcpEnabled: data.connection.mcpEnabled === true,
            mcpTransport: data.connection.mcpTransport || DEFAULT_MCP_TRANSPORT,
            mcpServerUrl: data.connection.mcpServerUrl || '',
            mcpServers: Array.isArray(data.connection.mcpServers) ? data.connection.mcpServers : [],
            mcpActiveServerId: data.connection.mcpActiveServerId || null,
        };

        saveConnectionSettingsToStorage(this.connectionData);

        // Notify app of critical setting changes
        if (this.callbacks.onSettingsChanged) {
            this.callbacks.onSettingsChanged(this.connectionData, {
                providerChanged: previousProvider !== this.connectionData.provider,
            });
        }
    }

    resetSettings() {
        this.view.setShortcuts(this.defaultShortcuts);
        this.view.setAccountIndices('0');
    }

    downloadLogs() {
        sendToBackground({ action: 'GET_LOGS' });
    }

    saveLogFile(logs) {
        if (!logs || logs.length === 0) {
            alert(t('noLogsToDownload'));
            return;
        }

        const text = formatLogDownloadText(logs);

        // Send to parent to handle download (Sandbox restriction workaround)
        window.parent.postMessage(
            {
                action: 'DOWNLOAD_LOGS',
                payload: {
                    text,
                    filename: `gemini-nexus-logs-${Date.now()}.txt`,
                },
            },
            '*'
        );
    }

    // --- State Updates (From View or Storage) ---

    setTheme(theme) {
        this.view.applyVisualTheme(theme);
        saveThemeToStorage(theme);
    }

    updateTheme(theme) {
        this.view.setThemeValue(theme);
    }

    setLanguage(newLang) {
        setLanguagePreference(newLang);
        saveLanguageToStorage(newLang);
        document.dispatchEvent(new CustomEvent('gemini-language-changed'));
    }

    updateLanguage(lang) {
        setLanguagePreference(lang);
        this.view.setLanguageValue(lang);
        document.dispatchEvent(new CustomEvent('gemini-language-changed'));
    }

    updateShortcuts(payload) {
        if (payload) {
            this.shortcuts = { ...this.defaultShortcuts, ...payload };
            this.view.setShortcuts(this.shortcuts);
        }
    }

    updateTextSelection(enabled) {
        this.textSelectionEnabled = enabled;
        this.view.setToggles(this.textSelectionEnabled, this.imageToolsEnabled);
    }

    updateTextSelectionBlacklist(value) {
        this.textSelectionBlacklist = value || '';
        this.view.setTextSelectionBlacklist(this.textSelectionBlacklist);
    }

    updateCustomSelectionTools(tools) {
        this.customSelectionTools = normalizeCustomSelectionTools(tools);
        this.view.setCustomSelectionTools(this.customSelectionTools);
    }

    updateImageTools(enabled) {
        this.imageToolsEnabled = enabled;
        this.view.setToggles(this.textSelectionEnabled, this.imageToolsEnabled);
    }

    updateConnectionSettings(settings) {
        this.connectionData = { ...this.connectionData, ...settings };

        // Legacy compat: If provider missing but useOfficialApi is true, set to official
        if (!this.connectionData.provider) {
            if (settings.useOfficialApi === true) this.connectionData.provider = 'official';
            else this.connectionData.provider = DEFAULT_PROVIDER;
        }

        this.view.setConnectionSettings(this.connectionData);
    }

    updateAppVersion(version) {
        if (!this.view) return;
        this.view.setAppVersion(version);
    }

    updateSidePanelScope(scope) {
        this.sidePanelScope = scope || DEFAULT_SIDE_PANEL_SCOPE;
        this.view.setSidePanelScope(this.sidePanelScope);
    }

    updateContextSettings(settings) {
        this.contextSettings = {
            mode: settings?.mode === 'recent' ? 'recent' : DEFAULT_CONTEXT_MODE,
            recentTurns: this.normalizeRecentTurns(settings?.recentTurns),
        };
        this.view.setContextSettings(this.contextSettings);
    }

    normalizeRecentTurns(value) {
        const parsed = Number.parseInt(value, 10);
        if (!Number.isFinite(parsed)) return DEFAULT_CONTEXT_RECENT_TURNS;
        return Math.min(50, Math.max(1, parsed));
    }

    updateMcpTestResult(result) {
        if (
            !this.view ||
            !this.view.connection ||
            typeof this.view.connection.setMcpTestStatus !== 'function'
        )
            return;

        if (result && result.ok === true) {
            const count = typeof result.toolsCount === 'number' ? result.toolsCount : 0;
            this.view.connection.setMcpTestStatus(formatT('mcpConnectedTools', { count }), false);
            return;
        }

        const err = result && result.error ? result.error : t('mcpConnectionFailed');
        this.view.connection.setMcpTestStatus(formatT('mcpFailed', { error: err }), true);
    }

    updateMcpToolsResult(result) {
        if (
            !this.view ||
            !this.view.connection ||
            typeof this.view.connection.setMcpToolsList !== 'function'
        )
            return;

        if (!result || result.ok !== true) {
            const err = result && result.error ? result.error : t('mcpFetchToolsFailed');
            this.view.connection.setMcpTestStatus(formatT('mcpFailed', { error: err }), true);
            return;
        }

        this.view.connection.setMcpToolsList(
            result.serverId || null,
            result.transport || 'sse',
            result.url || '',
            Array.isArray(result.tools) ? result.tools : [],
            result.requestKey || null
        );
    }

    updateSidebarBehavior(behavior) {
        this.sidebarBehavior = behavior || 'auto';
        this.view.setSidebarBehavior(this.sidebarBehavior);
    }

    updateAccountIndices(indicesString) {
        this.accountIndices = indicesString || '0';
        this.view.setAccountIndices(this.accountIndices);
    }

    async refreshGithubMetadata() {
        if (this.view.hasFetchedStars()) return;

        try {
            const { stars, latestVersion } = await fetchGithubMetadata();

            if (stars != null) {
                this.view.displayStars(stars);
            }

            if (latestVersion) {
                const currentVersion = this.view.getCurrentVersion() || 'v0.0.0';
                const isNewer = compareVersionStrings(latestVersion, currentVersion) > 0;
                this.view.displayUpdateStatus(latestVersion, currentVersion, isNewer);
            }
        } catch (error) {
            console.warn('GitHub fetch failed', error);
            this.view.displayStars(null);
        }
    }
}

import {
    DEFAULT_MCP_HTTP_URL,
    DEFAULT_MCP_SSE_URL,
    DEFAULT_MCP_TRANSPORT,
    DEFAULT_MCP_WS_URL,
    DEFAULT_OFFICIAL_BASE_URL,
    DEFAULT_OFFICIAL_MODELS,
    DEFAULT_OPENAI_MODEL,
    DEFAULT_PROVIDER,
    DEFAULT_STORED_GEMINI_MODEL,
    DEFAULT_THINKING_LEVEL,
} from '../config/constants.js';
import { createPrefixedId } from '../utils/index.js';
import { normalizeOpenAIWebSearchSettings } from './openai.js';

export const CONNECTION_STORAGE_KEYS = [
    'geminiProvider',
    'geminiUseOfficialApi',
    'geminiModel',
    'geminiOfficialBaseUrl',
    'geminiApiKey',
    'geminiOfficialModel',
    'geminiThinkingLevel',
    'geminiOfficialWebSearch',
    'geminiOpenaiBaseUrl',
    'geminiOpenaiApiKey',
    'geminiOpenaiModel',
    'geminiOpenaiSelectedModel',
    'geminiOpenaiThinkingLevel',
    'geminiOpenaiUseResponsesApi',
    'geminiOpenaiWebSearchMode',
    'geminiOpenaiWebSearch',
    'geminiMcpEnabled',
    'geminiMcpTransport',
    'geminiMcpServerUrl',
    'geminiMcpServers',
    'geminiMcpActiveServerId',
];

export const GEMINI_OPENAI_WEB_SEARCH_KEYS = {
    useResponsesApiKey: 'geminiOpenaiUseResponsesApi',
    webSearchKey: 'geminiOpenaiWebSearch',
    webSearchModeKey: 'geminiOpenaiWebSearchMode',
};

export const LEGACY_OPENAI_WEB_SEARCH_KEYS = {
    fallbackUseResponsesApiKey: 'openaiUseResponsesApi',
    fallbackWebSearchKey: 'openaiWebSearch',
    fallbackWebSearchModeKey: 'openaiWebSearchMode',
};

export function getOpenAIWebSearchStorageKeys({ includeLegacyFallbacks = false } = {}) {
    return includeLegacyFallbacks
        ? { ...GEMINI_OPENAI_WEB_SEARCH_KEYS, ...LEGACY_OPENAI_WEB_SEARCH_KEYS }
        : GEMINI_OPENAI_WEB_SEARCH_KEYS;
}

export function getConnectionProvider(data = {}) {
    return (
        data.geminiProvider || (data.geminiUseOfficialApi === true ? 'official' : DEFAULT_PROVIDER)
    );
}

export function getSelectedModelForProvider(data = {}, provider = getConnectionProvider(data)) {
    if (provider === 'openai') {
        return data.geminiOpenaiSelectedModel || data.geminiModel || DEFAULT_OPENAI_MODEL;
    }

    return data.geminiModel || DEFAULT_STORED_GEMINI_MODEL;
}

export function createConnectionSettingsPayload(data = {}, options = {}) {
    const provider = getConnectionProvider(data);
    const selectedModel = getSelectedModelForProvider(data, provider);
    const openaiSettings = normalizeOpenAIWebSearchSettings(
        data,
        getOpenAIWebSearchStorageKeys(options)
    );

    return {
        provider,
        useOfficialApi: data.geminiUseOfficialApi === true,
        selectedModel,
        openaiSelectedModel: data.geminiOpenaiSelectedModel || '',
        officialBaseUrl: data.geminiOfficialBaseUrl || DEFAULT_OFFICIAL_BASE_URL,
        apiKey: data.geminiApiKey || '',
        officialModel: data.geminiOfficialModel || DEFAULT_OFFICIAL_MODELS,
        thinkingLevel: data.geminiThinkingLevel || DEFAULT_THINKING_LEVEL,
        officialWebSearch: data.geminiOfficialWebSearch === true,
        openaiBaseUrl: data.geminiOpenaiBaseUrl || '',
        openaiApiKey: data.geminiOpenaiApiKey || '',
        openaiModel: data.geminiOpenaiModel || '',
        openaiThinkingLevel: data.geminiOpenaiThinkingLevel || DEFAULT_THINKING_LEVEL,
        openaiUseResponsesApi: openaiSettings.useResponsesApi,
        openaiWebSearch: openaiSettings.webSearch,
        mcpEnabled: data.geminiMcpEnabled === true,
        mcpTransport: data.geminiMcpTransport || DEFAULT_MCP_TRANSPORT,
        mcpServerUrl: data.geminiMcpServerUrl || DEFAULT_MCP_HTTP_URL,
        mcpServers: Array.isArray(data.geminiMcpServers) ? data.geminiMcpServers : null,
        mcpActiveServerId: data.geminiMcpActiveServerId || null,
    };
}

export function createConnectionStorageUpdate(payload = {}) {
    return {
        geminiProvider: payload.provider,
        geminiUseOfficialApi: payload.provider === 'official',
        geminiOfficialBaseUrl: payload.officialBaseUrl || DEFAULT_OFFICIAL_BASE_URL,
        geminiApiKey: payload.apiKey || '',
        geminiOfficialModel: payload.officialModel || DEFAULT_OFFICIAL_MODELS,
        geminiThinkingLevel: payload.thinkingLevel || DEFAULT_THINKING_LEVEL,
        geminiOfficialWebSearch: payload.officialWebSearch === true,
        geminiOpenaiBaseUrl: payload.openaiBaseUrl || '',
        geminiOpenaiApiKey: payload.openaiApiKey || '',
        geminiOpenaiModel: payload.openaiModel || '',
        geminiOpenaiThinkingLevel: payload.openaiThinkingLevel || DEFAULT_THINKING_LEVEL,
        geminiOpenaiUseResponsesApi: payload.openaiUseResponsesApi === true,
        geminiOpenaiWebSearch: payload.openaiWebSearch === true,
        geminiMcpEnabled: payload.mcpEnabled === true,
        geminiMcpTransport: payload.mcpTransport || DEFAULT_MCP_TRANSPORT,
        geminiMcpServerUrl: payload.mcpServerUrl || '',
        geminiMcpServers: Array.isArray(payload.mcpServers) ? payload.mcpServers : [],
        geminiMcpActiveServerId: payload.mcpActiveServerId || null,
    };
}

export function getDefaultMcpUrlForTransport(transport) {
    const normalized = String(transport || DEFAULT_MCP_TRANSPORT).toLowerCase();
    if (normalized === 'ws' || normalized === 'websocket') return DEFAULT_MCP_WS_URL;
    if (normalized === 'streamable-http' || normalized === 'streamablehttp') {
        return DEFAULT_MCP_HTTP_URL;
    }
    return DEFAULT_MCP_SSE_URL;
}

export function createDefaultMcpServer(id = createPrefixedId('srv')) {
    return {
        id,
        name: 'Local Proxy',
        transport: DEFAULT_MCP_TRANSPORT,
        url: DEFAULT_MCP_HTTP_URL,
        headers: {},
        enabled: true,
        toolMode: 'all',
        enabledTools: [],
    };
}

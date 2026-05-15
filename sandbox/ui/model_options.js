import {
    DEFAULT_OFFICIAL_MODEL,
    DEFAULT_OPENAI_MODEL,
    DEFAULT_PROVIDER,
} from '../../shared/config/constants.js';
import { createWebModelOptions } from '../../shared/models/web_models.js';
import { t } from '../core/i18n.js';

export function getModelProvider(settings) {
    return settings.provider || (settings.useOfficialApi === true ? 'official' : DEFAULT_PROVIDER);
}

function parseConfiguredModels(rawModels) {
    return String(rawModels || '')
        .split(',')
        .map((model) => model.trim())
        .filter(Boolean);
}

export function createModelOptions(settings) {
    const provider = getModelProvider(settings);

    if (provider === 'official') {
        const models = parseConfiguredModels(settings.officialModel);
        return models.length > 0
            ? models.map((model) => ({ val: model, txt: model }))
            : [{ val: DEFAULT_OFFICIAL_MODEL, txt: DEFAULT_OFFICIAL_MODEL }];
    }

    if (provider === 'openai') {
        const models = parseConfiguredModels(settings.openaiModel);
        return models.length > 0
            ? models.map((model) => ({ val: model, txt: model }))
            : [{ val: DEFAULT_OPENAI_MODEL, txt: t('customModel') }];
    }

    return createWebModelOptions();
}

export function getPreferredModel(settings, currentValue) {
    const provider = getModelProvider(settings);
    if (provider === 'openai') {
        return settings.openaiSelectedModel || settings.selectedModel || currentValue;
    }
    return settings.selectedModel || currentValue;
}

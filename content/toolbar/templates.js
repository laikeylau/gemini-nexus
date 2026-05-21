(function () {
    const ICONS = window.GeminiToolbarIcons || {};
    // Combine modular styles (loaded previously)
    const STYLES = window.GeminiToolbarStyles || '';
    const WEB_MODEL_OPTIONS = window.GeminiWebModels.createOptionMarkup();

    function buildTranslationTargetOptions(t) {
        const options = t.translationTargetOptions || [];
        return options
            .map(
                (option) => `
                    <label class="translation-target-option">
                        <input type="checkbox" name="translation-target" value="${option.value}" ${option.value === 'auto' ? 'checked' : ''}>
                        <div class="selection-check">
                            ${ICONS.CHECK}
                        </div>
                        <span>${option.label}</span>
                    </label>
                `
            )
            .join('');
    }

    function getDefaultTranslationTargetLabel(t) {
        return (
            (t.translationTargetOptions || []).find((option) => option.value === 'auto')?.label ||
            'Auto'
        );
    }

    function buildTranslationTargetMarkup(t) {
        return `
            <div class="translation-targets hidden" id="translation-targets" aria-label="${t.translateTargetLabel}">
                <span class="translation-targets-label">${t.translateTargetLabel}</span>
                <div class="translation-target-dropdown" id="translation-target-dropdown">
                    <button type="button" class="translation-target-trigger" id="translation-target-trigger" aria-haspopup="true" aria-expanded="false">
                        <span class="translation-target-summary" id="translation-target-summary">${getDefaultTranslationTargetLabel(t)}</span>
                        <span class="translation-target-caret" aria-hidden="true">${ICONS.CHEVRON_RIGHT}</span>
                    </button>
                    <div class="translation-target-menu hidden" id="translation-target-menu">
                        <div class="translation-target-options" id="translation-target-options">
                            ${buildTranslationTargetOptions(t)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function buildMainStructure() {
        const t = window.GeminiToolbarStrings || {};
        const toolbarHTML = `
        <!-- Quick Actions Toolbar (Dark Theme) -->
        <div class="toolbar" id="toolbar">
            <div class="toolbar-drag-handle" id="toolbar-drag">${ICONS.DRAG}</div>
            <button class="btn" id="btn-ask" title="${t.askAi}">${ICONS.LOGO}</button>
            <button class="btn" id="btn-copy" title="${t.copy}">${ICONS.COPY}</button>
            <button class="btn hidden" id="btn-grammar" title="${t.fixGrammar}">${ICONS.GRAMMAR}</button>
            <button class="btn" id="btn-translate" title="${t.translate}">${ICONS.TRANSLATE}</button>
            <button class="btn" id="btn-explain" title="${t.explain}">${ICONS.EXPLAIN}</button>
            <button class="btn" id="btn-summarize" title="${t.summarize}">${ICONS.SUMMARIZE}</button>
            <div class="custom-selection-tools" id="custom-selection-tools"></div>
            <div class="custom-selection-more hidden" id="custom-selection-more">
                <button class="btn" id="btn-custom-selection-more" title="${t.customSelectionMore || 'More custom tools'}">${ICONS.TOOLS}</button>
                <div class="custom-selection-more-menu" id="custom-selection-more-menu"></div>
            </div>
        </div>
    `;

        const imageMenuHTML = `
        <!-- Image Button / AI Tools Menu -->
        <div class="image-btn" id="image-btn">
            <div class="ai-tool-trigger" title="${t.aiTools}">
                ${ICONS.LOGO}
            </div>
            <div class="ai-tool-menu">
                <div class="menu-item" id="btn-image-chat">
                    ${ICONS.CHAT_BUBBLE} <span>${t.chatWithImage}</span>
                </div>
                <div class="menu-item" id="btn-image-describe">
                    ${ICONS.IMAGE_EYE} <span>${t.describeImage}</span>
                </div>
                <div class="menu-item" id="btn-image-extract">
                    ${ICONS.SCAN_TEXT} <span>${t.extractText}</span>
                </div>
                <div class="menu-item" id="btn-image-translate">
                    ${ICONS.TRANSLATE} <span>${t.translateImageText}</span>
                </div>

                <div class="menu-item has-submenu">
                    ${ICONS.TOOLS} <span>${t.imageTools}</span>
                    <div class="submenu-arrow">${ICONS.CHEVRON_RIGHT}</div>

                    <div class="submenu">
                        <div class="menu-item" id="btn-image-remove-bg">${ICONS.REMOVE_BG} <span>${t.removeBg}</span></div>
                        <div class="menu-item" id="btn-image-remove-text">${ICONS.REMOVE_TEXT} <span>${t.removeText}</span></div>
                        <div class="menu-item" id="btn-image-remove-watermark">${ICONS.REMOVE_WATERMARK} <span>${t.removeWatermark}</span></div>
                        <div class="menu-item" id="btn-image-upscale">${ICONS.UPSCALE} <span>${t.upscale}</span></div>
                        <div class="menu-item" id="btn-image-expand">${ICONS.EXPAND} <span>${t.expand}</span></div>
                    </div>
                </div>
            </div>
        </div>
    `;

        const windowHTML = `
        <!-- Main Ask Window (Light Theme, Resizable) -->
        <div class="ask-window" id="ask-window">
            <div class="ask-header" id="ask-header">
                <div class="header-title-group">
                    <span class="window-title" id="window-title">${t.windowTitle}</span>
                    ${buildTranslationTargetMarkup(t)}
                </div>
                <div class="header-actions">
                    <select id="ask-provider-select" class="ask-provider-select" title="${t.toolbarProviderLabel || 'Popup provider'}">
                        <option value="web">${t.providerWebShort || 'Web'}</option>
                        <option value="official">${t.providerOfficialShort || 'API'}</option>
                        <option value="openai">${t.providerOpenAIShort || 'OpenAI'}</option>
                    </select>
                    <select id="ask-model-select" class="ask-model-select">
                        ${WEB_MODEL_OPTIONS}
                    </select>
                    <button class="icon-btn" id="btn-header-close" title="${t.close}">${ICONS.CLOSE}</button>
                </div>
            </div>

            <div class="window-body">
                <div class="input-container">
                    <input type="text" id="ask-input" placeholder="${t.askPlaceholder}" autocomplete="off">
                </div>

                <div class="context-preview hidden" id="context-preview"></div>

                <div class="result-area" id="result-area">
                    <div class="markdown-body" id="result-text"></div>
                </div>
            </div>

            <div class="window-footer" id="window-footer">
                <!-- Footer actions shown after a result is available. -->
                <div class="footer-actions hidden" id="footer-actions">
                    <div class="footer-left">
                        <button class="footer-btn" id="btn-retry" title="${t.retry}">
                            ${ICONS.RETRY}
                        </button>
                        <button class="footer-btn text-btn" id="btn-continue-chat" title="${t.openSidebar}">
                            ${ICONS.CONTINUE} <span>${t.chat}</span>
                        </button>
                    </div>
                    <div class="footer-right">
                        <button class="footer-btn text-btn hidden" id="btn-insert" title="${t.insertTooltip}">
                            ${ICONS.INSERT} <span>${t.insert}</span>
                        </button>
                        <button class="footer-btn text-btn hidden" id="btn-replace" title="${t.replaceTooltip}">
                            ${ICONS.REPLACE} <span>${t.replace}</span>
                        </button>
                         <button class="footer-btn" id="btn-copy-result" title="${t.copyResult}">
                            ${ICONS.COPY}
                        </button>
                    </div>
                </div>

                <!-- Stop Button (Shown when generating) -->
                <div class="footer-stop hidden" id="footer-stop">
                    <button class="stop-pill-btn" id="btn-stop-gen">
                        ${ICONS.STOP} ${t.stopGenerating}
                    </button>
                </div>
            </div>
        </div>
    `;

        return `
            <style>${STYLES}</style>
            ${toolbarHTML}
            ${imageMenuHTML}
            ${windowHTML}
        `;
    }

    window.GeminiToolbarTemplates = {
        get mainStructure() {
            return buildMainStructure();
        },
    };
})();

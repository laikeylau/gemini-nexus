(function () {
    const DOMBuilder = window.GeminiToolbarDOM;
    const View = window.GeminiToolbarView;
    const DragController = window.GeminiDragController;
    const Events = window.GeminiToolbarEvents;
    const GrammarManager = window.GeminiUIGrammar;
    const Renderer = window.GeminiUIRenderer;
    const ActionsDelegate = window.GeminiToolbarUIActions;
    const CodeCopyHandler = window.GeminiCodeCopyHandler;

    function getStrings() {
        return window.GeminiToolbarStrings || {};
    }

    const TRANSLATION_TARGET_STORAGE_KEY = 'geminiTranslationTargets';

    function normalizeTranslationTargets(targets) {
        const normalizer = window.GeminiToolbarI18n?.normalizeTranslationTargets;
        if (typeof normalizer === 'function') return normalizer(targets);
        return Array.isArray(targets) && targets.length > 0 ? targets : ['auto'];
    }

    /**
     * Main UI Manager
     * Handles lifecycle, view orchestration, and public interface for the Controller.
     */
    class ToolbarUI {
        constructor() {
            this.host = null;
            this.shadow = null;
            this.view = null;
            this.dragController = null;
            this.events = null;
            this.domBuilder = new DOMBuilder();
            this.callbacks = {};
            this.isBuilt = false;
            this.provider = 'web';
            this.customSelectionTools = [];
            this.translationTargets = normalizeTranslationTargets(
                getStrings().defaultTranslationTargets || ['auto']
            );

            this.grammarManager = null;
            this.bridge = null; // Renderer Bridge
            this.renderer = null;
            this.actionsDelegate = null;
            this.codeCopyHandler = null;
        }

        setCallbacks(callbacks) {
            this.callbacks = callbacks;
        }

        _initializeRuntimeComponents({ createBridge = false } = {}) {
            this.view = new View(this.shadow);
            this.grammarManager = new GrammarManager(this.view);

            if (createBridge) {
                this.bridge = new window.GeminiRendererBridge(this.host);
            }

            this.renderer = new Renderer(this.view, this.bridge);
            this.actionsDelegate = new ActionsDelegate(this);
            this.codeCopyHandler = new CodeCopyHandler();
            this.dragController = new DragController(
                this.view.elements.askWindow,
                this.view.elements.askHeader,
                {
                    onSnap: (side, top) => this.view.dockWindow(side, top),
                    onUndock: () => this.view.undockWindow(),
                }
            );

            new DragController(this.view.elements.toolbar, this.view.elements.toolbarDrag, {});

            this.events = new Events(this);
            this.events.bind(this.view.elements, this.view.elements.askWindow);
            this.view.setSelectedTranslationTargets(this.translationTargets);
            this.renderCustomSelectionTools();
        }

        build() {
            if (this.isBuilt) return;

            const { host, shadow } = this.domBuilder.create();
            this.host = host;
            this.shadow = shadow;

            this._initializeRuntimeComponents({ createBridge: true });
            this.isBuilt = true;
            this.restoreTranslationTargets();
        }

        rebuildForLanguageChange() {
            if (!this.isBuilt || !this.domBuilder || !this.domBuilder.rerender) return;
            this.domBuilder.rerender();
            this._initializeRuntimeComponents();
            this.renderCustomSelectionTools();
        }

        get actions() {
            return this.actionsDelegate;
        }

        get codeCopy() {
            return this.codeCopyHandler;
        }

        handleImageClick() {
            this.fireCallback('onAction', 'image_analyze');
        }

        handleImageHover(isHovering) {
            this.fireCallback('onImageBtnHover', isHovering);
        }

        handleModelChange(model) {
            this.fireCallback('onModelChange', model);
        }

        handleProviderChange(provider) {
            this.provider = provider || 'web';
            this.fireCallback('onProviderChange', this.provider);
        }

        setCustomSelectionTools(tools) {
            this.customSelectionTools = Array.isArray(tools) ? tools : [];
            this.renderCustomSelectionTools();
        }

        renderCustomSelectionTools() {
            if (!this.view?.elements) return;

            const { customSelectionTools, customSelectionMore, customSelectionMoreMenu } =
                this.view.elements;
            if (!customSelectionTools || !customSelectionMore || !customSelectionMoreMenu) return;

            customSelectionTools.replaceChildren();
            customSelectionMoreMenu.replaceChildren();

            const enabledTools = this.customSelectionTools.filter(
                (tool) => tool?.enabled !== false && tool?.name && tool?.prompt
            );
            const directTools = enabledTools.slice(0, 2);
            const menuTools = enabledTools.slice(2);

            directTools.forEach((tool) => {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'btn custom-selection-tool-btn';
                button.title = tool.name;
                button.setAttribute('aria-label', tool.name);
                button.textContent = this.getToolButtonLabel(tool.name);
                button.addEventListener('mousedown', (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    this.fireCallback('onAction', 'custom_selection_tool', tool);
                });
                customSelectionTools.appendChild(button);
            });

            menuTools.forEach((tool) => {
                const item = document.createElement('button');
                item.type = 'button';
                item.className = 'custom-selection-more-item';
                item.textContent = tool.name;
                item.addEventListener('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    this.fireCallback('onAction', 'custom_selection_tool', tool);
                });
                customSelectionMoreMenu.appendChild(item);
            });

            customSelectionMore.classList.toggle('hidden', menuTools.length === 0);
        }

        getToolButtonLabel(name) {
            const normalized = String(name || '').trim();
            if (!normalized) return '+';
            return normalized.slice(0, 2).toUpperCase();
        }

        handleTranslationTargetsChange(targets) {
            this.translationTargets = normalizeTranslationTargets(targets);
            this.view.setSelectedTranslationTargets(this.translationTargets);

            const storage = globalThis.chrome?.storage?.local;
            if (!storage || typeof storage.set !== 'function') return;
            storage
                .set({ [TRANSLATION_TARGET_STORAGE_KEY]: this.translationTargets })
                .catch?.(() => {});
        }

        async restoreTranslationTargets() {
            const storage = globalThis.chrome?.storage?.local;
            if (!storage || typeof storage.get !== 'function') return;

            try {
                const stored = await storage.get(TRANSLATION_TARGET_STORAGE_KEY);
                this.translationTargets = normalizeTranslationTargets(
                    stored?.[TRANSLATION_TARGET_STORAGE_KEY]
                );
                this.view?.setSelectedTranslationTargets(this.translationTargets);
            } catch (_) {
                this.view?.setSelectedTranslationTargets(this.translationTargets);
            }
        }

        saveWindowDimensions(width, height) {
            const storage = globalThis.chrome?.storage?.local;
            if (!storage || typeof storage.set !== 'function') return;
            storage.set({ gemini_nexus_window_size: { w: width, h: height } }).catch?.(() => {});
        }

        fireCallback(type, ...args) {
            if (type === 'onImageBtnHover' && this.callbacks.onImageBtnHover) {
                this.callbacks.onImageBtnHover(...args);
            } else if (type === 'onModelChange' && this.callbacks.onModelChange) {
                this.callbacks.onModelChange(...args);
            } else if (type === 'onProviderChange' && this.callbacks.onProviderChange) {
                this.callbacks.onProviderChange(...args);
            } else if (this.callbacks.onAction) {
                this.callbacks.onAction(...args);
            }
        }

        show(rect, mousePoint) {
            this.view.showToolbar(rect, mousePoint);
        }

        hide() {
            this.view.hideToolbar();
        }

        hideAll() {
            this.hide();
            this.hideAskWindow();
            this.hideImageButton();
        }

        showImageButton(rect) {
            this.view.showImageButton(rect);
        }

        hideImageButton() {
            this.view.hideImageButton();
        }

        showAskWindow(
            rect,
            contextText,
            title = getStrings().ask || 'Ask Gemini',
            mousePoint = null
        ) {
            return this.view.showAskWindow(
                rect,
                contextText,
                title,
                () => this.dragController.reset(),
                mousePoint
            );
        }

        showLoading(msg) {
            this.view.showLoading(msg);
        }

        stopLoading() {
            this.view.updateStreamingState(false);
            if (this.grammarManager) {
                this.grammarManager.updateResultActions(false);
            }
        }

        async showResult(text, title, isStreaming, images = []) {
            if (this.renderer) {
                await this.renderer.show(text, title, isStreaming, images);
            }

            // Update Grammar UI state
            if (this.grammarManager) {
                this.grammarManager.updateResultActions(isStreaming);
            }
        }

        handleGeneratedImageResult(request) {
            if (this.renderer) {
                this.renderer.handleGeneratedImageResult(request);
            }
        }

        async processImage(base64) {
            if (this.bridge) {
                return this.bridge.processImage(base64);
            }
            return base64; // Fallback
        }

        showError(text) {
            this.view.showError(text);
        }

        hideAskWindow() {
            this.view.hideAskWindow();
            this.resetGrammarMode();
        }

        setInputValue(text) {
            this.view.setInputValue(text);
        }

        setTranslationTargetMode(enabled) {
            this.view.setTranslationTargetsVisible(enabled);
            if (enabled) this.view.setSelectedTranslationTargets(this.translationTargets);
        }

        toggleTranslationTargetDropdown() {
            this.view.toggleTranslationTargetDropdown();
        }

        getSelectedTranslationTargets() {
            const selected = this.view?.getSelectedTranslationTargets();
            this.translationTargets = normalizeTranslationTargets(
                selected || this.translationTargets
            );
            return this.translationTargets;
        }

        getSelectedModel() {
            return this.view ? this.view.getSelectedModel() : 'gemini-3-flash';
        }

        getProvider() {
            return this.provider;
        }

        setSelectedModel(model) {
            if (this.view) {
                this.view.setSelectedModel(model);
            }
        }

        updateModelList(settings, currentModel) {
            const provider = settings.provider || (settings.useOfficialApi ? 'official' : 'web');
            this.provider = provider;
            this.view.setSelectedProvider(provider);
            let options = [];

            if (provider === 'official') {
                const rawModels = settings.officialModel || '';
                const models = rawModels
                    .split(',')
                    .map((m) => m.trim())
                    .filter((m) => m);
                if (models.length === 0) {
                    options = [
                        {
                            value: 'gemini-3-flash-preview',
                            label: 'gemini-3-flash-preview',
                        },
                    ];
                } else {
                    options = models.map((model) => ({ value: model, label: model }));
                }
            } else if (provider === 'openai') {
                const rawModels = settings.openaiModel || '';
                const models = rawModels
                    .split(',')
                    .map((m) => m.trim())
                    .filter((m) => m);
                if (models.length === 0) {
                    options = [
                        {
                            value: 'openai_custom',
                            label: getStrings().customModel || 'Custom Model',
                        },
                    ];
                } else {
                    options = models.map((model) => ({ value: model, label: model }));
                }
            } else {
                options = window.GeminiWebModels.createOptions();
            }

            this.view.updateModelOptions(options, currentModel);
        }

        setGrammarMode(enabled, sourceElement = null, selectionRange = null) {
            if (this.grammarManager) {
                this.grammarManager.setMode(enabled, sourceElement, selectionRange);
            }
        }

        resetGrammarMode() {
            if (this.grammarManager) {
                this.grammarManager.reset();
            }
        }

        showInsertReplaceButtons(show) {
            if (this.grammarManager) {
                this.grammarManager.toggleButtons(show);
            }
        }

        getSourceInfo() {
            return this.grammarManager
                ? this.grammarManager.getSourceInfo()
                : { element: null, range: null };
        }

        showGrammarButton(show) {
            if (this.grammarManager) {
                this.grammarManager.showTriggerButton(show);
            }
        }

        showCopySelectionFeedback(success) {
            this.view.toggleCopySelectionIcon(success);
            setTimeout(() => {
                this.view.toggleCopySelectionIcon(null);
            }, 2000);
        }

        isVisible() {
            if (!this.view) return false;
            return this.view.isToolbarVisible() || this.view.isWindowVisible();
        }

        isWindowVisible() {
            if (!this.view) return false;
            return this.view.isWindowVisible();
        }

        isHost(target) {
            if (!this.view) return false;
            return this.view.isHost(target, this.host);
        }
    }

    window.GeminiToolbarUI = ToolbarUI;
})();

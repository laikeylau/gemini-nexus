import { ConnectionSection } from './sections/connection.js';
import { GeneralSection } from './sections/general.js';
import { AppearanceSection } from './sections/appearance.js';
import { ShortcutsSection } from './sections/shortcuts.js';
import { AboutSection } from './sections/about.js';
import { DOM_IDS } from './constants.js';

export class SettingsView {
    constructor(callbacks) {
        this.callbacks = callbacks || {};
        this.elements = {};
        this._escapeKeyHandler = null;

        this.connection = new ConnectionSection();

        this.general = new GeneralSection({
            onTextSelectionChange: (value) => this.fire('onTextSelectionChange', value),
            onImageToolsChange: (value) => this.fire('onImageToolsChange', value),
            onSidebarBehaviorChange: (value) => this.fire('onSidebarBehaviorChange', value),
            onSidePanelScopeChange: (value) => this.fire('onSidePanelScopeChange', value),
        });

        this.appearance = new AppearanceSection({
            onThemeChange: (value) => this.fire('onThemeChange', value),
            onLanguageChange: (value) => this.fire('onLanguageChange', value),
        });

        this.shortcuts = new ShortcutsSection();

        this.about = new AboutSection({
            onDownloadLogs: () => this.fire('onDownloadLogs'),
        });

        this.queryElements();
        this.bindEvents();
    }

    queryElements() {
        const get = (id) => document.getElementById(id);

        this.elements = {
            modal: get(DOM_IDS.MODAL),
            btnClose: get(DOM_IDS.BTN_CLOSE),
            btnSave: get(DOM_IDS.BTN_SAVE_SHORTCUTS),
            btnReset: get(DOM_IDS.BTN_RESET_SHORTCUTS),
        };
    }

    bindEvents() {
        const { modal, btnClose, btnSave, btnReset } = this.elements;

        if (btnClose) btnClose.addEventListener('click', () => this.close());
        if (modal) {
            modal.addEventListener('click', (clickEvent) => {
                if (clickEvent.target === modal) this.close();
            });
        }

        if (btnSave) btnSave.addEventListener('click', () => this.handleSave());
        if (btnReset) btnReset.addEventListener('click', () => this.handleReset());

        // Tab switching logic for the split settings layout
        const tabs = document.querySelectorAll('.settings-tab');
        const sections = document.querySelectorAll('.settings-section');
        const tabTitle = document.getElementById('settings-tab-title');

        tabs.forEach((tab) => {
            tab.addEventListener('click', () => {
                const targetTab = tab.getAttribute('data-tab');

                tabs.forEach((t) => t.classList.remove('active'));
                sections.forEach((s) => s.classList.remove('active'));

                tab.classList.add('active');
                const activeSection = document.querySelector(
                    `.settings-section[data-section="${targetTab}"]`
                );
                if (activeSection) activeSection.classList.add('active');

                // Update tab title and i18n
                if (tabTitle) {
                    const labelSpan = tab.querySelector('.tab-label');
                    if (labelSpan) {
                        tabTitle.textContent = labelSpan.textContent;
                        const i18nKey = labelSpan.getAttribute('data-i18n');
                        if (i18nKey) {
                            tabTitle.setAttribute('data-i18n', i18nKey);
                        } else {
                            tabTitle.removeAttribute('data-i18n');
                        }
                    }
                }
            });
        });
    }

    handleSave() {
        const data = this.getFormData();

        this.fire('onSave', data);
        this.close();
    }

    getFormData() {
        const shortcutsData = this.shortcuts.getData();
        const connectionData = this.connection.getData();
        const generalData = this.general.getData();

        return {
            shortcuts: shortcutsData,
            connection: connectionData,
            textSelection: generalData.textSelection,
            textSelectionBlacklist: generalData.textSelectionBlacklist,
            customSelectionTools: generalData.customSelectionTools,
            imageTools: generalData.imageTools,
            accountIndices: generalData.accountIndices,
            sidebarBehavior: generalData.sidebarBehavior,
            sidePanelScope: generalData.sidePanelScope,
            contextMode: generalData.contextMode,
            contextRecentTurns: generalData.contextRecentTurns,
        };
    }

    handleReset() {
        this.fire('onReset');
    }

    open() {
        if (this.elements.modal) {
            this.elements.modal.classList.add('visible');

            // Reset to the connection tab on open
            const firstTab = document.querySelector('.settings-tab[data-tab="connection"]');
            if (firstTab) firstTab.click();

            // Bind Escape key event listener safely
            if (!this._escapeKeyHandler) {
                this._escapeKeyHandler = (keyEvent) => {
                    if (
                        keyEvent.key === 'Escape' &&
                        this.elements.modal &&
                        this.elements.modal.classList.contains('visible')
                    ) {
                        this.close();
                    }
                };
                document.addEventListener('keydown', this._escapeKeyHandler);
            }

            this.fire('onOpen');
        }
    }

    close() {
        if (this.elements.modal) {
            this.elements.modal.classList.remove('visible');
        }

        // Safely unbind Escape key event listener
        if (this._escapeKeyHandler) {
            document.removeEventListener('keydown', this._escapeKeyHandler);
            this._escapeKeyHandler = null;
        }
    }

    // Delegation to Shortcuts
    setShortcuts(shortcuts) {
        this.shortcuts.setData(shortcuts);
    }

    // Delegation to Appearance
    setThemeValue(theme) {
        this.appearance.setTheme(theme);
    }

    setLanguageValue(lang) {
        this.appearance.setLanguage(lang);
    }

    applyVisualTheme(theme) {
        this.appearance.applyVisualTheme(theme);
    }

    // Delegation to General
    setToggles(textSelection, imageTools) {
        this.general.setToggles(textSelection, imageTools);
    }

    setTextSelectionBlacklist(value) {
        this.general.setTextSelectionBlacklist(value);
    }

    setCustomSelectionTools(tools) {
        this.general.setCustomSelectionTools(tools);
    }

    setSidebarBehavior(behavior) {
        this.general.setSidebarBehavior(behavior);
    }

    setAccountIndices(value) {
        this.general.setAccountIndices(value);
    }

    setSidePanelScope(scope) {
        this.general.setSidePanelScope(scope);
    }

    setContextSettings(settings) {
        this.general.setContextSettings(settings);
    }

    // Delegation to Connection
    setConnectionSettings(data) {
        this.connection.setData(data);
    }

    // Delegation to About
    displayStars(count) {
        this.about.displayStars(count);
    }

    hasFetchedStars() {
        return this.about.hasFetchedStars();
    }

    getCurrentVersion() {
        return this.about.getCurrentVersion();
    }

    displayUpdateStatus(latest, current, isUpdateAvailable) {
        this.about.displayUpdateStatus(latest, current, isUpdateAvailable);
    }

    setAppVersion(version) {
        this.about.setCurrentVersion(version);
    }

    fire(event, data) {
        if (this.callbacks[event]) this.callbacks[event](data);
    }
}

export const ShortcutsSettingsTemplate = `
<div class="setting-group">
    <h4 data-i18n="keyboardShortcuts">Keyboard Shortcuts</h4>

    <div class="setting-panel">
        <div class="setting-panel-header">
            <h5>
                <span data-i18n="keyboardShortcuts">Keyboard Shortcuts</span>
                <button type="button" class="setting-help" aria-label="Help" data-i18n-title="shortcutDesc" title="Click input and press keys to change.">?</button>
            </h5>
        </div>

        <div class="setting-shortcut-list">
            <label class="setting-panel-row setting-shortcut-row">
                <span class="setting-shortcut-title" data-i18n="quickAsk">Quick Ask (Floating)</span>
                <input type="text" id="shortcut-quick-ask" class="shortcut-input" readonly value="Ctrl+G">
            </label>

            <label class="setting-panel-row setting-shortcut-row">
                <span class="setting-shortcut-title" data-i18n="openSidePanel">Open Side Panel</span>
                <input type="text" id="shortcut-open-panel" class="shortcut-input" readonly value="Alt+S">
            </label>

            <label class="setting-panel-row setting-shortcut-row">
                <span class="setting-shortcut-title" data-i18n="shortcutBrowserControl">Open Browser Control</span>
                <input type="text" id="shortcut-browser-control" class="shortcut-input" readonly value="Ctrl+B">
            </label>

            <label class="setting-panel-row setting-shortcut-row setting-shortcut-static-row">
                <span class="setting-shortcut-title" data-i18n="shortcutFocusInput">Focus Input</span>
                <input type="text" class="shortcut-input" readonly value="Ctrl+P">
            </label>

            <label class="setting-panel-row setting-shortcut-row setting-shortcut-static-row">
                <span class="setting-shortcut-title" data-i18n="shortcutSwitchModel">Switch Model</span>
                <input type="text" class="shortcut-input" readonly value="Tab">
            </label>
        </div>
    </div>

</div>`;

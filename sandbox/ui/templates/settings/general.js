export const GeneralSettingsTemplate = `
<div class="setting-group">
    <h4 data-i18n="general">General</h4>

    <div class="setting-panel setting-panel-row">
        <div class="setting-panel-header">
            <h5>
                <span data-i18n="textSelection">Text Selection Toolbar</span>
                <button type="button" class="setting-help" aria-label="Help" data-i18n-title="textSelectionDesc" title="Show floating toolbar when selecting text.">?</button>
            </h5>
        </div>
        <input type="checkbox" id="text-selection-toggle" class="setting-toggle">
    </div>

    <div class="setting-panel setting-panel-row">
        <div class="setting-panel-header">
            <h5>
                <span data-i18n="imageToolsToggle">Show Image Tools Button</span>
                <button type="button" class="setting-help" aria-label="Help" data-i18n-title="imageToolsToggleDesc" title="Show the AI button when hovering over images.">?</button>
            </h5>
        </div>
        <input type="checkbox" id="image-tools-toggle" class="setting-toggle">
    </div>

    <div class="setting-panel setting-panel-row">
        <div class="setting-panel-header">
            <h5>
                <span data-i18n="accountIndices">Account Indices</span>
                <button type="button" class="setting-help" aria-label="Help" data-i18n-title="accountIndicesDesc" title="Comma-separated user indices (e.g., 0, 1, 2) for polling.">?</button>
            </h5>
        </div>
        <input type="text" id="account-indices-input" class="shortcut-input setting-panel-small-input" placeholder="0">
    </div>

    <div class="setting-panel">
        <div class="setting-panel-header">
            <h5>
                <span data-i18n="contextManagement">Context Management</span>
                <button type="button" class="setting-help" aria-label="Help" data-i18n-title="contextModeDesc" title="Summarize older messages or keep only recent turns for API providers.">?</button>
            </h5>
        </div>

        <div class="setting-panel-grid">
            <label class="setting-field">
                <span data-i18n="contextMode">Mode</span>
                <select id="context-mode-select" class="shortcut-input">
                    <option value="summary" data-i18n="contextModeSummary">Summary compression</option>
                    <option value="recent" data-i18n="contextModeRecent">Recent turns only</option>
                </select>
            </label>

            <div class="setting-field setting-field-number">
                <label class="setting-field-label" for="context-recent-turns-input">
                    <span data-i18n="contextRecentTurns">Recent turns</span>
                </label>
                <button type="button" class="setting-help" aria-label="Help" data-i18n-title="contextRecentTurnsDesc" title="Number of latest user turns kept verbatim.">?</button>
                <input type="number" id="context-recent-turns-input" class="shortcut-input" min="1" max="50" step="1" value="10">
            </div>
        </div>
    </div>

    <div class="setting-panel">
        <div class="setting-panel-header">
            <h5 data-i18n="sidebarBehavior">When Sidebar Reopens</h5>
        </div>

        <div class="setting-radio-list">
            <div class="setting-radio-option">
                <label class="setting-radio-choice">
                    <input type="radio" name="sidebar-behavior" value="auto">
                    <span class="setting-radio-title" data-i18n="sidebarBehaviorAuto">Auto restore or restart</span>
                </label>
                <button type="button" class="setting-help" aria-label="Help" data-i18n-title="sidebarBehaviorAutoDesc" title="Restore if opened within 10 mins, otherwise start new chat.">?</button>
            </div>

            <label class="setting-radio-option">
                <input type="radio" name="sidebar-behavior" value="restore">
                <span class="setting-radio-title" data-i18n="sidebarBehaviorRestore">Always restore previous chat</span>
            </label>

            <label class="setting-radio-option">
                <input type="radio" name="sidebar-behavior" value="new">
                <span class="setting-radio-title" data-i18n="sidebarBehaviorNew">Always start new chat</span>
            </label>
        </div>
    </div>

    <div class="setting-panel">
        <div class="setting-panel-header">
            <h5 data-i18n="sidePanelScope">Side Panel Scope</h5>
        </div>

        <div class="setting-radio-list">
            <label class="setting-radio-option">
                <input type="radio" name="sidepanel-scope" value="global">
                <span class="setting-radio-title" data-i18n="sidePanelScopeGlobal">Keep available on all tabs</span>
            </label>

            <label class="setting-radio-option">
                <input type="radio" name="sidepanel-scope" value="remembered_tabs">
                <span class="setting-radio-title" data-i18n="sidePanelScopeRememberedTabs">Remember tabs where it was opened (Recommended)</span>
            </label>
        </div>
    </div>
</div>`;

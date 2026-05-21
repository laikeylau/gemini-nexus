const HelpButtons = {
    textSelectionDesc:
        '<button type="button" class="setting-help" data-i18n-title="textSelectionDesc" title="Show floating toolbar when selecting text." aria-label="Help">?</button>',
    textSelectionBlacklistDesc:
        '<button type="button" class="setting-help" data-i18n-title="textSelectionBlacklistDesc" title="Disable the text selection toolbar on matching sites." aria-label="Help">?</button>',
    customSelectionToolsDesc:
        '<button type="button" class="setting-help" data-i18n-title="customSelectionToolsDesc" title="Add your own selection toolbar prompts." aria-label="Help">?</button>',
    imageToolsToggleDesc:
        '<button type="button" class="setting-help" data-i18n-title="imageToolsToggleDesc" title="Show the AI button when hovering over images." aria-label="Help">?</button>',
    accountIndicesDesc:
        '<button type="button" class="setting-help" data-i18n-title="accountIndicesDesc" title="Comma-separated user indices for polling." aria-label="Help">?</button>',
    contextModeDesc:
        '<button type="button" class="setting-help" data-i18n-title="contextModeDesc" title="Summarize older messages or keep recent turns." aria-label="Help">?</button>',
    contextRecentTurnsDesc:
        '<button type="button" class="setting-help" data-i18n-title="contextRecentTurnsDesc" title="Number of latest user turns kept verbatim." aria-label="Help">?</button>',
    sidebarBehaviorAutoDesc:
        '<button type="button" class="setting-help" data-i18n-title="sidebarBehaviorAutoDesc" title="Restore if opened soon, otherwise start new chat." aria-label="Help">?</button>',
};

const HelpButton = (key) => HelpButtons[key] || '';

export const GeneralSettingsTemplate = `
    <div class="setting-group">
        <h4 data-i18n="general">General</h4>

        <div class="setting-panel">
            <div class="setting-panel-row">
                <div class="setting-panel-header">
                    <h5><span data-i18n="textSelection">Text Selection Toolbar</span>${HelpButton('textSelectionDesc')}</h5>
                </div>
                <input type="checkbox" id="text-selection-toggle" class="setting-toggle">
            </div>

            <div class="settings-section-offset">
                <label class="setting-label"><span data-i18n="textSelectionBlacklist">Selection Blacklist</span>${HelpButton('textSelectionBlacklistDesc')}</label>
                <textarea id="text-selection-blacklist" class="settings-input settings-full-input settings-monospace-textarea" data-i18n-placeholder="textSelectionBlacklistPlaceholder"></textarea>
            </div>
        </div>

        <div class="setting-panel">
            <div class="setting-panel-header setting-panel-header-spaced">
                <h5><span data-i18n="customSelectionTools">Custom Selection Tools</span>${HelpButton('customSelectionToolsDesc')}</h5>
            </div>
            <div id="custom-selection-tools-list" class="custom-selection-tools-list"></div>
            <button type="button" id="add-custom-selection-tool" class="btn-secondary settings-secondary-action settings-section-offset" data-i18n="customSelectionToolAdd">Add Tool</button>
        </div>

        <div class="setting-panel setting-panel-row">
            <div class="setting-panel-header">
                <h5><span data-i18n="imageToolsToggle">Hover Image Tools</span>${HelpButton('imageToolsToggleDesc')}</h5>
            </div>
            <input type="checkbox" id="image-tools-toggle" class="setting-toggle">
        </div>

        <div class="setting-panel setting-panel-row">
            <div class="setting-panel-header">
                <h5><span data-i18n="accountIndices">Account Indices (Web)</span>${HelpButton('accountIndicesDesc')}</h5>
            </div>
            <input type="text" id="account-indices-input" class="settings-input setting-panel-small-input" placeholder="0">
        </div>

        <div class="setting-panel">
            <div class="setting-panel-header">
                <h5 data-i18n="contextManagement">Context Management</h5>
            </div>
            <div class="setting-panel-grid settings-section-offset">
                <label class="setting-field">
                    <span class="setting-field-label"><span data-i18n="contextMode">Mode</span>${HelpButton('contextModeDesc')}</span>
                    <select id="context-mode-select" class="settings-input settings-select">
                        <option value="summary" data-i18n="contextModeSummary">Summary</option>
                        <option value="recent" data-i18n="contextModeRecent">Recent</option>
                    </select>
                </label>
                <div class="setting-field setting-field-number">
                    <label class="setting-field-label"><span data-i18n="contextRecentTurns">Turns</span>${HelpButton('contextRecentTurnsDesc')}</label>
                    <input type="number" id="context-recent-turns-input" class="settings-input" min="1" max="50">
                </div>
            </div>
        </div>

        <div class="setting-panel">
            <div class="setting-panel-header setting-panel-header-spaced">
                <h5><span data-i18n="sidebarBehavior">Sidebar Behavior</span>${HelpButton('sidebarBehaviorAutoDesc')}</h5>
            </div>
            <div class="setting-radio-list">
                <div class="setting-radio-option">
                    <label class="setting-radio-choice">
                        <input type="radio" name="sidebar-behavior" value="auto">
                        <span class="setting-radio-title" data-i18n="sidebarBehaviorAuto">Smart (Auto restore)</span>
                    </label>
                </div>
                <div class="setting-radio-option">
                    <label class="setting-radio-choice">
                        <input type="radio" name="sidebar-behavior" value="restore">
                        <span class="setting-radio-title" data-i18n="sidebarBehaviorRestore">Always Restore</span>
                    </label>
                </div>
                <div class="setting-radio-option">
                    <label class="setting-radio-choice">
                        <input type="radio" name="sidebar-behavior" value="new">
                        <span class="setting-radio-title" data-i18n="sidebarBehaviorNew">Always New Chat</span>
                    </label>
                </div>
            </div>
        </div>

        <div class="setting-panel">
            <div class="setting-panel-header setting-panel-header-spaced">
                <h5 data-i18n="sidePanelScope">Side Panel Visibility</h5>
            </div>
            <div class="setting-radio-list">
                <div class="setting-radio-option">
                    <label class="setting-radio-choice">
                        <input type="radio" name="sidepanel-scope" value="remembered_tabs">
                        <span class="setting-radio-title" data-i18n="sidePanelScopeRememberedTabs">Remember tabs where it was opened (Recommended)</span>
                    </label>
                </div>
                <div class="setting-radio-option">
                    <label class="setting-radio-choice">
                        <input type="radio" name="sidepanel-scope" value="global">
                        <span class="setting-radio-title" data-i18n="sidePanelScopeGlobal">All tabs</span>
                    </label>
                </div>
            </div>
        </div>
    </div>`;

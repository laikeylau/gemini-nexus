import { ConnectionSettingsTemplate } from './connection.js';
import { GeneralSettingsTemplate } from './general.js';
import { AppearanceSettingsTemplate } from './appearance.js';
import { ShortcutsSettingsTemplate } from './shortcuts.js';
import { AboutSettingsTemplate } from './about.js';
import { TemplateIcons } from '../icons.js';

export const SettingsContentTemplate = `
    <div class="settings-content split-layout">
        <div class="settings-sidebar">
            <div class="settings-sidebar-header">
                <h3 data-i18n="settingsTitle">Settings</h3>
            </div>
            <ul class="settings-tabs">
                <li class="settings-tab active" data-tab="connection">
                    <span class="tab-icon">${TemplateIcons.PLUG}</span>
                    <span class="tab-label" data-i18n="connection">Connection</span>
                </li>
                <li class="settings-tab" data-tab="general">
                    <span class="tab-icon">${TemplateIcons.SETTINGS}</span>
                    <span class="tab-label" data-i18n="general">General</span>
                </li>
                <li class="settings-tab" data-tab="appearance">
                    <span class="tab-icon">${TemplateIcons.PALETTE}</span>
                    <span class="tab-label" data-i18n="appearance">Appearance</span>
                </li>
                <li class="settings-tab" data-tab="shortcuts">
                    <span class="tab-icon">${TemplateIcons.KEYBOARD}</span>
                    <span class="tab-label" data-i18n="keyboardShortcuts">Shortcuts</span>
                </li>
                <li class="settings-tab" data-tab="about">
                    <span class="tab-icon">${TemplateIcons.INFO}</span>
                    <span class="tab-label" data-i18n="about">About</span>
                </li>
            </ul>
        </div>
        <div class="settings-main">
            <div class="settings-header">
                <h3 id="settings-tab-title" data-i18n="connection">Connection</h3>
                <div class="settings-header-actions">
                    <button id="reset-shortcuts" class="btn-secondary" data-i18n="resetDefault">Reset Default</button>
                    <button id="save-shortcuts" class="btn-primary" data-i18n="saveChanges">Save Changes</button>
                    <button id="close-settings" class="icon-btn small" data-i18n-title="close" title="Close">${TemplateIcons.CLOSE}</button>
                </div>
            </div>
            <div class="settings-body">
                <div class="settings-section active" data-section="connection">
                    ${ConnectionSettingsTemplate}
                </div>
                <div class="settings-section" data-section="general">
                    ${GeneralSettingsTemplate}
                </div>
                <div class="settings-section" data-section="appearance">
                    ${AppearanceSettingsTemplate}
                </div>
                <div class="settings-section" data-section="shortcuts">
                    ${ShortcutsSettingsTemplate}
                </div>
                <div class="settings-section" data-section="about">
                    ${AboutSettingsTemplate}
                </div>
            </div>
        </div>
    </div>
`;

export const SettingsPageTemplate = `
    <main id="settings-modal" class="settings-page visible">
        ${SettingsContentTemplate}
    </main>
`;

export const SettingsModalTemplate = `
    <div id="settings-modal" class="settings-modal" role="dialog" aria-modal="true" aria-labelledby="settings-tab-title">
        ${SettingsContentTemplate}
    </div>
`;

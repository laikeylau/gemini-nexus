import { ConnectionSettingsTemplate } from './connection.js';
import { GeneralSettingsTemplate } from './general.js';
import { AppearanceSettingsTemplate } from './appearance.js';
import { ShortcutsSettingsTemplate } from './shortcuts.js';
import { AboutSettingsTemplate } from './about.js';

export const SettingsTemplate = `
    <!-- SETTINGS -->
    <div id="settings-modal" class="settings-modal">
        <div class="settings-content">
            <div class="settings-header">
                <h3 data-i18n="settingsTitle">Settings</h3>
                <div class="settings-header-actions">
                    <button id="reset-shortcuts" class="btn-secondary" data-i18n="resetDefault">Reset Default</button>
                    <button id="save-shortcuts" class="btn-primary" data-i18n="saveChanges">Save Changes</button>
                    <button id="close-settings" class="icon-btn small" data-i18n-title="close" title="Close">✕</button>
                </div>
            </div>
            <div class="settings-body">
                ${ConnectionSettingsTemplate}
                ${GeneralSettingsTemplate}
                ${AppearanceSettingsTemplate}
                ${ShortcutsSettingsTemplate}
                ${AboutSettingsTemplate}
            </div>
        </div>
    </div>
`;

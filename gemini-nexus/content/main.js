import { initializeContentApp } from './bootstrap.js';
import { geminiMessageRouter } from './messages.js';
import { SelectionOverlay } from './overlay.js';
import { geminiShortcuts } from './shortcuts.js';
import './toolbar/icons.js';
import './toolbar/i18n.js';
import './toolbar/ui/manager.js';
import { ToolbarController } from './toolbar/controller.js';

console.log("%c Gemini Nexus v4.2.3 Ready ", "background: #333; color: #00ff00; font-size: 16px");

initializeContentApp({
    shortcuts: geminiShortcuts,
    router: geminiMessageRouter,
    Overlay: SelectionOverlay,
    Controller: ToolbarController,
    storage: chrome.storage,
});

// sidepanel/index.js - Bridge between Sandbox and Background
import { FrameManager } from './core/frame.js';
import { StateManager } from './core/state.js';
import { MessageBridge } from './core/bridge.js';

// Initialize Core Components
const frameManager = new FrameManager();

// Start Lifecycle
frameManager.init();

if (globalThis.chrome && chrome.runtime && chrome.storage && chrome.tabs) {
    const stateManager = new StateManager(frameManager);
    const messageBridge = new MessageBridge(frameManager, stateManager);

    stateManager.init();
    messageBridge.init();
} else {
    const iframe = document.getElementById('sandbox-frame');
    if (iframe) iframe.addEventListener('load', () => frameManager.reveal(), { once: true });
}

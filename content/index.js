(function () {
    if (window.GeminiNexusPageGuard?.isDisabled) return;
    if (window.GeminiNexusContentReady === true) return;

    // Dependencies (Loaded via manifest order)
    const shortcuts = window.GeminiShortcuts;
    const router = window.GeminiMessageRouter;
    const Overlay = window.GeminiNexusOverlay;
    const Controller = window.GeminiToolbarController;
    const settingsSync = window.GeminiContentSettingsSync;

    // Initialize Helpers
    const selectionOverlay = new Overlay();
    const floatingToolbar = new Controller();

    // Initialize Router
    router.init(floatingToolbar, selectionOverlay);

    // Link Shortcuts
    shortcuts.setController(floatingToolbar);

    settingsSync?.init?.(floatingToolbar);

    window.GeminiNexusContentReady = true;
})();

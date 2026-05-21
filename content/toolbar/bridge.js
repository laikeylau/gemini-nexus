(function () {
    class RendererBridge {
        constructor(hostElement) {
            this.host = hostElement;
            this.iframe = null;
            this.callbacksByRequestId = {};
            this.requestIdCounter = 0;
            this.init();
        }

        init() {
            this.iframe = document.createElement('iframe');
            this.iframe.src = chrome.runtime.getURL('sandbox/index.html?mode=renderer');
            this.iframe.style.display = 'none';
            this.host.appendChild(this.iframe);

            window.addEventListener('message', (event) => {
                if (event.source !== this.iframe?.contentWindow) return;
                if (!event.data || typeof event.data !== 'object') return;

                if (event.data.action === 'RENDER_RESULT') {
                    const { html, reqId: requestId, fetchTasks } = event.data;
                    if (
                        Object.prototype.hasOwnProperty.call(this.callbacksByRequestId, requestId)
                    ) {
                        this.callbacksByRequestId[requestId]({ html, fetchTasks });
                        delete this.callbacksByRequestId[requestId];
                    }
                }
                if (event.data.action === 'PROCESS_IMAGE_RESULT') {
                    const { base64, reqId: requestId } = event.data;
                    if (
                        Object.prototype.hasOwnProperty.call(this.callbacksByRequestId, requestId)
                    ) {
                        this.callbacksByRequestId[requestId](base64);
                        delete this.callbacksByRequestId[requestId];
                    }
                }
            });
        }

        createRequestId() {
            if (globalThis.GeminiNexusIds?.createPrefixedId) {
                return globalThis.GeminiNexusIds.createPrefixedId('req');
            }
            if (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function') {
                return `req_${globalThis.crypto.randomUUID().toUpperCase()}`;
            }
            this.requestIdCounter += 1;
            return `req_${this.requestIdCounter}`;
        }

        async render(text, images = []) {
            const requestId = this.createRequestId();
            return new Promise((resolve) => {
                this.callbacksByRequestId[requestId] = resolve;
                if (this.iframe.contentWindow) {
                    this.iframe.contentWindow.postMessage(
                        { action: 'RENDER', text, images, reqId: requestId },
                        '*'
                    );
                } else {
                    resolve({ html: text, fetchTasks: [] });
                }
            });
        }

        async processImage(base64) {
            const requestId = this.createRequestId();
            return new Promise((resolve) => {
                this.callbacksByRequestId[requestId] = resolve;
                if (this.iframe.contentWindow) {
                    this.iframe.contentWindow.postMessage(
                        { action: 'PROCESS_IMAGE', base64, reqId: requestId },
                        '*'
                    );
                } else {
                    resolve(base64);
                }
            });
        }
    }

    window.GeminiRendererBridge = RendererBridge;
})();

(function () {
    class SelectionObserver {
        constructor(callbacks) {
            this.callbacks = callbacks || {}; // { onSelection, onClear, onClick }
            this.selectionTimer = null;
            this.pendingMousePoint = null;
            this.isPointerDown = false;
            this.onSelectionEnd = this.onSelectionEnd.bind(this);
            this.onMouseDown = this.onMouseDown.bind(this);
            this.onSelectionChange = this.onSelectionChange.bind(this);
            this.init();
        }

        init() {
            document.addEventListener('mouseup', this.onSelectionEnd, true);
            document.addEventListener('pointerup', this.onSelectionEnd, true);
            document.addEventListener('touchend', this.onSelectionEnd, true);
            document.addEventListener('mousedown', this.onMouseDown, true);
            document.addEventListener('pointerdown', this.onMouseDown, true);
            document.addEventListener('touchstart', this.onMouseDown, true);
            document.addEventListener('selectionchange', this.onSelectionChange);
        }

        onMouseDown(e) {
            this.isPointerDown = true;
            if (this.callbacks.onClick) {
                this.callbacks.onClick(e);
            }
        }

        onSelectionEnd(e) {
            this.isPointerDown = false;
            this.scheduleSelectionCheck(e);
        }

        onSelectionChange() {
            if (this.isPointerDown) return;
            this.scheduleSelectionCheck(null);
        }

        scheduleSelectionCheck(e) {
            const mousePoint = this.getEventPoint(e);
            if (mousePoint || !this.pendingMousePoint) {
                this.pendingMousePoint = mousePoint;
            }

            if (this.selectionTimer) {
                clearTimeout(this.selectionTimer);
            }

            // Delay slightly to let native selection state settle.
            this.selectionTimer = setTimeout(() => {
                this.selectionTimer = null;
                const selectionData = this.readSelection(this.pendingMousePoint);
                this.pendingMousePoint = null;

                if (selectionData && selectionData.text.length > 0) {
                    if (this.callbacks.onSelection) {
                        this.callbacks.onSelection(selectionData);
                    }
                } else if (this.callbacks.onClear) {
                    this.callbacks.onClear();
                }
            }, 10);
        }

        readSelection(mousePoint) {
            const inputSelection = this.readInputSelection(mousePoint);
            if (inputSelection) return inputSelection;

            const selection = window.getSelection();
            if (!selection || !selection.rangeCount) return null;

            const text = selection.toString().trim();
            if (!text) return null;

            const range = selection.getRangeAt(0);
            const rect =
                typeof range.getBoundingClientRect === 'function'
                    ? range.getBoundingClientRect()
                    : this.emptyRect();

            return {
                text,
                range,
                rect,
                mousePoint,
            };
        }

        readInputSelection(mousePoint) {
            const element = this.getActiveElement();
            if (!this.isTextInput(element)) return null;

            const start = element.selectionStart;
            const end = element.selectionEnd;
            if (typeof start !== 'number' || typeof end !== 'number' || start === end) {
                return null;
            }

            const text = element.value.slice(start, end).trim();
            if (!text) return null;

            const rect =
                typeof element.getBoundingClientRect === 'function'
                    ? element.getBoundingClientRect()
                    : this.emptyRect();

            return {
                text,
                rect,
                mousePoint,
            };
        }

        getActiveElement() {
            let element = document.activeElement;
            while (element && element.shadowRoot && element.shadowRoot.activeElement) {
                element = element.shadowRoot.activeElement;
            }
            return element;
        }

        isTextInput(element) {
            if (!element || typeof element.value !== 'string') return false;
            const tagName = element.tagName;
            return tagName === 'TEXTAREA' || tagName === 'INPUT';
        }

        getEventPoint(e) {
            if (!e) return null;

            const source =
                e.changedTouches && e.changedTouches.length > 0
                    ? e.changedTouches[0]
                    : e.touches && e.touches.length > 0
                      ? e.touches[0]
                      : e;

            if (typeof source.clientX !== 'number' || typeof source.clientY !== 'number') {
                return null;
            }

            return { x: source.clientX, y: source.clientY };
        }

        emptyRect() {
            return {
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
                width: 0,
                height: 0,
            };
        }

        disconnect() {
            if (this.selectionTimer) {
                clearTimeout(this.selectionTimer);
                this.selectionTimer = null;
            }
            this.pendingMousePoint = null;

            document.removeEventListener('mouseup', this.onSelectionEnd, true);
            document.removeEventListener('pointerup', this.onSelectionEnd, true);
            document.removeEventListener('touchend', this.onSelectionEnd, true);
            document.removeEventListener('mousedown', this.onMouseDown, true);
            document.removeEventListener('pointerdown', this.onMouseDown, true);
            document.removeEventListener('touchstart', this.onMouseDown, true);
            document.removeEventListener('selectionchange', this.onSelectionChange);
        }
    }

    // Export to Window
    window.GeminiSelectionObserver = SelectionObserver;
})();

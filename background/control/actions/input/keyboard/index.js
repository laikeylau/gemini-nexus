// background/control/actions/input/keyboard/index.js
import { BaseActionHandler } from '../../base.js';
import { handleFillElement } from './fill.js';
import { handlePressKey } from './press.js';

export class KeyboardActions extends BaseActionHandler {
    async fillElement(args) {
        return handleFillElement(this, args);
    }

    async pressKey(args) {
        return handlePressKey(this, args);
    }
}

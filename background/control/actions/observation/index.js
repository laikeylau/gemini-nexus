// background/control/actions/observation/index.js
import { BaseActionHandler } from '../base.js';
import { ScriptActions } from './script.js';

export class ObservationActions extends BaseActionHandler {
    constructor(connection, snapshotManager, waitHelper) {
        super(connection, snapshotManager, waitHelper);

        this.script = new ScriptActions(connection, snapshotManager, waitHelper);
    }

    // --- Delegates ---

    async evaluateScript(args) {
        return this.script.evaluateScript(args);
    }
}

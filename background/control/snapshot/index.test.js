import { describe, expect, it, vi } from 'vitest';
import { SnapshotManager } from './index.js';

describe('SnapshotManager descendant lookup', () => {
    it('only returns AX nodes that are descendants of the requested root UID', async () => {
        const nodes = [
            {
                nodeId: 'root',
                role: { value: 'RootWebArea' },
                name: { value: 'Page' },
                childIds: ['select-b', 'select-a'],
            },
            {
                nodeId: 'select-b',
                backendDOMNodeId: 201,
                role: { value: 'combobox' },
                name: { value: 'Billing state' },
                childIds: ['option-b-ca'],
            },
            {
                nodeId: 'option-b-ca',
                backendDOMNodeId: 202,
                role: { value: 'option' },
                name: { value: 'CA' },
            },
            {
                nodeId: 'select-a',
                backendDOMNodeId: 101,
                role: { value: 'combobox' },
                name: { value: 'Shipping state' },
                childIds: ['option-a-ca'],
            },
            {
                nodeId: 'option-a-ca',
                backendDOMNodeId: 102,
                role: { value: 'option' },
                name: { value: 'CA' },
            },
        ];
        const connection = {
            onDetach: vi.fn(),
            sendCommand: vi.fn((method) => {
                if (method === 'Accessibility.getFullAXTree') return Promise.resolve({ nodes });
                return Promise.resolve({});
            }),
        };
        const manager = new SnapshotManager(connection);

        await manager.takeSnapshot();
        const shippingUid = [...manager.uidToAxNode.entries()].find(
            ([, node]) => node.nodeId === 'select-a'
        )?.[0];

        const optionUid = manager.findDescendant(shippingUid, (node) => node.name?.value === 'CA');

        expect(manager.getAXNode(optionUid).nodeId).toBe('option-a-ca');
    });
});

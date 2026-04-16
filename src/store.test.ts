import { describe, expect, it, beforeEach } from 'vitest';
import { useStore } from './store';

describe('Zustand Store - Board Filters', () => {
    beforeEach(() => {
        useStore.getState().clearBoardFilters();
    });

    it('sets board filter query', () => {
        useStore.getState().setBoardFilterQuery('hello');
        expect(useStore.getState().boardFilterQuery).toBe('hello');
    });

    it('toggles labels', () => {
        useStore.getState().toggleBoardFilterLabel('123');
        expect(useStore.getState().boardFilterLabels).toContain('123');
        useStore.getState().toggleBoardFilterLabel('123');
        expect(useStore.getState().boardFilterLabels).not.toContain('123');
    });
});

import { describe, expect, it, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { CardDetailsDialog } from './CardDetailsDialog';
import * as storeModule from '../store';

vi.spyOn(storeModule, 'useStore').mockImplementation((selector: any) => {
    return selector({
        user: { id: 'u1' },
        currentUserRole: 'owner',
        activeMembers: [],
        projects: [],
        lists: [],
        userImages: []
    });
});

vi.mock('react-leaflet', () => ({
    MapContainer: () => <div />,
    TileLayer: () => <div />,
    Marker: () => <div />,
    useMapEvents: vi.fn(),
    useMap: vi.fn()
}));

describe('CardDetailsDialog Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders dialog framework without crashing', () => {
        const dummyCard: any = {
            id: 'card-1',
            content: 'Detailed Card',
            description: null,
            listId: 'list-1',
            position: 10,
            completed: false,
            labels: []
        };

        // Render card details dialog with its required props
        render(
            <CardDetailsDialog
                card={dummyCard}
                open={true}
                onOpenChange={vi.fn()}
            />
        );

        expect(screen.getByDisplayValue('Detailed Card')).toBeInTheDocument();
    });
});


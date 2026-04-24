import { describe, expect, it, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Card from './Card';
import { Draggable } from '@hello-pangea/dnd';

vi.mock('@hello-pangea/dnd', () => ({
    Draggable: ({ children }: any) => {
        return children({
            innerRef: vi.fn(),
            draggableProps: {},
            dragHandleProps: {}
        }, { isDragging: false });
    }
}));

import * as storeModule from '../store';

vi.spyOn(storeModule, 'useStore').mockImplementation((selector: any) => {
    return selector({
        lists: [],
        projects: [],
        userImages: [],
        user: { id: 'u1' },
        currentUserRole: 'owner',
        activeBoardOwnerId: 'u1'
    });
});

// Since we use motion and drag drop contexts, we just test if the component mounts successfully 
// and renders the basic text content.

describe('Card Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders card content correctly', () => {
        const dummyCard: any = {
            id: 'card-1',
            content: 'My Test Content',
            listId: 'list-1',
            position: 10,
            completed: false,
            labels: []
        };

        // Render minimal layout by mocking the inner components directly or 
        // just rendering the Draggable wrapped card. Notice that Draggable requires Droppable/DragDropContext.
        // We will test if our child renders properly using vitest mocks or just the default setup.
        
        // Let's just mock Draggable completely for this test

        render(
            <Draggable draggableId="card-1" index={0}>
                {() => (
                    <Card
                        card={dummyCard}
                        index={0}
                    />
                )}
            </Draggable>
        );

        expect(screen.getByText('My Test Content')).toBeInTheDocument();
    });
});

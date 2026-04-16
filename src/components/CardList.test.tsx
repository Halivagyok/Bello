import { describe, expect, it, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import CardList from './CardList';
import * as storeModule from '../store';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';

vi.mock('../store', () => {
    return {
        useStore: vi.fn(),
    };
});

describe('CardList Component', () => {
    beforeEach(() => {
        vi.spyOn(storeModule, 'useStore').mockImplementation((selector: any) => {
            return selector({
                updateListTitle: vi.fn(),
                addCard: vi.fn(),
                deleteList: vi.fn(),
                duplicateList: vi.fn(),
                updateListColor: vi.fn(),
                boardFilterQuery: '',
                boardFilterDue: 'all',
                boardFilterStatus: 'all',
                boardFilterLabels: [],
                currentUserRole: 'owner',
                activeBoardOwnerId: 'user1',
                activeMembers: [],
                boards: [],
                fetchBoards: vi.fn(),
                lists: [],
                user: { id: 'user1', isAdmin: true }
            });
        });
    });

    it('renders the list title correctly', () => {
        const dummyList = {
            id: 'list-1',
            title: 'Todo Items',
            position: 1000,
            boardId: 'b1',
            cards: []
        };

        render(
            <DragDropContext onDragEnd={() => {}}>
                <Droppable droppableId="board" type="list" direction="horizontal">
                    {(provided) => (
                        <div ref={provided.innerRef} {...provided.droppableProps}>
                            <CardList list={dummyList} index={0} />
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        );

        expect(screen.getByText('Todo Items')).toBeInTheDocument();
        expect(screen.getByText('Add a card')).toBeInTheDocument();
    });
});

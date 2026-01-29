import { create } from 'zustand';
import { edenTreaty } from '@elysiajs/eden';

// 1. Initialize Eden Client
// Using 'any' here effectively mocks the backend interface to decouple the source codes
// per user requirements. In a production monorepo, a shared package would be used.
export const client = edenTreaty<any>('http://localhost:3000') as any;

// 2. Define Types
export interface Card {
    id: string;
    content: string;
}

export interface List {
    id: string;
    title: string;
    cards: Card[];
}

interface BoardState {
    lists: List[];
    status: string;

    // Actions
    addList: (title: string) => void;
    updateListTitle: (listId: string, title: string) => void;
    addCard: (listId: string, content: string) => void;
    moveList: (fromIndex: number, toIndex: number) => void;
    moveCard: (
        sourceListId: string,
        destListId: string,
        sourceIndex: number,
        destIndex: number
    ) => void;
    checkBackend: () => Promise<void>;
}

// 3. Create Store
export const useStore = create<BoardState>((set) => ({
    lists: [
        {
            id: 'list-1',
            title: 'To Do',
            cards: [
                { id: 'card-1', content: 'Buy Milk' },
                { id: 'card-2', content: 'Walk the Dog' }
            ]
        }
    ],
    status: 'Waiting...',

    addList: (title) => {
        const newId = `list-${Date.now()}`;
        set((state) => ({
            lists: [...state.lists, { id: newId, title, cards: [] }]
        }));
    },

    updateListTitle: (listId, title) => {
        set((state) => ({
            lists: state.lists.map(list =>
                list.id === listId ? { ...list, title } : list
            )
        }));
    },

    addCard: (listId, content) => {
        const newCard = { id: `card-${Date.now()}`, content };
        set((state) => ({
            lists: state.lists.map(list =>
                list.id === listId ? { ...list, cards: [...list.cards, newCard] } : list
            )
        }));
    },

    moveList: (fromIndex, toIndex) => {
        set((state) => {
            const newLists = [...state.lists];
            const [removed] = newLists.splice(fromIndex, 1);
            newLists.splice(toIndex, 0, removed);
            return { lists: newLists };
        });
    },

    moveCard: (sourceListId, destListId, sourceIndex, destIndex) => {
        set((state) => {
            const newLists = state.lists.map(list => ({
                ...list,
                cards: [...list.cards] // Shallow copy cards array
            }));

            const sourceList = newLists.find(l => l.id === sourceListId);
            const destList = newLists.find(l => l.id === destListId);

            if (!sourceList || !destList) return state;

            const [movedCard] = sourceList.cards.splice(sourceIndex, 1);
            destList.cards.splice(destIndex, 0, movedCard);

            return { lists: newLists };
        });
    },

    checkBackend: async () => {
        try {
            const { data, error } = await client.api.ping.get();
            if (error) throw error;
            set({ status: data.message });
        } catch (e) {
            set({ status: '❌ Backend Disconnected' });
            console.error(e);
        }
    }
}));

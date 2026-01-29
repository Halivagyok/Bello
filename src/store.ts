import { create } from 'zustand';
import { edenTreaty } from '@elysiajs/eden';

// 1. Initialize Eden Client
export const client = edenTreaty<any>('http://localhost:3000') as any;

// 2. Define Types
export interface Card {
    id: string;
    content: string;
    listId: string;
    position: number;
}

export interface List {
    id: string;
    title: string;
    position: number;
    cards: Card[];
}

interface BoardState {
    lists: List[];
    status: string;

    // Actions
    fetchData: () => Promise<void>;
    addList: (title: string) => void;
    updateListTitle: (listId: string, title: string) => void;
    addCard: (listId: string, content: string) => void;
    deleteList: (listId: string) => void;
    moveList: (fromIndex: number, toIndex: number) => void;
    moveCard: (
        sourceListId: string,
        destListId: string,
        sourceIndex: number,
        destIndex: number
    ) => void;
    checkBackend: () => Promise<void>;

    // Board Info
    boardName: string;
    members: string[]; // URLs or Initials
    setBoardName: (name: string) => void;
}

// 3. Create Store
export const useStore = create<BoardState>((set, get) => ({
    lists: [],
    status: 'Connecting...',
    boardName: 'My Project Board',
    members: ['JD', 'AN', 'RK'], // Dummy members for now

    setBoardName: (name) => set({ boardName: name }),

    fetchData: async () => {
        try {
            const { data, error } = await client.lists.get();
            if (error) throw error;
            if (data) {
                // Ensure data matches the shape, backend returns nested cards
                set({ lists: data as List[], status: 'Connected 🟢' });
            }
        } catch (e) {
            set({ status: '❌ Failed to load data' });
            console.error('Fetch error:', e);
        }
    },

    addList: async (title) => {
        const oldLists = get().lists;
        const newId = `temp-${Date.now()}`;
        const position = oldLists.length > 0 ? (oldLists[oldLists.length - 1].position + 1000) : 1000;

        // Optimistic
        set((state) => ({
            lists: [...state.lists, { id: newId, title, position, cards: [] }]
        }));

        try {
            const { data, error } = await client.lists.post({ title, position });
            if (error) throw error;
            // Replace temp ID with real ID
            set((state) => ({
                lists: state.lists.map(l => l.id === newId ? { ...l, ...data, cards: [] } : l)
            }));
        } catch (e) {
            // Revert
            set({ lists: oldLists });
            console.error('Add List failed:', e);
        }
    },

    deleteList: async (listId) => {
        const oldLists = get().lists;
        // Optimistic
        set((state) => ({
            lists: state.lists.filter(l => l.id !== listId)
        }));

        try {
            await client.lists[listId].delete();
        } catch (e) {
            // Revert
            set({ lists: oldLists });
            console.error('Delete List failed:', e);
        }
    },

    updateListTitle: async (listId, title) => {
        const oldLists = get().lists;
        set((state) => ({
            lists: state.lists.map(list =>
                list.id === listId ? { ...list, title } : list
            )
        }));

        try {
            await client.lists[listId].patch({ title });
        } catch (e) {
            set({ lists: oldLists });
            console.error('Update Title failed:', e);
        }
    },

    addCard: async (listId, content) => {
        const oldLists = get().lists;
        const list = oldLists.find(l => l.id === listId);
        if (!list) return;

        const lastCard = list.cards[list.cards.length - 1];
        const position = lastCard ? lastCard.position + 1000 : 1000;
        const newCard = { id: `temp-card-${Date.now()}`, content, listId, position };

        set((state) => ({
            lists: state.lists.map(l =>
                l.id === listId ? { ...l, cards: [...l.cards, newCard] } : l
            )
        }));

        try {
            const { data, error } = await client.cards.post({ content, listId, position });
            if (error) throw error;
            // Replace with real data
            set((state) => ({
                lists: state.lists.map(l =>
                    l.id === listId ? {
                        ...l,
                        cards: l.cards.map(c => c.id === newCard.id ? { ...c, ...data } : c)
                    } : l
                )
            }));
        } catch (e) {
            set({ lists: oldLists });
            console.error('Add Card failed:', e);
        }
    },

    moveList: async (fromIndex, toIndex) => {
        const oldLists = [...get().lists];

        // Calculate new position
        let newPosition = 0;
        const sorted = [...oldLists]; // Assuming they are sorted by index effectively in UI
        const [moved] = sorted.splice(fromIndex, 1);
        sorted.splice(toIndex, 0, moved);

        const prev = sorted[toIndex - 1];
        const next = sorted[toIndex + 1];

        if (!prev && !next) newPosition = 1000;
        else if (!prev) newPosition = next.position / 2;
        else if (!next) newPosition = prev.position + 1000;
        else newPosition = (prev.position + next.position) / 2;

        moved.position = newPosition;

        set({ lists: sorted });

        try {
            await client.lists[moved.id].patch({ position: newPosition });
        } catch (e) {
            set({ lists: oldLists });
            console.error('Move List failed:', e);
        }
    },

    moveCard: async (sourceListId, destListId, sourceIndex, destIndex) => {
        const oldLists = JSON.parse(JSON.stringify(get().lists)); // Deep copy for revert

        set((state) => {
            const newLists = state.lists.map(list => ({
                ...list,
                cards: [...list.cards]
            }));

            const sourceList = newLists.find(l => l.id === sourceListId);
            const destList = newLists.find(l => l.id === destListId);

            if (!sourceList || !destList) return state;

            const [movedCard] = sourceList.cards.splice(sourceIndex, 1);

            // Calculate Position
            // destIndex Is the index in the destination list *after* we insert? No, splice inserts at that index.
            // So we need to look at what's currently at destIndex (which will be 'next') and destIndex-1 (which will be 'prev')

            // Wait, we haven't inserted yet.
            // If we insert at destIndex:
            // prev = destList.cards[destIndex - 1]
            // next = destList.cards[destIndex]

            const prev = destList.cards[destIndex - 1];
            const next = destList.cards[destIndex];

            let newPos = 1000;
            if (!prev && !next) newPos = 1000;
            else if (!prev) newPos = (next?.position || 0) / 2; // Should not happen if next exists? If next exists and position is 0?
            else if (!next) newPos = prev.position + 1000;
            else newPos = (prev.position + next.position) / 2;

            movedCard.listId = destListId;
            movedCard.position = newPos;

            destList.cards.splice(destIndex, 0, movedCard);

            return { lists: newLists };
        });


        // We just need to sync the move with backend
        // But we need the ID of the moved card.
        // It's a bit tricky to find the moved card instance if we rely on indices.
        // But we know the logic.

        // Let's extract the actual update call params
        const newLists = get().lists;
        const destList = newLists.find(l => l.id === destListId);
        const movedCard = destList?.cards[destIndex];

        if (movedCard) {
            try {
                await client.cards[movedCard.id].patch({
                    listId: destListId,
                    position: movedCard.position
                });
            } catch (e) {
                set({ lists: oldLists });
                console.error('Move Card failed:', e);
            }
        }
    },

    checkBackend: async () => {
        try {
            const { data, error } = await client.api.ping.get();
            if (error) throw error;
            if (data) set({ status: data.message });
        } catch (e) {
            set({ status: '❌ Backend Disconnected' });
        }
    }
}));

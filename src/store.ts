import { create } from 'zustand';
import { edenTreaty } from '@elysiajs/eden';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// 1. Initialize Eden Client
export const client = edenTreaty<any>(API_URL, {
    $fetch: {
        credentials: 'include'
    }
}) as any;

// 2. Define Types
export interface User {
    id: string;
    email: string;
    name: string;
    isAdmin?: boolean;
    isBanned?: boolean;
}

export interface Board {
    id: string;
    title: string;
    ownerId: string;
    projectId?: string;
    lastViewed?: number;
    members?: { id: string; name: string; email: string; role: string; isAdmin?: boolean }[];
}

export interface Project {
    id: string;
    title: string;
    description?: string;
    ownerId: string;
    boardIds: string[];
    members?: { id: string; name: string; email: string; role: string; isAdmin?: boolean }[];
}

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
    boardId: string;
    color?: string;
}

interface BoardState {
    user: User | null;
    boards: Board[];
    projects: Project[];
    recentBoards: Board[];
    activeBoardId: string | null;
    lists: List[];
    status: string;
    boardName: string; // Current board name
    activeMembers: { id: string; name: string; email: string; role: string; isAdmin?: boolean }[];
    activeBoardOwnerId?: string;
    activeProjectId: string | null;
    authLoading: boolean;
    socket: WebSocket | null;
    socketRetryCount: number;

    // Auth Actions
    checkAuth: () => Promise<void>;
    connectSocket: () => void;
    subscribeToBoard: (boardId: string) => void;
    unsubscribeFromBoard: (boardId: string) => void;
    subscribeToProject: (projectId: string) => void;
    unsubscribeFromProject: (projectId: string) => void;
    subscribeToUser: () => void;
    handleUserUpdate: () => void;
    navigateToBoards: () => void;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, name?: string) => Promise<void>;
    logout: () => Promise<void>;

    // Board Actions
    fetchBoards: () => Promise<void>;
    createBoard: (title: string, projectId?: string) => Promise<Board | null>;
    fetchBoard: (boardId: string, silent?: boolean) => Promise<void>;
    inviteUser: (email: string) => Promise<void>;

    // Data Actions
    fetchData: () => Promise<void>;
    addList: (title: string) => Promise<void>;
    updateListTitle: (listId: string, title: string) => Promise<void>;
    addCard: (listId: string, content: string) => void;
    deleteList: (listId: string) => void;
    duplicateList: (listId: string, title?: string) => Promise<void>;
    moveAllCards: (sourceListId: string, targetListId: string) => void;
    sortCards: (listId: string, sortBy: 'oldest' | 'newest' | 'abc') => void;
    updateListColor: (listId: string, color: string) => void;
    moveListToBoard: (listId: string, boardId: string) => void;
    moveList: (fromIndex: number, toIndex: number) => void;
    moveCard: (
        sourceListId: string,
        destListId: string,
        sourceIndex: number,
        destIndex: number
    ) => void;
    checkBackend: () => Promise<void>;

    // Project Actions
    fetchProjects: () => Promise<void>;
    fetchProject: (projectId: string) => Promise<void>;
    createProject: (title: string, description?: string) => Promise<void>;
    inviteUserToProject: (projectId: string, email: string) => Promise<void>;
    assignBoardToProject: (boardId: string, projectId: string) => Promise<void>;
    updateRecentBoards: (boardId: string) => void;
}

// 3. Create Store
export const useStore = create<BoardState>((set, get) => ({
    user: null,
    boards: [],
    projects: [],
    recentBoards: [],
    activeBoardId: null,
    lists: [],
    status: 'Connecting...',
    boardName: 'Loading...',
    activeMembers: [],
    authLoading: true,
    socket: null,
    socketRetryCount: 0,

    activeProjectId: null, // Track active project for WS updates

    // Helper for navigation
    navigateToBoards: () => {
        window.history.pushState({}, '', '/boards');
        window.dispatchEvent(new Event('popstate')); // Trigger standard navigation event
        // Also dispatch custom event for components listening explicitly
        window.dispatchEvent(new CustomEvent('app-navigate', { detail: '/boards' }));
    },

    connectSocket: () => {
        const socket = get().socket;
        if (socket) {
            // If already connected, ensure we are subscribed to user
            if (socket.readyState === WebSocket.OPEN) {
                get().subscribeToUser();
            }
            return;
        }

        const API_HOST = new URL(API_URL).host;
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const newSocket = new WebSocket(`${wsProtocol}//${API_HOST}/ws`);

        newSocket.onopen = () => {
            console.log('Connected to WS');
            set({ socketRetryCount: 0 }); // Reset retry count on successful connection
            // If we are already on a board, subscribe?
            const activeBoardId = get().activeBoardId;
            if (activeBoardId) {
                get().subscribeToBoard(activeBoardId);
            }
            const activeProjectId = get().activeProjectId;
            if (activeProjectId) {
                get().subscribeToProject(activeProjectId);
            }
            get().subscribeToUser();
        };

        newSocket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'update') {
                    // Refresh current board if it matches activeBoard
                    const activeId = get().activeBoardId;
                    if (activeId) {
                        get().fetchBoard(activeId, true).catch(() => {
                            // If fetch fails (e.g. 403 Forbidden because removed), redirect
                            console.log("Access lost or board deleted");
                            set({ activeBoardId: null, lists: [], activeMembers: [] });
                            get().navigateToBoards();
                        });
                    }
                }
                if (data.type === 'project-update') {
                    // Check if we are viewing a project using store state
                    const activeProjectId = get().activeProjectId;
                    if (activeProjectId) {
                        get().fetchProject(activeProjectId).catch(() => {
                            // If access lost
                            console.log("Access lost to project");
                            set({ activeProjectId: null });
                            get().navigateToBoards();
                        });
                    }
                }
                if (data.type === 'user-update') {
                    get().handleUserUpdate();
                }
            } catch (e) {
                console.error('WS Parse Error', e);
            }
        };

        newSocket.onerror = (error) => {
            console.error('WebSocket Error:', error);
        };

        newSocket.onclose = () => {
            console.log('Disconnected from WS');
            set({ socket: null });

            // Exponential backoff
            const retryCount = get().socketRetryCount;
            const delay = Math.min(1000 * Math.pow(2, retryCount), 30000); // Max 30s

            console.log(`Reconnecting in ${delay}ms... (Attempt ${retryCount + 1})`);
            set({ socketRetryCount: retryCount + 1 });

            setTimeout(() => get().connectSocket(), delay);
        };

        set({ socket: newSocket });
    },

    handleUserUpdate: () => {
        get().fetchProjects();
        // Check active board access
        const activeId = get().activeBoardId;
        if (activeId) {
            get().fetchBoard(activeId, true).catch(() => {
                get().navigateToBoards();
            });
        }
        // Check active project access
        const activeProjectId = get().activeProjectId;
        if (activeProjectId) {
            get().fetchProject(activeProjectId).catch(() => {
                get().navigateToBoards();
            });
        }
    },

    subscribeToBoard: (boardId) => {
        const socket = get().socket;
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'subscribe', boardId }));
        }
    },

    unsubscribeFromBoard: (boardId) => {
        const socket = get().socket;
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'unsubscribe', boardId }));
        }
    },

    subscribeToProject: (projectId) => {
        const socket = get().socket;
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'subscribe-project', projectId }));
        }
    },

    unsubscribeFromProject: (projectId) => {
        const socket = get().socket;
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'unsubscribe-project', projectId }));
        }
    },

    subscribeToUser: () => {
        const socket = get().socket;
        const user = get().user;
        if (socket && socket.readyState === WebSocket.OPEN && user) {
            socket.send(JSON.stringify({ type: 'subscribe-user', userId: user.id }));
        }
    },

    checkAuth: async () => {
        set({ authLoading: true });
        try {
            const { data } = await client.auth.me.get();
            if (data?.user) {
                set({ user: data.user });
                // Load projects from local storage on auth check
                get().fetchProjects();
                get().connectSocket();
            } else {
                set({ user: null });
            }
        } catch (e) {
            console.error(e);
            set({ user: null });
        } finally {
            set({ authLoading: false });
        }
    },

    login: async (email, password) => {
        set({ authLoading: true });
        try {
            const { data, error } = await client.auth.login.post({ email, password });
            if (error) throw new Error(error.value as any);
            if (data?.user) {
                set({ user: data.user });
                get().fetchProjects();
                get().connectSocket();
            }
        } catch (e) {
            throw e;
        } finally {
            set({ authLoading: false });
        }
    },

    signup: async (email, password, name) => {
        set({ authLoading: true });
        try {
            const { data, error } = await client.auth.signup.post({ email, password, name });
            if (error) throw new Error(error.value as any);
            if (data?.user) {
                set({ user: data.user });
                get().fetchProjects();
                get().connectSocket();
            }
        } catch (e) {
            throw e;
        } finally {
            set({ authLoading: false });
        }
    },

    logout: async () => {
        try {
            await client.auth.logout.post();
        } catch (e) {
            console.error('Logout failed:', e);
        }
        set({ user: null, activeBoardId: null, lists: [], boards: [], projects: [], recentBoards: [], boardName: 'Loading...' });
    },

    fetchBoards: async () => {
        try {
            const { data, error } = await client.boards.get();
            if (error) throw error;
            if (data) {
                const fetchedBoards = data as Board[];
                set({ boards: fetchedBoards });

                // Update: Use local storage only for recent history tracking
                let recentIds: string[] = [];
                try {
                    recentIds = JSON.parse(localStorage.getItem('recent_boards') || '[]');
                } catch (e) {
                    console.error("Failed to parse recent_boards from localStorage", e);
                    recentIds = [];
                }
                const recent = fetchedBoards
                    .filter(b => recentIds.includes(b.id))
                    .sort((a, b) => recentIds.indexOf(a.id) - recentIds.indexOf(b.id))
                    .map(b => ({ ...b, lastViewed: Date.now() })) // Add dummy lastViewed for UI if needed
                    .slice(0, 4);

                set({ recentBoards: recent });
            }
        } catch (e) {
            console.error('Fetch Boards Error', e);
        }
    },

    createBoard: async (title, projectId) => {
        try {
            const { data, error } = await client.boards.post({ title, projectId });
            if (error) throw error;
            if (data) {
                const newBoard = data as Board;
                set(state => ({
                    boards: [...state.boards, newBoard],
                }));
                return newBoard;
            }
        } catch (e: any) {
            console.error(e);
            console.error(`Failed to create board: ${e.message || JSON.stringify(e)}`);
        }
        return null;
    },

    fetchBoard: async (boardId, silent = false) => {
        if (!silent) {
            set({ activeBoardId: boardId, boardName: 'Loading...', lists: [], activeMembers: [] });
            // Update recently viewed
            get().updateRecentBoards(boardId);
            // Connect/Subscribe
            get().connectSocket(); // Ensure connected
            get().subscribeToBoard(boardId);
        }

        try {
            const { data, error } = await client.boards[boardId].get();
            if (error) throw error;
            if (data) {
                set({
                    lists: data.lists as List[],
                    boardName: data.title,
                    activeMembers: data.members, // Now we set this!
                    activeBoardOwnerId: data.ownerId
                });
            }
        } catch (e) {
            if (!silent) {
                set({ status: '❌ Failed to load data' });
                // If we failed to load the board (e.g. 403 or 404), redirect back to dashboard
                console.error('Fetch error:', e);
                get().navigateToBoards();
            } else {
                console.error('Fetch error (silent):', e);
            }
            throw e;
        }
    },

    inviteUser: async (email) => {
        const boardId = get().activeBoardId;
        if (!boardId) return;
        const { error } = await client.boards[boardId].invite.post({ email });
        if (error) throw new Error(error.value as any);
    },

    fetchData: async () => {
        const boardId = get().activeBoardId;
        if (!boardId) return;

        try {
            const { data, error } = await client.boards[boardId].get();
            if (error) throw error;
            if (data) {
                set({ lists: data.lists as List[], boardName: data.title });
            }
        } catch (e) {
            set({ status: '❌ Failed to load data' });
            console.error('Fetch error:', e);
        }
    },

    addList: async (title) => {
        const boardId = get().activeBoardId;
        if (!boardId) return;

        const oldLists = get().lists;
        const newId = `temp-${Date.now()}`;
        const position = oldLists.length > 0 ? (oldLists[oldLists.length - 1].position + 1000) : 1000;

        // Optimistic
        set((state) => ({
            lists: [...state.lists, { id: newId, title, position, cards: [], boardId }]
        }));

        try {
            const { data, error } = await client.boards[boardId].lists.post({ title, position });
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

            const prev = destList.cards[destIndex - 1];
            const next = destList.cards[destIndex];

            let newPos = 1000;
            if (!prev && !next) newPos = 1000;
            else if (!prev) newPos = (next?.position || 0) / 2;
            else if (!next) newPos = prev.position + 1000;
            else newPos = (prev.position + next.position) / 2;

            movedCard.listId = destListId;
            movedCard.position = newPos;

            destList.cards.splice(destIndex, 0, movedCard);

            return { lists: newLists };
        });


        // We just need to sync the move with backend
        const newLists = get().lists;
        const destList = newLists.find(l => l.id === destListId);
        const movedCard = destList?.cards[destIndex];

        if (movedCard && !movedCard.id.startsWith('temp')) {
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

    duplicateList: async (listId, title) => {
        const list = get().lists.find(l => l.id === listId);
        if (!list) return;

        try {
            // For now, no optimistic update as complex ID generation/cards needed
            const { error } = await client.lists[listId].duplicate.post({ title });
            // Note: using client.lists[id].duplicate.post based on my backend impl
            if (error) throw error;

            // Refresh board to get new list
            get().fetchBoard(get().activeBoardId!, true);
        } catch (e) {
            console.error('Duplicate List Error', e);
        }
    },

    moveAllCards: async (sourceListId, targetListId) => {
        const oldLists = get().lists; // backup

        // Optimistic
        set(state => {
            const newLists = state.lists.map(l => ({ ...l, cards: [...l.cards] }));
            const source = newLists.find(l => l.id === sourceListId);
            const target = newLists.find(l => l.id === targetListId);

            if (source && target) {
                target.cards = [...target.cards, ...source.cards];
                source.cards = [];
                // Update listIds handling handled by store refresh or fetch
            }
            return { lists: newLists };
        });

        try {
            await client.lists[sourceListId]['move-cards'].post({ targetListId });
        } catch (e) {
            set({ lists: oldLists });
            console.error('Move All Cards Error', e);
        }
    },

    sortCards: async (listId, sortBy) => {
        // Optimistic Sort
        set(state => {
            const listFn = (l: List) => {
                if (l.id !== listId) return l;
                const newCards = [...l.cards];
                // Note: we might not have createdAt in frontend Card type, 
                // store.ts Card interface might need update if we want purely local optimistic sort,
                // but assuming backend does the heavy lifting, we might just wait or fuzzy sort.
                // let's rely on backend for correct sort, but we can try basic ABC optimistically.
                if (sortBy === 'abc') {
                    newCards.sort((a, b) => a.content.localeCompare(b.content));
                }
                return { ...l, cards: newCards };
            };
            return { lists: state.lists.map(listFn) }
        });

        try {
            await client.lists[listId].sort.post({ sortBy });
            get().fetchBoard(get().activeBoardId!, true); // Refresh to be safe IDs/Positions
        } catch (e) {
            console.error('Sort Error', e);
        }
    },

    updateListColor: async (listId, color) => {
        set(state => ({
            lists: state.lists.map(l => l.id === listId ? { ...l, color } : l)
        }));
        try {
            await client.lists[listId].patch({ color });
        } catch (e) {
            console.error('Update Color Error', e);
        }
    },

    moveListToBoard: async (listId, boardId) => {
        // Optimistic: Remove from current board
        const oldLists = get().lists;
        set(state => ({
            lists: state.lists.filter(l => l.id !== listId)
        }));

        try {
            await client.lists[listId].patch({ boardId });
        } catch (e) {
            set({ lists: oldLists });
            console.error('Move to Board Error', e);
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
    },

    // --- Project Implementation (Real) ---

    fetchProjects: async () => {
        try {
            const { data, error } = await client.projects.get();
            if (error) throw error;
            if (data) {
                set({ projects: data as Project[] });
            }
        } catch (e) {
            console.error('Fetch Projects failed:', e);
        }
    },

    fetchProject: async (projectId: string) => {
        try {
            const { data, error } = await client.projects[projectId].get();
            if (error) throw error;
            if (data) {
                set((state) => {
                    // Update lists and set active project
                    const projectIndex = state.projects.findIndex(p => p.id === projectId);
                    let newProjects;
                    if (projectIndex !== -1) {
                        newProjects = [...state.projects];
                        newProjects[projectIndex] = { ...newProjects[projectIndex], ...data };
                    } else {
                        newProjects = [...state.projects, data as Project];
                    }
                    return { projects: newProjects, activeProjectId: projectId };
                });
            }
        } catch (e) {
            console.error('Fetch Project failed:', e);
            throw e;
        }
    },

    createProject: async (title, description) => {
        try {
            const { data, error } = await client.projects.post({ title, description });
            if (error) throw error;
            if (data) {
                set(state => ({
                    projects: [...state.projects, data as Project]
                }));
            }
        } catch (e) {
            console.error('Create Project failed:', e);
        }
    },

    inviteUserToProject: async (projectId, email) => {
        try {
            const { error } = await client.projects[projectId].invite.post({ email });
            if (error) throw error;
        } catch (e) {
            console.error('Invite to project failed:', e);
            throw e;
        }
    },

    assignBoardToProject: async (_boardId, _projectId) => {
        console.warn("Moving boards between projects not yet fully supported on backend");
        // Future: await client.boards[boardId].patch({ projectId });
    },

    updateRecentBoards: (boardId) => {
        let recent: string[] = [];
        try {
            recent = JSON.parse(localStorage.getItem('recent_boards') || '[]');
        } catch {
            recent = [];
        }
        // Remove if exists
        const newRecent = recent.filter((id: string) => id !== boardId);
        // Add to front
        newRecent.unshift(boardId);
        // Keep 10
        if (newRecent.length > 10) newRecent.pop();

        try {
            localStorage.setItem('recent_boards', JSON.stringify(newRecent));
        } catch (e) {
            console.error("Failed to save to localStorage", e);
        }

        // Refresh recent lists from current boards state
        const boards = get().boards;
        const recentBoards = boards
            .filter(b => newRecent.includes(b.id))
            // Sort by index in recent array
            .sort((a, b) => newRecent.indexOf(a.id) - newRecent.indexOf(b.id))
            .slice(0, 4);

        set({ recentBoards });
    }
}));

import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControl, InputLabel, Select, MenuItem, ListSubheader } from '@mui/material';
import { useStore, client } from '../store';

interface MoveCardsDialogProps {
    open: boolean;
    onClose: () => void;
    sourceListId: string;
}

interface TargetList {
    id: string;
    title: string;
    boardId: string;
}

export default function MoveCardsDialog({ open, onClose, sourceListId }: MoveCardsDialogProps) {
    const boards = useStore(state => state.boards);
    const projects = useStore(state => state.projects);
    const initialLists = useStore(state => state.lists);
    const activeBoardId = useStore(state => state.activeBoardId);
    const fetchBoards = useStore(state => state.fetchBoards);

    // We can't use `moveAllCards` from store directly if we are moving to another board,
    // because `moveAllCards` optimistically updates CURRENT board state.
    // If moving to another board, we just need API call and maybe refresh current board.

    const [targetBoardId, setTargetBoardId] = useState(activeBoardId || '');
    const [targetListId, setTargetListId] = useState('');
    const [availableLists, setAvailableLists] = useState<TargetList[]>([]);
    const [loadingLists, setLoadingLists] = useState(false);

    useEffect(() => {
        if (open && boards.length === 0) {
            fetchBoards();
        }
    }, [open, boards.length, fetchBoards]);

    useEffect(() => {
        if (open && activeBoardId) {
            setTargetBoardId(activeBoardId);
            setTargetListId('');
        }
    }, [open, activeBoardId]);

    // Fetch lists when board changes
    useEffect(() => {
        const fetchLists = async () => {
            if (!targetBoardId) {
                setAvailableLists([]);
                return;
            }

            // Optimization: If target is current board, use store lists
            if (targetBoardId === activeBoardId) {
                setAvailableLists(initialLists.filter(l => l.id !== sourceListId));
                return;
            }

            setLoadingLists(true);
            try {
                const { data, error } = await client.boards[targetBoardId].get();
                if (data && !error && data.lists) {
                    setAvailableLists(data.lists.map((l: any) => ({
                        id: l.id,
                        title: l.title,
                        boardId: l.boardId
                    })));
                } else {
                    setAvailableLists([]);
                }
            } catch (e) {
                console.error("Failed to fetch lists", e);
                setAvailableLists([]);
            } finally {
                setLoadingLists(false);
            }
        };

        if (open) {
            fetchLists();
        }
    }, [targetBoardId, open, activeBoardId, initialLists, sourceListId]);

    const handleMove = async () => {
        if (targetListId && sourceListId) {
            // Call API directly to support cross-board move if needed (though endpoint just needs targetListId)
            // The backend endpoint `POST /lists/:id/move-cards` takes `targetListId`.
            // It handles checking if valid.
            try {
                await client.lists[sourceListId]['move-cards'].post({ targetListId });
                // Refresh current board to remove cards from source
                useStore.getState().fetchBoard(activeBoardId!, true);
                onClose();
            } catch (e) {
                console.error("Failed to move cards", e);
            }
        }
    };

    // Group boards by Project
    const groupedBoards = useMemo(() => {
        const groups: Record<string, typeof boards> = {};
        const noProjectBoards: typeof boards = [];

        boards.forEach(board => {
            if (board.projectId) {
                if (!groups[board.projectId]) groups[board.projectId] = [];
                groups[board.projectId].push(board);
            } else {
                noProjectBoards.push(board);
            }
        });
        return { groups, noProjectBoards };
    }, [boards]);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>Move All Cards</DialogTitle>
            <DialogContent>
                <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel>Target Board</InputLabel>
                    <Select
                        value={targetBoardId}
                        label="Target Board"
                        onChange={(e) => {
                            setTargetBoardId(e.target.value);
                            setTargetListId(''); // Reset list on board change
                        }}
                    >
                        {/* Boards without project */}
                        {groupedBoards.noProjectBoards.length > 0 && <ListSubheader>Personal Boards</ListSubheader>}
                        {groupedBoards.noProjectBoards.map(board => (
                            <MenuItem key={board.id} value={board.id}>{board.title}</MenuItem>
                        ))}

                        {/* Projects */}
                        {Object.entries(groupedBoards.groups).map(([projectId, projectBoards]) => {
                            const project = projects.find(p => p.id === projectId);
                            return [
                                <ListSubheader key={`header-${projectId}`}>{project?.title || 'Unknown Project'}</ListSubheader>,
                                ...projectBoards.map(board => (
                                    <MenuItem key={board.id} value={board.id}>{board.title}</MenuItem>
                                ))
                            ];
                        })}
                    </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mt: 2 }} disabled={!targetBoardId || loadingLists}>
                    <InputLabel>Target List</InputLabel>
                    <Select
                        value={targetListId}
                        label="Target List"
                        onChange={(e) => setTargetListId(e.target.value)}
                    >
                        {availableLists.length === 0 && !loadingLists ? (
                            <MenuItem disabled>No other lists available</MenuItem>
                        ) : (
                            availableLists.map(list => (
                                <MenuItem key={list.id} value={list.id}>
                                    {list.title}
                                </MenuItem>
                            ))
                        )}
                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleMove} variant="contained" disabled={!targetListId}>
                    Move Cards
                </Button>
            </DialogActions>
        </Dialog>
    );
}

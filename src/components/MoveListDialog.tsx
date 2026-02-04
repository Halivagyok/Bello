import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControl, InputLabel, Select, MenuItem, ListSubheader } from '@mui/material';
import { useStore } from '../store';
import { client } from '../store';

interface MoveListDialogProps {
    open: boolean;
    onClose: () => void;
    listId: string;
}

export default function MoveListDialog({ open, onClose, listId }: MoveListDialogProps) {
    const boards = useStore(state => state.boards);
    const projects = useStore(state => state.projects);
    const activeBoardId = useStore(state => state.activeBoardId);
    // moveListToBoard unused as we use client directly for position support
    const fetchBoards = useStore(state => state.fetchBoards);

    // We also need access to the current list's position to pre-fill or exclude?
    // Usually "Move List" just appends, but user asked for "list of positions".
    // To show positions, we need to fetch the target board's lists.
    const [targetBoardId, setTargetBoardId] = useState(activeBoardId || '');
    const [targetPosition, setTargetPosition] = useState<number | ''>('');
    const [targetLists, setTargetLists] = useState<any[]>([]); // Store actual lists for calc
    const [loadingPositions, setLoadingPositions] = useState(false);

    useEffect(() => {
        if (open && boards.length === 0) {
            fetchBoards();
        }
    }, [open, boards.length, fetchBoards]);

    useEffect(() => {
        if (open && activeBoardId) {
            setTargetBoardId(activeBoardId);
        }
    }, [open, activeBoardId]);

    // Fetch lists of target board to determine available positions
    useEffect(() => {
        const fetchTargetBoardLists = async () => {
            if (!targetBoardId) return;
            setLoadingPositions(true);
            try {
                // We use the client directly to peek at the board
                const { data, error } = await client.boards[targetBoardId].get();
                if (data && !error) {
                    setTargetLists(data.lists);
                    // Default to end (index = length + 1)
                    setTargetPosition(data.lists.length + 1);
                }
            } catch (e) {
                console.error("Failed to fetch board lists for position", e);
            } finally {
                setLoadingPositions(false);
            }
        };

        if (open) {
            fetchTargetBoardLists();
        }
    }, [targetBoardId, open]);

    const handleMove = () => {
        if (targetBoardId && listId) {
            // Note: Our store action might need update if we want to support specific position
            // But for now, user asked for "list of positions". 
            // The backend endpoint `PATCH /lists/:id` accepts `boardId` and `position`.
            // Our store action `moveListToBoard` currently only takes `boardId`.
            // We should ideally update the store action or call api directly here?
            // Let's call store action, but we might need to modify store action to accept position
            // OR we just use the simple one for now.
            // Wait, the user EXPLICITLY asked for list of positions.
            // I should update the store action or make a custom call.
            // Let's update this to just call the API directly or assume store update later.
            // Actually, best practice: update store action. But I can't edit store.ts in this turn easily without context switch.
            // I'll call API directly here for the specific position usage, then refresh board.

            // Actually, let's stick to the store's moveListToBoard for now, 
            // BUT wait, `moveListToBoard` in store only sends `boardId`.
            // I will implement a direct API call here to support position, 
            // seeing as `moveListToBoard` is "move to board" (implying append).

            let newPos = 10000;
            const posIndex = Number(targetPosition) - 1; // 0-based index

            if (targetLists.length === 0) {
                newPos = 1000;
            } else if (posIndex === 0) {
                // Insert at start
                const first = targetLists[0];
                newPos = first.position / 2;
            } else if (posIndex >= targetLists.length) {
                // Insert at end
                const last = targetLists[targetLists.length - 1];
                newPos = last.position + 1000;
            } else {
                // Insert between
                const prev = targetLists[posIndex - 1];
                const next = targetLists[posIndex];
                newPos = (prev.position + next.position) / 2;
            }

            client.lists[listId].patch({
                boardId: targetBoardId,
                position: newPos
            }).then(() => {
                useStore.getState().fetchBoard(useStore.getState().activeBoardId!, true);
                onClose();
            });
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
            <DialogTitle>Move List</DialogTitle>
            <DialogContent>
                <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel>Board</InputLabel>
                    <Select
                        value={targetBoardId}
                        label="Board"
                        onChange={(e) => setTargetBoardId(e.target.value)}
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

                <FormControl fullWidth sx={{ mt: 2 }} disabled={loadingPositions}>
                    <InputLabel>Position</InputLabel>
                    <Select
                        value={targetPosition}
                        label="Position"
                        onChange={(e) => setTargetPosition(Number(e.target.value))}
                    >
                        {Array.from({ length: targetLists.length + 1 }, (_, i) => i + 1).map(pos => (
                            <MenuItem key={pos} value={pos}>{pos}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleMove} variant="contained" disabled={!targetBoardId}>
                    Move
                </Button>
            </DialogActions>
        </Dialog>
    );
}

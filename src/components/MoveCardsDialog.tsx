import { useState, useEffect, useMemo } from 'react';
import { useStore, client } from '../store';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

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

    useEffect(() => {
        const fetchLists = async () => {
            if (!targetBoardId) {
                setAvailableLists([]);
                return;
            }

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
            try {
                await client.lists[sourceListId]['move-cards'].post({ targetListId });
                useStore.getState().fetchBoard(activeBoardId!, true);
                onClose();
            } catch (e) {
                console.error("Failed to move cards", e);
            }
        }
    };

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
        <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Move All Cards</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="target-board">Target Board</Label>
                        <Select 
                            value={targetBoardId} 
                            onValueChange={(val) => {
                                setTargetBoardId(val);
                                setTargetListId('');
                            }}
                        >
                            <SelectTrigger id="target-board">
                                <SelectValue placeholder="Select target board" />
                            </SelectTrigger>
                            <SelectContent>
                                {groupedBoards.noProjectBoards.length > 0 && (
                                    <SelectGroup>
                                        <SelectLabel>Personal Boards</SelectLabel>
                                        {groupedBoards.noProjectBoards.map(board => (
                                            <SelectItem key={board.id} value={board.id}>{board.title}</SelectItem>
                                        ))}
                                    </SelectGroup>
                                )}

                                {Object.entries(groupedBoards.groups).map(([projectId, projectBoards]) => {
                                    const project = projects.find(p => p.id === projectId);
                                    return (
                                        <SelectGroup key={projectId}>
                                            <SelectLabel>{project?.title || 'Unknown Project'}</SelectLabel>
                                            {projectBoards.map(board => (
                                                <SelectItem key={board.id} value={board.id}>{board.title}</SelectItem>
                                            ))}
                                        </SelectGroup>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="target-list">Target List</Label>
                        <Select 
                            value={targetListId} 
                            onValueChange={setTargetListId}
                            disabled={!targetBoardId || loadingLists}
                        >
                            <SelectTrigger id="target-list">
                                <SelectValue placeholder="Select target list" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableLists.length === 0 && !loadingLists ? (
                                    <SelectItem value="none" disabled>No other lists available</SelectItem>
                                ) : (
                                    availableLists.map(list => (
                                        <SelectItem key={list.id} value={list.id}>
                                            {list.title}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleMove} disabled={!targetListId || targetListId === 'none'}>
                        Move Cards
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

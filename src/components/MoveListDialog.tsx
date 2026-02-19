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

interface MoveListDialogProps {
    open: boolean;
    onClose: () => void;
    listId: string;
}

export default function MoveListDialog({ open, onClose, listId }: MoveListDialogProps) {
    const boards = useStore(state => state.boards);
    const projects = useStore(state => state.projects);
    const activeBoardId = useStore(state => state.activeBoardId);
    const fetchBoards = useStore(state => state.fetchBoards);

    const [targetBoardId, setTargetBoardId] = useState(activeBoardId || '');
    const [targetPosition, setTargetPosition] = useState<number>(1);
    const [targetLists, setTargetLists] = useState<any[]>([]); 
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

    useEffect(() => {
        const fetchTargetBoardLists = async () => {
            if (!targetBoardId) return;
            setLoadingPositions(true);
            try {
                const { data, error } = await client.boards[targetBoardId].get();
                if (data && !error) {
                    setTargetLists(data.lists);
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
            let newPos = 10000;
            const posIndex = Number(targetPosition) - 1;

            if (targetLists.length === 0) {
                newPos = 1000;
            } else if (posIndex === 0) {
                const first = targetLists[0];
                newPos = first.position / 2;
            } else if (posIndex >= targetLists.length) {
                const last = targetLists[targetLists.length - 1];
                newPos = last.position + 1000;
            } else {
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
                    <DialogTitle>Move List</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="board">Board</Label>
                        <Select value={targetBoardId} onValueChange={setTargetBoardId}>
                            <SelectTrigger id="board">
                                <SelectValue placeholder="Select a board" />
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
                        <Label htmlFor="position">Position</Label>
                        <Select 
                            value={targetPosition.toString()} 
                            onValueChange={(val) => setTargetPosition(parseInt(val))}
                            disabled={loadingPositions}
                        >
                            <SelectTrigger id="position">
                                <SelectValue placeholder="Select position" />
                            </SelectTrigger>
                            <SelectContent>
                                {Array.from({ length: targetLists.length + 1 }, (_, i) => i + 1).map(pos => (
                                    <SelectItem key={pos} value={pos.toString()}>{pos}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleMove} disabled={!targetBoardId}>
                        Move
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

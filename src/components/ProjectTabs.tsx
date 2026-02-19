import { Droppable, Draggable } from '@hello-pangea/dnd';
import { useStore, type Board } from '../store';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { 
    ChevronLeft, 
    ChevronRight, 
    Plus, 
    GripVertical 
} from 'lucide-react';

interface ProjectTabsProps {
    boards: Board[];
    activeBoardId: string | null;
    onRename: (boardId: string, title: string) => void;
    onCreate: () => void;
}

export default function ProjectTabs({ boards, activeBoardId, onRename, onCreate }: ProjectTabsProps) {
    const navigate = useNavigate();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1100);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleStartEdit = (e: React.MouseEvent, board: Board) => {
        e.stopPropagation();
        setEditingId(board.id);
        setEditTitle(board.title);
    };

    const handleSaveEdit = () => {
        if (editingId && editTitle.trim()) {
            onRename(editingId, editTitle);
        }
        setEditingId(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSaveEdit();
        if (e.key === 'Escape') setEditingId(null);
    };

    const navigationContainerRef = useRef<HTMLDivElement>(null);

    const page = useStore(state => state.projectBoardPage);
    const setPage = useStore(state => state.setProjectBoardPage);

    const totalPages = Math.ceil(boards.length / 7);
    const hasNext = page < totalPages - 1;
    const hasPrev = page > 0;

    useEffect(() => {
        if (navigationContainerRef.current) {
            const container = navigationContainerRef.current;
            const scrollAmount = container.clientWidth;
            container.scrollTo({
                left: page * scrollAmount,
                behavior: 'smooth'
            });
        }
    }, [page]);

    const renderTab = (board: Board, provided: any, snapshot: any) => (
        <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onClick={() => navigate(`/boards/${board.id}`)}
            className={`
                min-w-[120px] max-w-[160px] flex-none h-9 px-3 rounded-lg flex items-center cursor-pointer transition-all relative group
                ${board.id === activeBoardId 
                    ? 'bg-white/90 dark:bg-white/20 text-zinc-900 dark:text-white font-bold shadow-sm' 
                    : 'bg-white/30 dark:bg-white/5 text-white/90 hover:bg-white/40 dark:hover:bg-white/10'
                }
                ${snapshot.isDragging ? 'z-50 shadow-xl ring-2 ring-primary opacity-90 scale-105' : ''}
            `}
            onDoubleClick={(e: React.MouseEvent) => handleStartEdit(e, board)}
        >
            <GripVertical className="w-3 h-3 mr-1 opacity-0 group-hover:opacity-40 shrink-0" />
            <div className="flex-1 overflow-hidden text-center">
                {editingId === board.id ? (
                    <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onBlur={handleSaveEdit}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        className="h-6 px-1 py-0 text-xs bg-white dark:bg-zinc-800 text-black dark:text-white border-0 focus-visible:ring-1 focus-visible:ring-primary"
                        onClick={(e) => e.stopPropagation()}
                    />
                ) : (
                    <span className="truncate text-xs">{board.title}</span>
                )}
            </div>
        </div>
    );

    if (isMobile) {
        return (
            <div className="flex items-center w-full gap-2">
                <Select
                    value={activeBoardId || ''}
                    onValueChange={(val) => val && navigate(`/boards/${val}`)}
                >
                    <SelectTrigger className="flex-1 bg-white/20 dark:bg-white/5 border-0 text-white h-9">
                        <SelectValue placeholder="Select board" />
                    </SelectTrigger>
                    <SelectContent>
                        {boards.length === 0 && <SelectItem value="none" disabled>No boards</SelectItem>}
                        {boards.map(board => (
                            <SelectItem key={board.id} value={board.id}>{board.title}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={onCreate}
                    className="shrink-0 h-9 w-9 bg-white/20 dark:bg-white/5 text-white hover:bg-white/30"
                >
                    <Plus className="w-4 h-4" />
                </Button>
            </div>
        );
    }

    return (
        <div className="flex items-center w-full min-w-0 relative gap-1">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={!hasPrev}
                className={`h-7 w-7 shrink-0 text-white hover:bg-white/20 ${!hasPrev ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}
            >
                <ChevronLeft className="w-4 h-4" />
            </Button>

            <Droppable
                droppableId="project-tabs"
                direction="horizontal"
                type="BOARD_TAB"
                renderClone={(provided, snapshot, rubric) => {
                    const board = boards[rubric.source.index];
                    return renderTab(board, provided, snapshot);
                }}
            >
                {(provided) => (
                    <div
                        ref={(ref: HTMLDivElement | null) => {
                            provided.innerRef(ref);
                            // @ts-ignore
                            navigationContainerRef.current = ref;
                        }}
                        {...provided.droppableProps}
                        className="flex items-center gap-1.5 overflow-x-auto scroll-smooth no-scrollbar flex-1 max-w-full py-1"
                    >
                        {boards.map((board, index) => (
                            <Draggable key={board.id} draggableId={board.id} index={index}>
                                {(provided, snapshot) => renderTab(board, provided, snapshot)}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>

            <Button
                variant="ghost"
                size="icon"
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={!hasNext}
                className={`h-7 w-7 shrink-0 text-white hover:bg-white/20 ${!hasNext ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}
            >
                <ChevronRight className="w-4 h-4" />
            </Button>

            <Button
                variant="ghost"
                onClick={onCreate}
                className="ml-1 shrink-0 gap-1.5 text-white/80 hover:text-white hover:bg-white/20 whitespace-nowrap h-8 px-2.5"
            >
                <Plus className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold uppercase tracking-wider">New</span>
            </Button>
        </div>
    );
}

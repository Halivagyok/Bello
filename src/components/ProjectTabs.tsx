import React, { useState } from 'react';
import { Box, Button, TextField, IconButton } from '@mui/material';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import type { Board } from '../store'; // Keep type import for Board

interface ProjectTabsProps {
    boards: Board[];
    activeBoardId: string | null;
    onRename: (boardId: string, newTitle: string) => void;
    onCreate: () => void;
}

export default function ProjectTabs({ boards, activeBoardId, onRename, onCreate }: ProjectTabsProps) {
    const navigate = useNavigate();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');

    // Pagination from store
    const page = useStore(state => state.projectBoardPage);
    const setPage = useStore(state => state.setProjectBoardPage);

    const startIndex = page * 5;
    const visibleBoards = boards.slice(startIndex, startIndex + 5);
    const hasNext = (startIndex + 5) < boards.length;
    const hasPrev = page > 0;

    const startEditing = (board: Board) => {
        setEditingId(board.id);
        setEditTitle(board.title);
    };

    const saveEditing = () => {
        if (editingId && editTitle.trim()) {
            onRename(editingId, editTitle.trim());
        }
        setEditingId(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            saveEditing();
        } else if (e.key === 'Escape') {
            setEditingId(null);
        }
    };

    const renderTab = (board: Board, provided: any, snapshot: any) => (
        <Box
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onClick={() => navigate(`/boards/${board.id}`)}
            sx={{
                ...provided.draggableProps.style,
                minWidth: 120,
                height: 36,
                px: 2,
                borderRadius: '6px', // Rounded all corners
                bgcolor: board.id === activeBoardId ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)',
                color: board.id === activeBoardId ? '#172b4d' : 'white',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                fontWeight: board.id === activeBoardId ? 'bold' : 'normal',
                transition: 'background-color 0.2s',
                '&:hover': {
                    bgcolor: board.id === activeBoardId ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)'
                },
                // Add specific style for dragging state to fix offset/scale issues
                ...(snapshot.isDragging && {
                    transform: provided.draggableProps.style?.transform,
                    zIndex: 9999,
                    boxShadow: '0 5px 10px rgba(0,0,0,0.2)',
                    opacity: 0.9
                })
            }}
            onDoubleClick={(e: React.MouseEvent) => {
                e.stopPropagation(); // Prevent drag?
                startEditing(board);
            }}
        >
            {editingId === board.id ? (
                <TextField
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={saveEditing}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    size="small"
                    variant="standard"
                    InputProps={{ disableUnderline: true }}
                    sx={{ input: { color: 'inherit', fontWeight: 'inherit', p: 0 } }}
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                />
            ) : (
                board.title
            )}
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', maxWidth: '100%' }}>

            {/* Prev Button */}
            {hasPrev && (
                <IconButton
                    size="small"
                    onClick={() => setPage(page - 1)}
                    sx={{ color: 'white', mr: 1, bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}
                >
                    <ArrowBackIosNewIcon fontSize="small" />
                </IconButton>
            )}

            <Droppable
                droppableId="project-tabs"
                direction="horizontal"
                type="BOARD_TAB"
                renderClone={(provided, snapshot, rubric) => {
                    const board = visibleBoards[rubric.source.index];
                    return renderTab(board, provided, snapshot);
                }}
            >
                {(provided) => (
                    <Box
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                    >
                        {visibleBoards.map((board, index) => (
                            <Draggable key={board.id} draggableId={board.id} index={index}>
                                {(provided, snapshot) => renderTab(board, provided, snapshot)}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </Box>
                )}
            </Droppable>

            {/* Next Button */}
            {hasNext && (
                <IconButton
                    size="small"
                    onClick={() => setPage(page + 1)}
                    sx={{ color: 'white', ml: 1, bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}
                >
                    <ArrowForwardIosIcon fontSize="small" />
                </IconButton>
            )}

            <Button
                variant="text"
                startIcon={<AddIcon />}
                onClick={onCreate}
                sx={{
                    ml: 1,
                    minWidth: 'auto',
                    color: 'white',
                    opacity: 0.8,
                    '&:hover': { opacity: 1, bgcolor: 'rgba(255,255,255,0.2)' }
                }}
            >
                New Board
            </Button>
        </Box>
    );
}

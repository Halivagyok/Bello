import { Box, IconButton, TextField, useMediaQuery, Select, MenuItem, Button } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import AddIcon from '@mui/icons-material/Add';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { useStore, type Board } from '../store';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
    const isMobile = useMediaQuery('(max-width:1100px)');

    const onTabClick = (boardId: string) => {
        // If we are just switching tabs, we might just want to fetchBoard.
        // But since we are using URLs, we should probably navigate.
        // However, the original logic was fetchBoard.
        // The TopBar usage suggests we just want to switch the active board view.
        // But let's check if the parent component handles navigation?
        // TopBar just renders ProjectTabs.
        // BoardPage renders TopBar.
        // If we navigate to /boards/:id, BoardPage remounts/updates.
        navigate(`/boards/${boardId}`);
    };

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

    const navigationContainerRef = React.useRef<HTMLDivElement>(null);

    // Pagination from store
    const page = useStore(state => state.projectBoardPage);
    const setPage = useStore(state => state.setProjectBoardPage);

    // Calculate generic stats
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
        <Box
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onClick={() => navigate(`/boards/${board.id}`)}
            sx={{
                ...provided.draggableProps.style,
                minWidth: 120, // Keep fixed width
                maxWidth: 160,
                flex: '0 0 auto', // Prevent shrinking
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
                }),
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
            }}
            onDoubleClick={(e: React.MouseEvent) => {
                e.stopPropagation(); // Prevent drag?
                handleStartEdit(e, board);
            }}
        >
            {editingId === board.id ? (
                <TextField
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={handleSaveEdit}
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

    if (isMobile) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1 }}>
                <Select
                    size="small"
                    value={activeBoardId || ''}
                    onChange={(e) => {
                        const boardId = e.target.value;
                        if (boardId) onTabClick(boardId);
                    }}
                    displayEmpty
                    sx={{
                        flex: 1,
                        color: 'white',
                        '.MuiSelect-icon': { color: 'white' },
                        '.MuiOutlinedInput-notchedOutline': { border: 'none' }, // Clean look
                        bgcolor: 'rgba(255,255,255,0.1)',
                        borderRadius: 2,
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                    }}
                    MenuProps={{
                        PaperProps: {
                            sx: {
                                bgcolor: '#1976d2', // Match theme main color approx
                                color: 'white',
                                '& .MuiMenuItem-root': {
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                                    '&.Mui-selected': { bgcolor: 'rgba(255,255,255,0.2)' }
                                }
                            }
                        }
                    }}
                >
                    {boards.length === 0 && <MenuItem value="" disabled>No boards</MenuItem>}
                    {boards.map(board => (
                        <MenuItem key={board.id} value={board.id}>{board.title}</MenuItem>
                    ))}
                </Select>
                <IconButton onClick={onCreate} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
                    <AddIcon />
                </IconButton>
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', minWidth: 0, position: 'relative' }}>
            {/* Prev Button */}
            <IconButton
                size="small"
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={!hasPrev}
                sx={{
                    color: 'white',
                    flexShrink: 0,
                    mr: 1,
                    bgcolor: 'rgba(255,255,255,0.1)',
                    opacity: hasPrev ? 1 : 0.3,
                    '&:hover': { bgcolor: hasPrev ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)' }
                }}
            >
                <ArrowBackIosNewIcon fontSize="small" />
            </IconButton>

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
                    <Box
                        ref={(ref: HTMLDivElement | null) => {
                            provided.innerRef(ref);
                            // @ts-ignore
                            navigationContainerRef.current = ref;
                        }}
                        {...provided.droppableProps}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            overflowX: 'auto',
                            scrollBehavior: 'smooth',
                            scrollbarWidth: 'none',
                            '&::-webkit-scrollbar': { display: 'none' },
                            flex: 1,
                            maxWidth: '100%',
                        }}
                    >
                        {boards.map((board, index) => (
                            <Draggable key={board.id} draggableId={board.id} index={index}>
                                {(provided, snapshot) => renderTab(board, provided, snapshot)}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </Box>
                )}
            </Droppable>

            {/* Next Button */}
            <IconButton
                size="small"
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={!hasNext}
                sx={{
                    color: 'white',
                    flexShrink: 0,
                    ml: 1,
                    bgcolor: 'rgba(255,255,255,0.1)',
                    opacity: hasNext ? 1 : 0.3,
                    '&:hover': { bgcolor: hasNext ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)' }
                }}
            >
                <ArrowForwardIosIcon fontSize="small" />
            </IconButton>

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

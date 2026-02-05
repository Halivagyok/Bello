
import { useEffect, useRef } from 'react';
import { Box, Button, Paper, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { useStore } from '../store';
import TopBar from '../components/TopBar';
import CardList from '../components/CardList';
import { useParams, useNavigate } from 'react-router-dom';

export default function Board() {
    const { boardId } = useParams<{ boardId: string }>();
    const navigate = useNavigate();

    const lists = useStore((state) => state.lists);
    const moveList = useStore((state) => state.moveList);
    const moveCard = useStore((state) => state.moveCard);
    const addList = useStore((state) => state.addList);
    const fetchBoard = useStore((state) => state.fetchBoard);
    const fetchBoards = useStore((state) => state.fetchBoards);
    const fetchProjects = useStore((state) => state.fetchProjects);

    const activeProjectId = useStore((state) => state.activeProjectId);
    const reorderProjectBoards = useStore((state) => state.reorderProjectBoards);
    const projects = useStore((state) => state.projects);
    const boards = useStore((state) => state.boards);
    const projectBoardPage = useStore((state) => state.projectBoardPage);
    const setProjectBoardPage = useStore((state) => state.setProjectBoardPage);

    // Ref to track previous board ID to prevent auto-switching page when manually navigating tabs
    const prevBoardIdRef = useRef<string | null>(null);

    // Initial Fetch Effect
    useEffect(() => {
        fetchBoards();
        fetchProjects();
    }, [fetchBoards, fetchProjects]);

    // Fetch Board Data Effect - Only when ID changes
    useEffect(() => {
        if (boardId) {
            fetchBoard(boardId);
        }
        return () => {
            const store = useStore.getState();
            if (boardId) store.unsubscribeFromBoard(boardId);
        }
    }, [boardId, fetchBoard]);

    // Sync Page Effect - Only when Board ID changes
    useEffect(() => {
        if (!boardId || !activeProjectId) return;

        // If simple re-render or page switch by user, do NOT force back to active board
        // Only force if we actually navigated to a new URL/Board
        // Also handle initial load where prevBoardIdRef.current is null

        // Note: We need to wait for boards/projects to load to calculate page.
        // If they are empty, we might miss the sync.
        // But if boardId changed, we WANT to sync.

        const project = projects.find(p => p.id === activeProjectId);
        if (!project) return;

        // We check if we need to sync based on board change OR if we haven't synced yet (initial)
        const isNewBoard = boardId !== prevBoardIdRef.current;

        if (isNewBoard) {
            const projectBoards = boards.filter(b => b.projectId === activeProjectId);

            // Sort to find index
            if (project.boardIds) {
                projectBoards.sort((a, b) => {
                    const indexA = project.boardIds!.indexOf(a.id);
                    const indexB = project.boardIds!.indexOf(b.id);
                    return indexA - indexB;
                });
            }

            const activeIndex = projectBoards.findIndex(b => b.id === boardId);
            if (activeIndex !== -1) {
                const requiredPage = Math.floor(activeIndex / 7);
                if (requiredPage !== projectBoardPage) {
                    setProjectBoardPage(requiredPage);
                }
                // Only update ref after we successfully found and synced (or verified)
                prevBoardIdRef.current = boardId;
            }
        }
    }, [boardId, activeProjectId, boards, projects, projectBoardPage, setProjectBoardPage]);

    const onDragEnd = (result: DropResult) => {
        const { destination, source, type } = result;

        if (!destination) return;

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        // Handle Project Tabs Reordering
        if (type === 'BOARD_TAB') {
            if (!activeProjectId) return;
            const project = projects.find(p => p.id === activeProjectId);
            if (!project) return;

            // Get current boards for the project
            let projectBoards = boards.filter(b => b.projectId === activeProjectId);

            // Sort to match UI
            if (project.boardIds) {
                projectBoards.sort((a, b) => {
                    const indexA = project.boardIds!.indexOf(a.id);
                    const indexB = project.boardIds!.indexOf(b.id);
                    if (indexA === -1) return 1;
                    if (indexB === -1) return -1;
                    return indexA - indexB;
                });
            }

            const currentOrder = projectBoards.map(b => b.id);

            // Since ProjectTabs renders all items in a scrollable list, the indices are absolute.
            const [movedId] = currentOrder.splice(source.index, 1);
            currentOrder.splice(destination.index, 0, movedId);

            reorderProjectBoards(activeProjectId, currentOrder);
            return;
        }

        // Handle List Reordering
        if (type === 'list') {
            moveList(source.index, destination.index);
            return;
        }

        // Handle Card Reordering
        moveCard(
            source.droppableId,
            destination.droppableId,
            source.index,
            destination.index
        );
    };

    return (

        <Box sx={{
            height: '100vh',
            display: 'flex',
            backgroundImage: 'linear-gradient(135deg, #0079bf 0%, #5067c5 100%)', // Trello-like gradient
            overflow: 'hidden'
        }}>
            {/* Sidebar Placeholder */}
            <Box sx={{
                width: 260,
                flexShrink: 0,
                borderRight: '1px solid rgba(255,255,255,0.1)',
                bgcolor: 'rgba(0,0,0,0.15)',
                display: 'flex',
                flexDirection: 'column',
                p: 2
            }}>
                <Typography variant="h6" fontWeight="bold" sx={{ color: 'white', mb: 2, px: 1 }}>Bello</Typography>

                <Button
                    variant="text"
                    sx={{ color: 'white', justifyContent: 'flex-start' }}
                    onClick={() => navigate('/boards')}
                >
                    Back to Boards
                </Button>
            </Box>

            {/* Main Content */}
            <DragDropContext onDragEnd={onDragEnd}>
                <Box sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}>
                    <TopBar />
                    <Paper
                        elevation={0}
                        sx={{
                            display: 'flex',
                            flex: 1,
                            gap: 2,
                            overflowX: 'auto',
                            flexWrap: 'nowrap',
                            alignItems: 'flex-start',
                            p: 2,
                            maxWidth: '100%',
                            width: '100%',
                            bgcolor: 'transparent',
                            '&::-webkit-scrollbar': {
                                height: '12px'
                            },
                            '&::-webkit-scrollbar-track': {
                                bgcolor: 'rgba(0,0,0,0.1)'
                            },
                            '&::-webkit-scrollbar-thumb': {
                                bgcolor: 'rgba(255,255,255,0.3)',
                                borderRadius: '6px'
                            }
                        }}
                    >

                        <Droppable droppableId="board" direction="horizontal" type="list">
                            {(provided) => (
                                <Box
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', height: '100%' }}
                                >
                                    {lists.map((list, index) => (
                                        <Draggable key={list.id} draggableId={list.id} index={index}>
                                            {(provided) => (
                                                <Box
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    sx={{
                                                        minWidth: 280,
                                                        flexShrink: 0,
                                                        ...provided.draggableProps.style,
                                                        maxHeight: '100%',
                                                        display: 'flex',
                                                        flexDirection: 'column'
                                                    }}
                                                >
                                                    <CardList list={list} index={index} />
                                                </Box>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </Box>
                            )}
                        </Droppable>

                        <Box sx={{ minWidth: 280, flexShrink: 0 }}>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => addList("New List")}
                                sx={{
                                    width: '100%',
                                    justifyContent: 'flex-start',
                                    bgcolor: 'rgba(255,255,255,0.24)',
                                    color: 'white',
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.32)' },
                                    backdropFilter: 'blur(4px)',
                                    textTransform: 'none'
                                }}
                            >
                                <Typography>Add another list</Typography>
                            </Button>
                        </Box>
                    </Paper>
                </Box>
            </DragDropContext>
        </Box>
    );
}


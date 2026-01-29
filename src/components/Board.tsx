
import { Box, Button, Paper, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { useStore } from '../store';
import TopBar from './TopBar';
import CardList from './CardList';

export default function Board() {
    const lists = useStore((state) => state.lists);
    const moveList = useStore((state) => state.moveList);
    const moveCard = useStore((state) => state.moveCard);
    const addList = useStore((state) => state.addList);

    const onDragEnd = (result: DropResult) => {
        const { destination, source, type } = result;

        if (!destination) return;

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
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
                alignItems: 'center',
                justifyContent: 'center'
            }}>
            </Box>

            {/* Main Content */}
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
                    <DragDropContext onDragEnd={onDragEnd}>
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
                    </DragDropContext>

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
        </Box>
    );
}


import { useState } from 'react';
import { Box, Button, Paper, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import CardList from './CardList';

export default function Board() {
    // Using a simple array of IDs for now. In a real app, this would be more complex objects.
    const [listIds, setListIds] = useState<number[]>([1]);

    const handleAddList = () => {
        const newId = listIds.length > 0 ? Math.max(...listIds) + 1 : 1;
        setListIds([...listIds, newId]);
    };

    const onDragEnd = (result: DropResult) => {
        const { destination, source } = result;

        if (!destination) {
            return;
        }

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        const newLists = Array.from(listIds);
        const [removed] = newLists.splice(source.index, 1);
        newLists.splice(destination.index, 0, removed);

        setListIds(newLists);
    };

    return (
        <Paper
            elevation={0}
            sx={{
                display: 'flex',
                gap: 2,
                overflowX: 'auto',
                flexWrap: 'nowrap', // Ensure lists don't wrap
                alignItems: 'flex-start', // Align lists to the top
                p: 2,
                height: '80vh', // Fixed height, not full screen
                maxWidth: '1200px', // Constrained width
                width: '100%',
                mx: 'auto', // Centered
                my: 4, // Vertical margin
                borderRadius: 4, // Rounded edges
                bgcolor: 'rgba(255,255,255,0.1)' // Slight tint to show the "board" area
            }}
        >
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="board" direction="horizontal" type="list">
                    {(provided) => (
                        <Box
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}
                        >
                            {listIds.map((id, index) => (
                                <Draggable key={id} draggableId={id.toString()} index={index}>
                                    {(provided) => (
                                        <Box
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            sx={{ minWidth: 280, flexShrink: 0, ...provided.draggableProps.style }}
                                        >
                                            <CardList />
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
                    onClick={handleAddList}
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
    );
}

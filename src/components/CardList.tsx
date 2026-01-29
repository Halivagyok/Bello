import { useState } from 'react';
import { Paper, Typography, Button, TextField, Box, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { Droppable } from '@hello-pangea/dnd';
import { useStore, type List } from '../store';
import Card from './Card';

interface CardListProps {
    list: List;
    index: number;
}

export default function CardList({ list }: CardListProps) {
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [title, setTitle] = useState(list.title);
    const [isAddingCard, setIsAddingCard] = useState(false);
    const [newCardContent, setNewCardContent] = useState("");

    const addCard = useStore((state) => state.addCard);
    const updateListTitle = useStore((state) => state.updateListTitle);

    const handleTitleClick = () => {
        setIsEditingTitle(true);
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
    };

    const handleTitleBlur = () => {
        setIsEditingTitle(false);
        if (title !== list.title) {
            updateListTitle(list.id, title);
        }
    };

    const handleConfirmAddCard = () => {
        if (newCardContent.trim()) {
            addCard(list.id, newCardContent);
            setNewCardContent("");
        }
    };

    const handleCancelAddCard = () => {
        setIsAddingCard(false);
        setNewCardContent("");
    };

    return (
        <Paper
            elevation={2}
            sx={{
                width: 300,
                bgcolor: '#ebecf0',
                p: 1,
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                maxHeight: '100%'
            }}
        >
            {/* List Header / Title */}
            <Box sx={{ p: 1, mb: 1 }}>
                {isEditingTitle ? (
                    <TextField
                        fullWidth
                        value={title}
                        onChange={handleTitleChange}
                        onBlur={handleTitleBlur}
                        autoFocus
                        size="small"
                        variant="outlined"
                        sx={{ bgcolor: 'white' }}
                    />
                ) : (
                    <Typography
                        variant="h6"
                        onClick={handleTitleClick}
                        sx={{
                            cursor: 'pointer',
                            fontWeight: 600,
                            '&:hover': { cursor: 'pointer' }
                        }}
                    >
                        {list.title}
                    </Typography>
                )}
            </Box>

            {/* Cards Area - Droppable Zone */}
            <Droppable droppableId={list.id} type="card">
                {(provided, snapshot) => (
                    <Box
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        sx={{
                            px: 1,
                            mb: 1,
                            minHeight: 10,
                            maxHeight: '70vh',
                            overflowY: 'auto',
                            bgcolor: snapshot.isDraggingOver ? 'rgba(0,0,0,0.05)' : 'transparent',
                            borderRadius: 2,
                            transition: 'background-color 0.2s ease'
                        }}
                    >
                        {list.cards.map((card, idx) => (
                            <Card key={card.id} card={card} index={idx} />
                        ))}
                        {provided.placeholder}
                    </Box>
                )}
            </Droppable>

            {/* Add Card Input Area */}
            <Box sx={{ px: 1 }}>
                {isAddingCard ? (
                    <Box sx={{ mt: 1 }}>
                        <Paper sx={{ p: 1, mb: 1 }}>
                            <TextField
                                fullWidth
                                multiline
                                placeholder="Enter a title for this card..."
                                value={newCardContent}
                                onChange={(e) => setNewCardContent(e.target.value)}
                                variant="standard"
                                InputProps={{ disableUnderline: true }}
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleConfirmAddCard();
                                    }
                                }}
                            />
                        </Paper>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Button
                                variant="contained"
                                onClick={handleConfirmAddCard}
                                size="small"
                            >
                                Add Card
                            </Button>
                            <IconButton size="small" onClick={handleCancelAddCard}>
                                <CloseIcon />
                            </IconButton>
                        </Box>
                    </Box>
                ) : (
                    <Button
                        startIcon={<AddIcon />}
                        fullWidth
                        onClick={() => setIsAddingCard(true)}
                        sx={{
                            justifyContent: 'flex-start',
                            color: 'text.secondary',
                            textTransform: 'none',
                            '&:hover': { bgcolor: 'rgba(0,0,0,0.08)' }
                        }}
                    >
                        Add a card
                    </Button>
                )}
            </Box>
        </Paper>
    );
}


import { useState } from 'react';
import { Paper, Typography, Button, TextField, Box, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import Card from './Card';

export default function CardList() {
    const [title, setTitle] = useState("New List");
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [cards, setCards] = useState<string[]>([]);
    const [isAddingCard, setIsAddingCard] = useState(false);
    const [newCardContent, setNewCardContent] = useState("");

    const handleTitleClick = () => {
        setIsEditingTitle(true);
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
    };

    const handleTitleBlur = () => {
        setIsEditingTitle(false);
    };

    const handleAddCardClick = () => {
        setIsAddingCard(true);
    };

    const handleConfirmAddCard = () => {
        if (newCardContent.trim()) {
            setCards([...cards, newCardContent]);
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
                borderRadius: 2
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
                        {title}
                    </Typography>
                )}
            </Box>

            {/* Cards Area */}
            <Box sx={{ px: 1, mb: 1 }}>
                {cards.map((content, index) => (
                    <Card key={index} content={content} />
                ))}

                {/* Add Card Input Area */}
                {isAddingCard && (
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
                )}
            </Box>

            {/* Add Card Button trigger */}
            {!isAddingCard && (
                <Button
                    startIcon={<AddIcon />}
                    fullWidth
                    onClick={handleAddCardClick}
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
        </Paper>
    );
}

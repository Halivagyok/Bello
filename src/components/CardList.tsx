import { useState } from 'react';
import { Paper, Typography, Button, TextField, Box, IconButton, Menu, MenuItem, Divider, ListItemIcon, ListItemText } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DriveFileMoveIcon from '@mui/icons-material/DriveFileMove';
import SortIcon from '@mui/icons-material/Sort';
import PaletteIcon from '@mui/icons-material/Palette';
import DeleteIcon from '@mui/icons-material/Delete';
import { Droppable } from '@hello-pangea/dnd';
import { useStore, type List } from '../store';
import Card from './Card';
import MoveListDialog from './MoveListDialog';
import MoveCardsDialog from './MoveCardsDialog';
import { getContrastText } from '../utils/colors';

interface CardListProps {
    list: List;
    index: number;
}

export default function CardList({ list }: CardListProps) {
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [title, setTitle] = useState(list.title);
    const [isAddingCard, setIsAddingCard] = useState(false);
    const [newCardContent, setNewCardContent] = useState("");
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [openMoveList, setOpenMoveList] = useState(false);
    const [openMoveCards, setOpenMoveCards] = useState(false);
    const [colorAnchorEl, setColorAnchorEl] = useState<null | HTMLElement>(null);
    const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);

    const addCard = useStore((state) => state.addCard);
    const updateListTitle = useStore((state) => state.updateListTitle);
    const deleteList = useStore((state) => state.deleteList);
    const duplicateList = useStore((state) => state.duplicateList);
    const updateListColor = useStore((state) => state.updateListColor);
    const sortCards = useStore((state) => state.sortCards);

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

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setColorAnchorEl(null);
        setSortAnchorEl(null);
    };

    const handleDeleteList = () => {
        deleteList(list.id);
        handleMenuClose();
    };

    const handleDuplicate = () => {
        const newTitle = prompt("Enter title for the new list:", `Copy of ${list.title}`);
        if (newTitle) {
            duplicateList(list.id, newTitle);
        }
        handleMenuClose();
    };

    const handleColorClick = (event: React.MouseEvent<HTMLElement>) => {
        setColorAnchorEl(event.currentTarget);
    };

    const handleColorChange = (color: string) => {
        updateListColor(list.id, color);
        handleMenuClose();
    };

    const handleSortClick = (event: React.MouseEvent<HTMLElement>) => {
        setSortAnchorEl(event.currentTarget);
    };

    const handleSort = (sortBy: 'oldest' | 'newest' | 'abc') => {
        sortCards(list.id, sortBy);
        handleMenuClose();
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
                bgcolor: list.color || '#ebecf0',
                p: 1,
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                maxHeight: '100%'
            }}
        >
            {/* List Header / Title */}
            <Box sx={{ p: 1, mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                            '&:hover': { cursor: 'pointer' },
                            flexGrow: 1,
                            color: getContrastText(list.color)
                        }}
                    >
                        {list.title}
                    </Typography>
                )}
                <IconButton
                    size="small"
                    onClick={handleMenuClick}
                    sx={{ color: getContrastText(list.color) }}
                >
                    <MoreHorizIcon />
                </IconButton>
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                >
                    <MenuItem onClick={handleDuplicate}>
                        <ListItemIcon><ContentCopyIcon fontSize="small" /></ListItemIcon>
                        <ListItemText>Duplicate List</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => { setOpenMoveList(true); handleMenuClose(); }}>
                        <ListItemIcon><DriveFileMoveIcon fontSize="small" /></ListItemIcon>
                        <ListItemText>Move List...</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => { setOpenMoveCards(true); handleMenuClose(); }}>
                        <ListItemIcon><DriveFileMoveIcon fontSize="small" /></ListItemIcon>
                        <ListItemText>Move All Cards...</ListItemText>
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleSortClick}>
                        <ListItemIcon><SortIcon fontSize="small" /></ListItemIcon>
                        <ListItemText>Sort Cards</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={handleColorClick}>
                        <ListItemIcon><PaletteIcon fontSize="small" /></ListItemIcon>
                        <ListItemText>Change Color</ListItemText>
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleDeleteList} sx={{ color: 'error.main' }}>
                        <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
                        <ListItemText>Delete List</ListItemText>
                    </MenuItem>
                </Menu>

                {/* Sort Submenu */}
                <Menu
                    anchorEl={sortAnchorEl}
                    open={Boolean(sortAnchorEl)}
                    onClose={() => setSortAnchorEl(null)}
                >
                    <MenuItem onClick={() => handleSort('oldest')}>Date Created (Oldest)</MenuItem>
                    <MenuItem onClick={() => handleSort('newest')}>Date Created (Newest)</MenuItem>
                    <MenuItem onClick={() => handleSort('abc')}>Alphabetically</MenuItem>
                </Menu>

                {/* Color Submenu */}
                <Menu
                    anchorEl={colorAnchorEl}
                    open={Boolean(colorAnchorEl)}
                    onClose={() => setColorAnchorEl(null)}
                >
                    <Box sx={{ p: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }}>
                        {['#ebecf0', '#ffcdd2', '#f8bbd0', '#e1bee7', '#d1c4e9', '#c5cae9', '#bbdefb', '#b3e5fc',
                            '#b2ebf2', '#b2dfdb', '#c8e6c9', '#dcedc8', '#f0f4c3', '#fff9c4', '#ffecb3', '#ffe0b2'].map(color => (
                                <Box
                                    key={color}
                                    onClick={() => handleColorChange(color)}
                                    sx={{
                                        width: 30,
                                        height: 30,
                                        bgcolor: color,
                                        borderRadius: 1,
                                        cursor: 'pointer',
                                        border: list.color === color ? '2px solid #000' : '1px solid #ccc',
                                        '&:hover': { transform: 'scale(1.1)' }
                                    }}
                                />
                            ))}
                    </Box>
                    <Divider />
                    <Box sx={{ p: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Custom:</Typography>
                        <input
                            type="color"
                            value={list.color || '#ebecf0'}
                            onChange={(e) => handleColorChange(e.target.value)}
                            style={{ cursor: 'pointer', height: 32, width: 64, padding: 0, border: 'none', background: 'none' }}
                        />
                    </Box>
                </Menu>

                <MoveListDialog open={openMoveList} onClose={() => setOpenMoveList(false)} listId={list.id} />
                <MoveCardsDialog open={openMoveCards} onClose={() => setOpenMoveCards(false)} sourceListId={list.id} />
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
                            <IconButton
                                size="small"
                                onClick={handleCancelAddCard}
                                sx={{ color: getContrastText(list.color) }}
                            >
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
                            color: getContrastText(list.color),
                            textTransform: 'none',
                            '&:hover': {
                                bgcolor: getContrastText(list.color) === '#ffffff'
                                    ? 'rgba(255, 255, 255, 0.2)'
                                    : 'rgba(0, 0, 0, 0.08)'
                            }
                        }}
                    >
                        Add a card
                    </Button>
                )}
            </Box>
        </Paper>
    );
}


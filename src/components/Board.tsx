import { useState } from 'react';
import { Box, Button, Paper } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CardList from './CardList';

export default function Board() {
    // Using a simple array of IDs for now. In a real app, this would be more complex objects.
    const [listIds, setListIds] = useState<number[]>([1]);

    const handleAddList = () => {
        const newId = listIds.length > 0 ? Math.max(...listIds) + 1 : 1;
        setListIds([...listIds, newId]);
    };

    return (
        <Paper
            elevation={0}
            sx={{
                display: 'flex',
                gap: 2,
                overflowX: 'auto',
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
            {listIds.map((id) => (
                <Box key={id} sx={{ minWidth: 280 }}>
                    <CardList />
                </Box>
            ))}

            <Box sx={{ minWidth: 280 }}>
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
                        backdropFilter: 'blur(4px)'
                    }}
                >
                    Add another list
                </Button>
            </Box>
        </Paper>
    );
}

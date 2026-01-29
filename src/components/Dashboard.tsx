import { useEffect, useState } from 'react';
import { Box, Typography, Button, Grid, Paper, Card, CardActionArea, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const user = useStore(state => state.user);
    const boards = useStore(state => state.boards);
    const fetchBoards = useStore(state => state.fetchBoards);
    const createBoard = useStore(state => state.createBoard);
    const logout = useStore(state => state.logout);
    const navigate = useNavigate();

    const [open, setOpen] = useState(false);
    const [newTitle, setNewTitle] = useState('');

    useEffect(() => {
        fetchBoards();
    }, [fetchBoards]);

    const handleCreate = async () => {
        if (!newTitle.trim()) return;
        const newBoard = await createBoard(newTitle);
        setNewTitle('');
        setOpen(false);
        if (newBoard) {
            navigate(`/boards/${newBoard.id}`);
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f4f5f7' }}>
            {/* Top Bar */}
            <Box sx={{ p: 2, bgcolor: '#026aa7', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight="bold">Bello Dashboard</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography>Welcome, {user?.name || user?.email}</Typography>
                    <Button variant="contained" color="secondary" size="small" startIcon={<LogoutIcon />} onClick={logout}>
                        Logout
                    </Button>
                </Box>
            </Box>

            {/* Content */}
            <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
                <Typography variant="h5" sx={{ mb: 3 }} fontWeight="bold">My Boards</Typography>

                <Grid container spacing={3}>
                    {/* Create New Board Card */}
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Paper
                            sx={{
                                height: 120,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'rgba(9, 30, 66, 0.04)',
                                cursor: 'pointer',
                                transition: '0.2s',
                                '&:hover': { bgcolor: 'rgba(9, 30, 66, 0.08)' }
                            }}
                            onClick={() => setOpen(true)}
                        >
                            <Typography variant="h6" color="textSecondary">Create new board</Typography>
                        </Paper>
                    </Grid>

                    {/* Existing Boards */}
                    {boards.map(board => (
                        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={board.id}>
                            <Card sx={{ height: 120, bgcolor: '#0079bf', color: 'white' }}>
                                <CardActionArea
                                    sx={{ height: '100%', p: 2, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start' }}
                                    onClick={() => navigate(`/boards/${board.id}`)}
                                >
                                    <Typography variant="h6" fontWeight="bold">{board.title}</Typography>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>

            {/* Create Dialog */}
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Create Board</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Board Title"
                        fullWidth
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreate} variant="contained">Create</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

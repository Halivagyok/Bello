
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Grid, Paper, Card, CardActionArea, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useStore } from '../store';

export default function ProjectDetails() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const boards = useStore(state => state.boards);
    const projects = useStore(state => state.projects);
    const createBoard = useStore(state => state.createBoard);
    const fetchBoards = useStore(state => state.fetchBoards);
    const fetchProjects = useStore(state => state.fetchProjects);

    const [open, setOpen] = useState(false);
    const [newTitle, setNewTitle] = useState('');

    useEffect(() => {
        fetchBoards();
        fetchProjects();
    }, [fetchBoards, fetchProjects]);

    const project = projects.find(p => p.id === projectId);
    const projectBoards = boards.filter(b => b.projectId === projectId);

    const handleCreateBoard = async () => {
        if (!newTitle.trim() || !projectId) return;
        await createBoard(newTitle, projectId);
        setNewTitle('');
        setOpen(false);
    };

    if (!project) {
        return <Box sx={{ p: 4 }}>Loading or Project Not Found...</Box>;
    }

    return (
        <Box>
            {/* Header */}
            <Box sx={{ p: 2, bgcolor: '#026aa7', color: 'white', display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button startIcon={<ArrowBackIcon />} color="inherit" onClick={() => navigate('/boards')}>
                    Dashboard
                </Button>
                <Typography variant="h6" fontWeight="bold">{project.title}</Typography>
            </Box>

            <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
                <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
                    {project.description || 'No description provided.'}
                </Typography>

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
                    {projectBoards.map(board => (
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

            {/* Create Board Dialog */}
            <Dialog open={open} onClose={() => { setOpen(false); setNewTitle(''); }}>
                <DialogTitle>Create Board in {project.title}</DialogTitle>
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
                    <Button onClick={() => { setOpen(false); setNewTitle(''); }}>Cancel</Button>
                    <Button onClick={handleCreateBoard} variant="contained">Create</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );

}

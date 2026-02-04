import { useState } from 'react';
import { Typography, Grid, Paper, Card, CardActionArea, Box } from '@mui/material';
import { useStore } from '../../store';
import { useNavigate } from 'react-router-dom';
import ProjectDialog from '../ProjectDialog';

export default function ProjectList() {
    const projects = useStore(state => state.projects);
    const boards = useStore(state => state.boards);
    const user = useStore(state => state.user);
    const navigate = useNavigate();
    const [openProjectDialog, setOpenProjectDialog] = useState(false);

    const myProjects = projects.filter(p => p.ownerId === user?.id);

    return (
        <>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h5" fontWeight="bold">My Projects</Typography>
            </Box>

            <Grid container spacing={3} sx={{ mb: 6 }}>
                {/* Create New Project Card */}
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
                        onClick={() => setOpenProjectDialog(true)}
                    >
                        <Typography variant="h6" color="textSecondary">Create new project</Typography>
                    </Paper>
                </Grid>

                {myProjects.map(project => (
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={project.id}>
                        <Card sx={{ height: 120 }}>
                            <CardActionArea
                                sx={{ height: '100%', p: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }}
                                onClick={() => navigate(`/projects/${project.id}`)}
                            >
                                <Typography variant="h6" fontWeight="bold">{project.title}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {boards.filter(b => b.projectId === project.id).length} Boards
                                </Typography>
                            </CardActionArea>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <ProjectDialog open={openProjectDialog} onClose={() => setOpenProjectDialog(false)} />
        </>
    );
}

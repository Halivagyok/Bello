import { Typography, Grid, Card, CardActionArea } from '@mui/material';
import { useStore } from '../../store';
import { useNavigate } from 'react-router-dom';

export default function SharedProjects() {
    const projects = useStore(state => state.projects);
    const boards = useStore(state => state.boards);
    const user = useStore(state => state.user);
    const navigate = useNavigate();

    const sharedProjects = projects.filter(p => p.ownerId !== user?.id);

    if (sharedProjects.length === 0) return (
        <>
            <Typography variant="h5" sx={{ mb: 2 }} fontWeight="bold">Projects shared with me</Typography>
            <Grid container spacing={3} sx={{ mb: 6 }}>
                <Grid size={12}>
                    <Typography color="text.secondary">No shared projects yet.</Typography>
                </Grid>
            </Grid>
        </>
    );

    return (
        <>
            <Typography variant="h5" sx={{ mb: 2 }} fontWeight="bold">Projects shared with me</Typography>
            <Grid container spacing={3} sx={{ mb: 6 }}>
                {sharedProjects.map(project => (
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
        </>
    );
}

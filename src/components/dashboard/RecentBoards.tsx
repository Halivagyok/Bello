import { Typography, Grid, Card, CardActionArea } from '@mui/material';
import { useStore } from '../../store';
import { useNavigate } from 'react-router-dom';

export default function RecentBoards() {
    const recentBoards = useStore(state => state.recentBoards);
    const projects = useStore(state => state.projects);
    const navigate = useNavigate();

    const getProjectTitle = (projectId?: string) => {
        if (!projectId) return 'No Project';
        const proj = projects.find(p => p.id === projectId);
        return proj ? proj.title : 'Unknown Project';
    };

    return (
        <>
            <Typography variant="h5" sx={{ mb: 2, mt: 0 }} fontWeight="bold">Recent Boards</Typography>
            <Grid container spacing={3} sx={{ mb: 6 }}>
                {recentBoards.length === 0 && (
                    <Grid size={12}>
                        <Typography color="text.secondary">No recently viewed boards.</Typography>
                    </Grid>
                )}
                {recentBoards.map(board => (
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={board.id}>
                        <Card sx={{ height: 120, bgcolor: '#0079bf', color: 'white' }}>
                            <CardActionArea
                                sx={{ height: '100%', p: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-between' }}
                                onClick={() => navigate(`/boards/${board.id}`)}
                            >
                                <Typography variant="h6" fontWeight="bold">{board.title}</Typography>
                                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                                    {getProjectTitle(board.projectId)}
                                </Typography>
                            </CardActionArea>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </>
    );
}

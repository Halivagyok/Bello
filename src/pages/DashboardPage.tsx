import { useEffect } from 'react';
import { Box } from '@mui/material';
import { useStore } from '../store';
import RecentBoards from '../components/dashboard/RecentBoards';
import ProjectList from '../components/dashboard/ProjectList';
import SharedProjects from '../components/dashboard/SharedProjects';

export default function DashboardPage() {
    const fetchBoards = useStore(state => state.fetchBoards);
    const fetchProjects = useStore(state => state.fetchProjects);

    useEffect(() => {
        fetchBoards();
        fetchProjects();
    }, [fetchBoards, fetchProjects]);

    return (
        <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
            <RecentBoards />
            <ProjectList />
            <SharedProjects />
        </Box>
    );
}

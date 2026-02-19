import { useEffect } from 'react';
import { useStore } from '../store';
import RecentBoards from '../components/dashboard/RecentBoards';
import ProjectList from '../components/dashboard/ProjectList';
import SharedProjects from '../components/dashboard/SharedProjects';
import SharedBoards from '../components/dashboard/SharedBoards';

export default function DashboardPage() {
    const fetchBoards = useStore(state => state.fetchBoards);
    const fetchProjects = useStore(state => state.fetchProjects);

    useEffect(() => {
        fetchBoards();
        fetchProjects();
    }, [fetchBoards, fetchProjects]);

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <RecentBoards />
            <ProjectList />
            <SharedProjects />
            <SharedBoards />
        </div>
    );
}

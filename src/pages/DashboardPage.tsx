import { useEffect } from 'react';
import { useStore } from '../store';
import RecentBoards from '../components/dashboard/RecentBoards';
import ProjectList from '../components/dashboard/ProjectList';
import SharedProjects from '../components/dashboard/SharedProjects';
import SharedBoards from '../components/dashboard/SharedBoards';
import { User, Users } from 'lucide-react';

export default function DashboardPage() {
    const fetchBoards = useStore(state => state.fetchBoards);
    const fetchProjects = useStore(state => state.fetchProjects);

    useEffect(() => {
        fetchBoards();
        fetchProjects();
    }, [fetchBoards, fetchProjects]);

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative px-4 flex flex-col">
            <RecentBoards />
            
            <div className="space-y-6">
                <div className="flex items-center gap-3 px-1">
                    <div className="bg-primary/10 p-2 rounded-lg">
                        <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">My Workspace</h2>
                        <p className="text-sm text-muted-foreground">Projects and boards you've created.</p>
                    </div>
                </div>
                <ProjectList />
            </div>

            <div className="h-px bg-border opacity-50" />

            <div className="space-y-6">
                <div className="flex items-center gap-3 px-1">
                    <div className="bg-blue-500/10 p-2 rounded-lg">
                        <Users className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Shared with Me</h2>
                        <p className="text-sm text-muted-foreground">Workspaces you've been invited to.</p>
                    </div>
                </div>
                <div className="flex flex-col gap-6">
                    <SharedProjects />
                    
                    <div className="flex items-center gap-4 opacity-50">
                        <div className="h-px bg-border flex-1" />
                        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Or Individual Boards</span>
                        <div className="h-px bg-border flex-1" />
                    </div>
                    
                    <SharedBoards />
                </div>
            </div>
        </div>
    );
}

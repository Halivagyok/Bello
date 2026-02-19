import { useState } from 'react';
import { useStore } from '../../store';
import { useNavigate } from 'react-router-dom';
import ProjectDialog from '../ProjectDialog';
import { Card, CardContent } from "@/components/ui/card"
import { FolderKanban, Plus } from 'lucide-react';

export default function ProjectList() {
    const projects = useStore(state => state.projects);
    const boards = useStore(state => state.boards);
    const user = useStore(state => state.user);
    const navigate = useNavigate();
    const [openProjectDialog, setOpenProjectDialog] = useState(false);

    const myProjects = projects.filter(p => p.ownerId === user?.id);

    return (
        <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
                <FolderKanban className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold tracking-tight">My Projects</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {/* Create New Project Card */}
                <Card 
                    className="group cursor-pointer border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 transition-all bg-muted/30"
                    onClick={() => setOpenProjectDialog(true)}
                >
                    <CardContent className="h-[120px] p-4 flex flex-col items-center justify-center gap-2">
                        <Plus className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">Create new project</span>
                    </CardContent>
                </Card>

                {myProjects.map(project => (
                    <Card 
                        key={project.id} 
                        className="group cursor-pointer hover:shadow-md transition-all border-none bg-zinc-100 dark:bg-zinc-800"
                        onClick={() => navigate(`/projects/${project.id}`)}
                    >
                        <CardContent className="h-[120px] p-4 flex flex-col justify-center">
                            <h3 className="font-bold text-lg">{project.title}</h3>
                            <p className="text-sm text-muted-foreground">
                                {boards.filter(b => b.projectId === project.id).length} Boards
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <ProjectDialog open={openProjectDialog} onClose={() => setOpenProjectDialog(false)} />
        </section>
    );
}

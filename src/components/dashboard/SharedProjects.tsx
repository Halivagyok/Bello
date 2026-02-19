import { useStore } from '../../store';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card"
import { Users } from 'lucide-react';

export default function SharedProjects() {
    const projects = useStore(state => state.projects);
    const boards = useStore(state => state.boards);
    const user = useStore(state => state.user);
    const navigate = useNavigate();

    const sharedProjects = projects.filter(p => p.ownerId !== user?.id);

    return (
        <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold tracking-tight">Projects shared with me</h2>
            </div>

            {sharedProjects.length === 0 ? (
                <p className="text-muted-foreground text-sm py-8 text-center border-2 border-dashed rounded-xl">
                    No shared projects yet.
                </p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {sharedProjects.map(project => (
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
            )}
        </section>
    );
}

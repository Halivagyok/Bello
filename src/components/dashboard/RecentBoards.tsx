import { useStore } from '../../store';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card"
import { Layout } from 'lucide-react';

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
        <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
                <Layout className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold tracking-tight">Recent Boards</h2>
            </div>
            
            {recentBoards.length === 0 ? (
                <p className="text-muted-foreground text-sm py-8 text-center border-2 border-dashed rounded-xl">
                    No recently viewed boards.
                </p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {recentBoards.map(board => (
                        <Card 
                            key={board.id} 
                            className="group cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all border-none overflow-hidden"
                            onClick={() => navigate(`/boards/${board.id}`)}
                        >
                            <CardContent 
                                className="h-[120px] p-4 flex flex-col justify-between text-white relative"
                                style={{ backgroundColor: '#0079bf' }}
                            >
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                <h3 className="font-bold text-lg relative z-10">{board.title}</h3>
                                <p className="text-xs opacity-80 font-medium relative z-10">
                                    {getProjectTitle(board.projectId)}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </section>
    );
}

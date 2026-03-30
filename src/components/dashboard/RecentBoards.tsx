import { useStore } from '../../store';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card"
import { Layout } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { stringToColor } from '../../utils/colors';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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
                            className="group cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all border border-[#0079bf]/20 dark:border-[#0079bf]/20 overflow-hidden bg-[#0079bf]/10 dark:bg-[#0079bf]/10 backdrop-blur-md"
                            onClick={() => navigate(`/boards/${board.id}`)}
                        >
                            <CardContent 
                                className="h-full min-h-[120px] p-4 flex flex-col justify-between relative"
                            >
                                <div className="absolute inset-0 bg-transparent group-hover:bg-black/5 dark:group-hover:bg-white/5 transition-colors" />
                                <div className="flex justify-between items-start relative z-10 text-slate-900 dark:text-blue-50">
                                    <h3 className="font-bold text-lg leading-tight line-clamp-2">{board.title}</h3>
                                    <Avatar className="w-6 h-6 border border-white/40 shrink-0">
                                        {board.ownerAvatarUrl && (
                                            <AvatarImage src={`${API_URL}/uploads/${board.ownerAvatarUrl}`} />
                                        )}
                                        <AvatarFallback 
                                            style={{ backgroundColor: stringToColor(board.ownerName || board.ownerId) }}
                                            className="text-[8px] text-white font-bold"
                                        >
                                            {(board.ownerName || 'U')[0].toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                                <p className="text-xs font-medium relative z-10 text-slate-700 dark:text-blue-200">
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

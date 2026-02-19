
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore, client } from '../store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Avatar,
    AvatarFallback,
} from "@/components/ui/avatar"
import { 
    ArrowLeft, 
    Users, 
    Trash2, 
    UserPlus,
    Plus,
    Layout
} from 'lucide-react';

export default function ProjectDetails() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const boards = useStore(state => state.boards);
    const projects = useStore(state => state.projects);
    const createBoard = useStore(state => state.createBoard);
    const fetchBoards = useStore(state => state.fetchBoards);
    const fetchProjects = useStore(state => state.fetchProjects);
    const fetchProject = useStore(state => state.fetchProject);

    const inviteUserToProject = useStore(state => state.inviteUserToProject);
    const subscribeToProject = useStore(state => state.subscribeToProject);
    const unsubscribeFromProject = useStore(state => state.unsubscribeFromProject);
    const connectSocket = useStore(state => state.connectSocket);
    const user = useStore(state => state.user);

    const [open, setOpen] = useState(false);
    const [membersOpen, setMembersOpen] = useState(false);
    const [inviteOpen, setInviteOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [newTitle, setNewTitle] = useState('');

    useEffect(() => {
        fetchBoards();
        fetchProjects();
        connectSocket();

        if (projectId) {
            fetchProject(projectId);
            subscribeToProject(projectId);

            return () => {
                unsubscribeFromProject(projectId);
            };
        }
    }, [fetchBoards, fetchProjects, fetchProject, projectId, subscribeToProject, unsubscribeFromProject, connectSocket]);

    const project = projects.find(p => p.id === projectId);
    const projectBoards = boards.filter(b => b.projectId === projectId);

    const handleCreateBoard = async () => {
        if (!newTitle.trim() || !projectId) return;
        await createBoard(newTitle, projectId);
        setNewTitle('');
        setOpen(false);
    };

    const handleRemoveMember = async (userId: string) => {
        if (!projectId) return;
        if (!confirm('Remove user from project?')) return;
        try {
            await client.projects[projectId].members[userId].delete();
            fetchProject(projectId);
        } catch (e) {
            alert('Failed to remove member');
        }
    };

    const handleInvite = async () => {
        if (!projectId || !inviteEmail) return;
        try {
            await inviteUserToProject(projectId, inviteEmail);
            alert('User invited successfully');
            setInviteEmail('');
            setInviteOpen(false);
            fetchProject(projectId);
        } catch (e) {
            alert('Failed to invite user');
        }
    };

    const isOwnerOrAdmin = project ? (project.ownerId === user?.id || user?.isAdmin) : false;

    const stringToColor = (string: string) => {
        let hash = 0;
        for (let i = 0; i < string.length; i++) {
            hash = string.charCodeAt(i) + ((hash << 5) - hash);
        }
        let color = '#';
        for (let i = 0; i < 3; i++) {
            const value = (hash >> (i * 8)) & 0xff;
            color += `00${value.toString(16)}`.slice(-2);
        }
        return color;
    };

    if (!project) {
        return <div className="p-8 text-center text-muted-foreground">Loading or Project Not Found...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-100 dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-border">
                <div className="flex items-center gap-4">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => navigate('/boards')}
                        className="gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Dashboard
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{project.title}</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            {project.description || 'No description provided.'}
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2"
                        onClick={() => setMembersOpen(true)}
                    >
                        <Users className="w-4 h-4" />
                        Members ({project.members?.length || 0})
                    </Button>
                    <Button 
                        size="sm" 
                        className="gap-2"
                        onClick={() => setInviteOpen(true)}
                    >
                        <UserPlus className="w-4 h-4" />
                        Invite
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {/* Create New Board Card */}
                <Card 
                    className="group cursor-pointer border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 transition-all bg-muted/30"
                    onClick={() => setOpen(true)}
                >
                    <CardContent className="h-[120px] p-4 flex flex-col items-center justify-center gap-2">
                        <Plus className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">Create new board</span>
                    </CardContent>
                </Card>

                {/* Existing Boards */}
                {projectBoards.map(board => (
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
                            <h3 className="font-bold text-lg relative z-10 flex items-center gap-2">
                                <Layout className="w-4 h-4" />
                                {board.title}
                            </h3>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Create Board Dialog */}
            <Dialog open={open} onOpenChange={(val) => !val && (setOpen(false), setNewTitle(''))}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Board in {project.title}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            placeholder="Board Title"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateBoard}>Create</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Invite Dialog */}
            <Dialog open={inviteOpen} onOpenChange={(val) => !val && (setInviteOpen(false), setInviteEmail(''))}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Invite to Project</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            placeholder="Email Address"
                            type="email"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
                        <Button onClick={handleInvite}>Invite</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Members Dialog */}
            <Dialog open={membersOpen} onOpenChange={(val) => !val && setMembersOpen(false)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Project Members
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                        {project.members && project.members.map((member) => (
                            <div key={member.id} className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                        <AvatarFallback style={{ backgroundColor: stringToColor(member.name || member.email) }} className="text-white">
                                            {(member.name || member.email)[0].toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium leading-none">
                                            {member.name} {member.id === project.ownerId && <span className="text-xs text-muted-foreground ml-1">(Owner)</span>}
                                            {member.isAdmin && <span className="text-xs text-muted-foreground ml-1">(Admin)</span>}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">{member.email}</p>
                                    </div>
                                </div>
                                {isOwnerOrAdmin && member.id !== user?.id && member.id !== project.ownerId && (
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                                        onClick={() => handleRemoveMember(member.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        ))}
                        {(!project.members || project.members.length === 0) && (
                            <p className="text-center text-muted-foreground py-4 text-sm">No members found.</p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setMembersOpen(false)} className="w-full">Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

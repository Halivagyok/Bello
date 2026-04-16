import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore, client, type Card as StoreCard } from '../store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
    AvatarImage,
} from "@/components/ui/avatar"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { 
    ArrowLeft, 
    Users, 
    Trash2, 
    UserPlus,
    Plus,
    Layout,
    Shield,
    User as UserIcon,
    Eye,
    Lock,
    Globe,
    Calendar,
    CheckCircle2,
    Clock
} from 'lucide-react';
import { AlertDialog } from '../components/AlertDialog';
import { CardDetailsDialog } from '../components/CardDetailsDialog';
import { stringToColor } from '../utils/colors';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function ProjectDetails() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const boards = useStore(state => state.boards);
    const projects = useStore(state => state.projects);
    const projectCards = useStore(state => state.projectCards);
    const createBoard = useStore(state => state.createBoard);
    const fetchBoards = useStore(state => state.fetchBoards);
    const fetchProjects = useStore(state => state.fetchProjects);
    const fetchProject = useStore(state => state.fetchProject);
    const fetchProjectCards = useStore(state => state.fetchProjectCards);

    const inviteUserToProject = useStore(state => state.inviteUserToProject);
    const subscribeToProject = useStore(state => state.subscribeToProject);
    const unsubscribeFromProject = useStore(state => state.unsubscribeFromProject);
    const connectSocket = useStore(state => state.connectSocket);
    const user = useStore(state => state.user);

    const [open, setOpen] = useState(false);
    const [membersOpen, setMembersOpen] = useState(false);
    const [inviteOpen, setInviteOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('member');
    const [newTitle, setNewTitle] = useState('');
    const [newVisibility, setNewVisibility] = useState<string>('workspace');
    
    const [selectedCard, setSelectedCard] = useState<StoreCard | null>(null);
    const [isCardDialogOpen, setIsCardDialogOpen] = useState(false);

    // Alert Dialog States
    const [alertDialog, setAlertDialog] = useState<{
        open: boolean,
        title: string,
        description: string,
        onConfirm?: () => void,
        variant?: 'default' | 'destructive'
    }>({
        open: false,
        title: '',
        description: ''
    });

    const showAlert = (title: string, description: string, onConfirm?: () => void, variant: 'default' | 'destructive' = 'default') => {
        setAlertDialog({ open: true, title, description, onConfirm, variant });
    };

    useEffect(() => {
        fetchBoards();
        fetchProjects();
        connectSocket();

        if (projectId) {
            fetchProject(projectId);
            fetchProjectCards(projectId);
            subscribeToProject(projectId);

            return () => {
                unsubscribeFromProject(projectId);
            };
        }
    }, [fetchBoards, fetchProjects, fetchProject, fetchProjectCards, projectId, subscribeToProject, unsubscribeFromProject, connectSocket]);

    const project = projects.find(p => p.id === projectId);
    const projectBoards = boards.filter(b => b.projectId === projectId);

    // Filter cards
    const myTasks = useMemo(() => {
        if (!user) return [];
        return projectCards.filter(card => 
            card.members?.some(m => m.id === user.id || (m as any).userId === user.id)
        );
    }, [projectCards, user]);

    const dueSoonTasks = useMemo(() => {
        const soon = new Date();
        soon.setDate(soon.getDate() + 7);
        return projectCards.filter(card => {
            if (!card.dueDate || card.completed) return false;
            const due = new Date(card.dueDate);
            return due <= soon;
        }).sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
    }, [projectCards]);

    const handleCreateBoard = async () => {
        if (!newTitle.trim() || !projectId) return;
        await createBoard(newTitle, projectId, newVisibility as 'private'|'workspace'|'public');
        setNewTitle('');
        setNewVisibility('workspace');
        setOpen(false);
    };

    const handleRemoveMember = async (userId: string) => {
        if (!projectId) return;
        showAlert(
            'Remove Member?',
            'Are you sure you want to remove this user from the project?',
            async () => {
                try {
                    await client.projects[projectId].members[userId].delete();
                    fetchProject(projectId);
                } catch (e) {
                    showAlert('Error', 'Failed to remove member');
                }
            },
            'destructive'
        );
    };

    const handleInvite = async () => {
        if (!projectId || !inviteEmail) return;
        try {
            await inviteUserToProject(projectId, inviteEmail, inviteRole);
            setInviteEmail('');
            setInviteRole('member');
            setInviteOpen(false);
            fetchProject(projectId);
            showAlert('Success', 'User invited successfully');
        } catch (e) {
            showAlert('Error', 'Failed to invite user');
        }
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        if (!projectId) return;
        try {
            const { error } = await client.projects[projectId].members[userId].patch({ role: newRole });
            if (error) throw error;
            fetchProject(projectId);
        } catch (e) {
            showAlert('Error', 'Failed to update member role');
        }
    };

    const rolePriority: Record<string, number> = { 'owner': 4, 'admin': 3, 'member': 2, 'viewer': 1 };
    
    // Determine my role in this project
    const myMember = project?.members?.find(m => m.id === user?.id);
    const myRole = myMember?.role;
    const myRoleVal = (project?.ownerId === user?.id) ? 5 : (rolePriority[myRole || 'member'] || 0);

    const isOwnerOrAdmin = myRoleVal >= 3 || user?.isAdmin;

    const getRoleIcon = (role: string) => {
        switch (role?.toLowerCase()) {
            case 'owner': return <Shield className="w-3.5 h-3.5 text-amber-500" />;
            case 'admin': return <Shield className="w-3.5 h-3.5 text-blue-500" />;
            case 'viewer': return <Eye className="w-3.5 h-3.5 text-zinc-500" />;
            default: return <UserIcon className="w-3.5 h-3.5 text-zinc-500" />;
        }
    };

    const renderCardItem = (card: StoreCard) => {
        const board = boards.find(b => b.id === card.boardId);
        return (
            <Card 
                key={card.id} 
                className="group cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm"
                onClick={() => {
                    setSelectedCard(card);
                    setIsCardDialogOpen(true);
                }}
            >
                <CardContent className="p-4 flex flex-col gap-3">
                    <div className="flex justify-between items-start gap-2">
                        <h4 className="font-semibold text-sm line-clamp-2">{card.content}</h4>
                        {card.completed && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />}
                    </div>
                    
                    <div className="flex flex-wrap gap-1.5">
                        {card.labels?.map(label => (
                            <div 
                                key={label.id} 
                                className="px-1.5 py-0.5 text-[10px] font-bold rounded-sm text-white"
                                style={{ backgroundColor: label.color }}
                            >
                                {label.title}
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                            {board && (
                                <Badge variant="secondary" className="h-5 px-1.5 font-normal text-[10px] bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400 border-blue-100 dark:border-blue-900">
                                    {board.title}
                                </Badge>
                            )}
                            {card.dueDate && (
                                <span className={`flex items-center gap-1 ${new Date(card.dueDate) < new Date() && !card.completed ? 'text-red-500 font-bold' : ''}`}>
                                    <Clock className="w-3 h-3" />
                                    {new Date(card.dueDate).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                        
                        <div className="flex -space-x-2 overflow-hidden">
                            {card.members?.map(member => (
                                <Avatar key={member.id} className="h-5 w-5 border-2 border-white dark:border-zinc-900 ring-1 ring-zinc-200 dark:ring-zinc-800">
                                    {member.avatarUrl && (
                                        <AvatarImage src={`${API_URL}/uploads/${member.avatarUrl}`} crossOrigin="anonymous" />
                                    )}
                                    <AvatarFallback style={{ backgroundColor: stringToColor(member.name || member.email) }} className="text-[8px] text-white">
                                        {(member.name || 'U')[0].toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
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
                        className="gap-2 px-2 sm:px-3"
                        title="Back to Dashboard"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Dashboard</span>
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
                    {isOwnerOrAdmin && (
                        <Button 
                            size="sm" 
                            className="gap-2"
                            onClick={() => setInviteOpen(true)}
                        >
                            <UserPlus className="w-4 h-4" />
                            Invite
                        </Button>
                    )}
                </div>
            </div>

            <Tabs defaultValue="boards" className="w-full">
                <TabsList className="bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl mb-6">
                    <TabsTrigger value="boards" className="gap-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm">
                        <Layout className="w-4 h-4" />
                        Boards
                    </TabsTrigger>
                    <TabsTrigger value="my-tasks" className="gap-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm">
                        <CheckCircle2 className="w-4 h-4" />
                        My Tasks
                        {myTasks.length > 0 && (
                            <Badge variant="secondary" className="ml-1 h-5 min-w-5 flex items-center justify-center p-0 text-[10px]">
                                {myTasks.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="due-soon" className="gap-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm">
                        <Calendar className="w-4 h-4" />
                        Due Soon
                        {dueSoonTasks.length > 0 && (
                            <Badge variant="destructive" className="ml-1 h-5 min-w-5 flex items-center justify-center p-0 text-[10px]">
                                {dueSoonTasks.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="boards">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {/* Create New Board Card */}
                        {isOwnerOrAdmin && (
                            <Card 
                                className="group cursor-pointer border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 transition-all bg-muted/30"
                                onClick={() => setOpen(true)}
                            >
                                <CardContent className="h-[120px] p-4 flex flex-col items-center justify-center gap-2">
                                    <Plus className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                                    <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">Create new board</span>
                                </CardContent>
                            </Card>
                        )}

                        {/* Existing Boards */}
                        {projectBoards.map(board => (
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
                                        <h3 className="font-bold text-lg leading-tight line-clamp-2 flex items-center gap-2">
                                            <Layout className="w-4 h-4" />
                                            {board.title}
                                        </h3>
                                        <Avatar className="w-6 h-6 border border-white/40 shrink-0">
                                            {board.ownerAvatarUrl && (
                                                <AvatarImage src={`${API_URL}/uploads/${board.ownerAvatarUrl}`} crossOrigin="anonymous" />
                                            )}
                                            <AvatarFallback 
                                                style={{ backgroundColor: stringToColor(board.ownerName || board.ownerId) }}
                                                className="text-[8px] text-white font-bold"
                                            >
                                                {(board.ownerName || 'U')[0].toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="my-tasks">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {myTasks.map(renderCardItem)}
                        {myTasks.length === 0 && (
                            <div className="col-span-full py-12 text-center text-muted-foreground bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                                <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                <p>No tasks assigned to you in this project.</p>
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="due-soon">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {dueSoonTasks.map(renderCardItem)}
                        {dueSoonTasks.length === 0 && (
                            <div className="col-span-full py-12 text-center text-muted-foreground bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                <p>No upcoming deadlines in this project.</p>
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>

            {/* Create Board Dialog */}
            <Dialog open={open} onOpenChange={(val) => !val && (setOpen(false), setNewTitle(''))}>
                <DialogContent>
                    <form onSubmit={(e) => { e.preventDefault(); handleCreateBoard(); }}>
                        <DialogHeader>
                            <DialogTitle>Create Board in {project.title}</DialogTitle>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="board-title">Board Title</Label>
                                <Input
                                    id="board-title"
                                    placeholder="Enter board title..."
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="visibility">Visibility</Label>
                                <Select value={newVisibility} onValueChange={setNewVisibility}>
                                    <SelectTrigger id="visibility">
                                        <SelectValue placeholder="Select visibility" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="private">
                                            <div className="flex items-center gap-2">
                                                <Lock className="w-4 h-4 text-red-500" />
                                                <span>Private</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="workspace">
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4 text-zinc-500" />
                                                <span>Workspace</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="public">
                                            <div className="flex items-center gap-2">
                                                <Globe className="w-4 h-4 text-green-500" />
                                                <span>Public</span>
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button type="submit">Create</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Invite Dialog */}
            <Dialog open={inviteOpen} onOpenChange={(val) => !val && (setInviteOpen(false), setInviteEmail(''), setInviteRole('member'))}>
                <DialogContent>
                    <form onSubmit={(e) => { e.preventDefault(); handleInvite(); }}>
                        <DialogHeader>
                            <DialogTitle>Invite to Project</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    placeholder="Email Address"
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <Select value={inviteRole} onValueChange={setInviteRole}>
                                    <SelectTrigger id="role">
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="viewer">Viewer</SelectItem>
                                        <SelectItem value="member">Member</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="owner" disabled={myRoleVal < 4 && !user?.isAdmin}>Owner (Co-owner)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
                            <Button type="submit">Invite</Button>
                        </DialogFooter>
                    </form>
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
                        {project.members && project.members.map((member) => {
                            const targetPrio = (project.ownerId === member.id) ? 5 : (rolePriority[member.role] || 0);
                            const canManageMember = user?.isAdmin || (myRoleVal >= 3 && myRoleVal > targetPrio && member.id !== user?.id);

                            return (
                                <div key={member.id} className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                            {member.avatarUrl && (
                                                <AvatarImage src={`${API_URL}/uploads/${member.avatarUrl}`} crossOrigin="anonymous" />
                                            )}
                                            <AvatarFallback style={{ backgroundColor: stringToColor(member.name || member.email) }} className="text-white">
                                                {(member.name || member.email)[0].toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="flex items-center gap-1.5">
                                                <p className="text-sm font-medium leading-none">
                                                    {member.name}
                                                </p>
                                                {member.id === project.ownerId ? (
                                                    <Badge variant="outline" className="text-[10px] px-1 h-4 border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950/20">Primary Owner</Badge>
                                                ) : (
                                                    <span className="flex items-center gap-1 opacity-70">
                                                        {getRoleIcon(member.role)}
                                                        <span className="text-[10px] uppercase font-bold tracking-wider">{member.role}</span>
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">{member.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {canManageMember && (
                                            <>
                                                <Select 
                                                    defaultValue={member.role} 
                                                    onValueChange={(val) => handleRoleChange(member.id, val)}
                                                >
                                                    <SelectTrigger className="h-8 w-[100px] text-xs">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="viewer">Viewer</SelectItem>
                                                        <SelectItem value="member">Member</SelectItem>
                                                        <SelectItem value="admin">Admin</SelectItem>
                                                        <SelectItem value="owner" disabled={myRoleVal < 4 && !user?.isAdmin}>Owner</SelectItem>
                                                    </SelectContent>
                                                </Select>

                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                                                    onClick={() => handleRemoveMember(member.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </>
                                        )}
                                        {member.id === user?.id && member.id !== project.ownerId && (
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="text-red-500 text-xs h-8"
                                                onClick={() => handleRemoveMember(member.id)}
                                            >
                                                Leave
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        {(!project.members || project.members.length === 0) && (
                            <p className="text-center text-muted-foreground py-4 text-sm">No members found.</p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setMembersOpen(false)} className="w-full">Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <CardDetailsDialog 
                card={selectedCard}
                open={isCardDialogOpen}
                onOpenChange={setIsCardDialogOpen}
            />

            <AlertDialog 
                open={alertDialog.open}
                onClose={() => setAlertDialog(prev => ({ ...prev, open: false }))}
                title={alertDialog.title}
                description={alertDialog.description}
                onConfirm={alertDialog.onConfirm}
                variant={alertDialog.variant}
            />
        </div>
    );
}

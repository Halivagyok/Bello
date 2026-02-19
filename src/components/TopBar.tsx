import { useStore, client } from '../store';
import { useState } from 'react';
import ProjectTabs from './ProjectTabs';
import { ModeToggle } from './mode-toggle';
import { Button } from './ui/button';
import { Input } from './ui/input';
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
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { 
    Filter, 
    Share, 
    Settings, 
    Trash2, 
    Plus,
    Users
} from 'lucide-react';

export default function TopBar() {
    const boardName = useStore((state) => state.boardName);
    const activeMembers = useStore((state) => state.activeMembers);
    const inviteUser = useStore((state) => state.inviteUser);
    const activeBoardId = useStore((state) => state.activeBoardId);
    const activeBoardOwnerId = useStore((state) => state.activeBoardOwnerId);
    const user = useStore(state => state.user);
    const fetchBoard = useStore((state) => state.fetchBoard);
    const activeProjectId = useStore((state) => state.activeProjectId);
    const projects = useStore((state) => state.projects);
    const boards = useStore((state) => state.boards);
    const createBoard = useStore((state) => state.createBoard);
    const renameBoard = useStore((state) => state.renameBoard);

    const [inviteOpen, setInviteOpen] = useState(false);
    const [membersOpen, setMembersOpen] = useState(false);
    const [createBoardOpen, setCreateBoardOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [newBoardTitle, setNewBoardTitle] = useState('');

    const project = activeProjectId ? projects.find(p => p.id === activeProjectId) : null;

    let projectBoards = activeProjectId ? boards.filter(b => b.projectId === activeProjectId) : [];

    if (project && project.boardIds) {
        projectBoards = projectBoards.sort((a, b) => {
            const indexA = project.boardIds.indexOf(a.id);
            const indexB = project.boardIds.indexOf(b.id);
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });
    }

    const handleInvite = async () => {
        if (!email) return;
        try {
            await inviteUser(email);
            setEmail('');
            setInviteOpen(false);
            if (activeBoardId) fetchBoard(activeBoardId, true);
        } catch (e) {
            alert('Failed to invite');
        }
    };

    const handleRemoveMember = async (userId: string) => {
        if (!activeBoardId) return;
        if (!confirm('Remove user from board?')) return;
        try {
            await client.boards[activeBoardId].members[userId].delete();
            fetchBoard(activeBoardId, true);
        } catch (e) {
            alert('Failed to remove member');
            console.error(e);
        }
    };

    const handleCreateBoard = async () => {
        if (!newBoardTitle.trim() || !activeProjectId) return;
        await createBoard(newBoardTitle, activeProjectId);
        setNewBoardTitle('');
        setCreateBoardOpen(false);
    };

    const isOwnerOrAdmin = (activeBoardOwnerId && user?.id === activeBoardOwnerId) || user?.isAdmin;

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

    return (
        <div className="w-full mb-4">
            <div className="flex items-center justify-between gap-4 px-3 py-2 bg-white/15 dark:bg-black/15 backdrop-blur-md rounded-xl overflow-hidden shadow-sm">
                <div className="flex items-center gap-4 flex-1 min-w-0 overflow-hidden">
                    {activeProjectId ? (
                        <ProjectTabs
                            boards={projectBoards}
                            activeBoardId={activeBoardId}
                            onRename={renameBoard}
                            onCreate={() => setCreateBoardOpen(true)}
                        />
                    ) : (
                        <h1 className="text-xl font-bold text-white whitespace-nowrap drop-shadow-sm">
                            {boardName}
                        </h1>
                    )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    {/* Avatars */}
                    <div 
                        onClick={() => setMembersOpen(true)} 
                        className="flex -space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
                    >
                        <TooltipProvider>
                            {activeMembers.slice(0, 4).map((member) => (
                                <Tooltip key={member.id}>
                                    <TooltipTrigger asChild>
                                        <Avatar className="w-8 h-8 border-2 border-white dark:border-zinc-900 ring-offset-background">
                                            <AvatarFallback 
                                                style={{ backgroundColor: stringToColor(member.name || member.email) }}
                                                className="text-[10px] text-white font-bold"
                                            >
                                                {member.name ? member.name[0].toUpperCase() : member.email[0].toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{member.name || member.email}</p>
                                    </TooltipContent>
                                </Tooltip>
                            ))}
                            {activeMembers.length > 4 && (
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-700 text-white text-[10px] font-bold border-2 border-white dark:border-zinc-900">
                                    +{activeMembers.length - 4}
                                </div>
                            )}
                        </TooltipProvider>
                    </div>

                    <div className="w-px h-6 bg-white/30" />

                    <Button variant="ghost" size="icon" className="text-white bg-white/10 hover:bg-white/20 h-9 w-9">
                        <Filter className="w-4 h-4" />
                    </Button>

                    <Button
                        onClick={() => setInviteOpen(true)}
                        className="bg-white text-black hover:bg-white/90 h-9 gap-2"
                    >
                        <Share className="w-4 h-4" />
                        <span className="hidden sm:inline">Share</span>
                    </Button>

                    <Button variant="ghost" size="icon" className="text-white bg-white/10 hover:bg-white/20 h-9 w-9">
                        <Settings className="w-4 h-4" />
                    </Button>

                    <ModeToggle />
                </div>
            </div>

            {/* Invite Dialog */}
            <Dialog open={inviteOpen} onOpenChange={(open) => !open && (setInviteOpen(false), setEmail(''))}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Invite Member</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            placeholder="Email Address"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
                        <Button onClick={handleInvite}>Invite</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create Board Dialog */}
            <Dialog open={createBoardOpen} onOpenChange={(open) => !open && (setCreateBoardOpen(false), setNewBoardTitle(''))}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Board</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            placeholder="Board Title"
                            value={newBoardTitle}
                            onChange={(e) => setNewBoardTitle(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateBoardOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateBoard}>Create</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Members List Dialog */}
            <Dialog open={membersOpen} onOpenChange={(open) => !open && setMembersOpen(false)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Board Members
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                        {activeMembers.map((member) => (
                            <div key={member.id} className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                        <AvatarFallback style={{ backgroundColor: stringToColor(member.name || member.email) }} className="text-white">
                                            {member.name ? member.name[0] : member.email[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium leading-none">
                                            {member.name} {member.id === activeBoardOwnerId && <span className="text-xs text-muted-foreground">(Owner)</span>}
                                            {member.isAdmin && <span className="text-xs text-muted-foreground ml-1">(Admin)</span>}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">{member.email}</p>
                                    </div>
                                </div>
                                {isOwnerOrAdmin && member.id !== user?.id && member.id !== activeBoardOwnerId && (
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
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setMembersOpen(false)} className="w-full">Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

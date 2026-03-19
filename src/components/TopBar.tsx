import { useStore, client } from '../store';
import { useState } from 'react';
import ProjectTabs from './ProjectTabs';
import { ModeToggle } from './mode-toggle';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
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
import { Badge } from "@/components/ui/badge"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Filter,
    Share,
    Settings,
    Trash2,
    Users,
    Shield,
    User as UserIcon,
    Eye
} from 'lucide-react';
import { AlertDialog } from './AlertDialog';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function TopBar() {
    const boardName = useStore((state) => state.boardName);
    const activeMembers = useStore((state) => state.activeMembers);
    const updateMemberRole = useStore((state) => state.updateMemberRole);
    const activeBoardId = useStore((state) => state.activeBoardId);
    const activeBoardOwnerId = useStore((state) => state.activeBoardOwnerId);
    const user = useStore(state => state.user);
    const fetchBoard = useStore((state) => state.fetchBoard);
    const activeProjectId = useStore((state) => state.activeProjectId);
    const projects = useStore((state) => state.projects);
    const boards = useStore((state) => state.boards);
    const createBoard = useStore((state) => state.createBoard);
    const renameBoard = useStore((state) => state.renameBoard);
    const deleteBoard = useStore((state) => state.deleteBoard);
    const currentUserRole = useStore((state) => state.currentUserRole);
    const inviteUserToProject = useStore((state) => state.inviteUserToProject);
    const fetchProject = useStore((state) => state.fetchProject);

    const [inviteOpen, setInviteOpen] = useState(false);
    const [membersOpen, setMembersOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [createBoardOpen, setCreateBoardOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('member');
    const [newBoardTitle, setNewBoardTitle] = useState('');
    const [editBoardTitle, setEditBoardTitle] = useState('');

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

    const project = activeProjectId ? projects.find(p => p.id === activeProjectId) : null;

    const rolePriority: Record<string, number> = { 'owner': 4, 'admin': 3, 'member': 2, 'viewer': 1 };
    const myRoleVal = (activeBoardOwnerId && user?.id === activeBoardOwnerId) ? 5 : (rolePriority[currentUserRole || 'member'] || 0);

    const isOwnerOrAdmin = myRoleVal >= 3 || user?.isAdmin;
    const isViewer = currentUserRole === 'viewer';

    const handleRenameBoard = async () => {
        if (!activeBoardId || !editBoardTitle.trim()) return;
        if (isViewer) return;
        await renameBoard(activeBoardId, editBoardTitle);
        setSettingsOpen(false);
    };

    const handleDeleteBoard = async () => {
        if (!activeBoardId) return;
        if (myRoleVal < 4 && !user?.isAdmin) return;
        showAlert(
            `Delete board "${boardName}"?`,
            "This action cannot be undone. All lists and cards will be permanently removed.",
            async () => {
                await deleteBoard(activeBoardId);
                setSettingsOpen(false);
            },
            'destructive'
        );
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            await updateMemberRole(userId, newRole);
        } catch (e) {
            showAlert('Error', 'Failed to update member role');
        }
    };

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
        if (!email || !activeProjectId) return;
        try {
            await inviteUserToProject(activeProjectId, email, inviteRole);
            setEmail('');
            setInviteRole('member');
            setInviteOpen(false);
            fetchProject(activeProjectId);
            showAlert('Success', 'User invited to workspace');
        } catch (e) {
            showAlert('Error', 'Failed to invite user to workspace');
        }
    };

    const handleRemoveMember = async (userId: string) => {
        if (!activeBoardId) return;
        showAlert(
            'Remove Member?',
            'Are you sure you want to remove this user from the board?',
            async () => {
                try {
                    await client.boards[activeBoardId].members[userId].delete();
                    fetchBoard(activeBoardId, true);
                } catch (e) {
                    showAlert('Error', 'Failed to remove member');
                    console.error(e);
                }
            },
            'destructive'
        );
    };

    const handleCreateBoard = async () => {
        if (!newBoardTitle.trim() || !activeProjectId) return;
        await createBoard(newBoardTitle, activeProjectId);
        setNewBoardTitle('');
        setCreateBoardOpen(false);
    };

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

    const getRoleIcon = (role: string) => {
        switch (role?.toLowerCase()) {
            case 'owner': return <Shield className="w-3.5 h-3.5 text-amber-500" />;
            case 'admin': return <Shield className="w-3.5 h-3.5 text-blue-500" />;
            case 'viewer': return <Eye className="w-3.5 h-3.5 text-zinc-500" />;
            default: return <UserIcon className="w-3.5 h-3.5 text-zinc-500" />;
        }
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
                            canCreate={isOwnerOrAdmin}
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
                            {(activeMembers || []).slice(0, 4).map((member) => (
                                <Tooltip key={member.id}>
                                    <TooltipTrigger asChild>
                                        <Avatar className="w-8 h-8 border-2 border-white dark:border-zinc-900 ring-offset-background">
                                            {member.avatarUrl && (
                                                <AvatarImage src={`${API_URL}/uploads/${member.avatarUrl}`} />
                                            )}
                                            <AvatarFallback 
                                                style={{ backgroundColor: stringToColor(member.name || member.email) }}
                                                className="text-[10px] text-white font-bold"
                                            >
                                                {member.name ? member.name[0].toUpperCase() : member.email[0].toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{member.name || member.email} ({member.role})</p>
                                    </TooltipContent>
                                </Tooltip>
                            ))}
                            {activeMembers && activeMembers.length > 4 && (
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

                    {activeProjectId && isOwnerOrAdmin && (
                        <Button
                            onClick={() => setInviteOpen(true)}
                            className="bg-white text-black hover:bg-white/90 h-9 gap-2 px-3 sm:px-4"
                        >
                            <Share className="w-4 h-4" />
                            <span className="hidden [@media(min-width:900px)]:inline">Invite to Workspace</span>
                        </Button>
                    )}

                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-white bg-white/10 hover:bg-white/20 h-9 w-9"
                        onClick={() => {
                            setEditBoardTitle(boardName);
                            setSettingsOpen(true);
                        }}
                        title="Board Settings"
                    >
                        <Settings className="w-4 h-4" />
                    </Button>

                    <ModeToggle />
                </div>
            </div>

            {/* Board Settings Dialog */}
            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                <DialogContent>
                    <form onSubmit={(e) => { e.preventDefault(); handleRenameBoard(); }}>
                        <DialogHeader>
                            <DialogTitle>Board Settings</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="board-title">Board Title</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="board-title"
                                        value={editBoardTitle}
                                        onChange={(e) => setEditBoardTitle(e.target.value)}
                                        disabled={!isOwnerOrAdmin}
                                    />
                                    {isOwnerOrAdmin && (
                                        <Button type="submit">Update</Button>
                                    )}
                                </div>
                            </div>

                            {(myRoleVal >= 4 || user?.isAdmin) && (
                                <div className="pt-4 border-t">
                                    <h4 className="text-sm font-medium text-destructive mb-2">Danger Zone</h4>
                                    <p className="text-xs text-muted-foreground mb-4">
                                        Deleting this board will permanently remove all lists and cards.
                                    </p>
                                    <Button type="button" variant="destructive" className="w-full" onClick={handleDeleteBoard}>
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete Board
                                    </Button>
                                </div>
                            )}
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Invite Dialog */}
            <Dialog open={inviteOpen} onOpenChange={(open) => !open && (setInviteOpen(false), setEmail(''), setInviteRole('member'))}>
                <DialogContent>
                    <form onSubmit={(e) => { e.preventDefault(); handleInvite(); }}>
                        <DialogHeader>
                            <DialogTitle>Invite to Workspace: {project?.title}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    placeholder="Email Address"
                                    type="text"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
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

            {/* Create Board Dialog */}
            <Dialog open={createBoardOpen} onOpenChange={(open) => !open && (setCreateBoardOpen(false), setNewBoardTitle(''))}>
                <DialogContent>
                    <form onSubmit={(e) => { e.preventDefault(); handleCreateBoard(); }}>
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
                            <Button type="button" variant="outline" onClick={() => setCreateBoardOpen(false)}>Cancel</Button>
                            <Button type="submit">Create</Button>
                        </DialogFooter>
                    </form>
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
                        {(activeMembers || []).map((member) => {
                            const targetPrio = (activeBoardOwnerId && member.id === activeBoardOwnerId) ? 5 : (rolePriority[member.role] || 0);
                            const canManageMember = user?.isAdmin || (myRoleVal >= 3 && myRoleVal > targetPrio && member.id !== user?.id);

                            return (
                                <div key={member.id} className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                            {member.avatarUrl && (
                                                <AvatarImage src={`${API_URL}/uploads/${member.avatarUrl}`} />
                                            )}
                                            <AvatarFallback style={{ backgroundColor: stringToColor(member.name || member.email) }} className="text-white">
                                                {member.name ? member.name[0] : member.email[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="flex items-center gap-1.5">
                                                <p className="text-sm font-medium leading-none">
                                                    {member.name}
                                                </p>
                                                {member.id === activeBoardOwnerId ? (
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
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setMembersOpen(false)} className="w-full">Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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

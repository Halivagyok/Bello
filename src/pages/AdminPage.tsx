import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { client, useStore } from '../store';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
    ArrowLeft, 
    RefreshCw, 
    Edit2, 
    Eye, 
    ShieldAlert, 
    CheckCircle, 
    Trash2,
    Ban,
    UserCheck,
    Users
} from 'lucide-react';

interface AdminUser {
    id: string;
    email: string;
    name: string;
    isAdmin: boolean;
    isBanned: boolean;
    createdAt: string;
    projectsCount: number;
    boardsCount: number;
}

export default function AdminPage() {
    const navigate = useNavigate();
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);

    // Edit Name Dialog
    const [editOpen, setEditOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
    const [newName, setNewName] = useState('');

    // Access Dialog
    const [accessOpen, setAccessOpen] = useState(false);
    const [userAccess, setUserAccess] = useState<{ projects: any[], boards: any[] }>({ projects: [], boards: [] });
    const [accessLoading, setAccessLoading] = useState(false);

    // Confirm Dialog
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmMessage, setConfirmMessage] = useState('');
    const [onConfirm, setOnConfirm] = useState<() => void>(() => {});

    const handleConfirmAction = (message: string, action: () => void) => {
        setConfirmMessage(message);
        setOnConfirm(() => action);
        setConfirmOpen(true);
    };

    const user = useStore(state => state.user);

    useEffect(() => {
        if (!loading && user && !user.isAdmin) {
            navigate('/boards');
        }
    }, [user, loading, navigate]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data, error } = await client.admin.users.get();
            if (error) {
                console.error(error);
                alert('Failed to fetch users');
            } else if (data) {
                setUsers(data as AdminUser[]);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleBan = async (userId: string) => {
        try {
            const { data, error } = await client.admin.users[userId].ban.post();
            if (error) throw error;
            if (data?.isBanned !== undefined) {
                setUsers(users.map(u => u.id === userId ? { ...u, isBanned: data.isBanned } : u));
            } else {
                fetchUsers();
            }
        } catch (e) {
            alert('Failed to ban/unban user');
            console.error(e);
        }
    };

    const handleEditName = (user: AdminUser) => {
        setSelectedUser(user);
        setNewName(user.name);
        setEditOpen(true);
    };

    const saveName = async () => {
        if (!selectedUser) return;
        try {
            const { error } = await client.admin.users[selectedUser.id].name.patch({ name: newName });
            if (error) throw error;
            setUsers(users.map(u => u.id === selectedUser.id ? { ...u, name: newName } : u));
            setEditOpen(false);
        } catch (e) {
            alert('Failed to update name');
        }
    };

    const handleManageAccess = async (user: AdminUser) => {
        setSelectedUser(user);
        setAccessOpen(true);
        setAccessLoading(true);
        try {
            const { data, error } = await client.admin.users[user.id].access.get();
            if (error) throw error;
            if (data) {
                setUserAccess(data);
            }
        } catch (e) {
            alert('Failed to fetch access details');
        } finally {
            setAccessLoading(false);
        }
    };

    const removeProject = async (projectId: string) => {
        if (!selectedUser) return;
        handleConfirmAction('Are you sure you want to remove the user from this project?', async () => {
            try {
                const { error } = await client.admin.users[selectedUser.id].projects[projectId].delete();
                if (error) throw error;
                setUserAccess(prev => ({
                    ...prev,
                    projects: prev.projects.filter(p => p.projectId !== projectId)
                }));
                setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, projectsCount: u.projectsCount - 1 } : u));
            } catch (e) {
                alert('Failed to remove from project');
            }
        });
    };

    const removeBoard = async (boardId: string) => {
        if (!selectedUser) return;
        handleConfirmAction('Are you sure you want to remove the user from this board?', async () => {
            try {
                const { error } = await client.admin.users[selectedUser.id].boards[boardId].delete();
                if (error) throw error;
                setUserAccess(prev => ({
                    ...prev,
                    boards: prev.boards.filter(b => b.boardId !== boardId)
                }));
                setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, boardsCount: u.boardsCount - 1 } : u));
            } catch (e) {
                alert('Failed to remove from board');
            }
        });
    };

    if (loading) return <div className="p-8 text-center text-muted-foreground">Loading Users...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => navigate('/boards')} className="gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
                    <Button variant="ghost" size="icon" onClick={fetchUsers} disabled={loading} className="h-8 w-8">
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHead>
                        <TableRow className="bg-muted/50">
                            <TableHead className="font-semibold">Name</TableHead>
                            <TableHead className="font-semibold">Email</TableHead>
                            <TableHead className="font-semibold">Registered</TableHead>
                            <TableHead className="text-center font-semibold">Projects</TableHead>
                            <TableHead className="text-center font-semibold">Boards</TableHead>
                            <TableHead className="text-center font-semibold">Status</TableHead>
                            <TableHead className="text-right font-semibold">Actions</TableHead>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                        {user.name} 
                                        {user.isAdmin && <Badge variant="default" className="text-[10px] px-1.5 h-4 uppercase">Admin</Badge>}
                                    </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell className="text-center">{user.projectsCount}</TableCell>
                                <TableCell className="text-center">{user.boardsCount}</TableCell>
                                <TableCell className="text-center">
                                    <Badge variant={user.isBanned ? "destructive" : "secondary"}>
                                        {user.isBanned ? "Banned" : "Active"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditName(user)}>
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleManageAccess(user)}>
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className={`h-8 w-8 ${user.isBanned ? 'text-green-600 hover:text-green-700' : 'text-red-600 hover:text-red-700'}`}
                                            onClick={() => handleBan(user.id)}
                                        >
                                            {user.isBanned ? <UserCheck className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Edit Name Dialog */}
            <Dialog open={editOpen} onOpenChange={(val) => !val && setEditOpen(false)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit User Name</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
                        <Button onClick={saveName}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Access Dialog */}
            <Dialog open={accessOpen} onOpenChange={(val) => !val && setAccessOpen(false)}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Manage Access for {selectedUser?.name}
                        </DialogTitle>
                    </DialogHeader>
                    {accessLoading ? (
                        <div className="py-8 text-center text-muted-foreground">Loading access details...</div>
                    ) : (
                        <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto pr-2">
                            <div>
                                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                    Projects
                                </h3>
                                {userAccess.projects.length === 0 ? (
                                    <p className="text-sm text-muted-foreground italic px-4 py-2 bg-muted/50 rounded-lg">No projects</p>
                                ) : (
                                    <div className="rounded-md border overflow-hidden">
                                        <Table>
                                            <TableBody>
                                                {userAccess.projects.map(p => (
                                                    <TableRow key={p.projectId}>
                                                        <TableCell className="text-sm">{p.title}</TableCell>
                                                        <TableCell className="text-right">
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                                                                onClick={() => removeProject(p.projectId)}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                    Boards
                                </h3>
                                {userAccess.boards.length === 0 ? (
                                    <p className="text-sm text-muted-foreground italic px-4 py-2 bg-muted/50 rounded-lg">No boards</p>
                                ) : (
                                    <div className="rounded-md border overflow-hidden">
                                        <Table>
                                            <TableBody>
                                                {userAccess.boards.map(b => (
                                                    <TableRow key={b.boardId}>
                                                        <TableCell className="text-sm">{b.title}</TableCell>
                                                        <TableCell className="text-right">
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                                                                onClick={() => removeBoard(b.boardId)}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAccessOpen(false)} className="w-full">Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirm Dialog */}
            <Dialog open={confirmOpen} onOpenChange={(val) => !val && setConfirmOpen(false)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <ShieldAlert className="w-5 h-5" />
                            Confirm Action
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-sm text-muted-foreground">{confirmMessage}</p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={() => {
                            onConfirm();
                            setConfirmOpen(false);
                        }}>Confirm</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

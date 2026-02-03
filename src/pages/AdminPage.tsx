import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, Paper,
    Button, IconButton, Chip, Dialog, TextField, DialogTitle, DialogContent,
    DialogActions, Stack
} from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import { client, useStore } from '../store';

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


    // Admin Check
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
            if (error) throw error;
            // Update local state if data exists
            if (data?.isBanned !== undefined) {
                setUsers(users.map(u => u.id === userId ? { ...u, isBanned: data.isBanned } : u));
            } else {
                fetchUsers(); // Fallback
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
        if (!confirm('Are you sure you want to remove the user from this project?')) return;
        try {
            const { error } = await client.admin.users[selectedUser.id].projects[projectId].delete();
            if (error) throw error;
            setUserAccess({
                ...userAccess,
                projects: userAccess.projects.filter(p => p.projectId !== projectId)
            });
            // Update counts in main list
            setUsers(users.map(u => u.id === selectedUser.id ? { ...u, projectsCount: u.projectsCount - 1 } : u));
        } catch (e) {
            alert('Failed to remove from project');
        }
    };

    const removeBoard = async (boardId: string) => {
        if (!selectedUser) return;
        if (!confirm('Are you sure you want to remove the user from this board?')) return;
        try {
            const { error } = await client.admin.users[selectedUser.id].boards[boardId].delete();
            if (error) throw error;
            setUserAccess({
                ...userAccess,
                boards: userAccess.boards.filter(b => b.boardId !== boardId)
            });
            setUsers(users.map(u => u.id === selectedUser.id ? { ...u, boardsCount: u.boardsCount - 1 } : u));
        } catch (e) {
            alert('Failed to remove from board');
        }
    };

    if (loading) return <Box p={3}>Loading Users...</Box>;

    return (
        <Box sx={{ p: 4, maxWidth: 1200, margin: '0 auto' }}>
            <Box display="flex" alignItems="center" mb={4}>
                <Button onClick={() => navigate('/boards')} sx={{ mr: 2 }}>Back</Button>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#172b4d', display: 'flex', alignItems: 'center' }}>
                    User Management
                    <IconButton onClick={fetchUsers} sx={{ ml: 2, bgcolor: 'rgba(0,0,0,0.05)' }} disabled={loading}>
                        <RefreshIcon />
                    </IconButton>
                </Typography>
            </Box>

            <Paper elevation={2}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f4f5f7' }}>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Registered</TableCell>
                            <TableCell align="center">Projects</TableCell>
                            <TableCell align="center">Boards</TableCell>
                            <TableCell align="center">Status</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.name} {user.isAdmin && <Chip label="Admin" size="small" color="primary" sx={{ ml: 1 }} />}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell align="center">{user.projectsCount}</TableCell>
                                <TableCell align="center">{user.boardsCount}</TableCell>
                                <TableCell align="center">
                                    <Chip
                                        label={user.isBanned ? "Banned" : "Active"}
                                        color={user.isBanned ? "error" : "success"}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                                        <IconButton size="small" onClick={() => handleEditName(user)} title="Edit Name">
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" onClick={() => handleManageAccess(user)} title="Manage Access">
                                            <VisibilityIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            color={user.isBanned ? "success" : "error"}
                                            onClick={() => handleBan(user.id)}
                                            title={user.isBanned ? "Unban" : "Ban"}
                                        >
                                            {user.isBanned ? <CheckCircleIcon fontSize="small" /> : <BlockIcon fontSize="small" />}
                                        </IconButton>
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>

            {/* Edit DIALOG */}
            <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
                <DialogTitle>Edit User Name</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Name"
                        fullWidth
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditOpen(false)}>Cancel</Button>
                    <Button onClick={saveName} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>

            {/* Access DIALOG */}
            <Dialog open={accessOpen} onClose={() => setAccessOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Manage Access for {selectedUser?.name}</DialogTitle>
                <DialogContent>
                    {accessLoading ? <Typography>Loading...</Typography> : (
                        <Box mt={2}>
                            <Typography variant="h6" gutterBottom>Projects</Typography>
                            {userAccess.projects.length === 0 ? <Typography color="textSecondary">No projects</Typography> : (
                                <Table size="small">
                                    <TableHead><TableRow><TableCell>Project Name</TableCell><TableCell align="right">Action</TableCell></TableRow></TableHead>
                                    <TableBody>
                                        {userAccess.projects.map(p => (
                                            <TableRow key={p.projectId}>
                                                <TableCell>{p.title}</TableCell>
                                                <TableCell align="right">
                                                    <IconButton size="small" color="error" onClick={() => removeProject(p.projectId)}>
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}

                            <Box mt={4}>
                                <Typography variant="h6" gutterBottom>Boards</Typography>
                                {userAccess.boards.length === 0 ? <Typography color="textSecondary">No boards</Typography> : (
                                    <Table size="small">
                                        <TableHead><TableRow><TableCell>Board Name</TableCell><TableCell align="right">Action</TableCell></TableRow></TableHead>
                                        <TableBody>
                                            {userAccess.boards.map(b => (
                                                <TableRow key={b.boardId}>
                                                    <TableCell>{b.title}</TableCell>
                                                    <TableCell align="right">
                                                        <IconButton size="small" color="error" onClick={() => removeBoard(b.boardId)}>
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAccessOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

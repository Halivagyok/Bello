
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Typography, Button, Grid, Paper, Card, CardActionArea, TextField,
    Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
    List, ListItem, ListItemAvatar, Avatar, ListItemText, ListItemSecondaryAction
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GroupIcon from '@mui/icons-material/Group';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useStore, client } from '../store';

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
        // Connect socket and subscribe
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
            fetchProject(projectId); // Reload
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
            fetchProject(projectId); // Reload members
        } catch (e) {
            alert('Failed to invite user (they might not exist or are already a member)');
        }
    };

    const isOwnerOrAdmin = project ? (project.ownerId === user?.id || user?.isAdmin) : false;



    if (!project) {
        return <Box sx={{ p: 4 }}>Loading or Project Not Found...</Box>;
    }

    return (
        <Box>
            {/* Header */}
            <Box sx={{ p: 2, bgcolor: '#026aa7', color: 'white', display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button startIcon={<ArrowBackIcon />} color="inherit" onClick={() => navigate('/boards')}>
                    Dashboard
                </Button>
                <Typography variant="h6" fontWeight="bold">{project.title}</Typography>
                <Button startIcon={<GroupIcon />} color="inherit" onClick={() => setMembersOpen(true)} sx={{ ml: 'auto' }}>
                    Members
                </Button>
                <Button startIcon={<PersonAddIcon />} color="inherit" onClick={() => setInviteOpen(true)} sx={{ ml: 1 }}>
                    Invite
                </Button>
            </Box>

            <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
                <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
                    {project.description || 'No description provided.'}
                </Typography>

                <Grid container spacing={3}>
                    {/* Create New Board Card */}
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Paper
                            sx={{
                                height: 120,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'rgba(9, 30, 66, 0.04)',
                                cursor: 'pointer',
                                transition: '0.2s',
                                '&:hover': { bgcolor: 'rgba(9, 30, 66, 0.08)' }
                            }}
                            onClick={() => setOpen(true)}
                        >
                            <Typography variant="h6" color="textSecondary">Create new board</Typography>
                        </Paper>
                    </Grid>

                    {/* Existing Boards */}
                    {projectBoards.map(board => (
                        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={board.id}>
                            <Card sx={{ height: 120, bgcolor: '#0079bf', color: 'white' }}>
                                <CardActionArea
                                    sx={{ height: '100%', p: 2, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start' }}
                                    onClick={() => navigate(`/boards/${board.id}`)}
                                >
                                    <Typography variant="h6" fontWeight="bold">{board.title}</Typography>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>

            {/* Create Board Dialog */}
            <Dialog open={open} onClose={() => { setOpen(false); setNewTitle(''); }}>
                <DialogTitle>Create Board in {project.title}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Board Title"
                        fullWidth
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setOpen(false); setNewTitle(''); }}>Cancel</Button>
                    <Button onClick={handleCreateBoard} variant="contained">Create</Button>
                </DialogActions>
            </Dialog>

            {/* Invite Dialog */}
            <Dialog open={inviteOpen} onClose={() => { setInviteOpen(false); setInviteEmail(''); }}>
                <DialogTitle>Invite to Project</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Email Address"
                        type="email"
                        fullWidth
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setInviteOpen(false); setInviteEmail(''); }}>Cancel</Button>
                    <Button onClick={handleInvite} variant="contained">Invite</Button>
                </DialogActions>
            </Dialog>

            {/* Members Dialog */}
            <Dialog open={membersOpen} onClose={() => setMembersOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Project Members</DialogTitle>
                <DialogContent>
                    <List>
                        {project.members && project.members.map((member) => (
                            <ListItem key={member.id}>
                                <ListItemAvatar>
                                    <Avatar sx={{ bgcolor: '#0079bf' }}>
                                        {member.name ? member.name[0] : member.email[0]}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={`${member.name} ${member.id === project.ownerId ? '(Owner)' : ''} ${member.isAdmin ? '(System Admin)' : ''}`}
                                    secondary={member.email}
                                />
                                <ListItemSecondaryAction>
                                    {isOwnerOrAdmin && member.id !== user?.id && member.id !== project.ownerId && (
                                        <IconButton edge="end" onClick={() => handleRemoveMember(member.id)} color="error">
                                            <DeleteIcon />
                                        </IconButton>
                                    )}
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))}
                        {(!project.members || project.members.length === 0) && <Typography p={2}>No members found.</Typography>}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setMembersOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );

}

import { Box, Button, IconButton, Typography, useTheme, Avatar, AvatarGroup, Tooltip, List, ListItem, ListItemAvatar, ListItemText, ListItemSecondaryAction } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import ShareIcon from '@mui/icons-material/Share';
import SettingsIcon from '@mui/icons-material/Settings';
import DeleteIcon from '@mui/icons-material/Delete';
import { useStore, client } from '../store';
import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions } from '@mui/material';
import ProjectTabs from './ProjectTabs';

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
    const theme = useTheme();

    const [inviteOpen, setInviteOpen] = useState(false);
    const [membersOpen, setMembersOpen] = useState(false);
    const [createBoardOpen, setCreateBoardOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [newBoardTitle, setNewBoardTitle] = useState('');

    const project = activeProjectId ? projects.find(p => p.id === activeProjectId) : null;

    // Sort boards based on project.boardIds if available, else usage
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
            fetchBoard(activeBoardId, true); // Reload members
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

    // Helper to generate consistent color from string
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
        <Box sx={{ width: '100%', mb: 2 }}>
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2,
                px: 2,
                py: 1,
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(8px)',
                borderRadius: 2
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, overflow: 'hidden' }}>
                    {/* Render ProjectTabs if in a project, otherwise Board Name */}
                    {activeProjectId ? (
                        <ProjectTabs
                            boards={projectBoards}
                            activeBoardId={activeBoardId}
                            onRename={renameBoard}
                            onCreate={() => setCreateBoardOpen(true)}
                        />
                    ) : (
                        <Typography variant="h5" fontWeight="bold" sx={{ color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                            {boardName}
                        </Typography>
                    )}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>

                    {/* Avatars */}
                    <Box onClick={() => setMembersOpen(true)} sx={{ cursor: 'pointer' }}>
                        <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 32, height: 32, fontSize: '0.875rem' } }}>
                            {activeMembers.map((member) => (
                                <Tooltip key={member.id} title={member.name || member.email}>
                                    <Avatar
                                        alt={member.name}
                                        // src={member.avatarUrl} // Future: Add avatarUrl to member
                                        sx={{ bgcolor: stringToColor(member.name || member.email) }}
                                    >
                                        {member.name ? member.name[0].toUpperCase() : member.email[0].toUpperCase()}
                                    </Avatar>
                                </Tooltip>
                            ))}
                        </AvatarGroup>
                    </Box>

                    <Box sx={{ width: '1px', height: '24px', bgcolor: 'rgba(255,255,255,0.3)', mx: 1 }} />

                    <IconButton
                        sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}
                    >
                        <FilterListIcon />
                    </IconButton>

                    <Button
                        variant="contained"
                        startIcon={<ShareIcon />}
                        onClick={() => setInviteOpen(true)}
                        sx={{
                            bgcolor: 'white',
                            color: theme.palette.text.primary,
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
                        }}
                    >
                        Share
                    </Button>

                    <IconButton sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
                        <SettingsIcon />
                    </IconButton>
                </Box>
            </Box>

            <Dialog open={inviteOpen} onClose={() => { setInviteOpen(false); setEmail(''); }}>
                <DialogTitle>Invite Member</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Email Address"
                        type="email"
                        fullWidth
                        variant="outlined"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setInviteOpen(false); setEmail(''); }}>Cancel</Button>
                    <Button onClick={handleInvite} variant="contained">Invite</Button>
                </DialogActions>
            </Dialog>

            {/* Create Board Dialog */}
            <Dialog open={createBoardOpen} onClose={() => { setCreateBoardOpen(false); setNewBoardTitle(''); }}>
                <DialogTitle>Create New Board</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Board Title"
                        fullWidth
                        variant="outlined"
                        value={newBoardTitle}
                        onChange={(e) => setNewBoardTitle(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateBoardOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreateBoard} variant="contained">Create</Button>
                </DialogActions>
            </Dialog>

            {/* Members List Dialog */}
            <Dialog open={membersOpen} onClose={() => setMembersOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Board Members</DialogTitle>
                <DialogContent>
                    <List>
                        {activeMembers.map((member) => (
                            <ListItem key={member.id}>
                                <ListItemAvatar>
                                    <Avatar sx={{ bgcolor: stringToColor(member.name || member.email) }}>
                                        {member.name ? member.name[0] : member.email[0]}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={`${member.name} ${member.id === activeBoardOwnerId ? '(Owner)' : ''} ${member.isAdmin ? '(System Admin)' : ''}`}
                                    secondary={member.email}
                                />
                                <ListItemSecondaryAction>
                                    {isOwnerOrAdmin && member.id !== user?.id && member.id !== activeBoardOwnerId && (
                                        <IconButton edge="end" onClick={() => handleRemoveMember(member.id)} color="error">
                                            <DeleteIcon />
                                        </IconButton>
                                    )}
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setMembersOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

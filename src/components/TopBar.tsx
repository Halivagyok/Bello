import { Box, Button, IconButton, Typography, useTheme, Avatar, AvatarGroup, Tooltip } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import ShareIcon from '@mui/icons-material/Share';
import SettingsIcon from '@mui/icons-material/Settings';
import { useStore } from '../store';
import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions } from '@mui/material';

export default function TopBar() {
    const boardName = useStore((state) => state.boardName);
    const activeMembers = useStore((state) => state.activeMembers);
    const inviteUser = useStore((state) => state.inviteUser);
    const theme = useTheme();

    const [inviteOpen, setInviteOpen] = useState(false);
    const [email, setEmail] = useState('');

    const handleInvite = async () => {
        if (!email) return;
        try {
            await inviteUser(email);
            setEmail('');
            setInviteOpen(false);
        } catch (e) {
            alert('Failed to invite');
        }
    };


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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="h5" fontWeight="bold" sx={{ color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        {boardName}
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>

                    {/* Avatars */}
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
        </Box>
    );
}

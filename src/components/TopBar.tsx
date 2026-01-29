import { Box, Button, IconButton, Typography, useTheme } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import ShareIcon from '@mui/icons-material/Share';
import SettingsIcon from '@mui/icons-material/Settings';
import { useStore } from '../store';
import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions } from '@mui/material';

export default function TopBar() {
    const boardName = useStore((state) => state.boardName);
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

                    <Button
                        startIcon={<FilterListIcon />}
                        sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}
                    />

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

            <Dialog open={inviteOpen} onClose={() => setInviteOpen(false)}>
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
                    <Button onClick={() => setInviteOpen(false)}>Cancel</Button>
                    <Button onClick={handleInvite} variant="contained">Invite</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

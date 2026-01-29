import { Avatar, AvatarGroup, Box, Button, IconButton, Typography, useTheme } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import ShareIcon from '@mui/icons-material/Share';
import SettingsIcon from '@mui/icons-material/Settings';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { useStore } from '../store';

export default function TopBar() {
    const boardName = useStore((state) => state.boardName);
    const members = useStore((state) => state.members);
    const theme = useTheme();

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
                    <AvatarGroup max={4} sx={{
                        '& .MuiAvatar-root': {
                            width: 32,
                            height: 32,
                            fontSize: '0.875rem',
                            border: '2px solid rgba(255,255,255,0.2)'
                        }
                    }}>
                        {members.map((m, i) => (
                            <Avatar key={i} sx={{ bgcolor: theme.palette.primary.main }}>{m}</Avatar>
                        ))}
                    </AvatarGroup>

                    <Button
                        startIcon={<FilterListIcon />}
                        sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}
                    />

                    <Button
                        variant="contained"
                        startIcon={<ShareIcon />}
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
        </Box>
    );
}

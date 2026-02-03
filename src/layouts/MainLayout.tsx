import { Box, Typography, Button } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useStore } from '../store';
import { useNavigate, Outlet } from 'react-router-dom';

export default function MainLayout() {
    const user = useStore(state => state.user);
    const logout = useStore(state => state.logout);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f4f5f7' }}>
            {/* Top Bar */}
            <Box sx={{ p: 2, bgcolor: '#026aa7', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight="bold">Bello Dashboard</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography>Welcome, {user?.name || user?.email}</Typography>
                    {user?.isAdmin && (
                        <Button variant="contained" color="error" size="small" onClick={() => navigate('/admin')}>
                            Admin
                        </Button>
                    )}
                    <Button variant="contained" color="secondary" size="small" startIcon={<LogoutIcon />} onClick={handleLogout}>
                        Logout
                    </Button>
                </Box>
            </Box>

            {/* Page Content */}
            <Outlet />
        </Box>
    );
}

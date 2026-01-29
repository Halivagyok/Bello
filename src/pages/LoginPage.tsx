import { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Tab, Tabs, Alert } from '@mui/material';
import { useStore } from '../store';

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    const login = useStore((state) => state.login);
    const signup = useStore((state) => state.signup);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await signup(email, password, name);
            }
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
        }
    };

    return (
        <Box sx={{
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            bgcolor: '#f5f5f5' // Light grey background
        }}>
            <Paper elevation={3} sx={{ p: 4, width: 400, borderRadius: 2 }}>
                <Typography variant="h4" align="center" gutterBottom fontWeight="bold" color="primary">
                    Bello
                </Typography>

                <Tabs
                    value={isLogin ? 0 : 1}
                    onChange={(_, val) => setIsLogin(val === 0)}
                    variant="fullWidth"
                    sx={{ mb: 3 }}
                >
                    <Tab label="Login" />
                    <Tab label="Sign Up" />
                </Tabs>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Email"
                        type="email"
                        fullWidth
                        margin="normal"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        label="Password"
                        type="password"
                        fullWidth
                        margin="normal"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {!isLogin && (
                        <TextField
                            label="Name"
                            fullWidth
                            margin="normal"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    )}

                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        size="large"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        {isLogin ? 'Login' : 'Sign Up'}
                    </Button>
                </form>
            </Paper>
        </Box>
    );
}

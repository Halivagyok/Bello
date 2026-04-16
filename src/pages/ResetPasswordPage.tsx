import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { Button } from "@/components/ui/button"
import { ShaderBackground } from "@/components/ui/ShaderBackground";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Layout, Loader2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const resetPassword = useStore((state) => state.resetPassword);

    useEffect(() => {
        if (!token) {
            setError('No reset token found in URL. Please request a new link.');
        }
    }, [token]);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(password)) {
            setError('Password must be at least 8 characters long, with an uppercase, lowercase, and number.');
            return;
        }

        if (!token) {
            setError('No token available.');
            return;
        }

        setLoading(true);
        try {
            const res = await resetPassword(token, password);
            if (!res.success) {
                setError(res.error || 'Failed to reset password');
            } else {
                // Success! Redirect
                navigate('/login');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden p-4">
            <ShaderBackground />
            <div className="flex items-center gap-2 mb-8 animate-in fade-in slide-in-from-top-4 duration-1000 z-10">
                <div className="bg-white p-2 rounded-xl">
                    <Layout className="w-8 h-8 text-black" />
                </div>
                <h1 className="text-4xl font-black tracking-tighter text-white">Bello</h1>
            </div>

            <div className="relative z-10 w-full max-w-md">
                <Card className="border border-white/10 shadow-2xl bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl">
                    <form onSubmit={handleReset}>
                        <CardHeader>
                            <CardTitle className="text-2xl">Create New Password</CardTitle>
                            <CardDescription className="text-slate-700 dark:text-zinc-400 font-medium">
                                Choose a strong password for your account.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">New Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border border-white/20 focus-visible:ring-1 focus-visible:ring-primary"
                                    required
                                    disabled={!token}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm-password">Confirm Password</Label>
                                <Input
                                    id="confirm-password"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border border-white/20 focus-visible:ring-1 focus-visible:ring-primary"
                                    required
                                    disabled={!token}
                                />
                            </div>
                            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
                        </CardContent>
                        <CardFooter className="flex-col gap-2">
                            <Button type="submit" className="w-full h-11" disabled={loading || !token}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Reset Password
                            </Button>
                            <Button type="button" variant="ghost" className="w-full" onClick={() => navigate('/login')}>
                                Back to Login
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
            
            <p className="mt-8 text-sm text-muted-foreground z-10">
                Built with precision and passion.
            </p>
        </div>
    );
}

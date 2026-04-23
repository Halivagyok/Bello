import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../store';
import { Button } from "@/components/ui/button"
import { ShaderBackground } from "@/components/ui/ShaderBackground";
import { GoHome } from 'react-icons/go';
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
import {
    Tabs,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';




export default function Auth() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const queryTab = new URLSearchParams(location.search).get('tab');
    const [activeTab, setActiveTab] = useState(queryTab === 'signup' ? 'signup' : 'login');

    useEffect(() => {
        if (queryTab === 'signup' || queryTab === 'login') {
            setActiveTab(queryTab);
        }
    }, [queryTab]);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotSuccess, setForgotSuccess] = useState('');

    const login = useStore((state) => state.login);
    const signup = useStore((state) => state.signup);
    const forgotPassword = useStore((state) => state.forgotPassword);

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setForgotSuccess('');
        setLoading(true);
        try {
            const res = await forgotPassword(forgotEmail || email);
            if (!res.success) {
                setError(res.error || 'Failed to send reset email');
            } else {
                setForgotSuccess('If that email exists, a reset link has been sent!');
                setForgotEmail('');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleAuth = async (isLogin: boolean) => {
        setError('');

        if (!isLogin) {
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
            if (!passwordRegex.test(password)) {
                setError('Password must be at least 8 characters long, with an uppercase, lowercase, and number.');
                return;
            }
        }

        setLoading(true);
        try {
            if (isLogin) await login(email, password);
            else await signup(email, password, name);
        }
        catch (err: any) {
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden p-4">
            <ShaderBackground />

            {/* Back to Home Button */}
            <div className="absolute top-8 left-8 z-50">
                <Button variant="ghost" className="text-white hover:bg-white/10 gap-2 font-bold" asChild>
                    <Link to="/">
                        <GoHome className="w-4 h-4" />
                        Back to Home
                    </Link>
                </Button>
            </div>
            <div className="flex items-center gap-2 mb-8 animate-in fade-in slide-in-from-top-4 duration-1000 z-10">
                <div className="bg-white/10 p-2 rounded-xl border border-white/20 shadow-inner backdrop-blur-md text-white dark:text-zinc-900">
                    <svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'><rect width='18' height='18' x='3' y='3' rx='2'/><path d='M3 9h18'/><path d='M9 21V9'/></svg>
                </div>
                <h1 className="text-4xl font-black tracking-tighter text-white">Bello</h1>
            </div>

            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full max-w-md z-10"
            >
                <TabsList className="grid w-full grid-cols-2 mb-8 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl border border-white/10">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <div className="relative">
                    <AnimatePresence mode="wait">
                        {isForgotPassword ? (
                            <motion.div
                                key="forgot-password"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2, ease: "easeInOut" }}
                            >
                                <Card className="border border-white/10 shadow-2xl bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl">
                                    <form onSubmit={handleForgotPassword}>
                                        <CardHeader>
                                            <CardTitle className="text-2xl">Reset Password</CardTitle>
                                            <CardDescription className="text-slate-700 dark:text-zinc-400 font-medium">
                                                Enter your email and we will send you a reset link.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="forgot-email">Email</Label>
                                                <Input
                                                    id="forgot-email"
                                                    type="email"
                                                    placeholder="m@example.com"
                                                    value={forgotEmail || email}
                                                    onChange={(e) => {
                                                        setForgotEmail(e.target.value);
                                                        setEmail(e.target.value);
                                                    }}
                                                    className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border border-white/20 focus-visible:ring-1 focus-visible:ring-primary"
                                                    required
                                                />
                                            </div>
                                            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
                                            {forgotSuccess && <p className="text-sm font-medium text-green-600 dark:text-green-400">{forgotSuccess}</p>}
                                        </CardContent>
                                        <CardFooter className="flex-col gap-2">
                                            <Button type="submit" className="w-full h-11" disabled={loading}>
                                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Send Reset Link
                                            </Button>
                                            <Button type="button" variant="ghost" className="w-full" onClick={() => {
                                                setIsForgotPassword(false);
                                                setError('');
                                                setForgotSuccess('');
                                            }}>
                                                Back to Login
                                            </Button>
                                        </CardFooter>
                                    </form>
                                </Card>
                            </motion.div>
                        ) : activeTab === 'login' ? (
                            <motion.div
                                key="login"
                                initial={{ opacity: 0, x: -20, scale: 0.95 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 20, scale: 0.95 }}
                                transition={{ duration: 0.2, ease: "easeInOut" }}
                            >
                                <Card className="border border-white/10 shadow-2xl bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl">
                                    <form onSubmit={(e) => { e.preventDefault(); handleAuth(true); }}>
                                        <CardHeader>
                                            <CardTitle className="text-2xl">Welcome back</CardTitle>
                                            <CardDescription className="text-slate-700 dark:text-zinc-400 font-medium">
                                                Enter your credentials to access your account.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="m@example.com"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border border-white/20 focus-visible:ring-1 focus-visible:ring-primary"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="password">Password</Label>
                                                <Input
                                                    id="password"
                                                    type="password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border border-white/20 focus-visible:ring-1 focus-visible:ring-primary"
                                                    required
                                                />
                                            </div>
                                            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
                                        </CardContent>
                                        <CardFooter className="flex-col pb-6">
                                            <Button type="submit" className="w-full h-11" disabled={loading}>
                                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Login
                                            </Button>
                                            <div className="mt-4 text-center w-full">
                                                <button 
                                                    type="button" 
                                                    onClick={() => { setIsForgotPassword(true); setError(''); }}
                                                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                                >
                                                    Forgot your password?
                                                </button>
                                            </div>
                                        </CardFooter>
                                    </form>
                                </Card>

                            </motion.div>
                        ) : (
                            <motion.div
                                key="signup"
                                initial={{ opacity: 0, x: 20, scale: 0.95 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: -20, scale: 0.95 }}
                                transition={{ duration: 0.2, ease: "easeInOut" }}
                            >
                                <Card className="border border-white/10 shadow-2xl bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl">
                                    <form onSubmit={(e) => { e.preventDefault(); handleAuth(false); }}>
                                        <CardHeader>
                                            <CardTitle className="text-2xl">Create an account</CardTitle>
                                            <CardDescription className="text-slate-700 dark:text-zinc-400 font-medium">
                                                Join Bello to start managing your projects efficiently.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="signup-name">Full Name</Label>
                                                <Input
                                                    id="signup-name"
                                                    placeholder="John Doe"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border border-white/20 focus-visible:ring-1 focus-visible:ring-primary"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="signup-email">Email</Label>
                                                <Input
                                                    id="signup-email"
                                                    type="email"
                                                    placeholder="m@example.com"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border border-white/20 focus-visible:ring-1 focus-visible:ring-primary"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="signup-password">Password</Label>
                                                <Input
                                                    id="signup-password"
                                                    type="password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border border-white/20 focus-visible:ring-1 focus-visible:ring-primary"
                                                    required
                                                />
                                            </div>
                                            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
                                        </CardContent>
                                        <CardFooter>
                                            <Button type="submit" className="w-full h-11" disabled={loading}>
                                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Create Account
                                            </Button>
                                        </CardFooter>
                                    </form>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </Tabs>

            <p className="mt-8 text-sm text-muted-foreground">
                Built with precision and passion.
            </p>
        </div>
    );
}

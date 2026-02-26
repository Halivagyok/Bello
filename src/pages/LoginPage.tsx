import { useState } from 'react';
import { useStore } from '../store';
import { Button } from "@/components/ui/button"
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
import { Layout, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Auth() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('login');

    const login = useStore((state) => state.login);
    const signup = useStore((state) => state.signup);

    const handleAuth = async (isLogin: boolean) => {
        setError('');
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
        <div className="min-h-screen flex flex-col justify-center items-center bg-zinc-50 dark:bg-zinc-950 p-4">
            <div className="flex items-center gap-2 mb-8 animate-in fade-in slide-in-from-top-4 duration-1000">
                <div className="bg-primary p-2 rounded-xl">
                    <Layout className="w-8 h-8 text-primary-foreground" />
                </div>
                <h1 className="text-4xl font-black tracking-tighter text-foreground">Bello</h1>
            </div>

            <Tabs 
                value={activeTab} 
                onValueChange={setActiveTab} 
                className="w-full max-w-md"
            >
                <TabsList className="grid w-full grid-cols-2 mb-8">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                
                <div className="relative">
                    <AnimatePresence mode="wait">
                        {activeTab === 'login' ? (
                            <motion.div
                                key="login"
                                initial={{ opacity: 0, x: -20, scale: 0.95 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 20, scale: 0.95 }}
                                transition={{ duration: 0.2, ease: "easeInOut" }}
                            >
                                <Card className="border-none shadow-xl bg-card">
                                    <form onSubmit={(e) => { e.preventDefault(); handleAuth(true); }}>
                                        <CardHeader>
                                            <CardTitle className="text-2xl">Welcome back</CardTitle>
                                            <CardDescription>
                                                Enter your credentials to access your account.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email</Label>
                                                <Input 
                                                    id="email" 
                                                    type="text" 
                                                    placeholder="m@example.com" 
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary"
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
                                                    className="bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary"
                                                    required 
                                                />
                                            </div>
                                            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
                                        </CardContent>
                                        <CardFooter>
                                            <Button type="submit" className="w-full h-11" disabled={loading}>
                                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Login
                                            </Button>
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
                                <Card className="border-none shadow-xl bg-card">
                                    <form onSubmit={(e) => { e.preventDefault(); handleAuth(false); }}>
                                        <CardHeader>
                                            <CardTitle className="text-2xl">Create an account</CardTitle>
                                            <CardDescription>
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
                                                    className="bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary"
                                                    required 
                                                />
                                            </div>
                                                                                    <div className="space-y-2">
                                                                                        <Label htmlFor="signup-email">Email</Label>
                                                                                        <Input 
                                                                                            id="signup-email" 
                                                                                            type="text" 
                                                                                            placeholder="m@example.com" 
                                                                                            value={email}
                                                                                            onChange={(e) => setEmail(e.target.value)}
                                                                                            className="bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary"
                                                                                            required 
                                                                                        />
                                                                                    </div>                                            <div className="space-y-2">
                                                <Label htmlFor="signup-password">Password</Label>
                                                <Input 
                                                    id="signup-password" 
                                                    type="password" 
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary"
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

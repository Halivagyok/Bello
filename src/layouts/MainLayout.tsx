import { useStore } from '../store';
import { useNavigate, Outlet, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, ShieldCheck, Layout } from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';
import {
    Avatar,
    AvatarFallback,
} from "@/components/ui/avatar"

export default function MainLayout() {
    const user = useStore(state => state.user);
    const logout = useStore(state => state.logout);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

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
        <div className="min-h-screen bg-background">
            {/* Top Bar */}
            <header className="border-b bg-card text-card-foreground px-4 sm:px-6 h-16 flex items-center justify-between sticky top-0 z-50 shadow-sm">
                <Link to="/boards" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
                    <div className="bg-primary p-1.5 rounded-lg">
                        <Layout className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <span className="text-xl font-bold tracking-tight hidden sm:inline">Bello</span>
                </Link>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 hidden md:flex">
                        <Avatar className="w-6 h-6">
                            <AvatarFallback style={{ backgroundColor: stringToColor(user?.name || user?.email || 'User') }} className="text-[10px] text-white">
                                {(user?.name || user?.email || 'U')[0].toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{user?.name || user?.email}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        {user?.isAdmin && (
                            <Button 
                                variant="destructive" 
                                size="sm" 
                                className="gap-2"
                                onClick={() => navigate('/admin')}
                            >
                                <ShieldCheck className="w-4 h-4" />
                                <span className="hidden sm:inline">Admin</span>
                            </Button>
                        )}
                        
                        <ModeToggle />

                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="gap-2 text-muted-foreground hover:text-foreground"
                            onClick={handleLogout}
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </Button>
                    </div>
                </div>
            </header>

            {/* Page Content */}
            <main className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <Outlet />
            </main>
        </div>
    );
}

import { useStore } from '../store';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, ShieldCheck, Calendar } from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import { LiquidGradient } from '@/components/ui/LiquidGradient';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function MainLayout() {
    const user = useStore(state => state.user);
    const logout = useStore(state => state.logout);
    const navigate = useNavigate();
    const location = useLocation();

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

    const isBoardsActive = location.pathname.startsWith('/boards');
    const isCalendarActive = location.pathname.startsWith('/calendar');

    return (
        <div className="min-h-screen relative flex flex-col">
            <div className="fixed inset-0 z-0 pointer-events-none">
                <LiquidGradient />
            </div>
            
            {/* Top Bar */}
            <header className="border-b bg-card/60 backdrop-blur-md text-card-foreground px-4 sm:px-6 h-16 flex items-center justify-between sticky top-0 z-50 shadow-sm relative">
                <div className="flex items-center gap-4 sm:gap-6">
                    <Link to="/boards" className={`flex items-center gap-2 transition-all ${isBoardsActive ? 'opacity-100 scale-105' : 'opacity-70 hover:opacity-100'}`}>
                        <div className={`p-1.5 rounded-lg border transition-all ${isBoardsActive ? 'bg-primary text-zinc-900 border-primary shadow-lg shadow-primary/20' : 'bg-primary/20 border-primary/20 text-white'}`}>
                            <svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='3' strokeLinecap='round' strokeLinejoin='round'><rect width='18' height='18' x='3' y='3' rx='2'/><path d='M3 9h18'/><path d='M9 21V9'/></svg>
                        </div>
                        <span className="text-xl font-bold tracking-tight hidden sm:inline">Bello</span>
                    </Link>

                    <Link to="/calendar" className={`flex items-center gap-2 transition-all ${isCalendarActive ? 'text-primary scale-105' : 'text-muted-foreground hover:text-foreground'}`}>
                        <div className={`p-1.5 rounded-lg border transition-colors md:hidden ${isCalendarActive ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-primary/10 border-primary/20 text-primary'}`}>
                            <Calendar className="w-4 h-4" />
                        </div>
                        <Calendar className="w-4 h-4 hidden md:inline" />
                        <span className="text-sm font-bold hidden md:inline">Personal Calendar</span>
                        {isCalendarActive && <div className="absolute -bottom-[1.1rem] left-0 right-0 h-1 bg-primary rounded-t-full hidden md:block" />}
                    </Link>
                </div>

                <div className="flex items-center gap-2 sm:gap-4">
                    <div 
                        onClick={() => navigate('/profile')}
                        className="flex items-center gap-2 px-1.5 py-1.5 md:px-3 md:py-1.5 rounded-full bg-muted/50 cursor-pointer hover:bg-muted transition-colors border border-white/10"
                    >
                        <Avatar className="w-6 h-6 md:w-6 md:h-6">
                            {user?.avatarUrl && (
                                <AvatarImage src={`${API_URL}/uploads/${user.avatarUrl}`} crossOrigin="anonymous" />
                            )}
                            <AvatarFallback style={{ backgroundColor: stringToColor(user?.name || user?.email || 'User') }} className="text-[10px] text-white">
                                {(user?.name || user?.email || 'U')[0].toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium hidden md:inline">{user?.name || user?.email}</span>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2">
                        {user?.isAdmin && (
                            <Button 
                                variant="destructive" 
                                size="sm" 
                                className="h-8 sm:h-9 px-2 sm:px-3 gap-2"
                                onClick={() => navigate('/admin')}
                            >
                                <ShieldCheck className="w-4 h-4" />
                                <span className="hidden sm:inline">Admin</span>
                            </Button>
                        )}
                        
                        <div className="scale-90 sm:scale-100">
                            <ModeToggle />
                        </div>

                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3 gap-2 text-muted-foreground hover:text-foreground"
                            onClick={handleLogout}
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </Button>
                    </div>
                </div>
            </header>

            {/* Page Content */}
            <main className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 relative z-10 flex-1">
                <Outlet />
            </main>
        </div>
    );
}

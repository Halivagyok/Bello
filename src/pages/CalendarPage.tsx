import { useEffect, useState, useRef } from 'react';
import { useStore, type PersonalTask } from '../store';
import { Button } from '@/components/ui/button';
import { format, isValid } from 'date-fns';
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog"

import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Plus,
    Trash2,
    Edit2,
    CheckCircle2,
    Circle,
    Clock,
    RotateCcw,
    MapPin,
    Image as ImageIcon,
    ExternalLink
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AlertDialog } from '@/components/AlertDialog';
import { TimeInput } from '@/components/ui/time-input';
import { GoUpload } from 'react-icons/go';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function CalendarPage() {
    const personalTasks = useStore(state => state.personalTasks);
    const boardTasks = useStore(state => state.boardTasks);
    const fetchPersonalTasks = useStore(state => state.fetchPersonalTasks);
    const fetchBoardTasks = useStore(state => state.fetchBoardTasks);
    const createPersonalTask = useStore(state => state.createPersonalTask);
    const updatePersonalTask = useStore(state => state.updatePersonalTask);
    const deletePersonalTask = useStore(state => state.deletePersonalTask);
    const togglePersonalTask = useStore(state => state.togglePersonalTask);
    const toggleCardCompletion = useStore(state => state.toggleCardCompletion);
    const userImages = useStore(state => state.userImages);
    const fetchUserImages = useStore(state => state.fetchUserImages);
    const uploadImage = useStore(state => state.uploadImage);

    const datePickerRef = useRef<HTMLInputElement>(null);

    const formatTime = (timeStr: string | null | undefined) => {
        if (!timeStr) return '';
        // if (user?.timeFormat === '12h') {
        //     const [hours, minutes] = timeStr.split(':');
        //     const h = parseInt(hours);
        //     const ampm = h >= 12 ? 'PM' : 'AM';
        //     const h12 = h % 12 || 12;
        //     return `${h12}:${minutes} ${ampm}`;
        // }
        return timeStr; // Default is 24h as stored
    };

    const formatDate = (date: Date) => {
        return format(date, 'MMMM d, yyyy');
    };

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<PersonalTask | null>(null);
    const [showBoardTasks, setShowBoardTasks] = useState(true);

    // Form states
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueTime, setDueTime] = useState('');
    const [location, setLocation] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [selectedDays, setSelectedDays] = useState<number[]>([]);
    const [isRepeating, setIsRepeating] = useState(true);

    // Alert Dialog States
    const [alertConfig, setAlertConfig] = useState<{
        open: boolean,
        title: string,
        description: string,
        onConfirm?: () => void,
        variant?: 'default' | 'destructive'
    }>({
        open: false,
        title: '',
        description: ''
    });

    const showAlert = (title: string, description: string, onConfirm?: () => void, variant: 'default' | 'destructive' = 'default') => {
        setAlertConfig({ open: true, title, description, onConfirm, variant });
    };

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const dayOfWeek = selectedDate.getDay();

    useEffect(() => {
        fetchPersonalTasks(dateStr);
        if (showBoardTasks) {
            fetchBoardTasks(dateStr);
        }

        const interval = setInterval(() => {
            const now = new Date();
            setCurrentTime(now);

            // Auto-refresh if the day changes while the page is open
            const newDateStr = format(now, 'yyyy-MM-dd');
            const isTodaySelected = dateStr === format(new Date(), 'yyyy-MM-dd');

            if (isTodaySelected && newDateStr !== dateStr) {
                setSelectedDate(now);
            }
        }, 10000); // Check every 10s for better accuracy
        return () => clearInterval(interval);
    }, [fetchPersonalTasks, fetchBoardTasks, dateStr, showBoardTasks]);

    const handlePrevDay = () => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() - 1);
        const newDateStr = format(d, 'yyyy-MM-dd');
        setSelectedDate(d);
        if (showBoardTasks) fetchBoardTasks(newDateStr);
    };

    const handleNextDay = () => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + 1);
        const newDateStr = format(d, 'yyyy-MM-dd');
        setSelectedDate(d);
        if (showBoardTasks) fetchBoardTasks(newDateStr);
    };

    const handleToday = () => {
        const d = new Date();
        const newDateStr = format(d, 'yyyy-MM-dd');
        setSelectedDate(d);
        if (showBoardTasks) fetchBoardTasks(newDateStr);
    };

    const openCreateDialog = () => {
        setEditingTask(null);
        setTitle('');
        setDescription('');
        setDueTime('');
        setLocation('');
        setImageUrl('');
        setSelectedDays([dayOfWeek]);
        setIsRepeating(true);
        setIsDialogOpen(true);
    };

    const openEditDialog = (task: PersonalTask) => {
        setEditingTask(task);
        setTitle(task.title);
        setDescription(task.description || '');
        setDueTime(task.dueTime || '');
        setLocation(task.location || '');
        setImageUrl(task.imageUrl || '');
        setSelectedDays(task.daysOfWeek ? task.daysOfWeek.split(',').map(Number) : []);
        setIsRepeating(!!task.daysOfWeek);
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        const taskData = {
            title,
            description: description || null,
            dueTime: dueTime || null,
            location: location || null,
            imageUrl: imageUrl || null,
            daysOfWeek: isRepeating && selectedDays.length > 0 ? selectedDays.sort((a, b) => a - b).join(',') : null,
            date: !isRepeating ? dateStr : null
        };

        try {
            if (editingTask) {
                await updatePersonalTask(editingTask.id, taskData);
            } else {
                await createPersonalTask(taskData);
            }
            setIsDialogOpen(false);
            fetchPersonalTasks(dateStr);
            if (showBoardTasks) fetchBoardTasks(dateStr);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id: string) => {
        showAlert(
            'Delete Task?',
            'Are you sure you want to delete this task? This will remove all history for this repeating task.',
            async () => {
                await deletePersonalTask(id);
                fetchPersonalTasks(dateStr);
                if (showBoardTasks) fetchBoardTasks(dateStr);
            },
            'destructive'
        );
    };

    const toggleDay = (day: number) => {
        setSelectedDays(prev =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    };

    // Filter tasks that match the selected day of week
    const relevantTasks = personalTasks.filter(task => {
        if (!task.daysOfWeek) return true;
        return task.daysOfWeek.split(',').map(Number).includes(dayOfWeek);
    });

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative pb-20">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/40 dark:bg-black/20 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl overflow-hidden relative group">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors duration-1000" />
                <div className="flex items-center gap-5 relative z-10">
                    <div className="bg-primary shadow-lg shadow-primary/20 p-4 rounded-2xl transform transition-transform hover:scale-110">
                        <CalendarIcon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">Personal Calendar</h1>
                        <p className="text-muted-foreground mt-1 font-medium">Elevate your daily productivity.</p>
                    </div>
                </div>
                <Button onClick={openCreateDialog} size="lg" className="gap-2 shadow-xl shadow-primary/20 transition-all hover:-translate-y-1 active:scale-95 font-bold rounded-2xl relative z-10">
                    <Plus className="w-5 h-5" />
                    Create New Task
                </Button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Date Controls */}
                <div className="lg:col-span-1 space-y-4">
                    <Card className="border-white/20 bg-white/30 dark:bg-black/30 backdrop-blur-md rounded-3xl overflow-hidden shadow-xl">
                        <CardHeader className="pb-2">
                            <h3 className="text-lg font-bold">Select Date</h3>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <Button variant="outline" size="icon" onClick={handlePrevDay} className="rounded-xl hover:bg-primary hover:text-white transition-colors">
                                    <ChevronLeft className="w-5 h-5" />
                                </Button>
                                <div
                                    className="text-center cursor-pointer group relative"
                                    onClick={() => datePickerRef.current?.showPicker?.()}
                                    title="Click to select date"
                                >
                                    <div className="absolute inset-0 bg-primary/5 rounded-2xl scale-125 opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
                                    <p className="text-sm font-bold text-primary uppercase tracking-widest">{format(selectedDate, 'MMM')}</p>
                                    <h4 className="text-4xl font-black group-hover:text-primary transition-colors">{selectedDate.getDate()}</h4>
                                    <p className="text-xs font-medium text-muted-foreground">{format(selectedDate, 'EEEE')}</p>

                                    <input
                                        ref={datePickerRef}
                                        type="date"
                                        className="absolute inset-0 w-0 h-0 opacity-0 pointer-events-none"
                                        value={dateStr}
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                const d = new Date(e.target.value);
                                                setSelectedDate(d);
                                                if (showBoardTasks) fetchBoardTasks(e.target.value);
                                            }
                                        }}
                                        style={{ colorScheme: 'dark' }}
                                    />
                                </div>
                                <Button variant="outline" size="icon" onClick={handleNextDay} className="rounded-xl hover:bg-primary hover:text-white transition-colors">
                                    <ChevronRight className="w-5 h-5" />
                                </Button>
                            </div>
                            <Button variant="secondary" className="w-full rounded-xl gap-2 font-bold" onClick={handleToday}>
                                <RotateCcw className="w-4 h-4" />
                                Jump to Today
                            </Button>
                        </CardContent>
                    </Card>

                    <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10">
                        <h4 className="text-sm font-bold uppercase tracking-widest text-primary mb-3">Insights</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Date</span>
                                <span className="text-sm font-bold">{formatDate(selectedDate)}</span>
                            </div>
                            {(() => {
                                const boardDisplayTasksCount = showBoardTasks ? boardTasks.length : 0;
                                const totalCount = relevantTasks.length + boardDisplayTasksCount;
                                const completedCount = relevantTasks.filter(t => t.completed).length + (showBoardTasks ? boardTasks.filter(t => t.completed).length : 0);

                                return (
                                    <>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Total for today</span>
                                            <span className="text-sm font-bold">{totalCount}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Completed</span>
                                            <span className="text-sm font-bold text-green-500">{completedCount}</span>
                                        </div>
                                    </>
                                );
                            })()}
                            <div className="pt-4 border-t border-primary/10 mt-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`w-full justify-between px-2 h-9 rounded-lg transition-all ${showBoardTasks ? 'bg-primary/10 text-primary' : 'hover:bg-primary/5 text-muted-foreground'}`}
                                    onClick={() => setShowBoardTasks(!showBoardTasks)}
                                >
                                    <div className="flex items-center gap-2">
                                        {showBoardTasks ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                                        <span className="text-xs font-bold uppercase tracking-wider">Show Board Tasks</span>
                                    </div>
                                    <Badge variant="outline" className="h-5 px-1.5 min-w-[1.25rem] flex items-center justify-center text-[10px] border-primary/20">
                                        {boardTasks.length}
                                    </Badge>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tasks List */}
                <div className="lg:col-span-2 space-y-4">
                    {(() => {
                        const boardDisplayTasks = showBoardTasks ? boardTasks.map(bt => {
                            let d: Date | null = null;
                            if (bt.dueDate) {
                                const parsed = new Date(bt.dueDate);
                                if (isValid(parsed)) {
                                    // If year is < 1980, it's likely a seconds-based timestamp from SQLite
                                    d = parsed.getFullYear() < 1980 ? new Date(parsed.getTime() * 1000) : parsed;
                                }
                            }

                            // Show time if it exists
                            const formattedDueTime = (d && isValid(d)) ? format(d, 'HH:mm') : null;

                            return {
                                ...bt,
                                title: bt.content,
                                description: bt.description,
                                dueTime: formattedDueTime,
                                completed: bt.completed,
                                boardId: bt.boardId,
                                isBoardTask: true
                            };
                        }) : [];

                        // 1. Sort ALL tasks strictly by dueTime (HH:mm)
                        const allDisplayTasks = [
                            ...relevantTasks.map(t => ({ ...t, isBoardTask: false })),
                            ...boardDisplayTasks
                        ].sort((a, b) => {
                            const timeA = a.dueTime || '99:99';
                            const timeB = b.dueTime || '99:99';
                            return timeA.localeCompare(timeB);
                        });

                        const isToday = dateStr === format(currentTime, 'yyyy-MM-dd');
                        const nowStr = format(currentTime, 'HH:mm');

                        const renderTimeIndicator = (key: string) => (
                            <motion.div
                                key={key}
                                layoutId="time-indicator"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="relative py-2 flex items-center gap-4 z-20"
                            >
                                <div className="shrink-0 bg-primary/20 text-primary text-[10px] font-black px-2 py-0.5 rounded-md border border-primary/20 backdrop-blur-sm shadow-sm">
                                    {format(currentTime, 'HH:mm')}
                                </div>
                                <div className="flex-1 h-px bg-gradient-to-r from-primary/50 via-primary/20 to-transparent relative">
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                                </div>
                            </motion.div>
                        );

                        if (allDisplayTasks.length === 0) {
                            return (
                                <div className="space-y-4 w-full">
                                    {isToday && renderTimeIndicator('empty-indicator')}
                                    <div className="text-center py-24 bg-white/10 dark:bg-black/10 backdrop-blur-sm rounded-[2rem] border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-6 shadow-inner">
                                        <div className="bg-primary/5 p-8 rounded-full border border-primary/10 animate-pulse">
                                            <CheckCircle2 className="w-12 h-12 text-primary opacity-30" />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">Clear Schedule</h3>
                                            <p className="text-muted-foreground max-w-xs mx-auto">You have no tasks scheduled for this day. Perfect time to start something new!</p>
                                        </div>
                                        <Button variant="outline" size="lg" onClick={openCreateDialog} className="mt-4 rounded-2xl border-primary/20 hover:bg-primary hover:text-white transition-all font-bold">
                                            <Plus className="w-5 h-5 mr-2" />
                                            Schedule a Task
                                        </Button>
                                    </div>
                                </div>
                            );
                        }

                        let indicatorRendered = false;

                        return (
                            <div className="grid gap-4 w-full relative">
                                <AnimatePresence mode="popLayout">
                                    {allDisplayTasks.flatMap((task, index) => {
                                        const taskTime = task.dueTime || '99:99';
                                        const nextTask = allDisplayTasks[index + 1];
                                        const nextTaskTime = nextTask?.dueTime || '99:99';
                                        const elements = [];

                                        if (!indicatorRendered && isToday && index === 0 && taskTime > nowStr) {
                                            elements.push(renderTimeIndicator('indicator-start'));
                                            indicatorRendered = true;
                                        }

                                        elements.push(
                                            <motion.div
                                                key={task.id}
                                                layout
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className={`group relative flex flex-col gap-0 rounded-[1.5rem] border transition-all duration-300 overflow-hidden ${task.completed ? 'bg-white/5 border-transparent opacity-60 grayscale-[0.5]' : 'bg-white/60 dark:bg-black/40 border-white/20 hover:border-primary/50 shadow-lg hover:shadow-xl'}`}
                                            >

                                                {(task as any).imageUrl && (
                                                    <div className="w-full h-32 overflow-hidden bg-black/5">
                                                        <img
                                                            src={(task as any).imageUrl.startsWith('http') ? (task as any).imageUrl : `${API_URL}/uploads/${(task as any).imageUrl}`}
                                                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                                        />
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-6 p-6">
                                                    <button
                                                        onClick={() => {
                                                            if (task.isBoardTask) {
                                                                toggleCardCompletion(task.id, !task.completed);
                                                            } else {
                                                                togglePersonalTask(task.id, dateStr);
                                                            }
                                                        }}
                                                        className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90 border-2 ${task.completed ? 'bg-primary border-primary text-white' : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-transparent hover:border-primary'}`}
                                                    >
                                                        <CheckCircle2 className={`w-5 h-5 ${task.completed ? 'opacity-100' : 'opacity-0'}`} />
                                                    </button>

                                                    <div className="flex-1 min-w-0" onClick={() => {
                                                        if (task.isBoardTask) {
                                                            toggleCardCompletion(task.id, !task.completed);
                                                        } else {
                                                            togglePersonalTask(task.id, dateStr);
                                                        }
                                                    }}>
                                                        <div className="flex items-center gap-3">
                                                            <h3 className={`text-xl font-bold truncate transition-all ${task.completed ? 'line-through text-muted-foreground' : 'text-zinc-900 dark:text-white'}`}>
                                                                {task.title}
                                                            </h3>
                                                            {task.isBoardTask && (
                                                                <Badge variant="outline" className="text-[10px] uppercase font-black tracking-tighter border-primary/30 text-primary">
                                                                    Board Task
                                                                </Badge>
                                                            )}
                                                            {task.dueTime && (
                                                                <Badge variant="secondary" className="gap-1.5 px-2 py-0.5 rounded-lg bg-primary/10 text-primary border-none text-xs font-bold whitespace-nowrap">
                                                                    <Clock className="w-3.5 h-3.5" />
                                                                    {formatTime(task.dueTime)}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        {(task as any).location && (
                                                            <div className="flex items-center gap-1.5 mt-1 text-primary">
                                                                <MapPin className="w-3.5 h-3.5" />
                                                                <span className="text-xs font-bold truncate">{(task as any).location}</span>
                                                            </div>
                                                        )}
                                                        {task.description && (
                                                            <p className={`text-sm mt-1.5 line-clamp-2 leading-relaxed ${task.completed ? 'text-muted-foreground/60' : 'text-muted-foreground'}`}>
                                                                {task.description}
                                                            </p>
                                                        )}
                                                        {!task.isBoardTask && (task as any).daysOfWeek && (
                                                            <div className="flex gap-1.5 mt-4">
                                                                {(task as any).daysOfWeek?.split(',').map((d: string) => (
                                                                    <span key={d} className={`text-[10px] px-2 py-0.5 rounded-md font-black tracking-widest uppercase transition-colors ${Number(d) === dayOfWeek ? 'bg-primary text-white' : 'bg-black/5 dark:bg-white/5 text-muted-foreground/40'}`}>
                                                                        {DAYS[Number(d)].substring(0, 3)}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                        {!task.isBoardTask && !(task as any).daysOfWeek && (
                                                            <div className="flex gap-1.5 mt-4">
                                                                <span className="text-[10px] px-2 py-0.5 rounded-md font-black tracking-widest uppercase bg-zinc-100 dark:bg-zinc-800 text-muted-foreground">
                                                                    One-time
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                        {task.isBoardTask && (task as any).boardId && (
                                                            <Button
                                                                variant="secondary"
                                                                size="icon"
                                                                className="h-10 w-10 rounded-xl bg-white dark:bg-zinc-800 shadow-sm border border-white/20"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    window.history.pushState({}, '', `/boards/${(task as any).boardId}`);
                                                                    window.dispatchEvent(new Event('popstate'));
                                                                }}
                                                                title="Go to Board"
                                                            >
                                                                <ExternalLink className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                        {!task.isBoardTask && (
                                                            <>
                                                                <Button variant="secondary" size="icon" className="h-10 w-10 rounded-xl bg-white dark:bg-zinc-800 shadow-sm border border-white/20" onClick={(e) => { e.stopPropagation(); openEditDialog(task as any); }}>
                                                                    <Edit2 className="w-4 h-4" />
                                                                </Button>
                                                                <Button variant="destructive" size="icon" className="h-10 w-10 rounded-xl shadow-lg shadow-destructive/20" onClick={(e) => { e.stopPropagation(); handleDelete(task.id); }}>
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );

                                        if (!indicatorRendered && isToday && taskTime <= nowStr && nextTaskTime > nowStr) {
                                            elements.push(renderTimeIndicator('indicator-mid'));
                                            indicatorRendered = true;
                                        }

                                        return elements;
                                    })}
                                    {!indicatorRendered && isToday && renderTimeIndicator('indicator-end')}
                                </AnimatePresence>
                            </div>
                        );
                    })()}
                </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[600px] rounded-[2rem] border-white/20 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black">{editingTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-6 py-4">
                        <div className="space-y-3">
                            <Label htmlFor="title" className="text-sm font-bold uppercase tracking-widest opacity-70">Task Title</Label>
                            <Input
                                id="title"
                                placeholder="e.g., Morning Yoga"
                                className="h-14 rounded-2xl bg-black/5 dark:bg-white/5 border-none text-lg font-medium focus-visible:ring-primary"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                autoFocus
                            />
                        </div>
                        <div className="space-y-3">
                            <Label htmlFor="description" className="text-sm font-bold uppercase tracking-widest opacity-70">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Any extra details?"
                                className="rounded-2xl bg-black/5 dark:bg-white/5 border-none resize-none focus-visible:ring-primary"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label htmlFor="dueTime" className="text-sm font-bold uppercase tracking-widest opacity-70 flex justify-between">
                                    <span>Due Time</span>
                                    <span className="text-[10px] text-primary">({'24h'} display)</span>
                                </Label>
                                <TimeInput
                                    value={dueTime}
                                    onChange={setDueTime}
                                    className="h-14 rounded-2xl bg-black/5 dark:bg-white/5 border-none font-bold focus-visible:ring-primary"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label htmlFor="location" className="text-sm font-bold uppercase tracking-widest opacity-70">Location</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input
                                        id="location"
                                        placeholder="Add a location"
                                        className="h-14 pl-12 rounded-2xl bg-black/5 dark:bg-white/5 border-none font-medium focus-visible:ring-primary"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-sm font-bold uppercase tracking-widest opacity-70">Image</Label>
                            <div className="flex gap-4">
                                {imageUrl ? (
                                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden group">
                                        <img src={imageUrl.startsWith('http') ? imageUrl : `${API_URL}/uploads/${imageUrl}`} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <Button type="button" variant="secondary" size="sm" onClick={() => setIsGalleryOpen(true)}>Change</Button>
                                            <Button type="button" variant="destructive" size="sm" onClick={() => setImageUrl('')}>Remove</Button>
                                        </div>
                                    </div>
                                ) : (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full h-32 rounded-2xl border-dashed border-2 hover:bg-primary/5 hover:border-primary/50 transition-all flex flex-col gap-2"
                                        onClick={() => {
                                            fetchUserImages();
                                            setIsGalleryOpen(true);
                                        }}
                                    >
                                        <ImageIcon className="w-8 h-8 text-muted-foreground" />
                                        <span className="text-xs font-bold uppercase tracking-widest opacity-60">Add Task Image</span>
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-bold uppercase tracking-widest opacity-70">Occurrence</Label>
                                <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl">
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        className={`h-8 px-4 rounded-lg text-[10px] font-black uppercase transition-all ${!isRepeating ? 'bg-white dark:bg-zinc-800 shadow-sm' : 'opacity-50'}`}
                                        onClick={() => setIsRepeating(false)}
                                    >
                                        One-time
                                    </Button>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        className={`h-8 px-4 rounded-lg text-[10px] font-black uppercase transition-all ${isRepeating ? 'bg-white dark:bg-zinc-800 shadow-sm' : 'opacity-50'}`}
                                        onClick={() => setIsRepeating(true)}
                                    >
                                        Repeating
                                    </Button>
                                </div>
                            </div>

                            {isRepeating ? (
                                <div className="flex flex-wrap gap-2.5">
                                    {DAYS.map((day, index) => (
                                        <Button
                                            key={day}
                                            type="button"
                                            variant={selectedDays.includes(index) ? 'default' : 'secondary'}
                                            size="sm"
                                            className={`h-11 px-4 rounded-xl text-xs font-black transition-all ${selectedDays.includes(index) ? 'bg-primary shadow-lg shadow-primary/30 ring-2 ring-primary ring-offset-2' : 'bg-black/5 dark:bg-white/5 hover:bg-black/10'}`}
                                            onClick={() => toggleDay(index)}
                                        >
                                            {day.substring(0, 3).toUpperCase()}
                                        </Button>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center gap-3">
                                    <CalendarIcon className="w-5 h-5 text-primary" />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center">
                                            <p className="text-xs font-black uppercase tracking-widest text-primary">Scheduled for</p>
                                            <span className="text-[10px] text-primary">({'MMMM d, yyyy'} display)</span>
                                        </div>
                                        <p className="text-sm font-bold">{formatDate(selectedDate)}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <DialogFooter className="pt-6 gap-3 sm:gap-0">
                            <Button type="button" variant="ghost" className="h-12 px-8 rounded-xl font-bold" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" className="h-12 px-8 rounded-xl font-black shadow-lg shadow-primary/20">{editingTask ? 'Update Task' : 'Create Task'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
                <DialogContent className="sm:max-w-[700px] rounded-[2rem] border-white/20 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black">Select Image</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            <label className="aspect-video rounded-xl border-2 border-dashed border-white/20 hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer group">
                                <GoUpload className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Upload New</span>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={async (e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            const file = e.target.files[0];
                                            const uploaded = await uploadImage(file);
                                            if (uploaded) {
                                                setImageUrl(uploaded.filename);
                                                setIsGalleryOpen(false);
                                            }
                                        }
                                    }}
                                />
                            </label>
                            {userImages.filter(img => img.originalName !== 'avatar.jpg').map(img => (
                                <div
                                    key={img.id}
                                    className="aspect-video rounded-xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary transition-all relative group"
                                    onClick={() => {
                                        setImageUrl(img.filename);
                                        setIsGalleryOpen(false);
                                    }}
                                >
                                    <img src={`${API_URL}/uploads/${img.filename}`} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <CheckCircle2 className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsGalleryOpen(false)}>Cancel</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog
                open={alertConfig.open}
                onClose={() => setAlertConfig(prev => ({ ...prev, open: false }))}
                title={alertConfig.title}
                description={alertConfig.description}
                onConfirm={alertConfig.onConfirm}
                variant={alertConfig.variant}
            />
        </div>
    );
}

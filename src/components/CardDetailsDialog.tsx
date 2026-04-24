import React, { useState, useEffect, useRef } from 'react';
import { useStore, type Card, type Label as StoreLabel } from '../store';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { stringToColor } from "../utils/colors";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GoLocation, GoClock, GoTrash, GoSearch, GoX, GoTag, GoPlus, GoUpload } from "react-icons/go";
import ReactMarkdown from 'react-markdown';
import { DateInput } from "./ui/date-input";
import { TimeInput } from "./ui/time-input";
import { CheckCircle2 } from 'lucide-react';

// Fix for leaflet default marker icon
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const DEFAULT_CENTER: [number, number] = [47.4979, 19.0402]; // Budapest

interface CardDetailsDialogProps {
    card: Card | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function LocationMarker({ position, setPosition }: { position: [number, number] | null, setPosition: (pos: [number, number]) => void }) {
    const map = useMap();
    
    useMapEvents({
        click(e) {
            setPosition([e.latlng.lat, e.latlng.lng]);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    useEffect(() => {
        if (position) {
            map.flyTo(position, map.getZoom());
        }
    }, [position, map]);

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
}

export function CardDetailsDialog({ card, open, onOpenChange }: CardDetailsDialogProps) {
    const updateCard = useStore(state => state.updateCard);
    const deleteCard = useStore(state => state.deleteCard);
    const uploadImage = useStore(state => state.uploadImage);
    const activeProjectId = useStore(state => state.activeProjectId);
    const fetchProjectLabels = useStore(state => state.fetchProjectLabels);
    const createProjectLabel = useStore(state => state.createProjectLabel);
    const assignLabelToCard = useStore(state => state.assignLabelToCard);
    const removeLabelFromCard = useStore(state => state.removeLabelFromCard);
    const assignMemberToCard = useStore(state => state.assignMemberToCard);
    const removeMemberFromCard = useStore(state => state.removeMemberFromCard);
    const projects = useStore(state => state.projects);
    const userImages = useStore(state => state.userImages);
    const fetchUserImages = useStore(state => state.fetchUserImages);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    
    // Member state
    const project = projects.find(p => p.id === activeProjectId);
    const projectMembers = project?.members || [];
    
    // Label states
    const [projectLabels, setProjectLabels] = useState<StoreLabel[]>([]);
    const [isCreatingLabel, setIsCreatingLabel] = useState(false);
    const [newLabelTitle, setNewLabelTitle] = useState('');
    const [newLabelColor, setNewLabelColor] = useState('#3b82f6');
    
    // Basic fields
    const [content, setContent] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [previewMarkdown, setPreviewMarkdown] = useState(true); // Default to preview
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    
    // Due Date fields
    const [dueDate, setDueDate] = useState<string>('');
    const [dueTime, setDueTime] = useState<string>('');
    const [dueDateMode, setDueDateMode] = useState<'full' | 'date-only' | 'time-only'>('full');
    
    // Location fields
    const [location, setLocation] = useState('');
    const [locationLat, setLocationLat] = useState<number | null>(null);
    const [locationLng, setLocationLng] = useState<number | null>(null);
    
    const [loading, setLoading] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [geocoding, setGeocoding] = useState(false);

    // Auto-resize textarea
    useEffect(() => {
        if (!previewMarkdown && textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [description, previewMarkdown, open]);

    useEffect(() => {
        if (open && activeProjectId) {
            fetchProjectLabels(activeProjectId).then(setProjectLabels);
            // Also ensure project members are fetched/updated
            useStore.getState().fetchProject(activeProjectId);
        }
    }, [open, activeProjectId, fetchProjectLabels]);

    useEffect(() => {
        if (card) {
            setContent(card.content || '');
            setDescription(card.description || '');
            setImageUrl(card.imageUrl || '');
            setLocation(card.location || '');
            setLocationLat(card.locationLat || null);
            setLocationLng(card.locationLng || null);
            setPreviewMarkdown(true);
            
            // Auto show map if location is set
            if (card.locationLat !== null && card.locationLng !== null) {
                setShowMap(true);
            } else {
                setShowMap(false);
            }
            
            const mode = card.dueDateMode || 'full';
            setDueDateMode(mode as any);

            if (card.dueDate) {
                const date = new Date(card.dueDate);
                const yyyy = date.getFullYear();
                const mm = String(date.getMonth() + 1).padStart(2, '0');
                const dd = String(date.getDate()).padStart(2, '0');
                setDueDate(`${yyyy}-${mm}-${dd}`);
                
                const hh = String(date.getHours()).padStart(2, '0');
                const min = String(date.getMinutes()).padStart(2, '0');
                setDueTime(`${hh}:${min}`);
            } else {
                setDueDate('');
                setDueTime('');
            }
        }
    }, [card]);

    const handleSave = async () => {
        if (!card) return;
        setLoading(true);
        
        try {
            let finalDueDate: Date | null = null;
            
            if (dueDate || dueTime) {
                if (dueDateMode === 'date-only' && dueDate) {
                    const [y, m, d] = dueDate.split('-').map(Number);
                    finalDueDate = new Date(y, m - 1, d);
                } else if (dueDateMode === 'time-only' && dueTime) {
                    const now = new Date();
                    const [hh, mm] = dueTime.split(':').map(Number);
                    finalDueDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm);
                } else if (dueDateMode === 'full' && dueDate && dueTime) {
                    const [y, m, d] = dueDate.split('-').map(Number);
                    const [hh, mm] = dueTime.split(':').map(Number);
                    finalDueDate = new Date(y, m - 1, d, hh, mm);
                }
            }

            await updateCard(card.id, {
                content,
                description,
                dueDate: finalDueDate,
                dueDateMode,
                imageUrl: imageUrl || null,
                location: location || null,
                locationLat,
                locationLng
            });
            onOpenChange(false);
        } catch (error) {
            console.error('Failed to update card:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            // Only save if NOT in a textarea or if shift is not pressed
            if ((e.target as HTMLElement).tagName === 'TEXTAREA') return;
            e.preventDefault();
            handleSave();
        }
    };

    const handleDelete = async () => {
        if (!card) return;
        if (confirm('Are you sure you want to delete this card?')) {
            setLoading(true);
            try {
                await deleteCard(card.id);
                onOpenChange(false);
            } catch (error) {
                console.error('Failed to delete card:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            const uploaded = await uploadImage(file);
            if (uploaded) {
                setImageUrl(uploaded.filename);
            }
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const uploaded = await uploadImage(file);
            if (uploaded) {
                setImageUrl(uploaded.filename);
            }
        }
    };

    const handleGeocode = async () => {
        if (!location.trim()) {
            setLocationLat(null);
            setLocationLng(null);
            return;
        }
        setGeocoding(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`);
            const data = await response.json();
            if (data && data.length > 0) {
                const first = data[0];
                setLocationLat(parseFloat(first.lat));
                setLocationLng(parseFloat(first.lon));
                setShowMap(true);
            }
        } catch (e) {
            console.error('Geocoding error:', e);
        } finally {
            setGeocoding(false);
        }
    };

    const clearLocation = () => {
        setLocation('');
        setLocationLat(null);
        setLocationLng(null);
    };

    const clearDueDate = () => {
        setDueDate('');
        setDueTime('');
    };

    if (!card) return null;

    const mapPosition: [number, number] = (locationLat !== null && locationLng !== null) 
        ? [locationLat, locationLng] 
        : DEFAULT_CENTER;

    const displayImageUrl = imageUrl 
        ? (imageUrl.startsWith('http') ? imageUrl : `${API_URL}/uploads/${imageUrl}`)
        : null;

    return (
        <>
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent 
                className="w-[95vw] sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-2xl sm:rounded-3xl"
                onKeyDown={handleKeyDown}
                aria-describedby={undefined}
            >
                <DialogHeader>
                    <DialogTitle className="text-xl sm:text-2xl font-black">Card Details</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 sm:gap-6 py-4">
                    {/* Basic Info */}
                    <div className="grid gap-2">
                        <Label htmlFor="content" className="text-xs font-bold uppercase tracking-wider opacity-60 ml-1">Title</Label>
                        <Input id="content" value={content} onChange={(e) => setContent(e.target.value)} className="h-11 sm:h-10 text-base sm:text-sm bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:ring-primary" />
                    </div>
                    
                    {/* Labels & Members Section */}
                    {activeProjectId && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                            <div className="space-y-3">
                                <Label className="ml-1 text-xs font-bold uppercase tracking-wider opacity-60">Labels</Label>
                                <div className="flex flex-wrap items-center gap-2 p-2 bg-zinc-50/50 dark:bg-white/5 rounded-xl border border-zinc-200 dark:border-white/10 min-h-[48px]">
                                    {card.labels?.map(label => (
                                        <div 
                                            key={label.id} 
                                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md text-white shadow-sm"
                                            style={{ backgroundColor: label.color }}
                                        >
                                            <GoTag className="w-3 h-3 opacity-80" />
                                            {label.title}
                                            <button 
                                                onClick={() => removeLabelFromCard(card.id, label.id)}
                                                className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                                            >
                                                <GoX className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}

                                    <Select 
                                        value="" 
                                        onValueChange={(val) => {
                                            if (val === 'create_new') {
                                                setIsCreatingLabel(true);
                                            } else {
                                                const lbl = projectLabels.find(l => l.id === val);
                                                if (lbl && !card.labels?.find(l => l.id === lbl.id)) {
                                                    assignLabelToCard(card.id, lbl);
                                                }
                                            }
                                        }}
                                    >
                                        <SelectTrigger className="w-auto h-8 px-3 text-xs bg-white dark:bg-zinc-800 border-dashed hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">
                                            <div className="flex items-center gap-1.5 min-w-[80px] justify-center"><GoPlus /> Add Label</div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {projectLabels.filter(pl => !card.labels?.find(cl => cl.id === pl.id)).map(label => (
                                                <SelectItem key={label.id} value={label.id}>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: label.color }} />
                                                        {label.title}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                            {projectLabels.length === 0 && (
                                                <div className="px-2 py-1.5 text-xs text-zinc-500 italic">No project labels found</div>
                                            )}
                                            <SelectItem value="create_new" className="text-blue-500 font-medium border-t mt-1">
                                                + Create New Label
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="ml-1 text-xs font-bold uppercase tracking-wider opacity-60">Members</Label>
                                <div className="flex flex-wrap items-center gap-2 p-2 bg-zinc-50/50 dark:bg-white/5 rounded-xl border border-zinc-200 dark:border-white/10 min-h-[48px]">
                                    {card.members?.map(member => (
                                        <div 
                                            key={member.id} 
                                            className="flex items-center gap-2 bg-white dark:bg-zinc-800 rounded-full pl-1 pr-2 py-1 border border-zinc-200 dark:border-zinc-700 shadow-sm"
                                            title={member.name || member.email}
                                        >
                                            <Avatar className="h-5 w-5">
                                                {member.avatarUrl && (
                                                    <AvatarImage src={`${API_URL}/uploads/${member.avatarUrl}`} crossOrigin="anonymous" />
                                                )}
                                                <AvatarFallback style={{ backgroundColor: stringToColor(member.name || member.email) }} className="text-[8px] text-white">
                                                    {(member.name || member.email)[0].toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <button 
                                                onClick={() => removeMemberFromCard(card.id, member.id)}
                                                className="hover:text-red-500 transition-colors"
                                            >
                                                <GoX className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}

                                    <Select 
                                        value="" 
                                        onValueChange={(val) => {
                                            const member = projectMembers.find(m => m.id === val);
                                            if (member && !card.members?.find(m => m.id === val)) {
                                                assignMemberToCard(card.id, {
                                                    id: member.id,
                                                    name: member.name || '',
                                                    email: member.email,
                                                    avatarUrl: member.avatarUrl
                                                });
                                            }
                                        }}
                                    >
                                        <SelectTrigger className="w-auto h-8 px-3 text-xs bg-white dark:bg-zinc-800 border-dashed hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">
                                            <div className="flex items-center gap-1.5 min-w-[80px] justify-center"><GoPlus /> Add Member</div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {projectMembers.filter(pm => !card.members?.find(cm => cm.id === pm.id)).map(member => (
                                                <SelectItem key={member.id} value={member.id}>
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-4 w-4">
                                                            {member.avatarUrl && (
                                                                <AvatarImage src={`${API_URL}/uploads/${member.avatarUrl}`} crossOrigin="anonymous" />
                                                            )}
                                                            <AvatarFallback style={{ backgroundColor: stringToColor(member.name || member.email) }} className="text-[6px] text-white">
                                                                {(member.name || member.email)[0].toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-xs">{member.name || member.email}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                            {projectMembers.length === 0 && (
                                                <div className="px-2 py-1.5 text-xs text-zinc-500 italic">No members found</div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Create Label Inline Form */}
                            {isCreatingLabel && (
                                <div className="sm:col-span-2 mt-2 p-3 border rounded-xl bg-zinc-50 dark:bg-zinc-950 flex flex-col gap-3 shadow-inner">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-bold uppercase tracking-widest opacity-60">Create Project Label</h4>
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsCreatingLabel(false)}>
                                            <GoX className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
                                        <div className="flex-1 space-y-1.5">
                                            <Label className="text-xs ml-1">Title</Label>
                                            <Input 
                                                value={newLabelTitle} 
                                                onChange={e => setNewLabelTitle(e.target.value)} 
                                                className="h-10 text-base sm:text-sm bg-white dark:bg-zinc-900"
                                                placeholder="e.g. Bug, Feature"
                                                autoFocus
                                            />
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="space-y-1.5 shrink-0">
                                                <Label className="text-xs ml-1">Color</Label>
                                                <div className="flex items-center gap-1">
                                                    <input 
                                                        type="color" 
                                                        value={newLabelColor} 
                                                        onChange={e => setNewLabelColor(e.target.value)}
                                                        className="w-10 h-10 p-1 border-2 border-white/10 rounded-xl cursor-pointer bg-white dark:bg-zinc-900"
                                                    />
                                                </div>
                                            </div>
                                            <Button 
                                                className="h-10 flex-1 sm:flex-none mt-auto"
                                                disabled={!newLabelTitle.trim()}
                                                onClick={async () => {
                                                    if (!activeProjectId || !newLabelTitle.trim()) return;
                                                    const lbl = await createProjectLabel(activeProjectId, newLabelTitle.trim(), newLabelColor);
                                                    if (lbl) {
                                                        setProjectLabels(prev => [...prev, lbl]);
                                                        assignLabelToCard(card.id, lbl);
                                                        setIsCreatingLabel(false);
                                                        setNewLabelTitle('');
                                                    }
                                                }}
                                            >
                                                Create
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    
                    <div className="grid gap-2">
                        <div className="flex justify-between items-center mb-1">
                            <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider opacity-60 ml-1">Description</Label>
                            <Button variant="ghost" size="sm" onClick={() => setPreviewMarkdown(!previewMarkdown)} className="h-7 text-xs font-bold uppercase tracking-widest text-primary">
                                {previewMarkdown ? "Edit" : "Preview"}
                            </Button>
                        </div>
                        <div className="relative w-full">
                            {previewMarkdown ? (
                                <div className="min-h-[120px] p-3 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900 prose prose-sm dark:prose-invert max-w-none shadow-inner">
                                    <ReactMarkdown>{description || '_No description provided._'}</ReactMarkdown>
                                </div>
                            ) : (
                                <Textarea
                                    ref={textareaRef}
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Add a more detailed description..."
                                    className="min-h-[120px] resize-none overflow-hidden text-base sm:text-sm bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-primary"
                                />
                            )}
                        </div>
                    </div>

                    {/* Image Section - Drag & Drop */}
                    <div className="grid gap-2">
                        <Label className="text-xs font-bold uppercase tracking-wider opacity-60 ml-1">Cover Image</Label>
                        <div 
                            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                            onDragLeave={() => setDragging(false)}
                            onDrop={handleDrop}
                            className={`
                                relative rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 min-h-[200px] py-6
                                ${dragging ? "border-primary bg-primary/5" : "border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900/50 shadow-inner"}
                            `}
                        >
                            {displayImageUrl ? (
                                <div className="w-full h-full min-h-[160px] relative rounded-xl overflow-hidden">
                                    <img src={displayImageUrl} alt="Cover" className="w-full h-full object-cover" />
                                    <div className="absolute top-2 right-2 flex gap-2">
                                        <Button size="icon" variant="destructive" onClick={() => setImageUrl('')} className="rounded-full h-9 w-9 shadow-lg">
                                            <GoTrash className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="p-4 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-500 mb-1">
                                        <GoUpload className="w-6 h-6" />
                                    </div>
                                    <div className="text-center px-4">
                                        <p className="text-sm font-bold uppercase tracking-tight">Drop Image Here</p>
                                        <p className="text-xs text-zinc-500 mb-4 opacity-60">Max size: 5MB</p>
                                        <div className="flex flex-col sm:flex-row gap-2 items-center justify-center">
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                size="sm"
                                                className="h-10 w-full sm:w-auto rounded-xl font-bold uppercase tracking-widest text-[10px] px-6"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    document.getElementById('cover-image-upload')?.click();
                                                }}
                                            >
                                                Upload File
                                            </Button>
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                size="sm"
                                                className="h-10 w-full sm:w-auto rounded-xl font-bold uppercase tracking-widest text-[10px] px-6"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    fetchUserImages();
                                                    setIsGalleryOpen(true);
                                                }}
                                            >
                                                Open Gallery
                                            </Button>
                                        </div>
                                    </div>
                                    <input 
                                        id="cover-image-upload"
                                        type="file" 
                                        accept="image/*" 
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                </>
                            )}
                        </div>
                    </div>

                    {/* Due Date Section */}
                    <div className="grid gap-4 p-4 border rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 shadow-inner border-zinc-200 dark:border-white/10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest opacity-60">
                                <GoClock className="w-4 h-4" /> Due Date
                            </div>
                            {(dueDate || dueTime) && (
                                <Button variant="ghost" size="sm" onClick={clearDueDate} className="h-7 px-2 text-[10px] font-black uppercase text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 gap-1">
                                    <GoX className="w-3.5 h-3.5" /> Clear
                                </Button>
                            )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label className="text-[10px] font-bold uppercase tracking-wider opacity-40 ml-1">Mode</Label>
                                <Select value={dueDateMode} onValueChange={(v: any) => setDueDateMode(v)}>
                                    <SelectTrigger className="h-10 sm:h-9 bg-white dark:bg-zinc-900 rounded-xl">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="full">Date & Time</SelectItem>
                                        <SelectItem value="date-only">Date Only</SelectItem>
                                        <SelectItem value="time-only">Time (Today)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:col-span-1">
                                {(dueDateMode === 'full' || dueDateMode === 'date-only') && (
                                    <div className="grid gap-2 flex-1">
                                        <Label className="text-[10px] font-bold uppercase tracking-wider opacity-40 ml-1">Date</Label>
                                        <DateInput value={dueDate} onChange={setDueDate} />
                                    </div>
                                )}
                                
                                {(dueDateMode === 'full' || dueDateMode === 'time-only') && (
                                    <div className="grid gap-2 flex-1">
                                        <Label className="text-[10px] font-bold uppercase tracking-wider opacity-40 ml-1">Time</Label>
                                        <TimeInput value={dueTime} onChange={setDueTime} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Location Section */}
                    <div className="grid gap-4 p-4 border rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 shadow-inner border-zinc-200 dark:border-white/10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest opacity-60">
                                <GoLocation className="w-4 h-4" /> Location
                            </div>
                            <div className="flex items-center gap-1">
                                {location && (
                                    <Button variant="ghost" size="sm" onClick={clearLocation} className="h-7 px-2 text-[10px] font-black uppercase text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 gap-1">
                                        <GoX className="w-3.5 h-3.5" /> Clear
                                    </Button>
                                )}
                                <Button variant="ghost" size="sm" onClick={() => setShowMap(!showMap)} className="h-7 text-[10px] font-black uppercase tracking-widest text-primary">
                                    {showMap ? "Hide Map" : "Map View"}
                                </Button>
                            </div>
                        </div>
                        
                        <div className="grid gap-2">
                            <Label htmlFor="location" className="text-[10px] font-bold uppercase tracking-wider opacity-40 ml-1">Address / Name</Label>
                            <div className="flex gap-2">
                                <Input 
                                    id="location" 
                                    value={location} 
                                    onChange={(e) => setLocation(e.target.value)} 
                                    placeholder="e.g. Budapest, Deák tér"
                                    className="h-10 sm:h-9 text-base sm:text-sm bg-white dark:bg-zinc-900 rounded-xl"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !location.trim()) {
                                            clearLocation();
                                        } else if (e.key === 'Enter') {
                                            handleGeocode();
                                        }
                                    }}
                                    onBlur={handleGeocode}
                                />
                                <Button size="icon" variant="outline" onClick={handleGeocode} disabled={geocoding} title="Locate on map" className="h-10 w-10 sm:h-9 sm:w-9 rounded-xl shrink-0">
                                    <GoSearch className={`w-4 h-4 ${geocoding ? "animate-pulse" : ""}`} />
                                </Button>
                            </div>
                        </div>

                        {showMap && (
                            <div className="grid gap-2 animate-in fade-in duration-300">
                                <div className="h-[200px] sm:h-[250px] rounded-2xl overflow-hidden border border-zinc-200 dark:border-white/10 z-0">
                                    <MapContainer center={mapPosition} zoom={locationLat !== null ? 15 : 12} style={{ height: '100%', width: '100%' }}>
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />
                                        <LocationMarker 
                                            position={locationLat !== null && locationLng !== null ? [locationLat, locationLng] : null} 
                                            setPosition={(pos) => {
                                                setLocationLat(pos[0]);
                                                setLocationLng(pos[1]);
                                            }}
                                        />
                                    </MapContainer>
                                </div>
                                <p className="text-[9px] text-zinc-500 text-center italic opacity-60">Tap map to set precise coordinate</p>
                            </div>
                        )}
                    </div>
                </div>
                <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center mt-2">
                    <Button variant="destructive" onClick={handleDelete} disabled={loading} className="w-full sm:w-auto order-2 sm:order-1 h-11 sm:h-10 rounded-xl font-bold uppercase tracking-widest text-[10px] gap-2">
                        <GoTrash className="w-4 h-4" /> Delete Card
                    </Button>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto order-1 sm:order-2">
                        <Button variant="ghost" onClick={() => onOpenChange(false)} className="h-11 sm:h-10 rounded-xl font-bold uppercase tracking-widest text-[10px]">Cancel</Button>
                        <Button onClick={handleSave} disabled={loading} className="h-11 sm:h-10 rounded-xl font-black uppercase tracking-widest text-[11px] px-8 shadow-lg shadow-primary/20">
                            {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
            <DialogContent aria-describedby={undefined} className="sm:max-w-[700px] rounded-xl border-white/20 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-2xl p-6 sm:p-8">
                <DialogHeader className="mb-4">

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
    </>
    );
}

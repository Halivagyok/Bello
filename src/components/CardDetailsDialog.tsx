import { useState, useEffect, useRef } from 'react';
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
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GoLocation, GoClock, GoTrash, GoEye, GoSearch, GoX, GoTag, GoPlus } from "react-icons/go";
import ReactMarkdown from 'react-markdown';
import { DateInput } from "./ui/date-input";
import { TimeInput } from "./ui/time-input";

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

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    
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
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[95vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Card Details</DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    {/* Basic Info */}
                    <div className="grid gap-2">
                        <Label htmlFor="content">Title</Label>
                        <Input id="content" value={content} onChange={(e) => setContent(e.target.value)} />
                    </div>
                    
                    {/* Labels Section */}
                    {activeProjectId && (
                        <div className="grid gap-2">
                            <Label>Labels</Label>
                            <div className="flex flex-wrap items-center gap-2">
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
                                    <SelectTrigger className="w-auto h-7 px-3 text-xs bg-zinc-100 dark:bg-zinc-800 border-dashed hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
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

                            {/* Create Label Inline Form */}
                            {isCreatingLabel && (
                                <div className="mt-2 p-3 border rounded-md bg-zinc-50 dark:bg-zinc-900/50 flex flex-col gap-3 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-medium">Create Project Label</h4>
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsCreatingLabel(false)}>
                                            <GoX className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <div className="flex gap-2 items-end">
                                        <div className="flex-1 space-y-1.5">
                                            <Label className="text-xs">Title</Label>
                                            <Input 
                                                value={newLabelTitle} 
                                                onChange={e => setNewLabelTitle(e.target.value)} 
                                                className="h-8 text-sm"
                                                placeholder="e.g. Bug, Feature"
                                                autoFocus
                                            />
                                        </div>
                                        <div className="space-y-1.5 shrink-0">
                                            <Label className="text-xs">Color</Label>
                                            <div className="flex items-center gap-1">
                                                <input 
                                                    type="color" 
                                                    value={newLabelColor} 
                                                    onChange={e => setNewLabelColor(e.target.value)}
                                                    className="w-8 h-8 p-0 border-0 rounded cursor-pointer overflow-hidden"
                                                />
                                            </div>
                                        </div>
                                        <Button 
                                            size="sm" 
                                            className="h-8 shrink-0"
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
                            )}
                        </div>
                    )}
                    
                    <div className="grid gap-2">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="description">Description (Markdown Supported)</Label>
                            <Button variant="ghost" size="sm" onClick={() => setPreviewMarkdown(!previewMarkdown)}>
                                {previewMarkdown ? "Edit" : "Preview"}
                            </Button>
                        </div>
                        <div className="relative w-full">
                            {previewMarkdown ? (
                                <div className="min-h-[100px] p-3 rounded-md border bg-zinc-50 dark:bg-zinc-900 prose prose-sm dark:prose-invert max-w-none">
                                    <ReactMarkdown>{description || '_No description provided._'}</ReactMarkdown>
                                </div>
                            ) : (
                                <Textarea
                                    ref={textareaRef}
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Add a more detailed description..."
                                    className="min-h-[100px] resize-none overflow-hidden"
                                />
                            )}
                        </div>
                    </div>

                    {/* Image Section - Drag & Drop */}
                    <div className="grid gap-2">
                        <Label>Cover Image</Label>
                        <div 
                            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                            onDragLeave={() => setDragging(false)}
                            onDrop={handleDrop}
                            className={`
                                relative rounded-lg border-2 border-dashed transition-all overflow-hidden aspect-video flex flex-col items-center justify-center gap-2
                                ${dragging ? "border-primary bg-primary/5" : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50"}
                            `}
                        >
                            {displayImageUrl ? (
                                <>
                                    <img src={displayImageUrl} alt="Cover" className="w-full h-full object-cover" />
                                    <div className="absolute top-2 right-2 flex gap-2">
                                        <Button size="icon" variant="destructive" onClick={() => setImageUrl('')}>
                                            <GoTrash className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="p-4 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-500">
                                        <GoEye className="w-6 h-6" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-medium">Drag & Drop Image</p>
                                        <p className="text-xs text-zinc-500 mb-2">or upload from your device</p>
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                document.getElementById('cover-image-upload')?.click();
                                            }}
                                        >
                                            Choose File
                                        </Button>
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
                    <div className="grid gap-4 p-4 border rounded-lg bg-zinc-50 dark:bg-zinc-900/50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 font-medium text-sm">
                                <GoClock className="w-4 h-4" /> Due Date Configuration
                            </div>
                            {(dueDate || dueTime) && (
                                <Button variant="ghost" size="sm" onClick={clearDueDate} className="h-7 px-2 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 gap-1">
                                    <GoX className="w-3.5 h-3.5" /> Clear
                                </Button>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Mode</Label>
                                <Select value={dueDateMode} onValueChange={(v: any) => setDueDateMode(v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="full">Date & Time</SelectItem>
                                        <SelectItem value="date-only">Date Only</SelectItem>
                                        <SelectItem value="time-only">Time Only (Today)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            {(dueDateMode === 'full' || dueDateMode === 'date-only') && (
                                <div className="grid gap-2">
                                    <Label>Date</Label>
                                    <DateInput value={dueDate} onChange={setDueDate} />
                                </div>
                            )}
                            
                            {(dueDateMode === 'full' || dueDateMode === 'time-only') && (
                                <div className="grid gap-2">
                                    <Label>Time</Label>
                                    <TimeInput value={dueTime} onChange={setDueTime} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Location Section */}
                    <div className="grid gap-4 p-4 border rounded-lg bg-zinc-50 dark:bg-zinc-900/50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 font-medium text-sm">
                                <GoLocation className="w-4 h-4" /> Location
                            </div>
                            <div className="flex items-center gap-2">
                                {location && (
                                    <Button variant="ghost" size="sm" onClick={clearLocation} className="h-7 px-2 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 gap-1">
                                        <GoX className="w-3.5 h-3.5" /> Clear
                                    </Button>
                                )}
                                <Button variant="ghost" size="sm" onClick={() => setShowMap(!showMap)}>
                                    {showMap ? "Hide Map" : "Show Map"}
                                </Button>
                            </div>
                        </div>
                        
                        <div className="grid gap-2">
                            <Label htmlFor="location">Address / Name <span className="text-[10px] text-zinc-400 font-normal ml-1">(Format: City, Street, Number)</span></Label>
                            <div className="flex gap-2">
                                <Input 
                                    id="location" 
                                    value={location} 
                                    onChange={(e) => setLocation(e.target.value)} 
                                    placeholder="e.g. Budapest, Deák Ferenc tér"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !location.trim()) {
                                            clearLocation();
                                        } else if (e.key === 'Enter') {
                                            handleGeocode();
                                        }
                                    }}
                                    onBlur={handleGeocode}
                                />
                                <Button size="icon" variant="outline" onClick={handleGeocode} disabled={geocoding} title="Locate on map">
                                    <GoSearch className={`w-4 h-4 ${geocoding ? "animate-pulse" : ""}`} />
                                </Button>
                            </div>
                        </div>

                        {showMap && (
                            <div className="grid gap-2">
                                <Label>Select on Map</Label>
                                <div className="h-[250px] rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 z-0">
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
                                <p className="text-[10px] text-zinc-500 text-right italic">Click map to adjust location manually</p>
                            </div>
                        )}
                    </div>
                </div>
                <DialogFooter className="flex justify-between items-center">
                    <Button variant="destructive" onClick={handleDelete} disabled={loading} className="gap-2">
                        <GoTrash className="w-4 h-4" /> Delete Card
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

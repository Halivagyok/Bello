import { useEffect, useState } from 'react';
import { useStore } from '../store';
import { Button } from '../components/ui/button';
import { GoTrash, GoUpload, GoCopy, GoCheck } from 'react-icons/go';
import { Card, CardContent } from '../components/ui/card';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function GalleryPage() {
    const userImages = useStore(state => state.userImages);
    const fetchUserImages = useStore(state => state.fetchUserImages);
    const uploadImage = useStore(state => state.uploadImage);
    const deleteImage = useStore(state => state.deleteImage);
    const [dragging, setDragging] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        fetchUserImages();
    }, []);

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        if (e.dataTransfer.files) {
            const files = Array.from(e.dataTransfer.files);
            for (const file of files) {
                if (file.type.startsWith('image/')) {
                    await uploadImage(file);
                }
            }
        }
    };

    const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            for (const file of files) {
                await uploadImage(file);
            }
        }
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Your Gallery</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">Manage your uploaded card cover images.</p>
                </div>
                <div className="flex gap-4">
                    <label className="cursor-pointer">
                        <Button variant="outline" className="gap-2" asChild>
                            <span>
                                <GoUpload className="w-4 h-4" /> Upload
                                <input type="file" className="hidden" multiple accept="image/*" onChange={handleFileInput} />
                            </span>
                        </Button>
                    </label>
                </div>
            </div>

            {/* Drop Zone */}
            <div 
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                className={`
                    mb-8 p-12 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-4 transition-all
                    ${dragging ? "border-primary bg-primary/5 scale-[0.99]" : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"}
                `}
            >
                <div className="p-4 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400">
                    <GoUpload className="w-8 h-8" />
                </div>
                <div className="text-center">
                    <h3 className="text-lg font-semibold">Drag and drop images here</h3>
                    <p className="text-sm text-zinc-500">Only image files are supported.</p>
                </div>
            </div>

            {/* Grid */}
            {userImages.length === 0 ? (
                <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border">
                    <p className="text-zinc-500">You haven't uploaded any images yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {userImages.map((img) => (
                        <Card key={img.id} className="overflow-hidden group border-zinc-200 dark:border-zinc-800">
                            <div className="aspect-video relative overflow-hidden bg-zinc-100 dark:bg-zinc-950">
                                <img 
                                    src={`${API_URL}/uploads/${img.filename}`} 
                                    alt={img.originalName} 
                                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <Button 
                                        size="icon" 
                                        variant="secondary" 
                                        onClick={() => copyToClipboard(img.filename, img.id)}
                                        title="Copy filename for card"
                                    >
                                        {copiedId === img.id ? <GoCheck className="w-4 h-4 text-green-600" /> : <GoCopy className="w-4 h-4" />}
                                    </Button>
                                    <Button 
                                        size="icon" 
                                        variant="destructive" 
                                        onClick={() => deleteImage(img.id)}
                                        title="Delete image"
                                    >
                                        <GoTrash className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                            <CardContent className="p-3">
                                <p className="text-xs font-medium truncate" title={img.originalName}>{img.originalName}</p>
                                <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider">
                                    {(img.size / 1024).toFixed(1)} KB • {img.mimeType.split('/')[1]}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

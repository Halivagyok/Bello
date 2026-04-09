import { useEffect, useState } from 'react';
import { useStore } from '../store';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { GoPerson, GoMail, GoImage, GoCheck, GoTrash, GoCopy, GoUpload, GoLock, GoSync, GoClock, GoCalendar } from 'react-icons/go';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { AvatarCropDialog } from '../components/AvatarCropDialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select";
import { stringToColor } from '../utils/colors';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function UserPage() {
    const user = useStore(state => state.user);
    const updateUser = useStore(state => state.updateUser);
    const changePassword = useStore(state => state.changePassword);
    const userImages = useStore(state => state.userImages);
    const fetchUserImages = useStore(state => state.fetchUserImages);
    const uploadImage = useStore(state => state.uploadImage);
    const deleteImage = useStore(state => state.deleteImage);
    
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>(user?.timeFormat || '24h');
    const [dateFormat, setDateFormat] = useState(user?.dateFormat || 'YYYY-MM-DD');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [avatarLoading, setAvatarLoading] = useState(false);
    const [avatarSuccess, setAvatarSuccess] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Crop state
    const [cropDialogOpen, setCropDialogOpen] = useState(false);
    const [selectedImageForCrop, setSelectedImageForCrop] = useState<string | null>(null);

    // Password change state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    // Clean up preview URL
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    useEffect(() => {
        fetchUserImages();
    }, []);

    // Sync input fields when user data changes (e.g. after login or update)
    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
            setTimeFormat(user.timeFormat || '24h');
            setDateFormat(user.dateFormat || 'YYYY-MM-DD');
        }
    }, [user]);

    const handleSetAvatar = (filename: string) => {
        setSelectedImageForCrop(`${API_URL}/uploads/${filename}`);
        setCropDialogOpen(true);
    };

    const handleCropComplete = async (blob: Blob) => {
        setAvatarLoading(true);
        setAvatarSuccess(false);
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        try {
            // 1. Upload the cropped blob as a new image
            const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
            const uploaded = await uploadImage(file);
            
            if (uploaded) {
                // 2. Set the new image as avatar
                await updateUser({ avatarUrl: uploaded.filename });
                setAvatarSuccess(true);
                setTimeout(() => {
                    setAvatarSuccess(false);
                    setPreviewUrl(null);
                }, 3000);
            } else {
                setPreviewUrl(null);
            }
        } catch (e) {
            console.error('Failed to update avatar:', e);
            setPreviewUrl(null);
        } finally {
            setAvatarLoading(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);
        try {
            await updateUser({ name, email, timeFormat, dateFormat });
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess(false);

        if (newPassword !== confirmPassword) {
            setPasswordError('New passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            setPasswordError('New password must be at least 6 characters');
            return;
        }

        setPasswordLoading(true);
        try {
            const result = await changePassword(currentPassword, newPassword);
            if (result.success) {
                setPasswordSuccess(true);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setTimeout(() => setPasswordSuccess(false), 3000);
            } else {
                setPasswordError(result.error || 'Failed to update password');
            }
        } catch (e) {
            setPasswordError('An unexpected error occurred');
        } finally {
            setPasswordLoading(false);
        }
    };

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
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative p-4 lg:p-8">
            <div className="flex items-center gap-6 mb-8">
                <div className="relative group">
                    <Avatar className="w-20 h-20 shadow-md shrink-0 border-2 border-background">
                        {previewUrl ? (
                            <AvatarImage src={previewUrl} />
                        ) : user?.avatarUrl ? (
                            <AvatarImage src={`${API_URL}/uploads/${user.avatarUrl}`} crossOrigin="anonymous" />
                        ) : null}
                        <AvatarFallback 
                            style={{ backgroundColor: stringToColor(user?.name || user?.email || 'User') }}
                            className="text-3xl text-white font-bold"
                        >
                            {(user?.name || user?.email || 'U')[0].toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-[1px]">
                        <GoSync className="w-6 h-6 text-white" />
                        <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*" 
                            onChange={async (e) => {
                                if (e.target.files && e.target.files[0]) {
                                    const file = e.target.files[0];
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                        setSelectedImageForCrop(event.target?.result as string);
                                        setCropDialogOpen(true);
                                    };
                                    reader.readAsDataURL(file);
                                }
                            }} 
                        />
                    </label>
                    {(avatarLoading || avatarSuccess) && (
                        <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                            {avatarLoading ? (
                                <GoSync className="w-8 h-8 text-white animate-spin" />
                            ) : (
                                <GoCheck className="w-8 h-8 text-green-400" />
                            )}
                        </div>
                    )}
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{user?.name || 'User Profile'}</h1>
                    <p className="text-zinc-500 dark:text-zinc-400">{user?.email}</p>
                </div>
            </div>

            <Tabs defaultValue="gallery" className="w-full">
                <TabsList className="mb-8 bg-white/40 dark:bg-black/40 backdrop-blur-md border border-white/20 dark:border-white/10">
                    <TabsTrigger value="gallery" className="gap-2 data-[state=active]:bg-white/60 dark:data-[state=active]:bg-black/60">
                        <GoImage className="w-4 h-4" /> Gallery
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="gap-2 data-[state=active]:bg-white/60 dark:data-[state=active]:bg-black/60">
                        <GoPerson className="w-4 h-4" /> Account Settings
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="gallery">
                    <div className="space-y-8">
                        {/* Drop Zone */}
                        <div 
                            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                            onDragLeave={() => setDragging(false)}
                            onDrop={handleDrop}
                            className={`
                                p-12 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-4 transition-all
                                ${dragging ? "border-primary bg-primary/10 scale-[0.99]" : "border-white/20 dark:border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-md"}
                            `}
                        >
                            <div className="p-4 rounded-full bg-primary/10 text-primary">
                                <GoUpload className="w-8 h-8" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-lg font-semibold">Drag and drop images here</h3>
                                <p className="text-sm text-zinc-500 mb-4">Only image files are supported.</p>
                                <label className="cursor-pointer">
                                    <Button variant="outline" size="sm" className="gap-2" asChild>
                                        <span>
                                            <GoUpload className="w-4 h-4" /> Browse Files
                                            <input type="file" className="hidden" multiple accept="image/*" onChange={handleFileInput} />
                                        </span>
                                    </Button>
                                </label>
                            </div>
                        </div>

                        {/* Image Grid */}
                        {(Array.isArray(userImages) ? userImages : []).filter(img => img.originalName !== 'avatar.jpg').length === 0 ? (
                            <div className="text-center py-20 bg-white/40 dark:bg-black/40 backdrop-blur-md rounded-2xl border border-white/20 dark:border-white/10">
                                <p className="text-zinc-500">You haven't uploaded any images yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {(Array.isArray(userImages) ? userImages : [])
                                    .filter(img => img.originalName !== 'avatar.jpg')
                                    .map((img) => (
                                    <Card key={img.id} className="overflow-hidden group border border-white/20 dark:border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-md">
                                        <div className="aspect-video relative overflow-hidden bg-black/5 dark:bg-white/5">
                                            <img 
                                                src={`${API_URL}/uploads/${img.filename}`} 
                                                alt={img.originalName} 
                                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <Button 
                                                    size="icon" 
                                                    variant="secondary" 
                                                    onClick={() => handleSetAvatar(img.filename)}
                                                    title="Set as profile picture"
                                                >
                                                    <GoPerson className="w-4 h-4 text-blue-600" />
                                                </Button>
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
                </TabsContent>

                <TabsContent value="settings">
                    <div className="grid gap-8 max-w-2xl">
                        {/* Profile Info Form */}
                        <form onSubmit={handleUpdate}>
                            <Card className="overflow-hidden border border-white/20 dark:border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-md">
                                <CardHeader>
                                    <CardTitle>Profile Information</CardTitle>
                                    <CardDescription>Update your account details and how others see you.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Display Name</Label>
                                        <div className="relative">
                                            <GoPerson className="absolute left-3 top-3 text-zinc-400" />
                                            <Input 
                                                id="name" 
                                                className="pl-9"
                                                value={name} 
                                                onChange={(e) => setName(e.target.value)} 
                                                placeholder="Your Name"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <div className="relative">
                                            <GoMail className="absolute left-3 top-3 text-zinc-400" />
                                            <Input 
                                                id="email" 
                                                className="pl-9"
                                                value={email} 
                                                onChange={(e) => setEmail(e.target.value)} 
                                                placeholder="email@example.com"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Time Format</Label>
                                            <Select value={timeFormat} onValueChange={(v: any) => setTimeFormat(v)}>
                                                <SelectTrigger className="w-full">
                                                    <div className="flex items-center gap-2">
                                                        <GoClock className="text-zinc-400" />
                                                        <SelectValue placeholder="Select time format" />
                                                    </div>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="24h">24 Hours (14:30)</SelectItem>
                                                    <SelectItem value="12h">12 Hours (2:30 PM)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Date Format</Label>
                                            <Select value={dateFormat} onValueChange={setDateFormat}>
                                                <SelectTrigger className="w-full">
                                                    <div className="flex items-center gap-2">
                                                        <GoCalendar className="text-zinc-400" />
                                                        <SelectValue placeholder="Select date format" />
                                                    </div>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="yyyy-MM-dd">YYYY-MM-DD</SelectItem>
                                                    <SelectItem value="dd/MM/yyyy">DD/MM/YYYY</SelectItem>
                                                    <SelectItem value="MM/dd/yyyy">MM/DD/YYYY</SelectItem>
                                                    <SelectItem value="dd.MM.yyyy">DD.MM.YYYY</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-between border-t border-white/20 dark:border-white/10 p-6 bg-white/50 dark:bg-black/50 backdrop-blur-md">
                                    <p className="text-xs text-zinc-500">Your profile is visible to other board members.</p>
                                    <Button type="submit" disabled={loading} className="gap-2">
                                        {loading ? "Saving..." : (success ? <><GoCheck className="w-4 h-4" /> Saved</> : "Save Changes")}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </form>

                        {/* Password Change Form */}
                        <form onSubmit={handlePasswordChange}>
                            <Card className="overflow-hidden border border-white/20 dark:border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-md">
                                <CardHeader>
                                    <CardTitle>Change Password</CardTitle>
                                    <CardDescription>Ensure your account is using a long, random password to stay secure.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {passwordError && (
                                        <div className="p-3 rounded-md bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm font-medium">
                                            {passwordError}
                                        </div>
                                    )}
                                    <div className="space-y-2">
                                        <Label htmlFor="currentPassword">Current Password</Label>
                                        <div className="relative">
                                            <GoLock className="absolute left-3 top-3 text-zinc-400" />
                                            <Input 
                                                id="currentPassword" 
                                                type="password"
                                                className="pl-9"
                                                value={currentPassword} 
                                                onChange={(e) => setCurrentPassword(e.target.value)} 
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="newPassword">New Password</Label>
                                        <div className="relative">
                                            <GoLock className="absolute left-3 top-3 text-zinc-400" />
                                            <Input 
                                                id="newPassword" 
                                                type="password"
                                                className="pl-9"
                                                value={newPassword} 
                                                onChange={(e) => setNewPassword(e.target.value)} 
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                        <div className="relative">
                                            <GoLock className="absolute left-3 top-3 text-zinc-400" />
                                            <Input 
                                                id="confirmPassword" 
                                                type="password"
                                                className="pl-9"
                                                value={confirmPassword} 
                                                onChange={(e) => setConfirmPassword(e.target.value)} 
                                                required
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-end border-t border-white/20 dark:border-white/10 p-6 bg-white/50 dark:bg-black/50 backdrop-blur-md">
                                    <Button type="submit" disabled={passwordLoading} className="gap-2">
                                        {passwordLoading ? "Updating..." : (passwordSuccess ? <><GoCheck className="w-4 h-4" /> Updated</> : "Update Password")}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </form>
                    </div>
                </TabsContent>
            </Tabs>

            {selectedImageForCrop && (
                <AvatarCropDialog
                    imageUrl={selectedImageForCrop}
                    open={cropDialogOpen}
                    onOpenChange={setCropDialogOpen}
                    onCropComplete={handleCropComplete}
                />
            )}
        </div>
    );
}

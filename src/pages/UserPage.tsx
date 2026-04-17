import { useEffect, useState } from 'react';
import { useStore } from '../store';
import { useTheme } from '@/components/theme-provider';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { GoPerson, GoMail, GoImage, GoCheck, GoTrash, GoCopy, GoUpload, GoLock, GoSync, GoAlert, GoStack } from 'react-icons/go';
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { AvatarCropDialog } from '../components/AvatarCropDialog';
import { AlertDialog } from '../components/AlertDialog';

import { stringToColor } from '../utils/colors';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function UserPage() {
    const user = useStore(state => state.user);
    const updateUser = useStore(state => state.updateUser);
    const changePassword = useStore(state => state.changePassword);
    const deleteProfile = useStore(state => state.deleteProfile);
    const userImages = useStore(state => state.userImages);
    const fetchUserImages = useStore(state => state.fetchUserImages);
    const uploadImage = useStore(state => state.uploadImage);
    const deleteImage = useStore(state => state.deleteImage);
    const showSpecialBackground = useStore(state => state.showSpecialBackground);
    const setShowSpecialBackground = useStore(state => state.setShowSpecialBackground);
    const specialBackgroundColors = useStore(state => state.specialBackgroundColors);
    const setSpecialBackgroundColors = useStore(state => state.setSpecialBackgroundColors);
    const specialBackgroundDarkColors = useStore(state => state.specialBackgroundDarkColors);
    const setSpecialBackgroundDarkColors = useStore(state => state.setSpecialBackgroundDarkColors);
    const { theme } = useTheme();

    const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const getLuminance = (hex: string) => {
        const rgb = hex.replace(/^#/, '').match(/.{2}/g)?.map(x => parseInt(x, 16));
        if (!rgb) return 0;
        return (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
    };

    const updateBgColor = (index: number, color: string) => {
        const lum = getLuminance(color);
        // If dark mode, don't allow too light (lum > 0.6)
        // If light mode, don't allow too dark (lum < 0.4)
        if (isDarkMode && lum > 0.6) {
            alert("Color too light for dark mode! Please choose a darker shade.");
            return;
        }
        if (!isDarkMode && lum < 0.4) {
            alert("Color too dark for light mode! Please choose a lighter shade.");
            return;
        }

        if (isDarkMode) {
            const newColors = [...specialBackgroundDarkColors] as [string, string, string];
            newColors[index] = color;
            setSpecialBackgroundDarkColors(newColors);
        } else {
            const newColors = [...specialBackgroundColors] as [string, string, string];
            newColors[index] = color;
            setSpecialBackgroundColors(newColors);
        }
    };

    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
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

    // Danger zone
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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
            await updateUser({ name, email });
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

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            setPasswordError('New password must be at least 8 characters long, with an uppercase, lowercase, and number.');
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

    const handleDeleteProfile = async () => {
        setDeleteLoading(true);
        try {
            await deleteProfile();
        } catch (e) {
            console.error(e);
        } finally {
            setDeleteLoading(false);
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Profile Info Form */}
                    <form onSubmit={handleUpdate}>
                        <Card className="overflow-hidden border border-white/20 dark:border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-md">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <GoPerson className="w-5 h-5" /> Profile Information
                                </CardTitle>
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
                                <CardTitle className="flex items-center gap-2">
                                    <GoLock className="w-5 h-5" /> Change Password
                                </CardTitle>
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

                    {/* Preferences Zone */}
                    <Card className="overflow-hidden border border-white/20 dark:border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <GoStack className="w-5 h-5" /> Appearance Preferences
                            </CardTitle>
                            <CardDescription>Customize how the application looks and feels.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-white/10">
                                <div className="space-y-0.5">
                                    <p className="text-sm font-medium">Special Background</p>
                                    <p className="text-xs text-zinc-500">Enable the interactive blurry blob effect.</p>
                                </div>
                                <Button 
                                    variant={showSpecialBackground ? "default" : "outline"} 
                                    size="sm"
                                    onClick={() => setShowSpecialBackground(!showSpecialBackground)}
                                    className="transition-all"
                                >
                                    {showSpecialBackground ? "Enabled" : "Disabled"}
                                </Button>
                            </div>

                            {showSpecialBackground && (
                                <div className="space-y-4">
                                    <Label className="text-xs uppercase tracking-wider text-zinc-500 font-bold">
                                        Background Colors ({isDarkMode ? "Dark Mode" : "Light Mode"})
                                    </Label>
                                    <div className="grid grid-cols-3 gap-4">
                                        {(isDarkMode ? specialBackgroundDarkColors : specialBackgroundColors).map((color, idx) => (
                                            <div key={idx} className="space-y-2">
                                                <p className="text-[10px] text-zinc-500 font-medium">Layer {idx + 1}</p>
                                                <div className="flex items-center gap-2">
                                                    <div 
                                                        className="w-10 h-10 rounded-lg border-2 border-white/20 shadow-sm shrink-0" 
                                                        style={{ backgroundColor: color }}
                                                    />
                                                    <input 
                                                        type="color" 
                                                        value={color}
                                                        onChange={(e) => updateBgColor(idx, e.target.value)}
                                                        className="w-full h-8 bg-transparent border-0 cursor-pointer"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-zinc-400 italic">
                                        Tip: Light colors are filtered in dark mode and vice versa to maintain readability.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <Card className="overflow-hidden border border-red-500/20 dark:border-red-500/20 bg-red-50/10 dark:bg-red-950/10 backdrop-blur-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-500">
                                <GoAlert className="w-5 h-5" /> Danger Zone
                            </CardTitle>
                            <CardDescription>Permanently delete your account and all associated data.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                                Once you delete your account, there is no going back. Please be certain.
                            </p>
                            
                            <Button variant="destructive" disabled={deleteLoading} onClick={() => setDeleteDialogOpen(true)}>
                                {deleteLoading ? "Deleting..." : "Delete Account"}
                            </Button>

                            <AlertDialog
                                open={deleteDialogOpen}
                                onClose={() => setDeleteDialogOpen(false)}
                                title="Delete Account"
                                description="Are you absolutely sure you want to delete your account? This action cannot be undone and will permanently delete all your projects, boards, and tasks."
                                confirmText="Yes, delete my account"
                                onConfirm={handleDeleteProfile}
                                variant="destructive"
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-8">
                    {/* Gallery Section */}
                    <Card className="overflow-hidden border border-white/20 dark:border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <GoImage className="w-5 h-5" /> Image Gallery
                            </CardTitle>
                            <CardDescription>Upload and manage your personal images.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Drop Zone */}
                            <div
                                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                                onDragLeave={() => setDragging(false)}
                                onDrop={handleDrop}
                                className={`
                                    p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 transition-all
                                    ${dragging ? "border-primary bg-primary/10 scale-[0.99]" : "border-white/20 dark:border-white/10 bg-black/5 dark:bg-white/5"}
                                `}
                            >
                                <GoUpload className="w-6 h-6 text-primary" />
                                <div className="text-center">
                                    <p className="text-xs font-semibold">Drop images here</p>
                                    <label className="cursor-pointer">
                                        <Button variant="link" size="sm" className="h-auto p-0 text-xs" asChild>
                                            <span>
                                                or browse
                                                <input type="file" className="hidden" multiple accept="image/*" onChange={handleFileInput} />
                                            </span>
                                        </Button>
                                    </label>
                                </div>
                            </div>

                            {/* Image List (Compact) */}
                            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                {(Array.isArray(userImages) ? userImages : []).filter(img => img.originalName !== 'avatar.jpg').length === 0 ? (
                                    <p className="text-center py-8 text-xs text-zinc-500 italic">No images uploaded yet.</p>
                                ) : (
                                    (Array.isArray(userImages) ? userImages : [])
                                        .filter(img => img.originalName !== 'avatar.jpg')
                                        .map((img) => (
                                            <div key={img.id} className="flex items-center gap-3 p-2 rounded-lg bg-black/5 dark:bg-white/5 group relative">
                                                <div className="w-12 h-12 rounded md overflow-hidden bg-zinc-200 dark:bg-zinc-800 shrink-0">
                                                    <img
                                                        src={`${API_URL}/uploads/${img.filename}`}
                                                        alt={img.originalName}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs font-medium truncate" title={img.originalName}>{img.originalName}</p>
                                                    <p className="text-[10px] text-zinc-500">{(img.size / 1024).toFixed(1)} KB</p>
                                                </div>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-7 w-7"
                                                        onClick={() => handleSetAvatar(img.filename)}
                                                        title="Set as avatar"
                                                    >
                                                        <GoPerson className="w-3 h-3" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-7 w-7"
                                                        onClick={() => copyToClipboard(img.filename, img.id)}
                                                        title="Copy filename"
                                                    >
                                                        {copiedId === img.id ? <GoCheck className="w-3 h-3 text-green-600" /> : <GoCopy className="w-3 h-3" />}
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-7 w-7 text-red-500 hover:text-red-600"
                                                        onClick={() => deleteImage(img.id)}
                                                        title="Delete"
                                                    >
                                                        <GoTrash className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

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

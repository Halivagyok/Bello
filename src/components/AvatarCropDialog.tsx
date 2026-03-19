import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { GoPlus, GoDash } from 'react-icons/go';

interface AvatarCropDialogProps {
    imageUrl: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCropComplete: (croppedImage: Blob) => void;
}

export function AvatarCropDialog({ imageUrl, open, onOpenChange, onCropComplete }: AvatarCropDialogProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [imageError, setImageError] = useState<string | null>(null);

    const onCropChange = (crop: { x: number, y: number }) => {
        setCrop(crop);
    };

    const onZoomChange = (zoom: number) => {
        setZoom(zoom);
    };

    const onCropCompleteInternal = useCallback((_area: any, pixels: any) => {
        setCroppedAreaPixels(pixels);
    }, []);

    const createImage = (url: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
            const image = new Image();
            
            const isDataUrl = url.startsWith('data:');
            if (!isDataUrl) {
                image.crossOrigin = 'anonymous';
            }

            image.onload = () => resolve(image);
            image.onerror = (error) => {
                console.error('Image load error for URL:', url.substring(0, 100) + (url.length > 100 ? '...' : ''), error);
                setImageError('Failed to load image for cropping. Ensure your connection is stable.');
                reject(error);
            };
            
            // Add cache buster to avoid CORS issues with cached images, but not for data URLs
            if (!isDataUrl) {
                const cacheBuster = url.includes('?') ? `&t=${Date.now()}` : `?t=${Date.now()}`;
                image.src = url + cacheBuster;
            } else {
                image.src = url;
            }
        });

    const getCroppedImg = async (imageSrc: string, pixelCrop: any): Promise<Blob | null> => {
        try {
            const image = await createImage(imageSrc);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                console.error('No 2d context');
                return null;
            }

            canvas.width = pixelCrop.width;
            canvas.height = pixelCrop.height;

            ctx.drawImage(
                image,
                pixelCrop.x,
                pixelCrop.y,
                pixelCrop.width,
                pixelCrop.height,
                0,
                0,
                pixelCrop.width,
                pixelCrop.height
            );

            return new Promise((resolve, reject) => {
                canvas.toBlob((blob) => {
                    if (!blob) {
                        console.error('Canvas is empty');
                        reject(new Error('Canvas is empty'));
                        return;
                    }
                    resolve(blob);
                }, 'image/jpeg');
            });
        } catch (e) {
            console.error('getCroppedImg error:', e);
            return null;
        }
    };

    const handleSave = async () => {
        if (!croppedAreaPixels) return;
        setLoading(true);
        setImageError(null);
        try {
            const blob = await getCroppedImg(imageUrl, croppedAreaPixels);
            if (blob) {
                onCropComplete(blob);
                onOpenChange(false);
            } else {
                setImageError('Could not process image. This may be due to security restrictions or connection issues.');
            }
        } catch (e) {
            console.error('Cropping error:', e);
            setImageError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            onOpenChange(val);
            if (!val) setImageError(null);
        }}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Profile Picture</DialogTitle>
                </DialogHeader>

                {imageError && (
                    <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-3 rounded-md text-xs font-medium">
                        {imageError}
                    </div>
                )}
                
                <div className="relative w-full h-[350px] bg-zinc-900 rounded-lg overflow-hidden mt-4">
                    <Cropper
                        image={imageUrl}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        cropShape="round"
                        showGrid={false}
                        onCropChange={onCropChange}
                        onCropComplete={onCropCompleteInternal}
                        onZoomChange={onZoomChange}
                        crossOrigin={imageUrl.startsWith('data:') ? undefined : "anonymous"}
                    />
                </div>

                <div className="flex items-center gap-4 py-6 px-2">
                    <GoDash className="text-zinc-500 shrink-0" />
                    <input
                        type="range"
                        value={zoom}
                        min={1}
                        max={3}
                        step={0.1}
                        aria-labelledby="Zoom"
                        onChange={(e) => setZoom(Number(e.target.value))}
                        className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <GoPlus className="text-zinc-500 shrink-0" />
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={loading}>
                        {loading ? 'Processing...' : 'Save Avatar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

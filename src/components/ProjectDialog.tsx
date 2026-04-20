import { useState } from 'react';
import { useStore } from '../store';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface ProjectDialogProps {
    open: boolean;
    onClose: () => void;
}

export default function ProjectDialog({ open, onClose }: ProjectDialogProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [visibility, setVisibility] = useState<'private' | 'workspace' | 'public'>('workspace');
    const createProject = useStore(state => state.createProject);

    const handleCreate = async () => {
        if (!title.trim()) return;
        await createProject(title, description, visibility);
        handleClose();
    };

    const handleClose = () => {
        setTitle('');
        setDescription('');
        setVisibility('workspace');
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={(e) => { e.preventDefault(); handleCreate(); }}>
                    <DialogHeader>
                        <DialogTitle>Create New Project</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Project Title</Label>
                            <Input
                                id="title"
                                autoFocus
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter project title"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Enter project description"
                                className="min-h-[60px]"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="visibility">Visibility</Label>
                            <select
                                id="visibility"
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                value={visibility}
                                onChange={(e) => setVisibility(e.target.value as 'private' | 'workspace' | 'public')}
                            >
                                <option value="private">Private</option>
                                <option value="workspace">Workspace</option>
                                <option value="public">Public</option>
                            </select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
                        <Button type="submit" disabled={!title.trim()}>
                            Create
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}


import { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button
} from '@mui/material';
import { useStore } from '../store';

interface ProjectDialogProps {
    open: boolean;
    onClose: () => void;
}

export default function ProjectDialog({ open, onClose }: ProjectDialogProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const createProject = useStore(state => state.createProject);

    const handleCreate = async () => {
        if (!title.trim()) return;
        await createProject(title, description);
        handleClose();
    };

    const handleClose = () => {
        setTitle('');
        setDescription('');
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle>Create New Project</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Project Title"
                    fullWidth
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    sx={{ mb: 2 }}
                />
                <TextField
                    margin="dense"
                    label="Description (Optional)"
                    fullWidth
                    multiline
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={handleCreate} variant="contained" disabled={!title.trim()}>
                    Create
                </Button>
            </DialogActions>
        </Dialog>
    );
}

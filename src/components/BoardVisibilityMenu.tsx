import { useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Lock, Users, Globe, Check, X } from "lucide-react";
import { useStore } from "../store";

export function BoardVisibilityMenu() {
    const activeBoardId = useStore(state => state.activeBoardId);
    const boards = useStore(state => state.boards);
    const updateBoardVisibility = useStore(state => state.updateBoardVisibility);
    const currentUserRole = useStore(state => state.currentUserRole);
    const user = useStore(state => state.user);
    const activeBoardOwnerId = useStore(state => state.activeBoardOwnerId);

    const [open, setOpen] = useState(false);

    const board = boards.find(b => b.id === activeBoardId);
    
    // We only show the menu if there is an active board
    if (!board) return null;

    const currentVisibility = board.visibility || 'workspace';
    const isOwnerOrAdmin = currentUserRole === 'owner' || currentUserRole === 'admin' || user?.isAdmin || user?.id === activeBoardOwnerId;
    const disabled = !isOwnerOrAdmin;

    const handleSelect = (val: 'private' | 'workspace' | 'public') => {
        updateBoardVisibility(board.id, val);
        setOpen(false);
    };

    const getIcon = (v: string) => {
        if (v === 'private') return <Lock className="w-4 h-4 text-red-500" />;
        if (v === 'public') return <Globe className="w-4 h-4 text-green-500" />;
        return <Users className="w-4 h-4" />;
    };

    const getLabel = (v: string) => {
        if (v === 'private') return 'Private';
        if (v === 'public') return 'Public';
        return 'Workspace';
    };

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button 
                    variant="ghost" 
                    className="bg-white/10 hover:bg-white/20 text-white shrink-0 h-9 w-9 p-0 sm:w-auto sm:px-3 flex items-center justify-center gap-2 transition-colors" 
                    disabled={disabled}
                    title={disabled ? "Only board admins can change visibility" : "Change visibility"}
                >
                    {getIcon(currentVisibility)}
                    <span className="hidden [@media(min-width:600px)]:inline font-medium">
                        {getLabel(currentVisibility)}
                    </span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 p-0" align="center">
                <div className="flex items-center justify-between p-3 pb-2 border-b">
                    <span className="font-semibold text-sm w-full text-center">Change visibility</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6 absolute right-2 top-2" onClick={() => setOpen(false)}>
                        <X className="w-4 h-4" />
                    </Button>
                </div>
                <div className="p-2 space-y-1">
                    <DropdownMenuItem 
                        className="flex items-start gap-4 p-3 cursor-pointer" 
                        onClick={() => handleSelect('private')}
                    >
                        <Lock className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                        <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none flex items-center justify-between">
                                Private {currentVisibility === 'private' && <Check className="w-4 h-4" />}
                            </p>
                            <p className="text-xs text-muted-foreground leading-snug">
                                Only board members can see this board. Workspace admins can close the board or remove members.
                            </p>
                        </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem 
                        className="flex items-start gap-4 p-3 cursor-pointer" 
                        onClick={() => handleSelect('workspace')}
                    >
                        <Users className="w-5 h-5 mt-0.5 shrink-0" />
                        <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none flex items-center justify-between">
                                Workspace {currentVisibility === 'workspace' && <Check className="w-4 h-4" />}
                            </p>
                            <p className="text-xs text-muted-foreground leading-snug">
                                All members of the Workspace can see and edit this board.
                            </p>
                        </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem 
                        className="flex items-start gap-4 p-3 cursor-pointer" 
                        onClick={() => handleSelect('public')}
                    >
                        <Globe className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                        <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none flex items-center justify-between">
                                Public {currentVisibility === 'public' && <Check className="w-4 h-4" />}
                            </p>
                            <p className="text-xs text-muted-foreground leading-snug">
                                Anyone on the internet can see this board. Only board members can edit.
                            </p>
                        </div>
                    </DropdownMenuItem>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

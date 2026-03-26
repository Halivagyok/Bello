import { useState } from 'react';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import { useStore, type List } from '../store';
import Card from './Card';
import MoveListDialog from './MoveListDialog';
import MoveCardsDialog from './MoveCardsDialog';
import { getContrastText } from '../utils/colors';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { 
    Plus, 
    X, 
    Copy, 
    Move, 
    SortAsc, 
    Palette, 
    Trash2,
    Settings,
    ArrowUpRight,
    UserCircle
} from "lucide-react";
import { AlertDialog } from './AlertDialog';
import { Label } from "./ui/label";

interface CardListProps {
    list: List;
    index: number;
}

export default function CardList({ list, index }: CardListProps) {
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [title, setTitle] = useState(list.title);
    const [isAddingCard, setIsAddingCard] = useState(false);
    const [newCardContent, setNewCardContent] = useState("");
    const [openMoveList, setOpenMoveList] = useState(false);
    const [openMoveCards, setOpenMoveCards] = useState(false);
    const [openDuplicate, setOpenDuplicate] = useState(false);
    const [duplicateTitle, setDuplicateTitle] = useState(`Copy of ${list.title}`);
    const [openTransfer, setOpenTransfer] = useState(false);
    const [targetOwnerId, setTargetOwnerId] = useState('');

    const addCard = useStore((state) => state.addCard);
    const updateListTitle = useStore((state) => state.updateListTitle);
    const deleteList = useStore((state) => state.deleteList);
    const duplicateList = useStore((state) => state.duplicateList);
    const updateListColor = useStore((state) => state.updateListColor);
    const sortCards = useStore((state) => state.sortCards);
    const transferListOwnership = useStore((state) => state.transferListOwnership);
    const user = useStore(state => state.user);
    const currentUserRole = useStore(state => state.currentUserRole);
    const isViewer = !user || currentUserRole === 'viewer';
    const activeMembers = useStore(state => state.activeMembers);
    const activeBoardOwnerId = useStore(state => state.activeBoardOwnerId);

    // Board Filters
    const boardFilterQuery = useStore(state => state.boardFilterQuery);
    const boardFilterDue = useStore(state => state.boardFilterDue);
    const boardFilterStatus = useStore(state => state.boardFilterStatus);
    const boardFilterLabels = useStore(state => state.boardFilterLabels);

    // Alert Dialog State
    const [alertDialog, setAlertDialog] = useState<{
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
        setAlertDialog({ open: true, title, description, onConfirm, variant });
    };

    const rolePriority: Record<string, number> = { 'owner': 4, 'admin': 3, 'member': 2, 'viewer': 1 };
    const myRoleVal = (activeBoardOwnerId && user?.id === activeBoardOwnerId) ? 5 : (rolePriority[currentUserRole || 'member'] || 0);
    
    const ownerMember = (activeMembers || []).find(m => m.id === list.ownerId);
    const ownerPrio = (activeBoardOwnerId && list.ownerId === activeBoardOwnerId) ? 5 : (rolePriority[ownerMember?.role || 'member'] || 0);

    // Permissions:
    // 1. Board owner/System Admin can always edit
    // 2. Board admin can always edit
    // 3. List owner can always edit
    // 4. Other members can only edit if their role >= owner's role
    const canModify = (user?.isAdmin) || 
                      (user?.id === activeBoardOwnerId) ||
                      (myRoleVal >= 3 && myRoleVal >= ownerPrio) ||
                      (list.ownerId === user?.id) ||
                      (!list.ownerId);

    const canTransfer = (user?.isAdmin) || 
                        (user?.id === activeBoardOwnerId) ||
                        (myRoleVal >= 3);

    const handleTitleClick = () => { 
        if (!isViewer && canModify) setIsEditingTitle(true) 
    }
    
    const handleDuplicate = () => {
        if (duplicateTitle.trim()) {
            duplicateList(list.id, duplicateTitle);
            setOpenDuplicate(false);
        }
    };

    const handleTransfer = async () => {
        if (targetOwnerId) {
            try {
                await transferListOwnership(list.id, targetOwnerId);
                setOpenTransfer(false);
            } catch (e) {
                showAlert('Error', 'Failed to transfer ownership');
            }
        }
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => { setTitle(e.target.value) }

    const handleTitleBlur = () => { 
        setIsEditingTitle(false); 
        if (title !== list.title) { 
            updateListTitle(list.id, title) 
        } 
    }

    const handleDeleteList = () => {
        if (isViewer || !canModify) return;
        showAlert(
            'Delete List?',
            `Are you sure you want to delete the list "${list.title}"? This will permanently remove all cards in it.`,
            () => deleteList(list.id),
            'destructive'
        );
    };

    const handleColorChange = (color: string) => {
        if (isViewer || !canModify) return;
        updateListColor(list.id, color);
    };

    const handleSort = (sortBy: 'oldest' | 'newest' | 'abc' | 'checked-first' | 'checked-last') => {
        if (isViewer || !canModify) return;
        sortCards(list.id, sortBy);
    };

    const handleConfirmAddCard = () => {
        if (newCardContent.trim()) {
            addCard(list.id, newCardContent);
            setNewCardContent("");
        }
    };

    const handleCancelAddCard = () => {
        setIsAddingCard(false);
        setNewCardContent("");
    };

    const contrastColor = getContrastText(list.color);

    const filteredCards = list.cards.filter(card => {
        if (boardFilterQuery) {
            const q = boardFilterQuery.toLowerCase();
            const matchesContent = card.content.toLowerCase().includes(q);
            const matchesDescription = card.description?.toLowerCase().includes(q);
            const matchesLabels = card.labels?.some(l => l.title.toLowerCase().includes(q));
            if (!matchesContent && !matchesDescription && !matchesLabels) return false;
        }

        if (boardFilterStatus !== 'all') {
            if (boardFilterStatus === 'completed' && !card.completed) return false;
            if (boardFilterStatus === 'not-completed' && card.completed) return false;
        }

        if (boardFilterDue !== 'all') {
            if (boardFilterDue === 'no-due-date' && card.dueDate) return false;
            if (boardFilterDue !== 'no-due-date') {
                if (!card.dueDate) return false;
                const due = new Date(card.dueDate);
                const diff = due.getTime() - Date.now();
                if (boardFilterDue === 'overdue' && (diff > 0 || card.completed)) return false;
                if (boardFilterDue === 'next-7-days' && (card.completed || diff > 7 * 24 * 60 * 60 * 1000 || diff < 0)) return false;
                if (boardFilterDue === 'next-14-days' && (card.completed || diff > 14 * 24 * 60 * 60 * 1000 || diff < 0)) return false;
            }
        }

        if (boardFilterLabels && boardFilterLabels.length > 0) {
            if (!card.labels || !card.labels.some(l => boardFilterLabels.includes(l.id))) return false;
        }

        return true;
    });

    return (
        <Draggable draggableId={list.id} index={index} isDragDisabled={isViewer || !canModify}>
            {(provided) => (
                <div
                    {...provided.draggableProps}
                    ref={provided.innerRef}
                    className="w-[300px] shrink-0 h-fit"
                >
                    <div 
                        className="rounded-xl flex flex-col max-h-[calc(100vh-100px)] shadow-sm border border-black/5 dark:border-white/5 overflow-hidden"
                        style={{ backgroundColor: list.color || '#ebecf0' }}
                        {...provided.dragHandleProps}
                    >
                        {/* List Header */}
                        <div className="flex items-center justify-between p-3">
                            <div className="flex-grow mr-2 min-w-0">
                                {isEditingTitle ? (
                                    <Input
                                        value={title}
                                        onChange={handleTitleChange}
                                        onBlur={handleTitleBlur}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.currentTarget.blur();
                                            }
                                        }}
                                        autoFocus
                                        className="h-8 bg-white text-black border-zinc-200 focus-visible:ring-1 focus-visible:ring-primary"
                                    />
                                ) : (
                                    <div>
                                        <h3
                                            onClick={handleTitleClick}
                                            className={`text-sm font-bold px-2 py-1 rounded transition-colors truncate ${isViewer || !canModify ? 'cursor-default' : 'cursor-pointer hover:bg-black/5 dark:hover:bg-white/10'}`}
                                            style={{ color: contrastColor }}
                                        >
                                            {list.title}
                                        </h3>
                                        {ownerMember && (
                                            <div className="flex items-center gap-1 px-2 opacity-60 text-[10px] font-medium uppercase tracking-tight" style={{ color: contrastColor }}>
                                                <UserCircle className="w-2.5 h-2.5" />
                                                <span className="truncate">{ownerMember.name || ownerMember.email}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            
                            {!isViewer && (
                                <div className="flex items-center gap-1">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button 
                                                className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors focus:outline-none" 
                                                style={{ color: contrastColor }}
                                            >
                                                <Settings className="w-4 h-4" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-56">
                                            {canModify && (
                                                <>
                                                    <DropdownMenuItem onClick={() => {
                                                        setDuplicateTitle(`Copy of ${list.title}`);
                                                        setOpenDuplicate(true);
                                                    }} className="gap-2">
                                                        <Copy className="w-4 h-4" /> Duplicate List
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => setOpenMoveList(true)} className="gap-2">
                                                        <Move className="w-4 h-4" /> Move List
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => setOpenMoveCards(true)} className="gap-2">
                                                        <Move className="w-4 h-4" /> Move All Cards
                                                    </DropdownMenuItem>
                                                    
                                                    <DropdownMenuSeparator />
                                                    
                                                    <DropdownMenuSub>
                                                        <DropdownMenuSubTrigger className="gap-2">
                                                            <SortAsc className="w-4 h-4" /> Sort cards
                                                        </DropdownMenuSubTrigger>
                                                        <DropdownMenuSubContent>
                                                            <DropdownMenuItem onClick={() => handleSort('oldest')}>Date Created (Oldest)</DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleSort('newest')}>Date Created (Newest)</DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleSort('abc')}>Alphabetically</DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleSort('checked-first')}>Checked First</DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleSort('checked-last')}>Checked Last</DropdownMenuItem>
                                                        </DropdownMenuSubContent>
                                                    </DropdownMenuSub>

                                                    <DropdownMenuSub>
                                                        <DropdownMenuSubTrigger className="gap-2">
                                                            <Palette className="w-4 h-4" /> Change color
                                                        </DropdownMenuSubTrigger>
                                                        <DropdownMenuSubContent className="p-3 w-[180px]">
                                                            <div className="grid grid-cols-4 gap-2 mb-3">
                                                                {[
                                                                    '#F4F5F7', // Neutral Gray (Bright)
                                                                    '#4BCE97', // Vibrant Green
                                                                    '#F5CD47', // Vibrant Yellow
                                                                    '#FEA362', // Vibrant Orange
                                                                    '#F87168', // Vibrant Red
                                                                    '#9F8FEF', // Vibrant Purple
                                                                    '#579DFF', // Vibrant Blue
                                                                    '#60C6D2', // Vibrant Teal
                                                                ].map(color => (
                                                                    <div
                                                                        key={color}
                                                                        onClick={() => handleColorChange(color)}
                                                                        className={`w-7 h-7 rounded-md cursor-pointer border-2 transition-all hover:scale-110 active:scale-95 ${list.color === color ? 'border-primary ring-1 ring-primary shadow-sm' : 'border-transparent hover:border-zinc-300 dark:hover:border-zinc-600'}`}
                                                                        style={{ backgroundColor: color }}
                                                                        title={color}
                                                                    />
                                                                ))}
                                                            </div>
                                                            <DropdownMenuSeparator />
                                                            <div className="flex items-center justify-between mt-3 px-1">
                                                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Custom</span>
                                                                <input
                                                                    type="color"
                                                                    value={list.color || '#F4F5F7'}
                                                                    onChange={(e) => handleColorChange(e.target.value)}
                                                                    className="w-8 h-8 p-0.5 border border-zinc-200 dark:border-zinc-800 bg-card cursor-pointer rounded-md transition-shadow hover:shadow-sm"
                                                                />
                                                            </div>
                                                        </DropdownMenuSubContent>
                                                    </DropdownMenuSub>

                                                    {canTransfer && (
                                                        <DropdownMenuItem onClick={() => setOpenTransfer(true)} className="gap-2">
                                                            <UserCircle className="w-4 h-4" /> Give to Someone
                                                        </DropdownMenuItem>
                                                    )}

                                                    <DropdownMenuSeparator />
                                                    
                                                    <DropdownMenuItem onClick={handleDeleteList} className="gap-2 text-destructive focus:text-destructive">
                                                        <Trash2 className="w-4 h-4" /> Delete List
                                                    </DropdownMenuItem>
                                                </>
                                            )}
                                            {!canModify && (
                                                <DropdownMenuItem disabled>
                                                    Insufficient permissions
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    <ArrowUpRight className="w-5 h-5 opacity-40 shrink-0" style={{ color: contrastColor }} />
                                </div>
                            )}
                        </div>

                        {/* Cards Area */}
                        <Droppable droppableId={list.id} type="card" isDropDisabled={isViewer || !canModify}>
                            {(provided, snapshot) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className={`px-1 pb-1 overflow-y-auto overflow-x-hidden min-h-[10px] transition-colors scrollbar-board ${snapshot.isDraggingOver ? 'bg-black/5' : ''}`}
                                    style={{ maxHeight: 'calc(100vh - 200px)' }}
                                >
                                    {filteredCards.map((card, idx) => (
                                        <Card key={card.id} card={card} index={idx} />
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>

                        {/* Add Card Footer */}
                        <div className="p-2 mt-auto">
                            {isAddingCard && !isViewer && canModify ? (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-black/5 dark:border-white/10 p-2">
                                        <Textarea
                                            placeholder="Enter a title for this card..."
                                            value={newCardContent}
                                            onChange={(e) => setNewCardContent(e.target.value)}
                                            className="min-h-[60px] resize-none border-0 focus-visible:ring-0 p-0 text-sm bg-transparent"
                                            autoFocus
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleConfirmAddCard();
                                                }
                                            }}
                                        />
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Button 
                                            size="sm" 
                                            onClick={handleConfirmAddCard}
                                            className="bg-primary hover:bg-primary/90 text-primary-foreground h-8"
                                        >
                                            Add Card
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            variant="ghost" 
                                            onClick={handleCancelAddCard}
                                            style={{ color: contrastColor }}
                                            className="hover:bg-black/10 dark:hover:bg-white/10 h-8 w-8 p-0"
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ) : !isViewer && canModify ? (
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start gap-2 hover:bg-black/10 dark:hover:bg-white/10 text-sm font-medium h-9"
                                    style={{ color: contrastColor }}
                                    onClick={() => setIsAddingCard(true)}
                                >
                                    <Plus className="w-4 h-4" /> Add a card
                                </Button>
                            ) : null}
                        </div>
                    </div>
                    
                    <MoveListDialog 
                        open={openMoveList} 
                        onClose={() => setOpenMoveList(false)} 
                        listId={list.id} 
                    />
                    <MoveCardsDialog 
                        open={openMoveCards} 
                        onClose={() => setOpenMoveCards(false)} 
                        sourceListId={list.id} 
                    />

                    {/* Duplicate List Dialog */}
                    <Dialog open={openDuplicate} onOpenChange={(val) => !val && setOpenDuplicate(false)}>
                        <DialogContent>
                            <form onSubmit={(e) => { e.preventDefault(); handleDuplicate(); }}>
                                <DialogHeader>
                                    <DialogTitle>Duplicate List</DialogTitle>
                                </DialogHeader>
                                <div className="py-4">
                                    <Input
                                        placeholder="List Title"
                                        value={duplicateTitle}
                                        onChange={(e) => setDuplicateTitle(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setOpenDuplicate(false)}>Cancel</Button>
                                    <Button type="submit">Duplicate</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>

                    {/* Transfer Ownership Dialog */}
                    <Dialog open={openTransfer} onOpenChange={(val) => !val && setOpenTransfer(false)}>
                        <DialogContent>
                            <form onSubmit={(e) => { e.preventDefault(); handleTransfer(); }}>
                                <DialogHeader>
                                    <DialogTitle>Transfer List Ownership</DialogTitle>
                                </DialogHeader>
                                <div className="py-4 space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="target-owner">Select New Owner</Label>
                                        <Select value={targetOwnerId} onValueChange={setTargetOwnerId}>
                                            <SelectTrigger id="target-owner">
                                                <SelectValue placeholder="Select a member" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {activeMembers.filter(m => m.id !== list.ownerId).map(member => (
                                                    <SelectItem key={member.id} value={member.id}>
                                                        {member.name || member.email} ({member.role})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <p className="text-xs text-muted-foreground italic">
                                        Note: Members with a lower role than the new owner will no longer be able to modify this list.
                                    </p>
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setOpenTransfer(false)}>Cancel</Button>
                                    <Button type="submit" disabled={!targetOwnerId}>Transfer</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>

                    <AlertDialog 
                        open={alertDialog.open}
                        onClose={() => setAlertDialog(prev => ({ ...prev, open: false }))}
                        title={alertDialog.title}
                        description={alertDialog.description}
                        onConfirm={alertDialog.onConfirm}
                        variant={alertDialog.variant}
                    />
                </div>
            )}
        </Draggable>
    );
}

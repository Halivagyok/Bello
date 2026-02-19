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
    Plus, 
    X, 
    Copy, 
    Move, 
    SortAsc, 
    Palette, 
    Trash2,
    Settings,
    ArrowUpRight
} from "lucide-react";

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

    const addCard = useStore((state) => state.addCard);
    const updateListTitle = useStore((state) => state.updateListTitle);
    const deleteList = useStore((state) => state.deleteList);
    const duplicateList = useStore((state) => state.duplicateList);
    const updateListColor = useStore((state) => state.updateListColor);
    const sortCards = useStore((state) => state.sortCards);

    const handleTitleClick = () => { setIsEditingTitle(true) }
    
    const handleDuplicate = () => {
        const newTitle = prompt("Enter title for the new list:", `Copy of ${list.title}`);
        if (newTitle) {
            duplicateList(list.id, newTitle);
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
        if (confirm("Are you sure you want to delete this list?")) {
            deleteList(list.id);
        }
    };

    const handleColorChange = (color: string) => {
        updateListColor(list.id, color);
    };

    const handleSort = (sortBy: 'oldest' | 'newest' | 'abc') => {
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

    return (
        <Draggable draggableId={list.id} index={index}>
            {(provided) => (
                <div
                    {...provided.draggableProps}
                    ref={provided.innerRef}
                    className="w-[300px] shrink-0 h-fit"
                >
                    <div 
                        className="rounded-xl flex flex-col max-h-[calc(100vh-100px)] shadow-sm border border-black/5 dark:border-white/5"
                        style={{ backgroundColor: list.color || '#ebecf0' }}
                        {...provided.dragHandleProps}
                    >
                        {/* List Header */}
                        <div className="flex items-center justify-between p-3">
                            <div className="flex-grow mr-2">
                                {isEditingTitle ? (
                                    <Input
                                        value={title}
                                        onChange={handleTitleChange}
                                        onBlur={handleTitleBlur}
                                        autoFocus
                                        className="h-8 bg-white text-black border-zinc-200 focus-visible:ring-1 focus-visible:ring-primary"
                                    />
                                ) : (
                                    <h3
                                        onClick={handleTitleClick}
                                        className="text-sm font-bold cursor-pointer px-2 py-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors truncate"
                                        style={{ color: contrastColor }}
                                    >
                                        {list.title}
                                    </h3>
                                )}
                            </div>
                            
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
                                        <DropdownMenuItem onClick={handleDuplicate} className="gap-2">
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
                                            </DropdownMenuSubContent>
                                        </DropdownMenuSub>

                                        <DropdownMenuSub>
                                            <DropdownMenuSubTrigger className="gap-2">
                                                <Palette className="w-4 h-4" /> Change color
                                            </DropdownMenuSubTrigger>
                                            <DropdownMenuSubContent className="p-2">
                                                <div className="grid grid-cols-4 gap-2 mb-2">
                                                    {['#ebecf0', '#ffcdd2', '#f8bbd0', '#e1bee7', '#d1c4e9', '#c5cae9', '#bbdefb', '#b3e5fc','#b2ebf2', '#b2dfdb', '#c8e6c9', '#dcedc8', '#f0f4c3', '#fff9c4', '#ffecb3', '#ffe0b2'].map(color => (
                                                        <div
                                                            key={color}
                                                            onClick={() => handleColorChange(color)}
                                                            className={`w-6 h-6 rounded cursor-pointer border hover:scale-110 transition-transform ${list.color === color ? 'border-primary ring-1 ring-primary' : 'border-zinc-200 dark:border-zinc-700'}`}
                                                            style={{ backgroundColor: color }}
                                                        />
                                                    ))}
                                                </div>
                                                <DropdownMenuSeparator />
                                                <div className="flex items-center justify-between mt-2 px-1">
                                                    <span className="text-xs font-medium">Custom:</span>
                                                    <input
                                                        type="color"
                                                        value={list.color || '#ebecf0'}
                                                        onChange={(e) => handleColorChange(e.target.value)}
                                                        className="w-8 h-6 p-0 border-0 bg-transparent cursor-pointer rounded"
                                                    />
                                                </div>
                                            </DropdownMenuSubContent>
                                        </DropdownMenuSub>

                                        <DropdownMenuSeparator />
                                        
                                        <DropdownMenuItem onClick={handleDeleteList} className="gap-2 text-destructive focus:text-destructive">
                                            <Trash2 className="w-4 h-4" /> Delete List
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <ArrowUpRight className="w-5 h-5 opacity-40 shrink-0" style={{ color: contrastColor }} />
                            </div>
                        </div>

                        {/* Cards Area */}
                        <Droppable droppableId={list.id} type="card">
                            {(provided, snapshot) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className={`px-1 pb-1 overflow-y-auto min-h-[10px] transition-colors scrollbar-board ${snapshot.isDraggingOver ? 'bg-black/5' : ''}`}
                                    style={{ maxHeight: 'calc(100vh - 200px)' }}
                                >
                                    {list.cards.map((card, idx) => (
                                        <Card key={card.id} card={card} index={idx} />
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>

                        {/* Add Card Footer */}
                        <div className="p-2 mt-auto">
                            {isAddingCard ? (
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
                            ) : (
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start gap-2 hover:bg-black/10 dark:hover:bg-white/10 text-sm font-medium h-9"
                                    style={{ color: contrastColor }}
                                    onClick={() => setIsAddingCard(true)}
                                >
                                    <Plus className="w-4 h-4" /> Add a card
                                </Button>
                            )}
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
                </div>
            )}
        </Draggable>
    );
}


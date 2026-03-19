import { useEffect, useRef, useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { useStore, type Card as CardType } from '../store';
import { GoCheck, GoClock, GoListUnordered, GoLocation } from "react-icons/go";
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { CardDetailsDialog } from './CardDetailsDialog';
import { format } from 'date-fns';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface CardProps {
    card: CardType;
    index: number;
}

function CardInner({ card, isDragging, toggleCardCompletion, isViewer, canModify, onOpenDetails }: { card: CardType, isDragging: boolean, toggleCardCompletion: (id: string, completed: boolean) => void, isViewer: boolean, canModify: boolean, onOpenDetails: () => void }) {
    const user = useStore(state => state.user);
    const rotate = useMotionValue(0);
    const springRotate = useSpring(rotate, { stiffness: 400, damping: 25 });
    const lastX = useRef(0);
    const timerRef = useRef<number | null>(null);

    useEffect(() => {
        if (!isDragging) {
            rotate.set(0);
            return;
        }

        const handleMouseMove = (e: MouseEvent) => {
            if (lastX.current === 0) {
                lastX.current = e.clientX;
                return;
            }
            
            const velocity = e.clientX - lastX.current;
            lastX.current = e.clientX;
            
            const tilt = Math.max(Math.min(velocity * 0.6, 15), -15);
            rotate.set(-tilt);

            // Reset tilt when mouse stops moving
            if (timerRef.current) window.clearTimeout(timerRef.current);
            timerRef.current = window.setTimeout(() => {
                rotate.set(0);
            }, 50);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            if (timerRef.current) window.clearTimeout(timerRef.current);
            lastX.current = 0;
        };
    }, [isDragging, rotate]);

    const getFormattedDate = () => {
        if (!card.dueDate) return null;
        const d = new Date(card.dueDate);
        
        const timeFmt = user?.timeFormat === '12h' ? 'hh:mm a' : 'HH:mm';
        const dateFmt = user?.dateFormat || 'yyyy/MM/dd';
        
        if (card.dueDateMode === 'date-only') return format(d, dateFmt);
        if (card.dueDateMode === 'time-only') return format(d, timeFmt);
        return format(d, `${dateFmt} ${timeFmt}`);
    };

    const formattedDate = getFormattedDate();
    const isOverdue = card.dueDate ? new Date(card.dueDate) < new Date() && !card.completed : false;

    const displayImageUrl = card.imageUrl 
        ? (card.imageUrl.startsWith('http') ? card.imageUrl : `${API_URL}/uploads/${card.imageUrl}`)
        : null;

    return (
        <motion.div 
            style={{ rotate: springRotate }}
            onClick={onOpenDetails}
            className={`
                rounded-xl flex flex-col items-center gap-0 group shadow-sm transition-all border overflow-hidden cursor-pointer
                ${isDragging 
                    ? "bg-zinc-100 dark:bg-zinc-800 scale-105 border-primary shadow-lg ring-1 ring-primary/20" 
                    : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md"
                }
            `} 
        >
            {displayImageUrl && (
                <div className="w-full aspect-video overflow-hidden border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
                    <img src={displayImageUrl} alt="" className="w-full h-full object-cover" />
                </div>
            )}
            <div className="p-3 flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium break-words whitespace-pre-wrap ${card.completed ? "line-through opacity-50 select-none" : "text-foreground"}`}>
                        {card.content}
                    </div>
                    
                    {(card.description || card.dueDate || card.location) && (
                        <div className="flex flex-col items-start gap-1.5 mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                            {card.description && (
                                <div className="flex items-center gap-1.5" title="This card has a description.">
                                    <GoListUnordered className="w-3.5 h-3.5" />
                                    <span>Description</span>
                                </div>
                            )}
                            {card.dueDate && (
                                <div 
                                    className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded ${isOverdue ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" : ""}`}
                                    title={`Due: ${formattedDate}`}
                                >
                                    <GoClock className="w-3.5 h-3.5" />
                                    <span>{formattedDate}</span>
                                </div>
                            )}
                            {card.location && (
                                <div className="flex items-center gap-1.5 w-full" title={`Location: ${card.location}`}>
                                    <GoLocation className="w-3.5 h-3.5 shrink-0" />
                                    <span className="truncate">{card.location}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div 
                    className={`
                        shrink-0 flex justify-center items-center rounded-full border border-zinc-300 dark:border-zinc-700 size-6 transition-all mt-0.5
                        ${isViewer || !canModify ? "cursor-default" : "cursor-pointer"}
                        ${card.completed 
                            ? "bg-green-600 border-green-600 text-white" 
                            : "text-transparent group-hover:text-zinc-400 dark:group-hover:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        }
                    `} 
                    onClick={(e) => {
                        e.stopPropagation(); 
                        if (!isViewer && canModify) {
                            toggleCardCompletion(card.id, !card.completed)
                        }
                    }} 
                    onMouseDown={(e) => e.stopPropagation()} 
                >
                    <GoCheck className={card.completed ? "w-4 h-4" : "w-3 h-3"} />
                </div>
            </div>
        </motion.div>
    );
}

export default function Card({ card, index }: CardProps) {
    const toggleCardCompletion = useStore(state => state.toggleCardCompletion);
    const currentUserRole = useStore(state => state.currentUserRole);
    const activeBoardOwnerId = useStore(state => state.activeBoardOwnerId);
    const activeMembers = useStore(state => state.activeMembers);
    const user = useStore(state => state.user);
    const lists = useStore(state => state.lists);
    
    const [detailsOpen, setDetailsOpen] = useState(false);

    const isViewer = currentUserRole === 'viewer';

    const list = lists.find(l => l.id === card.listId);
    const rolePriority: Record<string, number> = { 'owner': 4, 'admin': 3, 'member': 2, 'viewer': 1 };
    const myRoleVal = (activeBoardOwnerId && user?.id === activeBoardOwnerId) ? 5 : (rolePriority[currentUserRole || 'member'] || 0);
    
    const ownerMember = (activeMembers || []).find(m => m.id === list?.ownerId);
    const ownerPrio = (activeBoardOwnerId && list?.ownerId === activeBoardOwnerId) ? 5 : (rolePriority[ownerMember?.role || 'member'] || 0);

    const canModify = (user?.isAdmin) || 
                      (user?.id === activeBoardOwnerId) ||
                      (myRoleVal >= 3 && myRoleVal >= ownerPrio) || // Higher or equal to owner
                      (list?.ownerId === user?.id) ||
                      (!list?.ownerId);

    return (
        <>
            <Draggable draggableId={card.id} index={index} isDragDisabled={isViewer || !canModify}>
                {(provided, snapshot) => (
                    <div 
                        ref={provided.innerRef} 
                        {...provided.draggableProps} 
                        {...provided.dragHandleProps} 
                        style={{
                            ...provided.draggableProps.style,
                            // Fix for DND drop animation: let DND handle the transition on drop
                        }}
                        className="m-2 outline-none"
                    >
                        <CardInner 
                            card={card} 
                            isDragging={snapshot.isDragging} 
                            toggleCardCompletion={toggleCardCompletion} 
                            isViewer={isViewer}
                            canModify={canModify}
                            onOpenDetails={() => setDetailsOpen(true)}
                        />
                    </div>
                )}
            </Draggable>
            <CardDetailsDialog 
                card={card} 
                open={detailsOpen} 
                onOpenChange={setDetailsOpen} 
            />
        </>
    );
}





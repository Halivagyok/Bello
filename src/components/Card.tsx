import { useEffect, useRef } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { useStore, type Card as CardType } from '../store';
import { GoCheck } from "react-icons/go";
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface CardProps {
    card: CardType;
    index: number;
}

function CardInner({ card, isDragging, toggleCardCompletion, isViewer, canModify }: { card: CardType, isDragging: boolean, toggleCardCompletion: (id: string, completed: boolean) => void, isViewer: boolean, canModify: boolean }) {
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

    return (
        <motion.div 
            style={{ rotate: springRotate }}
            className={`
                p-3 rounded-xl flex justify-between items-start gap-3 group shadow-sm transition-colors border
                ${isDragging 
                    ? "bg-zinc-100 dark:bg-zinc-800 scale-105 border-primary shadow-lg ring-1 ring-primary/20" 
                    : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                }
            `} 
        >
            <div className={`text-sm font-medium break-words whitespace-pre-wrap flex-1 min-w-0 ${card.completed ? "line-through opacity-50 select-none" : "text-foreground"}`}>
                {card.content}
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

    const isViewer = currentUserRole === 'viewer';

    const list = lists.find(l => l.id === card.listId);
    const rolePriority: Record<string, number> = { 'owner': 4, 'admin': 3, 'member': 2, 'viewer': 1 };
    const myRoleVal = (activeBoardOwnerId && user?.id === activeBoardOwnerId) ? 5 : (rolePriority[currentUserRole || 'member'] || 0);
    
    const ownerMember = activeMembers.find(m => m.id === list?.ownerId);
    const ownerPrio = (activeBoardOwnerId && list?.ownerId === activeBoardOwnerId) ? 5 : (rolePriority[ownerMember?.role || 'member'] || 0);

    const canModify = (user?.isAdmin) || 
                      (user?.id === activeBoardOwnerId) ||
                      (myRoleVal >= 3 && myRoleVal >= ownerPrio) || // Higher or equal to owner
                      (list?.ownerId === user?.id) ||
                      (!list?.ownerId);

    return (
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
                    />
                </div>
            )}
        </Draggable>
    );
}





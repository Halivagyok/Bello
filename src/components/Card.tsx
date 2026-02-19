import { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { useStore, type Card as CardType } from '../store';
import { GoCheck } from "react-icons/go";

interface CardProps {
    card: CardType;
    index: number;
}

export default function Card({ card, index }: CardProps) {
    const toggleCardCompletion = useStore(state => state.toggleCardCompletion);

    return (
        <Draggable draggableId={card.id} index={index}>
            {(provided, snapshot) => (
                <div 
                    className={`
                        p-3 rounded-xl m-2 flex justify-between items-start group shadow-sm transition-all border
                        ${snapshot.isDragging 
                            ? "bg-zinc-100 dark:bg-zinc-800 rotate-2 scale-105 border-primary shadow-lg" 
                            : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                        }
                    `} 
                    ref={provided.innerRef} 
                    {...provided.draggableProps} 
                    {...provided.dragHandleProps} 
                >
                    <div className={`text-sm font-medium ${card.completed ? "line-through opacity-50 select-none" : "text-foreground"}`}>
                        {card.content}
                    </div>
                    <div 
                        className={`
                            shrink-0 flex justify-center items-center rounded-full border border-zinc-300 dark:border-zinc-700 size-6 cursor-pointer transition-all
                            ${card.completed 
                                ? "bg-green-600 border-green-600 text-white" 
                                : "text-transparent group-hover:text-zinc-400 dark:group-hover:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            }
                        `} 
                        onClick={(e) => {
                            e.stopPropagation(); 
                            toggleCardCompletion(card.id, !card.completed)
                        }} 
                        onMouseDown={(e) => e.stopPropagation()} 
                    >
                        <GoCheck className={card.completed ? "w-4 h-4" : "w-3 h-3"} />
                    </div>
                </div>
            )}
        </Draggable>
    );
}



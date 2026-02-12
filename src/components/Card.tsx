import { Card as MuiCard, CardContent, Typography, Checkbox } from '@mui/material';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
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
    const [hover, setHover] = useState(false);
    const [toggled, setToggled] = useState(false)

    return (
        <Draggable draggableId={card.id} index={index}>
            {(provided, snapshot) => (
                <div className={`p-2 rounded-lg m-2 flex justify-between ${snapshot.isDragging ? "bg-t1" : "bg-t3"}  `} ref={provided.innerRef} onMouseEnter={()=> setHover(true)} onMouseLeave={() => setHover(false)} {...provided.draggableProps} {...provided.dragHandleProps} >
                    <div className={`${card.completed ? "line-through select-none" : ""}`}>{card.content}</div>
                    
                    {(hover || card.completed) && (
                        <div className={`${card.completed ? "bg-[#005F02]" : ""} flex justify-center items-center rounded-full border-1 border-gray-500 text-gray-100 size-6`} onClick={(e) => {e.stopPropagation(); setToggled(!toggled); toggleCardCompletion(card.id, toggled)}} onMouseDown={(e) => e.stopPropagation()} ><GoCheck/></div>
                    )}
                </div>
            )}
        </Draggable>
    );
}



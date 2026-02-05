import { Card as MuiCard, CardContent, Typography, Checkbox } from '@mui/material';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { useStore, type Card as CardType } from '../store';

interface CardProps {
    card: CardType;
    index: number;
}

export default function Card({ card, index }: CardProps) {
    const toggleCardCompletion = useStore(state => state.toggleCardCompletion);
    const [hover, setHover] = useState(false);

    return (
        <Draggable draggableId={card.id} index={index}>
            {(provided, snapshot) => (
                <MuiCard
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    onMouseEnter={() => setHover(true)}
                    onMouseLeave={() => setHover(false)}
                    sx={{
                        mb: 1,
                        bgcolor: snapshot.isDragging ? '#f4f5f7' : 'white',
                        position: 'relative',
                        ...provided.draggableProps.style
                    }}
                >
                    {(hover || card.completed) && (
                        <Checkbox
                            checked={!!card.completed}
                            onChange={(e) => {
                                e.stopPropagation(); // Prevent drag start if clicking checkbox? actually drag handle is on card, so maybe fine. 
                                // preventing propagation is good practice for buttons inside clickables
                                toggleCardCompletion(card.id, e.target.checked);
                            }}
                            onMouseDown={(e) => e.stopPropagation()} // Prevent drag
                            icon={<RadioButtonUncheckedIcon sx={{ fontSize: 20 }} />}
                            checkedIcon={<CheckCircleIcon sx={{ fontSize: 20 }} />}
                            sx={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                p: 0.5,
                                zIndex: 10,
                                color: 'text.disabled',
                                '&.Mui-checked': { color: 'success.main' },
                                bgcolor: 'rgba(255,255,255,0.8)',
                                borderRadius: '50%'
                            }}
                        />
                    )}
                    <CardContent sx={{ p: '10px !important', '&:last-child': { pb: '10px !important' } }}>
                        <Typography
                            variant="body2"
                            sx={{
                                textDecoration: card.completed ? 'line-through' : 'none',
                                color: card.completed ? 'text.disabled' : 'inherit'
                            }}
                        >
                            {card.content}
                        </Typography>
                    </CardContent>
                </MuiCard>
            )}
        </Draggable>
    );
}



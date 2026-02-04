import { Card as MuiCard, CardContent, Typography } from '@mui/material';
import { Draggable } from '@hello-pangea/dnd';
import type { Card as CardType } from '../store';

interface CardProps {
    card: CardType;
    index: number;
}

export default function Card({ card, index }: CardProps) {
    return (
        <Draggable draggableId={card.id} index={index}>
            {(provided, snapshot) => (
                <MuiCard
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    sx={{
                        mb: 1,
                        bgcolor: snapshot.isDragging ? '#f4f5f7' : 'white',
                        ...provided.draggableProps.style
                    }}
                >
                    <CardContent sx={{ p: '10px !important', '&:last-child': { pb: '10px !important' } }}>
                        <Typography variant="body2">
                            {card.content}
                        </Typography>
                    </CardContent>
                </MuiCard>
            )}
        </Draggable>
    );
}



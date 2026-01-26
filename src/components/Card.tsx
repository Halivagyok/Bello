import { Card as MuiCard, CardContent, Typography } from '@mui/material';

interface CardProps {
    content: string;
}

export default function Card({ content }: CardProps) {
    return (
        <MuiCard sx={{ mb: 2 }}>
            <CardContent>
                {/* Using Typography for better text styling capability in the future */}
                <Typography variant="body2" component="div">
                    {content}
                </Typography>
            </CardContent>
        </MuiCard>
    );
}


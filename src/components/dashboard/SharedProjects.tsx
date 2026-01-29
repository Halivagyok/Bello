import { Typography, Grid } from '@mui/material';

export default function SharedProjects() {
    return (
        <>
            <Typography variant="h5" sx={{ mb: 2 }} fontWeight="bold">Projects shared with me</Typography>
            <Grid container spacing={3}>
                <Grid size={12}>
                    <Typography color="text.secondary">No shared projects yet.</Typography>
                </Grid>
            </Grid>
        </>
    );
}

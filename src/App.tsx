import { useEffect } from 'react';
import { Button, Typography, Box } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Board from './components/Board';
import { useStore } from './store';

function App() {
  const status = useStore((state) => state.status);
  const checkBackend = useStore((state) => state.checkBackend);
  const fetchData = useStore((state) => state.fetchData);

  useEffect(() => {
    checkBackend();
    fetchData();
  }, [checkBackend, fetchData]);

  return (
    <Box sx={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: '#0079bf', // Trello-like blue background
      overflow: 'hidden' // Board scrolls internally
    }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, color: 'white' }}>
        <Typography variant="h5" color="inherit" fontWeight="bold">
          Bello
        </Typography>
        <Button
          variant="contained"
          color="success"
          size="small"
          startIcon={<CheckCircleIcon />}
          onClick={checkBackend}
        >
          Status: {status}
        </Button>
      </Box>

      <Board />
    </Box>
  );
}
export default App;
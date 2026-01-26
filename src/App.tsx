import { useState } from 'react';
import { Button, Typography, Box } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Board from './components/Board';

function App() {
  const [status, setStatus] = useState<string>("Waiting for server...");

  const checkBackend = async () => {
    try {
      // Fetch from your Bun backend
      const res = await fetch('http://localhost:3000/api/ping');
      const data = await res.json();
      setStatus(data.message);
    } catch (err) {
      setStatus("❌ Error: Could not connect to backend");
    }
  };

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
          Test Conn: {status}
        </Button>
      </Box>

      <Board />
    </Box>
  );
}
export default App;
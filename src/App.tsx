// frontend/src/App.tsx
import { useState } from 'react';
import { Button, Typography, Paper, Box } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

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
      justifyContent: 'center',
      alignItems: 'center',
      bgcolor: '#f5f5f5'
    }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center', minWidth: 300 }}>
        <Typography variant="h4" gutterBottom color="primary">
          Bello testing
        </Typography>

        <Typography variant="body1" sx={{ mb: 3, fontWeight: 'bold' }}>
          Status: {status}
        </Typography>

        <Button
          variant="contained"
          color="success"
          startIcon={<CheckCircleIcon />}
          onClick={checkBackend}
        >
          Test Connection
        </Button>
      </Paper>
    </Box>
  );
}

export default App;
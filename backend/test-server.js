const express = require('express');
const app = express();

// Basic middleware
app.use(express.json());

// Simple test route
app.get('/test', (req, res) => {
  res.json({ message: 'Test route working' });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
});

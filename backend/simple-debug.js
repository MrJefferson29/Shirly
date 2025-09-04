const express = require('express');
const app = express();

console.log('🔧 Starting simple debug server...');

// Basic middleware
app.use(express.json());

// Test basic routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Simple API is running',
    timestamp: new Date().toISOString()
  });
});

// Test route with parameter
app.get('/api/test/:id', (req, res) => {
  res.json({ 
    message: 'Parameter route working',
    id: req.params.id
  });
});

// Test route with multiple parameters
app.get('/api/test/:id/reviews', (req, res) => {
  res.json({ 
    message: 'Multi-parameter route working',
    id: req.params.id
  });
});

// Test DELETE routes
app.delete('/api/test', (req, res) => {
  res.json({ message: 'DELETE / working' });
});

app.delete('/api/test/:id', (req, res) => {
  res.json({ message: 'DELETE /:id working', id: req.params.id });
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`🚀 Simple debug server running on port ${PORT}`);
  console.log('✅ All basic routes loaded successfully');
});

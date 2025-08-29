import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('dist'));

console.log('🚀 Starting minimal server...');

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!', timestamp: new Date().toISOString() });
});

// Mock auth routes
app.post('/api/auth/signin', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'admin@assessment.local' && password === 'admin123') {
    res.json({
      user: { id: '1', email: 'admin@assessment.local', role: 'admin' },
      session: { id: 'test-session' },
      error: null
    });
  } else {
    res.status(401).json({ user: null, session: null, error: 'Invalid credentials' });
  }
});

app.get('/api/auth/user', (req, res) => {
  res.json({
    data: { user: { id: '1', email: 'admin@assessment.local', role: 'admin' } },
    error: null
  });
});

app.post('/api/auth/signout', (req, res) => {
  res.json({ error: null });
});

// Mock data endpoints
app.get('/api/profiles', (req, res) => {
  res.json([
    { id: '1', name: 'Student', type: 'student' },
    { id: '2', name: 'CEO', type: 'executive' }
  ]);
});

app.get('/api/packets', (req, res) => {
  res.json([
    { id: '1', name: 'Basic Knowledge', description: 'Fundamental concepts' },
    { id: '2', name: 'Advanced Topics', description: 'Complex scenarios' }
  ]);
});

app.get('/api/quizzes', (req, res) => {
  res.json([
    { id: '1', name: 'Sample Quiz', description: 'Test quiz' }
  ]);
});

app.get('/api/quiz-assignments', (req, res) => {
  res.json([]);
});

app.get('/api/quiz-attempts', (req, res) => {
  res.json([]);
});

// Catch-all for other routes
app.all('/api/*', (req, res) => {
  res.json({ message: `${req.method} ${req.path} - Mock endpoint`, data: [] });
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Error handling
app.use((error, req, res, next) => {
  console.error('API Error:', error);
  res.status(500).json({ 
    error: error.message || 'Internal server error',
    success: false 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Minimal server running on port ${PORT}`);
  console.log(`📊 Test API at http://localhost:${PORT}/api/test`);
  console.log(`🌐 Frontend at http://localhost:5173`);
});

export default app;

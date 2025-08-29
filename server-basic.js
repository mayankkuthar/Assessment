import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

console.log('🚀 Starting basic server...');

// Simple routes only
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!', timestamp: new Date().toISOString() });
});

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

app.get('/api/profiles', (req, res) => {
  res.json([
    { id: '1', name: 'Student', type: 'student' },
    { id: '2', name: 'CEO', type: 'executive' }
  ]);
});

app.get('/api/packets', (req, res) => {
  res.json([
    { id: '1', name: 'Basic Knowledge', description: 'Fundamental concepts' }
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

// Simple 404 handler instead of catch-all
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Basic server running on port ${PORT}`);
  console.log(`📊 Test API at http://localhost:${PORT}/api/test`);
});

export default app;

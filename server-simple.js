import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  profileService,
  packetService,
  questionService,
  quizService,
  quizPacketService,
  userService
} from './src/services/sqlite-database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('dist'));

// Error handling middleware
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Simple test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Profile Routes
app.get('/api/profiles', asyncHandler(async (req, res) => {
  const data = await profileService.getAllProfiles();
  res.json(data);
}));

app.post('/api/profiles', asyncHandler(async (req, res) => {
  const data = await profileService.createProfile(req.body);
  res.json(data);
}));

app.put('/api/profiles/:id', asyncHandler(async (req, res) => {
  const data = await profileService.updateProfile(req.params.id, req.body);
  res.json(data);
}));

app.delete('/api/profiles/:id', asyncHandler(async (req, res) => {
  await profileService.deleteProfile(req.params.id);
  res.json({ success: true });
}));

// Packet Routes
app.get('/api/packets', asyncHandler(async (req, res) => {
  const data = await packetService.getAllPackets();
  res.json(data);
}));

app.post('/api/packets', asyncHandler(async (req, res) => {
  const data = await packetService.createPacket(req.body);
  res.json(data);
}));

app.put('/api/packets/:id', asyncHandler(async (req, res) => {
  const data = await packetService.updatePacket(req.params.id, req.body);
  res.json(data);
}));

app.delete('/api/packets/:id', asyncHandler(async (req, res) => {
  await packetService.deletePacket(req.params.id);
  res.json({ success: true });
}));

// Question Routes
app.post('/api/questions', asyncHandler(async (req, res) => {
  const data = await questionService.createQuestion(req.body);
  res.json(data);
}));

app.put('/api/questions/:id', asyncHandler(async (req, res) => {
  const data = await questionService.updateQuestion(req.params.id, req.body);
  res.json(data);
}));

app.delete('/api/questions/:id', asyncHandler(async (req, res) => {
  await questionService.deleteQuestion(req.params.id);
  res.json({ success: true });
}));

// Quiz Routes
app.get('/api/quizzes', asyncHandler(async (req, res) => {
  const data = await quizService.getAllQuizzes();
  res.json(data);
}));

app.get('/api/quizzes/:id', asyncHandler(async (req, res) => {
  const data = await quizService.getQuizById(req.params.id);
  res.json(data);
}));

app.post('/api/quizzes', asyncHandler(async (req, res) => {
  const data = await quizService.createQuiz(req.body);
  res.json(data);
}));

app.put('/api/quizzes/:id', asyncHandler(async (req, res) => {
  const data = await quizService.updateQuiz(req.params.id, req.body);
  res.json(data);
}));

app.delete('/api/quizzes/:id', asyncHandler(async (req, res) => {
  await quizService.deleteQuiz(req.params.id);
  res.json({ success: true });
}));

// Quiz Assignment Routes
app.get('/api/quiz-assignments', asyncHandler(async (req, res) => {
  const data = await quizService.getAllQuizAssignments();
  res.json(data);
}));

app.post('/api/quiz-assignments', asyncHandler(async (req, res) => {
  const { quizId, profileIds } = req.body;
  await quizService.assignQuizToProfiles(quizId, profileIds);
  res.json({ success: true });
}));

app.delete('/api/quiz-assignments', asyncHandler(async (req, res) => {
  const { profileId, quizId } = req.body;
  await quizService.removeQuizAssignment(profileId, quizId);
  res.json({ success: true });
}));

// Quiz Packet Routes
app.get('/api/quiz-packets/:quizId', asyncHandler(async (req, res) => {
  const data = await quizPacketService.getQuizPackets(req.params.quizId);
  res.json(data);
}));

app.post('/api/quiz-packets/:quizId', asyncHandler(async (req, res) => {
  const { packetIds } = req.body;
  await quizPacketService.addPacketsToQuiz(req.params.quizId, packetIds);
  res.json({ success: true });
}));

app.delete('/api/quiz-packets/:quizId', asyncHandler(async (req, res) => {
  const { packetIds } = req.body;
  await quizPacketService.removePacketsFromQuiz(req.params.quizId, packetIds);
  res.json({ success: true });
}));

// User Routes
app.get('/api/users/:id/quiz-attempts', asyncHandler(async (req, res) => {
  const data = await userService.getUserQuizAttempts(req.params.id);
  res.json(data);
}));

app.get('/api/users/:id/stats', asyncHandler(async (req, res) => {
  const data = await userService.getUserStats(req.params.id);
  res.json(data);
}));

app.get('/api/users/:id/assigned-quizzes', asyncHandler(async (req, res) => {
  const data = await userService.getAssignedQuizzesForUser(req.params.id);
  res.json(data);
}));

app.get('/api/quiz-attempts', asyncHandler(async (req, res) => {
  const data = await userService.getAllQuizAttempts();
  res.json(data);
}));

app.post('/api/quiz-attempts', asyncHandler(async (req, res) => {
  const data = await userService.createQuizAttempt(req.body);
  res.json(data);
}));

// Simple auth routes for testing
app.post('/api/auth/signin', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  // Simple test auth - accept admin credentials
  if (email === 'admin@assessment.local' && password === 'admin123') {
    res.json({
      user: { id: '1', email: 'admin@assessment.local', role: 'admin' },
      session: { id: 'test-session' },
      error: null
    });
  } else {
    res.status(401).json({ user: null, session: null, error: 'Invalid credentials' });
  }
}));

app.get('/api/auth/user', (req, res) => {
  res.json({
    data: { user: { id: '1', email: 'admin@assessment.local', role: 'admin' } },
    error: null
  });
});

app.post('/api/auth/signout', (req, res) => {
  res.json({ error: null });
});

// Catch-all handler
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
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Assessment app available at http://localhost:${PORT}`);
  console.log('✅ SQLite database initialized and ready');
});

export default app;

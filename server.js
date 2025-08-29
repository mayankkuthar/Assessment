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
import { authService } from './src/services/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('dist')); // Serve built React app

// Error handling middleware
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Auth Routes
app.post('/api/auth/signup', asyncHandler(async (req, res) => {
  const { email, password, role = 'user' } = req.body;
  const result = await authService.signUp(email, password, role);
  res.json(result);
}));

app.post('/api/auth/signin', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.signIn(email, password);
  res.json(result);
}));

app.post('/api/auth/signout', asyncHandler(async (req, res) => {
  const result = await authService.signOut();
  res.json(result);
}));

app.get('/api/auth/user', asyncHandler(async (req, res) => {
  const user = authService.getUser();
  res.json({ data: { user }, error: null });
}));

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

// Catch-all handler: send back React's index.html file for client-side routing
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
  
  // Initialize default admin user
  authService.createDefaultAdmin().catch(() => {
    // Ignore if admin already exists
  });
});

export default app;

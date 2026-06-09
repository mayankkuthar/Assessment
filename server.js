import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  profileService,
  organizationService,
  employeeService,
  packetService,
  questionService,
  quizService,
  quizPacketService,
  userService
} from './src/services/sqlite-database.js';
import { authService } from './src/services/auth.js';
import { db, generateId } from './src/database/sqlite.js';

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
app.get('/api/auth/verify-code', asyncHandler(async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.status(400).json({ error: 'Code is required' });
  }
  const org = await userService.findOrganizationByCode(code.trim().toUpperCase());
  if (!org) {
    return res.status(404).json({ error: 'Invalid onboarding code' });
  }
  if (org.status !== 'active') {
    return res.status(400).json({ error: 'This organization is currently inactive' });
  }
  res.json({ id: org.id, name: org.name });
}));

app.post('/api/auth/signup', asyncHandler(async (req, res) => {
  const { email, password, role = 'user', userName, onboardingCode } = req.body;
  
  let organizationId = null;
  
  if (onboardingCode) {
    const org = await userService.findOrganizationByCode(onboardingCode.trim().toUpperCase());
    if (!org) {
      return res.status(400).json({ error: 'Invalid onboarding code' });
    }
    if (org.status !== 'active') {
      return res.status(400).json({ error: 'This organization is currently inactive' });
    }
    organizationId = org.id;

    // Cross-organization validation: check if email is registered under another org
    const checkOtherOrgStmt = db.prepare('SELECT organization_id FROM employees WHERE LOWER(email) = ?');
    const existingEmp = checkOtherOrgStmt.get(email.trim().toLowerCase());
    if (existingEmp && existingEmp.organization_id !== organizationId) {
      return res.status(400).json({ error: 'This email is already registered under a different organization.' });
    }
  }

  // Create User
  const result = await authService.signUp(email, password, role, organizationId);
  
  if (result.user && onboardingCode && organizationId) {
    // Check if employee record already exists for this organization and email
    const checkStmt = db.prepare('SELECT id FROM employees WHERE organization_id = ? AND LOWER(email) = ?');
    const existing = checkStmt.get(organizationId, email.trim().toLowerCase());
    
    if (!existing) {
      // Create employee entry automatically
      const insertStmt = db.prepare(`
        INSERT INTO employees (id, organization_id, name, email, metadata)
        VALUES (?, ?, ?, ?, ?)
      `);
      const empId = generateId();
      const metadataStr = JSON.stringify({ joined_via: 'onboarding_code' });
      insertStmt.run(empId, organizationId, userName || email.split('@')[0], email.trim(), metadataStr);
    }
  }

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

// Organization Routes
app.get('/api/organizations', asyncHandler(async (req, res) => {
  const data = await organizationService.getAllOrganizations();
  res.json(data);
}));

app.post('/api/organizations', asyncHandler(async (req, res) => {
  const data = await organizationService.createOrganization(req.body);
  res.json(data);
}));

app.put('/api/organizations/:id', asyncHandler(async (req, res) => {
  const data = await organizationService.updateOrganization(req.params.id, req.body);
  res.json(data);
}));

app.delete('/api/organizations/:id', asyncHandler(async (req, res) => {
  await organizationService.deleteOrganization(req.params.id);
  res.json({ success: true });
}));

app.post('/api/organizations/:id/regenerate-code', asyncHandler(async (req, res) => {
  const data = await organizationService.regenerateOnboardingCode(req.params.id);
  res.json(data);
}));

// Employee Routes
app.get('/api/organizations/:orgId/employees', asyncHandler(async (req, res) => {
  const data = await employeeService.getEmployeesByOrg(req.params.orgId);
  res.json(data);
}));

app.post('/api/organizations/:orgId/employees/import', asyncHandler(async (req, res) => {
  const data = await employeeService.importEmployees(req.params.orgId, req.body.employees);
  res.json(data);
}));

app.delete('/api/employees/:id', asyncHandler(async (req, res) => {
  await employeeService.deleteEmployee(req.params.id);
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

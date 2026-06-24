import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';


// ES6 module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Data file path
const DATA_FILE = path.join(process.cwd(), 'mock-data.json');

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')));

console.log('🚀 Starting production server...');

// Data persistence functions
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      return {
        users: data.users || [],
        profiles: data.profiles || [],
        packets: data.packets || [],
        questions: data.questions || [],
        quizzes: data.quizzes || [],
        quizAssignments: data.quizAssignments || [],
        quizAttempts: data.quizAttempts || []
      };
    }
  } catch (error) {
    console.log('⚠️ Error loading data, using defaults:', error.message);
  }
  
  // Default data
  return {
    users: [
      { id: '1', email: 'admin@assessment.local', password: 'admin123', role: 'admin' },
      { id: '2', email: 'user@assessment.local', password: 'user123', role: 'user' }
    ],
    profiles: [],
    packets: [],
    questions: [],
    quizzes: [],
    quizAssignments: [],
    quizAttempts: []
  };
}

function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving data:', error);
    return false;
  }
}

// Load initial data
let data = loadData();

// Ensure all user passwords are hashed with bcrypt
if (data.users) {
  let migrated = false;
  data.users.forEach(u => {
    if (u.password && typeof u.password === 'string') {
      const isHashed = u.password.startsWith('$2a$') || u.password.startsWith('$2b$') || u.password.startsWith('$2y$');
      if (!isHashed) {
        console.log(`🔐 Hashing password for user: ${u.email}`);
        u.password = bcrypt.hashSync(u.password, 10);
        migrated = true;
      }
    }
  });
  if (migrated) {
    console.log('✅ Migrating mockData in production server: Hashed all plain text user passwords');
    saveData(data);
  }
}

console.log('📂 Loaded persistent data:', {
  users: data.users.length,
  profiles: data.profiles.length,
  packets: data.packets.length,
  questions: data.questions.length,
  quizzes: data.quizzes.length
});

// API Routes
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Assessment API is running!', 
    timestamp: new Date().toISOString(),
    data: {
      users: data.users.length,
      profiles: data.profiles.length,
      packets: data.packets.length,
      questions: data.questions.length,
      quizzes: data.quizzes.length
    }
  });
});

// Auth routes
app.post('/api/auth/signin', async (req, res) => {
  const { email, password } = req.body;
  const user = data.users.find(u => u.email && u.email.toLowerCase() === (email || '').trim().toLowerCase());
  
  let isValid = false;
  if (user && password && user.password) {
    const isHashed = user.password.startsWith('$2a$') || user.password.startsWith('$2b$') || user.password.startsWith('$2y$');
    if (isHashed) {
      isValid = await bcrypt.compare(password, user.password);
    } else {
      isValid = user.password === password;
    }
  }
  
  if (isValid) {
    res.json({ 
      success: true, 
      user: { id: user.id, email: user.email, role: user.role },
      message: 'Login successful'
    });
  } else {
    res.status(401).json({ 
      success: false, 
      message: 'Invalid credentials' 
    });
  }
});


// Profile routes
app.get('/api/profiles', (req, res) => {
  res.json({ data: data.profiles, error: null });
});

app.post('/api/profiles', (req, res) => {
  const newProfile = {
    id: Date.now().toString(),
    ...req.body,
    created_at: new Date().toISOString()
  };
  data.profiles.push(newProfile);
  saveData(data);
  res.json({ data: newProfile, error: null });
});

// Packet routes
app.get('/api/packets', (req, res) => {
  res.json({ data: data.packets, error: null });
});

app.post('/api/packets', (req, res) => {
  const newPacket = {
    id: Date.now().toString(),
    ...req.body,
    created_at: new Date().toISOString()
  };
  data.packets.push(newPacket);
  saveData(data);
  res.json({ data: newPacket, error: null });
});

// Question routes
app.post('/api/questions', (req, res) => {
  const newQuestion = {
    id: Date.now().toString(),
    ...req.body,
    created_at: new Date().toISOString()
  };
  data.questions.push(newQuestion);
  saveData(data);
  res.json({ data: newQuestion, error: null });
});

// Quiz routes
app.get('/api/quizzes', (req, res) => {
  res.json({ data: data.quizzes, error: null });
});

app.post('/api/quizzes', (req, res) => {
  const newQuiz = {
    id: Date.now().toString(),
    ...req.body,
    created_at: new Date().toISOString()
  };
  data.quizzes.push(newQuiz);
  saveData(data);
  res.json({ data: newQuiz, error: null });
});

// Quiz attempt routes
app.get('/api/quiz-attempts', (req, res) => {
  res.json({ data: data.quizAttempts, error: null });
});

app.post('/api/quiz-attempts', (req, res) => {
  const newAttempt = {
    id: Date.now().toString(),
    ...req.body,
    created_at: new Date().toISOString()
  };
  data.quizAttempts.push(newAttempt);
  saveData(data);
  res.json({ data: newAttempt, error: null });
});

// Catch-all handler: serve React app
app.get('*any', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});


app.listen(PORT, () => {
  console.log(`🚀 Production server running on port ${PORT}`);
  console.log(`📊 Assessment app available at http://localhost:${PORT}`);
  console.log('✅ JSON database initialized and ready');
});

export default app;

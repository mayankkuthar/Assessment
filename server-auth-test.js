import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES6 module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Data file path
const DATA_FILE = path.join(process.cwd(), 'mock-data.json');

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for base64 images
app.use(express.urlencoded({ limit: '50mb', extended: true }));

console.log('🚀 Starting auth test server...');

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
    profiles: [
      {
        id: '1755719138905',
        name: 'Senior Citizen',
        email: 'new@example.com',
        role: 'general',
        created_at: new Date().toISOString()
      },
      {
        id: '1755719178991',
        name: 'CU Student',
        email: 'new@example.com',
        role: 'student',
        created_at: new Date().toISOString()
      },
      {
        id: '1755719209738',
        name: 'HCL',
        email: 'new@example.com',
        role: 'employee',
        created_at: new Date().toISOString()
      }
    ],
    packets: [
      { 
        id: '1755719317656', 
        name: 'Logical Reasoning', 
        description: 'Logical reasoning and analytical thinking questions',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      { 
        id: '1755719366320', 
        name: 'General Question', 
        description: 'General knowledge and basic concepts',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      { 
        id: '1755719404031', 
        name: 'Work Life Balance', 
        description: 'Questions about maintaining work-life balance',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ],
    questions: [
      { 
        id: '1', 
        packet_id: '1755719317656',
        question: 'If all roses are flowers and some flowers fade quickly, which statement is true?', 
        question_text: 'If all roses are flowers and some flowers fade quickly, which statement is true?',
        type: 'multiple_choice',
        question_type: 'mcq',
        options: [
          { text: 'All flowers are roses', marks: 1, isCorrect: false },
          { text: 'Some roses fade quickly', marks: 3, isCorrect: true },
          { text: 'All flowers fade quickly', marks: 2, isCorrect: false },
          { text: 'None of the above', marks: 1, isCorrect: false }
        ],
        correct_answer: 'Some roses fade quickly',
        marks: 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      { 
        id: '2', 
        packet_id: '1755719317656',
        question: 'Find the missing number: 2, 6, 12, 20, ?', 
        question_text: 'Find the missing number: 2, 6, 12, 20, ?',
        type: 'multiple_choice',
        question_type: 'mcq',
        options: [ '28', '20', '30', '32' ],
        correct_answer: '28',
        marks: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      { 
        id: '3', 
        packet_id: '1755719317656',
        question: 'In a certain code, CAT = 24 and DOG = 26. What is BAT?', 
        question_text: 'In a certain code, CAT = 24 and DOG = 26. What is BAT?',
        type: 'multiple_choice',
        question_type: 'mcq',
        options: [ '22', '23', '24', '25' ],
        correct_answer: '23',
        marks: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      { 
        id: '4', 
        packet_id: '1755719317656',
        question: 'If A is B\'s father, B is C\'s brother, and C is D\'s mother, what is A\'s relation to D?', 
        question_text: 'If A is B\'s father, B is C\'s brother, and C is D\'s mother, what is A\'s relation to D?',
        type: 'multiple_choice',
        question_type: 'mcq',
        options: [ 'Grandfather', 'Father', 'Uncle', 'Cannot be determined' ],
        correct_answer: 'Grandfather',
        marks: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      { 
        id: '5', 
        packet_id: '1755719317656',
        question: 'In syllogisms, if all A are B and all B are C, then all A are C.', 
        question_text: 'In syllogisms, if all A are B and all B are C, then all A are C.',
        type: 'true_false',
        question_type: 'true_false',
        options: [
          { text: 'True', marks: 3, isCorrect: true },
          { text: 'False', marks: 2, isCorrect: false }
        ],
        correct_answer: 'true',
        marks: 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      { 
        id: '6', 
        packet_id: '1755719317656',
        question: 'If the average of three numbers is 20, their total is 60.', 
        question_text: 'If the average of three numbers is 20, their total is 60.',
        type: 'true_false',
        question_type: 'true_false',
        options: null,
        correct_answer: 'true',
        marks: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      { 
        id: '7', 
        packet_id: '1755719317656',
        question: 'An even number multiplied by an odd number is always odd.', 
        question_text: 'An even number multiplied by an odd number is always odd.',
        type: 'true_false',
        question_type: 'true_false',
        options: null,
        correct_answer: 'false',
        marks: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      { 
        id: '8', 
        packet_id: '1755719366320',
        question: 'Who is known as the "Father of Computers"?', 
        question_text: 'Who is known as the "Father of Computers"?',
        type: 'multiple_choice',
        question_type: 'mcq',
        options: [ 'Charles Babbage', 'Alan Turing', 'Bill Gates', 'Steve Jobs' ],
        correct_answer: 'Charles Babbage',
        marks: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      { 
        id: '9', 
        packet_id: '1755719366320',
        question: 'Which planet is known as the Red Planet?', 
        question_text: 'Which planet is known as the Red Planet?',
        type: 'multiple_choice',
        question_type: 'mcq',
        options: [ 'Venus', 'Mars', 'Jupiter', 'Saturn' ],
        correct_answer: 'Mars',
        marks: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      { 
        id: '10', 
        packet_id: '1755719366320',
        question: 'The Sun rises in the west.', 
        question_text: 'The Sun rises in the west.',
        type: 'true_false',
        question_type: 'true_false',
        options: null,
        correct_answer: 'false',
        marks: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      { 
        id: '11', 
        packet_id: '1755719366320',
        question: 'Water boils at 100°C at sea level.', 
        question_text: 'Water boils at 100°C at sea level.',
        type: 'true_false',
        question_type: 'true_false',
        options: null,
        correct_answer: 'true',
        marks: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      { 
        id: '12', 
        packet_id: '1755719366320',
        question: 'Mount Everest is the highest peak on Earth.', 
        question_text: 'Mount Everest is the highest peak on Earth.',
        type: 'true_false',
        question_type: 'true_false',
        options: null,
        correct_answer: 'true',
        marks: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      { 
        id: '13', 
        packet_id: '1755719404031',
        question: 'Which of the following best describes work-life balance?', 
        question_text: 'Which of the following best describes work-life balance?',
        type: 'multiple_choice',
        question_type: 'mcq',
        options: [
          'Spending equal hours on work and personal life',
          'Prioritizing work over personal life',
          'Maintaining harmony between work and personal responsibilities',
          'Avoiding work completely'
        ],
        correct_answer: 'Maintaining harmony between work and personal responsibilities',
        marks: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      { 
        id: '14', 
        packet_id: '1755719404031',
        question: 'Work-life balance is the same for everyone.', 
        question_text: 'Work-life balance is the same for everyone.',
        type: 'true_false',
        question_type: 'true_false',
        options: null,
        correct_answer: 'false',
        marks: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      { 
        id: '15', 
        packet_id: '1755719404031',
        question: 'Remote work can sometimes improve work-life balance.', 
        question_text: 'Remote work can sometimes improve work-life balance.',
        type: 'true_false',
        question_type: 'true_false',
        options: null,
        correct_answer: 'true',
        marks: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      { 
        id: '16', 
        packet_id: '1755719404031',
        question: 'More working hours always mean better productivity.', 
        question_text: 'More working hours always mean better productivity.',
        type: 'true_false',
        question_type: 'true_false',
        options: null,
        correct_answer: 'false',
        marks: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ],
    quizzes: [
      { 
        id: '1755720038805', 
        name: 'Happi Test', 
        description: 'Comprehensive assessment covering multiple topics',
        time_limit: null,
        total_questions: 16,
        passing_score: 70,
        packet_ids: ['1755719317656', '1755719366320', '1755719404031'],
        report_header: '',
        report_footer: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ],
         quizAssignments: [
       { 
         id: '1', 
         quiz_id: '1',
         profile_id: '1',
         assigned_at: new Date().toISOString(),
         due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
         status: 'assigned',
         created_at: new Date().toISOString(),
         updated_at: new Date().toISOString()
       }
     ],
                   quizAttempts: []
  };
}

function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    console.log('💾 Data saved successfully');
  } catch (error) {
    console.log('❌ Error saving data:', error.message);
  }
}

// Load initial data
let mockData = loadData();
console.log('📂 Loaded persistent data:', {
  users: mockData.users.length,
  profiles: mockData.profiles.length,
  packets: mockData.packets.length,
  questions: mockData.questions.length,
  quizzes: mockData.quizzes.length
});

// Simple test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Auth server is working!', timestamp: new Date().toISOString() });
});

// Auth routes
app.post('/api/auth/signin', (req, res) => {
  const { email, password } = req.body;
  console.log(`🔐 Sign in attempt: ${email}`);
  
  const user = mockData.users.find(u => u.email === email && u.password === password);
  
  if (user) {
    const { password: _, ...userWithoutPassword } = user;
    console.log(`✅ Login successful for: ${email}`);
    res.json({
      user: userWithoutPassword,
      session: { id: 'mock-session-' + user.id },
      error: null
    });
  } else {
    console.log(`❌ Login failed for: ${email}`);
    res.status(401).json({
      user: null,
      session: null,
      error: 'Invalid email or password'
    });
  }
});

app.post('/api/auth/signup', (req, res) => {
  const { email, password, role = 'user', user_name, profile } = req.body;
  console.log(`📝 Sign up attempt: ${email} as ${role}`);
  
  // Check if user already exists
  const existingUser = mockData.users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({
      user: null,
      session: null,
      error: 'User already exists'
    });
  }
  
  // Check if the selected profile exists
  const existingProfile = mockData.profiles.find(p => p.name === profile);
  if (!existingProfile) {
    return res.status(400).json({
      user: null,
      session: null,
      error: `Profile "${profile}" does not exist. Please select from available profiles.`
    });
  }
  
  // Create new user
  const userId = String(Date.now());
  const newUser = {
    id: userId,
    email,
    password,
    role,
    user_name: user_name || email.split('@')[0],
    profile: profile // Store the profile name for reference
  };
  mockData.users.push(newUser);
  
  // Save data
  saveData(mockData);
  
  const { password: _, ...userWithoutPassword } = newUser;
  res.json({
    user: userWithoutPassword,
    session: { id: 'mock-session-' + newUser.id },
    error: null
  });
});

app.post('/api/auth/signout', (req, res) => {
  console.log('👋 Sign out');
  res.json({ error: null });
});

app.get('/api/auth/user', (req, res) => {
  console.log('🔍 Get current user');
  // For now, return null - no persistent session management
  res.json({
    data: { user: null },
    error: null
  });
});

// Mock data endpoints to prevent errors
app.get('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  console.log(`👤 Get user ${userId}`);
  
  const user = mockData.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  // Return user data without password
  const { password, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

app.get('/api/profiles', (req, res) => {
  console.log('📋 Get profiles');
  res.json(mockData.profiles);
});

// Create new profile route
app.post('/api/profiles', (req, res) => {
  const newProfile = req.body;
  const newId = String(Date.now()); // Generate a simple ID
  console.log(`➕ Create new profile:`, newProfile);
  
  const profile = {
    id: newId,
    name: newProfile.name || 'New Profile',
    email: newProfile.email || 'new@example.com',
    role: newProfile.role || 'student',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  mockData.profiles.push(profile);
  saveData(mockData);
  
  res.status(201).json(profile);
});

// Update profile route
app.put('/api/profiles/:id', (req, res) => {
  const profileId = req.params.id;
  const updateData = req.body;
  console.log(`✏️ Update profile ${profileId}:`, updateData);
  
  const profileIndex = mockData.profiles.findIndex(p => p.id === profileId);
  if (profileIndex === -1) {
    return res.status(404).json({ error: 'Profile not found' });
  }
  
  mockData.profiles[profileIndex] = {
    ...mockData.profiles[profileIndex],
    name: updateData.name || mockData.profiles[profileIndex].name,
    email: updateData.email || mockData.profiles[profileIndex].email,
    role: updateData.role || mockData.profiles[profileIndex].role,
    updated_at: new Date().toISOString()
  };
  
  saveData(mockData);
  res.json(mockData.profiles[profileIndex]);
});

// Delete profile route
app.delete('/api/profiles/:id', (req, res) => {
  const profileId = req.params.id;
  console.log(`🗑️ Delete profile ${profileId}`);
  
  const profileIndex = mockData.profiles.findIndex(p => p.id === profileId);
  if (profileIndex === -1) {
    return res.status(404).json({ error: 'Profile not found' });
  }
  
  mockData.profiles.splice(profileIndex, 1);
  saveData(mockData);
  
  res.json({
    success: true,
    message: `Profile ${profileId} deleted successfully`,
    deleted_id: profileId
  });
});

// Packets CRUD operations
app.get('/api/packets', (req, res) => {
  console.log('📦 Get packets');
  
  // Add questions to each packet and preserve all packet fields including scoringScale
  const packetsWithQuestions = mockData.packets.map(packet => {
    const packetQuestions = mockData.questions.filter(q => q.packet_id === packet.id);
    return {
      ...packet, // This preserves all fields including scoringScale, enableScoringScale
      questions: packetQuestions
    };
  });
  
  res.json(packetsWithQuestions);
});

app.post('/api/packets', (req, res) => {
  const newPacket = req.body;
  const newId = String(Date.now());
  console.log(`➕ Create new packet:`, newPacket);
  
  const packet = {
    id: newId,
    name: newPacket.name || 'New Packet',
    description: newPacket.description || 'New description',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  mockData.packets.push(packet);
  saveData(mockData);
  
  res.status(201).json(packet);
});

app.put('/api/packets/:id', (req, res) => {
  const packetId = req.params.id;
  const updateData = req.body;
  console.log(`✏️ Update packet ${packetId}:`, updateData);
  console.log(`📊 Scoring scale data:`, updateData.scoringScale);
  console.log(`🔧 Enable scoring scale:`, updateData.enableScoringScale);
  
  // Debug: Log the current packet before update
  const currentPacket = mockData.packets.find(p => p.id === packetId);
  console.log(`🔍 Current packet before update:`, {
    id: currentPacket?.id,
    name: currentPacket?.name,
    description: currentPacket?.description,
    questionCount: currentPacket?.questions?.length || 0,
    hasScoringScale: !!currentPacket?.scoringScale
  });
  
  const packetIndex = mockData.packets.findIndex(p => p.id === packetId);
  if (packetIndex === -1) {
    return res.status(404).json({ error: 'Packet not found' });
  }
  
  // Create a safe update that preserves all existing fields
  const existingPacket = mockData.packets[packetIndex];
  const updatedPacket = {
    ...existingPacket, // Preserve ALL existing fields including questions
    updated_at: new Date().toISOString()
  };
  
  // Only update the fields that are provided in updateData
  if (updateData.name !== undefined) updatedPacket.name = updateData.name;
  if (updateData.description !== undefined) updatedPacket.description = updateData.description;
  if (updateData.scoringScale !== undefined) updatedPacket.scoringScale = updateData.scoringScale;
  if (updateData.enableScoringScale !== undefined) updatedPacket.enableScoringScale = updateData.enableScoringScale;
  
  // Ensure questions are preserved by fetching them from the questions array
  const packetQuestions = mockData.questions.filter(q => q.packet_id === packetId);
  updatedPacket.questions = packetQuestions;
  
  mockData.packets[packetIndex] = updatedPacket;
  
  saveData(mockData);
  
  // Debug: Log the updated packet after update
  const finalPacket = mockData.packets[packetIndex];
  console.log(`✅ Packet updated successfully. New data:`, {
    id: finalPacket.id,
    name: finalPacket.name,
    description: finalPacket.description,
    questionCount: finalPacket.questions?.length || 0,
    hasScoringScale: !!finalPacket.scoringScale,
    scoringScaleLength: finalPacket.scoringScale?.length || 0
  });
  
  res.json(finalPacket);
});

app.delete('/api/packets/:id', (req, res) => {
  const packetId = req.params.id;
  console.log(`🗑️ Delete packet ${packetId}`);
  
  const packetIndex = mockData.packets.findIndex(p => p.id === packetId);
  if (packetIndex === -1) {
    return res.status(404).json({ error: 'Packet not found' });
  }
  
  mockData.packets.splice(packetIndex, 1);
  saveData(mockData);
  
  res.json({
    success: true,
    message: `Packet ${packetId} deleted successfully`,
    deleted_id: packetId
  });
});

// Questions CRUD operations
app.get('/api/questions', (req, res) => {
  console.log('❓ Get questions');
  
  const { packet_id } = req.query;
  
  if (packet_id) {
    // Filter questions by packet_id
    const filteredQuestions = mockData.questions.filter(q => q.packet_id === packet_id);
    res.json(filteredQuestions);
  } else {
    // Return all questions
    res.json(mockData.questions);
  }
});

app.post('/api/questions', (req, res) => {
  const newQuestion = req.body;
  const newId = String(Date.now());
  console.log(`➕ Create new question:`, newQuestion);
  console.log(`🔍 Question type:`, newQuestion.question_type);
  console.log(`🔍 Options array:`, newQuestion.options);
  console.log(`🔍 Options length:`, newQuestion.options?.length);
  console.log(`🔍 Options is array:`, Array.isArray(newQuestion.options));
  console.log(`🔍 Each option:`, newQuestion.options?.map(opt => ({ text: opt.text, marks: opt.marks, type: typeof opt.marks })));
  
  // Handle both frontend field names and expected format
  const questionText = newQuestion.question_text || newQuestion.question || 'New Question';
  const questionType = newQuestion.question_type || newQuestion.type || 'multiple_choice';
  const packetId = newQuestion.packet_id || null;
  
  // Handle options with individual marks
  let options = [];
  let totalMarks = 0;
  
  if (newQuestion.options && Array.isArray(newQuestion.options) && newQuestion.options.length > 0) {
    // New format with individual option marks
    console.log('🔍 Processing options with marks:', newQuestion.options.map(opt => ({ text: opt.text, marks: opt.marks, type: typeof opt.marks })));
    console.log('🔍 First option structure:', newQuestion.options[0]);
    console.log('🔍 Has text property:', newQuestion.options[0]?.hasOwnProperty('text'));
    console.log('🔍 Has marks property:', newQuestion.options[0]?.hasOwnProperty('marks'));
    
    // Additional validation to ensure options have the correct structure
    const hasValidStructure = newQuestion.options.every(opt => 
      opt && typeof opt === 'object' && 
      opt.hasOwnProperty('text') && 
      opt.hasOwnProperty('marks')
    );
    
    console.log('🔍 Options have valid structure:', hasValidStructure);
    
    if (hasValidStructure) {
      options = newQuestion.options.map(opt => {
        const parsedMarks = parseInt(opt.marks);
        const finalMarks = isNaN(parsedMarks) ? 0 : parsedMarks;
        console.log(`🔍 Option "${opt.text}": original=${opt.marks}, parsed=${parsedMarks}, final=${finalMarks}`);
        return {
          text: opt.text || opt,
          marks: finalMarks
        };
      });
      totalMarks = options.reduce((sum, opt) => sum + opt.marks, 0);
      console.log('🔍 Final options:', options);
      console.log('🔍 Total marks calculated:', totalMarks);
    } else {
      console.log('🔍 Options structure invalid, falling back to old format');
      // Fall back to old format
      if (questionType === 'mcq' || questionType === 'multiple_choice') {
        options = ['Option A', 'Option B', 'Option C', 'Option D'];
      } else if (questionType === 'true_false') {
        options = ['True', 'False'];
      }
      totalMarks = newQuestion.marks || 0;
    }
  } else {
    console.log('🔍 Falling back to old format - options not recognized');
    console.log('🔍 Options received:', newQuestion.options);
    console.log('🔍 Options type:', typeof newQuestion.options);
    console.log('🔍 Options is array:', Array.isArray(newQuestion.options));
    console.log('🔍 Options length:', newQuestion.options?.length);
    // Fallback to old format
    if (questionType === 'mcq' || questionType === 'multiple_choice') {
      options = ['Option A', 'Option B', 'Option C', 'Option D'];
    } else if (questionType === 'true_false') {
      options = ['True', 'False'];
    }
    totalMarks = newQuestion.marks || 0;
  }
  
  const question = {
    id: newId,
    packet_id: packetId,
    question: questionText,
    question_text: questionText,
    type: questionType,
    question_type: questionType,
    options: options,
    marks: totalMarks, // Total marks for the question
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  mockData.questions.push(question);
  saveData(mockData);
  
  res.status(201).json(question);
});

app.put('/api/questions/:id', (req, res) => {
  const questionId = req.params.id;
  const updateData = req.body;
  console.log(`✏️ Update question ${questionId}:`, updateData);
  console.log(`🔍 Question type:`, updateData.question_type);
  console.log(`🔍 Options array:`, updateData.options);
  console.log(`🔍 Options length:`, updateData.options?.length);
  console.log(`🔍 Options is array:`, Array.isArray(updateData.options));
  console.log(`🔍 Each option:`, updateData.options?.map(opt => ({ text: opt.text, marks: opt.marks, type: typeof opt.marks })));
  
  // Handle both frontend field names and expected format
  const questionText = updateData.question_text || updateData.question || 'Updated Question';
  const questionType = updateData.question_type || updateData.type || 'multiple_choice';
  const packetId = updateData.packet_id || null;
  
  // Debug: Check all available question IDs
  console.log(`🔍 Available question IDs:`, mockData.questions.map(q => q.id));
  console.log(`🔍 Looking for question ID:`, questionId);
  console.log(`🔍 Question ID type:`, typeof questionId);
  
  // Find the question index first
  const questionIndex = mockData.questions.findIndex(q => {
    console.log(`🔍 Comparing ${q.id} (${typeof q.id}) with ${questionId} (${typeof questionId})`);
    return q.id === questionId;
  });
  
  console.log(`🔍 Question index found:`, questionIndex);
  
  if (questionIndex === -1) {
    console.log(`❌ Question not found with ID: ${questionId}`);
    console.log(`❌ Available IDs:`, mockData.questions.map(q => q.id));
    return res.status(404).json({ error: 'Question not found' });
  }
  
  // Handle options with individual marks
  let options = [];
  let totalMarks = 0;
  
  if (updateData.options && Array.isArray(updateData.options) && updateData.options.length > 0) {
    // New format with individual option marks
    console.log('🔍 Processing update options with marks:', updateData.options.map(opt => ({ text: opt.text, marks: opt.marks, type: typeof opt.marks })));
    console.log('🔍 First update option structure:', updateData.options[0]);
    console.log('🔍 Has text property:', updateData.options[0]?.hasOwnProperty('text'));
    console.log('🔍 Has marks property:', updateData.options[0]?.hasOwnProperty('marks'));
    
    // Additional validation to ensure options have the correct structure
    const hasValidStructure = updateData.options.every(opt => 
      opt && typeof opt === 'object' && 
      opt.hasOwnProperty('text') && 
      opt.hasOwnProperty('marks')
    );
    
    console.log('🔍 Update options have valid structure:', hasValidStructure);
    
    if (hasValidStructure) {
      options = updateData.options.map(opt => {
        const parsedMarks = parseInt(opt.marks);
        const finalMarks = isNaN(parsedMarks) ? 0 : parsedMarks;
        console.log(`🔍 Update option "${opt.text}": original=${opt.marks}, parsed=${parsedMarks}, final=${finalMarks}`);
        return {
          text: opt.text || opt,
          marks: finalMarks
        };
      });
      totalMarks = options.reduce((sum, opt) => sum + opt.marks, 0);
      console.log('🔍 Final update options:', options);
      console.log('🔍 Total update marks calculated:', totalMarks);
    } else {
      console.log('🔍 Update options structure invalid, falling back to old format');
      // Fall back to old format
      if (questionType === 'mcq' || questionType === 'multiple_choice') {
        options = ['Option A', 'Option B', 'Option C', 'Option D'];
      } else if (questionType === 'true_false') {
        options = ['True', 'False'];
      }
      totalMarks = updateData.marks || mockData.questions[questionIndex]?.marks || 0;
    }
  } else {
    console.log('🔍 Falling back to old format for update - options not recognized');
    console.log('🔍 Update options received:', updateData.options);
    console.log('🔍 Update options type:', typeof updateData.options);
    console.log('🔍 Update options is array:', Array.isArray(updateData.options));
    console.log('🔍 Update options length:', updateData.options?.length);
    // Fallback to old format
    if (questionType === 'mcq' || questionType === 'multiple_choice') {
      options = ['Option A', 'Option B', 'Option C', 'Option D'];
    } else if (questionType === 'true_false') {
      options = ['True', 'False'];
    }
    totalMarks = updateData.marks || mockData.questions[questionIndex]?.marks || 0;
  }
  if (questionIndex === -1) {
    return res.status(404).json({ error: 'Question not found' });
  }
  
  mockData.questions[questionIndex] = {
    ...mockData.questions[questionIndex],
    packet_id: packetId,
    question: questionText,
    question_text: questionText,
    type: questionType,
    question_type: questionType,
    options: options,
    marks: totalMarks, // Total marks for the question
    updated_at: new Date().toISOString()
  };
  
  saveData(mockData);
  res.json(mockData.questions[questionIndex]);
});

app.delete('/api/questions/:id', (req, res) => {
  const questionId = req.params.id;
  console.log(`🗑️ Delete question ${questionId}`);
  
  const questionIndex = mockData.questions.findIndex(q => q.id === questionId);
  if (questionIndex === -1) {
    return res.status(404).json({ error: 'Question not found' });
  }
  
  mockData.questions.splice(questionIndex, 1);
  saveData(mockData);
  
  res.json({
    success: true,
    message: `Question ${questionId} deleted successfully`,
    deleted_id: questionId
  });
});

// Quizzes CRUD operations
app.get('/api/quizzes', (req, res) => {
  console.log('📝 Get quizzes');
  res.json(mockData.quizzes);
});

app.get('/api/quizzes/:id', (req, res) => {
  const quizId = req.params.id;
  console.log(`📝 Get quiz ${quizId}`);
  
  const quiz = mockData.quizzes.find(q => q.id === quizId);
  if (!quiz) {
    return res.status(404).json({ error: 'Quiz not found' });
  }
  
  res.json(quiz);
});

app.post('/api/quizzes', (req, res) => {
  const newQuiz = req.body;
  const newId = String(Date.now());
  console.log(`➕ Create new quiz:`, newQuiz);
  
  const quiz = {
    id: newId,
    name: newQuiz.name || 'New Quiz',
    description: newQuiz.description || 'New quiz description',
    time_limit: newQuiz.time_limit || 30,
    total_questions: newQuiz.total_questions || 0,
    passing_score: newQuiz.passing_score || 70,
    report_header: newQuiz.report_header || '',
    report_footer: newQuiz.report_footer || '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  mockData.quizzes.push(quiz);
  saveData(mockData);
  
  res.status(201).json(quiz);
});

app.put('/api/quizzes/:id', (req, res) => {
  const quizId = req.params.id;
  const updateData = req.body;
  console.log(`✏️ Update quiz ${quizId}:`, updateData);
  
  const quizIndex = mockData.quizzes.findIndex(q => q.id === quizId);
  if (quizIndex === -1) {
    return res.status(404).json({ error: 'Quiz not found' });
  }
  
  mockData.quizzes[quizIndex] = {
    ...mockData.quizzes[quizIndex],
    name: updateData.name || mockData.quizzes[quizIndex].name,
    description: updateData.description || mockData.quizzes[quizIndex].description,
    time_limit: updateData.time_limit || mockData.quizzes[quizIndex].time_limit,
    total_questions: updateData.total_questions || mockData.quizzes[quizIndex].total_questions,
    passing_score: updateData.passing_score || mockData.quizzes[quizIndex].passing_score,
    report_header: updateData.report_header !== undefined ? updateData.report_header : mockData.quizzes[quizIndex].report_header,
    report_footer: updateData.report_footer !== undefined ? updateData.report_footer : mockData.quizzes[quizIndex].report_footer,
    updated_at: new Date().toISOString()
  };
  
  saveData(mockData);
  res.json(mockData.quizzes[quizIndex]);
});

app.delete('/api/quizzes/:id', (req, res) => {
  const quizId = req.params.id;
  console.log(`🗑️ Delete quiz ${quizId}`);
  
  const quizIndex = mockData.quizzes.findIndex(q => q.id === quizId);
  if (quizIndex === -1) {
    return res.status(404).json({ error: 'Quiz not found' });
  }
  
  mockData.quizzes.splice(quizIndex, 1);
  saveData(mockData);
  
  res.json({
    success: true,
    message: `Quiz ${quizId} deleted successfully`,
    deleted_id: quizId
  });
});

// Quiz Packets CRUD operations (for linking quizzes to packets)
app.get('/api/quiz-packets/:quizId', (req, res) => {
  const quizId = req.params.quizId;
  console.log(`📦 Get quiz packets for quiz ${quizId}`);
  
  // Find the quiz
  const quiz = mockData.quizzes.find(q => q.id === quizId);
  if (!quiz) {
    return res.status(404).json({ error: 'Quiz not found' });
  }
  
  // Get the packets associated with this quiz
  const packetIds = quiz.packet_ids || [];
  const packets = mockData.packets.filter(p => packetIds.includes(p.id));
  
  // Add question count to each packet
  const packetsWithQuestionCount = packets.map(packet => {
    const questionCount = mockData.questions.filter(q => q.packet_id === packet.id).length;
    return {
      ...packet,
      questionCount
    };
  });
  
  res.json(packetsWithQuestionCount);
});

app.post('/api/quiz-packets/:quizId', (req, res) => {
  const quizId = req.params.quizId;
  const { packetIds } = req.body;
  console.log(`🔗 Link quiz ${quizId} to packets:`, packetIds);
  
  // Find the quiz
  const quizIndex = mockData.quizzes.findIndex(q => q.id === quizId);
  if (quizIndex === -1) {
    return res.status(404).json({ error: 'Quiz not found' });
  }
  
  // Update quiz with packet association
  mockData.quizzes[quizIndex] = {
    ...mockData.quizzes[quizIndex],
    packet_ids: packetIds || [],
    updated_at: new Date().toISOString()
  };
  
  saveData(mockData);
  
  res.status(201).json({
    success: true,
    message: `Quiz ${quizId} linked to packets successfully`,
    quiz: mockData.quizzes[quizIndex]
  });
});

app.delete('/api/quiz-packets/:quizId', (req, res) => {
  const quizId = req.params.quizId;
  const { packetIds } = req.body;
  console.log(`🗑️ Remove packets from quiz ${quizId}:`, packetIds);
  
  // Find the quiz
  const quizIndex = mockData.quizzes.findIndex(q => q.id === quizId);
  if (quizIndex === -1) {
    return res.status(404).json({ error: 'Quiz not found' });
  }
  
  // Remove the specified packet IDs from the quiz
  const currentPacketIds = mockData.quizzes[quizIndex].packet_ids || [];
  const updatedPacketIds = currentPacketIds.filter(id => !packetIds.includes(id));
  
  // Update quiz with new packet association
  mockData.quizzes[quizIndex] = {
    ...mockData.quizzes[quizIndex],
    packet_ids: updatedPacketIds,
    updated_at: new Date().toISOString()
  };
  
  saveData(mockData);
  
  res.json({
    success: true,
    message: `Packets removed from quiz ${quizId} successfully`,
    quiz: mockData.quizzes[quizIndex]
  });
});

// Quiz Assignments CRUD operations
app.get('/api/quiz-assignments', (req, res) => {
  console.log('📋 Get quiz assignments');
  res.json(mockData.quizAssignments);
});

app.post('/api/quiz-assignments', (req, res) => {
  const newAssignment = req.body;
  const newId = String(Date.now());
  console.log(`➕ Create new quiz assignment:`, newAssignment);
  
  const assignment = {
    id: newId,
    quiz_id: newAssignment.quiz_id || newAssignment.quizId || '1',
    profile_id: newAssignment.profile_id || newAssignment.profileIds?.[0] || '1',
    assigned_at: new Date().toISOString(),
    due_date: newAssignment.due_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: newAssignment.status || 'assigned',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  mockData.quizAssignments.push(assignment);
  saveData(mockData);
  
  res.status(201).json(assignment);
});

app.put('/api/quiz-assignments/:id', (req, res) => {
  const assignmentId = req.params.id;
  const updateData = req.body;
  console.log(`✏️ Update quiz assignment ${assignmentId}:`, updateData);
  
  const assignmentIndex = mockData.quizAssignments.findIndex(a => a.id === assignmentId);
  if (assignmentIndex === -1) {
    return res.status(404).json({ error: 'Assignment not found' });
  }
  
  mockData.quizAssignments[assignmentIndex] = {
    ...mockData.quizAssignments[assignmentIndex],
    quiz_id: updateData.quiz_id || mockData.quizAssignments[assignmentIndex].quiz_id,
    profile_id: updateData.profile_id || mockData.quizAssignments[assignmentIndex].profile_id,
    status: updateData.status || mockData.quizAssignments[assignmentIndex].status,
    updated_at: new Date().toISOString()
  };
  
  saveData(mockData);
  res.json(mockData.quizAssignments[assignmentIndex]);
});

app.delete('/api/quiz-assignments/:id', (req, res) => {
  const assignmentId = req.params.id;
  console.log(`🗑️ Delete quiz assignment ${assignmentId}`);
  
  const assignmentIndex = mockData.quizAssignments.findIndex(a => a.id === assignmentId);
  if (assignmentIndex === -1) {
    return res.status(404).json({ error: 'Assignment not found' });
  }
  
  mockData.quizAssignments.splice(assignmentIndex, 1);
  saveData(mockData);
  
  res.json({
    success: true,
    message: `Quiz assignment ${assignmentId} deleted successfully`,
    deleted_id: assignmentId
  });
});

// Remove assignment by profile and quiz ID
app.delete('/api/quiz-assignments/profile/:profileId/quiz/:quizId', (req, res) => {
  const { profileId, quizId } = req.params;
  console.log(`🗑️ Delete quiz assignment for profile ${profileId} and quiz ${quizId}`);
  
  const assignmentIndex = mockData.quizAssignments.findIndex(
    a => a.profile_id === profileId && a.quiz_id === quizId
  );
  
  if (assignmentIndex === -1) {
    return res.status(404).json({ error: 'Assignment not found' });
  }
  
  const deletedAssignment = mockData.quizAssignments[assignmentIndex];
  mockData.quizAssignments.splice(assignmentIndex, 1);
  saveData(mockData);
  
  res.json({
    success: true,
    message: `Quiz assignment removed successfully`,
    deleted_assignment: deletedAssignment
  });
});

// Quiz Attempts CRUD operations
app.get('/api/quiz-attempts', (req, res) => {
  console.log('📝 Get quiz attempts');
  
  const { quiz_id } = req.query;
  
  if (quiz_id) {
    // Filter attempts by quiz_id
    const filteredAttempts = mockData.quizAttempts.filter(a => a.quiz_id === quiz_id);
    res.json(filteredAttempts);
  } else {
    // Return all attempts
    res.json(mockData.quizAttempts);
  }
});

app.post('/api/quiz-attempts', (req, res) => {
  const newAttempt = req.body;
  const newId = String(Date.now());
  console.log(`➕ Create new quiz attempt:`, newAttempt);
  
  const attempt = {
    id: newId,
    quiz_id: newAttempt.quiz_id || '1',
    profile_id: newAttempt.profile_id || newAttempt.user_id || '1',
    user_id: newAttempt.user_id || newAttempt.profile_id || '1', // Add user_id for dashboard
    score: newAttempt.score || 0,
    total_questions: newAttempt.total_questions || 10,
    correct_answers: newAttempt.correct_answers || 0,
    // New fields for marks-based scoring
    total_marks: newAttempt.total_marks || 0,
    packet_marks: newAttempt.packet_marks || {},
    started_at: new Date().toISOString(),
    completed_at: newAttempt.completed_at || null,
    status: newAttempt.status || 'in_progress',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  mockData.quizAttempts.push(attempt);
  saveData(mockData);
  
  // Log that PDF report can be generated
  console.log('✅ Quiz attempt created:', newId);
  console.log('📊 PDF Report can now be generated for this submission in Assessment Report section');
  
  res.status(201).json(attempt);
});

app.put('/api/quiz-attempts/:id', (req, res) => {
  const attemptId = req.params.id;
  const updateData = req.body;
  console.log(`✏️ Update quiz attempt ${attemptId}:`, updateData);
  
  const attemptIndex = mockData.quizAttempts.findIndex(a => a.id === attemptId);
  if (attemptIndex === -1) {
    return res.status(404).json({ error: 'Attempt not found' });
  }
  
  mockData.quizAttempts[attemptIndex] = {
    ...mockData.quizAttempts[attemptIndex],
    quiz_id: updateData.quiz_id || mockData.quizAttempts[attemptIndex].quiz_id,
    profile_id: updateData.profile_id || updateData.user_id || mockData.quizAttempts[attemptIndex].profile_id,
    user_id: updateData.user_id || updateData.profile_id || mockData.quizAttempts[attemptIndex].user_id,
    score: updateData.score || mockData.quizAttempts[attemptIndex].score,
    total_questions: updateData.total_questions || mockData.quizAttempts[attemptIndex].total_questions,
    correct_answers: updateData.correct_answers || mockData.quizAttempts[attemptIndex].correct_answers,
    // New fields for marks-based scoring
    total_marks: updateData.total_marks || mockData.quizAttempts[attemptIndex].total_marks || 0,
    packet_marks: updateData.packet_marks || mockData.quizAttempts[attemptIndex].packet_marks || {},
    completed_at: updateData.completed_at || mockData.quizAttempts[attemptIndex].completed_at,
    status: updateData.status || mockData.quizAttempts[attemptIndex].status,
    updated_at: new Date().toISOString()
  };
  
  saveData(mockData);
  res.json(mockData.quizAttempts[attemptId]);
});

app.delete('/api/quiz-attempts/:id', (req, res) => {
  const attemptId = req.params.id;
  console.log(`🗑️ Delete quiz attempt ${attemptId}`);
  
  const attemptIndex = mockData.quizAttempts.findIndex(a => a.id === attemptId);
  if (attemptIndex === -1) {
    return res.status(404).json({ error: 'Attempt not found' });
  }
  
  mockData.quizAttempts.splice(attemptIndex, 1);
  saveData(mockData);
  
  res.json({
    success: true,
    message: `Quiz attempt ${attemptId} deleted successfully`,
    deleted_id: attemptId
  });
});

// Clear all quiz attempts
app.delete('/api/quiz-attempts', (req, res) => {
  console.log('🗑️ Clearing all quiz attempts');
  
  const deletedCount = mockData.quizAttempts.length;
  mockData.quizAttempts = [];
  saveData(mockData);
  
  res.json({
    success: true,
    message: `All ${deletedCount} quiz attempts cleared successfully`,
    deleted_count: deletedCount
  });
});

// Clear all quiz attempts (alternative endpoint for easier access)
app.post('/api/clear-all-attempts', (req, res) => {
  console.log('🗑️ Clearing all quiz attempts via POST endpoint');
  
  const deletedCount = mockData.quizAttempts.length;
  mockData.quizAttempts = [];
  saveData(mockData);
  
  res.json({
    success: true,
    message: `All ${deletedCount} quiz attempts cleared successfully`,
    deleted_count: deletedCount
  });
});

// User stats and attempts routes that dashboard needs
app.get('/api/users/:userId/stats', (req, res) => {
  console.log(`📊 Get user stats for user ${req.params.userId}`);
  
  // Calculate actual stats from quiz attempts
  const userAttempts = mockData.quizAttempts.filter(a => a.user_id === req.params.userId);
  const completedAttempts = userAttempts.filter(a => a.status === 'completed');
  
  const totalQuizzes = userAttempts.length;
  const completedQuizzes = completedAttempts.length;
  const averageScore = completedAttempts.length > 0 
    ? Math.round(completedAttempts.reduce((sum, a) => sum + a.score, 0) / completedAttempts.length)
    : 0;
  const completionRate = totalQuizzes > 0 ? Math.round((completedQuizzes / totalQuizzes) * 100) : 0;
  
  res.json({
    totalQuizzes,
    completedQuizzes,
    averageScore,
    completionRate,
    lastActivity: userAttempts.length > 0 ? userAttempts[userAttempts.length - 1].updated_at : null
  });
});

app.get('/api/users/:userId/quiz-attempts', (req, res) => {
  const userId = req.params.userId;
  console.log(`📝 Get quiz attempts for user ${userId}`);
  
  // Get attempts for this user and enrich with quiz and profile data
  const userAttempts = mockData.quizAttempts.filter(a => a.user_id === userId);
  
  const enrichedAttempts = userAttempts.map(attempt => {
    const quiz = mockData.quizzes.find(q => q.id === attempt.quiz_id);
    const profile = mockData.profiles.find(p => p.id === attempt.profile_id);
    
    return {
      ...attempt,
      quiz,
      profile
    };
  });
  
  res.json(enrichedAttempts);
});

app.get('/api/users/:userId/assigned-quizzes', (req, res) => {
  const userId = req.params.userId;
  console.log(`📋 Get assigned quizzes for user ${userId}`);
  
  // Get assignments for this user and enrich with quiz and profile data
  const userAssignments = mockData.quizAssignments.filter(a => a.user_id === userId);
  
  const enrichedAssignments = userAssignments.map(assignment => {
    const quiz = mockData.quizzes.find(q => q.id === assignment.quiz_id);
    const profile = mockData.profiles.find(p => p.id === assignment.profile_id);
    
    return {
      ...assignment,
      quiz,
      profile
    };
  });
  
  res.json(enrichedAssignments);
});

// PDF Templates API
app.get('/api/pdf-templates/:quizId', (req, res) => {
  const { quizId } = req.params;
  console.log(`📄 Get PDF template for quiz ${quizId}`);
  
  try {
    // Check if a saved template exists for this quiz
    const templateFilePath = path.join(__dirname, 'data', `pdf-template-${quizId}.json`);
    
    if (fs.existsSync(templateFilePath)) {
      const savedTemplate = JSON.parse(fs.readFileSync(templateFilePath, 'utf8'));
      console.log('✅ Loaded saved PDF template for quiz:', quizId);
      res.json({ template: savedTemplate });
    } else {
      // Return default template wrapped in the expected format
      const defaultTemplate = getDefaultPDFTemplate();
      console.log('📋 Returning default PDF template for quiz:', quizId);
      res.json({ template: defaultTemplate });
    }
  } catch (error) {
    console.error('Error getting PDF template:', error);
    res.status(500).json({ error: 'Failed to get PDF template' });
  }
});

app.put('/api/pdf-templates/:quizId', (req, res) => {
  const { quizId } = req.params;
  const template = req.body;
  console.log(`💾 Save PDF template for quiz ${quizId}`);
  
  try {
    // Ensure the data directory exists
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Save template to file
    const templateFilePath = path.join(dataDir, `pdf-template-${quizId}.json`);
    fs.writeFileSync(templateFilePath, JSON.stringify(template, null, 2));
    
    console.log('✅ PDF template saved successfully to:', templateFilePath);
    res.json({ message: 'PDF template saved successfully' });
  } catch (error) {
    console.error('Error saving PDF template:', error);
    res.status(500).json({ error: 'Failed to save PDF template' });
  }
});

// Helper function to get default PDF template
function getDefaultPDFTemplate() {
  return {
    header: { 
      enabled: true, 
      backgroundColor: '#2563eb', 
      textColor: '#ffffff',
      title: 'Assessment Performance Report',
      subtitle: 'Comprehensive Analysis Report',
      logoPosition: 'left',
      showDate: true,
      dateFormat: 'MMM DD, YYYY'
    },
    userInfo: { 
      enabled: true, 
      order: 1,
      backgroundColor: '#f8fafc',
      borderColor: '#e5e7eb',
      borderRadius: 8,
      padding: 20,
      marginBottom: 20,
      showFields: {
        name: true,
        email: true,
        completionDate: true,
        completionTime: true,
        duration: true,
        attempts: true
      }
    },
    overallScore: { 
      enabled: true, 
      order: 2,
      backgroundColor: '#f8fafc',
      borderColor: '#e5e7eb',
      borderRadius: 8,
      padding: 20,
      marginBottom: 20
    },
    charts: { 
      enabled: true, 
      order: 3,
      backgroundColor: '#ffffff',
      borderColor: '#e5e7eb',
      borderRadius: 8,
      padding: 20,
      marginBottom: 20,
      layout: 'grid',
      gridColumns: 2
    },
    sectionAnalysis: { 
      enabled: true, 
      order: 4,
      backgroundColor: '#ffffff',
      borderColor: '#e5e7eb',
      borderRadius: 8,
      padding: 20,
      marginBottom: 20
    },
    performanceInsights: { 
      enabled: true, 
      order: 5,
      backgroundColor: '#f0f9ff',
      borderColor: '#0ea5e9',
      borderRadius: 8,
      padding: 20,
      marginBottom: 20
    },
    recommendations: { 
      enabled: true, 
      order: 6,
      backgroundColor: '#fef3c7',
      borderColor: '#f59e0b',
      borderRadius: 8,
      padding: 20,
      marginBottom: 20
    },
    footer: { 
      enabled: true, 
      order: 7,
      backgroundColor: '#f8fafc',
      borderColor: '#e5e7eb',
      padding: 20,
      marginTop: 30
    },
    page: {
      size: 'A4',
      orientation: 'portrait',
      margins: { top: 30, bottom: 30, left: 30, right: 30 },
      backgroundColor: '#ffffff',
      showPageNumbers: true,
      pageNumberPosition: 'bottom-center'
    },
    typography: {
      primaryFont: 'Helvetica',
      secondaryFont: 'Arial',
      fontSizes: { h1: 28, h2: 24, h3: 20, h4: 18, h5: 16, body: 12, small: 10 }
    },
    colors: {
      primary: '#2563eb',
      secondary: '#6b7280',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
      info: '#06b6d4',
      light: '#f8fafc',
      dark: '#111827',
      white: '#ffffff',
      black: '#000000'
    },
    watermark: {
      enabled: false,
      text: 'CONFIDENTIAL',
      color: 'rgba(0, 0, 0, 0.1)',
      fontSize: 48,
      rotation: -45,
      position: 'center'
    }
  };
}

// 404 handler
app.use((req, res) => {
  console.log(`❌ Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ error: 'Route not found', path: req.path });
});

app.listen(PORT, () => {
  console.log(`🚀 Auth test server running on port ${PORT}`);
  console.log(`📊 Test API at http://localhost:${PORT}/api/test`);
  console.log(`🔐 Auth API available at http://localhost:${PORT}/api/auth/*`);
  console.log(`👤 Default admin: admin@assessment.local / admin123`);
  console.log(`👤 Default user: user@assessment.local / user123`);
});

export default app;

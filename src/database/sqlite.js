import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'assessment.db');

// Initialize database connection
let db;
try {
  db = new Database(DB_PATH);
  console.log('✅ Connected to SQLite database:', DB_PATH);
} catch (error) {
  console.error('❌ Error connecting to SQLite database:', error);
}

// Database schema SQL
const SCHEMA_SQL = `
-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- Create users table (replaces auth.users)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'admin')) DEFAULT 'user',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create user_roles table for role-based access control
CREATE TABLE IF NOT EXISTS user_roles (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'admin')),
    email TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create packets table
CREATE TABLE IF NOT EXISTS packets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    packet_id TEXT NOT NULL REFERENCES packets(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL CHECK (question_type IN ('mcq', 'true_false')),
    options TEXT, -- JSON stored as text
    correct_answer TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    time_limit INTEGER,
    passing_score INTEGER DEFAULT 70,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create quiz_packets junction table
CREATE TABLE IF NOT EXISTS quiz_packets (
    id TEXT PRIMARY KEY,
    quiz_id TEXT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    packet_id TEXT NOT NULL REFERENCES packets(id) ON DELETE CASCADE,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(quiz_id, packet_id)
);

-- Create quiz_assignments table
CREATE TABLE IF NOT EXISTS quiz_assignments (
    id TEXT PRIMARY KEY,
    quiz_id TEXT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(quiz_id, profile_id)
);

-- Create quiz_attempts table with user tracking
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id TEXT PRIMARY KEY,
    quiz_id TEXT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    profile_id TEXT REFERENCES profiles(id),
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL,
    time_taken INTEGER,
    started_at TEXT DEFAULT CURRENT_TIMESTAMP,
    completed_at TEXT,
    answers TEXT, -- JSON stored as text
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create sessions table for authentication
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_profiles_type ON profiles(type);
CREATE INDEX IF NOT EXISTS idx_questions_packet_id ON questions(packet_id);
CREATE INDEX IF NOT EXISTS idx_quiz_packets_quiz_id ON quiz_packets(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_packets_packet_id ON quiz_packets(packet_id);
CREATE INDEX IF NOT EXISTS idx_quiz_assignments_quiz_id ON quiz_assignments(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_assignments_profile_id ON quiz_assignments(profile_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_completed_at ON quiz_attempts(completed_at);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- Triggers for updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_users_updated_at
    AFTER UPDATE ON users
    BEGIN
        UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_user_roles_updated_at
    AFTER UPDATE ON user_roles
    BEGIN
        UPDATE user_roles SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_profiles_updated_at
    AFTER UPDATE ON profiles
    BEGIN
        UPDATE profiles SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_packets_updated_at
    AFTER UPDATE ON packets
    BEGIN
        UPDATE packets SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_questions_updated_at
    AFTER UPDATE ON questions
    BEGIN
        UPDATE questions SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_quizzes_updated_at
    AFTER UPDATE ON quizzes
    BEGIN
        UPDATE quizzes SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
`;

// Sample data SQL
const SAMPLE_DATA_SQL = `
-- Insert sample profiles
INSERT OR IGNORE INTO profiles (id, name, type) VALUES 
    ('${uuidv4()}', 'Student', 'student'),
    ('${uuidv4()}', 'CEO', 'executive'),
    ('${uuidv4()}', 'Manager', 'management'),
    ('${uuidv4()}', 'Employee', 'employee');

-- Insert sample packets
INSERT OR IGNORE INTO packets (id, name, description) VALUES 
    ('${uuidv4()}', 'Basic Knowledge', 'Fundamental concepts and principles'),
    ('${uuidv4()}', 'Advanced Topics', 'Complex scenarios and advanced concepts'),
    ('${uuidv4()}', 'Leadership Skills', 'Management and leadership assessment'),
    ('${uuidv4()}', 'Technical Skills', 'Technical knowledge and problem solving');
`;

// Initialize database with schema
export function initializeDatabase() {
  try {
    console.log('📦 Initializing SQLite database schema...');
    
    // Execute schema creation
    db.exec(SCHEMA_SQL);
    console.log('✅ Database schema created successfully');
    
    // Check if we need to insert sample data
    const profileCount = db.prepare('SELECT COUNT(*) as count FROM profiles').get();
    if (profileCount.count === 0) {
      console.log('📝 Inserting sample data...');
      
      // Generate UUIDs for sample data
      const profileIds = {
        student: uuidv4(),
        ceo: uuidv4(),
        manager: uuidv4(),
        employee: uuidv4()
      };
      
      const packetIds = {
        basic: uuidv4(),
        advanced: uuidv4(),
        leadership: uuidv4(),
        technical: uuidv4()
      };
      
      // Insert profiles
      const insertProfile = db.prepare('INSERT INTO profiles (id, name, type) VALUES (?, ?, ?)');
      insertProfile.run(profileIds.student, 'Student', 'student');
      insertProfile.run(profileIds.ceo, 'CEO', 'executive');
      insertProfile.run(profileIds.manager, 'Manager', 'management');
      insertProfile.run(profileIds.employee, 'Employee', 'employee');
      
      // Insert packets
      const insertPacket = db.prepare('INSERT INTO packets (id, name, description) VALUES (?, ?, ?)');
      insertPacket.run(packetIds.basic, 'Basic Knowledge', 'Fundamental concepts and principles');
      insertPacket.run(packetIds.advanced, 'Advanced Topics', 'Complex scenarios and advanced concepts');
      insertPacket.run(packetIds.leadership, 'Leadership Skills', 'Management and leadership assessment');
      insertPacket.run(packetIds.technical, 'Technical Skills', 'Technical knowledge and problem solving');
      
      // Insert sample questions
      const insertQuestion = db.prepare('INSERT INTO questions (id, packet_id, question_text, question_type, options, correct_answer) VALUES (?, ?, ?, ?, ?, ?)');
      
      insertQuestion.run(
        uuidv4(),
        packetIds.basic,
        'What is the primary goal of assessment?',
        'mcq',
        JSON.stringify(['To evaluate performance', 'To punish employees', 'To waste time', 'To create confusion']),
        'To evaluate performance'
      );
      
      insertQuestion.run(
        uuidv4(),
        packetIds.basic,
        'Assessment should be fair and objective.',
        'true_false',
        null,
        'true'
      );
      
      insertQuestion.run(
        uuidv4(),
        packetIds.advanced,
        'Which of the following is NOT a type of assessment?',
        'mcq',
        JSON.stringify(['Formative', 'Summative', 'Destructive', 'Diagnostic']),
        'Destructive'
      );
      
      insertQuestion.run(
        uuidv4(),
        packetIds.leadership,
        'Good leaders always make decisions alone.',
        'true_false',
        null,
        'false'
      );
      
      insertQuestion.run(
        uuidv4(),
        packetIds.technical,
        'What is the purpose of version control?',
        'mcq',
        JSON.stringify(['To track changes', 'To delete files', 'To slow down development', 'To confuse developers']),
        'To track changes'
      );
      
      console.log('✅ Sample data inserted successfully');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    return false;
  }
}

// Clean up expired sessions
export function cleanupExpiredSessions() {
  try {
    const result = db.prepare('DELETE FROM sessions WHERE datetime(expires_at) <= datetime("now")').run();
    if (result.changes > 0) {
      console.log(`🗑️ Cleaned up ${result.changes} expired sessions`);
    }
    return result.changes;
  } catch (error) {
    console.error('Error cleaning up sessions:', error);
    return 0;
  }
}

// Utility function to generate UUID
export { uuidv4 as generateId };

// Export database instance
export { db };

// Initialize on import
if (db) {
  initializeDatabase();
  // Clean up expired sessions every hour
  setInterval(cleanupExpiredSessions, 60 * 60 * 1000);
}

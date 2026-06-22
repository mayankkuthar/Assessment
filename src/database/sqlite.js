import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'assessment.db');

export function generateOnboardingCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let isUnique = false;
  let code = '';
  
  while (!isUnique) {
    code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Check if code already exists in DB (only if db is initialized)
    if (db) {
      try {
        const stmt = db.prepare('SELECT COUNT(*) as count FROM organizations WHERE onboarding_code = ?');
        const result = stmt.get(code);
        if (result.count === 0) {
          isUnique = true;
        }
      } catch (e) {
        // Table or column might not exist yet during initial schema run
        isUnique = true;
      }
    } else {
      isUnique = true;
    }
  }
  return code;
}

export function generateUniqueEmployeeCode(dbInstance = null) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let isUnique = false;
  let code = '';
  const targetDb = dbInstance || db;
  while (!isUnique) {
    code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (targetDb) {
      try {
        const stmt = targetDb.prepare('SELECT COUNT(*) as count FROM employees WHERE code = ?');
        const result = stmt.get(code);
        if (result.count === 0) {
          isUnique = true;
        }
      } catch (e) {
        isUnique = true;
      }
    } else {
      isUnique = true;
    }
  }
  return code;
}

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
    organization_id TEXT REFERENCES organizations(id) ON DELETE SET NULL,
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

-- Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    status TEXT CHECK(status IN ('active', 'inactive')) DEFAULT 'active',
    onboarding_code TEXT UNIQUE NOT NULL,
    onboarded_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    code TEXT UNIQUE,
    metadata TEXT, -- JSON stored as text
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, email)
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
    report_header TEXT,
    report_footer TEXT,
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
    status TEXT DEFAULT 'completed',
    current_question_index INTEGER DEFAULT 0,
    packet_marks TEXT,
    total_marks INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
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
CREATE INDEX IF NOT EXISTS idx_employees_organization_id ON employees(organization_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_organizations_onboarding_code ON organizations(onboarding_code);
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);

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

CREATE TRIGGER IF NOT EXISTS update_organizations_updated_at
    AFTER UPDATE ON organizations
    BEGIN
        UPDATE organizations SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_employees_updated_at
    AFTER UPDATE ON employees
    BEGIN
        UPDATE employees SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
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

CREATE TRIGGER IF NOT EXISTS update_quiz_attempts_updated_at
    AFTER UPDATE ON quiz_attempts
    BEGIN
        UPDATE quiz_attempts SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
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

function runMigrations() {
  try {
    // 1. Check/Add onboarding_code to organizations table
    const tableInfoOrgs = db.prepare("PRAGMA table_info(organizations)").all();
    const hasOnboardingCode = tableInfoOrgs.some(c => c.name === 'onboarding_code');
    if (!hasOnboardingCode) {
      console.log('⚠️ Migrating database: Adding onboarding_code column to organizations...');
      db.exec(`ALTER TABLE organizations ADD COLUMN onboarding_code TEXT;`);
      
      // Populate unique codes for any existing organizations that have NULL onboarding_code
      const orgsWithoutCode = db.prepare('SELECT id FROM organizations WHERE onboarding_code IS NULL').all();
      const updateCode = db.prepare('UPDATE organizations SET onboarding_code = ? WHERE id = ?');
      for (const org of orgsWithoutCode) {
        const code = generateOnboardingCode();
        updateCode.run(code, org.id);
      }
      console.log(`✅ Migrated onboarding_code for ${orgsWithoutCode.length} existing organizations.`);
    }

    // 2. Check/Add organization_id to users table
    const tableInfoUsers = db.prepare("PRAGMA table_info(users)").all();
    const hasOrgId = tableInfoUsers.some(c => c.name === 'organization_id');
    if (!hasOrgId) {
      console.log('⚠️ Migrating database: Adding organization_id column to users...');
      db.exec(`ALTER TABLE users ADD COLUMN organization_id TEXT REFERENCES organizations(id) ON DELETE SET NULL;`);
      console.log('✅ Migrated organization_id column for users.');
    }

    // 3. Check/Add onboarded_at to organizations table
    const tableInfoOrgs2 = db.prepare("PRAGMA table_info(organizations)").all();
    const hasOnboardedAt = tableInfoOrgs2.some(c => c.name === 'onboarded_at');
    if (!hasOnboardedAt) {
      console.log('⚠️ Migrating database: Adding onboarded_at column to organizations...');
      db.exec(`ALTER TABLE organizations ADD COLUMN onboarded_at TEXT;`);
      db.exec(`UPDATE organizations SET onboarded_at = created_at;`);
      console.log('✅ Migrated onboarded_at column for organizations.');
    }

    // 4. Check/Add code to employees table
    const tableInfoEmployees = db.prepare("PRAGMA table_info(employees)").all();
    const hasEmployeeCode = tableInfoEmployees.some(c => c.name === 'code');
    if (!hasEmployeeCode) {
      console.log('⚠️ Migrating database: Adding code column to employees...');
      db.exec(`ALTER TABLE employees ADD COLUMN code TEXT;`);
      
      const employeesWithoutCode = db.prepare('SELECT id FROM employees WHERE code IS NULL').all();
      const updateEmployeeCode = db.prepare('UPDATE employees SET code = ? WHERE id = ?');
      for (const emp of employeesWithoutCode) {
        const empCode = generateUniqueEmployeeCode(db);
        updateEmployeeCode.run(empCode, emp.id);
      }
      console.log(`✅ Migrated code for ${employeesWithoutCode.length} existing employees.`);
    }

    // 5. Check/Add status, current_question_index, packet_marks, total_marks, updated_at to quiz_attempts table
    const tableInfoAttempts = db.prepare("PRAGMA table_info(quiz_attempts)").all();
    
    const hasStatus = tableInfoAttempts.some(c => c.name === 'status');
    if (!hasStatus) {
      console.log('⚠️ Migrating database: Adding status column to quiz_attempts...');
      db.exec(`ALTER TABLE quiz_attempts ADD COLUMN status TEXT DEFAULT 'completed';`);
      console.log('✅ Migrated status column for quiz_attempts.');
    }

    const hasQIndex = tableInfoAttempts.some(c => c.name === 'current_question_index');
    if (!hasQIndex) {
      console.log('⚠️ Migrating database: Adding current_question_index column to quiz_attempts...');
      db.exec(`ALTER TABLE quiz_attempts ADD COLUMN current_question_index INTEGER DEFAULT 0;`);
      console.log('✅ Migrated current_question_index column for quiz_attempts.');
    }

    const hasPacketMarks = tableInfoAttempts.some(c => c.name === 'packet_marks');
    if (!hasPacketMarks) {
      console.log('⚠️ Migrating database: Adding packet_marks column to quiz_attempts...');
      db.exec(`ALTER TABLE quiz_attempts ADD COLUMN packet_marks TEXT;`);
      console.log('✅ Migrated packet_marks column for quiz_attempts.');
    }

    const hasTotalMarks = tableInfoAttempts.some(c => c.name === 'total_marks');
    if (!hasTotalMarks) {
      console.log('⚠️ Migrating database: Adding total_marks column to quiz_attempts...');
      db.exec(`ALTER TABLE quiz_attempts ADD COLUMN total_marks INTEGER DEFAULT 0;`);
      console.log('✅ Migrated total_marks column for quiz_attempts.');
    }

    const hasAttemptsUpdatedAt = tableInfoAttempts.some(c => c.name === 'updated_at');
    if (!hasAttemptsUpdatedAt) {
      console.log('⚠️ Migrating database: Adding updated_at column to quiz_attempts...');
      db.exec(`ALTER TABLE quiz_attempts ADD COLUMN updated_at TEXT DEFAULT CURRENT_TIMESTAMP;`);
      console.log('✅ Migrated updated_at column for quiz_attempts.');
    }
  } catch (error) {
    console.error('❌ Error running database migrations:', error);
  }
}

// Initialize database with schema
export function initializeDatabase() {
  try {
    console.log('📦 Initializing SQLite database schema...');
    
    // Execute schema creation
    db.exec(SCHEMA_SQL);
    console.log('✅ Database schema created successfully');
    
    // Run migrations
    runMigrations();
    
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

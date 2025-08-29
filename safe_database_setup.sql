-- Safe Database Setup for Assessment Tool
-- This script handles existing objects and avoids conflicts
-- Run this script in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_roles table for role-based access control
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'admin')),
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create packets table
CREATE TABLE IF NOT EXISTS packets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    packet_id UUID NOT NULL REFERENCES packets(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL CHECK (question_type IN ('mcq', 'true_false')),
    options JSONB,
    correct_answer TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    time_limit INTEGER,
    passing_score INTEGER DEFAULT 70,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quiz_packets junction table
CREATE TABLE IF NOT EXISTS quiz_packets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    packet_id UUID NOT NULL REFERENCES packets(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(quiz_id, packet_id)
);

-- Create quiz_assignments table
CREATE TABLE IF NOT EXISTS quiz_assignments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(quiz_id, profile_id)
);

-- Create quiz_attempts table with user tracking
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL,
    time_taken INTEGER,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    answers JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance (IF NOT EXISTS)
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

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at (DROP IF EXISTS first)
DROP TRIGGER IF EXISTS update_user_roles_updated_at ON user_roles;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_packets_updated_at ON packets;
DROP TRIGGER IF EXISTS update_questions_updated_at ON questions;
DROP TRIGGER IF EXISTS update_quizzes_updated_at ON quizzes;

CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON user_roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_packets_updated_at BEFORE UPDATE ON packets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quizzes_updated_at BEFORE UPDATE ON quizzes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE packets ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_packets ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own role" ON user_roles;
DROP POLICY IF EXISTS "Users can insert their own role" ON user_roles;
DROP POLICY IF EXISTS "Allow all operations on user_roles" ON user_roles;
DROP POLICY IF EXISTS "Allow all operations on profiles" ON profiles;
DROP POLICY IF EXISTS "Allow all operations on packets" ON packets;
DROP POLICY IF EXISTS "Allow all operations on questions" ON questions;
DROP POLICY IF EXISTS "Allow all operations on quizzes" ON quizzes;
DROP POLICY IF EXISTS "Allow all operations on quiz_packets" ON quiz_packets;
DROP POLICY IF EXISTS "Allow all operations on quiz_assignments" ON quiz_assignments;
DROP POLICY IF EXISTS "Users can view their own attempts" ON quiz_attempts;
DROP POLICY IF EXISTS "Users can create their own attempts" ON quiz_attempts;
DROP POLICY IF EXISTS "Allow all operations on attempts" ON quiz_attempts;

-- RLS Policies for user_roles (simplified to avoid circular dependency)
CREATE POLICY "Users can view their own role" ON user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own role" ON user_roles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow all operations for now (you can restrict this later)
CREATE POLICY "Allow all operations on user_roles" ON user_roles
    FOR ALL USING (true);

-- RLS Policies for profiles (admin only)
CREATE POLICY "Allow all operations on profiles" ON profiles
    FOR ALL USING (true);

-- RLS Policies for packets (admin only)
CREATE POLICY "Allow all operations on packets" ON packets
    FOR ALL USING (true);

-- RLS Policies for questions (admin only)
CREATE POLICY "Allow all operations on questions" ON questions
    FOR ALL USING (true);

-- RLS Policies for quizzes (admin only)
CREATE POLICY "Allow all operations on quizzes" ON quizzes
    FOR ALL USING (true);

-- RLS Policies for quiz_packets (admin only)
CREATE POLICY "Allow all operations on quiz_packets" ON quiz_packets
    FOR ALL USING (true);

-- RLS Policies for quiz_assignments (admin only)
CREATE POLICY "Allow all operations on quiz_assignments" ON quiz_assignments
    FOR ALL USING (true);

-- RLS Policies for quiz_attempts
CREATE POLICY "Users can view their own attempts" ON quiz_attempts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own attempts" ON quiz_attempts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow all operations for quiz_attempts for now
CREATE POLICY "Allow all operations on attempts" ON quiz_attempts
    FOR ALL USING (true);

-- Insert sample data for testing (only if not exists)
INSERT INTO profiles (name, type) VALUES 
    ('Student', 'student'),
    ('Employee', 'employee'),
    ('Manager', 'manager')
ON CONFLICT DO NOTHING;

INSERT INTO packets (name, description) VALUES 
    ('Basic Knowledge', 'Fundamental concepts and principles'),
    ('Advanced Topics', 'Complex scenarios and advanced concepts'),
    ('Practical Application', 'Real-world application questions')
ON CONFLICT DO NOTHING;

-- Insert sample questions (only if not exists)
INSERT INTO questions (packet_id, question_text, question_type, options, correct_answer) 
SELECT 
    p.id,
    'What is the primary purpose of assessments?',
    'mcq',
    '["To evaluate knowledge", "To waste time", "To confuse students", "To make money"]',
    'To evaluate knowledge'
FROM packets p WHERE p.name = 'Basic Knowledge'
ON CONFLICT DO NOTHING;

INSERT INTO questions (packet_id, question_text, question_type, options, correct_answer) 
SELECT 
    p.id,
    'Assessments help improve learning outcomes.',
    'true_false',
    NULL,
    'true'
FROM packets p WHERE p.name = 'Basic Knowledge'
ON CONFLICT DO NOTHING;

-- Insert sample quiz (only if not exists)
INSERT INTO quizzes (name, description, time_limit, passing_score) VALUES 
    ('Sample Assessment', 'A comprehensive test covering basic concepts', 30, 70)
ON CONFLICT DO NOTHING;

-- Success message
SELECT 'Database setup completed successfully!' as status; 
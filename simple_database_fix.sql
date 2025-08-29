-- Simple Database Fix - Disable RLS temporarily to fix recursion issues
-- Run this in your Supabase SQL editor

-- Disable RLS on all tables to fix the recursion issue
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE packets DISABLE ROW LEVEL SECURITY;
ALTER TABLE questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes DISABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_packets DISABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies to clean up
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

-- Ensure user_roles table exists and has the right structure
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'admin')),
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Ensure quiz_attempts has user_id column
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quiz_attempts' AND column_name = 'user_id') THEN
        ALTER TABLE quiz_attempts ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);

-- Success message
SELECT 'RLS disabled and database fixed!' as status; 
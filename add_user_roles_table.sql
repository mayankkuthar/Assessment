-- Add user_roles table for role-based access control
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'admin')),
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- Enable Row Level Security
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own role" ON user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON user_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Create trigger for updated_at
CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON user_roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update quiz_attempts table to include user_id if not already present
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quiz_attempts' AND column_name = 'user_id') THEN
        ALTER TABLE quiz_attempts ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
    END IF;
END $$;

-- Update RLS policies for quiz_attempts to include user_id
DROP POLICY IF EXISTS "Users can view their own attempts" ON quiz_attempts;
CREATE POLICY "Users can view their own attempts" ON quiz_attempts
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own attempts" ON quiz_attempts;
CREATE POLICY "Users can create their own attempts" ON quiz_attempts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all attempts" ON quiz_attempts;
CREATE POLICY "Admins can view all attempts" ON quiz_attempts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    ); 
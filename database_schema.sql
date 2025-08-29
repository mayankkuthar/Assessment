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
    marks INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create question_options table for storing individual option marks
CREATE TABLE IF NOT EXISTS question_options (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    option_order INTEGER NOT NULL,
    marks INTEGER DEFAULT 1,
    is_correct BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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

-- Create indexes for better performance
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
CREATE INDEX IF NOT EXISTS idx_question_options_question_id ON question_options(question_id);
CREATE INDEX IF NOT EXISTS idx_question_options_order ON question_options(option_order);

-- Enable Row Level Security (RLS)
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE packets ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_packets ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

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

-- RLS Policies for profiles
CREATE POLICY "Admins can manage profiles" ON profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for packets
CREATE POLICY "Admins can manage packets" ON packets
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for questions
CREATE POLICY "Admins can manage questions" ON questions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for quizzes
CREATE POLICY "Admins can manage quizzes" ON quizzes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for quiz_packets
CREATE POLICY "Admins can manage quiz packets" ON quiz_packets
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for quiz_assignments
CREATE POLICY "Admins can manage quiz assignments" ON quiz_assignments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for quiz_attempts
CREATE POLICY "Users can view their own attempts" ON quiz_attempts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own attempts" ON quiz_attempts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all attempts" ON quiz_attempts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON user_roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_packets_updated_at BEFORE UPDATE ON packets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quizzes_updated_at BEFORE UPDATE ON quizzes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data
INSERT INTO profiles (name, type) VALUES 
    ('Student', 'student'),
    ('CEO', 'executive'),
    ('Manager', 'management'),
    ('Employee', 'employee');

INSERT INTO packets (name, description) VALUES 
    ('Basic Knowledge', 'Fundamental concepts and principles'),
    ('Advanced Topics', 'Complex scenarios and advanced concepts'),
    ('Leadership Skills', 'Management and leadership assessment'),
    ('Technical Skills', 'Technical knowledge and problem solving');

-- Insert sample questions
INSERT INTO questions (packet_id, question_text, question_type, options, correct_answer) VALUES 
    ((SELECT id FROM packets WHERE name = 'Basic Knowledge'), 'What is the primary goal of assessment?', 'mcq', 
     '["To evaluate performance", "To punish employees", "To waste time", "To create confusion"]', 'To evaluate performance'),
    
    ((SELECT id FROM packets WHERE name = 'Basic Knowledge'), 'Assessment should be fair and objective.', 'true_false', 
     NULL, 'true'),
    
    ((SELECT id FROM packets WHERE name = 'Advanced Topics'), 'Which of the following is NOT a type of assessment?', 'mcq', 
     '["Formative", "Summative", "Destructive", "Diagnostic"]', 'Destructive'),
    
    ((SELECT id FROM packets WHERE name = 'Leadership Skills'), 'Good leaders always make decisions alone.', 'true_false', 
     NULL, 'false'),
    
    ((SELECT id FROM packets WHERE name = 'Technical Skills'), 'What is the purpose of version control?', 'mcq', 
     '["To track changes", "To delete files", "To slow down development", "To confuse developers"]', 'To track changes'); 
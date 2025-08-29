-- Add user_id column to quiz_attempts table
ALTER TABLE quiz_attempts ADD COLUMN user_id UUID;

-- Create index for better performance on user_id queries
CREATE INDEX idx_quiz_attempts_user_id ON quiz_attempts(user_id);

-- Update RLS policies to allow users to see their own attempts
CREATE POLICY "Allow users to view their own quiz attempts" ON quiz_attempts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert their own quiz attempts" ON quiz_attempts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own quiz attempts" ON quiz_attempts
    FOR UPDATE USING (auth.uid() = user_id);

-- Allow admins to view all attempts (you can customize this based on your admin role logic)
CREATE POLICY "Allow admins to view all quiz attempts" ON quiz_attempts
    FOR ALL USING (auth.role() = 'authenticated'); 
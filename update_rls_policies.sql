-- Create index for better performance on user_id queries (if it doesn't exist)
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow users to view their own quiz attempts" ON quiz_attempts;
DROP POLICY IF EXISTS "Allow users to insert their own quiz attempts" ON quiz_attempts;
DROP POLICY IF EXISTS "Allow users to update their own quiz attempts" ON quiz_attempts;
DROP POLICY IF EXISTS "Allow admins to view all quiz attempts" ON quiz_attempts;

-- Create new RLS policies to allow users to see their own attempts
CREATE POLICY "Allow users to view their own quiz attempts" ON quiz_attempts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert their own quiz attempts" ON quiz_attempts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own quiz attempts" ON quiz_attempts
    FOR UPDATE USING (auth.uid() = user_id);

-- Allow admins to view all attempts (you can customize this based on your admin role logic)
CREATE POLICY "Allow admins to view all quiz attempts" ON quiz_attempts
    FOR ALL USING (auth.role() = 'authenticated'); 
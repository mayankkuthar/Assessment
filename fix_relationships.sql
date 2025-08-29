-- Fix Database Relationships
-- This script ensures proper relationships between tables

-- 1. Verify quiz_attempts table structure
-- The quiz_attempts table should have user_id referencing auth.users
-- This is correct in the current schema

-- 2. Create a view to easily join quiz_attempts with user information
CREATE OR REPLACE VIEW quiz_attempts_with_users AS
SELECT 
    qa.id,
    qa.quiz_id,
    qa.user_id,
    qa.score,
    qa.total_questions,
    qa.correct_answers,
    qa.time_taken,
    qa.completed_at,
    qa.answers,
    qa.created_at,
    q.name as quiz_name,
    ur.email as user_email,
    ur.role as user_role
FROM quiz_attempts qa
LEFT JOIN quizzes q ON qa.quiz_id = q.id
LEFT JOIN user_roles ur ON qa.user_id = ur.user_id;

-- 3. Create a function to get user quiz attempts with proper joins
CREATE OR REPLACE FUNCTION get_user_quiz_attempts(user_uuid UUID)
RETURNS TABLE (
    id UUID,
    quiz_id UUID,
    quiz_name TEXT,
    score INTEGER,
    total_questions INTEGER,
    correct_answers INTEGER,
    time_taken INTEGER,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        qa.id,
        qa.quiz_id,
        q.name as quiz_name,
        qa.score,
        qa.total_questions,
        qa.correct_answers,
        qa.time_taken,
        qa.completed_at,
        qa.created_at
    FROM quiz_attempts qa
    LEFT JOIN quizzes q ON qa.quiz_id = q.id
    WHERE qa.user_id = user_uuid
    ORDER BY qa.completed_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 4. Create a function to get all quiz attempts for admins
CREATE OR REPLACE FUNCTION get_all_quiz_attempts()
RETURNS TABLE (
    id UUID,
    quiz_id UUID,
    user_id UUID,
    quiz_name TEXT,
    user_email TEXT,
    user_role TEXT,
    score INTEGER,
    total_questions INTEGER,
    correct_answers INTEGER,
    time_taken INTEGER,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        qa.id,
        qa.quiz_id,
        qa.user_id,
        q.name as quiz_name,
        ur.email as user_email,
        ur.role as user_role,
        qa.score,
        qa.total_questions,
        qa.correct_answers,
        qa.time_taken,
        qa.completed_at,
        qa.created_at
    FROM quiz_attempts qa
    LEFT JOIN quizzes q ON qa.quiz_id = q.id
    LEFT JOIN user_roles ur ON qa.user_id = ur.user_id
    ORDER BY qa.completed_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 5. Create a function to get user statistics
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS TABLE (
    total_attempts BIGINT,
    average_score NUMERIC,
    total_questions BIGINT,
    total_correct BIGINT,
    completion_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_attempts,
        ROUND(AVG(qa.score), 2) as average_score,
        SUM(qa.total_questions) as total_questions,
        SUM(qa.correct_answers) as total_correct,
        CASE 
            WHEN SUM(qa.total_questions) > 0 
            THEN ROUND((SUM(qa.correct_answers)::NUMERIC / SUM(qa.total_questions) * 100), 2)
            ELSE 0 
        END as completion_rate
    FROM quiz_attempts qa
    WHERE qa.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql;

-- 6. Grant permissions for the functions
GRANT EXECUTE ON FUNCTION get_user_quiz_attempts(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_quiz_attempts() TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_stats(UUID) TO authenticated;

-- 7. Example usage queries
-- Get user quiz attempts:
-- SELECT * FROM get_user_quiz_attempts('user-uuid-here');

-- Get all quiz attempts (admin only):
-- SELECT * FROM get_all_quiz_attempts();

-- Get user statistics:
-- SELECT * FROM get_user_stats('user-uuid-here');

-- Use the view for simple queries:
-- SELECT * FROM quiz_attempts_with_users WHERE user_id = 'user-uuid-here'; 
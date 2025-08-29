-- Verify Database Setup
-- Run this to check if everything is working

-- Check RLS status (should be disabled)
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('user_roles', 'profiles', 'packets', 'questions', 'quizzes', 'quiz_packets', 'quiz_assignments', 'quiz_attempts')
ORDER BY tablename;

-- Check table structures
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_roles'
ORDER BY ordinal_position;

-- Check if user_roles table is empty (ready for first user)
SELECT 
    'user_roles' as table_name,
    COUNT(*) as record_count,
    CASE WHEN COUNT(*) = 0 THEN 'Ready for first user' ELSE 'Has existing users' END as status
FROM user_roles;

-- Check other tables
SELECT 
    'profiles' as table_name,
    COUNT(*) as record_count
FROM profiles
UNION ALL
SELECT 
    'packets' as table_name,
    COUNT(*) as record_count
FROM packets
UNION ALL
SELECT 
    'questions' as table_name,
    COUNT(*) as record_count
FROM questions
UNION ALL
SELECT 
    'quizzes' as table_name,
    COUNT(*) as record_count
FROM quizzes;

-- Success message
SELECT 'Database is ready for user registration!' as status; 
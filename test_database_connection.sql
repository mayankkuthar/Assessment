-- Test Database Connection and Basic Operations
-- Run this to verify everything is working

-- Test 1: Check if tables exist
SELECT 
    table_name,
    CASE WHEN table_name IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_roles', 'profiles', 'packets', 'questions', 'quizzes', 'quiz_packets', 'quiz_assignments', 'quiz_attempts');

-- Test 2: Check RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND table_name IN ('user_roles', 'profiles', 'packets', 'questions', 'quizzes', 'quiz_packets', 'quiz_assignments', 'quiz_attempts');

-- Test 3: Check if user_roles table has correct structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_roles' 
ORDER BY ordinal_position;

-- Test 4: Check if quiz_attempts has user_id column
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'quiz_attempts' 
AND column_name = 'user_id';

-- Test 5: Check current user_roles count
SELECT COUNT(*) as user_roles_count FROM user_roles;

-- Test 6: Check if we can read from all tables
SELECT 'profiles' as table_name, COUNT(*) as record_count FROM profiles
UNION ALL
SELECT 'packets' as table_name, COUNT(*) as record_count FROM packets
UNION ALL
SELECT 'questions' as table_name, COUNT(*) as record_count FROM questions
UNION ALL
SELECT 'quizzes' as table_name, COUNT(*) as record_count FROM quizzes
UNION ALL
SELECT 'quiz_packets' as table_name, COUNT(*) as record_count FROM quiz_packets
UNION ALL
SELECT 'quiz_assignments' as table_name, COUNT(*) as record_count FROM quiz_assignments
UNION ALL
SELECT 'quiz_attempts' as table_name, COUNT(*) as record_count FROM quiz_attempts;

-- Success message
SELECT 'Database connection test completed successfully!' as status; 
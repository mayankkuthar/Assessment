-- SAFE User Information (NO PASSWORDS)
-- This shows everything you can legally and safely access

-- 1. Complete user overview
SELECT 
    au.id,
    au.email,
    au.email_confirmed_at,
    au.created_at,
    au.updated_at,
    au.last_sign_in_at,
    au.confirmed_at,
    ur.role,
    ur.created_at as role_created_at
FROM auth.users au
LEFT JOIN user_roles ur ON au.id = ur.user_id
ORDER BY au.created_at DESC;

-- 2. User activity summary
SELECT 
    ur.email,
    ur.role,
    COUNT(qa.id) as total_quiz_attempts,
    AVG(qa.score) as average_score,
    MAX(qa.completed_at) as last_activity,
    au.last_sign_in_at,
    au.email_confirmed_at
FROM user_roles ur
LEFT JOIN auth.users au ON ur.user_id = au.id
LEFT JOIN quiz_attempts qa ON au.id = qa.user_id
GROUP BY ur.user_id, ur.email, ur.role, au.last_sign_in_at, au.email_confirmed_at
ORDER BY last_activity DESC NULLS LAST;

-- 3. Users without roles (potential issues)
SELECT 
    au.id,
    au.email,
    au.created_at,
    au.email_confirmed_at
FROM auth.users au
LEFT JOIN user_roles ur ON au.id = ur.user_id
WHERE ur.user_id IS NULL
ORDER BY au.created_at DESC;

-- 4. Admin users only
SELECT 
    ur.email,
    ur.created_at as admin_since,
    au.last_sign_in_at,
    COUNT(qa.id) as quiz_attempts
FROM user_roles ur
LEFT JOIN auth.users au ON ur.user_id = au.id
LEFT JOIN quiz_attempts qa ON ur.user_id = qa.user_id
WHERE ur.role = 'admin'
GROUP BY ur.user_id, ur.email, ur.created_at, au.last_sign_in_at
ORDER BY ur.created_at DESC;

-- 5. User statistics
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN au.email_confirmed_at IS NOT NULL THEN 1 END) as verified_users,
    COUNT(CASE WHEN ur.role = 'admin' THEN 1 END) as admin_users,
    COUNT(CASE WHEN ur.role = 'user' THEN 1 END) as regular_users,
    COUNT(CASE WHEN au.last_sign_in_at > NOW() - INTERVAL '7 days' THEN 1 END) as active_last_7_days
FROM auth.users au
LEFT JOIN user_roles ur ON au.id = ur.user_id; 
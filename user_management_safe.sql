-- Safe User Management Operations
-- These operations don't involve passwords

-- 1. Make a user an admin
INSERT INTO user_roles (user_id, role, email)
SELECT id, 'admin', email
FROM auth.users
WHERE email = 'user@example.com'  -- Replace with actual email
AND id NOT IN (SELECT user_id FROM user_roles);

-- 2. Change user role
UPDATE user_roles 
SET role = 'admin'  -- or 'user'
WHERE email = 'user@example.com';  -- Replace with actual email

-- 3. Remove user role
DELETE FROM user_roles 
WHERE email = 'user@example.com';  -- Replace with actual email

-- 4. Delete a user (this will also delete their role and attempts)
-- WARNING: This is permanent!
DELETE FROM user_roles WHERE user_id = 'user-uuid-here';
DELETE FROM quiz_attempts WHERE user_id = 'user-uuid-here';
-- Note: auth.users deletion is handled by Supabase when you delete via API

-- 5. Check user activity
SELECT 
    ur.email,
    ur.role,
    COUNT(qa.id) as quiz_attempts,
    MAX(qa.completed_at) as last_activity
FROM user_roles ur
LEFT JOIN quiz_attempts qa ON ur.user_id = qa.user_id
GROUP BY ur.user_id, ur.email, ur.role
ORDER BY last_activity DESC NULLS LAST;

-- 6. Find inactive users (no quiz attempts in 30 days)
SELECT 
    ur.email,
    ur.role,
    ur.created_at,
    MAX(qa.completed_at) as last_activity
FROM user_roles ur
LEFT JOIN quiz_attempts qa ON ur.user_id = qa.user_id
GROUP BY ur.user_id, ur.email, ur.role, ur.created_at
HAVING MAX(qa.completed_at) < NOW() - INTERVAL '30 days'
   OR MAX(qa.completed_at) IS NULL
ORDER BY last_activity DESC NULLS LAST; 
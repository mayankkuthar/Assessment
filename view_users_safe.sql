-- Safe way to view user information (NO PASSWORDS)
-- This shows user data without exposing sensitive information

-- View basic user information (safe)
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    updated_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data
FROM auth.users
ORDER BY created_at DESC;

-- View user roles (from our custom table)
SELECT 
    ur.user_id,
    ur.email,
    ur.role,
    ur.created_at,
    au.email_confirmed_at,
    au.last_sign_in_at
FROM user_roles ur
LEFT JOIN auth.users au ON ur.user_id = au.id
ORDER BY ur.created_at DESC;

-- Count users by role
SELECT 
    role,
    COUNT(*) as user_count
FROM user_roles
GROUP BY role;

-- Check for users without roles
SELECT 
    au.id,
    au.email,
    au.created_at
FROM auth.users au
LEFT JOIN user_roles ur ON au.id = ur.user_id
WHERE ur.user_id IS NULL
ORDER BY au.created_at DESC; 
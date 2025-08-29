-- User Management Commands (NO PASSWORD ACCESS)
-- These are safe operations you can perform

-- 1. Make a user an admin
INSERT INTO user_roles (user_id, role, email)
SELECT id, 'admin', email
FROM auth.users
WHERE email = 'user@example.com'  -- Replace with actual email
AND id NOT IN (SELECT user_id FROM user_roles);

-- 2. Change user role from user to admin
UPDATE user_roles 
SET role = 'admin'
WHERE email = 'user@example.com';  -- Replace with actual email

-- 3. Remove admin privileges
UPDATE user_roles 
SET role = 'user'
WHERE email = 'user@example.com';  -- Replace with actual email

-- 4. Delete a user completely (WARNING: Permanent!)
-- First, get the user ID
SELECT id FROM auth.users WHERE email = 'user@example.com';

-- Then delete related data (replace 'user-uuid' with actual ID)
DELETE FROM quiz_attempts WHERE user_id = 'user-uuid';
DELETE FROM user_roles WHERE user_id = 'user-uuid';
-- Note: auth.users deletion must be done via Supabase Dashboard or API

-- 5. Check if email is verified
SELECT 
    email,
    email_confirmed_at,
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN 'Verified'
        ELSE 'Not Verified'
    END as status
FROM auth.users
WHERE email = 'user@example.com';  -- Replace with actual email

-- 6. Find users who haven't logged in recently
SELECT 
    ur.email,
    ur.role,
    au.last_sign_in_at,
    CASE 
        WHEN au.last_sign_in_at < NOW() - INTERVAL '30 days' THEN 'Inactive'
        WHEN au.last_sign_in_at < NOW() - INTERVAL '7 days' THEN 'Recently Active'
        ELSE 'Very Active'
    END as activity_status
FROM user_roles ur
LEFT JOIN auth.users au ON ur.user_id = au.id
ORDER BY au.last_sign_in_at DESC NULLS LAST; 
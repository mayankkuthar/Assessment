-- Fix Email Verification Issues
-- This script helps resolve email verification problems

-- Step 1: Check current users and their verification status
SELECT 'Current users and verification status:' as info;
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN 'Verified'
        ELSE 'Not Verified'
    END as status
FROM auth.users 
ORDER BY created_at DESC;

-- Step 2: Check user roles
SELECT 'Current user roles:' as info;
SELECT 
    ur.id,
    ur.user_id,
    ur.role,
    ur.email,
    ur.created_at,
    au.email_confirmed_at,
    CASE 
        WHEN au.email_confirmed_at IS NOT NULL THEN 'Verified'
        ELSE 'Not Verified'
    END as auth_status
FROM user_roles ur
LEFT JOIN auth.users au ON ur.user_id = au.id
ORDER BY ur.created_at DESC;

-- Step 3: Manually verify a user (replace with actual user ID)
-- Uncomment and replace 'USER_ID_HERE' with the actual user ID from step 1
-- UPDATE auth.users 
-- SET email_confirmed_at = NOW() 
-- WHERE id = 'USER_ID_HERE';

-- Step 4: Alternative - Reset email verification for a user
-- This allows them to receive a new verification email
-- Uncomment and replace 'USER_ID_HERE' with the actual user ID
-- UPDATE auth.users 
-- SET email_confirmed_at = NULL 
-- WHERE id = 'USER_ID_HERE';

-- Step 5: Create admin role for verified user
-- Replace 'mayank8055neel@gmail.com' with your email
INSERT INTO user_roles (user_id, role, email)
SELECT 
    id,
    'admin',
    email
FROM auth.users 
WHERE email = 'mayank8055neel@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM user_roles WHERE email = 'mayank8055neel@gmail.com'
);

-- Step 6: Make existing user admin
UPDATE user_roles 
SET role = 'admin' 
WHERE email = 'mayank8055neel@gmail.com';

-- Step 7: Final verification
SELECT 'Final status - Admin users:' as info;
SELECT 
    ur.id,
    ur.user_id,
    ur.role,
    ur.email,
    ur.created_at,
    au.email_confirmed_at,
    CASE 
        WHEN au.email_confirmed_at IS NOT NULL THEN 'Verified'
        ELSE 'Not Verified'
    END as auth_status
FROM user_roles ur
LEFT JOIN auth.users au ON ur.user_id = au.id
WHERE ur.role = 'admin'
ORDER BY ur.created_at DESC; 
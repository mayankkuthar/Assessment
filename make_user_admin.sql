-- Make User Admin
-- This script makes an existing user an admin

-- Step 1: Check existing users
SELECT 'Existing users in auth.users:' as info;
SELECT 
    id,
    email,
    created_at
FROM auth.users 
ORDER BY created_at DESC;

-- Step 2: Check existing user roles
SELECT 'Existing user roles:' as info;
SELECT 
    ur.id,
    ur.user_id,
    ur.role,
    ur.email,
    ur.created_at
FROM user_roles ur
ORDER BY ur.created_at DESC;

-- Step 3: Make a specific user admin
-- Replace 'mayank8055neel@gmail.com' with the actual user email
UPDATE user_roles 
SET role = 'admin' 
WHERE email = 'mayank8055neel@gmail.com';

-- If the user doesn't have a role yet, create one
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

-- Step 4: Verify the admin user
SELECT 'Admin users after update:' as status;
SELECT 
    ur.id,
    ur.user_id,
    ur.role,
    ur.email,
    ur.created_at,
    au.email as auth_email
FROM user_roles ur
LEFT JOIN auth.users au ON ur.user_id = au.id
WHERE ur.role = 'admin'
ORDER BY ur.created_at DESC;

-- Step 5: Show all users
SELECT 'All users and their roles:' as status;
SELECT 
    ur.id,
    ur.user_id,
    ur.role,
    ur.email,
    ur.created_at,
    au.email as auth_email
FROM user_roles ur
LEFT JOIN auth.users au ON ur.user_id = au.id
ORDER BY ur.created_at DESC; 
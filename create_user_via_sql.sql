-- Create User via SQL using Supabase Auth Functions
-- Run this script in your Supabase SQL editor

-- Method 1: Using Supabase's auth.signup function
-- Note: This requires the auth schema to be accessible

-- First, let's check if we can access auth functions
SELECT 'Checking available auth functions...' as status;

-- Try to create a user using the auth.signup function
-- Replace 'admin@example.com' and 'adminpassword123' with your desired credentials
SELECT auth.signup(
    'admin@example.com',
    'adminpassword123',
    '{"role": "admin"}'::jsonb
);

-- Method 2: If the above doesn't work, we can create a user role entry
-- for an existing user or prepare for when a user signs up

-- Check if user exists in auth.users
SELECT 'Checking for existing users...' as status;
SELECT 
    id,
    email,
    created_at
FROM auth.users 
WHERE email = 'admin@example.com';

-- If user exists, create admin role
-- Replace 'USER_ID_HERE' with the actual user ID from the query above
-- INSERT INTO user_roles (user_id, role, email) 
-- VALUES ('USER_ID_HERE', 'admin', 'admin@example.com')
-- ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

-- Method 3: Create a placeholder admin role (will be linked when user signs up)
-- This is useful if you want to reserve admin role for a specific email
INSERT INTO user_roles (user_id, role, email) 
VALUES (
    (SELECT id FROM auth.users WHERE email = 'admin@example.com' LIMIT 1),
    'admin', 
    'admin@example.com'
)
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

-- Verify the admin user was created
SELECT 'Admin users:' as status;
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

-- Show all users
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
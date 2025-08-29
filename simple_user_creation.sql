-- Simple User Creation via SQL
-- This script creates a user using Supabase's built-in functions

-- Step 1: Create a user using Supabase's auth.signup function
-- Replace the email and password with your desired credentials
SELECT auth.signup(
    'mayank8055neel@gmail.com',           -- Replace with your desired email
    'Password123!',           -- Replace with your desired password
    '{"role": "admin"}'::jsonb     -- User metadata
);

-- Step 2: Check if the user was created successfully
SELECT 'Checking if user was created...' as status;
SELECT 
    id,
    email,
    raw_user_meta_data,
    created_at
FROM auth.users 
WHERE email = 'admin@example.com';

-- Step 3: Create admin role for the user
-- This will work if the user was created successfully
INSERT INTO user_roles (user_id, role, email) 
SELECT 
    id,
    'admin',
    email
FROM auth.users 
WHERE email = 'admin@example.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

-- Step 4: Verify the admin user
SELECT 'Admin user created successfully!' as status;
SELECT 
    ur.id,
    ur.user_id,
    ur.role,
    ur.email,
    ur.created_at,
    au.email as auth_email,
    au.raw_user_meta_data
FROM user_roles ur
LEFT JOIN auth.users au ON ur.user_id = au.id
WHERE ur.role = 'admin'
ORDER BY ur.created_at DESC;

-- Step 5: Show all users
SELECT 'All users in the system:' as status;
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
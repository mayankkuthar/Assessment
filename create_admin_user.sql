-- Create Admin User via SQL
-- Run this script in your Supabase SQL editor

-- Step 1: Create a user in auth.users (you'll need to replace with actual values)
-- Note: This creates a user with a specific email and password
-- Replace 'admin@example.com' and 'adminpassword123' with your desired credentials

-- First, let's check if the user already exists
SELECT 
    id,
    email,
    created_at
FROM auth.users 
WHERE email = 'admin@example.com';

-- If the user doesn't exist, you'll need to create them through the app first
-- Then run this script to make them admin

-- Step 2: Make the user an admin (replace the user_id with the actual ID from step 1)
-- Uncomment and modify the line below with the actual user_id from step 1

-- INSERT INTO user_roles (user_id, role, email) 
-- VALUES ('REPLACE_WITH_ACTUAL_USER_ID', 'admin', 'admin@example.com')
-- ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

-- Alternative: If you want to make an existing user admin, use this:
-- UPDATE user_roles SET role = 'admin' WHERE email = 'admin@example.com';

-- Step 3: Verify the admin user was created
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

-- Step 4: Show all users and their roles
SELECT 
    ur.id,
    ur.user_id,
    ur.role,
    ur.email,
    ur.created_at,
    au.email as auth_email,
    au.created_at as auth_created_at
FROM user_roles ur
LEFT JOIN auth.users au ON ur.user_id = au.id
ORDER BY ur.created_at DESC; 
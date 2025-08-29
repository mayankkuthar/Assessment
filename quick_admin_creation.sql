-- Quick Admin User Creation
-- Follow these steps to create an admin user

-- Step 1: Check existing users
SELECT 'Current users in auth.users:' as info;
SELECT 
    id,
    email,
    created_at
FROM auth.users 
ORDER BY created_at DESC;

-- Step 2: Check existing user roles
SELECT 'Current user roles:' as info;
SELECT 
    ur.id,
    ur.user_id,
    ur.role,
    ur.email,
    ur.created_at
FROM user_roles ur
ORDER BY ur.created_at DESC;

-- Step 3: To create an admin user, follow these steps:
-- 1. Go to your app at http://localhost:5176/
-- 2. Sign up with any email (e.g., admin@example.com)
-- 3. The first user automatically becomes admin
-- 4. If you want to make an existing user admin, run this:

-- Make a specific user admin (replace 'user@example.com' with actual email):
-- UPDATE user_roles SET role = 'admin' WHERE email = 'user@example.com';

-- Step 4: Verify admin users
SELECT 'Admin users:' as info;
SELECT 
    ur.id,
    ur.user_id,
    ur.role,
    ur.email,
    ur.created_at
FROM user_roles ur
WHERE ur.role = 'admin'
ORDER BY ur.created_at DESC; 
-- Create User using Supabase Management Functions
-- This approach uses Supabase's built-in management functions

-- Method 1: Using auth.users management (if available)
-- Note: This might require special permissions

-- Check available auth functions
SELECT 'Available auth functions:' as info;
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'auth' 
AND routine_name LIKE '%user%'
ORDER BY routine_name;

-- Method 2: Create user using auth.signup (most reliable)
-- This creates a user with email verification
SELECT 'Creating user with auth.signup...' as status;

-- Create the user
SELECT auth.signup(
    'admin@example.com',           -- Email
    'AdminPassword123!',           -- Password (must be strong)
    '{"role": "admin"}'::jsonb     -- Metadata
);

-- Method 3: Alternative approach - create user without email verification
-- This might work in some Supabase configurations
SELECT 'Alternative user creation method...' as status;

-- Try to create user directly (this might not work due to security restrictions)
-- INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, created_at, updated_at)
-- VALUES (
--     'admin@example.com',
--     crypt('AdminPassword123!', gen_salt('bf')),
--     now(),
--     now(),
--     now()
-- );

-- Method 4: Check if user was created and create role
SELECT 'Checking user creation and creating role...' as status;

-- Check if user exists
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at
FROM auth.users 
WHERE email = 'admin@example.com';

-- Create admin role for the user
INSERT INTO user_roles (user_id, role, email) 
SELECT 
    id,
    'admin',
    email
FROM auth.users 
WHERE email = 'admin@example.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

-- Final verification
SELECT 'Final verification - Admin users:' as status;
SELECT 
    ur.id,
    ur.user_id,
    ur.role,
    ur.email,
    ur.created_at,
    au.email as auth_email,
    au.email_confirmed_at
FROM user_roles ur
LEFT JOIN auth.users au ON ur.user_id = au.id
WHERE ur.role = 'admin'
ORDER BY ur.created_at DESC;

-- Show all users
SELECT 'All users in system:' as status;
SELECT 
    ur.id,
    ur.user_id,
    ur.role,
    ur.email,
    ur.created_at,
    au.email as auth_email,
    au.email_confirmed_at
FROM user_roles ur
LEFT JOIN auth.users au ON ur.user_id = au.id
ORDER BY ur.created_at DESC; 
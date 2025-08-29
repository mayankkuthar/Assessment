-- Direct Admin Creation
-- This script will make the first user in user_roles an admin

-- Step 1: Check if there are any users
SELECT 'Checking for existing users...' as status;
SELECT COUNT(*) as total_users FROM user_roles;

-- Step 2: Make the first user admin (if any exist)
UPDATE user_roles 
SET role = 'admin' 
WHERE id = (
    SELECT id 
    FROM user_roles 
    ORDER BY created_at ASC 
    LIMIT 1
);

-- Step 3: Verify the change
SELECT 'Admin users after update:' as status;
SELECT 
    ur.id,
    ur.user_id,
    ur.role,
    ur.email,
    ur.created_at
FROM user_roles ur
WHERE ur.role = 'admin'
ORDER BY ur.created_at DESC;

-- Step 4: Show all users
SELECT 'All users and their roles:' as status;
SELECT 
    ur.id,
    ur.user_id,
    ur.role,
    ur.email,
    ur.created_at
FROM user_roles ur
ORDER BY ur.created_at DESC;

-- If no users exist, you'll need to create one first through the app
-- Then run this script again to make them admin 
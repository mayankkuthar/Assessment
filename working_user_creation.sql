-- Working User Creation via SQL
-- This script uses Supabase's actual available functions

-- Step 1: Check what auth functions are actually available
SELECT 'Available auth functions:' as info;
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_schema = 'auth' 
ORDER BY routine_name;

-- Step 2: Check if we can access auth.users table
SELECT 'Checking auth.users table access...' as info;
SELECT COUNT(*) as total_users FROM auth.users;

-- Step 3: Check existing users
SELECT 'Existing users:' as info;
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at
FROM auth.users 
ORDER BY created_at DESC;

-- Step 4: Since we can't create users directly via SQL, let's create a trigger
-- that automatically makes the first user an admin when they sign up

-- Create a function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if this is the first user
    IF (SELECT COUNT(*) FROM user_roles) = 0 THEN
        -- First user becomes admin
        INSERT INTO user_roles (user_id, role, email)
        VALUES (NEW.id, 'admin', NEW.email);
    ELSE
        -- Subsequent users become regular users
        INSERT INTO user_roles (user_id, role, email)
        VALUES (NEW.id, 'user', NEW.email);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Step 5: Alternative approach - Create a function to manually create admin role
CREATE OR REPLACE FUNCTION create_admin_user(user_email TEXT)
RETURNS TEXT AS $$
DECLARE
    user_id UUID;
BEGIN
    -- Find the user by email
    SELECT id INTO user_id FROM auth.users WHERE email = user_email;
    
    IF user_id IS NULL THEN
        RETURN 'User not found: ' || user_email;
    END IF;
    
    -- Create or update admin role
    INSERT INTO user_roles (user_id, role, email)
    VALUES (user_id, 'admin', user_email)
    ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
    
    RETURN 'Admin role created for: ' || user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Test the function with an existing user
-- Replace 'mayank8055neel@gmail.com' with an actual user email
SELECT create_admin_user('mayank8055neel@gmail.com');

-- Step 7: Verify admin users
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

-- Step 8: Show all users
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
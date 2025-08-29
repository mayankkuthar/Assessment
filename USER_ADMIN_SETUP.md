# User/Admin System Setup Guide

## Overview
The assessment tool now supports two types of users:
- **Users**: Can view their dashboard, take quizzes, and see their records
- **Admins**: Can manage profiles, packets, quizzes, assignments, and generate reports

## Database Setup

### 1. Run the Migration
Execute the following SQL in your Supabase SQL editor:

```sql
-- Run the add_user_roles_table.sql file
-- This will create the user_roles table and update quiz_attempts
```

### 2. Verify Tables
Make sure these tables exist:
- `user_roles` - Stores user roles (user/admin)
- `quiz_attempts` - Now includes `user_id` field
- All existing tables (profiles, packets, questions, quizzes, etc.)

## User Registration & Login

### 1. User Registration
1. Go to the login page
2. Click "Sign Up" tab
3. Enter email and password
4. Select account type:
   - **User**: Regular user access
   - **Admin**: Full administrative access
5. Click "Sign Up"
6. Verify your email (check spam folder)

### 2. User Login
1. Go to the login page
2. Enter your email and password
3. Click "Sign In"
4. You'll be redirected to the appropriate dashboard

## User Experience

### Regular Users
After login, users see:
- **Home**: Personal dashboard with stats and assigned quizzes
- **Quiz Records**: History of quiz attempts and scores

### Admins
After login, admins see:
- **Admin Dashboard**: System overview and statistics
- **Profile Management**: Create and manage user profiles
- **Packet Management**: Create question packets and add questions
- **Quiz Builder**: Build quizzes by combining packets
- **Assigned Quizzes**: View and manage quiz assignments
- **Assessment Reports**: Generate reports for users or aggregated data

## Features

### User Features
- View personal dashboard with progress
- See assigned quizzes
- Take quizzes via shareable links
- View quiz attempt history
- Track performance statistics

### Admin Features
- Create and manage user profiles
- Create question packets with MCQ/True-False questions
- Build quizzes by combining packets
- Assign quizzes to profiles
- Generate assessment reports
- Upload Excel files for bulk data import
- View all user attempts and statistics

## Security
- Row Level Security (RLS) ensures users only see their own data
- Admins can view and manage all data
- User roles are stored securely in the database
- All operations are authenticated

## Troubleshooting

### Common Issues

1. **"No user found" error**
   - Make sure you're logged in
   - Check if your account was created successfully

2. **Can't access admin features**
   - Verify your account has admin role
   - Check the user_roles table in Supabase

3. **Quiz attempts not saving**
   - Ensure you're logged in when taking quizzes
   - Check database permissions

4. **Database connection issues**
   - Verify Supabase configuration
   - Check environment variables

### Database Queries

Check user roles:
```sql
SELECT * FROM user_roles WHERE email = 'your-email@example.com';
```

Check quiz attempts:
```sql
SELECT * FROM quiz_attempts WHERE user_id = 'your-user-id';
```

## Next Steps

1. **Set up your first admin account**
2. **Create user profiles** (e.g., Students, Employees, Managers)
3. **Create question packets** with your assessment questions
4. **Build quizzes** by combining packets
5. **Assign quizzes** to appropriate profiles
6. **Share quiz links** with users
7. **Generate reports** to track performance

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify database permissions
3. Ensure all tables are created correctly
4. Check Supabase logs for server-side errors 
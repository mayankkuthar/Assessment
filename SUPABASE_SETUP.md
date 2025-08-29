# Supabase Integration Setup Guide

This guide will help you set up Supabase PostgreSQL database for your assessment tool.

## Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. A Supabase project created
3. Your project URL and API key

## Step 1: Set Up Your Supabase Project

1. Go to your Supabase dashboard
2. Create a new project or use an existing one
3. Note down your project URL and anon key from the Settings > API section

## Step 2: Configure Environment Variables

1. In your project root, you should have a `.env` file (created automatically)
2. Replace the placeholder values with your actual Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 3: Set Up Database Schema

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `database_schema.sql` file
4. Paste and run the SQL commands

This will create:
- `profiles` table (for user profiles like Student, CEO, etc.)
- `packets` table (for question groups)
- `questions` table (for individual questions)
- `quizzes` table (for quiz definitions)
- `quiz_packets` table (many-to-many relationship between quizzes and packets)
- `quiz_assignments` table (many-to-many relationship between quizzes and profiles)
- `quiz_attempts` table (for tracking quiz attempts)

## Step 4: Test the Integration

1. Start your development server: `npm run dev`
2. The app should now load data from Supabase instead of localStorage
3. Try creating a profile, packet, or quiz to test the database connection

## Step 5: Verify Data in Supabase

1. Go to your Supabase dashboard
2. Navigate to Table Editor
3. You should see your tables and any data you've created

## Database Schema Overview

### Tables

1. **profiles**
   - `id` (UUID, Primary Key)
   - `name` (VARCHAR) - e.g., "Student", "CEO"
   - `type` (VARCHAR) - e.g., "student", "executive"
   - `created_at`, `updated_at` (timestamps)

2. **packets**
   - `id` (UUID, Primary Key)
   - `name` (VARCHAR) - e.g., "Basic Knowledge"
   - `description` (TEXT)
   - `created_at`, `updated_at` (timestamps)

3. **questions**
   - `id` (UUID, Primary Key)
   - `packet_id` (UUID, Foreign Key to packets)
   - `question_text` (TEXT)
   - `question_type` (VARCHAR) - "mcq" or "true_false"
   - `options` (JSONB) - for MCQ options
   - `correct_answer` (VARCHAR)
   - `created_at`, `updated_at` (timestamps)

4. **quizzes**
   - `id` (UUID, Primary Key)
   - `name` (VARCHAR)
   - `description` (TEXT)
   - `time_limit` (INTEGER) - in minutes, NULL for no limit
   - `passing_score` (INTEGER) - percentage, default 70
   - `created_at`, `updated_at` (timestamps)

5. **quiz_packets** (Junction table)
   - `id` (UUID, Primary Key)
   - `quiz_id` (UUID, Foreign Key to quizzes)
   - `packet_id` (UUID, Foreign Key to packets)
   - `created_at` (timestamp)

6. **quiz_assignments** (Junction table)
   - `id` (UUID, Primary Key)
   - `quiz_id` (UUID, Foreign Key to quizzes)
   - `profile_id` (UUID, Foreign Key to profiles)
   - `assigned_at` (timestamp)

7. **quiz_attempts**
   - `id` (UUID, Primary Key)
   - `quiz_id` (UUID, Foreign Key to quizzes)
   - `profile_id` (UUID, Foreign Key to profiles)
   - `started_at`, `completed_at` (timestamps)
   - `score`, `total_questions`, `correct_answers` (INTEGER)
   - `answers` (JSONB) - stores user answers

## Security

The schema includes Row Level Security (RLS) policies that:
- Allow public read access to quizzes, packets, questions, and profiles (for quiz attempts)
- Allow public insert/update access to quiz_attempts
- Allow all operations on other tables (you can restrict these later with authentication)

## Troubleshooting

### Common Issues

1. **"Invalid API key" error**
   - Check that your `.env` file has the correct Supabase URL and anon key
   - Make sure the environment variables start with `VITE_`

2. **"Table doesn't exist" error**
   - Make sure you've run the SQL schema in your Supabase SQL Editor
   - Check that the table names match exactly

3. **CORS errors**
   - Go to your Supabase dashboard > Settings > API
   - Add your localhost URL to the allowed origins

4. **RLS policy errors**
   - Check that the RLS policies are properly set up
   - You can temporarily disable RLS for testing

### Getting Help

- Check the Supabase documentation: https://supabase.com/docs
- Check the browser console for detailed error messages
- Verify your database connection in the Supabase dashboard

## Next Steps

1. **Add Authentication**: Implement user authentication with Supabase Auth
2. **Add Real-time Features**: Use Supabase real-time subscriptions for live updates
3. **Add File Storage**: Use Supabase Storage for file uploads
4. **Add Analytics**: Track quiz performance and user behavior
5. **Add Backup**: Set up automated database backups

## Migration from localStorage

The app now uses Supabase instead of localStorage. All existing functionality should work the same, but data will be persisted in the database instead of the browser.

If you have existing data in localStorage that you want to migrate:
1. Export the data from localStorage
2. Use the database service functions to import the data
3. Or create a migration script to transfer the data 
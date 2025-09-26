-- Migration script to add report_header and report_footer columns to quizzes table in SQLite
-- Run this script to update existing SQLite database

-- Add report_header column
ALTER TABLE quizzes ADD COLUMN report_header TEXT;

-- Add report_footer column  
ALTER TABLE quizzes ADD COLUMN report_footer TEXT;










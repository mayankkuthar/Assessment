-- Migration script to add report_header and report_footer columns to quizzes table
-- Run this script to update existing database

-- Add report_header column
ALTER TABLE quizzes ADD COLUMN report_header TEXT;

-- Add report_footer column  
ALTER TABLE quizzes ADD COLUMN report_footer TEXT;

-- Update existing quizzes to have empty strings for the new columns
UPDATE quizzes SET report_header = '' WHERE report_header IS NULL;
UPDATE quizzes SET report_footer = '' WHERE report_footer IS NULL;










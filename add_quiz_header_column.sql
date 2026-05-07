-- Migration: add quiz_header column to quizzes table
-- This stores the customizable "Why should you take this quiz" text shown on the start screen
-- Non-breaking: column is nullable, existing rows default to NULL (fallback text shown in UI)

ALTER TABLE quizzes ADD COLUMN quiz_header TEXT;

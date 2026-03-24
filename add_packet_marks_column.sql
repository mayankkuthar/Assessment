-- Add packet_marks column to quiz_attempts table
ALTER TABLE quiz_attempts
ADD COLUMN IF NOT EXISTS packet_marks JSONB;
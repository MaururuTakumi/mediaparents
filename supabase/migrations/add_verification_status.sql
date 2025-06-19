-- Add verification_status column to writers table
ALTER TABLE writers 
ADD COLUMN verification_status TEXT DEFAULT 'unsubmitted' 
CHECK (verification_status IN ('unsubmitted', 'pending', 'verified'));

-- Add student_id_url column for storing student ID image
ALTER TABLE writers 
ADD COLUMN student_id_url TEXT;

-- Create storage bucket for student IDs
INSERT INTO storage.buckets (id, name, public)
VALUES ('student-ids', 'student-ids', false)
ON CONFLICT (id) DO NOTHING;
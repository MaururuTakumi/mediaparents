-- Add role column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'viewer' 
CHECK (role IN ('viewer', 'writer', 'admin'));

-- Create index for role queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Update existing writers to have 'writer' role
UPDATE profiles 
SET role = 'writer' 
WHERE id IN (SELECT id FROM writers);

-- Create a function to automatically set role when a writer is created
CREATE OR REPLACE FUNCTION set_writer_role()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles 
  SET role = 'writer' 
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new writers
DROP TRIGGER IF EXISTS on_writer_created ON writers;
CREATE TRIGGER on_writer_created
AFTER INSERT ON writers
FOR EACH ROW
EXECUTE FUNCTION set_writer_role();

-- Create a function to revert role when a writer is deleted
CREATE OR REPLACE FUNCTION revert_writer_role()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles 
  SET role = 'viewer' 
  WHERE id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for deleted writers
DROP TRIGGER IF EXISTS on_writer_deleted ON writers;
CREATE TRIGGER on_writer_deleted
AFTER DELETE ON writers
FOR EACH ROW
EXECUTE FUNCTION revert_writer_role();
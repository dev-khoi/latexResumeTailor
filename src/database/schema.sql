-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- USERS TABLE
-- =============================================================================
-- Simple user table linked to Supabase auth
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view their own record"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own record"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own record"
  ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =============================================================================
-- USER RESUMES TABLE
-- =============================================================================
-- Stores metadata and links to resume files in Supabase Storage
CREATE TABLE IF NOT EXISTS public.user_resumes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- File information
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL UNIQUE, -- Path in Supabase Storage (e.g., "userId/filename.tex")
  file_size_bytes INTEGER,
  file_type TEXT DEFAULT 'text/x-tex', -- MIME type
  
  -- Metadata
  original_file_name TEXT NOT NULL, -- Original uploaded filename
  version INTEGER DEFAULT 1, -- Version number for tracking updates
  is_active BOOLEAN DEFAULT true, -- Mark if this is the current active resume
  
  -- Additional fields
  description TEXT,
  tags TEXT[], -- Array of tags for categorization
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE -- Soft delete
);

-- Enable Row Level Security
ALTER TABLE public.user_resumes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_resumes
CREATE POLICY "Users can view their own resumes"
  ON public.user_resumes
  FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can insert their own resumes"
  ON public.user_resumes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resumes"
  ON public.user_resumes
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resumes"
  ON public.user_resumes
  FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================================================
-- INDEXES
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_user_resumes_user_id ON public.user_resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_resumes_created_at ON public.user_resumes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_resumes_is_active ON public.user_resumes(user_id, is_active) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_user_resumes_file_path ON public.user_resumes(file_path);

-- =============================================================================
-- FUNCTIONS AND TRIGGERS
-- =============================================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users updated_at
CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger for user_resumes updated_at
CREATE TRIGGER set_user_resumes_updated_at
  BEFORE UPDATE ON public.user_resumes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function to automatically create user record on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user record when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to sync user email updates from auth.users to public.users
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users
  SET 
    email = NEW.email,
    updated_at = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to sync email updates from auth.users
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW
  WHEN (OLD.email IS DISTINCT FROM NEW.email)
  EXECUTE FUNCTION public.handle_user_update();

-- Function to handle user deletion from auth.users
CREATE OR REPLACE FUNCTION public.handle_user_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- The CASCADE on foreign key will handle the deletion
  -- This is just for logging or additional cleanup if needed
  DELETE FROM public.users WHERE id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to delete user record when auth user is deleted
CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_delete();

-- =============================================================================
-- STORAGE TRIGGERS
-- =============================================================================

-- Function to handle new file uploads to storage
CREATE OR REPLACE FUNCTION public.handle_storage_upload()
RETURNS TRIGGER AS $$
DECLARE
  user_uuid UUID;
  extracted_filename TEXT;
BEGIN
  -- Only process files in the latexResume bucket
  IF NEW.bucket_id = 'latexResume' THEN
    -- Extract user_id from the path (first folder in the path)
    user_uuid := (storage.foldername(NEW.name))[1]::UUID;
    
    -- Extract just the filename from the full path
    extracted_filename := (regexp_matches(NEW.name, '[^/]+$'))[1];
    
    -- Insert record into user_resumes table
    INSERT INTO public.user_resumes (
      user_id,
      file_name,
      file_path,
      file_size_bytes,
      file_type,
      original_file_name
    ) VALUES (
      user_uuid,
      extracted_filename,
      NEW.name,
      (NEW.metadata->>'size')::INTEGER,
      (NEW.metadata->>'mimetype')::TEXT,
      extracted_filename
    )
    ON CONFLICT (file_path) DO UPDATE
    SET 
      file_size_bytes = EXCLUDED.file_size_bytes,
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically insert into user_resumes when file is uploaded
CREATE TRIGGER on_storage_object_created
  AFTER INSERT ON storage.objects
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_storage_upload();

-- Function to handle file deletion from storage
CREATE OR REPLACE FUNCTION public.handle_storage_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Soft delete the corresponding record in user_resumes
  IF OLD.bucket_id = 'latexResume' THEN
    UPDATE public.user_resumes
    SET deleted_at = NOW()
    WHERE file_path = OLD.name AND deleted_at IS NULL;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to soft delete record when file is removed from storage
CREATE TRIGGER on_storage_object_deleted
  AFTER DELETE ON storage.objects
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_storage_delete();

-- =============================================================================-- STORAGE POLICIES (Run these in Supabase Dashboard under Storage)
-- =============================================================================
-- Note: These need to be applied in the Supabase Dashboard Storage section
-- for the "latexResume" bucket

-- 1. Allow authenticated users to upload files to their own folder:
-- CREATE POLICY "Users can upload to their own folder"
-- ON storage.objects FOR INSERT
-- TO authenticated
-- WITH CHECK (bucket_id = 'latexResume' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 2. Allow users to read their own files:
-- CREATE POLICY "Users can read their own files"
-- ON storage.objects FOR SELECT
-- TO authenticated
-- USING (bucket_id = 'latexResume' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 3. Allow users to delete their own files:
-- CREATE POLICY "Users can delete their own files"
-- ON storage.objects FOR DELETE
-- TO authenticated
-- USING (bucket_id = 'latexResume' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 4. Allow users to update their own files:
-- CREATE POLICY "Users can update their own files"
-- ON storage.objects FOR UPDATE
-- TO authenticated
-- USING (bucket_id = 'latexResume' AND auth.uid()::text = (storage.foldername(name))[1]);




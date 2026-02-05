# Supabase Storage Setup for LaTeX Files

## Required Configuration

### 1. Create Storage Bucket

1. Go to your Supabase Dashboard: `https://supabase.com/dashboard/project/_/storage/buckets`
2. Click "New Bucket"
3. Configure the bucket:

- **Name**: `latexResume`
- **Public**: Enable if you want files to be publicly accessible
- **File size limit**: Set to 5MB (or higher if needed)
- **Allowed MIME types**: Add `text/x-tex` and `application/x-latex`

### 2. Set Up Storage Policies (RLS)

Navigate to Storage > Policies and create these policies for the `latexResume` bucket:

#### Policy 1: Allow authenticated users to upload

```sql
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'latexResume' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

#### Policy 2: Allow users to read their own files

```sql
CREATE POLICY "Allow users to read own files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'latexResume' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

#### Policy 3: Allow users to delete their own files

```sql
CREATE POLICY "Allow users to delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'latexResume' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

#### Policy 4: (Optional) Allow public read access

```sql
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'latexResume');
```

### 3. Environment Variables

Ensure your `.env.local` file has:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your-anon-key
```

### 4. File Structure

Files will be organized as:

```
latexResume/
├── {userId}/
│   ├── resume_1234567890.tex
│   └── cv_1234567891.latex
└── public/
  └── anonymous_1234567892.tex
```

## Usage

### Upload a File

```typescript
import { uploadLatexFile } from "@/utils/database/buckets/uploadFile"

const result = await uploadLatexFile(file, userId)
if (result.success) {
  console.log("Uploaded to:", result.data.path)
}
```

### Get File URL

```typescript
import { getLatexFileUrl } from "@/utils/database/buckets/uploadFile"

const url = getLatexFileUrl(path)
```

### Delete a File

```typescript
import { deleteLatexFile } from "@/utils/database/buckets/uploadFile"

const success = await deleteLatexFile(path)
```

## Testing

1. Start your dev server: `pnpm run dev`
2. Navigate to the page with the upload component
3. Select a `.tex` or `.latex` file
4. Click "Submit"
5. Check the Supabase Storage dashboard to verify the upload

## Troubleshooting

- **"new row violates row-level security policy"**: Check your RLS policies
- **"Bucket not found"**: Ensure the bucket name is exactly `latexResume`
- **"File too large"**: Check the file size limit in bucket settings
- **"Invalid file type"**: Verify MIME types are configured correctly

<!-- code -->

bucket_id = 'latexResume'
-- Policy 1: Allow authenticated users to upload

CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
bucket_id = 'latexResume' AND
(storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Allow users to read their own files

CREATE POLICY "Allow users to read own files"
ON storage.objects FOR SELECT
TO authenticated
USING (
bucket_id = 'latexResume' AND
(storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 3: Allow users to delete their own files

CREATE POLICY "Allow users to delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
bucket_id = 'latexResume' AND
(storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 4: (Optional) Allow public read access
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'latexResume');

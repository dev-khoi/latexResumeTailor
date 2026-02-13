# Google OAuth Setup for Supabase

## Steps to Enable Google OAuth

### 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Select **Web application**
6. Add authorized redirect URIs:
   - Development: `http://localhost:3000/auth/callback`
   - Production: `https://yourdomain.com/auth/callback`
   - **Supabase callback**: `https://your-project-ref.supabase.co/auth/v1/callback`
7. Click **Create** and save your:
   - Client ID
   - Client Secret

### 2. Configure Supabase

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Find **Google** and click to expand
5. Enable the Google provider
6. Enter your Google OAuth credentials:
   - **Client ID** (from Google Cloud Console)
   - **Client Secret** (from Google Cloud Console)
7. Copy the **Callback URL** from Supabase (should be like `https://your-project-ref.supabase.co/auth/v1/callback`)
8. Go back to Google Cloud Console and add this URL to your authorized redirect URIs
9. Save changes in Supabase

### 3. Update Your Application URL in Supabase

1. In Supabase Dashboard → **Settings** → **General**
2. Set your **Site URL** to:
   - Development: `http://localhost:3000`
   - Production: `https://yourdomain.com`
3. Add redirect URLs under **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `https://yourdomain.com/auth/callback`

### 4. Environment Variables

Ensure your `.env.local` has:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 5. Test the Integration

1. Restart your development server
2. Go to `/auth/login`
3. Click "Continue with Google"
4. Complete the Google sign-in flow
5. You should be redirected to `/resume` after successful authentication

## Troubleshooting

- **redirect_uri_mismatch error**: Make sure all redirect URIs are added in both Google Cloud Console and Supabase
- **Invalid OAuth client**: Double-check your Client ID and Secret in Supabase
- **Not redirecting after login**: Check the callback URL configuration and ensure the route handler exists at `/app/auth/callback/route.ts`

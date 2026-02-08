# Smritikana Portal - Next.js Application

## Setup Instructions

### 1. Install Dependencies

```bash
cd app
npm install
```

### 2. Configure Supabase

1. Create a Supabase project at https://supabase.com
2. Copy `.env.local.example` to `.env.local`
3. Fill in your Supabase credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your anon/public key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your service role key (keep secret!)

### 3. Set Up Database

1. Go to Supabase SQL Editor
2. Run the entire `supabase-schema.sql` file
3. Create Storage Bucket:
   - Name: `kyc-documents`
   - Privacy: Private
   - Add RLS policy for user uploads

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3001`

## Architecture

- **Marketing Site**: `/smritikana-microfinance/` (Vanilla HTML/CSS/JS)
- **Client Portal**: `/app/` (Next.js 15 + TypeScript + Tailwind)
- **Backend**: Supabase (PostgreSQL + Auth + Storage)

## Features Implemented

✅ User Authentication (Email/Password)  
✅ Protected Dashboard with Session Management  
✅ Profile Management  
✅ Application Tracking (CRUD)  
✅ Document Vault (Ready for uploads)  
✅ Real-time Updates (Via Supabase Realtime)  
✅ Edge Middleware (Session Validation)  
✅ Row Level Security (RLS)  

## Project Structure

```
app/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── applications/
│   │   ├── documents/
│   │   └── tracker/
│   ├── api/
│   │   └── auth/
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   └── supabase/
│       ├── client.ts
│       └── server.ts
├── middleware.ts
└── supabase-schema.sql
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy!

### Environment Variables in Vercel

```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

## Security Features

- ✅ Row Level Security (RLS) on all tables
- ✅ JWT-based authentication
- ✅ Edge middleware for session validation
- ✅ Secure cookie handling
- ✅ Protected API routes
- ✅ XSS and CSRF protection

## Next Steps

1. Create document upload functionality
2. Implement registration tracker with real-time updates
3. Add consultant portal (admin role)
4. Build application forms (DSC, DIN, etc.)
5. Integrate WhatsApp notifications

## Support

For issues or questions, refer to:
- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs

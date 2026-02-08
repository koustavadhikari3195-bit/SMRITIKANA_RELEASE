# 🚀 Deployment Guide: Smritikana Business Solutions

Your project is ready for deployment! Follow these steps to push to Git and deploy to Vercel.

---

## 📋 Pre-Deployment Checklist

✅ Project is running locally at **http://localhost:3001**  
✅ Git repository initialized  
✅ Custom branding and images integrated  
✅ Color scheme updated to match logo  

---

## 🔧 Step 1: Configure Git User (Required)

Before committing, set your Git identity:

```bash
git config --global user.email "your-email@example.com"
git config --global user.name "Your Name"
```

Or set it only for this repository:

```bash
cd "f:\Sritikana WebSite"
git config user.email "your-email@example.com"
git config user.name "Avijit Chowdhury"
```

---

## 📤 Step 2: Commit Your Code

```bash
cd "f:\Sritikana WebSite"
git add .
git commit -m "Initial commit: Smritikana Business Solutions platform"
```

---

## 🌐 Step 3: Create GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Create a new repository named `smritikana-platform`
3. **Do NOT initialize** with README (your repo already has files)
4. Copy the repository URL (e.g., `https://github.com/yourusername/smritikana-platform.git`)

---

## ⬆️ Step 4: Push to GitHub

```bash
git remote add origin https://github.com/yourusername/smritikana-platform.git
git branch -M main
git push -u origin main
```

---

## 🚀 Step 5: Deploy to Vercel (Recommended)

### Option A: Vercel CLI (Fastest)
```bash
npm install-g vercel
cd "f:\Sritikana WebSite"
vercel
```

### Option B: Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click **"New Project"**
4. Import your `smritikana-platform` repository
5. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** `app`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
6. Add Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
   ```
7. Click **"Deploy"**

---

## 🔐 Step 6: Update Supabase Site URL

After deployment:
1. Copy your Vercel deployment URL (e.g., `smritikana.vercel.app`)
2. Go to **Supabase Dashboard** → **Authentication** → **URL Configuration**
3. Update **Site URL** to your Vercel URL
4. Add Vercel URL to **Redirect URLs**

---

## ✅ Post-Deployment

- Test registration and login
- Verify document uploads work
- Check all pages load correctly

Your platform is now LIVE! 🎉

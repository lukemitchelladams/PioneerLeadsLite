# Pioneer Leads Tracker
### Lead Management System for Pioneer Granite and Quartz

---

## Overview

A full-stack web application for tracking customer leads, managing follow-ups, and monitoring your sales pipeline. Built with Next.js 14, Supabase, and Tailwind CSS. Deployed on Vercel.

**Features:**
- 🔐 Secure login system
- 📋 Lead management with full CRUD (Create, Read, Update, Delete)
- 📍 Lead source tracking (Walk-In, Phone Call, Google My Business, Angi, Thumbtack, Other)
- 🏠 Residential / Commercial classification
- 📊 Dashboard with stats (Total, New Today, Active, Won)
- 🔍 Search and filter leads by source, status, type
- 💬 Notes/activity feed per lead
- ✏️ Inline editing of all lead information
- 📱 Mobile-responsive design

---

## Deployment Guide

Follow these steps **in order** to get your system live.

---

### STEP 1 — Create a Supabase Project (your database)

1. Go to **https://supabase.com** and create a free account
2. Click **"New Project"**
3. Fill in:
   - **Name:** `pioneer-leads`
   - **Database Password:** (create a strong password — save it somewhere!)
   - **Region:** pick the closest to you (e.g. US East)
4. Click **"Create new project"** — wait about 2 minutes for it to spin up

---

### STEP 2 — Set Up Your Database Tables

1. In your Supabase project, click **"SQL Editor"** in the left sidebar
2. Click **"New query"**
3. Copy and paste ALL of the SQL below, then click **"Run"**:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Leads table
CREATE TABLE leads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  type TEXT CHECK (type IN ('residential', 'commercial')) DEFAULT 'residential',
  lead_date DATE DEFAULT CURRENT_DATE,
  lead_source TEXT CHECK (lead_source IN ('walk-in', 'phone-call', 'google-mb', 'angi', 'thumbtack', 'other')) NOT NULL,
  status TEXT CHECK (status IN ('new', 'contacted', 'quoted', 'won', 'lost')) DEFAULT 'new'
);

-- Lead notes table
CREATE TABLE lead_notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  user_id UUID
);

-- Enable Row Level Security (RLS)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_notes ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users full access to leads
CREATE POLICY "Authenticated users can manage leads"
  ON leads FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow all authenticated users full access to notes
CREATE POLICY "Authenticated users can manage notes"
  ON lead_notes FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
```

4. You should see **"Success. No rows returned"** — that means it worked ✅

---

### STEP 3 — Create a Login Account

1. In Supabase, click **"Authentication"** in the left sidebar
2. Click **"Add user"** → **"Create new user"**
3. Enter:
   - **Email:** your work email (e.g. `admin@pioneergranite.com`)
   - **Password:** create a secure password
4. Click **"Create User"**
5. Repeat for any additional team members who need access

---

### STEP 4 — Get Your Supabase API Keys

1. In Supabase, click **"Project Settings"** (gear icon) → **"API"**
2. Copy these two values — you'll need them in Step 7:
   - **Project URL** (looks like: `https://abcdefgh.supabase.co`)
   - **anon / public key** (long string starting with `eyJ...`)

---

### STEP 5 — Upload Code to GitHub

1. Go to **https://github.com** and create a free account if you don't have one
2. Click the **"+"** button → **"New repository"**
3. Name it `pioneer-leads`, keep it **Private**, click **"Create repository"**
4. On your computer, open **Terminal** (Mac) or **Command Prompt** (Windows)
5. Navigate to the folder where you unzipped the project files:
   ```
   cd path/to/pioneer-leads
   ```
6. Run these commands one at a time:
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/pioneer-leads.git
   git push -u origin main
   ```
   (Replace `YOUR_USERNAME` with your GitHub username)

---

### STEP 6 — Deploy to Vercel

1. Go to **https://vercel.com** and sign up with your GitHub account
2. Click **"Add New..."** → **"Project"**
3. Find your `pioneer-leads` repository and click **"Import"**
4. Leave all settings as default — Vercel auto-detects Next.js
5. Click **"Deploy"** — don't add environment variables yet, we'll do that next

---

### STEP 7 — Add Your Environment Variables to Vercel

1. After deployment, go to your project in Vercel
2. Click **"Settings"** → **"Environment Variables"**
3. Add these two variables:

   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL from Step 4 |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key from Step 4 |

4. Click **"Save"** for each one
5. Go to **"Deployments"** → click **"Redeploy"** on the latest deployment → click **"Redeploy"** again to confirm

---

### STEP 8 — Set Your Live Domain

1. In Vercel, click **"Settings"** → **"Domains"**
2. Your site will already have a free domain like: `pioneer-leads.vercel.app`
3. **Optional:** If you have a custom domain (e.g. `leads.pioneergranite.com`), click **"Add"** and follow the DNS instructions

---

### STEP 9 — Test Your App

1. Visit your Vercel URL (e.g. `https://pioneer-leads.vercel.app`)
2. You should see the **Pioneer login screen**
3. Log in with the email and password you created in Step 3
4. Try adding a lead!

---

## Adding More Staff Accounts

To give additional team members access:
1. Go to **Supabase → Authentication → Users → Add user**
2. Enter their email and a temporary password
3. Share the login URL and credentials with them
4. They can use the system immediately

---

## Troubleshooting

**"Invalid login credentials" error:**
- Double-check the email and password in Supabase → Authentication → Users

**Blank page or error after login:**
- Check that both environment variables are set correctly in Vercel → Settings → Environment Variables
- Make sure you redeployed after adding them

**"relation does not exist" database error:**
- Go back to Step 2 and run the SQL again in Supabase SQL Editor

**Changes not saving:**
- Check the browser console (F12) for errors
- Verify the Supabase URL and key are correct

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Hosting | Vercel |

---

## Project Structure

```
pioneer-leads/
├── app/
│   ├── login/          # Login page
│   ├── dashboard/      # Main leads dashboard
│   └── leads/
│       ├── new/        # New lead form
│       └── [id]/       # Lead profile (view/edit/notes)
├── components/
│   └── Navbar.tsx      # Top navigation bar
├── lib/
│   ├── types.ts        # TypeScript types
│   └── supabase/       # Supabase client setup
└── middleware.ts       # Auth route protection
```

---

*Pioneer Granite and Quartz — Internal Use Only*

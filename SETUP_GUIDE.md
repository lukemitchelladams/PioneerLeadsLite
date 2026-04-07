# Pioneer Leads Tracker — Complete Setup Guide

**Before you start:** This guide assumes you have no technical experience. Every step is explained in plain English. The whole process takes about 30–45 minutes. You will need a computer (not a phone) to complete it.

---

## What You're Setting Up

Your leads tracker has three parts:

| Part | What it is | Cost |
|------|-----------|------|
| **Supabase** | The database — stores all your leads, notes, and user accounts | Free |
| **GitHub** | Stores your website code | Free |
| **Vercel** | Hosts your live website on the internet | Free |

Think of it like this: Supabase is your filing cabinet, GitHub is where the blueprint of the app lives, and Vercel is the building that displays it to the world.

---

## PART 1 — Set Up Your Database (Supabase)

Supabase is where every lead you enter gets saved. It's a secure online database — like a cloud spreadsheet, but much more powerful. Your account is completely private.

### Step 1 — Create a Supabase Account

1. Open a browser and go to: **https://supabase.com**
2. Click **"Start your project"** (big green button)
3. Click **"Sign Up"** — sign up with your Google account or email
4. Once signed in, you'll see your Supabase dashboard

### Step 2 — Create a New Project

1. Click **"New Project"**
2. If it asks you to create an Organization first, name it **"Pioneer Granite"** and click Continue
3. Fill in the project form:
   - **Name:** `pioneer-leads`
   - **Database Password:** Make up a strong password (like `Pioneer$2025!`) — write it down somewhere safe
   - **Region:** Select **US East (N. Virginia)** or whichever is closest to you
4. Click **"Create new project"**
5. ⏳ Wait about **2 minutes** while it loads — you'll see a spinning progress bar

### Step 3 — Create Your Database Tables

This is the most important step. You're telling the database what information to store.

1. In the left sidebar, click **"SQL Editor"** (it looks like a `>_` terminal icon)
2. Click **"New query"** (top left of the editor area)
3. Copy the **entire block** of SQL below:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Main leads table
CREATE TABLE leads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  lead_date DATE DEFAULT CURRENT_DATE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  type TEXT CHECK (type IN ('residential', 'commercial')) DEFAULT 'residential',
  lead_source TEXT CHECK (lead_source IN ('walk-in', 'phone-call', 'google-mb', 'angi', 'thumbtack', 'other')) NOT NULL,
  status TEXT CHECK (status IN ('new', 'contacted', 'waiting-response', 'quoted', 'won', 'lost')) DEFAULT 'new'
);

-- Notes table (each lead can have many notes)
CREATE TABLE lead_notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  user_id UUID
);

-- Security (only logged-in users can see data)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage leads"
  ON leads FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage notes"
  ON lead_notes FOR ALL TO authenticated
  USING (true) WITH CHECK (true);
```

4. Paste it into the SQL editor (click inside the editor area, then Ctrl+A to select all, then paste)
5. Click the **green "Run"** button (or press Ctrl+Enter)
6. You should see: **"Success. No rows returned"** ✅
   - If you see an error in red, try running it a second time — sometimes it needs a moment

### Step 4 — Turn Off Email Verification

By default, Supabase sends a confirmation email when someone creates an account. Since you're using a secret question instead, you can disable this.

1. In the left sidebar, click **"Authentication"**
2. Click **"Providers"** at the top
3. Click **"Email"** in the list
4. Find **"Confirm email"** and toggle it **OFF**
5. Click **"Save"**

### Step 5 — Get Your API Keys

These are like passwords that let your website talk to your database.

1. In the left sidebar, click **"Project Settings"** (gear icon at the bottom)
2. Click **"API"**
3. You'll see these values — copy them somewhere (like a Notes app) for later:
   - **Project URL** — looks like `https://abcdefgh.supabase.co`
   - **anon / public key** — a long string starting with `eyJ...`
   - **service_role / secret key** — another long string (⚠️ keep this one extra private — it's like a master key)

---

## PART 2 — Upload Your Code to GitHub

GitHub stores your app's code so Vercel can find it and put it on the internet.

### Step 6 — Create a GitHub Account

1. Go to **https://github.com**
2. Click **"Sign up"** — use your email
3. Complete the verification steps

### Step 7 — Create a New Repository

A "repository" is just a folder on GitHub where your code lives.

1. Once logged in, click the **"+"** icon (top right) → **"New repository"**
2. Fill in:
   - **Repository name:** `pioneer-leads`
   - **Visibility:** Select **Private** (so your code stays private)
3. Click **"Create repository"**
4. Leave the page open — you'll need the URL shown on it

### Step 8 — Upload Your Code

You need to put the downloaded files onto GitHub. Here's how:

**If you're on a Mac:**

1. Unzip the `pioneer-leads-v2.zip` file you downloaded (double-click it)
2. Open **Terminal** (press Cmd+Space, type "Terminal", press Enter)
3. Type these commands one at a time, pressing Enter after each:

```
cd ~/Downloads/pioneer-leads
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/pioneer-leads.git
git push -u origin main
```

(Replace `YOUR_USERNAME` with your actual GitHub username)

4. It may ask for your GitHub username and password — enter them

**If you're on Windows:**

1. Unzip the `pioneer-leads-v2.zip` file
2. Download and install **Git for Windows** from: https://git-scm.com/download/win
3. Right-click inside the unzipped `pioneer-leads` folder → **"Git Bash Here"**
4. Run the same commands above in the Git Bash window

---

## PART 3 — Deploy to Vercel (Go Live)

Vercel takes your code from GitHub and puts it on the internet as a real website.

### Step 9 — Create a Vercel Account

1. Go to **https://vercel.com**
2. Click **"Sign Up"** → choose **"Continue with GitHub"**
3. Authorize Vercel to access your GitHub

### Step 10 — Import Your Project

1. Once on your Vercel dashboard, click **"Add New..."** → **"Project"**
2. You'll see your GitHub repositories listed
3. Find `pioneer-leads` and click **"Import"**
4. Vercel will auto-detect that it's a Next.js app — don't change any settings
5. **DO NOT click Deploy yet** — you need to add your environment variables first

### Step 11 — Add Your Environment Variables

This is where you connect Vercel to Supabase and set your secret question answer.

1. On the import screen, look for **"Environment Variables"** and expand it
2. Add these variables one at a time by typing the Name and Value, then clicking "Add":

| Variable Name | Value |
|---------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL from Step 5 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key from Step 5 |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service_role key from Step 5 |
| `SECRET_ANSWER` | **Your middle name** (this is the answer to the staff verification question) |

> **Example:** If your middle name is "James", set `SECRET_ANSWER` to `James`
> The check is case-insensitive, so "james", "James", and "JAMES" all work.

3. After adding all 4 variables, click **"Deploy"**
4. ⏳ Wait 2–3 minutes for the first deployment to complete

### Step 12 — Visit Your Live Site

1. When Vercel shows "Congratulations!" your site is live
2. Click **"Visit"** to see your website — it will have a URL like `pioneer-leads.vercel.app`
3. You'll see the Pioneer login screen ✅

---

## PART 4 — Create Your First Account

### Step 13 — Sign Up as Admin

1. On the login screen, click **"Create Staff Account"**
2. Answer the security question: *"What is the middle name of the person that created this app?"*
   - Enter the middle name you set as `SECRET_ANSWER` in Step 11
3. Click **"Verify & Continue"**
4. Enter your work email and create a password (at least 8 characters)
5. Click **"Create Account & Sign In"**
6. You'll be taken directly to the dashboard — you're in! ✅

### Step 14 — Add Staff Members

For each additional team member who needs access:

1. Send them your website URL (e.g., `pioneer-leads.vercel.app`)
2. Tell them to click **"Create Staff Account"**
3. Tell them the secret answer (your middle name) privately — never in a group chat
4. They create their own email/password
5. They can log in immediately

---

## PART 5 — After Going Live

### Getting a Custom Domain (Optional)

If you want your site at a custom address like `leads.pioneergranite.com`:

1. In Vercel, go to your project → **"Settings"** → **"Domains"**
2. Type your custom domain and click **"Add"**
3. Vercel will give you DNS records to add at your domain registrar (GoDaddy, Namecheap, etc.)
4. Add those records — the domain activates within a few hours

### Making Future Updates

If you want to change anything in the app later:

1. Edit the files on your computer
2. Run `git add . && git commit -m "Update" && git push`
3. Vercel automatically redeploys within 1–2 minutes

### If Someone Leaves the Team

To remove their access:

1. Go to **Supabase** → **Authentication** → **Users**
2. Find their email → click the three dots → **"Delete user"**
3. They can no longer log in

### Backing Up Your Data

Your data is stored in Supabase. To export it:

1. Go to **Supabase** → **Table Editor** → **leads**
2. Click the download/export button to export as CSV

---

## Common Problems & Fixes

**"Invalid login credentials"**
→ Double-check your email and password. If forgotten, go to Supabase → Authentication → Users → find your user → click the three dots → "Send password reset"

**"Incorrect answer" when creating account**
→ The secret answer (`SECRET_ANSWER` in Vercel) must match exactly. Check Vercel → Settings → Environment Variables and confirm the spelling.

**White/blank page after deploying**
→ Check that all 4 environment variables are set in Vercel → Settings → Environment Variables. If you added them after the first deploy, go to Deployments → Redeploy.

**"relation does not exist" error**
→ The database tables weren't created. Go back to Step 3 and run the SQL again.

**"Error: supabase_service_role_key is invalid"**
→ Make sure you used the `service_role` key (not the `anon` key) for `SUPABASE_SERVICE_ROLE_KEY`.

---

## Summary of Your Login System

| Who can access | How |
|---------------|-----|
| Staff creating new account | Must answer secret question (your middle name) |
| Existing staff logging in | Email + password they created |
| Removing someone's access | Delete their user in Supabase dashboard |
| Changing the secret answer | Update `SECRET_ANSWER` in Vercel → Settings → Environment Variables → Redeploy |

---

*Pioneer Granite and Quartz — Internal Use Only*
*For technical support, contact your app developer.*

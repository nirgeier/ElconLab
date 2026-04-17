# Lab 005 – Hosting & Deployment

!!! hint "Overview"

    - In this lab, you will learn how to deploy your web applications so they are accessible to the entire team.
    - You will deploy a Claude-built app to Vercel (free static hosting) in under 5 minutes.
    - You will explore other hosting options: Netlify, Railway, and self-hosting on Elcon's server.
    - By the end of this lab, your application will be live with a real URL.

## Prerequisites

- GitHub account (from Lab 001)
- Vercel account (from Lab 001)
- A working app from Lab 003 or 004

## What You Will Learn

- What "deployment" means and why you need it
- Pushing code to GitHub
- Deploying to Vercel with automatic updates
- Self-hosting options for Elcon's server
- Domain names, HTTPS, and basic network concepts

---

## Background

### From File to URL

Right now your app is an HTML file on your laptop. To make it available to your team:

```
Your Laptop → GitHub (code storage) → Vercel (hosting) → https://your-app.vercel.app
```

### Hosting Options Compared

| Option           | Cost   | Difficulty | Best For                           |
| ---------------- | ------ | ---------- | ---------------------------------- |
| **Vercel**       | Free   | Easy       | Static sites, simple apps          |
| **Netlify**      | Free   | Easy       | Same as Vercel, alternative        |
| **Railway**      | ~$5/mo | Medium     | Apps with backend/server           |
| **Render**       | Free   | Medium     | Backend services, databases        |
| **Elcon Server** | Free   | Hard       | Full control, internal-only access |
| **Coolify**      | Free   | Medium     | Self-hosted deployment platform    |

---

## Lab Steps

### Step 1 – Create a GitHub Repository

1. Go to [github.com](https://github.com) and click **New Repository**
2. Name: `elcon-import-management`
3. Visibility: **Private** (for internal business tools)
4. Check **Add a README file**
5. Click **Create repository**

### Step 2 – Upload Your App to GitHub

**Option A – Web Upload (easiest):**

1. In your repository, click **Add file** → **Upload files**
2. Drag your `index.html` file (rename your app to `index.html`)
3. Click **Commit changes**

**Option B – Via Cursor/Terminal (recommended for future use):**

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/elcon-import-management.git
cd elcon-import-management

# Copy your HTML file as index.html
cp ~/path/to/your/import-management.html index.html

# Commit and push
git add .
git commit -m "Add import management app"
git push
```

### Step 3 – Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New** → **Project**
3. Select your `elcon-import-management` repository
4. Framework Preset: **Other**
5. Click **Deploy**
6. Wait ~30 seconds – your app is live! 🎉

!!! success "Your App is Live"

    Vercel gives you a URL like `https://elcon-import-management.vercel.app`

    Share this URL with your team – they can access the app from any device.

### Step 4 – Automatic Deployments

The magic of Vercel + GitHub: every time you push code to GitHub, Vercel automatically redeploys.

1. Go back to your GitHub repo
2. Edit `index.html` and change the page title
3. Commit the change
4. Go to your Vercel URL – the change is live within seconds

### Step 5 – Understanding Self-Hosting

For Elcon's long-term architecture, you may want to host everything on your own server. Here's the conceptual overview:

```
┌──────────────────────────────────────┐
│          Elcon Server                │
│                                      │
│  ┌─────────┐     ┌───────────────┐  │
│  │  Nginx   │────│  Your Apps    │  │
│  │ (reverse │    │  (HTML/JS)    │  │
│  │  proxy)  │    └───────────────┘  │
│  └─────────┘                        │
│       │          ┌───────────────┐  │
│       │          │  Supabase     │  │
│       └─────────│  (self-hosted)│  │
│                  └───────────────┘  │
│                                      │
│                  ┌───────────────┐  │
│                  │     n8n       │  │
│                  │  (self-hosted)│  │
│                  └───────────────┘  │
└──────────────────────────────────────┘
```

!!! info "Self-Hosting with Coolify"

    [Coolify](https://coolify.io) is an open-source platform that makes self-hosting as easy as Vercel.
    It can deploy apps, databases, and services with a visual UI. We'll revisit this in Lab 011.

---

## Summary

In this lab you:

- [x] Created a GitHub repository for your app
- [x] Uploaded code to GitHub
- [x] Deployed to Vercel and got a live URL
- [x] Understood automatic deployments
- [x] Explored self-hosting options for Elcon's server

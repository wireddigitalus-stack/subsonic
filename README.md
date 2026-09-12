# Subsonic Society 🎯⛰️

> **Precision Rimfire Media & Appalachian Mountain Pro Competition Platform**  
> Nestled in the high ridgelines of Bristol, Tennessee (3,420 FT Elevation).

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-iOS_Dark_18-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL_Ready-3ecf8e?style=flat-square&logo=supabase)](https://supabase.com/)
[![Vercel Ready](https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com/)

---

## ⚡ Overview & Features

- **iOS 18 High-End Dark Aesthetic**: Obsidian/graphite backgrounds, tactical amber accents, frosted glass (`backdrop-blur-xl`), floating mobile bottom dock, and dynamic island notifications.
- **Bristol TN Mountain Shootout Hub**: Dedicated coverage of the 18-stage, 465-yard Appalachian Mountain Rimfire Pro Invitational.
- **Facebook Live Feed Integration**: Synchronized cards and live embed connecting directly with the official [Subsonic Society Facebook Page](https://www.facebook.com/p/Subsonic-Society-61578052196057/).
- **Precision Rimfire Media & Athlete Center**: Spotlights top shooters (Vudoo V-22, RimX, Bartlein barrels, Tangent Theta glass) and the official minted Subsonic Society Challenge Coin.
- **Interactive Match Calendar**: Comprehensive schedule, stage diagrams, round counts, squad registration, and instant Apple/Google Calendar (`.ics`) export.
- **Competitor & Public Chat with AI Moderation**: Multi-channel communications (`#bristol-pro-shootout`, `#general-society`, `#ballistics-and-gear`, `#match-day-alerts`) monitored by real-time NLP AI shield that blocks illegal transactions and flags unsportsmanlike hostility into the admin review queue.
- **Admin Telemetry & Engagement Dashboard (`/admin`)**:
  - Full clickstream tracking logging every click, target element, text, and category.
  - Page dwell time and session duration analytics.
  - Device split (iOS Mobile vs Android vs Desktop).
  - AI moderation moderation queue with one-click approval and review.
  - Competition squad manager.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Access Admin Dashboard
Navigate to [http://localhost:3000/admin](http://localhost:3000/admin).
- Passkey: `subsonic2026` (or click **Demo One-Click Access**).

---

## 🗄️ Supabase Setup (Optional Cloud Mode)

The site includes an automatic offline/local storage fallback so telemetry and chat function immediately out of the box. To connect your live Supabase cloud database:

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard and run the script located at:
   ```
   supabase/schema.sql
   ```
3. Copy your project credentials into `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

---

## 🌐 Deploy to Vercel

1. Push this repository to GitHub or GitLab:
   ```bash
   git add .
   git commit -m "Initial release of Subsonic Society platform"
   git remote add origin <your-git-repo-url>
   git push -u origin main
   ```
2. Import the repository into [Vercel](https://vercel.com).
3. If using Supabase, add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as environment variables.
4. Deploy!

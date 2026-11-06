# ANSHUL STUDENT ERP — Academic Command Center

A modular, production-grade personal Student ERP web application and Academic Command Center built with a clean separation of concerns into **Frontend**, **Backend**, **Database**, and **API**.

---

## 🚀 Production Deployment on Vercel

The web application is located in the `frontend` folder and is fully configured for zero-config production deployment on [Vercel](https://vercel.com).

### Option A: Deploy via Vercel Web Dashboard (Recommended)

1. **Push your repository to GitHub / GitLab / Bitbucket** (or connect your existing repo).
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. In the **Configure Project** screen:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select `frontend` (or leave as root if using monorepo workspace build).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. Expand **Environment Variables** and add:
   - `VITE_SUPABASE_URL`: `https://<your-project-id>.supabase.co` *(plain project URL without `/rest/v1` or trailing slashes)*
   - `VITE_SUPABASE_ANON_KEY`: `<your-supabase-anon-key>` *(public client key — never use `service_role`)*
5. Click **Deploy**. Vercel will build and deploy your application.

### Option B: Deploy via Vercel CLI

```bash
# 1. Install Vercel CLI globally
npm i -g vercel

# 2. Deploy from the frontend directory
cd frontend
vercel

# 3. For production deployment
vercel --prod
```

### ⚡ Single Page Application (SPA) Routing & Deep Links

`frontend/vercel.json` is configured with an SPA rewrite rule to ensure direct navigation, bookmarks, and browser page refreshes work seamlessly on all client routes (`/`, `/timetable`, `/attendance`, `/bunk-calculator`, `/academics`, `/exams`, `/assignments`, `/planner`, `/settings`):

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 🌓 Fully Functioning Dark and Light Mode

The ERP includes a high-contrast theme engine supporting both **Dark Mode** and **Light Mode**:

1. **Design System**:
   - **Dark Mode**: Deep navy/charcoal background (`#0b0f19`), glass-effect slate cards (`#111827`), electric blue (`#2563eb`), violet (`#7c3aed`), and emerald (`#10b981`) accents.
   - **Light Mode**: Clean slate-50 canvas (`#f8fafc`), crisp white elevated cards (`#ffffff`), soft slate borders (`#e2e8f0`), high-contrast slate-900 typography, and vibrant status badges.
2. **One-Click Theme Toggle**:
   - Accessible at all times via the **Sun/Moon icon button** in the top navigation bar.
   - Also available in **System Settings** (`/settings`) under *Theme Appearance*.
3. **Smart Persistence & Auto-Detection**:
   - Persists user selection in `localStorage` under `anshul_erp_theme`.
   - Automatically detects OS/system preference (`prefers-color-scheme: light`) if no preference is explicitly stored.
   - Dynamically updates `<meta name="theme-color">` to match mobile browser address bars (`#0b0f19` in dark mode, `#f8fafc` in light mode).

---

## 📱 Mobile PWA & Home Screen Installation

The app includes a Progressive Web App (PWA) manifest and high-resolution mobile icons:

- **Android (Chrome)**:
  1. Open the deployed website in Chrome.
  2. Tap the three dots menu (⋮) -> **Install App** or **Add to Home screen**.
  3. The app opens full-screen in standalone mode with its own app icon and splash screen.
- **iOS (Safari)**:
  1. Open the website in Safari.
  2. Tap the **Share** button (box with upward arrow) -> **Add to Home Screen**.
  3. Tap **Add**. The app installs with Apple Touch Icon support (`apple-mobile-web-app-capable: yes`).

PWA Assets in `frontend/public/`:
- `manifest.json`: Web app metadata, standalone display mode, orientation, and color themes.
- `favicon.svg`: Vector shield and graduation cap logo.
- `pwa-192x192.png`: Android standard launcher icon.
- `pwa-512x512.png`: High-DPI Android icon and splash screen icon (also maskable).
- `apple-touch-icon.png`: 180x180 iOS home screen icon.

---

## 🔐 Environment Variables & Security

Sensitive credentials must **never** be committed to Git:
- `.env` is ignored in `.gitignore`.
- Use `.env.example` as a template:

```env
# Plain Supabase project URL (no /rest/v1 or trailing slashes)
VITE_SUPABASE_URL=https://your-project.supabase.co

# Public anonymous key only — safe for client-side applications
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

> [!IMPORTANT]
> **Never** expose or use the Supabase `service_role` key in the frontend. All database operations are secured using PostgreSQL Row Level Security (RLS) policies scoped to the authenticated student (`auth.uid() = user_id`).

---

## 🧪 Testing & Verification

Run the test suite:
```bash
# Run Vitest test suites (17 tests covering attendance math, safe bunks, exam countdowns, timetable resolution)
npm test

# Verify production build cleanly
npm run build
```

---

## 🏛️ Project Structure

```
anshul-student-erp/
├── frontend/                 # Client Web Application (React 19 + TypeScript + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/       # Reusable UI widgets, Modals, Timetable grids, Navbars
│   │   ├── context/          # Auth, ERP data, Theme, Notifications state providers
│   │   ├── pages/            # Dashboard, Timetable, Attendance, Bunk Calc, Academics, etc.
│   │   ├── services/         # Supabase client, storage compression, local DB engine
│   │   ├── utils/            # Bunk math, Kolkata date/time, Timetable resolver
│   │   └── tests/            # Vitest unit test suites (17 / 17 passing)
│   ├── public/               # PWA Web manifest, icons (192x192, 512x512, SVG, Apple touch icon)
│   ├── vercel.json           # Vercel SPA rewrite configuration
│   ├── tailwind.config.js    # Dark/Light theme, electric blue/violet accents
│   ├── vite.config.ts        # Vite & Vitest configuration
│   └── package.json          # Frontend dependencies
│
├── backend/                  # Optional Server-Side Application (Node.js + Express + TypeScript)
│   ├── src/
│   │   ├── data/             # Grounded Amizone baseline seeds, schedule seeds
│   │   └── server.ts         # Express server with CORS & Asia/Kolkata timezone grounding
│   └── package.json
│
├── database/                 # Relational Database Models & Migrations (PostgreSQL / Supabase)
│   ├── schema.sql            # Complete all-in-one SQL schema
│   ├── migrations/           # Versioned migrations (001_initial_schema, 002_rls, 003_storage)
│   └── seeds/                # Automatic user signup seed trigger
│
└── package.json              # Monorepo Orchestrator (npm workspaces & scripts)
```

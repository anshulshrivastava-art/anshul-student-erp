# Database Directory — Anshul Student ERP

This directory contains all relational database models, PostgreSQL migrations, Row-Level Security (RLS) policies, and seeding scripts for **Anshul Student ERP**.

---

## 📁 Directory Layout

```
database/
├── schema.sql                 # Complete monolithic schema (easy copy-paste into Supabase SQL editor)
├── migrations/
│   ├── 001_initial_schema.sql      # Core tables, foreign keys, constraints & enums
│   ├── 002_row_level_security.sql  # RLS enabled on all 11 tables with per-user policies
│   └── 003_storage_policies.sql    # 'profile-photos' storage bucket & folder policies
└── seeds/
    └── 001_seed_trigger.sql        # Automatic PostgreSQL trigger on auth.users for new signups
```

---

## 🗄️ Tables Summary

| Table | Purpose | RLS Policy |
| :--- | :--- | :--- |
| `profiles` | Student identity (Anshul Shrivastava, B.Tech IT, III A, Group) | `auth.uid() = id` |
| `user_settings` | Attendance threshold, theme, session settings | `auth.uid() = user_id` |
| `subjects` | 16 courses with Amity faculty & 6 Nov 2026 baselines | `auth.uid() = user_id` |
| `timetable_entries` | Monday–Friday recurring classes with 2-hr lab blocks | `auth.uid() = user_id` |
| `day_overrides` | Working Saturdays (following weekdays), holidays, custom days | `auth.uid() = user_id` |
| `attendance_records` | Individual dated logs on top of Section 8 baselines | `auth.uid() = user_id` |
| `semester_results` | Semester 1 (7.33), Semester 2 (6.25, 1 back), Official CGPA 6.81 | `auth.uid() = user_id` |
| `exams` | Countdown target: 08 Dec 2026, syllabus progress | `auth.uid() = user_id` |
| `assignments` | Deadlines, attachments, priorities, statuses | `auth.uid() = user_id` |
| `study_tasks` | Focused study blocks scheduled around free slots | `auth.uid() = user_id` |
| `notifications` | Exam countdown, attendance alerts, class reminders | `auth.uid() = user_id` |

---

## 🚀 How to Apply to Supabase

1. Open your project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor**.
3. Either paste the entire `database/schema.sql`, or apply migrations sequentially from `database/migrations/` followed by `database/seeds/001_seed_trigger.sql`.
4. Click **Run**.

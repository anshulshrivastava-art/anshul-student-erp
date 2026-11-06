-- ==============================================================================
-- 001_INITIAL_SCHEMA.SQL — CORE DATABASE TABLES & ENUMS
-- ==============================================================================

create extension if not exists "uuid-ossp";

-- Enums
do $$ begin
  create type attendance_status_enum as enum ('Present', 'Absent', 'Not Marked');
exception when duplicate_object then null; end $$;

do $$ begin
  create type day_override_type_enum as enum ('working_follows_day', 'custom', 'holiday');
exception when duplicate_object then null; end $$;

-- 1. Profiles Table
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text not null,
  email text not null,
  university text default 'Amity University Gwalior',
  degree text default 'B.Tech',
  branch text default 'B.Tech (IT)',
  semester integer default 3,
  section text default 'A',
  student_id text default 'ASET-IT-2026-031',
  selected_group integer default 1 check (selected_group in (1, 2)),
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. User Settings Table
create table if not exists public.user_settings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  attendance_threshold numeric default 0.75,
  theme text default 'dark' check (theme in ('dark', 'light', 'system')),
  keep_signed_in boolean default true,
  email_notifications boolean default false,
  browser_notifications boolean default false,
  remind_upcoming_classes boolean default true,
  remind_assignment_deadlines boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint unique_user_settings unique (user_id)
);

-- 3. Subjects Table
create table if not exists public.subjects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  short_name text not null,
  code text not null,
  amizone_code text,
  faculty_name text not null,
  faculty_initials text,
  default_room text,
  opening_present integer not null default 0,
  opening_total integer not null default 0,
  is_lab boolean default false,
  credit_weight integer default 3,
  notes text,
  created_at timestamptz default now()
);

-- 4. Timetable Entries Table
create table if not exists public.timetable_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  subject_id uuid references public.subjects(id) on delete cascade,
  day_of_week integer not null check (day_of_week between 1 and 7),
  start_time text not null, -- HH:mm (e.g. '09:15')
  end_time text not null,   -- HH:mm (e.g. '10:10')
  room text default '',
  group_target text default 'all' check (group_target in ('all', '1', '2')),
  is_lab boolean default false,
  is_break boolean default false,
  specific_date date,
  custom_label text,
  created_at timestamptz default now()
);

-- 5. Day Overrides Table
create table if not exists public.day_overrides (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  type text not null check (type in ('working_follows_day', 'custom', 'holiday')),
  follows_weekday integer check (follows_weekday between 1 and 5),
  note text,
  created_at timestamptz default now(),
  constraint unique_user_date_override unique (user_id, date)
);

-- 6. Attendance Records Table
create table if not exists public.attendance_records (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  subject_id uuid references public.subjects(id) on delete cascade not null,
  date date not null,
  slot_start text not null, -- HH:mm
  status text not null check (status in ('Present', 'Absent', 'Not Marked')),
  note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint unique_attendance_record unique (user_id, subject_id, date, slot_start)
);

-- 7. Semester Results Table
create table if not exists public.semester_results (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  semester_number integer not null,
  sgpa numeric(4, 2) not null,
  credits integer default 24,
  back_papers integer default 0,
  final_result text,
  is_official boolean default true,
  cgpa_override numeric(4, 2),
  notes text,
  created_at timestamptz default now(),
  constraint unique_user_semester unique (user_id, semester_number)
);

-- 8. Examinations Table
create table if not exists public.exams (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  subject_id uuid references public.subjects(id) on delete cascade,
  exam_name text not null,
  exam_date date not null,
  start_time text default '10:00',
  end_time text default '13:00',
  room text default 'Examination Hall',
  preparation_status text default 'Not Started' check (preparation_status in ('Not Started', 'In Progress', 'Prepared', 'Mastered')),
  syllabus_covered_pct integer default 0,
  notes text,
  created_at timestamptz default now()
);

-- 9. Assignments Table
create table if not exists public.assignments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  subject_id uuid references public.subjects(id) on delete cascade,
  title text not null,
  description text,
  assigned_date date default current_date,
  due_date date not null,
  status text default 'Not Started' check (status in ('Not Started', 'In Progress', 'Completed')),
  priority text default 'Medium' check (priority in ('Low', 'Medium', 'High', 'Urgent')),
  attachment_url text,
  created_at timestamptz default now()
);

-- 10. Study Tasks Table
create table if not exists public.study_tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  subject_id uuid references public.subjects(id) on delete set null,
  title text not null,
  target_date date not null,
  duration_minutes integer default 60,
  priority text default 'Medium' check (priority in ('Low', 'Medium', 'High', 'Urgent')),
  is_completed boolean default false,
  notes text,
  created_at timestamptz default now()
);

-- 11. Notifications Table
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  message text not null,
  type text default 'system' check (type in ('class', 'exam', 'assignment', 'attendance', 'study', 'system')),
  is_read boolean default false,
  created_at timestamptz default now()
);

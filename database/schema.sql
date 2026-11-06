-- ==============================================================================
-- ANSHUL STUDENT ERP — SUPABASE DATABASE SCHEMA & RLS & SEED TRIGGER
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. ENUMS & DOMAINS
do $$ begin
  create type attendance_status_enum as enum ('Present', 'Absent', 'Not Marked');
exception when duplicate_object then null; end $$;

do $$ begin
  create type day_override_type_enum as enum ('working_follows_day', 'custom', 'holiday');
exception when duplicate_object then null; end $$;

-- 3. PROFILES TABLE
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

-- 4. USER SETTINGS TABLE
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

-- 5. SUBJECTS TABLE
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

-- 6. TIMETABLE ENTRIES TABLE
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

-- 7. DAY OVERRIDES TABLE (Working Saturdays, Holidays, Swapped Days)
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

-- 8. ATTENDANCE RECORDS TABLE
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

-- 9. SEMESTER RESULTS TABLE
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

-- 10. EXAMINATIONS TABLE
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

-- 11. ASSIGNMENTS TABLE
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

-- 12. STUDY TASKS TABLE
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

-- 13. NOTIFICATIONS TABLE
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  message text not null,
  type text default 'system' check (type in ('class', 'exam', 'assignment', 'attendance', 'study', 'system')),
  is_read boolean default false,
  created_at timestamptz default now()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.subjects enable row level security;
alter table public.timetable_entries enable row level security;
alter table public.day_overrides enable row level security;
alter table public.attendance_records enable row level security;
alter table public.semester_results enable row level security;
alter table public.exams enable row level security;
alter table public.assignments enable row level security;
alter table public.study_tasks enable row level security;
alter table public.notifications enable row level security;

-- Profiles: user owns row where id = auth.uid()
create policy "Users can read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Macro for standard user_id tables
create policy "Users can read own settings" on public.user_settings for select using (auth.uid() = user_id);
create policy "Users can manage own settings" on public.user_settings for all using (auth.uid() = user_id);

create policy "Users can manage own subjects" on public.subjects for all using (auth.uid() = user_id);
create policy "Users can manage own timetable" on public.timetable_entries for all using (auth.uid() = user_id);
create policy "Users can manage own day overrides" on public.day_overrides for all using (auth.uid() = user_id);
create policy "Users can manage own attendance" on public.attendance_records for all using (auth.uid() = user_id);
create policy "Users can manage own semester results" on public.semester_results for all using (auth.uid() = user_id);
create policy "Users can manage own exams" on public.exams for all using (auth.uid() = user_id);
create policy "Users can manage own assignments" on public.assignments for all using (auth.uid() = user_id);
create policy "Users can manage own study tasks" on public.study_tasks for all using (auth.uid() = user_id);
create policy "Users can manage own notifications" on public.notifications for all using (auth.uid() = user_id);

-- ==============================================================================
-- STORAGE BUCKET FOR PROFILE PHOTOS
-- ==============================================================================
insert into storage.buckets (id, name, public) 
values ('profile-photos', 'profile-photos', true)
on conflict (id) do nothing;

create policy "Authenticated users can upload avatar to own folder"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'profile-photos' and
  (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Authenticated users can update avatar in own folder"
on storage.objects for update to authenticated
using (
  bucket_id = 'profile-photos' and
  (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Anyone can read avatars"
on storage.objects for select
using (bucket_id = 'profile-photos');

-- ==============================================================================
-- AUTOMATIC SEED TRIGGER ON NEW USER REGISTRATION
-- ==============================================================================
create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_user_id uuid;
  v_mat301_id uuid;
  v_bsu343_id uuid;
  v_bcu341_id uuid;
  v_cse202_id uuid;
  v_cse222_id uuid;
  v_cse304_id uuid;
  v_cse324_id uuid;
  v_ece306_id uuid;
  v_ece326_id uuid;
  v_flu344_id uuid;
  v_med001_id uuid;
  v_cse302_id uuid;
  v_cse322_id uuid;
  v_csespec_id uuid;
  v_mllab_id uuid;
  v_lib_id uuid;
begin
  v_user_id := new.id;

  -- 1. Create Profile
  insert into public.profiles (
    id, full_name, email, university, degree, branch, semester, section, student_id, selected_group
  ) values (
    v_user_id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Anshul Shrivastava'),
    new.email,
    'Amity University Gwalior',
    'B.Tech',
    coalesce(new.raw_user_meta_data->>'branch', 'B.Tech (IT)'),
    coalesce((new.raw_user_meta_data->>'semester')::integer, 3),
    coalesce(new.raw_user_meta_data->>'section', 'A'),
    coalesce(new.raw_user_meta_data->>'student_id', 'ASET-IT-2026-031'),
    coalesce((new.raw_user_meta_data->>'selected_group')::integer, 1)
  );

  -- 2. Create User Settings
  insert into public.user_settings (user_id, attendance_threshold, theme, keep_signed_in)
  values (v_user_id, 0.75, 'dark', true);

  -- 3. Seed Subjects & Section 8 Baselines (Opening Present / Total)
  insert into public.subjects (user_id, name, short_name, code, amizone_code, faculty_name, faculty_initials, default_room, opening_present, opening_total, is_lab, credit_weight)
  values (v_user_id, 'Applied Mathematics III', 'AM-III', 'MAT 301', 'MAT 301 (Probability, Statistics and Numerical Methods)', 'Dr. Ram Kumar', 'RMK', 'E-404', 38, 41, false, 4)
  returning id into v_mat301_id;

  insert into public.subjects (user_id, name, short_name, code, amizone_code, faculty_name, faculty_initials, default_room, opening_present, opening_total, is_lab, credit_weight)
  values (v_user_id, 'Behavioural Science III', 'BS-III', 'BSU 343', 'BSU 343 (Problem Solving & Creative Thinking)', 'Dr. Rituparna Das', 'RPD', 'E-404', 12, 13, false, 1)
  returning id into v_bsu343_id;

  insert into public.subjects (user_id, name, short_name, code, amizone_code, faculty_name, faculty_initials, default_room, opening_present, opening_total, is_lab, credit_weight)
  values (v_user_id, 'Communication Skills III', 'CS-III', 'BCU 341', 'BCU 341', 'Ms. Manu Chandel', 'MND', 'E-404', 23, 25, false, 1)
  returning id into v_bcu341_id;

  insert into public.subjects (user_id, name, short_name, code, amizone_code, faculty_name, faculty_initials, default_room, opening_present, opening_total, is_lab, credit_weight)
  values (v_user_id, 'Data Structures Through C++', 'DSC++', 'CSE 202', 'CSE 202', 'Dr. Samta Jain Goyal', 'STA', 'E-404', 34, 37, false, 4)
  returning id into v_cse202_id;

  insert into public.subjects (user_id, name, short_name, code, amizone_code, faculty_name, faculty_initials, default_room, opening_present, opening_total, is_lab, credit_weight)
  values (v_user_id, 'DSC++ LAB', 'DSC++ LAB', 'CSE 222', 'CSE 222', 'Ms. Sweta Singh', 'SWS', 'E-204', 26, 26, true, 1)
  returning id into v_cse222_id;

  insert into public.subjects (user_id, name, short_name, code, amizone_code, faculty_name, faculty_initials, default_room, opening_present, opening_total, is_lab, credit_weight)
  values (v_user_id, 'Database Management Systems', 'DBMS', 'CSE 304', 'CSE 304', 'Mr. Praveen Gupta', 'PRG', 'E-404', 36, 39, false, 4)
  returning id into v_cse304_id;

  insert into public.subjects (user_id, name, short_name, code, amizone_code, faculty_name, faculty_initials, default_room, opening_present, opening_total, is_lab, credit_weight)
  values (v_user_id, 'DBMS LAB', 'DBMS LAB', 'CSE 324', 'CSE 324', 'Jeetendra Singh Bhador', 'JTS', 'E-205', 24, 28, true, 1)
  returning id into v_cse324_id;

  insert into public.subjects (user_id, name, short_name, code, amizone_code, faculty_name, faculty_initials, default_room, opening_present, opening_total, is_lab, credit_weight)
  values (v_user_id, 'Digital Electronics and Logic Design', 'DELD', 'ECE 306', 'ECE 306', 'Dr. Rinkoo Bhatia', 'RNK', 'E-404', 35, 40, false, 3)
  returning id into v_ece306_id;

  insert into public.subjects (user_id, name, short_name, code, amizone_code, faculty_name, faculty_initials, default_room, opening_present, opening_total, is_lab, credit_weight)
  values (v_user_id, 'DELD LAB', 'DELD LAB', 'ECE 326', 'ECE 326', 'Dr. Rinkoo Bhatia', 'RNK', 'E-315', 28, 28, true, 1)
  returning id into v_ece326_id;

  insert into public.subjects (user_id, name, short_name, code, amizone_code, faculty_name, faculty_initials, default_room, opening_present, opening_total, is_lab, credit_weight)
  values (v_user_id, 'French III', 'FL-III', 'FLU 344', 'FLU 344', 'Dr. Suketu Revar', 'SKR', 'E-404', 11, 12, false, 2)
  returning id into v_flu344_id;

  insert into public.subjects (user_id, name, short_name, code, amizone_code, faculty_name, faculty_initials, default_room, opening_present, opening_total, is_lab, credit_weight)
  values (v_user_id, 'Meditation / Yoga', 'MED/YOGA', 'MED001', 'MED003 (Amizone code)', 'Mr. Malkhan Singh', 'MKS', 'D-205', 11, 12, false, 1)
  returning id into v_med001_id;

  insert into public.subjects (user_id, name, short_name, code, amizone_code, faculty_name, faculty_initials, default_room, opening_present, opening_total, is_lab, credit_weight)
  values (v_user_id, 'Python Programming', 'PP', 'CSE 302', 'CSE 302', 'Dr. Ghanshyam P. Dube', 'GNS', 'E-404', 35, 39, false, 4)
  returning id into v_cse302_id;

  insert into public.subjects (user_id, name, short_name, code, amizone_code, faculty_name, faculty_initials, default_room, opening_present, opening_total, is_lab, credit_weight)
  values (v_user_id, 'Python Programming LAB', 'PP LAB', 'CSE 322', 'CSE 322', 'Mr. Sudhanshu Gaurav', 'SDG', 'E-213', 24, 26, true, 1)
  returning id into v_cse322_id;

  insert into public.subjects (user_id, name, short_name, code, amizone_code, faculty_name, faculty_initials, default_room, opening_present, opening_total, is_lab, credit_weight, notes)
  values (v_user_id, 'CSE Specialization (AI/ML)', 'CSE Spec (ML)', 'CSE-SPEC', 'Specialization: Machine Learning Techniques', 'Dr. Deepak Motwani', 'DPM', '', 35, 39, false, 4, 'Friday room 102; others editable')
  returning id into v_csespec_id;

  insert into public.subjects (user_id, name, short_name, code, amizone_code, faculty_name, faculty_initials, default_room, opening_present, opening_total, is_lab, credit_weight, notes)
  values (v_user_id, 'CSE Specialization Lab (AI/ML)', 'ML Lab', 'CSE-SPEC-LAB', 'Machine Learning Lab', 'Dr. Deepak Motwani', 'DPM', '', 26, 28, true, 1, 'Separate subject for ML Lab attendance')
  returning id into v_mllab_id;

  insert into public.subjects (user_id, name, short_name, code, amizone_code, faculty_name, faculty_initials, default_room, opening_present, opening_total, is_lab, credit_weight)
  values (v_user_id, 'Library / CCA', 'LIB/CCA', 'LIB001', '', 'Non-Academic', 'LIB', 'Library', 0, 0, false, 0)
  returning id into v_lib_id;

  -- 4. Seed Semester Results (Official CGPA: 6.81)
  insert into public.semester_results (user_id, semester_number, sgpa, credits, back_papers, final_result, is_official, notes)
  values (v_user_id, 1, 7.33, 24, 0, 'Pass', true, 'Semester 1 Odd 2025-26');

  insert into public.semester_results (user_id, semester_number, sgpa, credits, back_papers, final_result, is_official, cgpa_override, notes)
  values (v_user_id, 2, 6.25, 24, 1, 'Promoted with Academic Probation', true, 6.81, 'Amizone Official CGPA: 6.81 recorded against Semester 2');

  -- 5. Seed Exam Target (8 Dec 2026)
  insert into public.exams (user_id, subject_id, exam_name, exam_date, start_time, end_time, room, preparation_status, syllabus_covered_pct, notes)
  values (v_user_id, v_mat301_id, 'End Term Semester Examinations', '2026-12-08', '10:00', '13:00', 'ASET Examination Hall', 'In Progress', 40, 'Official countdown target date: 08 Dec 2026');

  -- 6. Seed Timetable (Monday through Friday)
  -- MONDAY
  insert into public.timetable_entries (user_id, subject_id, day_of_week, start_time, end_time, room, group_target, is_lab)
  values
    (v_user_id, v_ece306_id, 1, '09:15', '10:10', 'E-404', 'all', false),
    (v_user_id, v_cse302_id, 1, '10:15', '11:10', 'E-404', 'all', false),
    (v_user_id, v_cse202_id, 1, '11:15', '12:10', 'E-404', 'all', false),
    (v_user_id, v_mat301_id, 1, '12:15', '13:10', 'E-404', 'all', false),
    (v_user_id, null,         1, '13:15', '14:10', 'Cafeteria', 'all', false), -- Lunch Break
    (v_user_id, v_csespec_id, 1, '14:15', '15:10', '', 'all', false),
    (v_user_id, v_ece326_id, 1, '15:15', '17:10', 'E-315', '1', true),   -- G1 Lab (2 hr)
    (v_user_id, v_cse322_id, 1, '15:15', '17:10', 'E-215', '2', true);   -- G2 Lab (2 hr)

  -- TUESDAY
  insert into public.timetable_entries (user_id, subject_id, day_of_week, start_time, end_time, room, group_target, is_lab)
  values
    (v_user_id, v_csespec_id, 2, '09:15', '10:10', '', 'all', false),
    (v_user_id, v_cse324_id, 2, '10:15', '12:10', 'E-205', '1', true),   -- G1 DBMS Lab
    (v_user_id, v_lib_id,    2, '10:15', '12:10', 'Library', '2', false), -- G2 Library
    (v_user_id, v_med001_id, 2, '12:15', '13:10', 'D-205', 'all', false),
    (v_user_id, null,         2, '13:15', '14:10', 'Cafeteria', 'all', false), -- Lunch Break
    (v_user_id, v_ece306_id, 2, '14:15', '15:10', 'E-404', 'all', false),
    (v_user_id, v_cse222_id, 2, '15:15', '17:10', 'E-204', '1', true),   -- G1 DSC++ Lab
    (v_user_id, v_cse324_id, 2, '15:15', '17:10', 'E-205', '2', true);   -- G2 DBMS Lab

  -- WEDNESDAY
  insert into public.timetable_entries (user_id, subject_id, day_of_week, start_time, end_time, room, group_target, is_lab)
  values
    (v_user_id, v_cse322_id, 3, '09:15', '11:10', 'E-213', '1', true),   -- G1 Python Lab
    (v_user_id, v_ece326_id, 3, '09:15', '11:10', 'E-315', '2', true),   -- G2 DELD Lab
    (v_user_id, v_cse202_id, 3, '11:15', '12:10', 'E-404', 'all', false),
    (v_user_id, v_cse304_id, 3, '12:15', '13:10', 'E-404', 'all', false),
    (v_user_id, null,         3, '13:15', '14:10', 'Cafeteria', 'all', false), -- Lunch Break
    (v_user_id, v_bsu343_id, 3, '14:15', '15:10', 'E-404', 'all', false),
    (v_user_id, v_mat301_id, 3, '15:15', '16:10', 'E-404', 'all', false),
    (v_user_id, v_cse302_id, 3, '16:15', '17:10', 'E-404', 'all', false);

  -- THURSDAY
  insert into public.timetable_entries (user_id, subject_id, day_of_week, start_time, end_time, room, group_target, is_lab)
  values
    (v_user_id, v_csespec_id, 4, '09:15', '10:10', '', 'all', false),
    (v_user_id, v_csespec_id, 4, '10:15', '11:10', '', 'all', false),
    (v_user_id, v_cse304_id, 4, '11:15', '12:10', 'E-404', 'all', false),
    (v_user_id, v_ece306_id, 4, '12:15', '13:10', 'E-404', 'all', false),
    (v_user_id, null,         4, '13:15', '14:10', 'Cafeteria', 'all', false), -- Lunch Break
    (v_user_id, v_mat301_id, 4, '14:15', '15:10', 'E-404', 'all', false),
    (v_user_id, v_cse302_id, 4, '15:15', '16:10', 'E-404', 'all', false),
    (v_user_id, v_bcu341_id, 4, '16:15', '17:10', 'E-404', 'all', false);

  -- FRIDAY
  insert into public.timetable_entries (user_id, subject_id, day_of_week, start_time, end_time, room, group_target, is_lab)
  values
    (v_user_id, v_cse202_id, 5, '09:15', '10:10', 'E-404', 'all', false),
    (v_user_id, v_flu344_id, 5, '10:15', '11:10', 'E-404', 'all', false),
    (v_user_id, v_lib_id,    5, '11:15', '13:10', 'Library', '1', false), -- G1 Library (2 hr)
    (v_user_id, v_cse222_id, 5, '11:15', '13:10', 'E-204', '2', true),   -- G2 DSC++ Lab (2 hr)
    (v_user_id, null,         5, '13:15', '14:10', 'Cafeteria', 'all', false), -- Lunch Break
    (v_user_id, v_csespec_id, 5, '14:15', '15:10', '102', 'all', false),  -- Friday CSE Spec in 102
    (v_user_id, v_bcu341_id, 5, '15:15', '16:10', 'E-404', 'all', false),
    (v_user_id, v_cse304_id, 5, '16:15', '17:10', 'E-404', 'all', false);

  -- Mark breaks with custom_label
  update public.timetable_entries
  set is_break = true, custom_label = 'LUNCH BREAK'
  where user_id = v_user_id and start_time = '13:15';

  return new;
end;
$$ language plpgsql security definer;

-- Trigger binding
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

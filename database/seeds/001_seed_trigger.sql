-- ==============================================================================
-- 001_SEED_TRIGGER.SQL — AUTOMATIC SEED TRIGGER ON AUTH.USERS
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
    (v_user_id, null,         1, '13:15', '14:10', 'Cafeteria', 'all', false),
    (v_user_id, v_csespec_id, 1, '14:15', '15:10', '', 'all', false),
    (v_user_id, v_ece326_id, 1, '15:15', '17:10', 'E-315', '1', true),
    (v_user_id, v_cse322_id, 1, '15:15', '17:10', 'E-215', '2', true);

  -- TUESDAY
  insert into public.timetable_entries (user_id, subject_id, day_of_week, start_time, end_time, room, group_target, is_lab)
  values
    (v_user_id, v_csespec_id, 2, '09:15', '10:10', '', 'all', false),
    (v_user_id, v_cse324_id, 2, '10:15', '12:10', 'E-205', '1', true),
    (v_user_id, v_lib_id,    2, '10:15', '12:10', 'Library', '2', false),
    (v_user_id, v_med001_id, 2, '12:15', '13:10', 'D-205', 'all', false),
    (v_user_id, null,         2, '13:15', '14:10', 'Cafeteria', 'all', false),
    (v_user_id, v_ece306_id, 2, '14:15', '15:10', 'E-404', 'all', false),
    (v_user_id, v_cse222_id, 2, '15:15', '17:10', 'E-204', '1', true),
    (v_user_id, v_cse324_id, 2, '15:15', '17:10', 'E-205', '2', true);

  -- WEDNESDAY
  insert into public.timetable_entries (user_id, subject_id, day_of_week, start_time, end_time, room, group_target, is_lab)
  values
    (v_user_id, v_cse322_id, 3, '09:15', '11:10', 'E-213', '1', true),
    (v_user_id, v_ece326_id, 3, '09:15', '11:10', 'E-315', '2', true),
    (v_user_id, v_cse202_id, 3, '11:15', '12:10', 'E-404', 'all', false),
    (v_user_id, v_cse304_id, 3, '12:15', '13:10', 'E-404', 'all', false),
    (v_user_id, null,         3, '13:15', '14:10', 'Cafeteria', 'all', false),
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
    (v_user_id, null,         4, '13:15', '14:10', 'Cafeteria', 'all', false),
    (v_user_id, v_mat301_id, 4, '14:15', '15:10', 'E-404', 'all', false),
    (v_user_id, v_cse302_id, 4, '15:15', '16:10', 'E-404', 'all', false),
    (v_user_id, v_bcu341_id, 4, '16:15', '17:10', 'E-404', 'all', false);

  -- FRIDAY
  insert into public.timetable_entries (user_id, subject_id, day_of_week, start_time, end_time, room, group_target, is_lab)
  values
    (v_user_id, v_cse202_id, 5, '09:15', '10:10', 'E-404', 'all', false),
    (v_user_id, v_flu344_id, 5, '10:15', '11:10', 'E-404', 'all', false),
    (v_user_id, v_lib_id,    5, '11:15', '13:10', 'Library', '1', false),
    (v_user_id, v_cse222_id, 5, '11:15', '13:10', 'E-204', '2', true),
    (v_user_id, null,         5, '13:15', '14:10', 'Cafeteria', 'all', false),
    (v_user_id, v_csespec_id, 5, '14:15', '15:10', '102', 'all', false),
    (v_user_id, v_bcu341_id, 5, '15:15', '16:10', 'E-404', 'all', false),
    (v_user_id, v_cse304_id, 5, '16:15', '17:10', 'E-404', 'all', false);

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

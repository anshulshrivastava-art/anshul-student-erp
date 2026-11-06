import { Subject, TimetableEntry, SemesterResult, StudentProfile } from '../types';

export const ASIA_KOLKATA_TZ = 'Asia/Kolkata';
export const EXAM_COUNTDOWN_TARGET = '2026-12-08T00:00:00+05:30';

export const ATTENDANCE_CUTOFFS = {
  SAFE_MIN: 80.0,
  WARNING_MIN: 75.0,
} as const;

export const DEFAULT_THRESHOLD = 0.75;

export const INITIAL_STUDENT_PROFILE: Omit<StudentProfile, 'id' | 'user_id'> = {
  full_name: 'Anshul Shrivastava',
  email: 'anshul.shrivastava@amity.edu',
  university: 'Amity University Gwalior',
  degree: 'B.Tech',
  branch: 'B.Tech (IT)',
  semester: 3,
  section: 'A',
  student_id: 'ASET-IT-2026-031',
  selected_group: 1,
};

export const INITIAL_SUBJECTS: Omit<Subject, 'id' | 'user_id'>[] = [
  {
    name: 'Applied Mathematics III',
    short_name: 'AM-III',
    code: 'MAT 301',
    amizone_code: 'MAT 301 (Probability, Statistics and Numerical Methods)',
    faculty_name: 'Dr. Ram Kumar',
    faculty_initials: 'RMK',
    default_room: 'E-404',
    opening_present: 38,
    opening_total: 41,
    is_lab: false,
    credit_weight: 4,
  },
  {
    name: 'Behavioural Science III',
    short_name: 'BS-III',
    code: 'BSU 343',
    amizone_code: 'BSU 343 (Problem Solving & Creative Thinking)',
    faculty_name: 'Dr. Rituparna Das',
    faculty_initials: 'RPD',
    default_room: 'E-404',
    opening_present: 12,
    opening_total: 13,
    is_lab: false,
    credit_weight: 1,
  },
  {
    name: 'Communication Skills III',
    short_name: 'CS-III',
    code: 'BCU 341',
    amizone_code: 'BCU 341',
    faculty_name: 'Ms. Manu Chandel',
    faculty_initials: 'MND',
    default_room: 'E-404',
    opening_present: 23,
    opening_total: 25,
    is_lab: false,
    credit_weight: 1,
  },
  {
    name: 'Data Structures Through C++',
    short_name: 'DSC++',
    code: 'CSE 202',
    amizone_code: 'CSE 202',
    faculty_name: 'Dr. Samta Jain Goyal',
    faculty_initials: 'STA',
    default_room: 'E-404',
    opening_present: 34,
    opening_total: 37,
    is_lab: false,
    credit_weight: 4,
  },
  {
    name: 'DSC++ LAB',
    short_name: 'DSC++ LAB',
    code: 'CSE 222',
    amizone_code: 'CSE 222',
    faculty_name: 'Ms. Sweta Singh',
    faculty_initials: 'SWS',
    default_room: 'E-204',
    opening_present: 26,
    opening_total: 26,
    is_lab: true,
    credit_weight: 1,
  },
  {
    name: 'Database Management Systems',
    short_name: 'DBMS',
    code: 'CSE 304',
    amizone_code: 'CSE 304',
    faculty_name: 'Mr. Praveen Gupta',
    faculty_initials: 'PRG',
    default_room: 'E-404',
    opening_present: 36,
    opening_total: 39,
    is_lab: false,
    credit_weight: 4,
  },
  {
    name: 'DBMS LAB',
    short_name: 'DBMS LAB',
    code: 'CSE 324',
    amizone_code: 'CSE 324',
    faculty_name: 'Jeetendra Singh Bhador',
    faculty_initials: 'JTS',
    default_room: 'E-205',
    opening_present: 24,
    opening_total: 28,
    is_lab: true,
    credit_weight: 1,
  },
  {
    name: 'Digital Electronics and Logic Design',
    short_name: 'DELD',
    code: 'ECE 306',
    amizone_code: 'ECE 306',
    faculty_name: 'Dr. Rinkoo Bhatia',
    faculty_initials: 'RNK',
    default_room: 'E-404',
    opening_present: 35,
    opening_total: 40,
    is_lab: false,
    credit_weight: 3,
  },
  {
    name: 'DELD LAB',
    short_name: 'DELD LAB',
    code: 'ECE 326',
    amizone_code: 'ECE 326',
    faculty_name: 'Dr. Rinkoo Bhatia',
    faculty_initials: 'RNK',
    default_room: 'E-315',
    opening_present: 28,
    opening_total: 28,
    is_lab: true,
    credit_weight: 1,
  },
  {
    name: 'French III',
    short_name: 'FL-III',
    code: 'FLU 344',
    amizone_code: 'FLU 344',
    faculty_name: 'Dr. Suketu Revar',
    faculty_initials: 'SKR',
    default_room: 'E-404',
    opening_present: 11,
    opening_total: 12,
    is_lab: false,
    credit_weight: 2,
  },
  {
    name: 'Meditation / Yoga',
    short_name: 'MED/YOGA',
    code: 'MED001',
    amizone_code: 'MED003 (Amizone code)',
    faculty_name: 'Mr. Malkhan Singh',
    faculty_initials: 'MKS',
    default_room: 'D-205',
    opening_present: 11,
    opening_total: 12,
    is_lab: false,
    credit_weight: 1,
  },
  {
    name: 'Python Programming',
    short_name: 'PP',
    code: 'CSE 302',
    amizone_code: 'CSE 302',
    faculty_name: 'Dr. Ghanshyam P. Dube',
    faculty_initials: 'GNS',
    default_room: 'E-404',
    opening_present: 35,
    opening_total: 39,
    is_lab: false,
    credit_weight: 4,
  },
  {
    name: 'Python Programming LAB',
    short_name: 'PP LAB',
    code: 'CSE 322',
    amizone_code: 'CSE 322',
    faculty_name: 'Mr. Sudhanshu Gaurav',
    faculty_initials: 'SDG',
    default_room: 'E-213',
    opening_present: 24,
    opening_total: 26,
    is_lab: true,
    credit_weight: 1,
  },
  {
    name: 'CSE Specialization (AI/ML)',
    short_name: 'CSE Spec (ML)',
    code: 'CSE-SPEC',
    amizone_code: 'Specialization: Machine Learning Techniques',
    faculty_name: 'Dr. Deepak Motwani',
    faculty_initials: 'DPM',
    default_room: '',
    opening_present: 35,
    opening_total: 39,
    is_lab: false,
    credit_weight: 4,
    notes: 'Machine Learning Techniques. Friday room: 102. Other rooms editable.',
  },
  {
    name: 'CSE Specialization Lab (AI/ML)',
    short_name: 'ML Lab',
    code: 'CSE-SPEC-LAB',
    amizone_code: 'Machine Learning Lab',
    faculty_name: 'Dr. Deepak Motwani',
    faculty_initials: 'DPM',
    default_room: '',
    opening_present: 26,
    opening_total: 28,
    is_lab: true,
    credit_weight: 1,
    notes: 'Specialization Lab. Kept as a separate subject with its own attendance record.',
  },
  {
    name: 'Library / CCA',
    short_name: 'LIB/CCA',
    code: 'LIB001',
    amizone_code: '',
    faculty_name: 'Non-Academic',
    faculty_initials: 'LIB',
    default_room: 'Library',
    opening_present: 0,
    opening_total: 0,
    is_lab: false,
    credit_weight: 0,
    notes: 'Non-academic slot. Group 1: Friday 11:15–13:10; Group 2: Tuesday 10:15–12:10.',
  },
];

export const INITIAL_SEMESTERS: Omit<SemesterResult, 'id' | 'user_id'>[] = [
  {
    semester_number: 1,
    sgpa: 7.33,
    credits: 24,
    back_papers: 0,
    final_result: 'Pass',
    is_official: true,
    notes: 'Semester 1 Odd 2025-26',
  },
  {
    semester_number: 2,
    sgpa: 6.25,
    credits: 24,
    back_papers: 1,
    final_result: 'Promoted with Academic Probation',
    is_official: true,
    cgpa_override: 6.81,
    notes: 'Amizone Official CGPA: 6.81 (recorded against Semester 2)',
  },
];

export const OFFICIAL_CGPA = 6.81;

// Standard recurring slot times
export const STANDARD_SLOTS = [
  { start: '09:15', end: '10:10', label: '09:15 AM – 10:10 AM' },
  { start: '10:15', end: '11:10', label: '10:15 AM – 11:10 AM' },
  { start: '11:15', end: '12:10', label: '11:15 AM – 12:10 AM' },
  { start: '12:15', end: '13:10', label: '12:15 PM – 01:10 PM' },
  { start: '13:15', end: '14:10', label: '01:15 PM – 02:10 PM (Lunch Break)', is_break: true },
  { start: '14:15', end: '15:10', label: '02:15 PM – 03:10 PM' },
  { start: '15:15', end: '16:10', label: '03:15 PM – 04:10 PM' },
  { start: '16:15', end: '17:10', label: '04:15 PM – 05:10 PM' },
];

export interface InitialTimetableSeed {
  day_of_week: number;
  subject_code: string;
  start_time: string;
  end_time: string;
  room: string;
  group_target: 'all' | '1' | '2';
  is_lab: boolean;
  is_break?: boolean;
  custom_label?: string;
}

export const TIMETABLE_SEEDS: InitialTimetableSeed[] = [
  // MONDAY (Day 1)
  { day_of_week: 1, subject_code: 'ECE 306', start_time: '09:15', end_time: '10:10', room: 'E-404', group_target: 'all', is_lab: false },
  { day_of_week: 1, subject_code: 'CSE 302', start_time: '10:15', end_time: '11:10', room: 'E-404', group_target: 'all', is_lab: false },
  { day_of_week: 1, subject_code: 'CSE 202', start_time: '11:15', end_time: '12:10', room: 'E-404', group_target: 'all', is_lab: false },
  { day_of_week: 1, subject_code: 'MAT 301', start_time: '12:15', end_time: '13:10', room: 'E-404', group_target: 'all', is_lab: false },
  { day_of_week: 1, subject_code: 'BREAK', start_time: '13:15', end_time: '14:10', room: 'Cafeteria', group_target: 'all', is_lab: false, is_break: true, custom_label: 'LUNCH BREAK' },
  { day_of_week: 1, subject_code: 'CSE-SPEC', start_time: '14:15', end_time: '15:10', room: '', group_target: 'all', is_lab: false },
  // Group 1 Lab 15:15-17:10
  { day_of_week: 1, subject_code: 'ECE 326', start_time: '15:15', end_time: '17:10', room: 'E-315', group_target: '1', is_lab: true },
  // Group 2 Lab 15:15-17:10
  { day_of_week: 1, subject_code: 'CSE 322', start_time: '15:15', end_time: '17:10', room: 'E-215', group_target: '2', is_lab: true },

  // TUESDAY (Day 2)
  { day_of_week: 2, subject_code: 'CSE-SPEC', start_time: '09:15', end_time: '10:10', room: '', group_target: 'all', is_lab: false },
  // Group 1: DBMS LAB 10:15-12:10
  { day_of_week: 2, subject_code: 'CSE 324', start_time: '10:15', end_time: '12:10', room: 'E-205', group_target: '1', is_lab: true },
  // Group 2: LIBRARY / CCA 10:15-12:10
  { day_of_week: 2, subject_code: 'LIB001', start_time: '10:15', end_time: '12:10', room: 'Library', group_target: '2', is_lab: false },
  { day_of_week: 2, subject_code: 'MED001', start_time: '12:15', end_time: '13:10', room: 'D-205', group_target: 'all', is_lab: false },
  { day_of_week: 2, subject_code: 'BREAK', start_time: '13:15', end_time: '14:10', room: 'Cafeteria', group_target: 'all', is_lab: false, is_break: true, custom_label: 'LUNCH BREAK' },
  { day_of_week: 2, subject_code: 'ECE 306', start_time: '14:15', end_time: '15:10', room: 'E-404', group_target: 'all', is_lab: false },
  // Group 1: DSC++ LAB 15:15-17:10
  { day_of_week: 2, subject_code: 'CSE 222', start_time: '15:15', end_time: '17:10', room: 'E-204', group_target: '1', is_lab: true },
  // Group 2: DBMS LAB 15:15-17:10
  { day_of_week: 2, subject_code: 'CSE 324', start_time: '15:15', end_time: '17:10', room: 'E-205', group_target: '2', is_lab: true },

  // WEDNESDAY (Day 3)
  // Group 1: Python LAB 09:15-11:10
  { day_of_week: 3, subject_code: 'CSE 322', start_time: '09:15', end_time: '11:10', room: 'E-213', group_target: '1', is_lab: true },
  // Group 2: DELD LAB 09:15-11:10
  { day_of_week: 3, subject_code: 'ECE 326', start_time: '09:15', end_time: '11:10', room: 'E-315', group_target: '2', is_lab: true },
  { day_of_week: 3, subject_code: 'CSE 202', start_time: '11:15', end_time: '12:10', room: 'E-404', group_target: 'all', is_lab: false },
  { day_of_week: 3, subject_code: 'CSE 304', start_time: '12:15', end_time: '13:10', room: 'E-404', group_target: 'all', is_lab: false },
  { day_of_week: 3, subject_code: 'BREAK', start_time: '13:15', end_time: '14:10', room: 'Cafeteria', group_target: 'all', is_lab: false, is_break: true, custom_label: 'LUNCH BREAK' },
  { day_of_week: 3, subject_code: 'BSU 343', start_time: '14:15', end_time: '15:10', room: 'E-404', group_target: 'all', is_lab: false },
  { day_of_week: 3, subject_code: 'MAT 301', start_time: '15:15', end_time: '16:10', room: 'E-404', group_target: 'all', is_lab: false },
  { day_of_week: 3, subject_code: 'CSE 302', start_time: '16:15', end_time: '17:10', room: 'E-404', group_target: 'all', is_lab: false },

  // THURSDAY (Day 4)
  { day_of_week: 4, subject_code: 'CSE-SPEC', start_time: '09:15', end_time: '10:10', room: '', group_target: 'all', is_lab: false },
  { day_of_week: 4, subject_code: 'CSE-SPEC', start_time: '10:15', end_time: '11:10', room: '', group_target: 'all', is_lab: false },
  { day_of_week: 4, subject_code: 'CSE 304', start_time: '11:15', end_time: '12:10', room: 'E-404', group_target: 'all', is_lab: false },
  { day_of_week: 4, subject_code: 'ECE 306', start_time: '12:15', end_time: '13:10', room: 'E-404', group_target: 'all', is_lab: false },
  { day_of_week: 4, subject_code: 'BREAK', start_time: '13:15', end_time: '14:10', room: 'Cafeteria', group_target: 'all', is_lab: false, is_break: true, custom_label: 'LUNCH BREAK' },
  { day_of_week: 4, subject_code: 'MAT 301', start_time: '14:15', end_time: '15:10', room: 'E-404', group_target: 'all', is_lab: false },
  { day_of_week: 4, subject_code: 'CSE 302', start_time: '15:15', end_time: '16:10', room: 'E-404', group_target: 'all', is_lab: false },
  { day_of_week: 4, subject_code: 'BCU 341', start_time: '16:15', end_time: '17:10', room: 'E-404', group_target: 'all', is_lab: false },

  // FRIDAY (Day 5)
  { day_of_week: 5, subject_code: 'CSE 202', start_time: '09:15', end_time: '10:10', room: 'E-404', group_target: 'all', is_lab: false },
  { day_of_week: 5, subject_code: 'FLU 344', start_time: '10:15', end_time: '11:10', room: 'E-404', group_target: 'all', is_lab: false },
  // Group 1: LIBRARY / CCA 11:15-13:10
  { day_of_week: 5, subject_code: 'LIB001', start_time: '11:15', end_time: '13:10', room: 'Library', group_target: '1', is_lab: false },
  // Group 2: DSC++ LAB 11:15-13:10
  { day_of_week: 5, subject_code: 'CSE 222', start_time: '11:15', end_time: '13:10', room: 'E-204', group_target: '2', is_lab: true },
  { day_of_week: 5, subject_code: 'BREAK', start_time: '13:15', end_time: '14:10', room: 'Cafeteria', group_target: 'all', is_lab: false, is_break: true, custom_label: 'LUNCH BREAK' },
  // Friday CSE Spec: Room 102
  { day_of_week: 5, subject_code: 'CSE-SPEC', start_time: '14:15', end_time: '15:10', room: '102', group_target: 'all', is_lab: false },
  { day_of_week: 5, subject_code: 'BCU 341', start_time: '15:15', end_time: '16:10', room: 'E-404', group_target: 'all', is_lab: false },
  { day_of_week: 5, subject_code: 'CSE 304', start_time: '16:15', end_time: '17:10', room: 'E-404', group_target: 'all', is_lab: false },
];

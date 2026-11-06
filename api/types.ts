/**
 * SHARED API CONTRACTS & DATA MODELS — ANSHUL STUDENT ERP
 */

export type GroupType = 1 | 2;

export interface StudentProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  university: string;
  degree: string;
  branch: string;
  semester: number;
  section: string;
  student_id: string;
  selected_group: GroupType;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  attendance_threshold: number; // e.g. 0.75 for 75%
  theme: 'dark' | 'light' | 'system';
  keep_signed_in: boolean;
  email_notifications: boolean;
  browser_notifications: boolean;
  remind_upcoming_classes: boolean;
  remind_assignment_deadlines: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Subject {
  id: string;
  user_id: string;
  name: string;
  short_name: string;
  code: string;
  amizone_code?: string;
  faculty_name: string;
  faculty_initials?: string;
  default_room: string;
  opening_present: number;
  opening_total: number;
  is_lab: boolean;
  credit_weight: number;
  notes?: string;
  created_at?: string;
}

export interface TimetableEntry {
  id: string;
  user_id: string;
  subject_id: string;
  day_of_week: number; // 1 = Monday, ..., 5 = Friday
  start_time: string; // HH:mm
  end_time: string; // HH:mm
  room: string;
  group_target: 'all' | '1' | '2';
  is_lab: boolean;
  is_break?: boolean;
  specific_date?: string | null;
  custom_label?: string;
}

export type DayOverrideType = 'working_follows_day' | 'custom' | 'holiday';

export interface DayOverride {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  type: DayOverrideType;
  follows_weekday?: number | null; // 1 to 5
  note?: string;
  created_at?: string;
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Not Marked';

export interface AttendanceRecord {
  id: string;
  user_id: string;
  subject_id: string;
  date: string; // YYYY-MM-DD
  slot_start: string; // HH:mm
  status: AttendanceStatus;
  note?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SemesterResult {
  id: string;
  user_id: string;
  semester_number: number;
  sgpa: number;
  credits: number;
  back_papers: number;
  final_result?: string;
  is_official?: boolean;
  cgpa_override?: number;
  notes?: string;
}

export interface Exam {
  id: string;
  user_id: string;
  subject_id: string;
  exam_name: string;
  exam_date: string; // YYYY-MM-DD
  start_time: string; // HH:mm
  end_time: string; // HH:mm
  room: string;
  preparation_status: 'Not Started' | 'In Progress' | 'Prepared' | 'Mastered';
  syllabus_covered_pct: number;
  notes?: string;
}

export type AssignmentStatus = 'Not Started' | 'In Progress' | 'Completed';
export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface Assignment {
  id: string;
  user_id: string;
  subject_id: string;
  title: string;
  description?: string;
  assigned_date: string;
  due_date: string;
  status: AssignmentStatus;
  priority: PriorityLevel;
  attachment_url?: string;
  created_at?: string;
}

export interface StudyTask {
  id: string;
  user_id: string;
  subject_id: string;
  title: string;
  target_date: string;
  duration_minutes: number;
  priority: PriorityLevel;
  is_completed: boolean;
  notes?: string;
  created_at?: string;
}

export interface ERPNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'class' | 'exam' | 'assignment' | 'attendance' | 'study' | 'system';
  is_read: boolean;
  created_at: string;
}

export type AttendanceHealthStatus = 'Safe' | 'Warning' | 'Critical';

export interface SubjectAttendanceStats {
  subject: Subject;
  opening_present: number;
  opening_total: number;
  dated_present: number;
  dated_absent: number;
  dated_not_marked: number;
  total_classes: number;
  total_present: number;
  percentage: number | null;
  percentageFormatted: string;
  safe_bunks: number;
  classes_needed: number;
  status: AttendanceHealthStatus;
  statusMessage: string;
}

/**
 * API ROUTE DEFINITIONS — ANSHUL STUDENT ERP
 */

export const API_BASE_URL = '/api';

export const ENDPOINTS = {
  // Auth & Profile
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    ME: '/api/auth/me',
    PROFILE: '/api/profile',
    SETTINGS: '/api/settings',
    UPLOAD_AVATAR: '/api/profile/avatar',
  },

  // Timetable
  TIMETABLE: {
    GET_WEEKLY: '/api/timetable',
    GET_DAY: (date: string) => `/api/timetable/day?date=${date}`,
    OVERRIDES: '/api/timetable/overrides',
    DELETE_OVERRIDE: (date: string) => `/api/timetable/overrides/${date}`,
    UPDATE_SLOT: (id: string) => `/api/timetable/slots/${id}`,
  },

  // Attendance & Bunk
  ATTENDANCE: {
    GET_STATS: '/api/attendance/stats',
    RECORDS: '/api/attendance/records',
    MARK: '/api/attendance/mark',
    DELETE_RECORD: (id: string) => `/api/attendance/records/${id}`,
    CALCULATE_BUNKS: '/api/attendance/calculator',
  },

  // Academics
  ACADEMICS: {
    SEMESTERS: '/api/academics/semesters',
    ADD_SEMESTER: '/api/academics/semesters',
    UPDATE_SEMESTER: (id: string) => `/api/academics/semesters/${id}`,
  },

  // Examinations
  EXAMS: {
    LIST: '/api/exams',
    UPSERT: '/api/exams',
    DELETE: (id: string) => `/api/exams/${id}`,
    COUNTDOWN: '/api/exams/countdown',
  },

  // Assignments
  ASSIGNMENTS: {
    LIST: '/api/assignments',
    UPSERT: '/api/assignments',
    DELETE: (id: string) => `/api/assignments/${id}`,
  },

  // Study Planner
  PLANNER: {
    TASKS: '/api/planner/tasks',
    TOGGLE_TASK: (id: string) => `/api/planner/tasks/${id}/toggle`,
    DELETE_TASK: (id: string) => `/api/planner/tasks/${id}`,
    FREE_WINDOWS: '/api/planner/free-windows',
  },

  // System
  HEALTH: '/api/health',
} as const;

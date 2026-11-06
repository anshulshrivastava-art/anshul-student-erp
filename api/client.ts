/**
 * API CLIENT — ANSHUL STUDENT ERP
 * Provides unified request helpers with typed responses and error handling.
 */

import { ENDPOINTS, API_BASE_URL } from './endpoints';
import type {
  StudentProfile,
  UserSettings,
  Subject,
  TimetableEntry,
  DayOverride,
  AttendanceRecord,
  SemesterResult,
  Exam,
  Assignment,
  StudyTask,
  SubjectAttendanceStats,
} from './types';

export class ErpApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  setAuthToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.message || `Request failed with status ${response.status}`);
    }

    return response.json();
  }

  // Profile
  async getProfile(): Promise<StudentProfile> {
    return this.request<StudentProfile>(ENDPOINTS.AUTH.PROFILE);
  }

  async updateProfile(updates: Partial<StudentProfile>): Promise<StudentProfile> {
    return this.request<StudentProfile>(ENDPOINTS.AUTH.PROFILE, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Timetable
  async getTimetable(): Promise<TimetableEntry[]> {
    return this.request<TimetableEntry[]>(ENDPOINTS.TIMETABLE.GET_WEEKLY);
  }

  async getDayOverrides(): Promise<DayOverride[]> {
    return this.request<DayOverride[]>(ENDPOINTS.TIMETABLE.OVERRIDES);
  }

  async setDayOverride(override: Omit<DayOverride, 'id' | 'user_id'>): Promise<DayOverride[]> {
    return this.request<DayOverride[]>(ENDPOINTS.TIMETABLE.OVERRIDES, {
      method: 'POST',
      body: JSON.stringify(override),
    });
  }

  // Attendance
  async getAttendanceStats(): Promise<SubjectAttendanceStats[]> {
    return this.request<SubjectAttendanceStats[]>(ENDPOINTS.ATTENDANCE.GET_STATS);
  }

  async markAttendance(payload: {
    subject_id: string;
    date: string;
    slot_start: string;
    status: string;
    note?: string;
  }): Promise<AttendanceRecord[]> {
    return this.request<AttendanceRecord[]>(ENDPOINTS.ATTENDANCE.MARK, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Health
  async checkHealth(): Promise<{ status: string; timestamp: string }> {
    return this.request(ENDPOINTS.HEALTH);
  }
}

export const apiClient = new ErpApiClient();

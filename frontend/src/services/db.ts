import { supabase, isSupabaseConfigured } from './supabase';
import {
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
  ERPNotification,
} from '../types';
import {
  INITIAL_STUDENT_PROFILE,
  INITIAL_SUBJECTS,
  TIMETABLE_SEEDS,
  INITIAL_SEMESTERS,
  OFFICIAL_CGPA,
} from '../constants';

const LOCAL_STORAGE_PREFIX = 'anshul_erp_data_';

function getLocalData<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${key}`);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch (e) {
    console.error(`Failed to read ${key} from localStorage`, e);
    return defaultValue;
  }
}

function setLocalData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${key}`, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to write ${key} to localStorage`, e);
  }
}

// Generate seeded local database state
export function getInitialLocalState(userId: string = 'local-user-anshul') {
  const profile: StudentProfile = {
    ...INITIAL_STUDENT_PROFILE,
    id: userId,
    user_id: userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const settings: UserSettings = {
    id: `set-${userId}`,
    user_id: userId,
    attendance_threshold: 0.75,
    theme: 'dark',
    keep_signed_in: true,
    email_notifications: false,
    browser_notifications: false,
    remind_upcoming_classes: true,
    remind_assignment_deadlines: true,
  };

  const subjects: Subject[] = INITIAL_SUBJECTS.map((s, idx) => ({
    ...s,
    id: `subj-${idx + 1}`,
    user_id: userId,
    created_at: new Date().toISOString(),
  }));

  const timetableEntries: TimetableEntry[] = TIMETABLE_SEEDS.map((t, idx) => {
    const sub = subjects.find((s) => s.code === t.subject_code);
    return {
      id: `tt-${idx + 1}`,
      user_id: userId,
      subject_id: sub ? sub.id : 'break',
      day_of_week: t.day_of_week,
      start_time: t.start_time,
      end_time: t.end_time,
      room: t.room,
      group_target: t.group_target,
      is_lab: t.is_lab,
      is_break: t.is_break,
      custom_label: t.custom_label,
    };
  });

  const semesterResults: SemesterResult[] = INITIAL_SEMESTERS.map((s, idx) => ({
    ...s,
    id: `sem-${idx + 1}`,
    user_id: userId,
  }));

  const exams: Exam[] = [
    {
      id: 'exam-1',
      user_id: userId,
      subject_id: subjects.find((s) => s.code === 'MAT 301')?.id || subjects[0].id,
      exam_name: 'Applied Mathematics III (End Term)',
      exam_date: '2026-12-08',
      start_time: '10:00',
      end_time: '13:00',
      room: 'ASET Hall 1',
      preparation_status: 'In Progress',
      syllabus_covered_pct: 65,
      notes: 'Covers Probability, Statistics, and Numerical Methods',
    },
    {
      id: 'exam-2',
      user_id: userId,
      subject_id: subjects.find((s) => s.code === 'CSE 304')?.id || subjects[1].id,
      exam_name: 'Database Management Systems (End Term)',
      exam_date: '2026-12-10',
      start_time: '10:00',
      end_time: '13:00',
      room: 'ASET Hall 2',
      preparation_status: 'In Progress',
      syllabus_covered_pct: 75,
      notes: 'SQL, Normalization, Transactions & Concurrency Control',
    },
  ];

  const assignments: Assignment[] = [
    {
      id: 'assign-1',
      user_id: userId,
      subject_id: subjects.find((s) => s.code === 'CSE 202')?.id || subjects[0].id,
      title: 'Graph Traversal & Dijkstra Algorithm Implementation',
      description: 'Implement BFS, DFS and Dijkstra shortest path algorithm with time complexity benchmarks in C++.',
      assigned_date: '2026-11-01',
      due_date: '2026-11-12',
      status: 'In Progress',
      priority: 'High',
    },
    {
      id: 'assign-2',
      user_id: userId,
      subject_id: subjects.find((s) => s.code === 'CSE-SPEC')?.id || subjects[1].id,
      title: 'Machine Learning Classification Pipeline',
      description: 'Build Logistic Regression and Random Forest models on the dataset provided by Dr. Deepak Motwani.',
      assigned_date: '2026-11-03',
      due_date: '2026-11-15',
      status: 'Not Started',
      priority: 'Medium',
    },
  ];

  const studyTasks: StudyTask[] = [
    {
      id: 'task-1',
      user_id: userId,
      subject_id: subjects.find((s) => s.code === 'ECE 306')?.id || subjects[0].id,
      title: 'Revise Karnaugh Maps and Sequential Circuits',
      target_date: '2026-11-06',
      duration_minutes: 60,
      priority: 'High',
      is_completed: false,
      notes: 'Solve flip-flop state diagram problems',
    },
    {
      id: 'task-2',
      user_id: userId,
      subject_id: subjects.find((s) => s.code === 'MAT 301')?.id || subjects[0].id,
      title: 'Practice Poisson and Normal Distribution Problems',
      target_date: '2026-11-07',
      duration_minutes: 90,
      priority: 'Medium',
      is_completed: false,
    },
  ];

  const notifications: ERPNotification[] = [
    {
      id: 'notif-1',
      user_id: userId,
      title: 'Academic Countdown Active',
      message: 'End term examinations commence on 08 December 2026. 31 days remaining.',
      type: 'exam',
      is_read: false,
      created_at: new Date().toISOString(),
    },
    {
      id: 'notif-2',
      user_id: userId,
      title: 'Attendance Alert',
      message: 'Meditation/Yoga and French III are near the 75% boundary. Attend upcoming classes.',
      type: 'attendance',
      is_read: false,
      created_at: new Date().toISOString(),
    },
  ];

  return {
    profile,
    settings,
    subjects,
    timetableEntries,
    dayOverrides: [] as DayOverride[],
    attendanceRecords: [] as AttendanceRecord[],
    semesterResults,
    exams,
    assignments,
    studyTasks,
    notifications,
  };
}

export class ErpDatabase {
  private userId: string;

  constructor(userId: string = 'local-user-anshul') {
    this.userId = userId;
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  // --- Profile ---
  async getProfile(): Promise<StudentProfile> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', this.userId)
        .single();
      if (!error && data) return data;
    }
    const local = getLocalData<StudentProfile | null>(`profile_${this.userId}`, null);
    if (local) return local;
    const initial = getInitialLocalState(this.userId).profile;
    setLocalData(`profile_${this.userId}`, initial);
    return initial;
  }

  async updateProfile(updates: Partial<StudentProfile>): Promise<StudentProfile> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', this.userId)
        .select()
        .single();
      if (!error && data) {
        setLocalData(`profile_${this.userId}`, data);
        return data;
      }
    }
    const current = await this.getProfile();
    const updated = { ...current, ...updates, updated_at: new Date().toISOString() };
    setLocalData(`profile_${this.userId}`, updated);
    return updated;
  }

  // --- Settings ---
  async getSettings(): Promise<UserSettings> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', this.userId)
        .single();
      if (!error && data) return data;
    }
    const local = getLocalData<UserSettings | null>(`settings_${this.userId}`, null);
    if (local) return local;
    const initial = getInitialLocalState(this.userId).settings;
    setLocalData(`settings_${this.userId}`, initial);
    return initial;
  }

  async updateSettings(updates: Partial<UserSettings>): Promise<UserSettings> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('user_settings')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('user_id', this.userId)
        .select()
        .single();
      if (!error && data) {
        setLocalData(`settings_${this.userId}`, data);
        return data;
      }
    }
    const current = await this.getSettings();
    const updated = { ...current, ...updates, updated_at: new Date().toISOString() };
    setLocalData(`settings_${this.userId}`, updated);
    return updated;
  }

  // --- Subjects ---
  async getSubjects(): Promise<Subject[]> {
    if (isSupabaseConfigured && supabase) {
      let activeUserId = this.userId;
      try {
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user?.id) {
          activeUserId = authData.user.id;
          this.userId = activeUserId;
        }
      } catch (e) {
        console.warn('[db] auth user lookup error:', e);
      }
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('user_id', activeUserId)
        .order('name');
      if (!error && data && data.length > 0) return data;
    }
    const local = getLocalData<Subject[] | null>(`subjects_${this.userId}`, null);
    if (local && local.length > 0) return local;
    const initial = getInitialLocalState(this.userId).subjects;
    setLocalData(`subjects_${this.userId}`, initial);
    return initial;
  }

  async updateSubject(id: string, updates: Partial<Subject>): Promise<Subject[]> {
    if (isSupabaseConfigured && supabase) {
      let activeUserId = this.userId;
      try {
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user?.id) {
          activeUserId = authData.user.id;
          this.userId = activeUserId;
        }
      } catch (e) {
        console.warn('[db] auth user lookup error:', e);
      }
      await supabase.from('subjects').update(updates).eq('id', id).eq('user_id', activeUserId);
      return this.getSubjects();
    }
    const list = await this.getSubjects();
    const updated = list.map((s) => (s.id === id ? { ...s, ...updates } : s));
    setLocalData(`subjects_${this.userId}`, updated);
    return updated;
  }

  // --- Timetable Entries ---
  async getTimetableEntries(): Promise<TimetableEntry[]> {
    if (isSupabaseConfigured && supabase) {
      let activeUserId = this.userId;
      try {
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user?.id) {
          activeUserId = authData.user.id;
          this.userId = activeUserId;
        }
      } catch (e) {
        console.warn('[db] auth user lookup error:', e);
      }
      const { data, error } = await supabase
        .from('timetable_entries')
        .select('*')
        .eq('user_id', activeUserId)
        .order('start_time');
      if (!error && data && data.length > 0) return data;
    }
    const local = getLocalData<TimetableEntry[] | null>(`timetable_${this.userId}`, null);
    if (local && local.length > 0) return local;
    const initial = getInitialLocalState(this.userId).timetableEntries;
    setLocalData(`timetable_${this.userId}`, initial);
    return initial;
  }

  async addTimetableEntry(entry: Omit<TimetableEntry, 'id' | 'user_id'>): Promise<TimetableEntry[]> {
    const newEntry: TimetableEntry = {
      ...entry,
      id: `tt-${Date.now()}`,
      user_id: this.userId,
    };
    if (isSupabaseConfigured && supabase) {
      await supabase.from('timetable_entries').insert(newEntry);
      return this.getTimetableEntries();
    }
    const list = await this.getTimetableEntries();
    const updated = [...list, newEntry];
    setLocalData(`timetable_${this.userId}`, updated);
    return updated;
  }

  async updateTimetableEntry(id: string, updates: Partial<TimetableEntry>): Promise<TimetableEntry[]> {
    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('timetable_entries')
        .update(updates)
        .eq('id', id)
        .eq('user_id', this.userId);
      return this.getTimetableEntries();
    }
    const list = await this.getTimetableEntries();
    const updated = list.map((e) => (e.id === id ? { ...e, ...updates } : e));
    setLocalData(`timetable_${this.userId}`, updated);
    return updated;
  }

  async deleteTimetableEntry(id: string): Promise<TimetableEntry[]> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('timetable_entries').delete().eq('id', id).eq('user_id', this.userId);
      return this.getTimetableEntries();
    }
    const list = await this.getTimetableEntries();
    const updated = list.filter((e) => e.id !== id);
    setLocalData(`timetable_${this.userId}`, updated);
    return updated;
  }

  // --- Day Overrides (Working Saturday, Custom Day, Holiday) ---
  async getDayOverrides(): Promise<DayOverride[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('day_overrides')
        .select('*')
        .eq('user_id', this.userId)
        .order('date');
      if (!error && data) return data;
    }
    return getLocalData<DayOverride[]>(`day_overrides_${this.userId}`, []);
  }

  async setDayOverride(override: Omit<DayOverride, 'id' | 'user_id'>): Promise<DayOverride[]> {
    const newOverride: DayOverride = {
      ...override,
      id: `ov-${Date.now()}`,
      user_id: this.userId,
      created_at: new Date().toISOString(),
    };
    if (isSupabaseConfigured && supabase) {
      await supabase.from('day_overrides').upsert(newOverride, { onConflict: 'user_id,date' });
      return this.getDayOverrides();
    }
    const current = await this.getDayOverrides();
    const updated = [...current.filter((o) => o.date !== override.date), newOverride];
    setLocalData(`day_overrides_${this.userId}`, updated);
    return updated;
  }

  async deleteDayOverride(date: string): Promise<DayOverride[]> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('day_overrides').delete().eq('user_id', this.userId).eq('date', date);
      return this.getDayOverrides();
    }
    const current = await this.getDayOverrides();
    const updated = current.filter((o) => o.date !== date);
    setLocalData(`day_overrides_${this.userId}`, updated);
    return updated;
  }

  // --- Attendance Records (Dated entries on top of baseline) ---
  async getAttendanceRecords(): Promise<AttendanceRecord[]> {
    if (isSupabaseConfigured && supabase) {
      let activeUserId = this.userId;
      try {
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user?.id) {
          activeUserId = authData.user.id;
          this.userId = activeUserId;
        }
      } catch (e) {
        console.warn('[db] auth user lookup error:', e);
      }
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('user_id', activeUserId)
        .order('date', { ascending: false });
      if (error) {
        console.error('[getAttendanceRecords] Supabase fetch error:', error);
      } else if (data) {
        setLocalData(`attendance_${activeUserId}`, data);
        return data;
      }
    }
    return getLocalData<AttendanceRecord[]>(`attendance_${this.userId}`, []);
  }

  async upsertAttendanceRecord(
    record: Omit<AttendanceRecord, 'id' | 'user_id'>
  ): Promise<AttendanceRecord[]> {
    let activeUserId = this.userId;
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user?.id) {
          activeUserId = authData.user.id;
          this.userId = activeUserId;
        }
      } catch (e) {
        console.warn('[db] auth user lookup error:', e);
      }

      let realSubjectId = record.subject_id;
      const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!UUID_REGEX.test(realSubjectId)) {
        const { data: matchedSubj } = await supabase
          .from('subjects')
          .select('id, code, short_name, name')
          .eq('user_id', activeUserId);
        if (matchedSubj && matchedSubj.length > 0) {
          const found = matchedSubj.find(
            (s) =>
              s.id === realSubjectId ||
              s.code.toLowerCase() === realSubjectId.toLowerCase() ||
              s.short_name.toLowerCase() === realSubjectId.toLowerCase() ||
              s.name.toLowerCase() === realSubjectId.toLowerCase()
          );
          if (found) realSubjectId = found.id;
        }
      }

      const payload = {
        user_id: activeUserId,
        subject_id: realSubjectId,
        date: record.date,
        slot_start: record.slot_start,
        status: record.status,
        note: record.note ? record.note.trim() : null,
        updated_at: new Date().toISOString(),
      };

      console.log('[upsertAttendanceRecord] Payload to Supabase:', payload);

      const { data, error } = await supabase
        .from('attendance_records')
        .upsert(payload, {
          onConflict: 'user_id,subject_id,date,slot_start',
        })
        .select();

      console.log('[upsertAttendanceRecord] Supabase response:', { data, error });

      if (error) {
        console.error('[upsertAttendanceRecord] Supabase error:', error);
        throw new Error(`Failed to save attendance: ${error.message} (${error.code || 'ERR'})`);
      }

      return this.getAttendanceRecords();
    }

    const newRecord: AttendanceRecord = {
      ...record,
      id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      user_id: this.userId,
      updated_at: new Date().toISOString(),
    };

    const current = await this.getAttendanceRecords();
    const existingIndex = current.findIndex(
      (r) =>
        r.subject_id === record.subject_id &&
        r.date === record.date &&
        r.slot_start === record.slot_start
    );

    let updated: AttendanceRecord[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = { ...current[existingIndex], ...record, updated_at: new Date().toISOString() };
    } else {
      updated = [newRecord, ...current];
    }
    setLocalData(`attendance_${this.userId}`, updated);
    return updated;
  }

  async deleteAttendanceRecord(id: string): Promise<AttendanceRecord[]> {
    if (isSupabaseConfigured && supabase) {
      let activeUserId = this.userId;
      try {
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user?.id) {
          activeUserId = authData.user.id;
          this.userId = activeUserId;
        }
      } catch (e) {
        console.warn('[db] auth user lookup error:', e);
      }

      console.log('[deleteAttendanceRecord] Deleting record id:', id);
      const { data, error } = await supabase
        .from('attendance_records')
        .delete()
        .eq('id', id)
        .eq('user_id', activeUserId)
        .select();

      if (error) {
        console.error('[deleteAttendanceRecord] Supabase delete error:', error);
        throw new Error(`Failed to delete attendance: ${error.message}`);
      }
      console.log('[deleteAttendanceRecord] Supabase delete success:', data);
      return this.getAttendanceRecords();
    }
    const current = await this.getAttendanceRecords();
    const updated = current.filter((r) => r.id !== id);
    setLocalData(`attendance_${this.userId}`, updated);
    return updated;
  }

  async deleteAttendanceRecordBySlot(
    subjectId: string,
    date: string,
    slotStart: string
  ): Promise<AttendanceRecord[]> {
    let activeUserId = this.userId;
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user?.id) {
          activeUserId = authData.user.id;
          this.userId = activeUserId;
        }
      } catch (e) {
        console.warn('[db] auth user lookup error:', e);
      }

      let realSubjectId = subjectId;
      const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!UUID_REGEX.test(realSubjectId)) {
        const { data: matchedSubj } = await supabase
          .from('subjects')
          .select('id, code, short_name, name')
          .eq('user_id', activeUserId);
        if (matchedSubj) {
          const found = matchedSubj.find(
            (s) =>
              s.id === realSubjectId ||
              s.code.toLowerCase() === realSubjectId.toLowerCase() ||
              s.short_name.toLowerCase() === realSubjectId.toLowerCase()
          );
          if (found) realSubjectId = found.id;
        }
      }

      console.log('[deleteAttendanceRecordBySlot] Deleting from Supabase:', {
        user_id: activeUserId,
        subject_id: realSubjectId,
        date,
        slot_start: slotStart,
      });

      const { data, error } = await supabase
        .from('attendance_records')
        .delete()
        .eq('user_id', activeUserId)
        .eq('subject_id', realSubjectId)
        .eq('date', date)
        .eq('slot_start', slotStart)
        .select();

      if (error) {
        console.error('[deleteAttendanceRecordBySlot] Supabase delete error:', error);
        throw new Error(`Failed to delete attendance: ${error.message}`);
      }
      console.log('[deleteAttendanceRecordBySlot] Supabase delete success:', data);
      return this.getAttendanceRecords();
    }

    const current = await this.getAttendanceRecords();
    const updated = current.filter(
      (r) => !(r.subject_id === subjectId && r.date === date && r.slot_start === slotStart)
    );
    setLocalData(`attendance_${activeUserId}`, updated);
    return updated;
  }

  // --- Semester Results & CGPA ---
  async getSemesterResults(): Promise<SemesterResult[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('semester_results')
        .select('*')
        .eq('user_id', this.userId)
        .order('semester_number');
      if (!error && data && data.length > 0) return data;
    }
    const local = getLocalData<SemesterResult[] | null>(`semesters_${this.userId}`, null);
    if (local && local.length > 0) return local;
    const initial = getInitialLocalState(this.userId).semesterResults;
    setLocalData(`semesters_${this.userId}`, initial);
    return initial;
  }

  async updateSemesterResult(id: string, updates: Partial<SemesterResult>): Promise<SemesterResult[]> {
    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('semester_results')
        .update(updates)
        .eq('id', id)
        .eq('user_id', this.userId);
      return this.getSemesterResults();
    }
    const list = await this.getSemesterResults();
    const updated = list.map((s) => (s.id === id ? { ...s, ...updates } : s));
    setLocalData(`semesters_${this.userId}`, updated);
    return updated;
  }

  async addSemesterResult(sem: Omit<SemesterResult, 'id' | 'user_id'>): Promise<SemesterResult[]> {
    const newSem: SemesterResult = {
      ...sem,
      id: `sem-${Date.now()}`,
      user_id: this.userId,
    };
    if (isSupabaseConfigured && supabase) {
      await supabase.from('semester_results').insert(newSem);
      return this.getSemesterResults();
    }
    const list = await this.getSemesterResults();
    const updated = [...list, newSem];
    setLocalData(`semesters_${this.userId}`, updated);
    return updated;
  }

  // --- Exams ---
  async getExams(): Promise<Exam[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .eq('user_id', this.userId)
        .order('exam_date');
      if (!error && data && data.length > 0) return data;
    }
    const local = getLocalData<Exam[] | null>(`exams_${this.userId}`, null);
    if (local && local.length > 0) return local;
    const initial = getInitialLocalState(this.userId).exams;
    setLocalData(`exams_${this.userId}`, initial);
    return initial;
  }

  async upsertExam(exam: Partial<Exam> & { exam_name: string; exam_date: string; subject_id: string }): Promise<Exam[]> {
    if (exam.id) {
      if (isSupabaseConfigured && supabase) {
        await supabase.from('exams').update(exam).eq('id', exam.id).eq('user_id', this.userId);
        return this.getExams();
      }
      const list = await this.getExams();
      const updated = list.map((e) => (e.id === exam.id ? { ...e, ...exam } : e));
      setLocalData(`exams_${this.userId}`, updated);
      return updated;
    } else {
      const newExam: Exam = {
        id: `exam-${Date.now()}`,
        user_id: this.userId,
        subject_id: exam.subject_id,
        exam_name: exam.exam_name,
        exam_date: exam.exam_date,
        start_time: exam.start_time || '10:00',
        end_time: exam.end_time || '13:00',
        room: exam.room || 'ASET Examination Hall',
        preparation_status: exam.preparation_status || 'In Progress',
        syllabus_covered_pct: exam.syllabus_covered_pct || 0,
        notes: exam.notes || '',
      };
      if (isSupabaseConfigured && supabase) {
        await supabase.from('exams').insert(newExam);
        return this.getExams();
      }
      const list = await this.getExams();
      const updated = [...list, newExam];
      setLocalData(`exams_${this.userId}`, updated);
      return updated;
    }
  }

  async deleteExam(id: string): Promise<Exam[]> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('exams').delete().eq('id', id).eq('user_id', this.userId);
      return this.getExams();
    }
    const list = await this.getExams();
    const updated = list.filter((e) => e.id !== id);
    setLocalData(`exams_${this.userId}`, updated);
    return updated;
  }

  // --- Assignments ---
  async getAssignments(): Promise<Assignment[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('user_id', this.userId)
        .order('due_date');
      if (!error && data && data.length > 0) return data;
    }
    const local = getLocalData<Assignment[] | null>(`assignments_${this.userId}`, null);
    if (local && local.length > 0) return local;
    const initial = getInitialLocalState(this.userId).assignments;
    setLocalData(`assignments_${this.userId}`, initial);
    return initial;
  }

  async upsertAssignment(assignment: Partial<Assignment> & { title: string; due_date: string; subject_id: string }): Promise<Assignment[]> {
    if (assignment.id) {
      if (isSupabaseConfigured && supabase) {
        await supabase.from('assignments').update(assignment).eq('id', assignment.id).eq('user_id', this.userId);
        return this.getAssignments();
      }
      const list = await this.getAssignments();
      const updated = list.map((a) => (a.id === assignment.id ? { ...a, ...assignment } : a));
      setLocalData(`assignments_${this.userId}`, updated);
      return updated;
    } else {
      const newAssign: Assignment = {
        id: `assign-${Date.now()}`,
        user_id: this.userId,
        subject_id: assignment.subject_id,
        title: assignment.title,
        description: assignment.description || '',
        assigned_date: assignment.assigned_date || new Date().toISOString().split('T')[0],
        due_date: assignment.due_date,
        status: assignment.status || 'Not Started',
        priority: assignment.priority || 'Medium',
        attachment_url: assignment.attachment_url,
      };
      if (isSupabaseConfigured && supabase) {
        await supabase.from('assignments').insert(newAssign);
        return this.getAssignments();
      }
      const list = await this.getAssignments();
      const updated = [...list, newAssign];
      setLocalData(`assignments_${this.userId}`, updated);
      return updated;
    }
  }

  async deleteAssignment(id: string): Promise<Assignment[]> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('assignments').delete().eq('id', id).eq('user_id', this.userId);
      return this.getAssignments();
    }
    const list = await this.getAssignments();
    const updated = list.filter((a) => a.id !== id);
    setLocalData(`assignments_${this.userId}`, updated);
    return updated;
  }

  // --- Study Tasks ---
  async getStudyTasks(): Promise<StudyTask[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('study_tasks')
        .select('*')
        .eq('user_id', this.userId)
        .order('target_date');
      if (!error && data && data.length > 0) return data;
    }
    const local = getLocalData<StudyTask[] | null>(`study_tasks_${this.userId}`, null);
    if (local && local.length > 0) return local;
    const initial = getInitialLocalState(this.userId).studyTasks;
    setLocalData(`study_tasks_${this.userId}`, initial);
    return initial;
  }

  async upsertStudyTask(task: Partial<StudyTask> & { title: string; target_date: string; subject_id: string }): Promise<StudyTask[]> {
    if (task.id) {
      if (isSupabaseConfigured && supabase) {
        await supabase.from('study_tasks').update(task).eq('id', task.id).eq('user_id', this.userId);
        return this.getStudyTasks();
      }
      const list = await this.getStudyTasks();
      const updated = list.map((t) => (t.id === task.id ? { ...t, ...task } : t));
      setLocalData(`study_tasks_${this.userId}`, updated);
      return updated;
    } else {
      const newTask: StudyTask = {
        id: `task-${Date.now()}`,
        user_id: this.userId,
        subject_id: task.subject_id,
        title: task.title,
        target_date: task.target_date,
        duration_minutes: task.duration_minutes || 60,
        priority: task.priority || 'Medium',
        is_completed: task.is_completed || false,
        notes: task.notes || '',
      };
      if (isSupabaseConfigured && supabase) {
        await supabase.from('study_tasks').insert(newTask);
        return this.getStudyTasks();
      }
      const list = await this.getStudyTasks();
      const updated = [...list, newTask];
      setLocalData(`study_tasks_${this.userId}`, updated);
      return updated;
    }
  }

  async deleteStudyTask(id: string): Promise<StudyTask[]> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('study_tasks').delete().eq('id', id).eq('user_id', this.userId);
      return this.getStudyTasks();
    }
    const list = await this.getStudyTasks();
    const updated = list.filter((t) => t.id !== id);
    setLocalData(`study_tasks_${this.userId}`, updated);
    return updated;
  }

  // --- Notifications ---
  async getNotifications(): Promise<ERPNotification[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', this.userId)
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) return data;
    }
    const local = getLocalData<ERPNotification[] | null>(`notifications_${this.userId}`, null);
    if (local && local.length > 0) return local;
    const initial = getInitialLocalState(this.userId).notifications;
    setLocalData(`notifications_${this.userId}`, initial);
    return initial;
  }

  async markNotificationRead(id: string): Promise<ERPNotification[]> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('notifications').update({ is_read: true }).eq('id', id).eq('user_id', this.userId);
      return this.getNotifications();
    }
    const list = await this.getNotifications();
    const updated = list.map((n) => (n.id === id ? { ...n, is_read: true } : n));
    setLocalData(`notifications_${this.userId}`, updated);
    return updated;
  }

  async clearAllNotifications(): Promise<ERPNotification[]> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('notifications').delete().eq('user_id', this.userId);
      return [];
    }
    setLocalData(`notifications_${this.userId}`, []);
    return [];
  }
}

export const db = new ErpDatabase();

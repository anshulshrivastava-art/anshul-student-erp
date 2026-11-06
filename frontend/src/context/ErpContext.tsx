import React, { createContext, useContext, useEffect, useState, useMemo, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';
import { db } from '../services/db';
import {
  Subject,
  TimetableEntry,
  DayOverride,
  AttendanceRecord,
  SemesterResult,
  Exam,
  Assignment,
  StudyTask,
  ERPNotification,
  GroupType,
  SubjectAttendanceStats,
  UserSettings,
} from '../types';
import {
  computeSubjectAttendanceStats,
  computeOverallAttendance,
} from '../utils/attendance';
import {
  getCurrentClassStatus,
  CurrentClassStatus,
  getEntriesForDate,
  EnrichedTimetableEntry,
} from '../utils/timetable';
import { getExamCountdown, ExamCountdown, formatKolkata } from '../utils/date';
import { DEFAULT_THRESHOLD } from '../constants';

interface ErpContextType {
  // Collections
  subjects: Subject[];
  timetableEntries: TimetableEntry[];
  dayOverrides: DayOverride[];
  attendanceRecords: AttendanceRecord[];
  semesterResults: SemesterResult[];
  exams: Exam[];
  assignments: Assignment[];
  studyTasks: StudyTask[];
  notifications: ERPNotification[];
  settings: UserSettings | null;

  // Real-time & Computed
  now: Date;
  activeGroup: GroupType;
  attendanceStats: SubjectAttendanceStats[];
  overallAttendance: {
    total_present: number;
    total_classes: number;
    percentage: number | null;
    percentageFormatted: string;
  };
  currentClassStatus: CurrentClassStatus;
  examCountdown: ExamCountdown;
  isLoadingData: boolean;

  // Actions
  switchGroup: (group: GroupType) => Promise<void>;
  markAttendance: (
    subjectId: string,
    date: string,
    slotStart: string,
    status: 'Present' | 'Absent' | 'Not Marked',
    note?: string
  ) => Promise<void>;
  deleteAttendanceRecord: (id: string) => Promise<void>;
  deleteAttendanceRecordBySlot: (subjectId: string, date: string, slotStart: string) => Promise<void>;
  setDayOverride: (override: Omit<DayOverride, 'id' | 'user_id'>) => Promise<void>;
  deleteDayOverride: (date: string) => Promise<void>;
  updateSubject: (id: string, updates: Partial<Subject>) => Promise<void>;
  updateTimetableEntry: (id: string, updates: Partial<TimetableEntry>) => Promise<void>;
  addTimetableEntry: (entry: Omit<TimetableEntry, 'id' | 'user_id'>) => Promise<void>;
  deleteTimetableEntry: (id: string) => Promise<void>;
  upsertExam: (exam: Partial<Exam> & { exam_name: string; exam_date: string; subject_id: string }) => Promise<void>;
  deleteExam: (id: string) => Promise<void>;
  upsertAssignment: (assign: Partial<Assignment> & { title: string; due_date: string; subject_id: string }) => Promise<void>;
  deleteAssignment: (id: string) => Promise<void>;
  upsertStudyTask: (task: Partial<StudyTask> & { title: string; target_date: string; subject_id: string }) => Promise<void>;
  toggleStudyTask: (id: string) => Promise<void>;
  deleteStudyTask: (id: string) => Promise<void>;
  updateSemesterResult: (id: string, updates: Partial<SemesterResult>) => Promise<void>;
  addSemesterResult: (sem: Omit<SemesterResult, 'id' | 'user_id'>) => Promise<void>;
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
  getEntriesForSpecificDate: (dateStr: string) => {
    entries: EnrichedTimetableEntry[];
    isHoliday: boolean;
    holidayReason?: string;
    isSpecialDay: boolean;
    override?: DayOverride;
  };
  refreshData: () => Promise<void>;
}

const ErpContext = createContext<ErpContextType | undefined>(undefined);

export const ErpProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, profile, updateProfile } = useAuth();
  const { showToast } = useNotification();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [timetableEntries, setTimetableEntries] = useState<TimetableEntry[]>([]);
  const [dayOverrides, setDayOverrides] = useState<DayOverride[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [semesterResults, setSemesterResults] = useState<SemesterResult[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [studyTasks, setStudyTasks] = useState<StudyTask[]>([]);
  const [notifications, setNotifications] = useState<ERPNotification[]>([]);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Live timer (updates every second)
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Selected Group: derived from profile or fallback
  const activeGroup: GroupType = profile?.selected_group || 1;

  // Load all data
  const loadData = useCallback(async () => {
    if (!user) {
      setIsLoadingData(false);
      return;
    }
    try {
      db.setUserId(user.id);
      const [
        loadedSubjects,
        loadedTimetable,
        loadedOverrides,
        loadedAttendance,
        loadedSemesters,
        loadedExams,
        loadedAssignments,
        loadedTasks,
        loadedNotifications,
        loadedSettings,
      ] = await Promise.all([
        db.getSubjects(),
        db.getTimetableEntries(),
        db.getDayOverrides(),
        db.getAttendanceRecords(),
        db.getSemesterResults(),
        db.getExams(),
        db.getAssignments(),
        db.getStudyTasks(),
        db.getNotifications(),
        db.getSettings(),
      ]);

      setSubjects(loadedSubjects);
      setTimetableEntries(loadedTimetable);
      setDayOverrides(loadedOverrides);
      setAttendanceRecords(loadedAttendance);
      setSemesterResults(loadedSemesters);
      setExams(loadedExams);
      setAssignments(loadedAssignments);
      setStudyTasks(loadedTasks);
      setNotifications(loadedNotifications);
      setSettings(loadedSettings);
    } catch (err) {
      console.error('Failed to load ERP dataset:', err);
      showToast('error', 'Sync Error', 'Failed to load cloud academic records.');
    } finally {
      setIsLoadingData(false);
    }
  }, [user, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Derived: Attendance Stats per subject
  const attendanceThreshold = settings?.attendance_threshold || DEFAULT_THRESHOLD;
  const attendanceStats: SubjectAttendanceStats[] = useMemo(() => {
    return subjects.map((subj) =>
      computeSubjectAttendanceStats(subj, attendanceRecords, attendanceThreshold)
    );
  }, [subjects, attendanceRecords, attendanceThreshold]);

  // Derived: Overall Attendance
  const overallAttendance = useMemo(() => {
    return computeOverallAttendance(attendanceStats);
  }, [attendanceStats]);

  // Derived: Current & Next Class status in Asia/Kolkata
  const currentClassStatus = useMemo(() => {
    return getCurrentClassStatus(timetableEntries, dayOverrides, activeGroup, subjects, now);
  }, [timetableEntries, dayOverrides, activeGroup, subjects, now]);

  // Derived: Exam Countdown (Target: 8 Dec 2026)
  const examCountdown = useMemo(() => {
    return getExamCountdown(undefined, now);
  }, [now]);

  // Action: Switch Group
  const switchGroup = async (group: GroupType) => {
    await updateProfile({ selected_group: group });
    showToast('success', 'Group Switched', `Switched active timetable to Group ${group}.`);
  };

  // Action: Mark Attendance
  const markAttendance = async (
    subjectId: string,
    date: string,
    slotStart: string,
    status: 'Present' | 'Absent' | 'Not Marked',
    note?: string
  ) => {
    try {
      const updated = await db.upsertAttendanceRecord({
        subject_id: subjectId,
        date,
        slot_start: slotStart,
        status,
        note,
      });
      setAttendanceRecords(updated);
      const subj = subjects.find((s) => s.id === subjectId || s.code === subjectId || s.short_name === subjectId);
      showToast('success', 'Attendance Marked', `${subj?.short_name || 'Subject'}: Marked as ${status}`);
    } catch (err: any) {
      console.error('[markAttendance] Error saving attendance:', err);
      showToast('error', 'Attendance Save Failed', err.message || 'Failed to record attendance');
      throw err;
    }
  };

  const deleteAttendanceRecord = async (id: string) => {
    try {
      const updated = await db.deleteAttendanceRecord(id);
      setAttendanceRecords(updated);
      showToast('info', 'Record Removed', 'Attendance record was deleted.');
    } catch (err: any) {
      console.error('[deleteAttendanceRecord] Error:', err);
      showToast('error', 'Delete Failed', err.message || 'Failed to remove record');
      throw err;
    }
  };

  const deleteAttendanceRecordBySlot = async (subjectId: string, date: string, slotStart: string) => {
    try {
      const updated = await db.deleteAttendanceRecordBySlot(subjectId, date, slotStart);
      setAttendanceRecords(updated);
      const subj = subjects.find((s) => s.id === subjectId || s.code === subjectId || s.short_name === subjectId);
      showToast('info', 'Attendance Cleared', `${subj?.short_name || 'Slot'}: Attendance mark cleared.`);
    } catch (err: any) {
      console.error('[deleteAttendanceRecordBySlot] Error:', err);
      showToast('error', 'Clear Failed', err.message || 'Failed to clear record');
      throw err;
    }
  };

  // Action: Day Overrides
  const setDayOverride = async (override: Omit<DayOverride, 'id' | 'user_id'>) => {
    try {
      const updated = await db.setDayOverride(override);
      setDayOverrides(updated);
      showToast('success', 'Special Day Scheduled', `Timetable override configured for ${override.date}.`);
    } catch (err: any) {
      showToast('error', 'Error', err.message || 'Failed to save day override');
    }
  };

  const deleteDayOverride = async (date: string) => {
    try {
      const updated = await db.deleteDayOverride(date);
      setDayOverrides(updated);
      showToast('info', 'Override Removed', `Restored standard schedule for ${date}.`);
    } catch (err: any) {
      showToast('error', 'Error', err.message || 'Failed to remove day override');
    }
  };

  const updateSubject = async (id: string, updates: Partial<Subject>) => {
    const updated = await db.updateSubject(id, updates);
    setSubjects(updated);
    showToast('success', 'Subject Updated', 'Changes saved successfully.');
  };

  const updateTimetableEntry = async (id: string, updates: Partial<TimetableEntry>) => {
    const updated = await db.updateTimetableEntry(id, updates);
    setTimetableEntries(updated);
    showToast('success', 'Timetable Updated', 'Class details saved.');
  };

  const addTimetableEntry = async (entry: Omit<TimetableEntry, 'id' | 'user_id'>) => {
    const updated = await db.addTimetableEntry(entry);
    setTimetableEntries(updated);
    showToast('success', 'Class Added', 'New slot scheduled in timetable.');
  };

  const deleteTimetableEntry = async (id: string) => {
    const updated = await db.deleteTimetableEntry(id);
    setTimetableEntries(updated);
    showToast('info', 'Class Removed', 'Slot deleted from timetable.');
  };

  const upsertExam = async (exam: Partial<Exam> & { exam_name: string; exam_date: string; subject_id: string }) => {
    const updated = await db.upsertExam(exam);
    setExams(updated);
    showToast('success', 'Examination Saved', 'Schedule and preparation tracker updated.');
  };

  const deleteExam = async (id: string) => {
    const updated = await db.deleteExam(id);
    setExams(updated);
    showToast('info', 'Exam Removed', 'Exam record deleted.');
  };

  const upsertAssignment = async (assign: Partial<Assignment> & { title: string; due_date: string; subject_id: string }) => {
    const updated = await db.upsertAssignment(assign);
    setAssignments(updated);
    showToast('success', 'Assignment Saved', 'Assignment details updated.');
  };

  const deleteAssignment = async (id: string) => {
    const updated = await db.deleteAssignment(id);
    setAssignments(updated);
    showToast('info', 'Assignment Removed', 'Assignment deleted.');
  };

  const upsertStudyTask = async (task: Partial<StudyTask> & { title: string; target_date: string; subject_id: string }) => {
    const updated = await db.upsertStudyTask(task);
    setStudyTasks(updated);
    showToast('success', 'Study Task Saved', 'Task added to revision plan.');
  };

  const toggleStudyTask = async (id: string) => {
    const task = studyTasks.find((t) => t.id === id);
    if (!task) return;
    const updated = await db.upsertStudyTask({ ...task, is_completed: !task.is_completed });
    setStudyTasks(updated);
  };

  const deleteStudyTask = async (id: string) => {
    const updated = await db.deleteStudyTask(id);
    setStudyTasks(updated);
    showToast('info', 'Task Removed', 'Study planner item deleted.');
  };

  const updateSemesterResult = async (id: string, updates: Partial<SemesterResult>) => {
    const updated = await db.updateSemesterResult(id, updates);
    setSemesterResults(updated);
    showToast('success', 'Academics Updated', 'Semester performance record updated.');
  };

  const addSemesterResult = async (sem: Omit<SemesterResult, 'id' | 'user_id'>) => {
    const updated = await db.addSemesterResult(sem);
    setSemesterResults(updated);
    showToast('success', 'Semester Added', `Semester ${sem.semester_number} record created.`);
  };

  const updateSettings = async (updates: Partial<UserSettings>) => {
    const updated = await db.updateSettings(updates);
    setSettings(updated);
    showToast('success', 'Preferences Saved', 'ERP settings updated.');
  };

  const getEntriesForSpecificDate = (dateStr: string) => {
    return getEntriesForDate(dateStr, timetableEntries, dayOverrides, activeGroup, subjects);
  };

  return (
    <ErpContext.Provider
      value={{
        subjects,
        timetableEntries,
        dayOverrides,
        attendanceRecords,
        semesterResults,
        exams,
        assignments,
        studyTasks,
        notifications,
        settings,
        now,
        activeGroup,
        attendanceStats,
        overallAttendance,
        currentClassStatus,
        examCountdown,
        isLoadingData,
        switchGroup,
        markAttendance,
        deleteAttendanceRecord,
        deleteAttendanceRecordBySlot,
        setDayOverride,
        deleteDayOverride,
        updateSubject,
        updateTimetableEntry,
        addTimetableEntry,
        deleteTimetableEntry,
        upsertExam,
        deleteExam,
        upsertAssignment,
        deleteAssignment,
        upsertStudyTask,
        toggleStudyTask,
        deleteStudyTask,
        updateSemesterResult,
        addSemesterResult,
        updateSettings,
        getEntriesForSpecificDate,
        refreshData: loadData,
      }}
    >
      {children}
    </ErpContext.Provider>
  );
};

export const useErp = () => {
  const context = useContext(ErpContext);
  if (!context) {
    throw new Error('useErp must be used within an ErpProvider');
  }
  return context;
};

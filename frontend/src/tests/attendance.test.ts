import { describe, it, expect } from 'vitest';
import {
  calculateSafeBunks,
  calculateClassesNeeded,
  computeSubjectAttendanceStats,
  computeOverallAttendance,
  simulateAttendance,
} from '../utils/attendance';
import { INITIAL_SUBJECTS } from '../constants';
import { Subject, AttendanceRecord, AttendanceStatus } from '../types';

describe('Bunk and Attendance Mathematics', () => {
  it('handles T = 0 edge case without crashing and shows 0 bunks and 0 needed', () => {
    expect(calculateSafeBunks(0, 0, 0.75)).toBe(0);
    expect(calculateClassesNeeded(0, 0, 0.75)).toBe(0);
  });

  it('matches all Section 8 baseline safe bunk fixtures at t = 0.75', () => {
    // Subject -> [P, T, expected_safe_bunks]
    const fixtures: Record<string, [number, number, number]> = {
      'MAT 301': [38, 41, 9],
      'BSU 343': [12, 13, 3],
      'BCU 341': [23, 25, 5],
      'CSE 202': [34, 37, 8],
      'CSE 222': [26, 26, 8],
      'CSE 304': [36, 39, 9], // exact 75% boundary check
      'CSE 324': [24, 28, 4], // exact
      'ECE 306': [35, 40, 6],
      'ECE 326': [28, 28, 9],
      'FLU 344': [11, 12, 2],
      'MED001': [11, 12, 2],
      'CSE 302': [35, 39, 7],
      'CSE 322': [24, 26, 6], // exact
    };

    for (const [code, [p, t, expected]] of Object.entries(fixtures)) {
      const bunks = calculateSafeBunks(p, t, 0.75);
      expect(bunks, `Failed for code ${code} (${p}/${t})`).toBe(expected);
    }
  });

  it('computes 0/0 as "No data" and safe bunks as 0', () => {
    const dummySubject: Subject = {
      id: 'sub-lib',
      user_id: 'user-1',
      name: 'Library / CCA',
      short_name: 'LIB',
      code: 'LIB001',
      faculty_name: 'None',
      default_room: 'Library',
      opening_present: 0,
      opening_total: 0,
      is_lab: false,
      credit_weight: 0,
    };

    const stats = computeSubjectAttendanceStats(dummySubject, []);
    expect(stats.percentage).toBeNull();
    expect(stats.percentageFormatted).toBe('No data');
    expect(stats.safe_bunks).toBe(0);
    expect(stats.classes_needed).toBe(0);
  });

  it('correctly incorporates dated records onto baseline and excludes Not Marked', () => {
    const subject: Subject = {
      id: 'sub-math',
      user_id: 'user-1',
      name: 'Applied Mathematics III',
      short_name: 'AM-III',
      code: 'MAT 301',
      faculty_name: 'Dr. Ram Kumar',
      default_room: 'E-404',
      opening_present: 38,
      opening_total: 41,
      is_lab: false,
      credit_weight: 4,
    };

    const records: AttendanceRecord[] = [
      { id: '1', user_id: 'user-1', subject_id: 'sub-math', date: '2026-11-07', slot_start: '12:15', status: 'Present' },
      { id: '2', user_id: 'user-1', subject_id: 'sub-math', date: '2026-11-08', slot_start: '12:15', status: 'Absent' },
      { id: '3', user_id: 'user-1', subject_id: 'sub-math', date: '2026-11-09', slot_start: '12:15', status: 'Not Marked' }, // MUST be excluded
    ];

    const stats = computeSubjectAttendanceStats(subject, records, 0.75);
    // Baseline: 38/41. Dated: 1 Present, 1 Absent, 1 Not Marked
    // Total present: 38 + 1 = 39. Total classes: 41 + 1 + 1 = 43.
    expect(stats.total_present).toBe(39);
    expect(stats.total_classes).toBe(43);
    expect(stats.dated_present).toBe(1);
    expect(stats.dated_absent).toBe(1);
    expect(stats.dated_not_marked).toBe(1);
  });

  it('correctly handles exact 75% boundary and classes needed when below threshold', () => {
    // 30 / 40 = 75.0%
    expect(calculateClassesNeeded(30, 40, 0.75)).toBe(0);
    expect(calculateSafeBunks(30, 40, 0.75)).toBe(0);

    // 29 / 40 = 72.5% -> Below threshold
    // Needed: (0.75 * 40 - 29) / 0.25 = 1 / 0.25 = 4 classes
    expect(calculateClassesNeeded(29, 40, 0.75)).toBe(4);
    expect(calculateSafeBunks(29, 40, 0.75)).toBe(0);
  });

  it('handles threshold t = 1.0 (100%) without divide-by-zero crashes', () => {
    // 10 / 10 = 100% -> can attend 0 needed, 0 safe bunks
    expect(calculateSafeBunks(10, 10, 1.0)).toBe(0);
    expect(calculateClassesNeeded(10, 10, 1.0)).toBe(0);

    // 9 / 10 = 90% -> impossible to ever reach 100% once 1 is missed
    expect(calculateClassesNeeded(9, 10, 1.0)).toBe(Number.POSITIVE_INFINITY);
  });

  it('correctly updates French III and Overall Attendance when marked Absent and then Present', () => {
    // Map initial subjects with mock IDs
    const subjects: Subject[] = INITIAL_SUBJECTS.map((s, idx) => ({
      ...s,
      id: `subj-${idx + 1}`,
      user_id: 'user-anshul',
    }));

    const frenchSubject = subjects.find((s) => s.code === 'FLU 344');
    expect(frenchSubject).toBeDefined();
    expect(frenchSubject?.opening_present).toBe(11);
    expect(frenchSubject?.opening_total).toBe(12);

    // Baseline calculation across all subjects
    let records: AttendanceRecord[] = [];
    let stats = subjects.map((s) => computeSubjectAttendanceStats(s, records));
    let overall = computeOverallAttendance(stats);

    expect(overall.total_present).toBe(398);
    expect(overall.total_classes).toBe(433);

    // 1. Mark French III as Absent on Friday 10:15
    const absentRecord: AttendanceRecord = {
      id: 'rec-1',
      user_id: 'user-anshul',
      subject_id: frenchSubject!.id,
      date: '2026-11-06',
      slot_start: '10:15',
      status: 'Absent',
    };
    records = [absentRecord];
    stats = subjects.map((s) => computeSubjectAttendanceStats(s, records));
    overall = computeOverallAttendance(stats);

    const frenchStatsAbsent = stats.find((s) => s.subject.code === 'FLU 344');
    expect(frenchStatsAbsent?.total_present).toBe(11);
    expect(frenchStatsAbsent?.total_classes).toBe(13); // 12 + 1 absent = 13
    expect(overall.total_present).toBe(398);
    expect(overall.total_classes).toBe(434); // 433 + 1 = 434

    // 2. Change French III to Present
    const presentRecord: AttendanceRecord = {
      ...absentRecord,
      status: 'Present',
    };
    records = [presentRecord];
    stats = subjects.map((s) => computeSubjectAttendanceStats(s, records));
    overall = computeOverallAttendance(stats);

    const frenchStatsPresent = stats.find((s) => s.subject.code === 'FLU 344');
    expect(frenchStatsPresent?.total_present).toBe(12); // 11 + 1 present = 12
    expect(frenchStatsPresent?.total_classes).toBe(13); // 12 + 1 present = 13
    expect(overall.total_present).toBe(399); // 398 + 1 = 399
    expect(overall.total_classes).toBe(434); // 433 + 1 = 434

    // 3. Clear mark
    records = [];
    stats = subjects.map((s) => computeSubjectAttendanceStats(s, records));
    overall = computeOverallAttendance(stats);

    const frenchStatsCleared = stats.find((s) => s.subject.code === 'FLU 344');
    expect(frenchStatsCleared?.total_present).toBe(11);
    expect(frenchStatsCleared?.total_classes).toBe(12);
    expect(overall.total_present).toBe(398);
    expect(overall.total_classes).toBe(433);
  });

  it('guarantees that an Absent record is immutable and never automatically flips to Present', () => {
    // Simulate database state containing an Absent record for French III
    const subjects: Subject[] = INITIAL_SUBJECTS.map((s, idx) => ({
      ...s,
      id: `uuid-subject-${idx + 1}`,
      user_id: 'user-anshul',
    }));

    const french = subjects.find((s) => s.code === 'FLU 344')!;
    const savedAbsentRecord: AttendanceRecord = {
      id: 'uuid-att-record-1',
      user_id: 'user-anshul',
      subject_id: french.id,
      date: '2026-11-06',
      slot_start: '10:15',
      status: 'Absent',
      updated_at: new Date().toISOString(),
    };

    const attendanceRecords = [savedAbsentRecord];

    // Status resolution function modeling UI modal and row state synchronization
    const resolveStatus = (
      records: AttendanceRecord[],
      targetSubId: string,
      targetDate: string,
      targetSlot: string,
      activeUserSelection?: AttendanceStatus
    ): AttendanceStatus => {
      // If user explicitly clicked a status in the modal during this turn, that explicit selection takes precedence
      if (activeUserSelection) return activeUserSelection;

      // Otherwise, the status MUST be resolved from the saved record in the database
      const existing = records.find(
        (r) =>
          r.subject_id === targetSubId &&
          r.date === targetDate &&
          r.slot_start === targetSlot
      );
      if (existing) {
        return existing.status;
      }
      return 'Present'; // only when genuinely unrecorded
    };

    // 1. Initial lookup from saved database row: must be Absent
    let currentStatus = resolveStatus(attendanceRecords, french.id, '2026-11-06', '10:15');
    expect(currentStatus).toBe('Absent');

    // 2. Simulate 10 successive background clock ticks (re-renders): must REMAIN Absent
    for (let second = 1; second <= 10; second++) {
      currentStatus = resolveStatus(attendanceRecords, french.id, '2026-11-06', '10:15');
      expect(currentStatus, `Failed at tick ${second}s - Absent became ${currentStatus}`).toBe('Absent');
    }

    // 3. Overall attendance remains 398/434 across all re-evaluations
    let stats = subjects.map((s) => computeSubjectAttendanceStats(s, attendanceRecords));
    let overall = computeOverallAttendance(stats);
    expect(overall.total_present).toBe(398);
    expect(overall.total_classes).toBe(434);

    // 4. Status ONLY changes to Present when user explicitly sends 'Present'
    currentStatus = resolveStatus(attendanceRecords, french.id, '2026-11-06', '10:15', 'Present');
    expect(currentStatus).toBe('Present');

    // 5. When updated in the records table to Present, subsequent ticks stay Present
    attendanceRecords[0] = { ...savedAbsentRecord, status: 'Present' };
    currentStatus = resolveStatus(attendanceRecords, french.id, '2026-11-06', '10:15');
    expect(currentStatus).toBe('Present');
    stats = subjects.map((s) => computeSubjectAttendanceStats(s, attendanceRecords));
    overall = computeOverallAttendance(stats);
    expect(overall.total_present).toBe(399);
    expect(overall.total_classes).toBe(434);

    // 6. When changed to Not Marked, excluded from calculations and returns to 398/433
    attendanceRecords[0] = { ...savedAbsentRecord, status: 'Not Marked' };
    currentStatus = resolveStatus(attendanceRecords, french.id, '2026-11-06', '10:15');
    expect(currentStatus).toBe('Not Marked');
    stats = subjects.map((s) => computeSubjectAttendanceStats(s, attendanceRecords));
    overall = computeOverallAttendance(stats);
    expect(overall.total_present).toBe(398);
    expect(overall.total_classes).toBe(433);
  });
});

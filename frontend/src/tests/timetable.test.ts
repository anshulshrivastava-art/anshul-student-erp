import { describe, it, expect } from 'vitest';
import {
  getEntriesForDate,
  getCurrentClassStatus,
  formatTimeRange,
} from '../utils/timetable';
import { TimetableEntry, DayOverride, Subject } from '../types';
import { TIMETABLE_SEEDS, INITIAL_SUBJECTS } from '../constants';

const mockSubjects: Subject[] = INITIAL_SUBJECTS.map((s, idx) => ({
  ...s,
  id: `sub-${idx}`,
  user_id: 'user-1',
}));

const mockEntries: TimetableEntry[] = TIMETABLE_SEEDS.map((s, idx) => {
  const matchingSub = mockSubjects.find((sub) => sub.code === s.subject_code);
  return {
    id: `entry-${idx}`,
    user_id: 'user-1',
    subject_id: matchingSub ? matchingSub.id : 'sub-break',
    day_of_week: s.day_of_week,
    start_time: s.start_time,
    end_time: s.end_time,
    room: s.room,
    group_target: s.group_target,
    is_lab: s.is_lab,
    is_break: s.is_break,
    custom_label: s.custom_label,
  };
});

describe('Timetable Logic & Edge Cases', () => {
  it('formats time ranges as 12-hour AM/PM and never bare period numbers', () => {
    expect(formatTimeRange('09:15', '10:10')).toBe('09:15 AM – 10:10 AM');
    expect(formatTimeRange('13:15', '14:10')).toBe('01:15 PM – 02:10 PM');
    expect(formatTimeRange('15:15', '17:10')).toBe('03:15 PM – 05:10 PM');
  });

  it('filters Group 1 vs Group 2 correctly on Monday afternoon lab block', () => {
    // 2026-11-09 is a Monday
    const mondayDate = '2026-11-09';
    const group1Res = getEntriesForDate(mondayDate, mockEntries, [], 1, mockSubjects);
    const group2Res = getEntriesForDate(mondayDate, mockEntries, [], 2, mockSubjects);

    // Monday 15:15-17:10: Group 1 has DELD LAB (ECE 326) in E-315
    const g1Lab = group1Res.entries.find((e) => e.start_time === '15:15');
    expect(g1Lab).toBeDefined();
    expect(g1Lab?.subject?.code).toBe('ECE 326');
    expect(g1Lab?.room).toBe('E-315');

    // Monday 15:15-17:10: Group 2 has Python LAB (CSE 322) in E-215
    const g2Lab = group2Res.entries.find((e) => e.start_time === '15:15');
    expect(g2Lab).toBeDefined();
    expect(g2Lab?.subject?.code).toBe('CSE 322');
    expect(g2Lab?.room).toBe('E-215');
  });

  it('Saturday without an override stays a holiday', () => {
    // 2026-11-07 is a Saturday
    const saturday = '2026-11-07';
    const res = getEntriesForDate(saturday, mockEntries, [], 1, mockSubjects);
    expect(res.isHoliday).toBe(true);
    expect(res.entries.length).toBe(0);
    expect(res.holidayReason).toContain('Saturday');
  });

  it('Saturday with working_follows_day shows chosen weekday classes for Group 1 and Group 2', () => {
    const saturday = '2026-11-07';
    const override: DayOverride = {
      id: 'ov-1',
      user_id: 'user-1',
      date: saturday,
      type: 'working_follows_day',
      follows_weekday: 4, // Follows Thursday timetable
      note: 'Extra working day following Thursday timetable',
    };

    const g1Res = getEntriesForDate(saturday, mockEntries, [override], 1, mockSubjects);
    const g2Res = getEntriesForDate(saturday, mockEntries, [override], 2, mockSubjects);

    expect(g1Res.isHoliday).toBe(false);
    expect(g1Res.isSpecialDay).toBe(true);
    // Thursday has 8 classes including lunch break
    expect(g1Res.entries.length).toBeGreaterThan(0);
    // Last entry on Thursday is BCU 341 (Communication Skills III)
    expect(g1Res.entries[g1Res.entries.length - 1].subject?.code).toBe('BCU 341');
    expect(g2Res.entries[g2Res.entries.length - 1].subject?.code).toBe('BCU 341');
  });

  it('Weekday holiday override shows no classes and marks as holiday', () => {
    // 2026-11-11 is a Wednesday
    const wednesday = '2026-11-11';
    const override: DayOverride = {
      id: 'ov-holiday',
      user_id: 'user-1',
      date: wednesday,
      type: 'holiday',
      note: 'Diwali Break Holiday',
    };

    const res = getEntriesForDate(wednesday, mockEntries, [override], 1, mockSubjects);
    expect(res.isHoliday).toBe(true);
    expect(res.entries.length).toBe(0);
    expect(res.holidayReason).toBe('Diwali Break Holiday');
  });

  it('Custom day shows only its own entries', () => {
    const customDate = '2026-11-14'; // Saturday
    const customOverride: DayOverride = {
      id: 'ov-custom',
      user_id: 'user-1',
      date: customDate,
      type: 'custom',
      note: 'Remedial session day',
    };

    const customEntry: TimetableEntry = {
      id: 'custom-entry-1',
      user_id: 'user-1',
      subject_id: mockSubjects[0].id,
      day_of_week: 6,
      start_time: '10:00',
      end_time: '12:00',
      room: 'Auditorium',
      group_target: 'all',
      is_lab: false,
      specific_date: customDate,
    };

    const res = getEntriesForDate(
      customDate,
      [...mockEntries, customEntry],
      [customOverride],
      1,
      mockSubjects
    );

    expect(res.isHoliday).toBe(false);
    expect(res.entries.length).toBe(1);
    expect(res.entries[0].room).toBe('Auditorium');
  });

  it('Current class, lunch break, and next class detection in Asia/Kolkata', () => {
    // Let's test on Monday 2026-11-09 at 13:30 (during Lunch Break: 13:15–14:10)
    const testTime = new Date('2026-11-09T13:30:00+05:30');
    const status = getCurrentClassStatus(mockEntries, [], 1, mockSubjects, testTime);

    expect(status.isLunchBreak).toBe(true);
    expect(status.currentClass?.is_break).toBe(true);
    // Next class at 14:15 is CSE Specialization
    expect(status.nextClass?.start_time).toBe('14:15');
    // Minutes from 13:30 to 14:15 = 45 minutes
    expect(status.minutesUntilNext).toBe(45);
  });
});

import { formatInTimeZone } from 'date-fns-tz';
import { TimetableEntry, DayOverride, GroupType, Subject } from '../types';
import { ASIA_KOLKATA_TZ } from '../constants';

export interface EnrichedTimetableEntry extends TimetableEntry {
  subject?: Subject;
  timeRangeLabel: string;
}

/**
 * Converts 24-hr time string "HH:mm" to 12-hr formatted string "hh:mm AM/PM"
 */
export function formatTimeRange(startTime: string, endTime: string): string {
  const formatSingle = (timeStr: string) => {
    const [hStr, mStr] = timeStr.split(':');
    const h = parseInt(hStr, 10);
    const m = mStr;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    const paddedH = displayH < 10 ? `0${displayH}` : `${displayH}`;
    return `${paddedH}:${m} ${ampm}`;
  };

  return `${formatSingle(startTime)} – ${formatSingle(endTime)}`;
}

/**
 * Resolves the active timetable entries for a specific date considering day overrides and selected group
 */
export function getEntriesForDate(
  dateStr: string, // YYYY-MM-DD
  allEntries: TimetableEntry[],
  overrides: DayOverride[],
  selectedGroup: GroupType,
  subjects: Subject[]
): {
  entries: EnrichedTimetableEntry[];
  isHoliday: boolean;
  holidayReason?: string;
  isSpecialDay: boolean;
  override?: DayOverride;
} {
  // Parse date to check day of week in Asia/Kolkata
  // Append noon time to avoid UTC day boundary issues
  const dateObj = new Date(`${dateStr}T12:00:00+05:30`);
  const dayOfWeekStr = formatInTimeZone(dateObj, ASIA_KOLKATA_TZ, 'i'); // 1 = Monday, ..., 7 = Sunday
  const dayOfWeek = parseInt(dayOfWeekStr, 10);

  // Check for day override
  const override = overrides.find((o) => o.date === dateStr);

  if (override) {
    if (override.type === 'holiday') {
      return {
        entries: [],
        isHoliday: true,
        holidayReason: override.note || 'Scheduled Holiday',
        isSpecialDay: true,
        override,
      };
    }

    if (override.type === 'working_follows_day' && override.follows_weekday) {
      const targetDay = override.follows_weekday;
      const filtered = allEntries
        .filter(
          (e) =>
            !e.specific_date &&
            e.day_of_week === targetDay &&
            (e.group_target === 'all' || e.group_target === String(selectedGroup))
        )
        .sort((a, b) => a.start_time.localeCompare(b.start_time));

      const enriched = enrichEntries(filtered, subjects);
      return {
        entries: enriched,
        isHoliday: false,
        isSpecialDay: true,
        override,
      };
    }

    if (override.type === 'custom') {
      const customEntries = allEntries
        .filter(
          (e) =>
            e.specific_date === dateStr &&
            (e.group_target === 'all' || e.group_target === String(selectedGroup))
        )
        .sort((a, b) => a.start_time.localeCompare(b.start_time));

      const enriched = enrichEntries(customEntries, subjects);
      return {
        entries: enriched,
        isHoliday: customEntries.length === 0,
        holidayReason: customEntries.length === 0 ? 'No custom classes scheduled' : undefined,
        isSpecialDay: true,
        override,
      };
    }
  }

  // No override: Saturday (6) and Sunday (7) are holidays
  if (dayOfWeek === 6 || dayOfWeek === 7) {
    return {
      entries: [],
      isHoliday: true,
      holidayReason: dayOfWeek === 6 ? 'Saturday — Weekend' : 'Sunday — Weekend',
      isSpecialDay: false,
    };
  }

  // Standard Weekday (1 to 5)
  const weekdayEntries = allEntries
    .filter(
      (e) =>
        !e.specific_date &&
        e.day_of_week === dayOfWeek &&
        (e.group_target === 'all' || e.group_target === String(selectedGroup))
    )
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  return {
    entries: enrichEntries(weekdayEntries, subjects),
    isHoliday: false,
    isSpecialDay: false,
  };
}

/**
 * Attaches subject details and formatted time range to timetable entries
 */
export function enrichEntries(entries: TimetableEntry[], subjects: Subject[]): EnrichedTimetableEntry[] {
  return entries.map((e) => {
    // 1. Direct ID match
    let subject = subjects.find((s) => s.id === e.subject_id);

    // 2. Mock 'subj-X' index fallback if timetable was loaded from seed but subjects from Supabase
    if (!subject && e.subject_id && e.subject_id.startsWith('subj-')) {
      const idx = parseInt(e.subject_id.replace('subj-', ''), 10) - 1;
      if (idx >= 0 && idx < subjects.length) {
        subject = subjects[idx];
      }
    }

    // 3. Fallback match by subject code or short_name or custom_label
    if (!subject) {
      subject = subjects.find(
        (s) =>
          (e.subject_id && s.code.toLowerCase() === e.subject_id.toLowerCase()) ||
          (e.subject_id && s.short_name.toLowerCase() === e.subject_id.toLowerCase()) ||
          (e.custom_label && s.name.toLowerCase() === e.custom_label.toLowerCase()) ||
          (e.custom_label && s.short_name.toLowerCase() === e.custom_label.toLowerCase())
      );
    }

    const resolvedSubjectId = subject ? subject.id : e.subject_id;

    return {
      ...e,
      subject_id: resolvedSubjectId,
      subject,
      timeRangeLabel: formatTimeRange(e.start_time, e.end_time),
    };
  });
}

export interface CurrentClassStatus {
  currentClass: EnrichedTimetableEntry | null;
  nextClass: EnrichedTimetableEntry | null;
  isLunchBreak: boolean;
  minutesUntilNext: number | null;
  isHoliday: boolean;
  holidayReason?: string;
  isDayFinished: boolean;
  dateStr: string;
  currentTimeStr: string;
}

/**
 * Determines current class, next class, and countdown at any moment in Asia/Kolkata
 */
export function getCurrentClassStatus(
  allEntries: TimetableEntry[],
  overrides: DayOverride[],
  selectedGroup: GroupType,
  subjects: Subject[],
  currentTimeZoneDate: Date = new Date()
): CurrentClassStatus {
  const dateStr = formatInTimeZone(currentTimeZoneDate, ASIA_KOLKATA_TZ, 'yyyy-MM-dd');
  const currentTimeStr = formatInTimeZone(currentTimeZoneDate, ASIA_KOLKATA_TZ, 'HH:mm');

  const { entries, isHoliday, holidayReason } = getEntriesForDate(
    dateStr,
    allEntries,
    overrides,
    selectedGroup,
    subjects
  );

  if (isHoliday || entries.length === 0) {
    return {
      currentClass: null,
      nextClass: null,
      isLunchBreak: false,
      minutesUntilNext: null,
      isHoliday: true,
      holidayReason: holidayReason || 'No classes scheduled today',
      isDayFinished: false,
      dateStr,
      currentTimeStr,
    };
  }

  // Find active current class (inclusive start, exclusive end)
  const currentClass =
    entries.find((e) => currentTimeStr >= e.start_time && currentTimeStr < e.end_time) || null;

  // Find next upcoming class
  const upcomingEntries = entries.filter((e) => e.start_time > currentTimeStr);
  const nextClass = upcomingEntries.length > 0 ? upcomingEntries[0] : null;

  const isLunchBreak = currentClass?.is_break === true || currentClass?.custom_label?.toLowerCase().includes('lunch') === true;

  // Calculate minutes until next class
  let minutesUntilNext: number | null = null;
  if (nextClass) {
    const [curH, curM] = currentTimeStr.split(':').map(Number);
    const [nextH, nextM] = nextClass.start_time.split(':').map(Number);
    minutesUntilNext = (nextH * 60 + nextM) - (curH * 60 + curM);
  }

  const isDayFinished = !currentClass && !nextClass && entries.length > 0 && currentTimeStr >= entries[entries.length - 1].end_time;

  return {
    currentClass,
    nextClass,
    isLunchBreak,
    minutesUntilNext,
    isHoliday: false,
    isDayFinished,
    dateStr,
    currentTimeStr,
  };
}

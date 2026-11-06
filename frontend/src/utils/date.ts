import { formatInTimeZone } from 'date-fns-tz';
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns';
import { ASIA_KOLKATA_TZ, EXAM_COUNTDOWN_TARGET } from '../constants';

/**
 * Returns current Date adjusted to Asia/Kolkata representation
 */
export function getKolkataNow(): Date {
  const now = new Date();
  // Formats to ISO string at Asia/Kolkata, then parse back to a Date object representing that clock time
  const kolkataStr = formatInTimeZone(now, ASIA_KOLKATA_TZ, "yyyy-MM-dd'T'HH:mm:ssXXX");
  return new Date(kolkataStr);
}

/**
 * Formats a date string or Date in Asia/Kolkata
 */
export function formatKolkata(date: Date | string | number, formatStr: string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatInTimeZone(d, ASIA_KOLKATA_TZ, formatStr);
}

/**
 * Returns greeting based on Asia/Kolkata hour
 */
export function getGreeting(): string {
  const hour = parseInt(formatKolkata(new Date(), 'H'), 10);
  if (hour >= 4 && hour < 12) return 'Good Morning';
  if (hour >= 12 && hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export interface ExamCountdown {
  totalSeconds: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
  formattedText: string;
}

/**
 * Calculates countdown to exam date (2026-12-08T00:00:00+05:30) in Asia/Kolkata
 */
export function getExamCountdown(
  targetIso: string = EXAM_COUNTDOWN_TARGET,
  now: Date = new Date()
): ExamCountdown {
  const targetDate = new Date(targetIso);
  const diffSec = differenceInSeconds(targetDate, now);

  if (diffSec <= 0) {
    return {
      totalSeconds: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isPast: true,
      formattedText: 'Examinations are underway!',
    };
  }

  const days = differenceInDays(targetDate, now);
  const hours = differenceInHours(targetDate, now) % 24;
  const minutes = differenceInMinutes(targetDate, now) % 60;
  const seconds = diffSec % 60;

  return {
    totalSeconds: diffSec,
    days,
    hours,
    minutes,
    seconds,
    isPast: false,
    formattedText: `${days}d ${hours}h ${minutes}m ${seconds}s`,
  };
}

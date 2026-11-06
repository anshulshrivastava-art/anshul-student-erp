import { Subject, AttendanceRecord, SubjectAttendanceStats, AttendanceHealthStatus } from '../types';
import { ATTENDANCE_CUTOFFS, DEFAULT_THRESHOLD } from '../constants';

const EPSILON = 1e-9;

/**
 * Calculates safe bunks: how many consecutive classes can be missed while remaining >= threshold.
 * Formula: max(0, floor(P / t - T + EPSILON))
 */
export function calculateSafeBunks(
  present: number,
  total: number,
  threshold: number = DEFAULT_THRESHOLD
): number {
  if (total === 0 || threshold <= 0) return 0;
  if (threshold >= 1) {
    // If threshold is 100%, can only miss 0 classes if P == T
    return 0;
  }
  const ratio = present / total;
  if (ratio < threshold - EPSILON) return 0;
  const rawBunks = present / threshold - total;
  return Math.max(0, Math.floor(rawBunks + EPSILON));
}

/**
 * Calculates classes needed: how many consecutive classes must be attended to reach threshold.
 * Formula: max(0, ceil((t * T - P) / (1 - t) - EPSILON))
 */
export function calculateClassesNeeded(
  present: number,
  total: number,
  threshold: number = DEFAULT_THRESHOLD
): number {
  if (total === 0) return 0;
  if (threshold >= 1) {
    // If 100% threshold, if any class missed (present < total), 100% is mathematically impossible
    return present === total ? 0 : Number.POSITIVE_INFINITY;
  }
  const ratio = present / total;
  if (ratio >= threshold - EPSILON) return 0;
  const rawNeeded = (threshold * total - present) / (1 - threshold);
  return Math.max(0, Math.ceil(rawNeeded - EPSILON));
}

/**
 * Determines health status based on attendance percentage and threshold
 */
export function getAttendanceStatus(
  percentage: number | null,
  threshold: number = DEFAULT_THRESHOLD
): AttendanceHealthStatus {
  if (percentage === null) return 'Safe';
  const thresholdPct = threshold * 100;
  if (percentage < thresholdPct) return 'Critical';
  if (percentage < ATTENDANCE_CUTOFFS.SAFE_MIN) return 'Warning';
  return 'Safe';
}

/**
 * Computes full attendance stats for a subject combining opening baseline + dated records.
 * Excludes 'Not Marked' records from both present and total.
 */
export function computeSubjectAttendanceStats(
  subject: Subject,
  records: AttendanceRecord[],
  threshold: number = DEFAULT_THRESHOLD
): SubjectAttendanceStats {
  const subjectRecords = records.filter(
    (r) => r.subject_id === subject.id && r.status !== 'Not Marked'
  );

  const dated_present = subjectRecords.filter((r) => r.status === 'Present').length;
  const dated_absent = subjectRecords.filter((r) => r.status === 'Absent').length;
  const dated_not_marked = records.filter(
    (r) => r.subject_id === subject.id && r.status === 'Not Marked'
  ).length;

  const total_present = subject.opening_present + dated_present;
  const total_classes = subject.opening_total + dated_present + dated_absent;

  let percentage: number | null = null;
  let percentageFormatted = 'No data';
  let safe_bunks = 0;
  let classes_needed = 0;

  if (total_classes > 0) {
    percentage = (total_present / total_classes) * 100;
    percentageFormatted = `${percentage.toFixed(1)}%`;
    safe_bunks = calculateSafeBunks(total_present, total_classes, threshold);
    classes_needed = calculateClassesNeeded(total_present, total_classes, threshold);
  }

  const status = getAttendanceStatus(percentage, threshold);

  let statusMessage = 'No data available';
  if (total_classes > 0 && percentage !== null) {
    if (status === 'Critical') {
      statusMessage = `Need to attend ${classes_needed} consecutive ${classes_needed === 1 ? 'class' : 'classes'} to reach ${(threshold * 100).toFixed(0)}%`;
    } else if (status === 'Warning') {
      statusMessage = safe_bunks > 0 
        ? `Can safely miss ${safe_bunks} ${safe_bunks === 1 ? 'class' : 'classes'}`
        : 'On threshold border. Attend next class!';
    } else {
      statusMessage = `Can safely miss ${safe_bunks} ${safe_bunks === 1 ? 'class' : 'classes'}`;
    }
  }

  return {
    subject,
    opening_present: subject.opening_present,
    opening_total: subject.opening_total,
    dated_present,
    dated_absent,
    dated_not_marked,
    total_classes,
    total_present,
    percentage,
    percentageFormatted,
    safe_bunks,
    classes_needed,
    status,
    statusMessage,
  };
}

/**
 * Computes overall weighted aggregate attendance across all subjects having data
 */
export function computeOverallAttendance(statsList: SubjectAttendanceStats[]): {
  total_present: number;
  total_classes: number;
  percentage: number | null;
  percentageFormatted: string;
} {
  const activeStats = statsList.filter((s) => s.total_classes > 0);
  const total_present = activeStats.reduce((sum, s) => sum + s.total_present, 0);
  const total_classes = activeStats.reduce((sum, s) => sum + s.total_classes, 0);

  if (total_classes === 0) {
    return {
      total_present: 0,
      total_classes: 0,
      percentage: null,
      percentageFormatted: 'No data',
    };
  }

  const percentage = (total_present / total_classes) * 100;
  return {
    total_present,
    total_classes,
    percentage,
    percentageFormatted: `${percentage.toFixed(1)}%`,
  };
}

/**
 * Simulates attendance impact if student attends or misses additional classes
 */
export function simulateAttendance(
  currentPresent: number,
  currentTotal: number,
  attendedClasses: number,
  missedClasses: number,
  threshold: number = DEFAULT_THRESHOLD
): {
  projectedPresent: number;
  projectedTotal: number;
  projectedPercentage: number | null;
  projectedPercentageFormatted: string;
  projectedSafeBunks: number;
  projectedClassesNeeded: number;
  projectedStatus: AttendanceHealthStatus;
} {
  const projectedPresent = currentPresent + attendedClasses;
  const projectedTotal = currentTotal + attendedClasses + missedClasses;

  if (projectedTotal === 0) {
    return {
      projectedPresent: 0,
      projectedTotal: 0,
      projectedPercentage: null,
      projectedPercentageFormatted: 'No data',
      projectedSafeBunks: 0,
      projectedClassesNeeded: 0,
      projectedStatus: 'Safe',
    };
  }

  const projectedPercentage = (projectedPresent / projectedTotal) * 100;
  const projectedSafeBunks = calculateSafeBunks(projectedPresent, projectedTotal, threshold);
  const projectedClassesNeeded = calculateClassesNeeded(projectedPresent, projectedTotal, threshold);
  const projectedStatus = getAttendanceStatus(projectedPercentage, threshold);

  return {
    projectedPresent,
    projectedTotal,
    projectedPercentage,
    projectedPercentageFormatted: `${projectedPercentage.toFixed(1)}%`,
    projectedSafeBunks,
    projectedClassesNeeded,
    projectedStatus,
  };
}

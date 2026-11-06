import { describe, it, expect } from 'vitest';
import { getExamCountdown } from '../utils/date';
import { EXAM_COUNTDOWN_TARGET } from '../constants';

describe('Exam Countdown Tests', () => {
  it('correctly calculates difference against 2026-12-08T00:00:00+05:30', () => {
    // Current time: 2026-11-06T10:53:02+05:30
    const mockNow = new Date('2026-11-06T10:53:02+05:30');
    const countdown = getExamCountdown(EXAM_COUNTDOWN_TARGET, mockNow);

    expect(countdown.isPast).toBe(false);
    expect(countdown.days).toBe(31);
    expect(countdown.hours).toBe(13);
    expect(countdown.minutes).toBe(6);
    expect(countdown.seconds).toBe(58);
  });

  it('marks exam as past when current time has surpassed the target', () => {
    const mockPast = new Date('2026-12-09T10:00:00+05:30');
    const countdown = getExamCountdown(EXAM_COUNTDOWN_TARGET, mockPast);

    expect(countdown.isPast).toBe(true);
    expect(countdown.days).toBe(0);
    expect(countdown.formattedText).toBe('Examinations are underway!');
  });
});

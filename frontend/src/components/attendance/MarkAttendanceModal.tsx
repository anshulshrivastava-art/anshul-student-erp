import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useErp } from '../../context/ErpContext';
import { AttendanceStatus } from '../../types';
import { formatKolkata } from '../../utils/date';
import { Check, X, HelpCircle, Calendar, Clock, Trash2, Loader2 } from 'lucide-react';
import { STANDARD_SLOTS } from '../../constants';

interface MarkAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedSubjectId?: string;
  preselectedSlot?: string;
  preselectedDate?: string;
}

export const MarkAttendanceModal: React.FC<MarkAttendanceModalProps> = ({
  isOpen,
  onClose,
  preselectedSubjectId,
  preselectedSlot,
  preselectedDate,
}) => {
  const { subjects, attendanceRecords, markAttendance, deleteAttendanceRecordBySlot } = useErp();

  const [date, setDate] = useState<string>(preselectedDate || formatKolkata(new Date(), 'yyyy-MM-dd'));
  const [subjectId, setSubjectId] = useState<string>(preselectedSubjectId || subjects[0]?.id || '');
  const [slotStart, setSlotStart] = useState<string>(preselectedSlot || '09:15');
  const [status, setStatus] = useState<AttendanceStatus>('Present');
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Sync state ONLY when modal opens or target slot/subject props change
  useEffect(() => {
    if (!isOpen) return;

    const targetDate = preselectedDate || formatKolkata(new Date(), 'yyyy-MM-dd');
    const targetSlot = preselectedSlot || '09:15';
    let targetSubId = preselectedSubjectId;

    if (!targetSubId && subjects.length > 0) {
      targetSubId = subjects[0].id;
    }

    setDate(targetDate);
    setSlotStart(targetSlot);
    if (targetSubId) setSubjectId(targetSubId);

    // Look for an existing record matching date, slot, and subject
    if (targetSubId) {
      const existing = attendanceRecords.find((r) => {
        if (r.date !== targetDate || r.slot_start !== targetSlot) return false;
        if (r.subject_id === targetSubId) return true;
        const sub = subjects.find((s) => s.id === targetSubId);
        if (sub) {
          const recSub = subjects.find((s) => s.id === r.subject_id);
          if (recSub && recSub.code === sub.code) return true;
        }
        return false;
      });

      if (existing) {
        setStatus(existing.status);
        setNote(existing.note || '');
      } else {
        setStatus('Present');
        setNote('');
      }
    }
  }, [isOpen, preselectedSubjectId, preselectedSlot, preselectedDate, subjects]);

  // Find if an existing record exists for the currently selected subject + date + slot in the form
  const existingRecord = attendanceRecords.find((r) => {
    if (r.date !== date || r.slot_start !== slotStart) return false;
    if (r.subject_id === subjectId) return true;
    const sub = subjects.find((s) => s.id === subjectId);
    if (sub) {
      const recSub = subjects.find((s) => s.id === r.subject_id);
      if (recSub && recSub.code === sub.code) return true;
    }
    return false;
  });

  const selectedSubject = subjects.find((s) => s.id === subjectId);

  const handleExplicitSave = async (explicitStatus: AttendanceStatus) => {
    if (!subjectId || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await markAttendance(subjectId, date, slotStart, explicitStatus, note.trim() || undefined);
      setNote('');
      onClose();
    } catch (err) {
      // toast shown in context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleExplicitSave(status);
  };

  const handleClearMark = async () => {
    if (!subjectId || isDeleting) return;
    try {
      setIsDeleting(true);
      await deleteAttendanceRecordBySlot(subjectId, date, slotStart);
      setNote('');
      setStatus('Present');
      onClose();
    } catch (err) {
      // toast shown in context
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Attendance"
      subtitle={
        existingRecord
          ? `Current Status: ${existingRecord.status}`
          : 'Explicit attendance recording with baseline tracking'
      }
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {existingRecord && (
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-300">
              Saved in Database:{' '}
              <strong
                className={
                  existingRecord.status === 'Absent'
                    ? 'text-rose-400 font-extrabold'
                    : existingRecord.status === 'Present'
                    ? 'text-emerald-400 font-extrabold'
                    : 'text-slate-300 font-bold'
                }
              >
                {existingRecord.status}
              </strong>
            </span>
            <span className="text-slate-500 font-mono text-[11px]">
              {date} at {slotStart}
            </span>
          </div>
        )}

        {/* Subject Picker */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Subject
          </label>
          <select
            value={subjectId}
            onChange={(e) => {
              const newSubId = e.target.value;
              setSubjectId(newSubId);
              // Check if an existing record exists for the newly selected subject
              const found = attendanceRecords.find((r) => {
                if (r.date !== date || r.slot_start !== slotStart) return false;
                if (r.subject_id === newSubId) return true;
                const sub = subjects.find((s) => s.id === newSubId);
                if (sub) {
                  const recSub = subjects.find((s) => s.id === r.subject_id);
                  if (recSub && recSub.code === sub.code) return true;
                }
                return false;
              });
              if (found) {
                setStatus(found.status);
                setNote(found.note || '');
              }
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            required
            disabled={isSubmitting || isDeleting}
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.short_name} — {s.name} ({s.code})
              </option>
            ))}
          </select>
        </div>

        {/* Date and Time Slot */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span>Date</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
              required
              disabled={isSubmitting || isDeleting}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-violet-400" />
              <span>Slot Start Time</span>
            </label>
            <select
              value={slotStart}
              onChange={(e) => setSlotStart(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
              disabled={isSubmitting || isDeleting}
            >
              {STANDARD_SLOTS.filter((s) => !s.is_break).map((s) => (
                <option key={s.start} value={s.start}>
                  {s.label.split('–')[0].trim()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Explicit Status Selection (3 separate actions) */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Attendance Status
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {/* 1. Present */}
            <button
              type="button"
              disabled={isSubmitting || isDeleting}
              onClick={() => setStatus('Present')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                status === 'Present'
                  ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300 shadow-md ring-1 ring-emerald-500/50'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Present</span>
            </button>

            {/* 2. Absent */}
            <button
              type="button"
              disabled={isSubmitting || isDeleting}
              onClick={() => setStatus('Absent')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                status === 'Absent'
                  ? 'bg-rose-600/30 border-rose-500 text-rose-300 shadow-md ring-1 ring-rose-500/50'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <X className="w-4 h-4" />
              <span>Absent</span>
            </button>

            {/* 3. Not Marked */}
            <button
              type="button"
              disabled={isSubmitting || isDeleting}
              onClick={() => setStatus('Not Marked')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                status === 'Not Marked'
                  ? 'bg-slate-700/60 border-slate-400 text-slate-100 shadow-md ring-1 ring-slate-400/50'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Not Marked</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5">
            {status === 'Absent' && 'Marking Absent increases total classes while keeping present count constant.'}
            {status === 'Present' && 'Marking Present adds 1 to both present and total class counts.'}
            {status === 'Not Marked' && 'Not Marked excludes the class slot from calculations (neutral state).'}
          </p>
        </div>

        {/* Note */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Note (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Teacher arrived late, proxy, OD approved"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={isSubmitting || isDeleting}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <div>
            {existingRecord && (
              <button
                type="button"
                onClick={handleClearMark}
                disabled={isSubmitting || isDeleting}
                className="px-3 py-2 text-xs font-semibold text-rose-400 hover:text-white hover:bg-rose-600/30 border border-rose-500/30 rounded-xl transition-all flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>Clear Mark</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting || isDeleting}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isDeleting}
              className={`px-5 py-2 text-xs font-bold text-white rounded-xl transition-all shadow-md flex items-center gap-1.5 ${
                status === 'Absent'
                  ? 'bg-rose-600 hover:bg-rose-500'
                  : status === 'Present'
                  ? 'bg-emerald-600 hover:bg-emerald-500'
                  : 'bg-blue-600 hover:bg-blue-500'
              }`}
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>
                {isSubmitting
                  ? 'Saving...'
                  : existingRecord
                  ? `Update as ${status}`
                  : `Save as ${status}`}
              </span>
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

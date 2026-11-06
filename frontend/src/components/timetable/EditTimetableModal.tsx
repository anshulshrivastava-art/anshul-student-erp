import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useErp } from '../../context/ErpContext';
import { TimetableEntry } from '../../types';
import { STANDARD_SLOTS } from '../../constants';

interface EditTimetableModalProps {
  isOpen: boolean;
  onClose: () => void;
  entryToEdit?: TimetableEntry | null;
  defaultDay?: number;
}

export const EditTimetableModal: React.FC<EditTimetableModalProps> = ({
  isOpen,
  onClose,
  entryToEdit,
  defaultDay = 1,
}) => {
  const { subjects, updateTimetableEntry, addTimetableEntry, deleteTimetableEntry } = useErp();

  const [subjectId, setSubjectId] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState(defaultDay);
  const [startTime, setStartTime] = useState('09:15');
  const [endTime, setEndTime] = useState('10:10');
  const [room, setRoom] = useState('');
  const [groupTarget, setGroupTarget] = useState<'all' | '1' | '2'>('all');
  const [isLab, setIsLab] = useState(false);

  useEffect(() => {
    if (entryToEdit) {
      setSubjectId(entryToEdit.subject_id);
      setDayOfWeek(entryToEdit.day_of_week);
      setStartTime(entryToEdit.start_time);
      setEndTime(entryToEdit.end_time);
      setRoom(entryToEdit.room || '');
      setGroupTarget(entryToEdit.group_target);
      setIsLab(entryToEdit.is_lab);
    } else {
      setSubjectId(subjects[0]?.id || '');
      setDayOfWeek(defaultDay);
      setStartTime('09:15');
      setEndTime('10:10');
      setRoom('');
      setGroupTarget('all');
      setIsLab(false);
    }
  }, [entryToEdit, defaultDay, subjects]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (entryToEdit) {
      await updateTimetableEntry(entryToEdit.id, {
        subject_id: subjectId,
        day_of_week: dayOfWeek,
        start_time: startTime,
        end_time: endTime,
        room,
        group_target: groupTarget,
        is_lab: isLab,
      });
    } else {
      await addTimetableEntry({
        subject_id: subjectId,
        day_of_week: dayOfWeek,
        start_time: startTime,
        end_time: endTime,
        room,
        group_target: groupTarget,
        is_lab: isLab,
      });
    }
    onClose();
  };

  const handleDelete = async () => {
    if (entryToEdit) {
      await deleteTimetableEntry(entryToEdit.id);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={entryToEdit ? 'Edit Timetable Slot' : 'Add Timetable Slot'}
      subtitle="Modify class timing, faculty, group assignment, or lecture room"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Subject
          </label>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            required
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.short_name} — {s.name} ({s.code})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Day of Week
            </label>
            <select
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            >
              <option value={1}>Monday</option>
              <option value={2}>Tuesday</option>
              <option value={3}>Wednesday</option>
              <option value={4}>Thursday</option>
              <option value={5}>Friday</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Room Number
            </label>
            <input
              type="text"
              placeholder="e.g. E-404, 102, E-315"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Start Time (24h)
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              End Time (24h)
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Group Target
            </label>
            <select
              value={groupTarget}
              onChange={(e) => setGroupTarget(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Groups</option>
              <option value="1">Group 1 Only</option>
              <option value="2">Group 2 Only</option>
            </select>
          </div>

          <div className="flex items-center pt-6">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
              <input
                type="checkbox"
                checked={isLab}
                onChange={(e) => setIsLab(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-slate-950 border-slate-700"
              />
              <span>Is 2-Hour Practical Lab</span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          {entryToEdit ? (
            <button
              type="button"
              onClick={handleDelete}
              className="px-3 py-2 text-xs font-semibold text-rose-400 hover:text-white hover:bg-rose-600/30 rounded-xl transition-colors"
            >
              Delete Slot
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-md"
            >
              Save Changes
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

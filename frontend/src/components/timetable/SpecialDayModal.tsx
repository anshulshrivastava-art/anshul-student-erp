import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useErp } from '../../context/ErpContext';
import { DayOverrideType } from '../../types';
import { Calendar, Trash2, Plus, Clock, AlertCircle } from 'lucide-react';
import { formatKolkata } from '../../utils/date';

interface SpecialDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string;
}

export const SpecialDayModal: React.FC<SpecialDayModalProps> = ({
  isOpen,
  onClose,
  initialDate,
}) => {
  const { dayOverrides, setDayOverride, deleteDayOverride, now } = useErp();

  const todayStr = initialDate || formatKolkata(now, 'yyyy-MM-dd');
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [overrideType, setOverrideType] = useState<DayOverrideType>('working_follows_day');
  const [followsWeekday, setFollowsWeekday] = useState<number>(4); // Thursday default
  const [note, setNote] = useState<string>('');

  const weekdays = [
    { value: 1, label: 'Monday Timetable' },
    { value: 2, label: 'Tuesday Timetable' },
    { value: 3, label: 'Wednesday Timetable' },
    { value: 4, label: 'Thursday Timetable' },
    { value: 5, label: 'Friday Timetable' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await setDayOverride({
      date: selectedDate,
      type: overrideType,
      follows_weekday: overrideType === 'working_follows_day' ? followsWeekday : null,
      note: note.trim() || undefined,
    });
    setNote('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configure Special Day Schedule"
      subtitle="Working Saturdays, university holiday notices, or swapped timetable days"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Date Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Target Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
              required
            />
          </div>
        </div>

        {/* Schedule Type */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Day Schedule Type
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => setOverrideType('working_follows_day')}
              className={`p-3 rounded-xl border text-left transition-all ${
                overrideType === 'working_follows_day'
                  ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="text-xs font-bold text-slate-100">Working Day</div>
              <div className="text-[11px] text-slate-400 mt-1">Follows Mon–Fri</div>
            </button>

            <button
              type="button"
              onClick={() => setOverrideType('holiday')}
              className={`p-3 rounded-xl border text-left transition-all ${
                overrideType === 'holiday'
                  ? 'bg-rose-600/20 border-rose-500 text-white shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="text-xs font-bold text-slate-100">Holiday</div>
              <div className="text-[11px] text-slate-400 mt-1">No classes today</div>
            </button>

            <button
              type="button"
              onClick={() => setOverrideType('custom')}
              className={`p-3 rounded-xl border text-left transition-all ${
                overrideType === 'custom'
                  ? 'bg-violet-600/20 border-violet-500 text-white shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="text-xs font-bold text-slate-100">Custom Day</div>
              <div className="text-[11px] text-slate-400 mt-1">Manual slot plan</div>
            </button>
          </div>
        </div>

        {/* Which weekday does it follow? */}
        {overrideType === 'working_follows_day' && (
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 animate-fade-in">
            <label className="block text-xs font-semibold text-slate-300">
              Select which weekday timetable this day will follow:
            </label>
            <select
              value={followsWeekday}
              onChange={(e) => setFollowsWeekday(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            >
              {weekdays.map((w) => (
                <option key={w.value} value={w.value}>
                  {w.label}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400">
              All classes, room numbers, and Group 1/2 lab timings for that weekday will be applied.
            </p>
          </div>
        )}

        {/* Optional Note */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Reason / University Notice (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Compensation for Diwali holiday / Notice ASET-2026-04"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-md flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Apply Schedule Override</span>
          </button>
        </div>
      </form>

      {/* Existing Overrides List */}
      {dayOverrides.length > 0 && (
        <div className="mt-6 pt-5 border-t border-slate-800">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>Configured Day Overrides ({dayOverrides.length})</span>
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {dayOverrides.map((ov) => (
              <div
                key={ov.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-200">{ov.date}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        ov.type === 'holiday'
                          ? 'bg-rose-500/20 text-rose-400'
                          : ov.type === 'custom'
                          ? 'bg-violet-500/20 text-violet-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}
                    >
                      {ov.type === 'working_follows_day'
                        ? `Follows ${weekdays.find((w) => w.value === ov.follows_weekday)?.label || 'Weekday'}`
                        : ov.type === 'holiday'
                        ? 'Holiday'
                        : 'Custom Day'}
                    </span>
                  </div>
                  {ov.note && <p className="text-[11px] text-slate-400 mt-0.5">{ov.note}</p>}
                </div>
                <button
                  onClick={() => deleteDayOverride(ov.date)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  title="Remove override"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
};

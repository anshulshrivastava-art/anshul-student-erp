import React, { useState } from 'react';
import { useErp } from '../context/ErpContext';
import { formatKolkata } from '../utils/date';
import { STANDARD_SLOTS } from '../constants';
import { TimetableEntry } from '../types';
import {
  CalendarDays,
  Clock,
  Users,
  Edit2,
  Plus,
  Calendar,
  AlertCircle,
  Coffee,
  CheckCircle,
} from 'lucide-react';
import { SpecialDayModal } from '../components/timetable/SpecialDayModal';
import { EditTimetableModal } from '../components/timetable/EditTimetableModal';
import { MarkAttendanceModal } from '../components/attendance/MarkAttendanceModal';

export const TimetablePage: React.FC = () => {
  const {
    now,
    activeGroup,
    switchGroup,
    timetableEntries,
    dayOverrides,
    subjects,
    attendanceRecords,
    currentClassStatus,
    getEntriesForSpecificDate,
  } = useErp();

  // Tab: 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 'week'=Full Grid
  const currentWeekday = parseInt(formatKolkata(now, 'i'), 10);
  const defaultTab = currentWeekday >= 1 && currentWeekday <= 5 ? currentWeekday : 1;
  const [activeTab, setActiveTab] = useState<number | 'week'>(defaultTab);

  // Modals
  const [isSpecialDayOpen, setIsSpecialDayOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
  const [isMarkModalOpen, setIsMarkModalOpen] = useState(false);
  const [preselectedSubjectId, setPreselectedSubjectId] = useState<string | undefined>();
  const [preselectedSlot, setPreselectedSlot] = useState<string | undefined>();
  const todayStr = formatKolkata(now, 'yyyy-MM-dd');
  const [preselectedDate, setPreselectedDate] = useState<string | undefined>();

  const days = [
    { num: 1, name: 'Monday', short: 'Mon' },
    { num: 2, name: 'Tuesday', short: 'Tue' },
    { num: 3, name: 'Wednesday', short: 'Wed' },
    { num: 4, name: 'Thursday', short: 'Thu' },
    { num: 5, name: 'Friday', short: 'Fri' },
  ];

  // Helper to open edit slot
  const handleEditSlot = (entry: TimetableEntry) => {
    setEditingEntry(entry);
    setIsEditModalOpen(true);
  };

  const handleAddNewSlot = () => {
    setEditingEntry(null);
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Amity ASET Official Schedule
            </span>
            <span className="text-xs text-slate-400">Odd Sem 2026-27</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            Weekly Academic Timetable
          </h2>
          <p className="text-xs text-slate-400">
            B.Tech (IT) • Semester III • Section A • Lab Blocks count as 1 class
          </p>
        </div>

        {/* Group Selector & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Group 1 / Group 2 Selector */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => switchGroup(1)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeGroup === 1
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Group 1</span>
            </button>
            <button
              onClick={() => switchGroup(2)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeGroup === 2
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Group 2</span>
            </button>
          </div>

          <button
            onClick={() => setIsSpecialDayOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-blue-400 transition-all border border-slate-700 flex items-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Special Day Override</span>
          </button>

          <button
            onClick={handleAddNewSlot}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Slot</span>
          </button>
        </div>
      </div>

      {/* View Tabs: Mon–Fri + Full Week */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800">
        {days.map((d) => (
          <button
            key={d.num}
            onClick={() => setActiveTab(d.num)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === d.num
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            {d.name}
          </button>
        ))}

        <button
          onClick={() => setActiveTab('week')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'week'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          Full Weekly Matrix
        </button>
      </div>

      {/* SINGLE DAY VIEW */}
      {typeof activeTab === 'number' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200">
              {days.find((d) => d.num === activeTab)?.name} Timetable (Group {activeGroup})
            </h3>
            <span className="text-xs text-slate-400">
              Click any slot to modify faculty or room
            </span>
          </div>

          <div className="space-y-3">
            {timetableEntries
              .filter(
                (e) =>
                  !e.specific_date &&
                  e.day_of_week === activeTab &&
                  (e.group_target === 'all' || e.group_target === String(activeGroup))
              )
              .sort((a, b) => a.start_time.localeCompare(b.start_time))
              .map((entry) => {
                const sub = subjects.find((s) => s.id === entry.subject_id);
                const isBreak = entry.is_break;
                const isCurrent =
                  currentWeekday === activeTab &&
                  currentClassStatus.currentClass?.id === entry.id;

                if (isBreak) {
                  return (
                    <div
                      key={entry.id}
                      className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800/80 flex items-center justify-between text-xs text-slate-400"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-32 py-1 px-2 text-center rounded-xl bg-slate-900 border border-slate-800 font-mono text-slate-300">
                          {entry.start_time} – {entry.end_time}
                        </div>
                        <div className="flex items-center gap-2">
                          <Coffee className="w-4 h-4 text-amber-400" />
                          <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                            LUNCH BREAK (01:15 PM – 02:10 PM)
                          </span>
                        </div>
                      </div>
                      <span className="font-mono text-slate-500">Cafeteria</span>
                    </div>
                  );
                }

                return (
                  <div
                    key={entry.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                      isCurrent
                        ? 'bg-blue-950/40 border-blue-500 shadow-glow-blue'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="w-32 py-1.5 px-2 text-center rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs font-bold text-slate-200 shrink-0">
                        {entry.start_time} – {entry.end_time}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">
                            {sub?.name || 'Class'}
                          </h4>
                          {entry.is_lab && (
                            <span className="px-2 py-0.2 rounded-full text-[9px] font-bold uppercase bg-violet-500/20 text-violet-400 border border-violet-500/30">
                              2-Hour Lab
                            </span>
                          )}
                          {isCurrent && (
                            <span className="px-2 py-0.2 rounded-full text-[9px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">
                              Now
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Code: <span className="text-blue-400 font-mono">{sub?.code}</span> • Faculty:{' '}
                          <span className="text-slate-200">{sub?.faculty_name}</span>{' '}
                          {sub?.faculty_initials && `(${sub.faculty_initials})`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                      <div className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs font-semibold text-amber-300">
                        {entry.room ? `Room ${entry.room}` : 'Room TBA'}
                      </div>

                      {(() => {
                        const isTodayTab = currentWeekday === activeTab;
                        const att = isTodayTab
                          ? attendanceRecords.find((r) => {
                              if (r.date !== todayStr || r.slot_start !== entry.start_time) return false;
                              if (r.subject_id === entry.subject_id) return true;
                              if (sub && r.subject_id === sub.id) return true;
                              const s = subjects.find((subj) => subj.id === r.subject_id);
                              if (s && sub && s.code === sub.code) return true;
                              return false;
                            })
                          : undefined;

                        if (att?.status === 'Absent') {
                          return (
                            <button
                              onClick={() => {
                                if (sub) {
                                  setPreselectedSubjectId(sub.id);
                                  setPreselectedSlot(entry.start_time);
                                  setPreselectedDate(todayStr);
                                  setIsMarkModalOpen(true);
                                }
                              }}
                              className="px-2 py-1 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-sm"
                              title="Marked Absent — Click to change or clear"
                            >
                              Absent
                            </button>
                          );
                        }
                        if (att?.status === 'Present') {
                          return (
                            <button
                              onClick={() => {
                                if (sub) {
                                  setPreselectedSubjectId(sub.id);
                                  setPreselectedSlot(entry.start_time);
                                  setPreselectedDate(todayStr);
                                  setIsMarkModalOpen(true);
                                }
                              }}
                              className="px-2 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-sm"
                              title="Marked Present — Click to change or clear"
                            >
                              Present
                            </button>
                          );
                        }
                        return (
                          <button
                            onClick={() => {
                              if (sub) {
                                setPreselectedSubjectId(sub.id);
                                setPreselectedSlot(entry.start_time);
                                setPreselectedDate(todayStr);
                                setIsMarkModalOpen(true);
                              }
                            }}
                            className="p-1.5 rounded-lg text-emerald-400 hover:text-white hover:bg-emerald-600/30 transition-colors"
                            title="Mark Attendance"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        );
                      })()}

                      <button
                        onClick={() => handleEditSlot(entry)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title="Edit slot details"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* FULL WEEKLY MATRIX VIEW */}
      {activeTab === 'week' && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-300 text-xs font-semibold">
                <th className="p-3 w-36 font-mono text-slate-400">Time Range</th>
                {days.map((d) => (
                  <th key={d.num} className="p-3 font-bold text-slate-200">
                    {d.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs">
              {STANDARD_SLOTS.map((slot) => {
                if (slot.is_break) {
                  return (
                    <tr key={slot.start} className="bg-slate-950/30 text-center">
                      <td className="p-3 font-mono text-slate-400 whitespace-nowrap text-left">
                        {slot.label.split('(')[0].trim()}
                      </td>
                      <td colSpan={5} className="p-3 text-amber-300/80 font-bold uppercase tracking-wider text-[11px]">
                        ☕ LUNCH BREAK (01:15 PM – 02:10 PM)
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={slot.start} className="hover:bg-slate-850/50 transition-colors">
                    <td className="p-3 font-mono text-slate-300 whitespace-nowrap border-r border-slate-800/60">
                      {slot.label}
                    </td>

                    {days.map((d) => {
                      // Find entry matching day and slot
                      const entry = timetableEntries.find(
                        (e) =>
                          !e.specific_date &&
                          e.day_of_week === d.num &&
                          (e.group_target === 'all' || e.group_target === String(activeGroup)) &&
                          e.start_time <= slot.start &&
                          e.end_time >= slot.end
                      );

                      if (!entry) {
                        return (
                          <td key={d.num} className="p-3 text-slate-600 border-r border-slate-800/40">
                            —
                          </td>
                        );
                      }

                      const sub = subjects.find((s) => s.id === entry.subject_id);

                      return (
                        <td
                          key={d.num}
                          onClick={() => handleEditSlot(entry)}
                          className={`p-2.5 cursor-pointer transition-all border-r border-slate-800/40 ${
                            entry.is_lab
                              ? 'bg-violet-950/20 hover:bg-violet-950/40'
                              : 'hover:bg-slate-800/60'
                          }`}
                        >
                          <div className="font-bold text-slate-100 flex items-center justify-between">
                            <span>{sub?.short_name || sub?.name}</span>
                            {entry.room && (
                              <span className="font-mono text-[10px] text-amber-400">
                                {entry.room}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {sub?.faculty_initials || sub?.faculty_name}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      <SpecialDayModal
        isOpen={isSpecialDayOpen}
        onClose={() => setIsSpecialDayOpen(false)}
      />
      <EditTimetableModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        entryToEdit={editingEntry}
      />
      <MarkAttendanceModal
        isOpen={isMarkModalOpen}
        onClose={() => setIsMarkModalOpen(false)}
        preselectedSubjectId={preselectedSubjectId}
        preselectedSlot={preselectedSlot}
        preselectedDate={preselectedDate}
      />
    </div>
  );
};

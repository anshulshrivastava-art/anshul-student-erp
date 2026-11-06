import React, { useState } from 'react';
import { useErp } from '../context/ErpContext';
import {
  CalendarCheck,
  Plus,
  CheckCircle,
  Circle,
  Clock,
  Trash2,
  Calendar,
  Sparkles,
  Coffee,
  CheckCircle2,
} from 'lucide-react';
import { AddTaskModal } from '../components/planner/AddTaskModal';
import { formatKolkata } from '../utils/date';

export const StudyPlannerPage: React.FC = () => {
  const { studyTasks, toggleStudyTask, deleteStudyTask, subjects, now, timetableEntries, activeGroup } = useErp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const todayStr = formatKolkata(now, 'yyyy-MM-dd');
  const currentWeekday = parseInt(formatKolkata(now, 'i'), 10);

  const completedTasks = studyTasks.filter((t) => t.is_completed);
  const pendingTasks = studyTasks.filter((t) => !t.is_completed);
  const completionPercentage = studyTasks.length > 0 ? (completedTasks.length / studyTasks.length) * 100 : 0;

  // Compute free slots today
  const todaysEntries = timetableEntries
    .filter(
      (e) =>
        !e.specific_date &&
        e.day_of_week === currentWeekday &&
        (e.group_target === 'all' || e.group_target === String(activeGroup))
    )
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-violet-500/10 text-violet-400 border border-violet-500/20">
              Focus & Productivity Engine
            </span>
            <span className="text-xs text-slate-400">
              {completedTasks.length} / {studyTasks.length} Completed ({completionPercentage.toFixed(0)}%)
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            Personal Study Planner
          </h2>
          <p className="text-xs text-slate-400">
            Schedule revision blocks around your university timetable lectures and lab sessions.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-all shadow-md flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Study Block</span>
        </button>
      </div>

      {/* PROGRESS BAR & FREE SLOTS OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Progress Card */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Study Task Completion
            </span>
            <span className="text-xs font-mono font-bold text-violet-400">
              {completionPercentage.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
            <div
              className="bg-violet-500 h-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400">
            {completedTasks.length} done, {pendingTasks.length} remaining in your active study queue.
          </p>
        </div>

        {/* Free Timetable Windows Card */}
        <div className="md:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Recommended Free Study Windows Today
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs flex items-center gap-2">
              <Coffee className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-300 font-medium">Lunch Break Window:</span>
              <span className="font-mono text-amber-300">01:15 PM – 02:10 PM</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-slate-300 font-medium">Post-College Study:</span>
              <span className="font-mono text-blue-300">05:15 PM onwards</span>
            </div>
          </div>
        </div>
      </div>

      {/* TASKS LIST */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
          Active Revision & Study Tasks
        </h3>

        {studyTasks.length === 0 ? (
          <div className="p-10 rounded-2xl bg-slate-900 border border-slate-800 text-center">
            <CalendarCheck className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">No study tasks planned</p>
            <p className="text-xs text-slate-500 mt-1">
              Add your first study block to start planning your revision.
            </p>
          </div>
        ) : (
          studyTasks.map((t) => {
            const sub = subjects.find((s) => s.id === t.subject_id);

            return (
              <div
                key={t.id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                  t.is_completed
                    ? 'bg-slate-900/50 border-slate-800 opacity-60'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <button
                    onClick={() => toggleStudyTask(t.id)}
                    className="p-1 text-slate-400 hover:text-white transition-colors"
                  >
                    {t.is_completed ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.2 rounded-full text-[9px] font-bold uppercase bg-violet-500/15 text-violet-400 border border-violet-500/30">
                        {sub?.short_name || 'Subject'}
                      </span>
                      <span
                        className={`px-2 py-0.2 rounded-full text-[9px] font-bold uppercase ${
                          t.priority === 'Urgent' || t.priority === 'High'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {t.priority}
                      </span>
                    </div>

                    <h4
                      className={`text-sm font-bold text-white mt-1 truncate ${
                        t.is_completed ? 'line-through text-slate-400' : ''
                      }`}
                    >
                      {t.title}
                    </h4>

                    {t.notes && (
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{t.notes}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 text-xs font-mono text-slate-400">
                  <span className="hidden sm:inline">{t.duration_minutes} mins</span>
                  <span>{t.target_date}</span>
                  <button
                    onClick={() => deleteStudyTask(t.id)}
                    className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
};

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useErp } from '../context/ErpContext';
import { formatKolkata } from '../utils/date';
import { OFFICIAL_CGPA } from '../constants';
import {
  GraduationCap,
  Award,
  CheckSquare,
  Clock,
  Calendar,
  BookOpen,
  ListTodo,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  Flame,
  ArrowUpRight,
  Coffee,
  CheckCircle2,
  CalendarDays,
  Plus,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SpecialDayModal } from '../components/timetable/SpecialDayModal';
import { MarkAttendanceModal } from '../components/attendance/MarkAttendanceModal';
import { AddAssignmentModal } from '../components/assignments/AddAssignmentModal';
import { AddExamModal } from '../components/exams/AddExamModal';
import { AddTaskModal } from '../components/planner/AddTaskModal';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export const DashboardPage: React.FC = () => {
  const { profile } = useAuth();
  const {
    now,
    activeGroup,
    switchGroup,
    subjects,
    overallAttendance,
    attendanceStats,
    attendanceRecords,
    currentClassStatus,
    examCountdown,
    semesterResults,
    assignments,
    studyTasks,
    getEntriesForSpecificDate,
  } = useErp();

  const navigate = useNavigate();

  // Modals state
  const [isSpecialDayOpen, setIsSpecialDayOpen] = useState(false);
  const [isMarkAttendanceOpen, setIsMarkAttendanceOpen] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | undefined>();
  const [selectedSlot, setSelectedSlot] = useState<string | undefined>();
  const [selectedDate, setSelectedDate] = useState<string | undefined>();
  const [isAddAssignmentOpen, setIsAddAssignmentOpen] = useState(false);
  const [isAddExamOpen, setIsAddExamOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  const todayStr = formatKolkata(now, 'yyyy-MM-dd');
  const dayName = formatKolkata(now, 'EEEE');
  const dayOfWeekNumber = parseInt(formatKolkata(now, 'i'), 10);
  const isWeekend = dayOfWeekNumber === 6 || dayOfWeekNumber === 7;

  const handleOpenMarkModal = (subId?: string, slot?: string, date?: string) => {
    setSelectedSubjectId(subId);
    setSelectedSlot(slot);
    setSelectedDate(date || todayStr);
    setIsMarkAttendanceOpen(true);
  };

  const todaySchedule = getEntriesForSpecificDate(todayStr);

  const sem1 = semesterResults.find((s) => s.semester_number === 1)?.sgpa || 7.33;
  const sem2 = semesterResults.find((s) => s.semester_number === 2)?.sgpa || 6.25;
  const pendingAssignments = assignments.filter((a) => a.status !== 'Completed').length;
  const pendingTasks = studyTasks.filter((t) => !t.is_completed).length;

  // Chart data for SGPA trend
  const chartData = semesterResults.map((s) => ({
    name: `Sem ${s.semester_number}`,
    sgpa: s.sgpa,
    official: OFFICIAL_CGPA,
  }));

  // Critical subjects with low attendance
  const criticalSubjects = attendanceStats.filter((s) => s.status === 'Critical' || s.status === 'Warning');

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Weekend Working Day Notice Banner */}
      {isWeekend && todaySchedule.isHoliday && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 border border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-100">
                Weekend Schedule ({dayName})
              </p>
              <p className="text-xs text-slate-400">
                Are college classes being conducted today? Tap to mark this as a working day.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSpecialDayOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-md shrink-0 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Mark as Working Day</span>
          </button>
        </div>
      )}

      {/* TOP METRICS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Official CGPA */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Official CGPA
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              {OFFICIAL_CGPA.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400 font-medium">/ 10.00</span>
          </div>
          <p className="text-[10px] text-blue-400 font-medium mt-1">
            Amizone Official Verified
          </p>
          <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-blue-600/5 rounded-full blur-xl group-hover:bg-blue-600/10 transition-colors" />
        </div>

        {/* Overall Attendance */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Overall Attendance
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
              {overallAttendance.percentageFormatted}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium mt-1">
            {overallAttendance.total_present} / {overallAttendance.total_classes} Weighted Classes
          </p>
          <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-emerald-600/5 rounded-full blur-xl group-hover:bg-emerald-600/10 transition-colors" />
        </div>

        {/* Examination Countdown */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Exam Countdown
            </span>
            <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-violet-400 font-mono">
              {examCountdown.days}
            </span>
            <span className="text-xs text-slate-300 font-medium">Days</span>
            <span className="text-xs text-slate-500 font-mono">
              {examCountdown.hours}h {examCountdown.minutes}m
            </span>
          </div>
          <p className="text-[10px] text-violet-400/90 font-medium mt-1">
            Starts 08 Dec 2026
          </p>
          <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-violet-600/5 rounded-full blur-xl group-hover:bg-violet-600/10 transition-colors" />
        </div>

        {/* Pending Work */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Tasks & Work
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <ListTodo className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono">
              {pendingAssignments + pendingTasks}
            </span>
            <span className="text-xs text-slate-400">Pending</span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium mt-1">
            {pendingAssignments} Assignments • {pendingTasks} Study Blocks
          </p>
          <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-amber-600/5 rounded-full blur-xl group-hover:bg-amber-600/10 transition-colors" />
        </div>
      </div>

      {/* CURRENT / UPCOMING CLASS HERO CARD */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Academic Radar • Group {activeGroup}
              </span>
              <span className="text-xs text-slate-400">Asia/Kolkata</span>
            </div>

            {currentClassStatus.isHoliday ? (
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-200">
                  {currentClassStatus.holidayReason || 'No Classes Scheduled Today'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Enjoy your weekend or study session. Use the study planner to revise key concepts.
                </p>
              </div>
            ) : currentClassStatus.isLunchBreak ? (
              <div className="flex items-center gap-3 py-1">
                <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                  <Coffee className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-amber-300">
                    Lunch Break in Progress
                  </h3>
                  <p className="text-xs text-slate-400">
                    01:15 PM – 02:10 PM • Afternoon session begins in {currentClassStatus.minutesUntilNext ?? 0} mins
                  </p>
                </div>
              </div>
            ) : currentClassStatus.currentClass ? (
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-bold text-emerald-400">HAPPENING NOW</span>
                  <span className="text-xs text-slate-400 font-mono">
                    {currentClassStatus.currentClass.timeRangeLabel}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                  {currentClassStatus.currentClass.subject?.name || 'Academic Slot'}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Code: <span className="font-mono text-blue-400">{currentClassStatus.currentClass.subject?.code}</span> • Faculty: <span className="text-slate-200">{currentClassStatus.currentClass.subject?.faculty_name}</span> • Room: <span className="font-mono text-amber-300">{currentClassStatus.currentClass.room || 'TBA'}</span>
                </p>
              </div>
            ) : currentClassStatus.nextClass ? (
              <div>
                <span className="text-xs font-bold text-blue-400">NEXT UPCOMING CLASS</span>
                <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
                  {currentClassStatus.nextClass.subject?.name}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Starts at <span className="font-mono text-white font-semibold">{currentClassStatus.nextClass.timeRangeLabel}</span> in Room <span className="font-mono text-amber-300 font-semibold">{currentClassStatus.nextClass.room || 'TBA'}</span> ({currentClassStatus.minutesUntilNext} minutes remaining)
                </p>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-bold text-slate-200">Classes Finished for Today</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  All scheduled lectures and practical labs for today have completed.
                </p>
              </div>
            )}
          </div>

          {/* Quick Actions Bar */}
          <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 shrink-0">
            <button
              onClick={() => handleOpenMarkModal()}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md flex items-center gap-1.5"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Mark Attendance</span>
            </button>
            <button
              onClick={() => navigate('/timetable')}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all border border-slate-700 flex items-center gap-1.5"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Full Timetable</span>
            </button>
            <button
              onClick={() => setIsSpecialDayOpen(true)}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-blue-400 transition-all border border-slate-700 flex items-center gap-1.5"
            >
              <span>Special Day</span>
            </button>
          </div>
        </div>
      </div>

      {/* TWO COLUMN CONTENT: SCHEDULE & ACADEMICS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Today's Schedule Flow */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                Today's Class Schedule ({dayName})
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              {todaySchedule.entries.length} Classes Scheduled
            </span>
          </div>

          <div className="space-y-2.5">
            {todaySchedule.entries.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-300">
                  {todaySchedule.holidayReason || 'No lectures scheduled for today'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Use the "Special Day" button if classes follow a different schedule.
                </p>
              </div>
            ) : (
              todaySchedule.entries.map((entry) => {
                const isCurrent =
                  currentClassStatus.currentClass?.id === entry.id;
                const isBreak = entry.is_break;

                const attRecord = attendanceRecords.find((r) => {
                  if (r.date !== todayStr || r.slot_start !== entry.start_time) return false;
                  if (r.subject_id === entry.subject_id) return true;
                  if (entry.subject && r.subject_id === entry.subject.id) return true;
                  const s = subjects.find((subj) => subj.id === r.subject_id);
                  if (s && entry.subject && s.code === entry.subject.code) return true;
                  return false;
                });
                const isAbsent = attRecord?.status === 'Absent';
                const isPresent = attRecord?.status === 'Present';
                const isNotMarked = attRecord?.status === 'Not Marked';

                let cardBorder = 'bg-slate-900 border-slate-800/80 hover:border-slate-700';
                if (isCurrent) {
                  cardBorder = 'bg-blue-950/40 border-blue-500/80 shadow-glow-blue';
                } else if (isAbsent) {
                  cardBorder = 'bg-rose-950/30 border-rose-500/70 shadow-md ring-1 ring-rose-500/30';
                } else if (isPresent) {
                  cardBorder = 'bg-emerald-950/20 border-emerald-500/60 shadow-md ring-1 ring-emerald-500/30';
                } else if (isBreak) {
                  cardBorder = 'bg-slate-900/40 border-slate-800/60 opacity-80';
                }

                return (
                  <div
                    key={entry.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${cardBorder}`}
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="text-center shrink-0 w-28 sm:w-32 py-1 px-2 rounded-xl bg-slate-950/80 border border-slate-800/80 font-mono">
                        <span className="text-xs font-bold text-slate-200 block">
                          {entry.timeRangeLabel.split('–')[0].trim()}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          to {entry.timeRangeLabel.split('–')[1]?.trim()}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">
                            {entry.custom_label || entry.subject?.name}
                          </span>
                          {entry.is_lab && (
                            <span className="px-2 py-0.2 rounded-full text-[9px] font-bold uppercase bg-violet-500/20 text-violet-400 border border-violet-500/30">
                              2-Hour Lab
                            </span>
                          )}
                          {isCurrent && (
                            <span className="px-2 py-0.2 rounded-full text-[9px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">
                              Active Now
                            </span>
                          )}
                          {isAbsent && (
                            <span className="px-2 py-0.2 rounded-full text-[9px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40">
                              Absent
                            </span>
                          )}
                          {isPresent && (
                            <span className="px-2 py-0.2 rounded-full text-[9px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              Present
                            </span>
                          )}
                        </div>

                        {!isBreak && (
                          <p className="text-xs text-slate-400 mt-0.5">
                            {entry.subject?.code} • {entry.subject?.faculty_name}{' '}
                            {entry.subject?.faculty_initials && `(${entry.subject.faculty_initials})`}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                      <div className="px-2.5 py-1 rounded-lg bg-slate-950 text-xs font-mono font-medium text-amber-300 border border-slate-800">
                        {entry.room ? `Room ${entry.room}` : 'Room TBA'}
                      </div>
                      {!isBreak && entry.subject && (
                        <div>
                          {isAbsent ? (
                            <button
                              onClick={() =>
                                handleOpenMarkModal(entry.subject?.id || entry.subject_id, entry.start_time, todayStr)
                              }
                              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-sm flex items-center gap-1"
                              title="Marked as Absent — Click to modify or clear"
                            >
                              <span>Absent</span>
                            </button>
                          ) : isPresent ? (
                            <button
                              onClick={() =>
                                handleOpenMarkModal(entry.subject?.id || entry.subject_id, entry.start_time, todayStr)
                              }
                              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-sm flex items-center gap-1"
                              title="Marked as Present — Click to modify or clear"
                            >
                              <span>Present</span>
                            </button>
                          ) : isNotMarked ? (
                            <button
                              onClick={() =>
                                handleOpenMarkModal(entry.subject?.id || entry.subject_id, entry.start_time, todayStr)
                              }
                              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all flex items-center gap-1"
                              title="Not Marked — Click to modify"
                            >
                              <span>Not Marked</span>
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                handleOpenMarkModal(entry.subject?.id || entry.subject_id, entry.start_time, todayStr)
                              }
                              className="px-2.5 py-1 rounded-lg text-xs font-medium text-emerald-400 hover:text-white hover:bg-emerald-600/30 transition-colors"
                            >
                              Mark
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Academic Summary & Attendance Watch */}
        <div className="space-y-6">
          {/* Academic SGPA History Card */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Academic SGPA Trend
                </h3>
              </div>
              <button
                onClick={() => navigate('/academics')}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
              >
                <span>Details</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-medium">Semester 1</span>
                <p className="text-xl font-bold text-white font-mono mt-0.5">{sem1.toFixed(2)}</p>
                <span className="text-[10px] text-emerald-400 font-medium">Passed • 0 Backs</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-medium">Semester 2</span>
                <p className="text-xl font-bold text-amber-400 font-mono mt-0.5">{sem2.toFixed(2)}</p>
                <span className="text-[10px] text-rose-400 font-medium">1 Back Paper</span>
              </div>
            </div>

            {/* Micro Chart */}
            <div className="h-28 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="sgpaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis domain={[5, 10]} stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                  />
                  <Area type="monotone" dataKey="sgpa" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#sgpaGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Critical Attendance Watchlist */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Attendance Watchlist
                </h3>
              </div>
              <button
                onClick={() => navigate('/bunk-calculator')}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
              >
                <span>Calculator</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {criticalSubjects.slice(0, 3).map((stat) => (
                <div
                  key={stat.subject.id}
                  className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-200">{stat.subject.short_name}</p>
                    <p className="text-[10px] text-slate-400">{stat.statusMessage}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-mono font-bold text-sm ${
                        stat.status === 'Critical' ? 'text-rose-400' : 'text-amber-400'
                      }`}
                    >
                      {stat.percentageFormatted}
                    </span>
                    <p className="text-[10px] text-slate-500">
                      {stat.total_present}/{stat.total_classes}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <SpecialDayModal
        isOpen={isSpecialDayOpen}
        onClose={() => setIsSpecialDayOpen(false)}
      />
      <MarkAttendanceModal
        isOpen={isMarkAttendanceOpen}
        onClose={() => setIsMarkAttendanceOpen(false)}
        preselectedSubjectId={selectedSubjectId}
        preselectedSlot={selectedSlot}
        preselectedDate={selectedDate}
      />
      <AddAssignmentModal
        isOpen={isAddAssignmentOpen}
        onClose={() => setIsAddAssignmentOpen(false)}
      />
      <AddExamModal
        isOpen={isAddExamOpen}
        onClose={() => setIsAddExamOpen(false)}
      />
      <AddTaskModal
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
      />
    </div>
  );
};

import React, { useState } from 'react';
import { useErp } from '../context/ErpContext';
import {
  CheckSquare,
  Plus,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Search,
  Filter,
  Trash2,
  Calendar,
} from 'lucide-react';
import { MarkAttendanceModal } from '../components/attendance/MarkAttendanceModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

export const AttendancePage: React.FC = () => {
  const {
    attendanceStats,
    overallAttendance,
    attendanceRecords,
    deleteAttendanceRecord,
    subjects,
    settings,
  } = useErp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Safe' | 'Warning' | 'Critical'>('All');
  const [isMarkModalOpen, setIsMarkModalOpen] = useState(false);
  const [preselectedSubId, setPreselectedSubId] = useState<string | undefined>();

  // Confirmation dialog for record deletion
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);

  const thresholdPct = ((settings?.attendance_threshold || 0.75) * 100).toFixed(0);

  // Filtered stats
  const filteredStats = attendanceStats.filter((stat) => {
    const matchesSearch =
      stat.subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stat.subject.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stat.subject.short_name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === 'All' || stat.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleOpenMarkModal = (subId?: string) => {
    setPreselectedSubId(subId);
    setIsMarkModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Banner & Overall Attendance */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Official University Baseline Grounded
            </span>
            <span className="text-xs text-slate-400">Target Threshold: {thresholdPct}%</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            Subject-Wise Attendance Management
          </h2>
          <p className="text-xs text-slate-400 max-w-xl mt-0.5 leading-relaxed">
            Maintained individually per course and practical lab. Grounded in Amizone attendance records as of 06 Nov 2026.
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0 bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Aggregate Weighted Attendance
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-3xl font-extrabold text-emerald-400 font-mono">
                {overallAttendance.percentageFormatted}
              </span>
              <span className="text-xs text-slate-400">
                ({overallAttendance.total_present} / {overallAttendance.total_classes})
              </span>
            </div>
          </div>
          <button
            onClick={() => handleOpenMarkModal()}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Mark Class</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by subject name or course code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          {(['All', 'Safe', 'Warning', 'Critical'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                filterStatus === status
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* SUBJECT ATTENDANCE CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredStats.map((stat) => {
          const isNoData = stat.total_classes === 0;

          return (
            <div
              key={stat.subject.id}
              className={`p-5 rounded-2xl bg-slate-900 border transition-all flex flex-col justify-between ${
                stat.status === 'Critical'
                  ? 'border-rose-500/40 shadow-sm'
                  : stat.status === 'Warning'
                  ? 'border-amber-500/40'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Header: Short Name & Percentage Pill */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">
                        {stat.subject.short_name}
                      </h3>
                      {stat.subject.is_lab && (
                        <span className="px-2 py-0.2 rounded-full text-[9px] font-bold uppercase bg-violet-500/20 text-violet-400 border border-violet-500/30">
                          Lab
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 font-medium mt-0.5 line-clamp-1">
                      {stat.subject.name}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Code: {stat.subject.code}
                    </p>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-xl font-extrabold font-mono ${
                        isNoData
                          ? 'text-slate-400'
                          : stat.status === 'Critical'
                          ? 'text-rose-400'
                          : stat.status === 'Warning'
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {stat.percentageFormatted}
                    </span>
                    <span className="block text-[10px] text-slate-400">
                      {stat.total_present} / {stat.total_classes}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-950 rounded-full h-2 mt-4 overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all duration-500 ${
                      stat.status === 'Critical'
                        ? 'bg-rose-500'
                        : stat.status === 'Warning'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(stat.percentage || 0, 100)}%` }}
                  />
                </div>

                {/* Breakdown: Baseline vs Dated */}
                <div className="grid grid-cols-2 gap-2 mt-4 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Opening Baseline</span>
                    <span className="font-mono text-slate-200 font-semibold">
                      {stat.opening_present} / {stat.opening_total}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Dated App Records</span>
                    <span className="font-mono text-blue-400 font-semibold">
                      +{stat.dated_present} Present, +{stat.dated_absent} Absent
                    </span>
                  </div>
                </div>

                {/* Bunk / Classes Needed status */}
                <div className="mt-3">
                  {isNoData ? (
                    <p className="text-xs text-slate-400 italic">No attendance records yet.</p>
                  ) : stat.status === 'Critical' ? (
                    <div className="flex items-center gap-1.5 text-xs text-rose-400 font-medium">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Need {stat.classes_needed} consecutive classes to hit {thresholdPct}%</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>
                        Can safely miss <strong className="font-mono">{stat.safe_bunks}</strong> {stat.safe_bunks === 1 ? 'class' : 'classes'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800">
                <span className="text-[10px] text-slate-400 truncate max-w-[140px]">
                  {stat.subject.faculty_name}
                </span>

                <button
                  onClick={() => handleOpenMarkModal(stat.subject.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-emerald-400 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Mark</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* DATED RECORDS RECENT AUDIT LOG */}
      {attendanceRecords.length > 0 && (
        <div className="mt-8 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span>Recent Dated Attendance Logs ({attendanceRecords.length})</span>
            </h3>
            <span className="text-xs text-slate-400">Added on top of Amizone baseline</span>
          </div>

          <div className="divide-y divide-slate-800/80">
            {attendanceRecords.slice(0, 10).map((record) => {
              const sub = subjects.find((s) => s.id === record.subject_id);

              return (
                <div
                  key={record.id}
                  className="py-3 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-300 font-semibold">{record.date}</span>
                    <span className="font-mono text-slate-400">{record.slot_start}</span>
                    <span className="font-bold text-white">{sub?.short_name || 'Subject'}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        record.status === 'Present'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : record.status === 'Absent'
                          ? 'bg-rose-500/20 text-rose-400'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {record.status}
                    </span>
                    {record.note && (
                      <span className="text-slate-400 italic">"{record.note}"</span>
                    )}
                  </div>

                  <button
                    onClick={() => setRecordToDelete(record.id)}
                    className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    title="Delete record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modals */}
      <MarkAttendanceModal
        isOpen={isMarkModalOpen}
        onClose={() => setIsMarkModalOpen(false)}
        preselectedSubjectId={preselectedSubId}
      />

      <ConfirmDialog
        isOpen={Boolean(recordToDelete)}
        onClose={() => setRecordToDelete(null)}
        onConfirm={() => {
          if (recordToDelete) {
            deleteAttendanceRecord(recordToDelete);
            setRecordToDelete(null);
          }
        }}
        title="Delete Attendance Record"
        message="Are you sure you want to delete this attendance log? The subject baseline and percentage will be updated immediately."
        confirmLabel="Delete Log"
        isDestructive={true}
      />
    </div>
  );
};

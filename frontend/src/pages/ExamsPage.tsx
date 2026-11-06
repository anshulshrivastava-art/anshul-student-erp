import React, { useState } from 'react';
import { useErp } from '../context/ErpContext';
import {
  Award,
  Calendar,
  Clock,
  MapPin,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { AddExamModal } from '../components/exams/AddExamModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Exam } from '../types';

export const ExamsPage: React.FC = () => {
  const { exams, deleteExam, examCountdown, subjects } = useErp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [examToEdit, setExamToEdit] = useState<Exam | null>(null);
  const [examToDelete, setExamToDelete] = useState<string | null>(null);

  const handleOpenEdit = (exam: Exam) => {
    setExamToEdit(exam);
    setIsAddModalOpen(true);
  };

  const handleAddNew = () => {
    setExamToEdit(null);
    setIsAddModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* EXAM COUNTDOWN HERO BANNER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-violet-950/70 via-slate-900 to-indigo-950/70 border border-violet-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-violet-500/20 text-violet-300 border border-violet-500/30">
                Official Examination Target
              </span>
              <span className="text-xs text-slate-400">Asia/Kolkata</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              End Term Semester Examinations
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Countdown target: <strong className="text-violet-300 font-mono">08 December 2026, 00:00:00 IST</strong>. Keep track of revision milestones and scheduled paper dates.
            </p>
          </div>

          {/* Live Countdown Display */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 bg-slate-950/80 p-4 sm:p-5 rounded-2xl border border-violet-500/30 shadow-xl">
            <div className="text-center px-2 sm:px-3">
              <span className="text-3xl sm:text-4xl font-black text-white font-mono block">
                {examCountdown.days}
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Days</span>
            </div>
            <span className="text-2xl text-violet-500/60 font-mono">:</span>
            <div className="text-center px-2 sm:px-3">
              <span className="text-3xl sm:text-4xl font-black text-violet-400 font-mono block">
                {String(examCountdown.hours).padStart(2, '0')}
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Hours</span>
            </div>
            <span className="text-2xl text-violet-500/60 font-mono">:</span>
            <div className="text-center px-2 sm:px-3">
              <span className="text-3xl sm:text-4xl font-black text-violet-400 font-mono block">
                {String(examCountdown.minutes).padStart(2, '0')}
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Mins</span>
            </div>
            <span className="text-2xl text-violet-500/60 font-mono">:</span>
            <div className="text-center px-2 sm:px-3">
              <span className="text-3xl sm:text-4xl font-black text-indigo-400 font-mono block">
                {String(examCountdown.seconds).padStart(2, '0')}
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Secs</span>
            </div>
          </div>
        </div>

        {/* Subtle decorative glow */}
        <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Action Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-100">
            Subject-Wise Examination Schedule
          </h3>
          <p className="text-xs text-slate-400">
            Enter individual paper dates from university notices as they are published.
          </p>
        </div>

        <button
          onClick={handleAddNew}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-all shadow-md flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Paper</span>
        </button>
      </div>

      {/* EXAMS LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {exams.map((exam) => {
          const sub = subjects.find((s) => s.id === exam.subject_id);

          return (
            <div
              key={exam.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-violet-500/15 text-violet-400 border border-violet-500/30">
                      {sub?.code || 'EXAM'}
                    </span>
                    <h4 className="text-base font-bold text-white mt-1.5">
                      {exam.exam_name}
                    </h4>
                    <p className="text-xs text-slate-400">
                      {sub?.name}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(exam)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setExamToDelete(exam.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Timing & Venue */}
                <div className="grid grid-cols-2 gap-2 mt-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="font-mono font-semibold">{exam.exam_date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                    <span className="font-mono">{exam.start_time} – {exam.end_time}</span>
                  </div>
                  <div className="col-span-2 flex items-center gap-2 text-slate-400 text-[11px] pt-1 border-t border-slate-800/80">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Venue: <strong className="text-amber-300">{exam.room || 'Examination Hall'}</strong></span>
                  </div>
                </div>

                {/* Syllabus Covered Progress */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Preparation Readiness</span>
                    <span className="font-mono font-bold text-slate-200">
                      {exam.syllabus_covered_pct}% ({exam.preparation_status})
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full transition-all duration-500 ${
                        exam.syllabus_covered_pct >= 80
                          ? 'bg-emerald-500'
                          : exam.syllabus_covered_pct >= 40
                          ? 'bg-blue-500'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${exam.syllabus_covered_pct}%` }}
                    />
                  </div>
                </div>

                {/* Notes */}
                {exam.notes && (
                  <p className="mt-3 text-[11px] text-slate-400 italic bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
                    "{exam.notes}"
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      <AddExamModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        examToEdit={examToEdit}
      />

      <ConfirmDialog
        isOpen={Boolean(examToDelete)}
        onClose={() => setExamToDelete(null)}
        onConfirm={() => {
          if (examToDelete) {
            deleteExam(examToDelete);
            setExamToDelete(null);
          }
        }}
        title="Delete Examination Paper"
        message="Are you sure you want to remove this examination entry?"
        confirmLabel="Delete Exam"
        isDestructive={true}
      />
    </div>
  );
};

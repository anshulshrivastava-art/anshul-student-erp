import React, { useState } from 'react';
import { useErp } from '../context/ErpContext';
import { OFFICIAL_CGPA } from '../constants';
import {
  GraduationCap,
  Award,
  TrendingUp,
  AlertTriangle,
  Plus,
  Edit2,
  CheckCircle2,
  BookOpen,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { AddSemesterModal } from '../components/academics/AddSemesterModal';
import { Modal } from '../components/common/Modal';
import { SemesterResult } from '../types';

export const AcademicsPage: React.FC = () => {
  const { semesterResults, updateSemesterResult } = useErp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSem, setEditingSem] = useState<SemesterResult | null>(null);

  // Edit form state
  const [sgpa, setSgpa] = useState('');
  const [credits, setCredits] = useState(24);
  const [backPapers, setBackPapers] = useState(0);
  const [finalResult, setFinalResult] = useState('');
  const [notes, setNotes] = useState('');

  const handleOpenEdit = (sem: SemesterResult) => {
    setEditingSem(sem);
    setSgpa(sem.sgpa.toFixed(2));
    setCredits(sem.credits);
    setBackPapers(sem.back_papers);
    setFinalResult(sem.final_result || '');
    setNotes(sem.notes || '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSem) return;

    await updateSemesterResult(editingSem.id, {
      sgpa: parseFloat(sgpa),
      credits: Number(credits),
      back_papers: Number(backPapers),
      final_result: finalResult.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    setEditingSem(null);
  };

  // SGPA trend data
  const chartData = semesterResults.map((s) => ({
    name: `Sem ${s.semester_number}`,
    sgpa: s.sgpa,
    officialCGPA: OFFICIAL_CGPA,
    credits: s.credits,
  }));

  const totalBackPapers = semesterResults.reduce((acc, s) => acc + s.back_papers, 0);
  const totalEarnedCredits = semesterResults.reduce((acc, s) => acc + s.credits, 0);

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Amity Academic Record
            </span>
            <span className="text-xs text-slate-400">Official Amizone Verified</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            SGPA & CGPA Analytics
          </h2>
          <p className="text-xs text-slate-400">
            University examination performance, credit weights, and promotional result tracking.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Semester</span>
        </button>
      </div>

      {/* OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Official CGPA */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md relative overflow-hidden">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Official Cumulative GPA (CGPA)
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-white font-mono">
              {OFFICIAL_CGPA.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400">/ 10.00</span>
          </div>
          <p className="text-xs text-blue-400 mt-2 font-medium">
            Official Amizone Override preserved
          </p>
        </div>

        {/* Total Earned Credits */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Completed Academic Credits
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-emerald-400 font-mono">
              {totalEarnedCredits}
            </span>
            <span className="text-xs text-slate-400">Credits</span>
          </div>
          <p className="text-xs text-slate-400 mt-2 font-medium">
            Across {semesterResults.length} registered semesters
          </p>
        </div>

        {/* Active Back Papers */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Active Back Papers
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span
              className={`text-3xl font-black font-mono ${
                totalBackPapers > 0 ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {totalBackPapers}
            </span>
            <span className="text-xs text-slate-400">Back Paper</span>
          </div>
          <p className="text-xs text-slate-400 mt-2 font-medium">
            {totalBackPapers > 0 ? 'Re-appearing in Odd 2026-27' : 'Clean record'}
          </p>
        </div>
      </div>

      {/* PERFORMANCE TREND CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SGPA Progression Chart */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-slate-200">
                Semester SGPA vs Official CGPA
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">Benchmark: 6.81</span>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="sgpaChartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis domain={[5, 10]} stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '10px' }}
                />
                <Area
                  type="monotone"
                  dataKey="sgpa"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#sgpaChartGrad)"
                  name="SGPA"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Semester Earned Credits Bar Chart */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-violet-400" />
              <h3 className="text-sm font-bold text-slate-200">
                Credit Weight Distribution
              </h3>
            </div>
            <span className="text-xs text-slate-400">Total: {totalEarnedCredits} Credits</span>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis domain={[0, 30]} stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '10px' }}
                />
                <Bar dataKey="credits" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Credits" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SEMESTER-WISE DETAILED BREAKDOWN CARDS */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
          Semester Result History & Official Status
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {semesterResults.map((sem) => (
            <div
              key={sem.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-extrabold text-white">
                      Semester {sem.semester_number}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        sem.back_papers === 0
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {sem.back_papers === 0 ? 'Passed' : `${sem.back_papers} Back Paper`}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Credits: <strong className="text-slate-200">{sem.credits}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black font-mono text-blue-400">
                    {sem.sgpa.toFixed(2)}
                  </span>
                  <button
                    onClick={() => handleOpenEdit(sem)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Status info */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1">
                <p className="text-slate-300">
                  University Status:{' '}
                  <span className="font-semibold text-slate-100">{sem.final_result || 'Pass'}</span>
                </p>
                {sem.notes && <p className="text-slate-400 italic text-[11px]">{sem.notes}</p>}
                {sem.cgpa_override && (
                  <p className="text-blue-400 text-[11px] font-mono">
                    Official CGPA Recorded: {sem.cgpa_override.toFixed(2)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* EDIT SEMESTER MODAL */}
      <Modal
        isOpen={Boolean(editingSem)}
        onClose={() => setEditingSem(null)}
        title={`Edit Semester ${editingSem?.semester_number} Record`}
        subtitle="Update university score, credits, or academic status"
        maxWidth="md"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Semester SGPA
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={sgpa}
                onChange={(e) => setSgpa(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Credits
              </label>
              <input
                type="number"
                value={credits}
                onChange={(e) => setCredits(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Back Papers Count
            </label>
            <input
              type="number"
              min="0"
              max="10"
              value={backPapers}
              onChange={(e) => setBackPapers(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              University Result Status
            </label>
            <input
              type="text"
              value={finalResult}
              onChange={(e) => setFinalResult(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Notes / Back Paper Subject Details
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setEditingSem(null)}
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
        </form>
      </Modal>

      <AddSemesterModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
};

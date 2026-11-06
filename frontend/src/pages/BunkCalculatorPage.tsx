import React, { useState } from 'react';
import { useErp } from '../context/ErpContext';
import { simulateAttendance, calculateSafeBunks, calculateClassesNeeded } from '../utils/attendance';
import {
  Calculator,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  Sliders,
  Sparkles,
} from 'lucide-react';

export const BunkCalculatorPage: React.FC = () => {
  const { attendanceStats, settings, updateSettings } = useErp();

  const currentThreshold = settings?.attendance_threshold || 0.75;
  const [thresholdInput, setThresholdInput] = useState<number>(currentThreshold * 100);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    attendanceStats[0]?.subject.id || ''
  );

  // Simulation controls
  const [futureMissed, setFutureMissed] = useState<number>(1);
  const [futureAttended, setFutureAttended] = useState<number>(0);

  const selectedStat = attendanceStats.find((s) => s.subject.id === selectedSubjectId) || attendanceStats[0];

  const handleUpdateThreshold = async (newVal: number) => {
    setThresholdInput(newVal);
    await updateSettings({ attendance_threshold: newVal / 100 });
  };

  // Run simulation
  const simulation = selectedStat
    ? simulateAttendance(
        selectedStat.total_present,
        selectedStat.total_classes,
        futureAttended,
        futureMissed,
        currentThreshold
      )
    : null;

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-violet-500/10 text-violet-400 border border-violet-500/20">
              Attendance Simulator & Margin Engine
            </span>
            <span className="text-xs text-slate-400">Strict Integer & Epsilon Math</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            Bunk & Attendance Calculator
          </h2>
          <p className="text-xs text-slate-400">
            Simulate future class absences or make-up lectures to maintain your mandatory threshold.
          </p>
        </div>

        {/* Global Threshold Controller */}
        <div className="flex items-center gap-3 bg-slate-900 p-3 rounded-2xl border border-slate-800 shrink-0">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Required Threshold
            </span>
            <span className="text-lg font-extrabold text-blue-400 font-mono">
              {thresholdInput.toFixed(0)}%
            </span>
          </div>
          <input
            type="range"
            min="60"
            max="95"
            step="1"
            value={thresholdInput}
            onChange={(e) => handleUpdateThreshold(Number(e.target.value))}
            className="w-28 sm:w-36 accent-blue-500 cursor-pointer"
          />
        </div>
      </div>

      {/* INTERACTIVE SIMULATOR CARD */}
      {selectedStat && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/30 border border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                Simulate Scenario for Course:
              </span>
              <div className="mt-1 flex items-center gap-3">
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm font-bold text-white focus:outline-none focus:border-blue-500"
                >
                  {attendanceStats.map((s) => (
                    <option key={s.subject.id} value={s.subject.id}>
                      {s.subject.short_name} — {s.subject.name} ({s.percentageFormatted})
                    </option>
                  ))}
                </select>
                <span className="text-xs text-slate-400 font-mono">
                  Current: {selectedStat.total_present} / {selectedStat.total_classes}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block font-sans">Current Safe Bunks</span>
                <span className="text-lg font-extrabold text-emerald-400">{selectedStat.safe_bunks}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block font-sans">Classes Needed</span>
                <span className="text-lg font-extrabold text-rose-400">{selectedStat.classes_needed}</span>
              </div>
            </div>
          </div>

          {/* Simulation Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-rose-400 flex items-center gap-1.5">
                  <TrendingDown className="w-4 h-4" />
                  <span>Simulate Missing Classes</span>
                </span>
                <span className="text-sm font-bold text-rose-400 font-mono">
                  +{futureMissed} {futureMissed === 1 ? 'class' : 'classes'}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="15"
                value={futureMissed}
                onChange={(e) => setFutureMissed(Number(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400">
                Tests how far your percentage drops if you bunk the next {futureMissed} lectures.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" />
                  <span>Simulate Attending Extra Classes</span>
                </span>
                <span className="text-sm font-bold text-emerald-400 font-mono">
                  +{futureAttended} {futureAttended === 1 ? 'class' : 'classes'}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="15"
                value={futureAttended}
                onChange={(e) => setFutureAttended(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400">
                Tests how your percentage recovers if you attend extra makeup sessions.
              </p>
            </div>
          </div>

          {/* Simulation Outcome Projection */}
          {simulation && (
            <div className="p-4 rounded-2xl bg-slate-950/90 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`p-3 rounded-2xl border ${
                    simulation.projectedStatus === 'Critical'
                      ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                      : simulation.projectedStatus === 'Warning'
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                      : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                  }`}
                >
                  {simulation.projectedStatus === 'Critical' ? (
                    <ShieldAlert className="w-6 h-6" />
                  ) : (
                    <ShieldCheck className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Projected Outcome
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span
                      className={`text-2xl font-black font-mono ${
                        simulation.projectedStatus === 'Critical'
                          ? 'text-rose-400'
                          : simulation.projectedStatus === 'Warning'
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {simulation.projectedPercentageFormatted}
                    </span>
                    <span className="text-xs text-slate-400">
                      ({simulation.projectedPresent} / {simulation.projectedTotal} classes)
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-300 font-medium">
                {simulation.projectedStatus === 'Critical' ? (
                  <span className="text-rose-400 font-semibold">
                    ⚠️ Warning: You would fall below the {thresholdInput.toFixed(0)}% threshold!
                  </span>
                ) : (
                  <span className="text-emerald-400 font-semibold">
                    ✅ Safe: You remain above the {thresholdInput.toFixed(0)}% threshold with {simulation.projectedSafeBunks} bunks remaining.
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ALL SUBJECTS BUNK MATRIX */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
          Complete Safe Bunk & Recovery Matrix (Threshold: {thresholdInput.toFixed(0)}%)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {attendanceStats.map((stat) => {
            const isNoData = stat.total_classes === 0;

            return (
              <div
                key={stat.subject.id}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        {stat.subject.short_name}
                      </h4>
                      <p className="text-xs text-slate-400 truncate max-w-[200px]">
                        {stat.subject.name}
                      </p>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-lg font-black font-mono ${
                          isNoData
                            ? 'text-slate-500'
                            : stat.status === 'Critical'
                            ? 'text-rose-400'
                            : stat.status === 'Warning'
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {stat.percentageFormatted}
                      </span>
                      <p className="text-[10px] text-slate-500">
                        {stat.total_present} / {stat.total_classes}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Safe Bunk Margin</span>
                      <span className="font-mono font-bold text-emerald-400 text-sm">
                        {isNoData ? '0' : stat.safe_bunks} classes
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Classes Needed</span>
                      <span className="font-mono font-bold text-rose-400 text-sm">
                        {isNoData ? '0' : stat.classes_needed} classes
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px]">
                  <span
                    className={`font-semibold ${
                      stat.status === 'Critical'
                        ? 'text-rose-400'
                        : stat.status === 'Warning'
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    ● {stat.status}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedSubjectId(stat.subject.id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-blue-400 hover:text-blue-300 font-semibold"
                  >
                    Simulate
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

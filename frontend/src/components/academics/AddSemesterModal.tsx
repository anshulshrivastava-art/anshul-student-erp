import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useErp } from '../../context/ErpContext';

interface AddSemesterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddSemesterModal: React.FC<AddSemesterModalProps> = ({ isOpen, onClose }) => {
  const { semesterResults, addSemesterResult } = useErp();

  const nextSem = semesterResults.length > 0
    ? Math.max(...semesterResults.map((s) => s.semester_number)) + 1
    : 3;

  const [semesterNumber, setSemesterNumber] = useState(nextSem);
  const [sgpa, setSgpa] = useState<string>('7.50');
  const [credits, setCredits] = useState<number>(24);
  const [backPapers, setBackPapers] = useState<number>(0);
  const [finalResult, setFinalResult] = useState<string>('Pass');
  const [notes, setNotes] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedSgpa = parseFloat(sgpa);
    if (isNaN(parsedSgpa) || parsedSgpa < 0 || parsedSgpa > 10) return;

    await addSemesterResult({
      semester_number: semesterNumber,
      sgpa: parsedSgpa,
      credits: Number(credits),
      back_papers: Number(backPapers),
      final_result: finalResult.trim() || undefined,
      notes: notes.trim() || undefined,
      is_official: true,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Semester Academic Record"
      subtitle="Record university SGPA, credit weights, and promotional result"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Semester Number
            </label>
            <input
              type="number"
              min="1"
              max="8"
              value={semesterNumber}
              onChange={(e) => setSemesterNumber(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Semester SGPA (0.00 – 10.00)
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
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Earned Credits
            </label>
            <input
              type="number"
              min="0"
              max="40"
              value={credits}
              onChange={(e) => setCredits(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
              required
            />
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
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Final University Result Text
          </label>
          <input
            type="text"
            placeholder="e.g. Pass / Promoted with Academic Probation"
            value={finalResult}
            onChange={(e) => setFinalResult(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Remarks / Back Paper Details (Optional)
          </label>
          <textarea
            rows={2}
            placeholder="e.g. Back paper in Applied Mathematics II, re-appearing in Odd 2026-27"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>

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
            className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-md"
          >
            Add Semester
          </button>
        </div>
      </form>
    </Modal>
  );
};

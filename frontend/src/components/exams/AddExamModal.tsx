import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useErp } from '../../context/ErpContext';
import { Exam } from '../../types';

interface AddExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  examToEdit?: Exam | null;
}

export const AddExamModal: React.FC<AddExamModalProps> = ({
  isOpen,
  onClose,
  examToEdit,
}) => {
  const { subjects, upsertExam } = useErp();

  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [examName, setExamName] = useState('');
  const [examDate, setExamDate] = useState('2026-12-08');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('13:00');
  const [room, setRoom] = useState('ASET Examination Hall');
  const [status, setStatus] = useState<Exam['preparation_status']>('In Progress');
  const [syllabusPct, setSyllabusPct] = useState(50);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (examToEdit) {
      setSubjectId(examToEdit.subject_id);
      setExamName(examToEdit.exam_name);
      setExamDate(examToEdit.exam_date);
      setStartTime(examToEdit.start_time);
      setEndTime(examToEdit.end_time);
      setRoom(examToEdit.room);
      setStatus(examToEdit.preparation_status);
      setSyllabusPct(examToEdit.syllabus_covered_pct);
      setNotes(examToEdit.notes || '');
    } else {
      setSubjectId(subjects[0]?.id || '');
      setExamName('');
      setExamDate('2026-12-08');
      setStartTime('10:00');
      setEndTime('13:00');
      setRoom('ASET Examination Hall');
      setStatus('In Progress');
      setSyllabusPct(50);
      setNotes('');
    }
  }, [examToEdit, subjects]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await upsertExam({
      id: examToEdit?.id,
      subject_id: subjectId,
      exam_name: examName.trim() || `${subjects.find((s) => s.id === subjectId)?.name} Final Exam`,
      exam_date: examDate,
      start_time: startTime,
      end_time: endTime,
      room,
      preparation_status: status,
      syllabus_covered_pct: Number(syllabusPct),
      notes: notes.trim(),
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={examToEdit ? 'Edit Examination' : 'Schedule Examination'}
      subtitle="Track end term exams, paper dates, and syllabus readiness"
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
                {s.code} — {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Paper Title / Name
          </label>
          <input
            type="text"
            placeholder="e.g. End Term Theory Examination / Mid Term Test"
            value={examName}
            onChange={(e) => setExamName(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Exam Date
            </label>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Venue / Room
            </label>
            <input
              type="text"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Start Time
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              End Time
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Preparation Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            >
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Prepared">Prepared</option>
              <option value="Mastered">Mastered</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Syllabus Covered ({syllabusPct}%)
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={syllabusPct}
              onChange={(e) => setSyllabusPct(Number(e.target.value))}
              className="w-full accent-blue-500 mt-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Revision Notes / Key Topics
          </label>
          <textarea
            rows={2}
            placeholder="Important units, formulas, previous year question trends"
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
            Save Exam
          </button>
        </div>
      </form>
    </Modal>
  );
};

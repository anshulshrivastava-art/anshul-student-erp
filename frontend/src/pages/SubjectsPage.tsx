import React, { useState } from 'react';
import { useErp } from '../context/ErpContext';
import { Subject } from '../types';
import {
  BookOpen,
  Edit2,
  Check,
  X,
  User,
  MapPin,
  FileText,
  Search,
  Sparkles,
  Info,
} from 'lucide-react';
import { Modal } from '../components/common/Modal';

export const SubjectsPage: React.FC = () => {
  const { subjects, updateSubject } = useErp();

  const [searchQuery, setSearchQuery] = useState('');
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [code, setCode] = useState('');
  const [amizoneCode, setAmizoneCode] = useState('');
  const [facultyName, setFacultyName] = useState('');
  const [facultyInitials, setFacultyInitials] = useState('');
  const [defaultRoom, setDefaultRoom] = useState('');
  const [notes, setNotes] = useState('');

  const handleOpenEdit = (s: Subject) => {
    setEditingSubject(s);
    setName(s.name);
    setShortName(s.short_name);
    setCode(s.code);
    setAmizoneCode(s.amizone_code || '');
    setFacultyName(s.faculty_name);
    setFacultyInitials(s.faculty_initials || '');
    setDefaultRoom(s.default_room || '');
    setNotes(s.notes || '');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject) return;

    await updateSubject(editingSubject.id, {
      name: name.trim(),
      short_name: shortName.trim(),
      code: code.trim(),
      amizone_code: amizoneCode.trim() || undefined,
      faculty_name: facultyName.trim(),
      faculty_initials: facultyInitials.trim() || undefined,
      default_room: defaultRoom.trim(),
      notes: notes.trim() || undefined,
    });
    setEditingSubject(null);
  };

  const filteredSubjects = subjects.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.short_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.faculty_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Academic Curriculum Directory
            </span>
            <span className="text-xs text-slate-400">Amity ASET Mappings</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            Subjects & Faculty Directory
          </h2>
          <p className="text-xs text-slate-400">
            Official course codes, faculty initials, rooms, and separate tracking for ML Lab and Library/CCA.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search subject or faculty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* SUBJECTS DIRECTORY GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredSubjects.map((s) => (
          <div
            key={s.id}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 font-mono text-xs font-bold">
                      {s.code || 'NO-CODE'}
                    </span>
                    {s.is_lab && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-violet-500/20 text-violet-400 border border-violet-500/30">
                        Lab Course
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-white mt-2">
                    {s.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Short: <strong className="text-slate-200">{s.short_name}</strong>
                  </p>
                </div>

                <button
                  onClick={() => handleOpenEdit(s)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Edit course details"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              {/* Faculty Info */}
              <div className="mt-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <User className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="font-semibold text-slate-100">{s.faculty_name}</span>
                  {s.faculty_initials && (
                    <span className="px-1.5 py-0.2 rounded bg-slate-800 font-mono text-[10px] text-slate-300">
                      {s.faculty_initials}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Default Room: <strong className="text-amber-300 font-mono">{s.default_room || 'Room TBA'}</strong></span>
                </div>
              </div>

              {/* Notes / Specialization info */}
              {(s.notes || s.amizone_code) && (
                <div className="mt-3 text-[11px] text-slate-400 leading-relaxed bg-slate-950/30 p-2.5 rounded-lg border border-slate-800/60">
                  {s.amizone_code && (
                    <p className="text-slate-300">
                      Amizone Title: <span className="italic">{s.amizone_code}</span>
                    </p>
                  )}
                  {s.notes && <p className="text-slate-400 mt-0.5">{s.notes}</p>}
                </div>
              )}
            </div>

            {/* Attendance baseline footer */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Amizone Nov 6 Baseline:</span>
              <span className="font-mono font-semibold text-slate-200">
                {s.opening_present} / {s.opening_total}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* EDIT MODAL */}
      <Modal
        isOpen={Boolean(editingSubject)}
        onClose={() => setEditingSubject(null)}
        title="Edit Subject & Faculty Details"
        subtitle="Keep room numbers and faculty assignments accurate with Amizone"
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Course Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Short Name / Tag
              </label>
              <input
                type="text"
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Course Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Faculty Name
              </label>
              <input
                type="text"
                value={facultyName}
                onChange={(e) => setFacultyName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Faculty Initials
              </label>
              <input
                type="text"
                placeholder="e.g. RMK, STA, GNS"
                value={facultyInitials}
                onChange={(e) => setFacultyInitials(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Default Lecture Room
            </label>
            <input
              type="text"
              placeholder="e.g. E-404, 102, E-205"
              value={defaultRoom}
              onChange={(e) => setDefaultRoom(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Amizone Course Title / Note
            </label>
            <input
              type="text"
              value={amizoneCode}
              onChange={(e) => setAmizoneCode(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Additional Notes
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
              onClick={() => setEditingSubject(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-md"
            >
              Save Subject
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

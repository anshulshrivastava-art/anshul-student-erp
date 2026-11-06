import React, { useState } from 'react';
import { useErp } from '../context/ErpContext';
import {
  ListTodo,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  ExternalLink,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { AddAssignmentModal } from '../components/assignments/AddAssignmentModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Assignment, AssignmentStatus } from '../types';

export const AssignmentsPage: React.FC = () => {
  const { assignments, upsertAssignment, deleteAssignment, subjects } = useErp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | AssignmentStatus>('All');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [assignmentToEdit, setAssignmentToEdit] = useState<Assignment | null>(null);
  const [assignmentToDelete, setAssignmentToDelete] = useState<string | null>(null);

  const handleOpenEdit = (a: Assignment) => {
    setAssignmentToEdit(a);
    setIsAddModalOpen(true);
  };

  const handleAddNew = () => {
    setAssignmentToEdit(null);
    setIsAddModalOpen(true);
  };

  const handleStatusChange = async (assignment: Assignment, newStatus: AssignmentStatus) => {
    await upsertAssignment({ ...assignment, status: newStatus });
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // Filtering
  const filtered = assignments.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.description && a.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSubject =
      selectedSubjectId === 'All' || a.subject_id === selectedSubjectId;

    const matchesStatus =
      statusFilter === 'All' || a.status === statusFilter;

    return matchesSearch && matchesSubject && matchesStatus;
  });

  const completedCount = assignments.filter((a) => a.status === 'Completed').length;
  const overdueCount = assignments.filter(
    (a) => a.due_date < todayStr && a.status !== 'Completed'
  ).length;

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Task Submissions Tracker
            </span>
            <span className="text-xs text-slate-400">
              {completedCount} of {assignments.length} Completed
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            Assignment Management
          </h2>
          <p className="text-xs text-slate-400">
            Track lab reports, problem sets, and course submissions with priority deadlines.
          </p>
        </div>

        <button
          onClick={handleAddNew}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Assignment</span>
        </button>
      </div>

      {/* OVERVIEW METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Total Submissions
            </span>
            <p className="text-2xl font-black text-white font-mono mt-0.5">
              {assignments.length}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Completed
            </span>
            <p className="text-2xl font-black text-emerald-400 font-mono mt-0.5">
              {completedCount}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Overdue / Pending
            </span>
            <p
              className={`text-2xl font-black font-mono mt-0.5 ${
                overdueCount > 0 ? 'text-rose-400' : 'text-slate-300'
              }`}
            >
              {overdueCount} Overdue
            </p>
          </div>
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search assignments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Subject Filter */}
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.short_name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Statuses</option>
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* ASSIGNMENTS LIST */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-10 rounded-2xl bg-slate-900 border border-slate-800 text-center">
            <ListTodo className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">No assignments found</p>
            <p className="text-xs text-slate-500 mt-1">Add a new assignment using the button above.</p>
          </div>
        ) : (
          filtered.map((a) => {
            const sub = subjects.find((s) => s.id === a.subject_id);
            const isOverdue = a.due_date < todayStr && a.status !== 'Completed';

            return (
              <div
                key={a.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  a.status === 'Completed'
                    ? 'bg-slate-900/60 border-slate-800 opacity-75'
                    : isOverdue
                    ? 'bg-rose-950/20 border-rose-500/40 shadow-sm'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/15 text-blue-400 border border-blue-500/30">
                      {sub?.short_name || 'Subject'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        a.priority === 'Urgent'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : a.priority === 'High'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {a.priority} Priority
                    </span>
                    {isOverdue && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-600/30 text-rose-300 border border-rose-500/40">
                        Overdue
                      </span>
                    )}
                  </div>

                  <h3
                    className={`text-base font-bold text-white ${
                      a.status === 'Completed' ? 'line-through text-slate-400' : ''
                    }`}
                  >
                    {a.title}
                  </h3>

                  {a.description && (
                    <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                      {a.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-400" />
                      <span>Due: {a.due_date}</span>
                    </span>
                    {a.attachment_url && (
                      <a
                        href={a.attachment_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-400 hover:underline flex items-center gap-1 font-sans font-medium"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View Attachment</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Status Switcher & Controls */}
                <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
                  <select
                    value={a.status}
                    onChange={(e) => handleStatusChange(a, e.target.value as any)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-semibold focus:outline-none focus:border-blue-500"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(a)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setAssignmentToDelete(a.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modals */}
      <AddAssignmentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        assignmentToEdit={assignmentToEdit}
      />

      <ConfirmDialog
        isOpen={Boolean(assignmentToDelete)}
        onClose={() => setAssignmentToDelete(null)}
        onConfirm={() => {
          if (assignmentToDelete) {
            deleteAssignment(assignmentToDelete);
            setAssignmentToDelete(null);
          }
        }}
        title="Delete Assignment"
        message="Are you sure you want to delete this assignment entry?"
        confirmLabel="Delete Assignment"
        isDestructive={true}
      />
    </div>
  );
};

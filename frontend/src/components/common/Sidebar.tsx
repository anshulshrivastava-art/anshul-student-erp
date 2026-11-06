import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useErp } from '../../context/ErpContext';
import {
  LayoutDashboard,
  CalendarDays,
  CheckSquare,
  Calculator,
  BookOpen,
  GraduationCap,
  Award,
  ListTodo,
  CalendarCheck,
  Settings,
  LogOut,
  ChevronRight,
  Shield,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { profile, signOut } = useAuth();
  const { activeGroup } = useErp();

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/timetable', label: 'Weekly Timetable', icon: CalendarDays },
    { to: '/attendance', label: 'Attendance Tracker', icon: CheckSquare },
    { to: '/bunk-calculator', label: 'Bunk Calculator', icon: Calculator },
    { to: '/subjects', label: 'Subjects & Faculty', icon: BookOpen },
    { to: '/academics', label: 'SGPA & CGPA Analytics', icon: GraduationCap },
    { to: '/exams', label: 'Examinations', icon: Award },
    { to: '/assignments', label: 'Assignments', icon: ListTodo },
    { to: '/planner', label: 'Study Planner', icon: CalendarCheck },
    { to: '/settings', label: 'System Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-slate-900 border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header / Brand */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-glow-blue shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold tracking-wide text-white font-mono">
                ANSHUL ERP
              </h2>
              <p className="text-[10px] text-slate-400 font-medium tracking-tight">
                Academic Command Center
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Student Mini Profile Card */}
        <div className="p-4 mx-3 my-3 rounded-2xl bg-gradient-to-b from-slate-800/60 to-slate-950/60 border border-slate-800 flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-800 border-2 border-blue-500/30 flex items-center justify-center text-sm font-bold text-white shadow-md">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-blue-400 text-lg">A</span>
              )}
            </div>
            <span
              className={`absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold text-white border border-slate-900 ${
                activeGroup === 1 ? 'bg-blue-600' : 'bg-violet-600'
              }`}
            >
              G{activeGroup}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-100 truncate">{profile?.full_name || 'Anshul Shrivastava'}</p>
            <p className="text-[11px] text-slate-400 truncate">{profile?.student_id || 'ASET-IT-2026-031'}</p>
            <p className="text-[10px] text-blue-400/90 font-medium truncate">
              {profile?.branch || 'B.Tech (IT)'} • Sem {profile?.semester || 3}
            </p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{link.label}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-40" />
              </NavLink>
            );
          })}
        </nav>

        {/* Footer / Logout */}
        <div className="p-3 border-t border-slate-800/80">
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors border border-transparent hover:border-rose-500/20"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sign Out Command Center</span>
          </button>
        </div>
      </aside>
    </>
  );
};

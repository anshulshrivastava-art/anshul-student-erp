import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useErp } from '../../context/ErpContext';
import { getGreeting, formatKolkata } from '../../utils/date';
import {
  Bell,
  Sun,
  Moon,
  Users,
  Menu,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  X,
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { profile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { now, activeGroup, switchGroup, notifications } = useErp();
  const [showNotifications, setShowNotifications] = useState(false);

  const greeting = getGreeting();
  const timeString = formatKolkata(now, 'hh:mm:ss a');
  const dateString = formatKolkata(now, 'EEE, dd MMM yyyy');

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3 transition-colors">
      <div className="flex items-center justify-between gap-4">
        {/* Left Side: Mobile Menu Button & Title / Greeting */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Toggle navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 hidden sm:inline-block">
                ODD SEMESTER 2026-27
              </span>
              <span className="text-xs text-slate-400 hidden md:inline-block">
                {profile?.branch || 'B.Tech (IT)'} • Sem {profile?.semester || 3} ({profile?.section || 'A'})
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-1.5">
              <span>{greeting},</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-violet-400">
                {profile?.full_name?.split(' ')[0] || 'Anshul'}
              </span>
            </h1>
          </div>
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Asia/Kolkata Clock */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-mono font-medium text-slate-100">{timeString}</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">{dateString}</span>
            <span className="px-1 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 font-mono">IST</span>
          </div>

          {/* Group 1 / Group 2 Quick Switcher */}
          <div className="flex items-center bg-slate-950/70 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => switchGroup(1)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeGroup === 1
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Switch to Group 1 timetable"
            >
              <Users className="w-3 h-3" />
              <span>G1</span>
            </button>
            <button
              onClick={() => switchGroup(2)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeGroup === 2
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Switch to Group 2 timetable"
            >
              <Users className="w-3 h-3" />
              <span>G2</span>
            </button>
          </div>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors relative"
            aria-label="Toggle theme"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors relative"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl z-50 p-4 animate-scale-in">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-100">Notifications</h4>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/20 text-blue-400">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-slate-400 hover:text-slate-200 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-3 space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">No notifications right now.</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-start gap-2.5">
                          {n.type === 'exam' && <Calendar className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />}
                          {n.type === 'attendance' && <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />}
                          {n.type === 'assignment' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
                          <div>
                            <p className="text-xs font-semibold text-slate-200">{n.title}</p>
                            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Student Avatar (Mini) */}
          <div className="flex items-center gap-2 pl-1 border-l border-slate-800">
            <div className="w-8 h-8 rounded-xl overflow-hidden bg-gradient-to-tr from-blue-600 to-indigo-600 border border-slate-700 flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
              ) : (
                <span>{profile?.full_name?.charAt(0) || 'A'}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

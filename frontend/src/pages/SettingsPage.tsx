import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useErp } from '../context/ErpContext';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import { uploadProfilePhoto } from '../../src/services/storage';
import { isSupabaseConfigured } from '../services/supabase';
import {
  Settings,
  User,
  Camera,
  Moon,
  Sun,
  Shield,
  Bell,
  Database,
  Save,
  LogOut,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, profile, updateProfile, updateAvatar, signOut } = useAuth();
  const { settings, updateSettings, activeGroup, switchGroup } = useErp();
  const { theme, toggleTheme } = useTheme();
  const { showToast, requestBrowserNotifications } = useNotification();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [fullName, setFullName] = useState(profile?.full_name || 'Anshul Shrivastava');
  const [degree, setDegree] = useState(profile?.degree || 'B.Tech');
  const [branch, setBranch] = useState(profile?.branch || 'B.Tech (IT)');
  const [semester, setSemester] = useState(profile?.semester || 3);
  const [section, setSection] = useState(profile?.section || 'A');
  const [studentId, setStudentId] = useState(profile?.student_id || 'ASET-IT-2026-031');
  const [university, setUniversity] = useState(profile?.university || 'Amity University Gwalior');
  const [threshold, setThreshold] = useState<number>((settings?.attendance_threshold || 0.75) * 100);

  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        full_name: fullName.trim(),
        degree: degree.trim(),
        branch: branch.trim(),
        semester: Number(semester),
        section: section.trim(),
        student_id: studentId.trim(),
        university: university.trim(),
      });
      await updateSettings({
        attendance_threshold: threshold / 100,
      });
      showToast('success', 'Profile Updated', 'Academic identity information saved successfully.');
    } catch (err: any) {
      showToast('error', 'Update Failed', err.message || 'Could not update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast('error', 'File Too Large', 'Please select an image smaller than 2 MB.');
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const publicUrl = await uploadProfilePhoto(user.id, file);
      await updateAvatar(publicUrl);
      showToast('success', 'Photo Updated', 'Profile photo uploaded and cached.');
    } catch (err: any) {
      showToast('error', 'Upload Failed', err.message || 'Could not save photo.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Command Center Preferences
          </span>
          <span className="text-xs text-slate-400">Settings & Persistence</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
          System & Student Settings
        </h2>
        <p className="text-xs text-slate-400">
          Manage your student profile, group preferences, attendance thresholds, and security.
        </p>
      </div>

      {/* AVATAR & PHOTO UPLOAD SECTION */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md flex flex-col sm:flex-row items-center gap-6">
        <div className="relative group shrink-0">
          <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-800 border-2 border-blue-500/40 flex items-center justify-center shadow-glow-blue">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-12 h-12 text-slate-500" />
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingPhoto}
            className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md transition-all hover:scale-105"
            title="Change photo"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handlePhotoUpload}
          />
        </div>

        <div className="space-y-1 text-center sm:text-left flex-1">
          <h3 className="text-base font-bold text-white">{profile?.full_name || 'Anshul Shrivastava'}</h3>
          <p className="text-xs text-slate-400">
            {profile?.branch || 'B.Tech (IT)'} • Semester {profile?.semester || 3} • Section {profile?.section || 'A'}
          </p>
          <p className="text-[11px] text-blue-400/80">
            Photo is uploaded to Supabase Storage <code className="bg-slate-950 px-1 py-0.5 rounded text-[10px]">profile-photos</code> and cached in local memory.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploadingPhoto}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700 shrink-0"
        >
          {isUploadingPhoto ? 'Uploading...' : 'Change Photo'}
        </button>
      </div>

      {/* PROFILE DETAILS FORM */}
      <form onSubmit={handleProfileSubmit} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-blue-400" />
            <span>Academic Identity Details</span>
          </h3>
          <span className="text-xs text-slate-500">Editable profile attributes</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              University Name
            </label>
            <input
              type="text"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Degree & Branch
            </label>
            <input
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Student ID / Enrollment
            </label>
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Current Semester
            </label>
            <input
              type="number"
              min="1"
              max="8"
              value={semester}
              onChange={(e) => setSemester(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Section
            </label>
            <input
              type="text"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
              required
            />
          </div>
        </div>

        {/* Attendance Threshold & Group Preference */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-800">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Default Timetable Group
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => switchGroup(1)}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  activeGroup === 1
                    ? 'bg-blue-600/30 border-blue-500 text-blue-300 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400'
                }`}
              >
                Group 1
              </button>
              <button
                type="button"
                onClick={() => switchGroup(2)}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  activeGroup === 2
                    ? 'bg-violet-600/30 border-violet-500 text-violet-300 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400'
                }`}
              >
                Group 2
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Attendance Threshold: {threshold.toFixed(0)}%
              </label>
              <span className="text-[10px] text-slate-500">Default 75%</span>
            </div>
            <input
              type="range"
              min="60"
              max="90"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full accent-blue-500 mt-2 cursor-pointer"
            />
          </div>
        </div>

        <div className="flex items-center justify-end pt-3 border-t border-slate-800">
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-md flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Academic Profile'}</span>
          </button>
        </div>
      </form>

      {/* NOTIFICATIONS & PREFERENCES */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Bell className="w-4 h-4 text-violet-400" />
          <span>Alerts & Notifications</span>
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
            <div>
              <p className="font-semibold text-slate-200">Browser Desktop Notifications</p>
              <p className="text-slate-400 text-[11px]">
                Receive alerts for upcoming classes and critical exam reminders while using the web app.
              </p>
            </div>
            <button
              onClick={requestBrowserNotifications}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors shrink-0"
            >
              Request Permission
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
            <div>
              <p className="font-semibold text-slate-200">Theme Appearance</p>
              <p className="text-slate-400 text-[11px]">Currently using {theme} mode.</p>
            </div>
            <button
              onClick={toggleTheme}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors flex items-center gap-1.5"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-400" />}
              <span>Toggle {theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* SUPABASE CLOUD & PERSISTENCE DOCUMENTATION */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-3">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-400" />
          <span>Cloud Persistence & Supabase Settings</span>
        </h3>

        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-2 leading-relaxed">
          <p>
            Status:{' '}
            <strong className={isSupabaseConfigured ? 'text-emerald-400' : 'text-amber-400'}>
              {isSupabaseConfigured
                ? 'Connected to Supabase PostgreSQL & Auth with RLS'
                : 'Local Mode Active (Browser LocalStorage Engine)'}
            </strong>
          </p>
          <p className="text-slate-400">
            <strong>Session Persistence:</strong> To keep you signed in indefinitely without repeat logins:
            Configure your Supabase dashboard at <code>Auth &gt; Sessions</code>: disable "Time-box user sessions", set JWT expiry to 3600s, and ensure refresh-token rotation is enabled.
          </p>
        </div>
      </div>

      {/* LOGOUT */}
      <div className="pt-2 text-right">
        <button
          onClick={() => signOut()}
          className="px-5 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-white hover:bg-rose-600 transition-colors border border-rose-500/30 flex items-center gap-2 ml-auto"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of Student ERP</span>
        </button>
      </div>
    </div>
  );
};

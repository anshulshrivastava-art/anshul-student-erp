import React, { useState } from 'react';
import { Database, AlertTriangle, X, ExternalLink } from 'lucide-react';
import { isSupabaseConfigured } from '../../services/supabase';

export const FallbackBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (isSupabaseConfigured || dismissed) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border-b border-amber-500/30 text-amber-200 px-4 py-2 text-xs flex items-center justify-between shadow-sm relative z-40">
      <div className="flex items-center gap-2 max-w-4xl mx-auto flex-1">
        <Database className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
        <span className="font-medium text-slate-100">
          Not connected to Supabase — data is saved only in this browser.
        </span>
        <span className="hidden md:inline text-amber-300/80">
          All changes, attendance, and timetable customisations persist locally in this device. Add Supabase credentials in <code className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-300">.env</code> for cloud sync.
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-amber-400/80 hover:text-amber-200 transition-colors p-1"
        title="Dismiss notice"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

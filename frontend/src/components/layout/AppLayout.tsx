import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../common/Sidebar';
import { Navbar } from '../common/Navbar';
import { FallbackBanner } from '../common/FallbackBanner';
import { FinishSetupModal } from '../common/FinishSetupModal';
import { useAuth } from '../../context/AuthContext';

export const AppLayout: React.FC = () => {
  const { profile } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [finishSetupDismissed, setFinishSetupDismissed] = useState(false);

  // If avatar_url is missing, trigger setup modal once
  const showFinishSetup = Boolean(profile && !profile.avatar_url && !finishSetupDismissed);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col">
      {/* Fallback Banner if Supabase is unconfigured */}
      <FallbackBanner />

      <div className="flex-1 flex">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all duration-300">
          <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Finish Setup Profile Photo Modal */}
      <FinishSetupModal
        isOpen={showFinishSetup}
        onClose={() => setFinishSetupDismissed(true)}
      />
    </div>
  );
};

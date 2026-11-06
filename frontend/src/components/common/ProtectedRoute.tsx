import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield } from 'lucide-react';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex flex-col items-center justify-center text-slate-100 p-4">
        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col items-center gap-4 text-center animate-pulse">
          <div className="p-4 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white shadow-glow-blue">
            <Shield className="w-10 h-10 animate-bounce" />
          </div>
          <div>
            <h2 className="text-base font-extrabold tracking-wide font-mono text-white">
              ANSHUL STUDENT ERP
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Restoring persistent session & authenticating...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

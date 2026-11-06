import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { ErpProvider } from './context/ErpContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute, PublicOnlyRoute } from './components/common/ProtectedRoute';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { TimetablePage } from './pages/TimetablePage';
import { AttendancePage } from './pages/AttendancePage';
import { BunkCalculatorPage } from './pages/BunkCalculatorPage';
import { SubjectsPage } from './pages/SubjectsPage';
import { AcademicsPage } from './pages/AcademicsPage';
import { ExamsPage } from './pages/ExamsPage';
import { AssignmentsPage } from './pages/AssignmentsPage';
import { StudyPlannerPage } from './pages/StudyPlannerPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';

export function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <NotificationProvider>
          <AuthProvider>
            <ErpProvider>
              <Routes>
                {/* Public Auth Routes */}
                <Route
                  path="/login"
                  element={
                    <PublicOnlyRoute>
                      <LoginPage />
                    </PublicOnlyRoute>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <PublicOnlyRoute>
                      <RegisterPage />
                    </PublicOnlyRoute>
                  }
                />
                <Route
                  path="/forgot-password"
                  element={
                    <PublicOnlyRoute>
                      <ForgotPasswordPage />
                    </PublicOnlyRoute>
                  }
                />

                {/* Protected Dashboard & Module Routes */}
                <Route
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/timetable" element={<TimetablePage />} />
                  <Route path="/attendance" element={<AttendancePage />} />
                  <Route path="/bunk-calculator" element={<BunkCalculatorPage />} />
                  <Route path="/subjects" element={<SubjectsPage />} />
                  <Route path="/academics" element={<AcademicsPage />} />
                  <Route path="/exams" element={<ExamsPage />} />
                  <Route path="/assignments" element={<AssignmentsPage />} />
                  <Route path="/planner" element={<StudyPlannerPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ErpProvider>
          </AuthProvider>
        </NotificationProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;

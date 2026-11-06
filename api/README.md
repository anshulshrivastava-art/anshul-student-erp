# API Directory — Anshul Student ERP

This directory houses the shared TypeScript data models, API endpoints, and client communication helpers used across the frontend client and backend services.

---

## 📁 Files

- **`types.ts`**: Single source of truth for all data contracts:
  - `StudentProfile`, `UserSettings`
  - `Subject`, `TimetableEntry`, `DayOverride`
  - `AttendanceRecord`, `SubjectAttendanceStats`
  - `SemesterResult`, `Exam`, `Assignment`, `StudyTask`
- **`endpoints.ts`**: Standardized URL routes for all REST endpoints (`/api/auth`, `/api/timetable`, `/api/attendance`, `/api/exams`, etc.).
- **`client.ts`**: Reusable typed `ErpApiClient` class with authentication headers, error handling, and promise-based response resolution.

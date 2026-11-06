import express, { Request, Response } from 'express';
import cors from 'cors';
import { INITIAL_PROFILE, INITIAL_SUBJECTS, OFFICIAL_CGPA, EXAM_TARGET, ASIA_KOLKATA_TZ } from './data/seedData.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// In-memory persistent state (can be wired to Supabase or PostgreSQL)
let profile = { ...INITIAL_PROFILE };
let subjects = [...INITIAL_SUBJECTS];
let attendanceRecords: any[] = [];
let dayOverrides: any[] = [];
let exams = [
  {
    id: 'exam-1',
    subject_id: 'subj-1',
    exam_name: 'Applied Mathematics III (End Term)',
    exam_date: '2026-12-08',
    start_time: '10:00',
    end_time: '13:00',
    room: 'ASET Hall 1',
    preparation_status: 'In Progress',
    syllabus_covered_pct: 65,
    notes: 'Official Countdown Target: 08 Dec 2026',
  },
];
let assignments = [
  {
    id: 'assign-1',
    subject_id: 'subj-4',
    title: 'Graph Traversal & Dijkstra Algorithm Implementation',
    description: 'Implement BFS, DFS and Dijkstra algorithm with complexity analysis.',
    assigned_date: '2026-11-01',
    due_date: '2026-11-12',
    status: 'In Progress',
    priority: 'High',
  },
];
let studyTasks = [
  {
    id: 'task-1',
    subject_id: 'subj-8',
    title: 'Revise Karnaugh Maps and Sequential Circuits',
    target_date: '2026-11-06',
    duration_minutes: 60,
    priority: 'High',
    is_completed: false,
  },
];

// 1. Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    name: 'Anshul Student ERP Backend API',
    timezone: ASIA_KOLKATA_TZ,
    timestamp: new Date().toISOString(),
  });
});

// 2. Profile & Identity
app.get('/api/profile', (req: Request, res: Response) => {
  res.json(profile);
});

app.put('/api/profile', (req: Request, res: Response) => {
  profile = { ...profile, ...req.body, updated_at: new Date().toISOString() };
  res.json(profile);
});

// 3. Subjects & Baselines
app.get('/api/subjects', (req: Request, res: Response) => {
  res.json(subjects);
});

// 4. Attendance & Bunk Calculations
app.get('/api/attendance/stats', (req: Request, res: Response) => {
  const threshold = 0.75;
  const stats = subjects.map((sub) => {
    const dated = attendanceRecords.filter((r) => r.subject_id === sub.id && r.status !== 'Not Marked');
    const dated_present = dated.filter((r) => r.status === 'Present').length;
    const dated_absent = dated.filter((r) => r.status === 'Absent').length;
    const total_present = sub.opening_present + dated_present;
    const total_classes = sub.opening_total + dated_present + dated_absent;

    let percentage: number | null = null;
    let safe_bunks = 0;
    let classes_needed = 0;

    if (total_classes > 0) {
      percentage = (total_present / total_classes) * 100;
      if (total_present / total_classes >= threshold) {
        safe_bunks = Math.max(0, Math.floor(total_present / threshold - total_classes + 1e-9));
      } else {
        classes_needed = Math.max(0, Math.ceil((threshold * total_classes - total_present) / (1 - threshold) - 1e-9));
      }
    }

    return {
      subject: sub,
      opening_present: sub.opening_present,
      opening_total: sub.opening_total,
      dated_present,
      dated_absent,
      total_classes,
      total_present,
      percentage,
      percentageFormatted: percentage !== null ? `${percentage.toFixed(1)}%` : 'No data',
      safe_bunks,
      classes_needed,
      status: percentage === null ? 'Safe' : percentage < 75 ? 'Critical' : percentage < 80 ? 'Warning' : 'Safe',
    };
  });

  res.json(stats);
});

app.post('/api/attendance/mark', (req: Request, res: Response) => {
  const { subject_id, date, slot_start, status, note } = req.body;
  const newRecord = {
    id: `att-${Date.now()}`,
    subject_id,
    date,
    slot_start,
    status,
    note,
    created_at: new Date().toISOString(),
  };
  attendanceRecords.unshift(newRecord);
  res.status(201).json(attendanceRecords);
});

// 5. Academics (SGPA & Official CGPA)
app.get('/api/academics/semesters', (req: Request, res: Response) => {
  res.json([
    { semester_number: 1, sgpa: 7.33, credits: 24, back_papers: 0, final_result: 'Pass' },
    { semester_number: 2, sgpa: 6.25, credits: 24, back_papers: 1, final_result: 'Promoted with Academic Probation', cgpa_override: OFFICIAL_CGPA },
  ]);
});

// 6. Examinations
app.get('/api/exams', (req: Request, res: Response) => {
  res.json(exams);
});

app.post('/api/exams', (req: Request, res: Response) => {
  const newExam = { id: `exam-${Date.now()}`, ...req.body };
  exams.push(newExam);
  res.status(201).json(exams);
});

// 7. Assignments
app.get('/api/assignments', (req: Request, res: Response) => {
  res.json(assignments);
});

app.post('/api/assignments', (req: Request, res: Response) => {
  const newAssign = { id: `assign-${Date.now()}`, ...req.body };
  assignments.push(newAssign);
  res.status(201).json(assignments);
});

// 8. Study Planner
app.get('/api/planner/tasks', (req: Request, res: Response) => {
  res.json(studyTasks);
});

app.post('/api/planner/tasks', (req: Request, res: Response) => {
  const newTask = { id: `task-${Date.now()}`, ...req.body, is_completed: false };
  studyTasks.push(newTask);
  res.status(201).json(studyTasks);
});

// Start Server
app.listen(PORT, () => {
  console.log(`[Anshul ERP Backend] Running at http://localhost:${PORT}`);
  console.log(`[Timezone] Grounded to ${ASIA_KOLKATA_TZ}`);
});

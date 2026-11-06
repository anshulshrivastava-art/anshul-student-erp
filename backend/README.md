# Backend API Server — Anshul Student ERP

A lightweight, robust Node.js & Express REST API server providing academic endpoints for timetable scheduling, attendance tracking, bunk calculations, semester analytics, and study planning.

---

## 🚀 Key Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health check & Asia/Kolkata timezone verification |
| `GET` | `/api/profile` | Student academic profile (Anshul Shrivastava, B.Tech IT, III A) |
| `PUT` | `/api/profile` | Update profile information |
| `GET` | `/api/subjects` | Complete 16-course directory with Amity faculty & rooms |
| `GET` | `/api/attendance/stats` | Individual attendance stats, safe bunks & classes needed |
| `POST`| `/api/attendance/mark` | Record dated attendance on top of 6 Nov 2026 baselines |
| `GET` | `/api/academics/semesters` | SGPA history & official 6.81 CGPA |
| `GET` | `/api/exams` | Examination papers & preparation tracking |
| `POST`| `/api/exams` | Schedule examination paper |
| `GET` | `/api/assignments` | Course assignments with priority & deadlines |
| `POST`| `/api/assignments` | Create assignment submission task |
| `GET` | `/api/planner/tasks` | Revision study tasks |
| `POST`| `/api/planner/tasks` | Add focused study block |

---

## 🛠️ How to Run

```bash
# 1. Install dependencies
npm install

# 2. Run in development mode (with hot-reload)
npm run dev

# 3. Production build & start
npm run build
npm start
```
Server runs by default on `http://localhost:4000`.

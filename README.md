# Personal Tracker (V1)

> **"Record what I planned, what I completed, and how much work I have done over time."**

A focused, high-performance personal tracker web application designed for students and self-learners to organize their daily schedule, track completed learning activities, and visualize their progress over time.

---

## Key Features

### 1. Daily Tasks
* Add, edit, delete, and toggle tasks for any particular date.
* Track **Task Name**, **Category**, **Date**, **Completion Status**, **Planned Duration**, and **Actual Duration**.
* Navigate seamlessly between **Today**, **Yesterday**, **Tomorrow**, or any custom date using the integrated date picker.
* Color-coded category tags and priority indicators (**High**, **Medium**, **Low**).
* Instant **"Log to Activity"** shortcut on completed tasks.

### 2. Academic Timetable
* A recurring weekly timetable for college and university classes.
* Supports **Day of Week**, **Start Time**, **End Time**, **Subject**, **Classroom/Lab**, and **Faculty/Professor**.
* Fully reusable week-over-week without needing to re-create entries daily.

### 3. Career Timetable
* A logically separate recurring timetable dedicated to career-focused learning and building:
  * **DSA** (LeetCode, algorithmic problem solving)
  * **Machine Learning** (model training, math, PyTorch)
  * **Python** (deep dives, scripts)
  * **Projects** (hack sessions, development)
  * **Open Source** (PRs, issues)
* Structured weekly columns with clear time slots.

### 4. Activity / Work Log
* A dedicated journal of work actually completed.
* Record **Date**, **Category**, **Title**, **Duration in minutes**, and **Output / Quantity** (e.g. "2 problems", "30 pages", "1 PR").
* Searchable and filterable by category.

### 5. 52-Week GitHub/LeetCode-Style Activity Heatmap
* Visual intensity representation of daily work over the entire year (5 intensity levels).
* Dynamically calculated from activity records (no duplicate storage tables).
* **Interactive Day Inspector**: Click on any cell in the heatmap to slide open a drawer showing all activities completed on that date.
* **Streak Counter**: Automatically calculates your continuous active streak and longest streak.

### 6. Mission Control Dashboard
* Today's highlights: Work hours logged today, active streak badge, tasks remaining, and 7-day focus.
* **Unified Today's Schedule**: Combines today's Academic and Career timetable slots in chronological order.
* Interactive task checklist and recent activity stream.

### 7. Data Safety & Demo Data
* Built-in **JSON Export & Import** for easy backups and transfers.
* One-click **Load Sample Dataset** to explore all features immediately.

---

## Tech Stack

* **Frontend**: HTML5, Vanilla CSS, Modern JavaScript (ES Modules).
* **Design**: Dark theme with high contrast, glassmorphism, responsive grid layout, and Plus Jakarta Sans typography.
* **Dev Server**: Vite (`npm run dev`).
* **Persistence**: Offline-first `localStorage`.

---

## Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (version 18 or newer)

### Installation & Launch

1. Clone the repository and navigate to the project root:
   ```bash
   git clone https://github.com/sathishreddyakepati/personal-tracker-2k26.git
   cd personal-tracker-2k26
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```text
   http://localhost:5173/
   ```

### Building for Production
```bash
npm run build
```
The optimized production bundle will be generated in the `dist/` directory.

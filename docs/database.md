# Database & Storage Specification — Personal Tracker V1

In accordance with [`requirements.md`](file:///d:/GSOC2027Resources/Projects/personal-tracker-2k26/docs/requirements.md), external databases and authentication are deferred to V2. V1 utilizes browser `localStorage` alongside JSON file backup/restore.

---

## 1. Storage Keys

| Key | Type | Description |
| :--- | :--- | :--- |
| `pt_tasks_v1` | `JSON Array` | List of all planned and completed daily task objects |
| `pt_academic_tt_v1` | `JSON Array` | Recurring weekly college/academic timetable slots |
| `pt_career_tt_v1` | `JSON Array` | Recurring weekly career focus timetable slots |
| `pt_activities_v1` | `JSON Array` | Historical work log records powering the heatmap |
| `pt_has_seeded_v1` | `String ("true")` | Flag indicating whether demo seed data was initialized |

---

## 2. Entity Schemas

### Daily Task (`pt_tasks_v1`)

```typescript
interface Task {
  id: string;               // Unique ID, e.g. "task_1726800000_abc"
  title: string;            // Task name (e.g. "Solve 2 LeetCode Tree Problems")
  category: string;         // "Academic" | "DSA" | "ML" | "Python" | "Project" | "Open Source" | "Certification" | "Personal"
  date: string;             // YYYY-MM-DD
  status: "pending" | "completed";
  priority: "low" | "medium" | "high";
  plannedDuration: number;  // Duration in minutes (e.g. 45)
  actualDuration: number;   // Time spent in minutes (e.g. 50)
  notes?: string;           // Optional notes / links
  createdAt: string;        // ISO 8601 Timestamp
  completedAt?: string;     // ISO 8601 Timestamp (when status is completed)
}
```

### Academic Timetable Slot (`pt_academic_tt_v1`)

```typescript
interface AcademicSlot {
  id: string;               // Unique ID, e.g. "acad_1726800000_abc"
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
  startTime: string;        // 24-hour format "HH:MM", e.g. "09:00"
  endTime: string;          // 24-hour format "HH:MM", e.g. "10:00"
  subject: string;          // Subject name, e.g. "Operating Systems"
  classroom?: string;       // Optional, e.g. "Room 302"
  faculty?: string;         // Optional, e.g. "Dr. Sharma"
  notes?: string;           // Optional instructions / syllabus topics
}
```

### Career Timetable Slot (`pt_career_tt_v1`)

```typescript
interface CareerSlot {
  id: string;               // Unique ID, e.g. "career_1726800000_abc"
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
  startTime: string;        // 24-hour format "HH:MM", e.g. "18:00"
  endTime: string;          // 24-hour format "HH:MM", e.g. "19:30"
  activity: string;         // Activity description, e.g. "LeetCode Daily & Trees"
  category: string;         // "DSA" | "ML" | "Python" | "Project" | "Open Source" | "Certification"
  notes?: string;           // Optional sprint goals
}
```

### Activity / Work Log Record (`pt_activities_v1`)

```typescript
interface Activity {
  id: string;               // Unique ID, e.g. "act_1726800000_abc"
  date: string;             // YYYY-MM-DD
  title: string;            // Name of work done, e.g. "Solved 2 LeetCode Tree Problems"
  category: string;         // "DSA" | "Academic" | "ML" | "Python" | "Project" | "Open Source" | "Certification" | "Personal"
  duration: number;         // Total active duration in minutes (e.g. 90)
  quantity?: string;        // Optional output metric, e.g. "2 problems", "1 notebook"
  notes?: string;           // Key takeaways or links
  timestamp: string;        // ISO 8601 Timestamp
}
```

---

## 3. Dynamic Heatmap Generation

Rather than creating a separate heatmap database table, intensity levels are calculated dynamically on-the-fly from `pt_activities_v1`:

$$\text{Daily Total Minutes} = \sum_{\text{activities on date}} \text{duration}$$

* **Level 0**: $0 \text{ mins}$
* **Level 1**: $1 - 45 \text{ mins}$
* **Level 2**: $46 - 90 \text{ mins}$
* **Level 3**: $91 - 150 \text{ mins}$
* **Level 4**: $> 150 \text{ mins}$

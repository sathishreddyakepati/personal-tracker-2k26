# UI Design

## 1. Design Goal

The interface should be simple, clean, responsive, and focused on daily use.

The application should provide quick access to tasks, timetables, activities, and progress without requiring unnecessary navigation.

---

# 2. V1 Screens

V1 will contain four primary screens:

1. Dashboard
2. Tasks
3. Timetables
4. Activity

Additional screens will be introduced in later versions.

---

# 3. Dashboard

The Dashboard is the main screen of the application.

## Main Sections

### Today's Tasks

Display:

- Pending tasks
- Completed tasks
- Overdue tasks

### Today's Schedule

Display timetable slots relevant to the current day.

### Recent Activity

Display recently recorded activities.

### Weekly Progress

Display a simple summary of the current week.

Example:

- Tasks completed
- LeetCode activity
- DSA activity
- ML activity
- Total activity

### Streak

Display the current activity streak.

---

# 4. Tasks Screen

The Tasks screen is responsible for task management.

## Sections

- Today
- Upcoming
- Completed
- Overdue

## Task Information

Each task can contain:

- Title
- Description
- Due date
- Priority
- Category
- Completion status

## Actions

Users can:

- Add a task
- Edit a task
- Delete a task
- Complete a task
- Reopen a task

---

# 5. Timetable Screen

The Timetable screen manages multiple independent timetables.

## Timetable List

Example:

- College
- Personal
- Exam Preparation

Users can:

- Create a timetable
- Open a timetable
- Edit a timetable
- Delete a timetable

## Timetable View

A timetable displays:

- Monday
- Tuesday
- Wednesday
- Thursday
- Friday
- Saturday
- Sunday

Each day contains its scheduled time slots.

## Timetable Slot

A slot contains:

- Activity/subject name
- Start time
- End time
- Category
- Optional notes

Users can:

- Add a slot
- Edit a slot
- Delete a slot

---

# 6. Activity Screen

The Activity screen provides the user's historical activity.

## Heatmap

The main component is a GitHub/LeetCode-style activity heatmap.

Activity intensity should be represented using multiple levels.

Example:

```text
Less activity  →  More activity

□  ░  ▒  ▓  █
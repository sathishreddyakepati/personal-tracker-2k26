# Requirements

## 1. Project Goal

The project aims to build a personal productivity and learning tracker that helps students manage daily tasks, multiple timetables, track completed activities, and visualize their progress over time.

The application should provide a simple way to manage academic, personal, and learning activities from a single place.

---

## 2. Target Users

### Primary Users

Students who want to manage:

- Academic tasks
- Assignments
- Study schedules
- Personal learning
- Projects
- Daily activities
- Long-term progress

### Secondary Users

Individuals who are interested in tracking their personal activities, routines, tasks, and progress.

---

# 3. Core Concepts

The application is built around four main concepts:

### Task

A task represents something the user needs to accomplish.

Example:

- Solve 2 LeetCode problems
- Complete OS assignment
- Finish ML lecture

### Timetable

A timetable represents when activities are planned to happen.

A user can create multiple timetables.

Examples:

- College
- Personal
- Exam Preparation
- Project Schedule

### Activity

An activity represents something the user actually did.

Examples:

- Solved 2 LeetCode problems
- Studied DSA for 1 hour
- Practiced ML for 45 minutes

### Heatmap

The heatmap is a visual representation of the user's activity over time.

The heatmap should be generated from activity data rather than storing separate heatmap records.

---

# 4. V1 Features

## 4.1 Daily Task Tracking

Users should be able to:

- Create tasks
- Edit tasks
- Delete tasks
- Mark tasks as completed
- Mark completed tasks as incomplete
- Set a due date
- Set task priority
- Assign a category
- View today's tasks
- View upcoming tasks
- View completed tasks
- View overdue tasks

### Example Categories

- College
- DSA
- LeetCode
- ML
- Project
- Personal

---

## 4.2 Multiple Timetables

Users should be able to create multiple independent timetables.

Examples:

- College Timetable
- Personal Timetable
- Exam Preparation
- Project Timetable

Each timetable should have:

- Name
- Description
- Days of the week
- Time slots
- Activity/subject name
- Start time
- End time
- Category
- Optional notes

Users should be able to:

- Create a timetable
- Edit a timetable
- Delete a timetable
- Add slots
- Edit slots
- Delete slots
- View a timetable
- Create recurring weekly slots

Timetables should be editable rather than hard-coded.

---

## 4.3 Activity Tracking

Users should be able to record activities they actually completed.

An activity may contain:

- Date
- Activity type/category
- Title
- Duration
- Quantity
- Optional notes

Examples:

- LeetCode - 2 problems
- DSA - 60 minutes
- ML - 45 minutes
- Project - 90 minutes

The activity system should be flexible enough to support different types of activities.

---

## 4.4 Activity Heatmap

The application should provide a GitHub/LeetCode-style activity heatmap.

The heatmap should:

- Display activity for each day
- Represent activity intensity using different levels
- Allow users to view historical activity
- Support monthly/yearly views
- Allow a user to select a day
- Show the activities recorded for the selected day

The heatmap should be calculated from activity records.

There should not be a separate `heatmap` database table in V1.

---

## 4.5 Dashboard

The dashboard should provide a quick overview of the user's current progress.

It should display:

- Today's tasks
- Completed tasks
- Upcoming tasks
- Today's timetable activities
- Recent activity
- Weekly progress
- Activity streak
- Basic activity summary

The dashboard should act as the main entry point to the application.

---

# 5. V2 Features

The following features are intentionally postponed until the core V1 system is stable.

## 5.1 Goals

Users can create weekly or monthly goals.

Examples:

- Solve 10 LeetCode problems
- Complete 3 DSA sessions
- Complete 3 ML sessions
- Study 15 hours this week

---

## 5.2 Statistics

Provide additional progress information such as:

- Tasks completed
- Task completion percentage
- Study time
- Activity counts
- LeetCode problems completed
- DSA sessions
- ML sessions
- Weekly comparisons
- Monthly summaries

---

## 5.3 Calendar / Day View

A calendar interface should allow users to select a date and see:

- Tasks
- Timetable slots
- Activities
- Daily progress

---

# 6. Future Features

These features may be considered after V2:

- User authentication
- Cloud synchronization
- PostgreSQL database
- PWA/mobile installation
- Notifications
- Data export and backup
- GitHub integration
- LeetCode integration
- Google Calendar integration
- Advanced analytics
- Multiple user support

These features are not part of the initial development scope.

---

# 7. Out of Scope for V1

The following should not be implemented during V1:

- Authentication
- Cloud synchronization
- PostgreSQL
- LeetCode API integration
- GitHub API integration
- Google Calendar integration
- AI assistant
- Notifications
- Advanced analytics
- Native mobile applications

The goal of V1 is to build a functional and maintainable core application before adding integrations and advanced features.

---

# 8. Non-Functional Requirements

## Usability

The application should be simple enough to use every day without unnecessary complexity.

## Responsiveness

The application should work on:

- Desktop
- Laptop
- Tablet
- Mobile

The initial implementation should use a responsive web application rather than separate native mobile and desktop applications.

## Maintainability

The project should have a clear separation between:

- Frontend
- Backend
- Database
- Documentation

## Performance

The application should remain responsive when handling normal personal usage and several years of activity records.

## Data Integrity

Tasks, timetable slots, and activities should be stored consistently and maintain correct relationships.

---

# 9. V1 Success Criteria

V1 will be considered successful when a user can:

1. Create and manage daily tasks.
2. Create multiple timetables.
3. Add and manage timetable slots.
4. Record completed activities.
5. View their activity through a heatmap.
6. See important information from a dashboard.
7. Use the application comfortably on both desktop and mobile screens.
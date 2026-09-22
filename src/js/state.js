// Centralized State Management with localStorage and Event Dispatching
import { getTodayDateString, addDays } from './utils/dateUtils.js';

export const CATEGORIES = [
  { id: 'Academic', name: 'Academic', color: '#38BDF8', bg: 'rgba(56, 189, 248, 0.15)' },
  { id: 'DSA', name: 'DSA', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)' },
  { id: 'ML', name: 'ML', color: '#EC4899', bg: 'rgba(236, 72, 153, 0.15)' },
  { id: 'Python', name: 'Python', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.15)' },
  { id: 'Project', name: 'Project', color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)' },
  { id: 'Open Source', name: 'Open Source', color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.15)' },
  { id: 'Certification', name: 'Certification', color: '#06B6D4', bg: 'rgba(6, 182, 212, 0.15)' },
  { id: 'Personal', name: 'Personal', color: '#64748B', bg: 'rgba(100, 116, 139, 0.15)' }
];

export function getCategoryStyle(categoryName) {
  const found = CATEGORIES.find(c => c.name.toLowerCase() === (categoryName || '').toLowerCase());
  return found || { id: categoryName, name: categoryName || 'General', color: '#94A3B8', bg: 'rgba(148, 163, 184, 0.15)' };
}

export const AMRITA_AIE_TIMETABLE = [
  // Monday
  { id: 'acad_mon_1', day: 'Monday', startTime: '08:25', endTime: '09:15', subject: '22AIE204 - Introduction to Computer Networks', classroom: 'AB-302', faculty: 'Dr. M. Rithani, Mr. M. Rahul Raj (Assist)', notes: 'Theory Class' },
  { id: 'acad_mon_2', day: 'Monday', startTime: '09:15', endTime: '10:05', subject: '22MAT220 - Mathematics for Computing 3', classroom: 'AB-302', faculty: 'Dr. K. Muthuselvan (T) / Dr. Gopi (L)', notes: 'Theory Class' },
  { id: 'acad_mon_3', day: 'Monday', startTime: '10:20', endTime: '11:10', subject: '22MAT220 - Mathematics for Computing 3', classroom: 'AB-302', faculty: 'Dr. K. Muthuselvan (T) / Dr. Gopi (L)', notes: 'Theory Class' },
  { id: 'acad_mon_4', day: 'Monday', startTime: '11:10', endTime: '12:00', subject: '22AIE205 - Introduction to Python', classroom: 'AB-302', faculty: 'Dr. M. Prabu, Ms. K. V. Meenatchi (Assist)', notes: 'Theory Class' },
  { id: 'acad_mon_5', day: 'Monday', startTime: '12:50', endTime: '15:20', subject: '22AIE202 - Operating Systems Lab', classroom: 'AIDISC LAB', faculty: 'Mr. M. Rajamanoharan, Mr. J. Nirmal Raj (Assist)', notes: '22AIE202-OS Practical Lab' },
  { id: 'acad_mon_6', day: 'Monday', startTime: '15:20', endTime: '16:10', subject: 'Remedial Classes', classroom: 'AB-302', faculty: 'AIE Faculty', notes: 'Doubt clearing / tutorials' },

  // Tuesday
  { id: 'acad_tue_1', day: 'Tuesday', startTime: '08:25', endTime: '09:15', subject: '22AIE203 - Data Structures & Algorithms 2', classroom: 'AB-302', faculty: 'Dr. G. Bharathi Mohan, Ms. K. V. Meenatchi (Assist)', notes: 'Theory Class' },
  { id: 'acad_tue_2', day: 'Tuesday', startTime: '09:15', endTime: '10:05', subject: '22MAT220 - Mathematics for Computing 3', classroom: 'AB-302', faculty: 'Dr. K. Muthuselvan (T) / Dr. Gopi (L)', notes: 'Theory Class' },
  { id: 'acad_tue_3', day: 'Tuesday', startTime: '10:20', endTime: '11:10', subject: '22AIE201 - Fundamentals of AI', classroom: 'AB-302', faculty: 'Dr. K. Gopalakrishnan, Ms. Jayashree S (Assist)', notes: 'Theory Class' },
  { id: 'acad_tue_4', day: 'Tuesday', startTime: '11:10', endTime: '12:00', subject: '22AIE202 - Operating Systems', classroom: 'AB-302', faculty: 'Mr. M. Rajamanoharan, Mr. J. Nirmal Raj (Assist)', notes: 'Theory Class' },
  { id: 'acad_tue_5', day: 'Tuesday', startTime: '12:50', endTime: '15:20', subject: '22AIE201 - Fundamentals of AI Lab', classroom: 'AIDISC LAB', faculty: 'Dr. K. Gopalakrishnan, Ms. Jayashree S (Assist)', notes: '22AIE201-FAI Practical Lab' },
  { id: 'acad_tue_6', day: 'Tuesday', startTime: '15:20', endTime: '16:10', subject: 'Remedial Classes', classroom: 'AB-302', faculty: 'AIE Faculty', notes: 'Doubt clearing / tutorials' },

  // Wednesday
  { id: 'acad_wed_1', day: 'Wednesday', startTime: '08:25', endTime: '09:15', subject: '22AIE201 - Fundamentals of AI', classroom: 'AB-302', faculty: 'Dr. K. Gopalakrishnan, Ms. Jayashree S (Assist)', notes: 'Theory Class' },
  { id: 'acad_wed_2', day: 'Wednesday', startTime: '09:15', endTime: '10:05', subject: '22MAT220 - Mathematics for Computing 3', classroom: 'AB-302', faculty: 'Dr. K. Muthuselvan (T) / Dr. Gopi (L)', notes: 'Theory Class' },
  { id: 'acad_wed_3', day: 'Wednesday', startTime: '10:20', endTime: '11:10', subject: '22BIO201 - Intelligence of Biological Systems - 1', classroom: 'AB-302', faculty: 'Dr. IR. Oviya', notes: 'Theory Class' },
  { id: 'acad_wed_4', day: 'Wednesday', startTime: '11:10', endTime: '12:00', subject: '22AIE203 - Data Structures & Algorithms 2', classroom: 'AB-302', faculty: 'Dr. G. Bharathi Mohan, Ms. K. V. Meenatchi (Assist)', notes: 'Theory Class' },
  { id: 'acad_wed_5', day: 'Wednesday', startTime: '12:50', endTime: '15:20', subject: '22AIE204 - Introduction to Computer Networks Lab', classroom: 'AIDISC LAB', faculty: 'Dr. M. Rithani, Mr. M. Rahul Raj (Assist)', notes: '22AIE204-ICN Practical Lab' },
  { id: 'acad_wed_6', day: 'Wednesday', startTime: '15:20', endTime: '16:10', subject: 'Remedial Classes', classroom: 'AB-302', faculty: 'AIE Faculty', notes: 'Doubt clearing / tutorials' },

  // Thursday
  { id: 'acad_thu_1', day: 'Thursday', startTime: '08:25', endTime: '09:15', subject: '22AIE204 - Introduction to Computer Networks', classroom: 'AB-302', faculty: 'Dr. M. Rithani, Mr. M. Rahul Raj (Assist)', notes: 'Theory Class' },
  { id: 'acad_thu_2', day: 'Thursday', startTime: '09:15', endTime: '10:05', subject: '23LSE201 - Life Skills: Aptitude / Verbal', classroom: 'AB-302', faculty: 'Mr. EV. Kamal Prasad / Ms. B. Gayathri', notes: 'B1: Aptitude (APT), B2: Verbal (VER)' },
  { id: 'acad_thu_3', day: 'Thursday', startTime: '10:20', endTime: '11:10', subject: '23LSE201 - Life Skills: Soft Skills / Aptitude', classroom: 'AB-302', faculty: 'Mr. Saptarshi Chatterjee / Mr. EV. Kamal Prasad', notes: 'B1: Soft Skills (SSK), B2: Aptitude (APT)' },
  { id: 'acad_thu_4', day: 'Thursday', startTime: '11:10', endTime: '12:00', subject: '23LSE201 - Life Skills: Verbal / Soft Skills', classroom: 'AB-302', faculty: 'Ms. B. Gayathri / Mr. Saptarshi Chatterjee', notes: 'B1: Verbal (VER), B2: Soft Skills (SSK)' },
  { id: 'acad_thu_5', day: 'Thursday', startTime: '12:50', endTime: '15:20', subject: '22AIE205 - Introduction to Python Lab', classroom: 'AIDISC LAB', faculty: 'Dr. M. Prabu, Ms. K. V. Meenatchi (Assist)', notes: '22AIE205-IPy Practical Lab' },
  { id: 'acad_thu_6', day: 'Thursday', startTime: '15:20', endTime: '16:10', subject: 'Remedial Classes', classroom: 'AB-302', faculty: 'AIE Faculty', notes: 'Doubt clearing / tutorials' },

  // Friday
  { id: 'acad_fri_1', day: 'Friday', startTime: '08:25', endTime: '09:15', subject: '22AIE202 - Operating Systems', classroom: 'AB-302', faculty: 'Mr. M. Rajamanoharan, Mr. J. Nirmal Raj (Assist)', notes: 'Theory Class' },
  { id: 'acad_fri_2', day: 'Friday', startTime: '09:15', endTime: '10:05', subject: '22ADM201 - Strategic Lessons from Mahabharata', classroom: 'AB-302', faculty: 'Dr. S. Thiagarajan', notes: 'Theory Class' },
  { id: 'acad_fri_3', day: 'Friday', startTime: '10:20', endTime: '11:10', subject: '22MAT220 - Mathematics for Computing 3', classroom: 'AB-302', faculty: 'Dr. K. Muthuselvan (T) / Dr. Gopi (L)', notes: 'Theory Class' },
  { id: 'acad_fri_4', day: 'Friday', startTime: '11:10', endTime: '12:00', subject: '22BIO201 - Intelligence of Biological Systems - 1', classroom: 'AB-302', faculty: 'Dr. IR. Oviya', notes: 'Theory Class' },
  { id: 'acad_fri_5', day: 'Friday', startTime: '12:50', endTime: '15:20', subject: '22AIE203 - Data Structures & Algorithms 2 Lab', classroom: 'AIDISC LAB', faculty: 'Dr. G. Bharathi Mohan, Ms. K. V. Meenatchi (Assist)', notes: '22AIE203-DSA 2 Practical Lab' },
  { id: 'acad_fri_6', day: 'Friday', startTime: '15:20', endTime: '16:10', subject: 'Remedial Classes', classroom: 'AB-302', faculty: 'AIE Faculty', notes: 'Doubt clearing / tutorials' }
];

class StateStore {
  constructor() {
    this.STORAGE_KEYS = {
      TASKS: 'pt_tasks_v2',
      ACADEMIC_TIMETABLE: 'pt_academic_tt_v2',
      CAREER_TIMETABLE: 'pt_career_tt_v2',
      ACTIVITIES: 'pt_activities_v2',
      INITIALIZED: 'pt_initialized_v2'
    };

    this.listeners = new Set();
    this.tasks = [];
    this.academicTimetable = [];
    this.careerTimetable = [];
    this.activities = [];

    this.init();
  }

  init() {
    // Purge old v1 test keys to guarantee clean slate
    const oldKeys = ['pt_tasks_v1', 'pt_academic_tt_v1', 'pt_career_tt_v1', 'pt_activities_v1', 'pt_has_seeded_v1'];
    oldKeys.forEach(k => {
      try {
        localStorage.removeItem(k);
      } catch (e) {
        // ignore
      }
    });

    const isInitialized = localStorage.getItem(this.STORAGE_KEYS.INITIALIZED);
    if (!isInitialized) {
      this.tasks = [];
      this.academicTimetable = [...AMRITA_AIE_TIMETABLE];
      this.careerTimetable = [];
      this.activities = [];
      this.save();
    } else {
      this.loadFromStorage();
    }
  }

  loadFromStorage() {
    try {
      this.tasks = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.TASKS) || '[]');
      this.academicTimetable = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.ACADEMIC_TIMETABLE) || '[]');
      this.careerTimetable = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.CAREER_TIMETABLE) || '[]');
      this.activities = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.ACTIVITIES) || '[]');
    } catch (e) {
      console.error('Error loading data from localStorage', e);
      this.tasks = [];
      this.academicTimetable = [];
      this.careerTimetable = [];
      this.activities = [];
    }
  }

  save() {
    try {
      localStorage.setItem(this.STORAGE_KEYS.TASKS, JSON.stringify(this.tasks));
      localStorage.setItem(this.STORAGE_KEYS.ACADEMIC_TIMETABLE, JSON.stringify(this.academicTimetable));
      localStorage.setItem(this.STORAGE_KEYS.CAREER_TIMETABLE, JSON.stringify(this.careerTimetable));
      localStorage.setItem(this.STORAGE_KEYS.ACTIVITIES, JSON.stringify(this.activities));
      localStorage.setItem(this.STORAGE_KEYS.INITIALIZED, 'true');
      this.notify();
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach(fn => {
      try {
        fn(this);
      } catch (err) {
        console.error('Listener callback error', err);
      }
    });
  }

  // --- Task Methods ---
  addTask(taskData) {
    const newTask = {
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      title: taskData.title.trim(),
      category: taskData.category || 'Academic',
      date: taskData.date || getTodayDateString(),
      status: taskData.status || 'pending', // pending | completed
      priority: taskData.priority || 'medium', // low | medium | high
      plannedDuration: Number(taskData.plannedDuration) || 0,
      actualDuration: Number(taskData.actualDuration) || 0,
      notes: taskData.notes ? taskData.notes.trim() : '',
      createdAt: new Date().toISOString(),
      completedAt: taskData.status === 'completed' ? new Date().toISOString() : null
    };

    this.tasks.unshift(newTask);
    this.save();
    return newTask;
  }

  updateTask(id, updates) {
    const idx = this.tasks.findIndex(t => t.id === id);
    if (idx !== -1) {
      const current = this.tasks[idx];
      const updated = { ...current, ...updates };

      if (updates.status === 'completed' && current.status !== 'completed') {
        updated.completedAt = new Date().toISOString();
        if (!updated.actualDuration && updated.plannedDuration) {
          updated.actualDuration = updated.plannedDuration;
        }
      } else if (updates.status === 'pending') {
        updated.completedAt = null;
      }

      this.tasks[idx] = updated;
      this.save();
      return updated;
    }
    return null;
  }

  deleteTask(id) {
    this.tasks = this.tasks.filter(t => t.id !== id);
    this.save();
  }

  toggleTaskCompletion(id) {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      const isCompleted = task.status === 'completed';
      return this.updateTask(id, {
        status: isCompleted ? 'pending' : 'completed'
      });
    }
    return null;
  }

  // --- Academic Timetable Methods ---
  addAcademicSlot(slotData) {
    const newSlot = {
      id: 'acad_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      day: slotData.day, // Monday .. Sunday
      startTime: slotData.startTime, // '09:00'
      endTime: slotData.endTime, // '10:00'
      subject: slotData.subject.trim(),
      classroom: slotData.classroom ? slotData.classroom.trim() : '',
      faculty: slotData.faculty ? slotData.faculty.trim() : '',
      notes: slotData.notes ? slotData.notes.trim() : ''
    };

    this.academicTimetable.push(newSlot);
    this.sortTimetable(this.academicTimetable);
    this.save();
    return newSlot;
  }

  updateAcademicSlot(id, updates) {
    const idx = this.academicTimetable.findIndex(s => s.id === id);
    if (idx !== -1) {
      this.academicTimetable[idx] = { ...this.academicTimetable[idx], ...updates };
      this.sortTimetable(this.academicTimetable);
      this.save();
      return this.academicTimetable[idx];
    }
    return null;
  }

  deleteAcademicSlot(id) {
    this.academicTimetable = this.academicTimetable.filter(s => s.id !== id);
    this.save();
  }

  // --- Career Timetable Methods ---
  addCareerSlot(slotData) {
    const newSlot = {
      id: 'career_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      day: slotData.day,
      startTime: slotData.startTime,
      endTime: slotData.endTime,
      activity: slotData.activity.trim(),
      category: slotData.category || 'DSA',
      notes: slotData.notes ? slotData.notes.trim() : ''
    };

    this.careerTimetable.push(newSlot);
    this.sortTimetable(this.careerTimetable);
    this.save();
    return newSlot;
  }

  updateCareerSlot(id, updates) {
    const idx = this.careerTimetable.findIndex(s => s.id === id);
    if (idx !== -1) {
      this.careerTimetable[idx] = { ...this.careerTimetable[idx], ...updates };
      this.sortTimetable(this.careerTimetable);
      this.save();
      return this.careerTimetable[idx];
    }
    return null;
  }

  deleteCareerSlot(id) {
    this.careerTimetable = this.careerTimetable.filter(s => s.id !== id);
    this.save();
  }

  sortTimetable(slots) {
    slots.sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  // --- Activity / Work Log Methods ---
  addActivity(actData) {
    const newActivity = {
      id: 'act_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      date: actData.date || getTodayDateString(),
      title: actData.title.trim(),
      category: actData.category || 'DSA',
      duration: Number(actData.duration) || 0, // in minutes
      quantity: actData.quantity ? actData.quantity.trim() : '',
      notes: actData.notes ? actData.notes.trim() : '',
      timestamp: new Date().toISOString()
    };

    this.activities.unshift(newActivity);
    this.save();
    return newActivity;
  }

  updateActivity(id, updates) {
    const idx = this.activities.findIndex(a => a.id === id);
    if (idx !== -1) {
      this.activities[idx] = {
        ...this.activities[idx],
        ...updates,
        duration: updates.duration !== undefined ? Number(updates.duration) : this.activities[idx].duration
      };
      this.save();
      return this.activities[idx];
    }
    return null;
  }

  deleteActivity(id) {
    this.activities = this.activities.filter(a => a.id !== id);
    this.save();
  }

  // --- Seed Demo Data ---
  loadSeedData() {
    const today = getTodayDateString();

    // 1. Academic Timetable (College)
    this.academicTimetable = [
      { id: 'acad_1', day: 'Monday', startTime: '09:00', endTime: '10:00', subject: 'Operating Systems', classroom: 'Lecture Hall 2', faculty: 'Dr. Sharma', notes: 'Process scheduling unit' },
      { id: 'acad_2', day: 'Monday', startTime: '10:15', endTime: '11:15', subject: 'Computer Networks', classroom: 'Room 304', faculty: 'Prof. Rao', notes: 'Transport layer protocols' },
      { id: 'acad_3', day: 'Monday', startTime: '14:00', endTime: '16:00', subject: 'Database Lab', classroom: 'Lab 3', faculty: 'Dr. Verma', notes: 'SQL Triggers & Stored Procedures' },
      
      { id: 'acad_4', day: 'Tuesday', startTime: '09:30', endTime: '10:30', subject: 'Software Engineering', classroom: 'Room 201', faculty: 'Dr. Mehra', notes: 'Agile & Scrum methodologies' },
      { id: 'acad_5', day: 'Tuesday', startTime: '11:30', endTime: '12:30', subject: 'Design & Analysis of Algorithms', classroom: 'Lecture Hall 1', faculty: 'Dr. Kulkarni', notes: 'Dynamic programming' },
      
      { id: 'acad_6', day: 'Wednesday', startTime: '09:00', endTime: '10:00', subject: 'Operating Systems', classroom: 'Lecture Hall 2', faculty: 'Dr. Sharma', notes: 'Memory management & paging' },
      { id: 'acad_7', day: 'Wednesday', startTime: '11:00', endTime: '13:00', subject: 'OS Lab', classroom: 'Lab 2', faculty: 'Dr. Sharma', notes: 'Linux system calls practice' },
      
      { id: 'acad_8', day: 'Thursday', startTime: '10:00', endTime: '11:00', subject: 'Computer Networks', classroom: 'Room 304', faculty: 'Prof. Rao', notes: 'Subnetting & routing' },
      { id: 'acad_9', day: 'Thursday', startTime: '14:00', endTime: '15:30', subject: 'Machine Learning Elective', classroom: 'Seminar Hall', faculty: 'Dr. Ananya', notes: 'Linear regression math' },

      { id: 'acad_10', day: 'Friday', startTime: '09:00', endTime: '10:00', subject: 'Design & Analysis of Algorithms', classroom: 'Lecture Hall 1', faculty: 'Dr. Kulkarni', notes: 'Graph algorithms' },
      { id: 'acad_11', day: 'Friday', startTime: '10:15', endTime: '11:15', subject: 'Software Engineering', classroom: 'Room 201', faculty: 'Dr. Mehra', notes: 'Sprint review' }
    ];

    // 2. Career Timetable
    this.careerTimetable = [
      { id: 'car_1', day: 'Monday', startTime: '18:00', endTime: '19:30', activity: 'LeetCode Daily & Tree Problems', category: 'DSA', notes: 'Solve 2 Mediums' },
      { id: 'car_2', day: 'Monday', startTime: '20:30', endTime: '22:00', activity: 'Personal Tracker Development', category: 'Project', notes: 'Frontend implementation' },
      
      { id: 'car_3', day: 'Tuesday', startTime: '18:00', endTime: '19:30', activity: 'PyTorch & Neural Networks', category: 'ML', notes: 'Implement CNN from scratch' },
      { id: 'car_4', day: 'Tuesday', startTime: '20:30', endTime: '21:30', activity: 'Python AsyncIO Deep Dive', category: 'Python', notes: 'Event loops & coroutines' },
      
      { id: 'car_5', day: 'Wednesday', startTime: '18:00', endTime: '19:30', activity: 'Dynamic Programming Practice', category: 'DSA', notes: 'Knapsack & LCS variants' },
      { id: 'car_6', day: 'Wednesday', startTime: '20:30', endTime: '22:00', activity: 'Open Source Contribution', category: 'Open Source', notes: 'Fix issue in target repo' },
      
      { id: 'car_7', day: 'Thursday', startTime: '18:00', endTime: '19:30', activity: 'Graph Algorithms BFS/DFS', category: 'DSA', notes: 'Disjoint set union' },
      { id: 'car_8', day: 'Thursday', startTime: '20:30', endTime: '22:00', activity: 'Project Architecture & UI Polish', category: 'Project', notes: 'Responsive CSS layout' },

      { id: 'car_9', day: 'Friday', startTime: '18:00', endTime: '19:30', activity: 'Weekly LeetCode Contest Prep', category: 'DSA', notes: 'Timed mock contest' },

      { id: 'car_10', day: 'Saturday', startTime: '10:00', endTime: '13:00', activity: 'Fullstack Project Hack Session', category: 'Project', notes: 'Deep focus coding block' },
      { id: 'car_11', day: 'Saturday', startTime: '16:00', endTime: '18:00', activity: 'ML Model Training & Evaluation', category: 'ML', notes: 'Evaluate loss curves' },

      { id: 'car_12', day: 'Sunday', startTime: '10:00', endTime: '12:00', activity: 'Weekly Code Review & Clean up', category: 'Open Source', notes: 'Submit PR' },
      { id: 'car_13', day: 'Sunday', startTime: '17:00', endTime: '18:30', activity: 'Next Week Preparation & Review', category: 'Personal', notes: 'Plan sprint targets' }
    ];

    // 3. Daily Tasks (Today and recent days)
    this.tasks = [
      {
        id: 'task_demo_1',
        title: 'Solve LeetCode #102 Binary Tree Level Order Traversal',
        category: 'DSA',
        date: today,
        status: 'completed',
        priority: 'high',
        plannedDuration: 45,
        actualDuration: 40,
        notes: 'Solved using standard BFS queue',
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString()
      },
      {
        id: 'task_demo_2',
        title: 'Complete OS Lab Assignment on Fork & Exec',
        category: 'Academic',
        date: today,
        status: 'completed',
        priority: 'high',
        plannedDuration: 60,
        actualDuration: 75,
        notes: 'Submitted on college portal',
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString()
      },
      {
        id: 'task_demo_3',
        title: 'Refactor Tracker UI State & CSS Tokens',
        category: 'Project',
        date: today,
        status: 'pending',
        priority: 'medium',
        plannedDuration: 90,
        actualDuration: 0,
        notes: 'Check dark theme contrasts and mobile responsiveness',
        createdAt: new Date().toISOString(),
        completedAt: null
      },
      {
        id: 'task_demo_4',
        title: 'Read PyTorch Chapter 4: Convolutional Neural Networks',
        category: 'ML',
        date: today,
        status: 'pending',
        priority: 'low',
        plannedDuration: 45,
        actualDuration: 0,
        notes: 'Make notes on pooling layers',
        createdAt: new Date().toISOString(),
        completedAt: null
      },
      {
        id: 'task_demo_5',
        title: 'Submit pull request for docs fix',
        category: 'Open Source',
        date: addDays(today, -1),
        status: 'completed',
        priority: 'medium',
        plannedDuration: 30,
        actualDuration: 35,
        notes: 'Merged successfully!',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        completedAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 'task_demo_6',
        title: 'Review Computer Networks Subnetting Notes',
        category: 'Academic',
        date: addDays(today, -1),
        status: 'completed',
        priority: 'medium',
        plannedDuration: 45,
        actualDuration: 50,
        notes: 'Practiced CIDR notation questions',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        completedAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 'task_demo_7',
        title: 'Review AWS Cloud Practitioner notes',
        category: 'Certification',
        date: addDays(today, -2),
        status: 'completed',
        priority: 'low',
        plannedDuration: 60,
        actualDuration: 60,
        notes: 'Finished IAM and S3 security modules',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        completedAt: new Date(Date.now() - 172800000).toISOString()
      }
    ];

    // 4. Realistic Activity Log for Heatmap visualization (Past 45 days with varying intensity)
    this.activities = [
      { id: 'act_today_1', date: today, title: 'Solved 2 LeetCode Tree Problems', category: 'DSA', duration: 45, quantity: '2 problems', notes: 'BFS & DFS', timestamp: new Date().toISOString() },
      { id: 'act_today_2', date: today, title: 'OS Fork System Calls Lab', category: 'Academic', duration: 75, quantity: '3 programs', notes: 'C language POSIX APIs', timestamp: new Date().toISOString() },
      
      { id: 'act_yest_1', date: addDays(today, -1), title: 'Open Source PR Contribution', category: 'Open Source', duration: 40, quantity: '1 PR', notes: 'Fixed markdown typos and links', timestamp: new Date().toISOString() },
      { id: 'act_yest_2', date: addDays(today, -1), title: 'Computer Networks CIDR Practice', category: 'Academic', duration: 60, quantity: '10 questions', notes: 'Subnet calculations', timestamp: new Date().toISOString() },

      { id: 'act_d2_1', date: addDays(today, -2), title: 'AWS Cloud Practitioner Modules', category: 'Certification', duration: 60, quantity: '2 modules', notes: 'Security & IAM', timestamp: new Date().toISOString() },
      { id: 'act_d2_2', date: addDays(today, -2), title: 'Binary Search Practice', category: 'DSA', duration: 90, quantity: '3 problems', notes: 'Rotated sorted array variants', timestamp: new Date().toISOString() },

      { id: 'act_d3_1', date: addDays(today, -3), title: 'Personal Tracker Frontend UI', category: 'Project', duration: 120, quantity: '4 components', notes: 'Built responsive layout', timestamp: new Date().toISOString() },
      { id: 'act_d4_1', date: addDays(today, -4), title: 'PyTorch Linear Models', category: 'ML', duration: 90, quantity: '1 notebook', notes: 'Gradient descent experiment', timestamp: new Date().toISOString() },
      { id: 'act_d4_2', date: addDays(today, -4), title: 'DSA Linked Lists', category: 'DSA', duration: 45, quantity: '2 problems', notes: 'Reversal and cycle detection', timestamp: new Date().toISOString() },

      { id: 'act_d5_1', date: addDays(today, -5), title: 'Operating Systems Scheduling', category: 'Academic', duration: 60, quantity: '1 lecture', notes: 'Round robin & SJF', timestamp: new Date().toISOString() },
      { id: 'act_d6_1', date: addDays(today, -6), title: 'Python Asyncio Task Queues', category: 'Python', duration: 75, quantity: '2 scripts', notes: 'Producer consumer pattern', timestamp: new Date().toISOString() },
      { id: 'act_d7_1', date: addDays(today, -7), title: 'LeetCode Weekly Contest', category: 'DSA', duration: 90, quantity: '3 problems', notes: 'Rank top 15%', timestamp: new Date().toISOString() },

      // Additional scattered activity across previous weeks
      { id: 'act_d9_1', date: addDays(today, -9), title: 'SQL Joins & Indexing Lab', category: 'Academic', duration: 90, quantity: '5 queries', notes: 'B-tree vs Hash index', timestamp: new Date().toISOString() },
      { id: 'act_d10_1', date: addDays(today, -10), title: 'Dynamic Programming 1D', category: 'DSA', duration: 120, quantity: '4 problems', notes: 'Climbing stairs & Coin change', timestamp: new Date().toISOString() },
      { id: 'act_d11_1', date: addDays(today, -11), title: 'Vite & Vanilla JS Architecture', category: 'Project', duration: 150, quantity: '6 files', notes: 'Full modular setup', timestamp: new Date().toISOString() },
      { id: 'act_d12_1', date: addDays(today, -12), title: 'Backpropagation Derivation', category: 'ML', duration: 60, quantity: '1 notebook', notes: 'Chain rule math', timestamp: new Date().toISOString() },
      { id: 'act_d14_1', date: addDays(today, -14), title: 'Graph DFS & Topological Sort', category: 'DSA', duration: 110, quantity: '3 problems', notes: 'Course Schedule I & II', timestamp: new Date().toISOString() },
      { id: 'act_d16_1', date: addDays(today, -16), title: 'Database Normalization', category: 'Academic', duration: 45, quantity: '3NF/BCNF', notes: 'Prepared exam notes', timestamp: new Date().toISOString() },
      { id: 'act_d18_1', date: addDays(today, -18), title: 'Python Decorators & Metaclasses', category: 'Python', duration: 80, quantity: '4 examples', notes: 'Advanced OOP', timestamp: new Date().toISOString() },
      { id: 'act_d20_1', date: addDays(today, -20), title: 'Dijkstra Shortest Path', category: 'DSA', duration: 95, quantity: '2 problems', notes: 'Network delay time', timestamp: new Date().toISOString() },
      { id: 'act_d22_1', date: addDays(today, -22), title: 'Fullstack Auth Exploration', category: 'Project', duration: 140, quantity: '1 module', notes: 'JWT & Session cookies', timestamp: new Date().toISOString() },
      { id: 'act_d25_1', date: addDays(today, -25), title: 'Convolutional Filters & Pooling', category: 'ML', duration: 90, quantity: '1 lab', notes: 'OpenCV image filtering', timestamp: new Date().toISOString() },
      { id: 'act_d28_1', date: addDays(today, -28), title: 'Heap & Priority Queue Practice', category: 'DSA', duration: 60, quantity: '2 problems', notes: 'Top K Frequent Elements', timestamp: new Date().toISOString() },
      { id: 'act_d32_1', date: addDays(today, -32), title: 'Operating Systems Deadlock Lab', category: 'Academic', duration: 75, quantity: 'Banker algorithm', notes: 'Resource allocation graph', timestamp: new Date().toISOString() }
    ];

    this.save();
  }

  // --- Reset All Data ---
  resetAllData() {
    this.tasks = [];
    this.academicTimetable = [];
    this.careerTimetable = [];
    this.activities = [];
    this.save();
  }

  // --- JSON Export and Import ---
  exportJSON() {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      tasks: this.tasks,
      academicTimetable: this.academicTimetable,
      careerTimetable: this.careerTimetable,
      activities: this.activities
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `personal_tracker_backup_${getTodayDateString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  importJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.tasks)) this.tasks = data.tasks;
      if (Array.isArray(data.academicTimetable)) this.academicTimetable = data.academicTimetable;
      if (Array.isArray(data.careerTimetable)) this.careerTimetable = data.careerTimetable;
      if (Array.isArray(data.activities)) this.activities = data.activities;
      this.save();
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  }
}

export const state = new StateStore();

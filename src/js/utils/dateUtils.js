// Utility functions for dates, streak calculation, and time calculations

export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

/**
 * Get today's date formatted as YYYY-MM-DD in local time
 */
export function getTodayDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format date string YYYY-MM-DD to human readable (e.g., "Sunday, Sep 20, 2026")
 */
export function formatFullDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Format date string YYYY-MM-DD to medium date (e.g., "Sep 20, 2026")
 */
export function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Get Day of Week from YYYY-MM-DD (e.g. "Monday")
 */
export function getDayName(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

/**
 * Format 24hr time "14:30" to "2:30 PM"
 */
export function formatTime(timeStr) {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 || 12;
  return `${h12}:${String(minutes).padStart(2, '0')} ${period}`;
}

/**
 * Format minutes into readable "1h 30m" or "45m"
 */
export function formatDuration(minutes) {
  const mins = Number(minutes) || 0;
  if (mins === 0) return '0m';
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  if (hrs > 0 && rem > 0) return `${hrs}h ${rem}m`;
  if (hrs > 0) return `${hrs}h`;
  return `${rem}m`;
}

/**
 * Add or subtract days from a YYYY-MM-DD date string
 */
export function addDays(dateStr, days) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Check if a date is strictly before today
 */
export function isBeforeToday(dateStr) {
  return dateStr < getTodayDateString();
}

/**
 * Check if a task is overdue (date before today and not completed)
 */
export function isOverdue(dateStr, isCompleted) {
  if (isCompleted) return false;
  return isBeforeToday(dateStr);
}

/**
 * Calculate active streaks from activity records and completed daily tasks
 * Returns { currentStreak, maxStreak, totalActiveDays, totalDuration }
 */
export function calculateActivityStats(activities = [], tasks = []) {
  // Aggregate duration by date from activities
  const dayMap = {};
  let totalDuration = 0;

  (activities || []).forEach(act => {
    const d = act.date;
    if (!d) return;
    const dur = Number(act.duration) || 0;
    dayMap[d] = (dayMap[d] || 0) + dur;
    totalDuration += dur;
  });

  // Track unique active days from activities and completed tasks (avoids double counting)
  const activeDaysSet = new Set(Object.keys(dayMap));

  (tasks || []).forEach(task => {
    if (task && task.status === 'completed' && task.date) {
      activeDaysSet.add(task.date);
    }
  });

  const uniqueDays = Array.from(activeDaysSet).sort();
  const totalActiveDays = uniqueDays.length;

  if (totalActiveDays === 0) {
    return { currentStreak: 0, maxStreak: 0, totalActiveDays: 0, totalDuration: 0 };
  }

  // Calculate Max Streak across active days
  let maxStreak = 0;
  let running = 0;
  let prevDate = null;

  uniqueDays.forEach(dStr => {
    if (!prevDate) {
      running = 1;
    } else {
      const nextExpected = addDays(prevDate, 1);
      if (dStr === nextExpected) {
        running += 1;
      } else {
        running = 1;
      }
    }
    prevDate = dStr;
    if (running > maxStreak) {
      maxStreak = running;
    }
  });

  // Calculate Current Streak
  const today = getTodayDateString();
  const yesterday = addDays(today, -1);

  let currentStreak = 0;
  // If user has active day today, start from today; else if yesterday, start from yesterday
  let checkDate = activeDaysSet.has(today) ? today : (activeDaysSet.has(yesterday) ? yesterday : null);

  if (checkDate) {
    while (activeDaysSet.has(checkDate)) {
      currentStreak++;
      checkDate = addDays(checkDate, -1);
    }
  }

  return {
    currentStreak,
    maxStreak: Math.max(maxStreak, currentStreak),
    totalActiveDays,
    totalDuration
  };
}

/**
 * Generates 52 weeks (364/371 days) matrix aligned to Monday for GitHub/LeetCode-style heatmap.
 * Incorporates both activities and completed daily tasks.
 */
export function generateHeatmapWeeks(activities = [], tasks = []) {
  // Aggregate activities and completed tasks by date
  const dateStats = {};

  (activities || []).forEach(act => {
    if (!act || !act.date) return;
    if (!dateStats[act.date]) {
      dateStats[act.date] = { count: 0, duration: 0, items: [], taskCount: 0, tasks: [], taskDuration: 0 };
    }
    dateStats[act.date].count += 1;
    dateStats[act.date].duration += Number(act.duration) || 0;
    dateStats[act.date].items.push(act);
  });

  (tasks || []).forEach(task => {
    if (task && task.status === 'completed' && task.date) {
      if (!dateStats[task.date]) {
        dateStats[task.date] = { count: 0, duration: 0, items: [], taskCount: 0, tasks: [], taskDuration: 0 };
      }
      if (!dateStats[task.date].tasks) {
        dateStats[task.date].taskCount = 0;
        dateStats[task.date].tasks = [];
        dateStats[task.date].taskDuration = 0;
      }
      dateStats[task.date].taskCount += 1;
      dateStats[task.date].tasks.push(task);
      const taskDur = Number(task.actualDuration) || Number(task.plannedDuration) || 0;
      dateStats[task.date].taskDuration += taskDur;
    }
  });

  const todayStr = getTodayDateString();
  const [ty, tm, td] = todayStr.split('-').map(Number);
  const endDate = new Date(ty, tm - 1, td);

  // GitHub grid: 52 weeks ending this week. Monday index 0, Sunday index 6.
  const endDayOfWeek = (endDate.getDay() + 6) % 7;
  
  // Calculate start date: 52 weeks ago from the Monday of the current week
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - endDayOfWeek - (52 * 7));

  const weeks = [];
  let currentWeek = [];
  const curr = new Date(startDate);

  while (curr <= endDate || currentWeek.length > 0) {
    const year = curr.getFullYear();
    const month = String(curr.getMonth() + 1).padStart(2, '0');
    const day = String(curr.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const stats = dateStats[dateStr] || { count: 0, duration: 0, items: [], taskCount: 0, tasks: [], taskDuration: 0 };
    const actDur = stats.duration || 0;
    const taskDur = stats.taskDuration || 0;
    const combinedDur = actDur + taskDur;
    const actCount = stats.count || 0;
    const taskCount = stats.taskCount || 0;
    const isActiveDay = actCount > 0 || taskCount > 0;
    
    // Intensity Level: 0 to 4
    let level = 0;
    if (combinedDur > 0 && combinedDur <= 45) level = 1;
    else if (combinedDur > 45 && combinedDur <= 90) level = 2;
    else if (combinedDur > 90 && combinedDur <= 150) level = 3;
    else if (combinedDur > 150) level = 4;
    else if (isActiveDay) {
      // Completed task exists on this date with 0 duration: guaranteed active level 1
      level = 1;
    }

    currentWeek.push({
      date: dateStr,
      displayDate: formatDisplayDate(dateStr),
      dayName: getDayName(dateStr),
      count: actCount,
      taskCount,
      duration: combinedDur,
      actDuration: actDur,
      taskDuration: taskDur,
      level,
      isActive: isActiveDay,
      isToday: dateStr === todayStr,
      isFuture: dateStr > todayStr
    });

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
      if (curr > endDate) break;
    }

    curr.setDate(curr.getDate() + 1);
  }

  return { weeks, dateStats };
}

// Dashboard View Component
import { state, getCategoryStyle } from '../state.js';
import {
  getTodayDateString,
  getDayName,
  formatFullDate,
  formatTime,
  formatDuration,
  calculateActivityStats,
  generateHeatmapWeeks,
  addDays
} from '../utils/dateUtils.js';
import { icons } from '../icons.js';
import { modalManager } from './modal.js';
import { openDayInspectorDrawer } from './activityView.js';

export function renderDashboard(container) {
  const todayStr = getTodayDateString();
  const dayName = getDayName(todayStr);

  // 1. Calculate Summary Stats
  const todayActivities = state.activities.filter(a => a.date === todayStr);
  const todayDuration = todayActivities.reduce((acc, a) => acc + (Number(a.duration) || 0), 0);

  const todayTasks = state.tasks.filter(t => t.date === todayStr);
  const completedTodayTasks = todayTasks.filter(t => t.status === 'completed');

  const stats = calculateActivityStats(state.activities, state.tasks);
  const { weeks } = generateHeatmapWeeks(state.activities, state.tasks);

  // Calculate Week's Total Work Time (last 7 days)
  let weekDuration = 0;
  for (let i = 0; i < 7; i++) {
    const dStr = addDays(todayStr, -i);
    const dayActs = state.activities.filter(a => a.date === dStr);
    weekDuration += dayActs.reduce((acc, a) => acc + (Number(a.duration) || 0), 0);
  }

  // 2. Today's Combined Timetable Schedule
  const todayAcadSlots = state.academicTimetable
    .filter(s => s.day === dayName)
    .map(s => ({ ...s, type: 'academic' }));

  const todayCareerSlots = state.careerTimetable
    .filter(s => s.day === dayName)
    .map(s => ({ ...s, type: 'career' }));

  const combinedSchedule = [...todayAcadSlots, ...todayCareerSlots].sort((a, b) =>
    a.startTime.localeCompare(b.startTime)
  );

  // 3. Weekly Category Distribution
  const categoryTime = {};
  for (let i = 0; i < 7; i++) {
    const dStr = addDays(todayStr, -i);
    state.activities
      .filter(a => a.date === dStr)
      .forEach(a => {
        categoryTime[a.category] = (categoryTime[a.category] || 0) + (Number(a.duration) || 0);
      });
  }

  const categoryProgressHtml = Object.entries(categoryTime)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, mins]) => {
      const style = getCategoryStyle(cat);
      const pct = weekDuration > 0 ? Math.round((mins / weekDuration) * 100) : 0;
      return `
        <div class="progress-item">
          <div class="progress-item-header">
            <span class="badge" style="background: ${style.bg}; color: ${style.color};">
              <span class="badge-dot" style="background: ${style.color};"></span>
              ${cat}
            </span>
            <span style="font-weight: 700; color: var(--text-primary); font-size: 0.8rem;">
              ${formatDuration(mins)} (${pct}%)
            </span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" style="width: ${pct}%; background: ${style.color};"></div>
          </div>
        </div>
      `;
    })
    .join('') || `<p class="empty-state-text" style="text-align: center; padding: 1rem 0;">No activity logged yet this week.</p>`;

  // 4. Render Layout HTML
  container.innerHTML = `
    <!-- Hero Header -->
    <div class="dashboard-hero">
      <div class="hero-greeting">
        <h1>Welcome Back</h1>
        <p class="hero-subtitle">${formatFullDate(todayStr)} &bull; ${dayName}</p>
      </div>
      <div class="hero-actions">
        <button class="btn btn-primary" id="dashQuickLogBtn">
          ${icons.plus} Log Activity
        </button>
        <button class="btn btn-secondary" id="dashQuickTaskBtn">
          ${icons.listCheck} New Task
        </button>
      </div>
    </div>

    <!-- 4 Small Stat Cards Grid -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon-wrapper stat-icon-emerald">
          ${icons.clock}
        </div>
        <div class="stat-content">
          <span class="stat-label">Logged Today</span>
          <span class="stat-value">${formatDuration(todayDuration)}</span>
          <span class="stat-subtext">${todayActivities.length} session(s) recorded</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon-wrapper stat-icon-amber">
          <span class="streak-flame">${icons.flame}</span>
        </div>
        <div class="stat-content">
          <span class="stat-label">Active Streak</span>
          <span class="stat-value">${stats.currentStreak} <span style="font-size: 1rem; font-weight: 600;">Days</span></span>
          <span class="stat-subtext">Best: ${stats.maxStreak} days continuous</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon-wrapper stat-icon-indigo">
          ${icons.checkCircle}
        </div>
        <div class="stat-content">
          <span class="stat-label">Today's Tasks</span>
          <span class="stat-value">${completedTodayTasks.length} / ${todayTasks.length}</span>
          <span class="stat-subtext">${todayTasks.length - completedTodayTasks.length} remaining</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon-wrapper stat-icon-sky">
          ${icons.trendingUp}
        </div>
        <div class="stat-content">
          <span class="stat-label">Last 7 Days</span>
          <span class="stat-value">${formatDuration(weekDuration)}</span>
          <span class="stat-subtext">Total time invested</span>
        </div>
      </div>
    </div>

    <!-- 52-Week Activity Heatmap directly below the 4 stat cards -->
    <div class="dash-card dash-heatmap-card">
      <div class="dash-card-header">
        <div style="display: flex; align-items: center; gap: 0.65rem;">
          <h3 class="dash-card-title">
            ${icons.activity} 52-Week Activity Heatmap
          </h3>
          <span class="badge" style="background: rgba(16, 185, 129, 0.15); color: var(--accent-emerald); font-size: 0.75rem;">
            ${stats.totalActiveDays} active day${stats.totalActiveDays === 1 ? '' : 's'}
          </span>
        </div>

        <div class="heatmap-legend">
          <span>Less</span>
          <div class="legend-cell level-0" title="0 minutes"></div>
          <div class="legend-cell level-1" title="1 - 45 mins"></div>
          <div class="legend-cell level-2" title="46 - 90 mins"></div>
          <div class="legend-cell level-3" title="91 - 150 mins"></div>
          <div class="legend-cell level-4" title="150+ mins"></div>
          <span>More</span>
        </div>
      </div>

      <div class="dash-card-body" style="padding-bottom: 1.1rem;">
        <div class="heatmap-scroll-container">
          <div class="heatmap-grid" id="dashHeatmapGrid">
            <div class="heatmap-days-labels">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
              <span>Sun</span>
            </div>
            ${weeks
              .map(week => `
              <div class="heatmap-week-col">
                ${week
                  .map(dayObj => {
                    const detailParts = [];
                    if (dayObj.count > 0) {
                      detailParts.push(`${dayObj.count} session${dayObj.count === 1 ? '' : 's'}`);
                    }
                    if (dayObj.taskCount > 0) {
                      detailParts.push(`${dayObj.taskCount} task${dayObj.taskCount === 1 ? '' : 's'} done`);
                    }
                    let tooltip;
                    if (detailParts.length > 0) {
                      const details = detailParts.join(', ');
                      tooltip = `${dayObj.dayName}, ${dayObj.displayDate}: ${
                        dayObj.duration > 0 ? formatDuration(dayObj.duration) + ` (${details})` : details
                      }`;
                    } else {
                      tooltip = `${dayObj.dayName}, ${dayObj.displayDate}: No activity`;
                    }
                    return `
                    <div 
                      class="heatmap-cell level-${dayObj.level} ${dayObj.isFuture ? 'future-day' : ''}" 
                      data-date="${dayObj.date}"
                      title="${tooltip}">
                    </div>
                  `;
                  })
                  .join('')}
              </div>
            `)
              .join('')}
          </div>
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 0.85rem; flex-wrap: wrap; gap: 0.5rem;">
          <span style="font-size: 0.75rem; color: var(--text-muted);">
            Click on any day cell to inspect recorded sessions or log work for that date.
          </span>
          <button class="btn btn-ghost btn-sm" id="dashGoToActivityTabBtn">
            Full Activity Log &rarr;
          </button>
        </div>
      </div>
    </div>

    <!-- Main 2-Column Content -->
    <div class="dashboard-grid">
      <!-- Left Column: Today's Schedule & Today's Tasks -->
      <div class="dashboard-col-left">
        <!-- Today's Schedule -->
        <div class="dash-card">
          <div class="dash-card-header">
            <h3 class="dash-card-title">
              ${icons.calendar} Today's Timetable Schedule
            </h3>
            <span class="badge" style="background: rgba(255,255,255,0.06); color: var(--text-secondary);">
              ${combinedSchedule.length} session${combinedSchedule.length === 1 ? '' : 's'}
            </span>
          </div>
          <div class="dash-card-body">
            ${
              combinedSchedule.length > 0
                ? `<div class="schedule-list">
                    ${combinedSchedule
                      .map(slot => {
                        const isAcad = slot.type === 'academic';
                        const title = isAcad ? slot.subject : slot.activity;
                        const catStyle = !isAcad ? getCategoryStyle(slot.category) : null;

                        const metaHtml = isAcad
                          ? `
                            ${slot.classroom ? `<span class="schedule-meta-tag">${icons.mapPin} ${slot.classroom}</span>` : ''}
                            ${slot.faculty ? `<span class="schedule-meta-tag">${icons.user} ${slot.faculty}</span>` : ''}
                          `
                          : `
                            <span class="badge" style="background: ${catStyle.bg}; color: ${catStyle.color}; font-size: 0.725rem; padding: 0.15rem 0.55rem;">
                              <span class="badge-dot" style="background: ${catStyle.color};"></span>
                              ${slot.category}
                            </span>
                          `;

                        return `
                        <div class="schedule-item">
                          <div class="schedule-time">
                            <span class="time-start">${formatTime(slot.startTime)}</span>
                            <span class="time-end">${formatTime(slot.endTime)}</span>
                          </div>
                          <div class="schedule-details">
                            <div class="schedule-title-row">
                              <span class="schedule-type-badge ${
                                isAcad ? 'schedule-type-academic' : 'schedule-type-career'
                              }">
                                ${isAcad ? 'Academic' : 'Career'}
                              </span>
                              <span class="schedule-title">${title}</span>
                            </div>
                            <div class="schedule-meta">
                              ${metaHtml}
                            </div>
                            ${
                              slot.notes
                                ? `<div class="schedule-notes">${slot.notes}</div>`
                                : ''
                            }
                          </div>
                        </div>
                      `;
                      })
                      .join('')}
                  </div>`
                : `<div class="empty-state">
                    <p class="empty-state-text">No timetable slots scheduled for ${dayName}.</p>
                    <button class="btn btn-secondary btn-sm" id="dashGoToTimetableBtn">
                      ${icons.calendar} Manage Timetables
                    </button>
                  </div>`
            }
          </div>
        </div>

        <!-- Today's Tasks -->
        <div class="dash-card">
          <div class="dash-card-header">
            <h3 class="dash-card-title">
              ${icons.listCheck} Today's Tasks
            </h3>
            <button class="btn btn-ghost btn-sm" id="dashViewAllTasksBtn">
              View All Tasks &rarr;
            </button>
          </div>
          <div class="dash-card-body">
            ${
              todayTasks.length > 0
                ? `<div class="dash-task-list">
                    ${todayTasks
                      .map(task => {
                        const isDone = task.status === 'completed';
                        const catStyle = getCategoryStyle(task.category);
                        return `
                        <div class="dash-task-item ${isDone ? 'completed' : ''}" data-task-id="${task.id}">
                          <div class="dash-task-left">
                            <div class="custom-checkbox ${isDone ? 'checked' : ''}" data-action="toggle-task">
                              ${isDone ? icons.check : ''}
                            </div>
                            <div style="display: flex; flex-direction: column;">
                              <span class="dash-task-title">${task.title}</span>
                              <div style="display: flex; gap: 0.5rem; align-items: center; margin-top: 0.2rem;">
                                <span class="badge" style="background: ${catStyle.bg}; color: ${catStyle.color}; font-size: 0.7rem; padding: 0.15rem 0.5rem;">
                                  <span class="badge-dot" style="background: ${catStyle.color};"></span>
                                  ${task.category}
                                </span>
                                ${
                                  task.plannedDuration
                                    ? `<span style="font-size: 0.75rem; color: var(--text-muted);">${icons.clock} ${formatDuration(
                                        task.plannedDuration
                                      )}</span>`
                                    : ''
                                }
                              </div>
                            </div>
                          </div>
                          <div class="dash-task-right">
                            <span class="badge priority-${task.priority}">
                              ${task.priority}
                            </span>
                          </div>
                        </div>
                      `;
                      })
                      .join('')}
                  </div>`
                : `<div class="empty-state">
                    <p class="empty-state-text">No tasks for today yet.</p>
                    <button class="btn btn-primary btn-sm" id="dashAddFirstTaskBtn">
                      ${icons.plus} Add a task for today
                    </button>
                  </div>`
            }
          </div>
        </div>
      </div>

      <!-- Right Column: Weekly Breakdown & Recent Activity -->
      <div class="dashboard-col-right">
        <!-- Weekly Category Progress -->
        <div class="dash-card">
          <div class="dash-card-header">
            <h3 class="dash-card-title">
              ${icons.trendingUp} Past 7 Days Focus
            </h3>
            <span style="font-size: 0.8rem; font-weight: 700; color: var(--accent-emerald);">
              ${formatDuration(weekDuration)} total
            </span>
          </div>
          <div class="dash-card-body">
            <div class="progress-list">
              ${categoryProgressHtml}
            </div>
          </div>
        </div>

        <!-- Recent Activity Feed -->
        <div class="dash-card">
          <div class="dash-card-header">
            <h3 class="dash-card-title">
              ${icons.activity} Recent Activity Log
            </h3>
            <button class="btn btn-ghost btn-sm" id="dashViewActivityHeatmapBtn">
              Full Heatmap &rarr;
            </button>
          </div>
          <div class="dash-card-body">
            ${
              state.activities.length > 0
                ? `<div class="activity-stream">
                    ${state.activities
                      .slice(0, 5)
                      .map(act => {
                        const style = getCategoryStyle(act.category);
                        return `
                        <div class="activity-stream-item">
                          <div class="stream-left">
                            <span class="stream-title">${act.title}</span>
                            <div class="stream-meta">
                              <span class="badge" style="background: ${style.bg}; color: ${style.color}; font-size: 0.65rem; padding: 0.1rem 0.45rem;">
                                <span class="badge-dot" style="background: ${style.color};"></span>
                                ${act.category}
                              </span>
                              <span>&bull; ${formatFullDate(act.date)}</span>
                              ${act.quantity ? `<span>&bull; ${act.quantity}</span>` : ''}
                            </div>
                          </div>
                          <span class="stream-duration">${formatDuration(act.duration)}</span>
                        </div>
                      `;
                      })
                      .join('')}
                  </div>`
                : `<div class="empty-state">
                    <p class="empty-state-text">No activities logged yet.</p>
                  </div>`
            }
          </div>
        </div>
      </div>
    </div>
  `;

  // Bind Event Listeners
  attachDashboardEvents(container);
}

function attachDashboardEvents(container) {
  // Heatmap Cell Click -> Open Day Inspector Drawer
  container.querySelectorAll('#dashHeatmapGrid .heatmap-cell').forEach(cell => {
    cell.addEventListener('click', () => {
      const dateStr = cell.dataset.date;
      if (!dateStr) return;

      container.querySelectorAll('#dashHeatmapGrid .heatmap-cell').forEach(c => c.classList.remove('is-selected'));
      cell.classList.add('is-selected');

      openDayInspectorDrawer(dateStr);
    });
  });

  // Quick Task Add button
  const quickTaskBtn = container.querySelector('#dashQuickTaskBtn');
  const addFirstTaskBtn = container.querySelector('#dashAddFirstTaskBtn');
  const triggerTaskModal = () => {
    document.querySelector('[data-view="tasks"]').click();
    setTimeout(() => {
      const addTaskBtn = document.getElementById('addTaskBtn');
      if (addTaskBtn) addTaskBtn.click();
    }, 100);
  };
  if (quickTaskBtn) quickTaskBtn.addEventListener('click', triggerTaskModal);
  if (addFirstTaskBtn) addFirstTaskBtn.addEventListener('click', triggerTaskModal);

  // Quick Log Activity button
  const quickLogBtn = container.querySelector('#dashQuickLogBtn');
  if (quickLogBtn) {
    quickLogBtn.addEventListener('click', () => {
      document.querySelector('[data-view="activity"]').click();
      setTimeout(() => {
        const logActBtn = document.getElementById('logActivityBtn');
        if (logActBtn) logActBtn.click();
      }, 100);
    });
  }

  // Navigation shortcuts
  const viewAllTasksBtn = container.querySelector('#dashViewAllTasksBtn');
  if (viewAllTasksBtn) {
    viewAllTasksBtn.addEventListener('click', () => {
      document.querySelector('[data-view="tasks"]').click();
    });
  }

  const goToTimetableBtn = container.querySelector('#dashGoToTimetableBtn');
  if (goToTimetableBtn) {
    goToTimetableBtn.addEventListener('click', () => {
      document.querySelector('[data-view="timetables"]').click();
    });
  }

  const viewHeatmapBtn = container.querySelector('#dashViewActivityHeatmapBtn');
  if (viewHeatmapBtn) {
    viewHeatmapBtn.addEventListener('click', () => {
      document.querySelector('[data-view="activity"]').click();
    });
  }

  const goToActivityTabBtn = container.querySelector('#dashGoToActivityTabBtn');
  if (goToActivityTabBtn) {
    goToActivityTabBtn.addEventListener('click', () => {
      document.querySelector('[data-view="activity"]').click();
    });
  }

  // Task direct checkbox toggle
  container.querySelectorAll('[data-action="toggle-task"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const taskItem = btn.closest('.dash-task-item');
      if (taskItem) {
        const taskId = taskItem.dataset.taskId;
        const updated = state.toggleTaskCompletion(taskId);
        if (updated && updated.status === 'completed') {
          modalManager.showToast(`Completed: ${updated.title}`, 'success');
        }
      }
    });
  });
}

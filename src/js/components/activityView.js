// Activity & Heatmap View Component
import { state, CATEGORIES, getCategoryStyle } from '../state.js';
import {
  getTodayDateString,
  formatFullDate,
  formatDisplayDate,
  formatDuration,
  calculateActivityStats,
  generateHeatmapWeeks
} from '../utils/dateUtils.js';
import { icons } from '../icons.js';
import { modalManager } from './modal.js';

let selectedCategoryFilter = 'all';
let searchQuery = '';

export function renderActivityView(container) {
  const stats = calculateActivityStats(state.activities, state.tasks);
  const { weeks, dateStats } = generateHeatmapWeeks(state.activities, state.tasks);

  // Filter activities for table
  let visibleActivities = state.activities;
  if (selectedCategoryFilter !== 'all') {
    visibleActivities = visibleActivities.filter(
      a => a.category.toLowerCase() === selectedCategoryFilter.toLowerCase()
    );
  }
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    visibleActivities = visibleActivities.filter(
      a => a.title.toLowerCase().includes(q) || (a.notes && a.notes.toLowerCase().includes(q))
    );
  }

  container.innerHTML = `
    <!-- Header -->
    <div class="activity-header">
      <div class="activity-title-area">
        <h2>Activity & Progress Heatmap</h2>
        <p>A visual record of work completed over time, your current streak, and detailed session logs.</p>
      </div>
      <button class="btn btn-primary" id="logActivityBtn">
        ${icons.plus} Log Activity
      </button>
    </div>

    <!-- Stats Banner -->
    <div class="activity-stats-banner">
      <div class="act-stat-card">
        <div class="act-stat-icon stat-icon-amber">
          <span class="streak-flame">${icons.flame}</span>
        </div>
        <div class="act-stat-info">
          <span class="act-stat-label">Current Streak</span>
          <span class="act-stat-val">${stats.currentStreak} <span style="font-size: 0.9rem; font-weight: 600;">Days</span></span>
        </div>
      </div>

      <div class="act-stat-card">
        <div class="act-stat-icon stat-icon-indigo">
          ${icons.trendingUp}
        </div>
        <div class="act-stat-info">
          <span class="act-stat-label">Longest Streak</span>
          <span class="act-stat-val">${stats.maxStreak} <span style="font-size: 0.9rem; font-weight: 600;">Days</span></span>
        </div>
      </div>

      <div class="act-stat-card">
        <div class="act-stat-icon stat-icon-emerald">
          ${icons.calendar}
        </div>
        <div class="act-stat-info">
          <span class="act-stat-label">Total Active Days</span>
          <span class="act-stat-val">${stats.totalActiveDays}</span>
        </div>
      </div>

      <div class="act-stat-card">
        <div class="act-stat-icon stat-icon-sky">
          ${icons.clock}
        </div>
        <div class="act-stat-info">
          <span class="act-stat-label">Total Time Invested</span>
          <span class="act-stat-val">${formatDuration(stats.totalDuration)}</span>
        </div>
      </div>
    </div>

    <!-- Heatmap Card -->
    <div class="heatmap-card">
      <div class="heatmap-card-header">
        <h3 class="heatmap-card-title">
          ${icons.activity} 52-Week Activity Heatmap
        </h3>

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

      <!-- Heatmap Scrollable Grid -->
      <div class="heatmap-scroll-container">
        <div class="heatmap-grid" id="heatmapGrid">
          <div class="heatmap-days-labels">
            <span>Mon</span>
            <span>Wed</span>
            <span>Fri</span>
            <span>Sun</span>
          </div>

          ${weeks
            .map(week => {
              return `
              <div class="heatmap-week-col">
                ${week
                  .map(dayObj => {
                    const detailParts = [];
                    if (dayObj.count > 0) {
                      detailParts.push(`${dayObj.count} activit${dayObj.count === 1 ? 'y' : 'ies'}`);
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
            `;
            })
            .join('')}
        </div>
      </div>
      <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.75rem;">
        Tip: Click on any day cell above to inspect all activities recorded for that date.
      </p>
    </div>

    <!-- Activity Work Log History Card -->
    <div class="activity-log-card">
      <div class="activity-log-header">
        <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary);">
          ${icons.listCheck} Work Log History
        </h3>

        <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
          <input 
            type="text" 
            class="form-input" 
            id="activitySearchInput" 
            placeholder="Search activities..." 
            value="${searchQuery}" 
            style="width: 200px; padding: 0.4rem 0.75rem; font-size: 0.825rem;">

          <select class="form-select" id="actCatFilter" style="width: 170px; padding: 0.4rem 0.75rem; font-size: 0.825rem;">
            <option value="all" ${selectedCategoryFilter === 'all' ? 'selected' : ''}>All Categories</option>
            ${CATEGORIES.map(
              c => `<option value="${c.name}" ${selectedCategoryFilter === c.name ? 'selected' : ''}>${c.name}</option>`
            ).join('')}
          </select>
        </div>
      </div>

      <div class="activity-table-wrapper">
        ${
          visibleActivities.length > 0
            ? `
            <table class="activity-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Activity Title</th>
                  <th>Duration</th>
                  <th>Output / Quantity</th>
                  <th>Notes</th>
                  <th style="text-align: right;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${visibleActivities
                  .map(act => {
                    const style = getCategoryStyle(act.category);
                    return `
                    <tr data-act-id="${act.id}">
                      <td class="col-date" data-label="Date">
                        ${formatDisplayDate(act.date)}
                      </td>
                      <td class="col-category" data-label="Category">
                        <span class="badge" style="background: ${style.bg}; color: ${style.color};">
                          <span class="badge-dot" style="background: ${style.color};"></span>
                          ${act.category}
                        </span>
                      </td>
                      <td class="col-title" data-label="Activity">
                        <span class="activity-cell-title">${act.title}</span>
                      </td>
                      <td class="col-duration" data-label="Duration">
                        <span class="stream-duration">${formatDuration(act.duration)}</span>
                      </td>
                      <td class="col-quantity" data-label="Output">
                        ${act.quantity || '&mdash;'}
                      </td>
                      <td class="col-notes" data-label="Notes">
                        ${act.notes || '&mdash;'}
                      </td>
                      <td class="col-actions">
                        <button class="btn btn-ghost btn-sm btn-icon-only" data-action="edit-act" title="Edit Activity">
                          ${icons.edit}
                        </button>
                        <button class="btn btn-ghost btn-sm btn-icon-only" data-action="delete-act" title="Delete Activity">
                          ${icons.trash}
                        </button>
                      </td>
                    </tr>
                  `;
                  })
                  .join('')}
              </tbody>
            </table>
          `
            : `
            <div class="empty-state">
              <p class="empty-state-text">No activities found matching your criteria.</p>
            </div>
          `
        }
      </div>
    </div>
  `;

  attachActivityEvents(container, dateStats);
}

function attachActivityEvents(container, dateStats) {
  // Log Activity Button
  const logBtn = container.querySelector('#logActivityBtn');
  if (logBtn) {
    logBtn.addEventListener('click', () => openActivityFormModal());
  }

  // Search Input
  const searchInput = container.querySelector('#activitySearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderActivityView(container);
    });
  }

  // Category Filter
  const catFilter = container.querySelector('#actCatFilter');
  if (catFilter) {
    catFilter.addEventListener('change', (e) => {
      selectedCategoryFilter = e.target.value;
      renderActivityView(container);
    });
  }

  // Heatmap Cell Click -> Open Day Inspector Drawer
  container.querySelectorAll('.heatmap-cell').forEach(cell => {
    cell.addEventListener('click', () => {
      const dateStr = cell.dataset.date;
      if (!dateStr) return;

      container.querySelectorAll('.heatmap-cell').forEach(c => c.classList.remove('is-selected'));
      cell.classList.add('is-selected');

      openDayInspectorDrawer(dateStr);
    });
  });

  // Table Row Actions
  container.querySelectorAll('tr[data-act-id]').forEach(row => {
    const actId = row.dataset.actId;
    const act = state.activities.find(a => a.id === actId);
    if (!act) return;

    // Edit
    const editBtn = row.querySelector('[data-action="edit-act"]');
    if (editBtn) {
      editBtn.addEventListener('click', () => openActivityFormModal(act));
    }

    // Delete
    const deleteBtn = row.querySelector('[data-action="delete-act"]');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        modalManager.confirm({
          title: 'Delete Activity',
          message: `Are you sure you want to delete "${act.title}"?`,
          onConfirm: () => {
            state.deleteActivity(actId);
            modalManager.showToast('Activity record removed', 'info');
            renderActivityView(container);
          }
        });
      });
    }
  });
}

// Modal for Adding / Editing Activity
export function openActivityFormModal(activity = null, defaultDate = getTodayDateString()) {
  const isEditing = !!activity;
  const initial = activity || {
    title: '',
    category: 'DSA',
    date: defaultDate,
    duration: 60,
    quantity: '',
    notes: ''
  };

  modalManager.openModal({
    title: isEditing ? 'Edit Activity Record' : 'Log Completed Activity',
    bodyHtml: `
      <form id="activityForm">
        <div class="form-group">
          <label class="form-label" for="actTitleInput">Activity / Work Title *</label>
          <input type="text" id="actTitleInput" name="title" class="form-input" required placeholder="e.g. Solved 2 LeetCode Tree Problems" value="${initial.title}">
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="actCatSelect">Category *</label>
            <select id="actCatSelect" name="category" class="form-select" required>
              ${CATEGORIES.map(
                c => `<option value="${c.name}" ${initial.category === c.name ? 'selected' : ''}>${c.name}</option>`
              ).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="actDateInput">Date *</label>
            <input type="date" id="actDateInput" name="date" class="form-input" required value="${initial.date}">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="actDurationInput">Duration (Minutes) *</label>
            <input type="number" id="actDurationInput" name="duration" min="1" step="5" class="form-input" required placeholder="e.g. 60" value="${initial.duration}">
            <span class="form-hint">Increases heatmap intensity</span>
          </div>

          <div class="form-group">
            <label class="form-label" for="actQuantityInput">Quantity / Output (optional)</label>
            <input type="text" id="actQuantityInput" name="quantity" class="form-input" placeholder="e.g. 2 problems, 45 pages" value="${initial.quantity}">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="actNotesInput">Notes (optional)</label>
          <textarea id="actNotesInput" name="notes" class="form-textarea" placeholder="Key achievements, obstacles, reference links...">${initial.notes}</textarea>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" data-action="cancel">Cancel</button>
          <button type="submit" class="btn btn-primary">${isEditing ? 'Save Changes' : 'Log Activity'}</button>
        </div>
      </form>
    `,
    onSubmit: (formData) => {
      if (isEditing) {
        state.updateActivity(activity.id, formData);
        modalManager.showToast('Activity record updated', 'success');
      } else {
        state.addActivity(formData);
        modalManager.showToast(`Logged: +${formData.duration}m added!`, 'success');
      }
      modalManager.closeModal();
      const container = document.getElementById('view-activity');
      if (container) renderActivityView(container);
    }
  });
}

// Slide-over Drawer for Day Inspector
export function openDayInspectorDrawer(dateStr) {
  const dayActs = state.activities.filter(a => a.date === dateStr);
  const dayTasks = state.tasks.filter(t => t.date === dateStr);
  const totalMins = dayActs.reduce((acc, a) => acc + (Number(a.duration) || 0), 0);

  modalManager.openDrawer({
    title: formatFullDate(dateStr),
    contentHtml: `
      <!-- Summary Row -->
      <div class="day-inspector-summary">
        <div class="inspector-stat">
          <span class="inspector-stat-label">Total Time</span>
          <span class="inspector-stat-val">${formatDuration(totalMins)}</span>
        </div>
        <div class="inspector-stat">
          <span class="inspector-stat-label">Activities</span>
          <span class="inspector-stat-val" style="color: var(--accent-primary);">${dayActs.length}</span>
        </div>
        <div class="inspector-stat">
          <span class="inspector-stat-label">Tasks Done</span>
          <span class="inspector-stat-val" style="color: var(--accent-sky);">${dayTasks.filter(t => t.status === 'completed').length}/${dayTasks.length}</span>
        </div>
      </div>

      <!-- Quick Add to this day -->
      <div style="display: flex; gap: 0.5rem;">
        <button class="btn btn-primary btn-sm" id="drawerAddActBtn" style="flex: 1;">
          ${icons.plus} Log Activity on this Date
        </button>
      </div>

      <!-- Activity Items for Date -->
      <div>
        <h4 style="font-size: 0.9rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 0.6rem;">
          Activities Logged (${dayActs.length})
        </h4>
        <div class="inspector-activities-list">
          ${
            dayActs.length > 0
              ? dayActs
                  .map(a => {
                    const style = getCategoryStyle(a.category);
                    return `
                    <div class="inspector-act-item">
                      <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 0.5rem;">
                        <span class="inspector-act-title">${a.title}</span>
                        <span class="stream-duration">${formatDuration(a.duration)}</span>
                      </div>
                      <div class="inspector-act-meta">
                        <span class="badge" style="background: ${style.bg}; color: ${style.color}; font-size: 0.7rem; padding: 0.15rem 0.5rem;">
                          ${a.category}
                        </span>
                        ${a.quantity ? `<span style="color: var(--text-secondary);">${a.quantity}</span>` : ''}
                      </div>
                      ${a.notes ? `<p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.2rem;">${a.notes}</p>` : ''}
                    </div>
                  `;
                  })
                  .join('')
              : `<p class="empty-state-text" style="padding: 1rem 0; text-align: center;">No activity recorded for this day.</p>`
          }
        </div>
      </div>

      <!-- Tasks for Date -->
      <div>
        <h4 style="font-size: 0.9rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 0.6rem;">
          Tasks for Date (${dayTasks.length})
        </h4>
        <div class="dash-task-list">
          ${
            dayTasks.length > 0
              ? dayTasks
                  .map(t => {
                    const isDone = t.status === 'completed';
                    return `
                    <div class="dash-task-item ${isDone ? 'completed' : ''}">
                      <span class="dash-task-title">${t.title}</span>
                      <span class="badge priority-${t.priority}">${t.status}</span>
                    </div>
                  `;
                  })
                  .join('')
              : `<p class="empty-state-text" style="padding: 0.5rem 0; text-align: center;">No tasks scheduled on this day.</p>`
          }
        </div>
      </div>
    `,
    onOpen: (drawerBody) => {
      const addActBtn = drawerBody.querySelector('#drawerAddActBtn');
      if (addActBtn) {
        addActBtn.addEventListener('click', () => {
          modalManager.closeDrawer();
          openActivityFormModal(null, dateStr);
        });
      }
    }
  });
}

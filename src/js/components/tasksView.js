// Daily Tasks Screen Component
import { state, CATEGORIES, getCategoryStyle } from '../state.js';
import {
  getTodayDateString,
  getDayName,
  formatFullDate,
  formatDuration,
  addDays,
  isOverdue
} from '../utils/dateUtils.js';
import { icons } from '../icons.js';
import { modalManager } from './modal.js';

let selectedDate = getTodayDateString();
let selectedStatusFilter = 'all'; // 'all' | 'pending' | 'completed' | 'overdue'
let selectedCategoryFilter = 'all';

export function renderTasksView(container) {
  const todayStr = getTodayDateString();
  const dayName = getDayName(selectedDate);
  const isSelectedDateToday = selectedDate === todayStr;

  // Filter tasks for selected date
  const dayTasks = state.tasks.filter(t => t.date === selectedDate);
  
  // Calculate summary stats for selected date
  const totalTasks = dayTasks.length;
  const completedTasks = dayTasks.filter(t => t.status === 'completed').length;
  const pendingTasks = totalTasks - completedTasks;
  const dayPlannedDuration = dayTasks.reduce((acc, t) => acc + (Number(t.plannedDuration) || 0), 0);
  const dayActualDuration = dayTasks.reduce((acc, t) => acc + (Number(t.actualDuration) || 0), 0);

  // Apply UI filters (Status & Category)
  let visibleTasks = dayTasks;
  if (selectedStatusFilter === 'pending') {
    visibleTasks = visibleTasks.filter(t => t.status !== 'completed');
  } else if (selectedStatusFilter === 'completed') {
    visibleTasks = visibleTasks.filter(t => t.status === 'completed');
  } else if (selectedStatusFilter === 'overdue') {
    visibleTasks = visibleTasks.filter(t => isOverdue(t.date, t.status === 'completed'));
  }

  if (selectedCategoryFilter !== 'all') {
    visibleTasks = visibleTasks.filter(t => t.category.toLowerCase() === selectedCategoryFilter.toLowerCase());
  }

  container.innerHTML = `
    <!-- Header -->
    <div class="tasks-header">
      <div class="tasks-title-area">
        <h2>Daily Tasks</h2>
        <p>Plan daily goals and record actual time spent completing them.</p>
      </div>
      <button class="btn btn-primary" id="addTaskBtn">
        ${icons.plus} New Task
      </button>
    </div>

    <!-- Date Navigator -->
    <div class="date-navigator">
      <div class="date-controls">
        <button class="btn btn-secondary btn-icon-only" id="prevDayBtn" title="Previous Day">
          ${icons.chevronLeft}
        </button>
        <div class="current-date-display">
          <span class="current-date-text">${formatFullDate(selectedDate)}</span>
          <span class="current-day-text">(${dayName})</span>
          ${isSelectedDateToday ? `<span class="badge" style="background: var(--accent-emerald-light); color: var(--accent-emerald); font-size: 0.7rem;">Today</span>` : ''}
        </div>
        <button class="btn btn-secondary btn-icon-only" id="nextDayBtn" title="Next Day">
          ${icons.chevronRight}
        </button>
      </div>

      <div class="date-shortcuts">
        <button class="btn btn-secondary btn-sm" id="yesterdayBtn">Yesterday</button>
        <button class="btn btn-secondary btn-sm ${isSelectedDateToday ? 'active' : ''}" id="todayBtn">Today</button>
        <button class="btn btn-secondary btn-sm" id="tomorrowBtn">Tomorrow</button>
        
        <div class="date-input-wrapper">
          <input type="date" class="date-picker-input" id="datePickerInput" value="${selectedDate}">
        </div>
      </div>
    </div>

    <!-- Day Summary Ribbon -->
    <div class="day-summary-ribbon">
      <div class="ribbon-stat">
        <span class="ribbon-stat-label">Total Tasks</span>
        <span class="ribbon-stat-val">${totalTasks}</span>
      </div>
      <div class="ribbon-stat">
        <span class="ribbon-stat-label">Completed</span>
        <span class="ribbon-stat-val" style="color: var(--accent-emerald);">${completedTasks}</span>
      </div>
      <div class="ribbon-stat">
        <span class="ribbon-stat-label">Pending</span>
        <span class="ribbon-stat-val" style="color: var(--accent-amber);">${pendingTasks}</span>
      </div>
      <div class="ribbon-stat">
        <span class="ribbon-stat-label">Planned Time</span>
        <span class="ribbon-stat-val">${formatDuration(dayPlannedDuration)}</span>
      </div>
      <div class="ribbon-stat">
        <span class="ribbon-stat-label">Actual Logged</span>
        <span class="ribbon-stat-val" style="color: var(--accent-primary);">${formatDuration(dayActualDuration)}</span>
      </div>
    </div>

    <!-- Filters Bar -->
    <div class="tasks-filter-bar">
      <div class="filter-pills">
        <button class="filter-pill ${selectedStatusFilter === 'all' ? 'active' : ''}" data-status="all">All (${totalTasks})</button>
        <button class="filter-pill ${selectedStatusFilter === 'pending' ? 'active' : ''}" data-status="pending">Pending (${pendingTasks})</button>
        <button class="filter-pill ${selectedStatusFilter === 'completed' ? 'active' : ''}" data-status="completed">Completed (${completedTasks})</button>
      </div>

      <div class="category-dropdown-filter">
        <select class="form-select" id="taskCategoryFilter">
          <option value="all" ${selectedCategoryFilter === 'all' ? 'selected' : ''}>All Categories</option>
          ${CATEGORIES.map(c => `
            <option value="${c.name}" ${selectedCategoryFilter === c.name ? 'selected' : ''}>${c.name}</option>
          `).join('')}
        </select>
      </div>
    </div>

    <!-- Task Cards List -->
    <div class="tasks-list">
      ${
        visibleTasks.length > 0
          ? visibleTasks
              .map(task => {
                const isDone = task.status === 'completed';
                const overdue = isOverdue(task.date, isDone);
                const catStyle = getCategoryStyle(task.category);

                return `
                <div class="task-card ${isDone ? 'completed' : ''}" data-task-id="${task.id}">
                  <div class="task-card-left">
                    <div class="custom-checkbox task-checkbox ${isDone ? 'checked' : ''}" data-action="toggle">
                      ${isDone ? icons.check : ''}
                    </div>
                    <div class="task-card-content">
                      <div class="task-card-title">${task.title}</div>
                      ${task.notes ? `<div class="task-card-notes">${task.notes}</div>` : ''}
                      
                      <div class="task-meta-row">
                        <span class="badge" style="background: ${catStyle.bg}; color: ${catStyle.color};">
                          <span class="badge-dot" style="background: ${catStyle.color};"></span>
                          ${task.category}
                        </span>

                        <span class="badge priority-${task.priority}">
                          ${task.priority.toUpperCase()}
                        </span>

                        ${
                          task.plannedDuration
                            ? `<span class="task-duration-badge" title="Planned Duration">
                                ${icons.clock} Planned: ${formatDuration(task.plannedDuration)}
                              </span>`
                            : ''
                        }

                        ${
                          task.actualDuration
                            ? `<span class="task-duration-badge" style="color: var(--accent-emerald);" title="Actual Time Spent">
                                ${icons.checkCircle} Actual: ${formatDuration(task.actualDuration)}
                              </span>`
                            : ''
                        }

                        ${
                          overdue
                            ? `<span class="badge priority-high">Overdue</span>`
                            : ''
                        }
                      </div>
                    </div>
                  </div>

                  <div class="task-card-actions">
                    ${
                      isDone
                        ? `<button class="btn btn-secondary btn-sm" data-action="log-activity" title="Log this completed task as an activity">
                            ${icons.activity} Log Activity
                          </button>`
                        : ''
                    }
                    <button class="btn btn-secondary btn-icon-only btn-sm" data-action="edit" title="Edit Task">
                      ${icons.edit}
                    </button>
                    <button class="btn btn-secondary btn-icon-only btn-sm" data-action="delete" title="Delete Task">
                      ${icons.trash}
                    </button>
                  </div>
                </div>
              `;
              })
              .join('')
          : `<div class="empty-state">
              <div class="empty-state-icon">${icons.listCheck}</div>
              <p class="empty-state-text">No tasks found for ${formatFullDate(selectedDate)}.</p>
              <button class="btn btn-primary btn-sm" id="emptyAddTaskBtn">
                ${icons.plus} Add Task for this Date
              </button>
            </div>`
      }
    </div>
  `;

  attachTasksEvents(container);
}

function attachTasksEvents(container) {
  // Navigation
  const prevBtn = container.querySelector('#prevDayBtn');
  const nextBtn = container.querySelector('#nextDayBtn');
  const yesterdayBtn = container.querySelector('#yesterdayBtn');
  const todayBtn = container.querySelector('#todayBtn');
  const tomorrowBtn = container.querySelector('#tomorrowBtn');
  const datePicker = container.querySelector('#datePickerInput');

  if (prevBtn) prevBtn.addEventListener('click', () => setDate(addDays(selectedDate, -1)));
  if (nextBtn) nextBtn.addEventListener('click', () => setDate(addDays(selectedDate, 1)));
  if (yesterdayBtn) yesterdayBtn.addEventListener('click', () => setDate(addDays(getTodayDateString(), -1)));
  if (todayBtn) todayBtn.addEventListener('click', () => setDate(getTodayDateString()));
  if (tomorrowBtn) tomorrowBtn.addEventListener('click', () => setDate(addDays(getTodayDateString(), 1)));
  if (datePicker) datePicker.addEventListener('change', (e) => setDate(e.target.value));

  function setDate(newDate) {
    if (!newDate) return;
    selectedDate = newDate;
    renderTasksView(container);
  }

  // Filter Pills
  container.querySelectorAll('.filter-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedStatusFilter = btn.dataset.status;
      renderTasksView(container);
    });
  });

  // Category Dropdown Filter
  const catFilter = container.querySelector('#taskCategoryFilter');
  if (catFilter) {
    catFilter.addEventListener('change', (e) => {
      selectedCategoryFilter = e.target.value;
      renderTasksView(container);
    });
  }

  // Add Task Modal
  const addTaskBtn = container.querySelector('#addTaskBtn');
  const emptyAddTaskBtn = container.querySelector('#emptyAddTaskBtn');
  const openNewTaskModal = () => openTaskFormModal(null, selectedDate);
  if (addTaskBtn) addTaskBtn.addEventListener('click', openNewTaskModal);
  if (emptyAddTaskBtn) emptyAddTaskBtn.addEventListener('click', openNewTaskModal);

  // Card Actions
  container.querySelectorAll('.task-card').forEach(card => {
    const taskId = card.dataset.taskId;
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    // Toggle Complete
    const toggleBtn = card.querySelector('[data-action="toggle"]');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const updated = state.toggleTaskCompletion(taskId);
        if (updated) {
          if (updated.status === 'completed') {
            modalManager.showToast(`Task marked as done: "${updated.title}"`, 'success');
          }
          renderTasksView(container);
        }
      });
    }

    // Edit
    const editBtn = card.querySelector('[data-action="edit"]');
    if (editBtn) {
      editBtn.addEventListener('click', () => openTaskFormModal(task));
    }

    // Delete
    const deleteBtn = card.querySelector('[data-action="delete"]');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        modalManager.confirm({
          title: 'Delete Task',
          message: `Are you sure you want to delete "${task.title}"?`,
          onConfirm: () => {
            state.deleteTask(taskId);
            modalManager.showToast('Task deleted', 'info');
            renderTasksView(container);
          }
        });
      });
    }

    // Log to Activity Shortcut
    const logActivityBtn = card.querySelector('[data-action="log-activity"]');
    if (logActivityBtn) {
      logActivityBtn.addEventListener('click', () => {
        // Pre-fill activity modal with task data
        openActivityFormModalFromTask(task);
      });
    }
  });
}

// Modal for Task Add / Edit
export function openTaskFormModal(task = null, defaultDate = getTodayDateString()) {
  const isEditing = !!task;
  const initial = task || {
    title: '',
    category: 'DSA',
    date: defaultDate,
    status: 'pending',
    priority: 'medium',
    plannedDuration: '',
    actualDuration: '',
    notes: ''
  };

  modalManager.openModal({
    title: isEditing ? 'Edit Task' : 'New Daily Task',
    bodyHtml: `
      <form id="taskForm">
        <div class="form-group">
          <label class="form-label" for="taskTitleInput">Task Name *</label>
          <input type="text" id="taskTitleInput" name="title" class="form-input" required placeholder="e.g. Solve 2 LeetCode problems" value="${initial.title}">
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="taskCategorySelect">Category *</label>
            <select id="taskCategorySelect" name="category" class="form-select" required>
              ${CATEGORIES.map(c => `
                <option value="${c.name}" ${initial.category === c.name ? 'selected' : ''}>${c.name}</option>
              `).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="taskDateInput">Date *</label>
            <input type="date" id="taskDateInput" name="date" class="form-input" required value="${initial.date}">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="taskPrioritySelect">Priority</label>
            <select id="taskPrioritySelect" name="priority" class="form-select">
              <option value="high" ${initial.priority === 'high' ? 'selected' : ''}>High</option>
              <option value="medium" ${initial.priority === 'medium' ? 'selected' : ''}>Medium</option>
              <option value="low" ${initial.priority === 'low' ? 'selected' : ''}>Low</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="taskStatusSelect">Status</label>
            <select id="taskStatusSelect" name="status" class="form-select">
              <option value="pending" ${initial.status === 'pending' ? 'selected' : ''}>Pending (Not Done)</option>
              <option value="completed" ${initial.status === 'completed' ? 'selected' : ''}>Completed (Done)</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="taskPlannedInput">Planned Duration (mins)</label>
            <input type="number" id="taskPlannedInput" name="plannedDuration" min="0" step="5" class="form-input" placeholder="e.g. 45" value="${initial.plannedDuration || ''}">
            <span class="form-hint">Estimated minutes</span>
          </div>

          <div class="form-group">
            <label class="form-label" for="taskActualInput">Actual Duration (mins)</label>
            <input type="number" id="taskActualInput" name="actualDuration" min="0" step="5" class="form-input" placeholder="e.g. 60" value="${initial.actualDuration || ''}">
            <span class="form-hint">Time actually taken</span>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="taskNotesInput">Notes / Details (optional)</label>
          <textarea id="taskNotesInput" name="notes" class="form-textarea" placeholder="Key takeaways, links, or subtasks...">${initial.notes}</textarea>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" data-action="cancel">Cancel</button>
          <button type="submit" class="btn btn-primary">${isEditing ? 'Save Changes' : 'Create Task'}</button>
        </div>
      </form>
    `,
    onSubmit: (formData) => {
      if (isEditing) {
        state.updateTask(task.id, formData);
        modalManager.showToast('Task updated', 'success');
      } else {
        state.addTask(formData);
        modalManager.showToast('New task added', 'success');
      }
      modalManager.closeModal();
      const container = document.getElementById('view-tasks');
      if (container) renderTasksView(container);
    }
  });
}

function openActivityFormModalFromTask(task) {
  modalManager.openModal({
    title: 'Log Activity from Completed Task',
    bodyHtml: `
      <form id="activityFromTaskForm">
        <div class="form-group">
          <label class="form-label">Activity Title *</label>
          <input type="text" name="title" class="form-input" required value="${task.title}">
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Category *</label>
            <select name="category" class="form-select" required>
              ${CATEGORIES.map(c => `
                <option value="${c.name}" ${task.category === c.name ? 'selected' : ''}>${c.name}</option>
              `).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Date *</label>
            <input type="date" name="date" class="form-input" required value="${task.date}">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Duration (Minutes) *</label>
            <input type="number" name="duration" min="5" step="5" class="form-input" required placeholder="e.g. 60" value="${task.actualDuration || task.plannedDuration || 45}">
          </div>

          <div class="form-group">
            <label class="form-label">Quantity / Output (optional)</label>
            <input type="text" name="quantity" class="form-input" placeholder="e.g. 2 problems, 1 chapter">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Notes (optional)</label>
          <textarea name="notes" class="form-textarea" placeholder="Session notes...">${task.notes || ''}</textarea>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" data-action="cancel">Cancel</button>
          <button type="submit" class="btn btn-primary">Log to Heatmap</button>
        </div>
      </form>
    `,
    onSubmit: (data) => {
      state.addActivity(data);
      modalManager.closeModal();
      modalManager.showToast(`Logged activity: ${data.duration}m added!`, 'success');
    }
  });
}

// Main Application Coordinator & View Router
import { state } from './state.js';
import { calculateActivityStats } from './utils/dateUtils.js';
import { icons } from './icons.js';
import { modalManager } from './components/modal.js';
import { renderDashboard } from './components/dashboard.js';
import { renderTasksView, openTaskFormModal } from './components/tasksView.js';
import { renderTimetableView } from './components/timetableView.js';
import { renderActivityView, openActivityFormModal } from './components/activityView.js';

let currentView = 'dashboard';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize modal & toast system
  modalManager.init();

  // 2. Render initial state & streak badge
  updateGlobalStreakBadge();

  // 3. Setup Navigation Tabs
  setupNavigation();

  // 4. Setup Global Header Actions (Backup / Demo Data / Quick Add)
  setupHeaderActions();

  // 5. Initial View Render
  switchView('dashboard');

  // 6. Subscribe to Central State Changes
  state.subscribe(() => {
    updateGlobalStreakBadge();
    refreshActiveView();
  });

  // 7. Register Service Worker for PWA capabilities
  registerServiceWorker();
});

function registerServiceWorker() {
  if ('serviceWorker' in navigator && (window.location.protocol.startsWith('http') || window.location.protocol === 'https:')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then(reg => {
        // SW registered
      }).catch(err => {
        // Optional/graceful fallback
      });
    });
  }
}

function updateGlobalStreakBadge() {
  const badgeEl = document.getElementById('globalStreakBadge');
  if (!badgeEl) return;
  const stats = calculateActivityStats(state.activities, state.tasks);
  badgeEl.innerHTML = `
    <span class="streak-flame">${icons.flame}</span>
    <span>${stats.currentStreak} Day Streak</span>
  `;
}

function setupNavigation() {
  const tabs = document.querySelectorAll('.nav-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetView = tab.dataset.view;
      if (targetView) {
        switchView(targetView);
      }
    });
  });
}

export function switchView(viewName) {
  currentView = viewName;

  // Update nav tabs active state
  document.querySelectorAll('.nav-tab').forEach(tab => {
    if (tab.dataset.view === viewName) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });

  // Hide all sections and show active
  document.querySelectorAll('.view-section').forEach(section => {
    section.classList.remove('active');
  });

  const activeContainer = document.getElementById(`view-${viewName}`);
  if (activeContainer) {
    activeContainer.classList.add('active');
    renderActiveView(viewName, activeContainer);
  }
}

function renderActiveView(viewName, container) {
  if (viewName === 'dashboard') {
    renderDashboard(container);
  } else if (viewName === 'tasks') {
    renderTasksView(container);
  } else if (viewName === 'timetables') {
    renderTimetableView(container);
  } else if (viewName === 'activity') {
    renderActivityView(container);
  }
}

function refreshActiveView() {
  const activeContainer = document.getElementById(`view-${currentView}`);
  if (activeContainer) {
    renderActiveView(currentView, activeContainer);
  }
}

function setupHeaderActions() {
  // Global + Task Button
  const headerNewTaskBtn = document.getElementById('headerNewTaskBtn');
  if (headerNewTaskBtn) {
    headerNewTaskBtn.addEventListener('click', () => openTaskFormModal());
  }

  // Global + Log Activity Button
  const headerLogActivityBtn = document.getElementById('headerLogActivityBtn');
  if (headerLogActivityBtn) {
    headerLogActivityBtn.addEventListener('click', () => openActivityFormModal());
  }

  // Data Management Modal (Backup / Restore / Reset / Demo Data)
  const dataSettingsBtn = document.getElementById('dataSettingsBtn');
  if (dataSettingsBtn) {
    dataSettingsBtn.addEventListener('click', openDataSettingsModal);
  }
}

function openDataSettingsModal() {
  modalManager.openModal({
    title: 'Data & Backup Management',
    bodyHtml: `
      <div style="display: flex; flex-direction: column; gap: 1.25rem;">
        <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.5;">
          All personal tracker data is stored securely in your browser's local storage. You can export a JSON backup anytime or load realistic sample data.
        </p>

        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          <h4 style="font-size: 0.85rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">
            Backup & Transfer
          </h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
            <button class="btn btn-secondary" id="exportDataBtn">
              ${icons.download} Export JSON Backup
            </button>
            <label class="btn btn-secondary" style="cursor: pointer; margin: 0;">
              ${icons.upload} Import JSON Backup
              <input type="file" id="importFileInput" accept=".json" style="display: none;">
            </label>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.75rem; border-top: 1px solid var(--border-subtle); padding-top: 1rem;">
          <h4 style="font-size: 0.85rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">
            Sample Data & Reset
          </h4>
          <div style="display: flex; gap: 0.75rem;">
            <button class="btn btn-primary" id="loadSampleDataBtn" style="flex: 1;">
              ${icons.refresh} Load Sample Dataset
            </button>
            <button class="btn btn-danger" id="resetAllDataBtn">
              ${icons.trash} Reset All Data
            </button>
          </div>
          <span class="form-hint">Loading sample data populates realistic academic timetables, career timetables, tasks, and 45 days of heatmap activity.</span>
        </div>
      </div>
    `,
    onOpen: (container) => {
      // Export
      const exportBtn = container.querySelector('#exportDataBtn');
      if (exportBtn) {
        exportBtn.addEventListener('click', () => {
          state.exportJSON();
          modalManager.showToast('Backup JSON downloaded', 'success');
        });
      }

      // Import
      const importInput = container.querySelector('#importFileInput');
      if (importInput) {
        importInput.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (event) => {
            const success = state.importJSON(event.target.result);
            if (success) {
              modalManager.closeModal();
              modalManager.showToast('Backup successfully restored!', 'success');
            } else {
              modalManager.showToast('Invalid JSON backup file', 'error');
            }
          };
          reader.readAsText(file);
        });
      }

      // Load Sample Data
      const loadSampleBtn = container.querySelector('#loadSampleDataBtn');
      if (loadSampleBtn) {
        loadSampleBtn.addEventListener('click', () => {
          state.loadSeedData();
          modalManager.closeModal();
          modalManager.showToast('Sample dataset loaded successfully', 'success');
        });
      }

      // Reset All Data
      const resetBtn = container.querySelector('#resetAllDataBtn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          modalManager.confirm({
            title: 'Clear All Data',
            message: 'Are you sure you want to erase all tasks, timetables, and activity logs? This action is irreversible.',
            confirmText: 'Yes, Erase All',
            onConfirm: () => {
              state.resetAllData();
              modalManager.closeModal();
              modalManager.showToast('All data cleared', 'info');
            }
          });
        });
      }
    }
  });
}

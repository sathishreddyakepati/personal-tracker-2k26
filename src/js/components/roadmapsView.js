// Roadmaps Screen Component — Learning Paths & Long-Term Goal Tracking
import { state, CATEGORIES, getCategoryStyle } from '../state.js';
import { icons } from '../icons.js';
import { modalManager } from './modal.js';

let activeRoadmapId = null;
let searchQuery = '';
let categoryFilter = 'all';
let typeFilter = 'all'; // 'all' | 'checklist' | 'problems'
const collapsedSections = new Set();

export function renderRoadmapsView(container) {
  if (!container) return;

  if (activeRoadmapId) {
    const roadmap = state.roadmaps.find(r => r.id === activeRoadmapId);
    if (!roadmap) {
      activeRoadmapId = null;
      renderListView(container);
    } else {
      renderDetailView(container, roadmap);
    }
  } else {
    renderListView(container);
  }
}

// ==========================================
// 1. LIST VIEW (ALL ROADMAPS)
// ==========================================
function renderListView(container) {
  let filtered = state.roadmaps;

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(r => 
      (r.title && r.title.toLowerCase().includes(q)) ||
      (r.description && r.description.toLowerCase().includes(q)) ||
      (r.category && r.category.toLowerCase().includes(q))
    );
  }

  if (categoryFilter !== 'all') {
    filtered = filtered.filter(r => (r.category || '').toLowerCase() === categoryFilter.toLowerCase());
  }

  if (typeFilter !== 'all') {
    filtered = filtered.filter(r => {
      const type = (r.progressType === 'numeric' || r.progressType === 'problems') ? 'problems' : 'checklist';
      return type === typeFilter;
    });
  }

  container.innerHTML = `
    <div class="roadmaps-view">
      <!-- Header -->
      <div class="roadmaps-header">
        <div class="roadmaps-title-area">
          <h2>Roadmaps</h2>
          <p>Track structured long-term learning paths, milestone curricula, and problem-solving practice.</p>
        </div>
        <button class="btn btn-primary" id="createRoadmapBtn">
          ${icons.plus} Create Roadmap
        </button>
      </div>

      <!-- Filters & Search Bar -->
      <div class="roadmaps-filter-bar">
        <div class="roadmaps-search-box">
          <input 
            type="text" 
            class="form-input" 
            id="roadmapSearchInput" 
            placeholder="Search roadmaps by title or topic..." 
            value="${escapeHtml(searchQuery)}"
          />
        </div>

        <div class="roadmaps-filters-group">
          <select class="roadmaps-filter-select" id="roadmapCategoryFilter">
            <option value="all" ${categoryFilter === 'all' ? 'selected' : ''}>All Categories</option>
            ${CATEGORIES.map(c => `
              <option value="${c.name}" ${categoryFilter.toLowerCase() === c.name.toLowerCase() ? 'selected' : ''}>
                ${c.name}
              </option>
            `).join('')}
          </select>

          <select class="roadmaps-filter-select" id="roadmapTypeFilter">
            <option value="all" ${typeFilter === 'all' ? 'selected' : ''}>All Types</option>
            <option value="checklist" ${typeFilter === 'checklist' ? 'selected' : ''}>Checklist Roadmap</option>
            <option value="problems" ${typeFilter === 'problems' ? 'selected' : ''}>Problem Roadmap</option>
          </select>
        </div>
      </div>

      <!-- Roadmaps Grid -->
      <div class="roadmaps-grid">
        ${filtered.length === 0 ? renderEmptyState() : filtered.map(r => renderRoadmapCard(r)).join('')}
      </div>
    </div>
  `;

  setupListEvents(container);
}

function renderEmptyState() {
  const isFiltering = searchQuery || categoryFilter !== 'all' || typeFilter !== 'all';
  return `
    <div class="roadmaps-empty-state">
      <div class="stat-icon-wrapper stat-icon-indigo" style="width: 56px; height: 56px;">
        ${icons.map}
      </div>
      <h3 class="roadmaps-empty-title">
        ${isFiltering ? 'No matching roadmaps found' : 'No roadmaps created yet'}
      </h3>
      <p class="roadmaps-empty-desc">
        ${isFiltering 
          ? 'Try adjusting your search query or filter settings.' 
          : 'Create your first roadmap to track Java + DSA, LeetCode Problem goals, ML Specialization, or Books.'}
      </p>
      ${isFiltering ? `
        <button class="btn btn-secondary btn-sm" id="resetFiltersBtn">Reset Filters</button>
      ` : `
        <button class="btn btn-primary btn-sm" id="emptyCreateRoadmapBtn">${icons.plus} Create First Roadmap</button>
      `}
    </div>
  `;
}

function renderRoadmapCard(roadmap) {
  const progress = state.getRoadmapProgress(roadmap.id);
  const catStyle = getCategoryStyle(roadmap.category);
  const isChecklist = roadmap.progressType === 'checklist';

  return `
    <div class="roadmap-card" data-card-id="${roadmap.id}">
      <div>
        <div class="roadmap-card-header">
          <div class="roadmap-card-title-row">
            <h3 class="roadmap-card-title">${escapeHtml(roadmap.title)}</h3>
            <div class="roadmap-card-badges">
              <span class="badge" style="background: ${catStyle.bg}; color: ${catStyle.color}; border-color: ${catStyle.color}40;">
                <span class="badge-dot" style="background: ${catStyle.color};"></span>
                ${escapeHtml(catStyle.name)}
              </span>
              <span class="badge" style="background: rgba(255, 255, 255, 0.06); color: var(--text-secondary); border-color: var(--border-subtle);">
                ${isChecklist ? `${icons.listCheck} Checklist` : `${icons.target} Problem Roadmap`}
              </span>
            </div>
          </div>
        </div>

        ${roadmap.description ? `
          <p class="roadmap-card-desc">${escapeHtml(roadmap.description)}</p>
        ` : '<div style="margin-bottom: 1.25rem;"></div>'}
      </div>

      <div class="roadmap-card-progress">
        <div class="roadmap-progress-info">
          <span>${progress.progressText}</span>
          <span class="roadmap-progress-pct">${progress.percentage}%</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" style="width: ${progress.percentage}%; background: ${catStyle.color};"></div>
        </div>
      </div>

      <div class="roadmap-card-footer">
        <button class="btn btn-secondary btn-sm open-roadmap-btn" data-roadmap-id="${roadmap.id}">
          Open Roadmap ${icons.chevronRight}
        </button>
      </div>
    </div>
  `;
}

function setupListEvents(container) {
  const createBtn = container.querySelector('#createRoadmapBtn');
  if (createBtn) {
    createBtn.addEventListener('click', () => openCreateRoadmapModal(container));
  }

  const emptyCreateBtn = container.querySelector('#emptyCreateRoadmapBtn');
  if (emptyCreateBtn) {
    emptyCreateBtn.addEventListener('click', () => openCreateRoadmapModal(container));
  }

  const resetFiltersBtn = container.querySelector('#resetFiltersBtn');
  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener('click', () => {
      searchQuery = '';
      categoryFilter = 'all';
      typeFilter = 'all';
      renderRoadmapsView(container);
    });
  }

  const searchInput = container.querySelector('#roadmapSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderRoadmapsView(container);
    });
  }

  const catFilterSelect = container.querySelector('#roadmapCategoryFilter');
  if (catFilterSelect) {
    catFilterSelect.addEventListener('change', (e) => {
      categoryFilter = e.target.value;
      renderRoadmapsView(container);
    });
  }

  const typeFilterSelect = container.querySelector('#roadmapTypeFilter');
  if (typeFilterSelect) {
    typeFilterSelect.addEventListener('change', (e) => {
      typeFilter = e.target.value;
      renderRoadmapsView(container);
    });
  }

  container.querySelectorAll('.open-roadmap-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.roadmapId;
      if (id) {
        activeRoadmapId = id;
        renderRoadmapsView(container);
      }
    });
  });

  container.querySelectorAll('.roadmap-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('button')) return;
      const id = card.dataset.cardId;
      if (id) {
        activeRoadmapId = id;
        renderRoadmapsView(container);
      }
    });
  });
}

// ==========================================
// 2. DETAIL VIEW (SINGLE ROADMAP)
// ==========================================
function renderDetailView(container, roadmap) {
  const progress = state.getRoadmapProgress(roadmap.id);
  const catStyle = getCategoryStyle(roadmap.category);
  const isChecklist = roadmap.progressType === 'checklist';

  container.innerHTML = `
    <div class="roadmap-detail">
      <!-- Breadcrumb / Back Navigation -->
      <div class="roadmap-detail-top">
        <button class="btn btn-secondary btn-sm" id="roadmapBackBtn">
          ${icons.chevronLeft} Back to Roadmaps
        </button>
        <div class="roadmap-detail-actions">
          <button class="btn btn-secondary btn-sm" id="editRoadmapBtn">
            ${icons.edit} Edit Roadmap
          </button>
          <button class="btn btn-danger btn-sm" id="deleteRoadmapBtn">
            ${icons.trash} Delete
          </button>
        </div>
      </div>

      <!-- Roadmap Header Banner -->
      <div class="roadmap-detail-banner">
        <div class="roadmap-detail-header-row">
          <div class="roadmap-detail-title-col">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.35rem; flex-wrap: wrap;">
              <span class="badge" style="background: ${catStyle.bg}; color: ${catStyle.color}; border-color: ${catStyle.color}40;">
                <span class="badge-dot" style="background: ${catStyle.color};"></span>
                ${escapeHtml(catStyle.name)}
              </span>
              <span class="badge" style="background: rgba(255, 255, 255, 0.06); color: var(--text-secondary); border-color: var(--border-subtle);">
                ${isChecklist ? `${icons.listCheck} Checklist Roadmap` : `${icons.target} Problem Roadmap`}
              </span>
            </div>
            <h1 class="roadmap-detail-title">${escapeHtml(roadmap.title)}</h1>
            ${roadmap.description ? `<p class="roadmap-detail-desc">${escapeHtml(roadmap.description)}</p>` : ''}
          </div>
        </div>

        <!-- Overall Progress Box -->
        <div class="roadmap-detail-progress-box">
          <div class="roadmap-progress-info">
            <span><strong>Overall Progress:</strong> ${progress.progressText}</span>
            <span class="roadmap-progress-pct" style="color: ${catStyle.color}; font-size: 1rem;">${progress.percentage}%</span>
          </div>
          <div class="progress-track" style="height: 10px;">
            <div class="progress-fill" style="width: ${progress.percentage}%; background: ${catStyle.color};"></div>
          </div>
        </div>
      </div>

      <!-- Content Section: Problem Roadmap vs Checklist Roadmap -->
      ${isChecklist ? renderChecklistContent(roadmap) : renderProblemRoadmapContent(roadmap, progress, catStyle)}
    </div>
  `;

  setupDetailEvents(container, roadmap);
}

// ==========================================
// 3. PROBLEM ROADMAP CONTENT & TOPICS
// ==========================================
function renderProblemRoadmapContent(roadmap, progress, catStyle) {
  const topics = state.roadmapProblemTopics
    .filter(t => t.roadmapId === roadmap.id)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return `
    <div class="problem-topics-section">
      <div class="problem-topics-toolbar">
        <h3 class="problem-topics-toolbar-title">Topics (${topics.length})</h3>
        <button class="btn btn-primary btn-sm" id="addProblemTopicBtn">
          ${icons.plus} Add Topic
        </button>
      </div>

      <div class="problem-topics-list">
        ${topics.length === 0 ? `
          <div class="roadmaps-empty-state" style="padding: 2.5rem 1.5rem;">
            <h4 class="roadmaps-empty-title">No topics added yet</h4>
            <p class="roadmaps-empty-desc">
              Break down your problem-solving roadmap into topics like Arrays, Strings, Binary Search, Dynamic Programming, etc.
            </p>
            <button class="btn btn-primary btn-sm" id="emptyAddTopicBtn" style="margin-top: 0.5rem;">
              ${icons.plus} Add First Topic
            </button>
          </div>
        ` : topics.map((topic, idx) => renderProblemTopicCard(topic, idx, topics.length, catStyle)).join('')}
      </div>

      ${topics.length > 0 ? `
        <div class="problem-topics-total-bar">
          <span class="problem-total-label">Overall Total</span>
          <span class="problem-total-val" style="color: ${catStyle.color};">
            ${progress.totalSolved} / ${progress.totalProblems} Problems (${progress.percentage}%)
          </span>
        </div>
      ` : ''}
    </div>
  `;
}

function renderProblemTopicCard(topic, idx, totalTopics, catStyle) {
  const solved = Number(topic.solved) || 0;
  const total = Number(topic.total) || 1;
  const pct = total > 0 ? Math.round((solved / total) * 100) : 0;

  return `
    <div class="problem-topic-card" data-topic-id="${topic.id}">
      <div class="problem-topic-info">
        <div class="problem-topic-header-row">
          <span class="problem-topic-title">${escapeHtml(topic.title)}</span>
          <span class="problem-topic-stats">
            <strong>${solved}</strong> / ${total}
            <span style="font-weight: 500; font-size: 0.8rem; color: var(--text-muted); margin-left: 0.25rem;">(${pct}%)</span>
          </span>
        </div>
        <div class="problem-topic-progress-track">
          <div class="problem-topic-progress-fill" style="width: ${pct}%; background: ${catStyle.color};"></div>
        </div>
      </div>

      <div class="problem-topic-actions">
        <!-- Quick Steps -->
        <button 
          class="btn btn-secondary btn-sm problem-step-btn" 
          data-action="step" 
          data-step="-1" 
          data-topic-id="${topic.id}" 
          ${solved <= 0 ? 'disabled' : ''} 
          title="Solved -1"
        >-1</button>

        <button 
          class="btn btn-secondary btn-sm problem-step-btn" 
          data-action="step" 
          data-step="1" 
          data-topic-id="${topic.id}" 
          ${solved >= total ? 'disabled' : ''} 
          title="Solved +1"
        >+1</button>

        <button 
          class="btn btn-secondary btn-sm problem-step-btn" 
          data-action="step" 
          data-step="5" 
          data-topic-id="${topic.id}" 
          ${solved >= total ? 'disabled' : ''} 
          title="Solved +5"
        >+5</button>

        <!-- Reorder -->
        <button class="btn btn-ghost btn-icon-only btn-sm topic-reorder-btn" data-action="up" data-topic-id="${topic.id}" ${idx === 0 ? 'disabled' : ''} title="Move Up">
          ${icons.arrowUp}
        </button>
        <button class="btn btn-ghost btn-icon-only btn-sm topic-reorder-btn" data-action="down" data-topic-id="${topic.id}" ${idx === totalTopics - 1 ? 'disabled' : ''} title="Move Down">
          ${icons.arrowDown}
        </button>

        <!-- Edit & Delete -->
        <button class="btn btn-ghost btn-icon-only btn-sm topic-edit-btn" data-topic-id="${topic.id}" title="Edit Topic">
          ${icons.edit}
        </button>
        <button class="btn btn-ghost btn-icon-only btn-sm topic-delete-btn" data-topic-id="${topic.id}" title="Delete Topic">
          ${icons.trash}
        </button>
      </div>
    </div>
  `;
}

// ==========================================
// 4. CHECKLIST ROADMAP CONTENT
// ==========================================
function renderChecklistContent(roadmap) {
  const sections = state.roadmapSections
    .filter(s => s.roadmapId === roadmap.id)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const unsectionedItems = state.roadmapItems
    .filter(i => i.roadmapId === roadmap.id && !i.sectionId)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return `
    <div class="checklist-toolbar">
      <h3 class="checklist-toolbar-title">Curriculum & Checklist Items</h3>
      <div class="checklist-toolbar-actions">
        <button class="btn btn-secondary btn-sm" id="addSectionBtn">
          ${icons.plus} Add Section
        </button>
        <button class="btn btn-secondary btn-sm" id="bulkAddBtn">
          ${icons.upload} Bulk Add Items
        </button>
        <button class="btn btn-primary btn-sm" id="addItemBtn">
          ${icons.plus} Add Item
        </button>
      </div>
    </div>

    <div class="roadmap-sections-container">
      ${sections.length === 0 && unsectionedItems.length === 0 ? `
        <div class="roadmaps-empty-state" style="padding: 2.5rem 1.5rem;">
          <h4 class="roadmaps-empty-title">Checklist is currently empty</h4>
          <p class="roadmaps-empty-desc">
            Add items individually, create sections/phases, or use <strong>Bulk Add</strong> to paste multiple topics at once.
          </p>
          <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
            <button class="btn btn-primary btn-sm" id="emptyBulkAddBtn">${icons.upload} Bulk Add Items</button>
            <button class="btn btn-secondary btn-sm" id="emptyAddItemBtn">${icons.plus} Add Single Item</button>
          </div>
        </div>
      ` : ''}

      ${sections.map((section, sIdx) => {
        const items = state.roadmapItems
          .filter(i => i.roadmapId === roadmap.id && i.sectionId === section.id)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        const completedCount = items.filter(i => i.completed).length;
        const isCollapsed = collapsedSections.has(section.id);

        return `
          <div class="roadmap-section-block" data-section-id="${section.id}">
            <div class="section-header" data-toggle-section="${section.id}">
              <div class="section-title-wrap">
                <button class="section-collapse-toggle" type="button" aria-label="Toggle section">
                  ${isCollapsed ? icons.chevronRight : icons.chevronDown}
                </button>
                <h4 class="section-title">${escapeHtml(section.title)}</h4>
                <span class="section-item-count-badge">
                  ${completedCount} / ${items.length} completed
                </span>
              </div>

              <div class="section-actions" onclick="event.stopPropagation();">
                <button class="btn btn-ghost btn-icon-only btn-sm section-move-btn" data-action="up" data-section-id="${section.id}" ${sIdx === 0 ? 'disabled' : ''} title="Move Section Up">
                  ${icons.arrowUp}
                </button>
                <button class="btn btn-ghost btn-icon-only btn-sm section-move-btn" data-action="down" data-section-id="${section.id}" ${sIdx === sections.length - 1 ? 'disabled' : ''} title="Move Section Down">
                  ${icons.arrowDown}
                </button>
                <button class="btn btn-ghost btn-icon-only btn-sm section-edit-btn" data-section-id="${section.id}" title="Edit Section Title">
                  ${icons.edit}
                </button>
                <button class="btn btn-ghost btn-icon-only btn-sm section-delete-btn" data-section-id="${section.id}" title="Delete Section">
                  ${icons.trash}
                </button>
              </div>
            </div>

            <div class="section-items-list ${isCollapsed ? 'collapsed' : ''}" id="sec_items_${section.id}">
              ${items.length === 0 ? `
                <div style="padding: 1.25rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
                  No items in this section yet.
                </div>
              ` : items.map((item, iIdx) => renderItemRow(item, iIdx, items.length, sections)).join('')}
            </div>
          </div>
        `;
      }).join('')}

      ${unsectionedItems.length > 0 ? `
        <div class="roadmap-section-block">
          <div class="section-header" style="cursor: default;">
            <div class="section-title-wrap">
              <h4 class="section-title" style="color: var(--text-secondary);">
                ${sections.length > 0 ? 'General / Unsectioned Items' : 'All Checklist Items'}
              </h4>
              <span class="section-item-count-badge">
                ${unsectionedItems.filter(i => i.completed).length} / ${unsectionedItems.length} completed
              </span>
            </div>
          </div>
          <div class="section-items-list">
            ${unsectionedItems.map((item, iIdx) => renderItemRow(item, iIdx, unsectionedItems.length, sections)).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

function renderItemRow(item, idx, totalInGroup, sections) {
  return `
    <div class="roadmap-item-row ${item.completed ? 'completed' : ''}" data-item-id="${item.id}">
      <div class="roadmap-item-main">
        <button 
          type="button" 
          class="roadmap-item-checkbox ${item.completed ? 'checked' : ''}" 
          data-action="toggle-item" 
          data-item-id="${item.id}"
          title="${item.completed ? 'Mark incomplete' : 'Mark completed'}"
        >
          ${icons.check}
        </button>

        <div class="roadmap-item-content">
          <span class="roadmap-item-title">${escapeHtml(item.title)}</span>
          ${item.description ? `<span class="roadmap-item-desc">${escapeHtml(item.description)}</span>` : ''}
          ${item.resourceUrl ? `
            <a 
              href="${escapeHtml(item.resourceUrl)}" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="roadmap-item-resource-link" 
              title="Open external resource"
            >
              ${icons.externalLink} <span>Resource</span>
            </a>
          ` : ''}
        </div>
      </div>

      <div class="roadmap-item-actions">
        <button class="btn btn-ghost btn-icon-only btn-sm item-reorder-btn" data-action="up" data-item-id="${item.id}" ${idx === 0 ? 'disabled' : ''} title="Move Up">
          ${icons.arrowUp}
        </button>
        <button class="btn btn-ghost btn-icon-only btn-sm item-reorder-btn" data-action="down" data-item-id="${item.id}" ${idx === totalInGroup - 1 ? 'disabled' : ''} title="Move Down">
          ${icons.arrowDown}
        </button>
        
        ${sections.length > 0 ? `
          <button class="btn btn-ghost btn-icon-only btn-sm item-move-sec-btn" data-item-id="${item.id}" title="Move to Section">
            ${icons.tag}
          </button>
        ` : ''}

        <button class="btn btn-ghost btn-icon-only btn-sm item-edit-btn" data-item-id="${item.id}" title="Edit Item">
          ${icons.edit}
        </button>
        <button class="btn btn-ghost btn-icon-only btn-sm item-delete-btn" data-item-id="${item.id}" title="Delete Item">
          ${icons.trash}
        </button>
      </div>
    </div>
  `;
}

// ==========================================
// 5. DETAIL EVENT HANDLERS
// ==========================================
function setupDetailEvents(container, roadmap) {
  const backBtn = container.querySelector('#roadmapBackBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      activeRoadmapId = null;
      renderRoadmapsView(container);
    });
  }

  const editRoadmapBtn = container.querySelector('#editRoadmapBtn');
  if (editRoadmapBtn) {
    editRoadmapBtn.addEventListener('click', () => openEditRoadmapModal(container, roadmap));
  }

  const deleteRoadmapBtn = container.querySelector('#deleteRoadmapBtn');
  if (deleteRoadmapBtn) {
    deleteRoadmapBtn.addEventListener('click', () => confirmDeleteRoadmap(container, roadmap));
  }

  // --- Problem Roadmap Topic Events ---
  const addProblemTopicBtn = container.querySelector('#addProblemTopicBtn');
  if (addProblemTopicBtn) {
    addProblemTopicBtn.addEventListener('click', () => openAddEditTopicModal(container, roadmap.id));
  }

  const emptyAddTopicBtn = container.querySelector('#emptyAddTopicBtn');
  if (emptyAddTopicBtn) {
    emptyAddTopicBtn.addEventListener('click', () => openAddEditTopicModal(container, roadmap.id));
  }

  container.querySelectorAll('[data-action="step"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const step = Number(btn.dataset.step) || 0;
      const topicId = btn.dataset.topicId;
      const result = state.stepProblemTopicSolved(topicId, step);
      if (!result.success) {
        modalManager.showToast(result.message, 'error');
      } else {
        renderRoadmapsView(container);
      }
    });
  });

  container.querySelectorAll('.topic-reorder-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      const topicId = btn.dataset.topicId;
      state.reorderProblemTopics(roadmap.id, topicId, action);
      renderRoadmapsView(container);
    });
  });

  container.querySelectorAll('.topic-edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const topicId = btn.dataset.topicId;
      const topic = state.roadmapProblemTopics.find(t => t.id === topicId);
      if (topic) openAddEditTopicModal(container, roadmap.id, topic);
    });
  });

  container.querySelectorAll('.topic-delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const topicId = btn.dataset.topicId;
      const topic = state.roadmapProblemTopics.find(t => t.id === topicId);
      if (topic) confirmDeleteTopic(container, topic);
    });
  });

  // --- Checklist Roadmap Events ---
  const addSectionBtn = container.querySelector('#addSectionBtn');
  if (addSectionBtn) {
    addSectionBtn.addEventListener('click', () => openAddEditSectionModal(container, roadmap.id));
  }

  const addItemBtn = container.querySelector('#addItemBtn');
  if (addItemBtn) {
    addItemBtn.addEventListener('click', () => openAddEditItemModal(container, roadmap.id));
  }

  const emptyAddItemBtn = container.querySelector('#emptyAddItemBtn');
  if (emptyAddItemBtn) {
    emptyAddItemBtn.addEventListener('click', () => openAddEditItemModal(container, roadmap.id));
  }

  const bulkAddBtn = container.querySelector('#bulkAddBtn');
  if (bulkAddBtn) {
    bulkAddBtn.addEventListener('click', () => openBulkAddModal(container, roadmap.id));
  }

  const emptyBulkAddBtn = container.querySelector('#emptyBulkAddBtn');
  if (emptyBulkAddBtn) {
    emptyBulkAddBtn.addEventListener('click', () => openBulkAddModal(container, roadmap.id));
  }

  container.querySelectorAll('[data-toggle-section]').forEach(header => {
    header.addEventListener('click', () => {
      const secId = header.dataset.toggleSection;
      if (collapsedSections.has(secId)) {
        collapsedSections.delete(secId);
      } else {
        collapsedSections.add(secId);
      }
      renderRoadmapsView(container);
    });
  });

  container.querySelectorAll('.section-move-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      const secId = btn.dataset.sectionId;
      state.reorderRoadmapSections(roadmap.id, secId, action);
      renderRoadmapsView(container);
    });
  });

  container.querySelectorAll('.section-edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const secId = btn.dataset.sectionId;
      const sec = state.roadmapSections.find(s => s.id === secId);
      if (sec) openAddEditSectionModal(container, roadmap.id, sec);
    });
  });

  container.querySelectorAll('.section-delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const secId = btn.dataset.sectionId;
      const sec = state.roadmapSections.find(s => s.id === secId);
      if (sec) confirmDeleteSection(container, sec);
    });
  });

  container.querySelectorAll('[data-action="toggle-item"]').forEach(chk => {
    chk.addEventListener('click', (e) => {
      e.stopPropagation();
      const itemId = chk.dataset.itemId;
      state.toggleRoadmapItem(itemId);
      renderRoadmapsView(container);
    });
  });

  container.querySelectorAll('.item-reorder-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      const itemId = btn.dataset.itemId;
      const item = state.roadmapItems.find(i => i.id === itemId);
      if (item) {
        state.reorderRoadmapItems(roadmap.id, item.sectionId, itemId, action);
        renderRoadmapsView(container);
      }
    });
  });

  container.querySelectorAll('.item-move-sec-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const itemId = btn.dataset.itemId;
      const item = state.roadmapItems.find(i => i.id === itemId);
      if (item) openMoveItemSectionModal(container, roadmap.id, item);
    });
  });

  container.querySelectorAll('.item-edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const itemId = btn.dataset.itemId;
      const item = state.roadmapItems.find(i => i.id === itemId);
      if (item) openAddEditItemModal(container, roadmap.id, item);
    });
  });

  container.querySelectorAll('.item-delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const itemId = btn.dataset.itemId;
      const item = state.roadmapItems.find(i => i.id === itemId);
      if (item) confirmDeleteItem(container, item);
    });
  });
}

// ==========================================
// 6. MODAL FORMS
// ==========================================

// Create Roadmap Modal
function openCreateRoadmapModal(container) {
  modalManager.openModal({
    title: 'Create Roadmap',
    bodyHtml: `
      <form id="createRoadmapForm" style="display: flex; flex-direction: column; gap: 1rem;">
        <div class="form-group">
          <label class="form-label" for="newRoadmapTitle">Roadmap Title <span style="color: var(--accent-rose);">*</span></label>
          <input 
            type="text" 
            class="form-input" 
            id="newRoadmapTitle" 
            name="title" 
            placeholder="e.g. LeetCode DSA, Java + DSA Master Roadmap, Python Mastery" 
            required 
            autocomplete="off"
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="newRoadmapCategory">Category</label>
            <select class="form-select" id="newRoadmapCategory" name="category">
              ${CATEGORIES.map(c => `<option value="${c.name}">${c.name}</option>`).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="newRoadmapType">Roadmap Type</label>
            <select class="form-select" id="newRoadmapType" name="progressType">
              <option value="problems">Problem Roadmap (Topics & Solved / Total)</option>
              <option value="checklist">Checklist Roadmap (Phases & Items)</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="newRoadmapDesc">Description (Optional)</label>
          <textarea 
            class="form-textarea" 
            id="newRoadmapDesc" 
            name="description" 
            placeholder="Outline your goals, target companies, or syllabus overview..."
            rows="2"
          ></textarea>
        </div>

        <span class="form-hint" id="roadmapTypeHint">
          Problem Roadmaps track solved problems across topics (e.g. Arrays, Strings, Trees, DP). Topics can be added right after creation.
        </span>

        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" data-action="cancel">Cancel</button>
          <button type="submit" class="btn btn-primary">Create Roadmap</button>
        </div>
      </form>
    `,
    onOpen: (modalBody) => {
      const typeSelect = modalBody.querySelector('#newRoadmapType');
      const hint = modalBody.querySelector('#roadmapTypeHint');

      typeSelect.addEventListener('change', () => {
        if (typeSelect.value === 'problems') {
          hint.textContent = 'Problem Roadmaps track solved problems across topics (e.g. Arrays, Strings, Trees, DP). Topics can be added right after creation.';
        } else {
          hint.textContent = 'Checklist Roadmaps track step-by-step curricula with phases, videos, courses, and checkbox items.';
        }
      });

      const form = modalBody.querySelector('#createRoadmapForm');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = modalBody.querySelector('#newRoadmapTitle').value.trim();
        if (!title) return;

        const progressType = typeSelect.value;
        const category = modalBody.querySelector('#newRoadmapCategory').value;
        const description = modalBody.querySelector('#newRoadmapDesc').value;

        const newRoadmap = state.addRoadmap({
          title,
          category,
          description,
          progressType
        });

        modalManager.closeModal();
        modalManager.showToast('Roadmap created successfully!', 'success');
        activeRoadmapId = newRoadmap.id;
        renderRoadmapsView(container);
      });
    }
  });
}

// Edit Roadmap Modal
function openEditRoadmapModal(container, roadmap) {
  modalManager.openModal({
    title: 'Edit Roadmap Details',
    bodyHtml: `
      <form id="editRoadmapForm" style="display: flex; flex-direction: column; gap: 1rem;">
        <div class="form-group">
          <label class="form-label" for="editRoadmapTitle">Roadmap Title <span style="color: var(--accent-rose);">*</span></label>
          <input 
            type="text" 
            class="form-input" 
            id="editRoadmapTitle" 
            name="title" 
            value="${escapeHtml(roadmap.title)}" 
            required 
            autocomplete="off"
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="editRoadmapCategory">Category</label>
          <select class="form-select" id="editRoadmapCategory" name="category">
            ${CATEGORIES.map(c => `
              <option value="${c.name}" ${roadmap.category.toLowerCase() === c.name.toLowerCase() ? 'selected' : ''}>
                ${c.name}
              </option>
            `).join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label" for="editRoadmapDesc">Description</label>
          <textarea 
            class="form-textarea" 
            id="editRoadmapDesc" 
            name="description" 
            rows="2"
          >${escapeHtml(roadmap.description || '')}</textarea>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" data-action="cancel">Cancel</button>
          <button type="submit" class="btn btn-primary">Save Changes</button>
        </div>
      </form>
    `,
    onOpen: (modalBody) => {
      const form = modalBody.querySelector('#editRoadmapForm');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = modalBody.querySelector('#editRoadmapTitle').value.trim();
        if (!title) return;

        state.updateRoadmap(roadmap.id, {
          title,
          category: modalBody.querySelector('#editRoadmapCategory').value,
          description: modalBody.querySelector('#editRoadmapDesc').value
        });

        modalManager.closeModal();
        modalManager.showToast('Roadmap updated', 'success');
        renderRoadmapsView(container);
      });
    }
  });
}

// Delete Roadmap Confirmation
function confirmDeleteRoadmap(container, roadmap) {
  modalManager.confirm({
    title: 'Delete Roadmap',
    message: `Are you sure you want to delete "${roadmap.title}"? All of its topics, sections, and checklist items will also be removed. This action is irreversible and will NOT affect your daily tasks, timetables, or activity history.`,
    confirmText: 'Yes, Delete Roadmap',
    onConfirm: () => {
      state.deleteRoadmap(roadmap.id);
      activeRoadmapId = null;
      modalManager.showToast('Roadmap deleted', 'info');
      renderRoadmapsView(container);
    }
  });
}

// ==========================================
// 7. PROBLEM TOPIC MODALS
// ==========================================
function openAddEditTopicModal(container, roadmapId, topicToEdit = null) {
  const isEditing = Boolean(topicToEdit);

  modalManager.openModal({
    title: isEditing ? 'Edit Topic' : 'Add Topic',
    bodyHtml: `
      <form id="problemTopicForm" style="display: flex; flex-direction: column; gap: 1rem;">
        <div class="form-group">
          <label class="form-label" for="topicTitle">Topic Name <span style="color: var(--accent-rose);">*</span></label>
          <input 
            type="text" 
            class="form-input" 
            id="topicTitle" 
            placeholder="e.g. Arrays, Strings, Binary Search, Trees, DP" 
            value="${isEditing ? escapeHtml(topicToEdit.title) : ''}" 
            required 
            autocomplete="off"
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="topicSolved">Solved Problems</label>
            <input 
              type="number" 
              class="form-input" 
              id="topicSolved" 
              value="${isEditing ? topicToEdit.solved : 0}" 
              min="0" 
              required 
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="topicTotal">Total Problems <span style="color: var(--accent-rose);">*</span></label>
            <input 
              type="number" 
              class="form-input" 
              id="topicTotal" 
              value="${isEditing ? topicToEdit.total : 40}" 
              min="1" 
              required 
            />
          </div>
        </div>

        <div id="topicValidationMsg" class="form-error-msg" style="display: none;"></div>

        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" data-action="cancel">Cancel</button>
          <button type="submit" class="btn btn-primary">${isEditing ? 'Save Changes' : 'Add Topic'}</button>
        </div>
      </form>
    `,
    onOpen: (modalBody) => {
      const form = modalBody.querySelector('#problemTopicForm');
      const titleInput = modalBody.querySelector('#topicTitle');
      const solvedInput = modalBody.querySelector('#topicSolved');
      const totalInput = modalBody.querySelector('#topicTotal');
      const valMsg = modalBody.querySelector('#topicValidationMsg');

      const validate = () => {
        const title = titleInput.value.trim();
        if (!title) {
          valMsg.textContent = 'Topic name is required.';
          valMsg.style.display = 'block';
          return false;
        }

        const solved = Number(solvedInput.value);
        const total = Number(totalInput.value);

        if (isNaN(solved) || solved < 0) {
          valMsg.textContent = 'Solved count cannot be negative.';
          valMsg.style.display = 'block';
          return false;
        }
        if (isNaN(total) || total <= 0) {
          valMsg.textContent = 'Total problems must be greater than zero.';
          valMsg.style.display = 'block';
          return false;
        }
        if (solved > total) {
          valMsg.textContent = 'Solved count cannot exceed total count.';
          valMsg.style.display = 'block';
          return false;
        }

        valMsg.style.display = 'none';
        return true;
      };

      solvedInput.addEventListener('input', validate);
      totalInput.addEventListener('input', validate);

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!validate()) return;

        const title = titleInput.value.trim();
        const solved = Number(solvedInput.value);
        const total = Number(totalInput.value);

        if (isEditing) {
          state.updateProblemTopic(topicToEdit.id, { title, solved, total });
          modalManager.showToast('Topic updated', 'success');
        } else {
          state.addProblemTopic({ roadmapId, title, solved, total });
          modalManager.showToast('Topic added', 'success');
        }

        modalManager.closeModal();
        renderRoadmapsView(container);
      });
    }
  });
}

function confirmDeleteTopic(container, topic) {
  modalManager.confirm({
    title: 'Delete Topic',
    message: `Are you sure you want to delete topic "${topic.title}"? Overall roadmap progress will update automatically.`,
    confirmText: 'Yes, Delete Topic',
    onConfirm: () => {
      state.deleteProblemTopic(topic.id);
      modalManager.showToast('Topic deleted', 'info');
      renderRoadmapsView(container);
    }
  });
}

// ==========================================
// 8. CHECKLIST SECTION & ITEM MODALS
// ==========================================
function openAddEditSectionModal(container, roadmapId, sectionToEdit = null) {
  const isEditing = Boolean(sectionToEdit);

  modalManager.openModal({
    title: isEditing ? 'Edit Section Title' : 'Add Roadmap Section',
    bodyHtml: `
      <form id="sectionForm" style="display: flex; flex-direction: column; gap: 1rem;">
        <div class="form-group">
          <label class="form-label" for="sectionTitle">Section / Phase Title <span style="color: var(--accent-rose);">*</span></label>
          <input 
            type="text" 
            class="form-input" 
            id="sectionTitle" 
            placeholder="e.g. Phase 1 — Java Fundamentals, Arrays & Searching" 
            value="${isEditing ? escapeHtml(sectionToEdit.title) : ''}" 
            required 
            autocomplete="off"
          />
        </div>

        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" data-action="cancel">Cancel</button>
          <button type="submit" class="btn btn-primary">${isEditing ? 'Save Changes' : 'Add Section'}</button>
        </div>
      </form>
    `,
    onOpen: (modalBody) => {
      const form = modalBody.querySelector('#sectionForm');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = modalBody.querySelector('#sectionTitle').value.trim();
        if (!title) return;

        if (isEditing) {
          state.updateRoadmapSection(sectionToEdit.id, { title });
          modalManager.showToast('Section updated', 'success');
        } else {
          state.addRoadmapSection({ roadmapId, title });
          modalManager.showToast('Section added', 'success');
        }

        modalManager.closeModal();
        renderRoadmapsView(container);
      });
    }
  });
}

function confirmDeleteSection(container, section) {
  modalManager.confirm({
    title: 'Delete Section',
    message: `Are you sure you want to delete section "${section.title}"? Checklist items belonging to this section will NOT be deleted; they will be moved to General Items.`,
    confirmText: 'Yes, Delete Section',
    onConfirm: () => {
      state.deleteRoadmapSection(section.id);
      modalManager.showToast('Section deleted', 'info');
      renderRoadmapsView(container);
    }
  });
}

function openAddEditItemModal(container, roadmapId, itemToEdit = null) {
  const isEditing = Boolean(itemToEdit);
  const sections = state.roadmapSections
    .filter(s => s.roadmapId === roadmapId)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  modalManager.openModal({
    title: isEditing ? 'Edit Checklist Item' : 'Add Checklist Item',
    bodyHtml: `
      <form id="itemForm" style="display: flex; flex-direction: column; gap: 1rem;">
        <div class="form-group">
          <label class="form-label" for="itemTitle">Item Title <span style="color: var(--accent-rose);">*</span></label>
          <input 
            type="text" 
            class="form-input" 
            id="itemTitle" 
            placeholder="e.g. Introduction to Java, Binary Search, Course 1" 
            value="${isEditing ? escapeHtml(itemToEdit.title) : ''}" 
            required 
            autocomplete="off"
          />
        </div>

        ${sections.length > 0 ? `
          <div class="form-group">
            <label class="form-label" for="itemSectionSelect">Section</label>
            <select class="form-select" id="itemSectionSelect">
              <option value="">(No Section / General)</option>
              ${sections.map(s => `
                <option value="${s.id}" ${isEditing && itemToEdit.sectionId === s.id ? 'selected' : ''}>
                  ${escapeHtml(s.title)}
                </option>
              `).join('')}
            </select>
          </div>
        ` : ''}

        <div class="form-group">
          <label class="form-label" for="itemDesc">Description / Notes (Optional)</label>
          <textarea 
            class="form-textarea" 
            id="itemDesc" 
            placeholder="Key concepts, practice problems, or notes..." 
            rows="2"
          >${isEditing ? escapeHtml(itemToEdit.description || '') : ''}</textarea>
        </div>

        <div class="form-group">
          <label class="form-label" for="itemResourceUrl">Resource URL (Optional)</label>
          <input 
            type="url" 
            class="form-input" 
            id="itemResourceUrl" 
            placeholder="https://youtube.com/..., https://github.com/..." 
            value="${isEditing ? escapeHtml(itemToEdit.resourceUrl || '') : ''}" 
            autocomplete="off"
          />
          <span class="form-hint">Links to tutorials, problem statements, GitHub repos, or documentation.</span>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" data-action="cancel">Cancel</button>
          <button type="submit" class="btn btn-primary">${isEditing ? 'Save Changes' : 'Add Item'}</button>
        </div>
      </form>
    `,
    onOpen: (modalBody) => {
      const form = modalBody.querySelector('#itemForm');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = modalBody.querySelector('#itemTitle').value.trim();
        if (!title) return;

        const secSelect = modalBody.querySelector('#itemSectionSelect');
        const sectionId = secSelect ? secSelect.value || null : null;
        const description = modalBody.querySelector('#itemDesc').value.trim();
        const resourceUrl = modalBody.querySelector('#itemResourceUrl').value.trim();

        if (isEditing) {
          state.updateRoadmapItem(itemToEdit.id, {
            title,
            sectionId,
            description,
            resourceUrl
          });
          modalManager.showToast('Item updated', 'success');
        } else {
          state.addRoadmapItem({
            roadmapId,
            sectionId,
            title,
            description,
            resourceUrl,
            completed: false
          });
          modalManager.showToast('Item added', 'success');
        }

        modalManager.closeModal();
        renderRoadmapsView(container);
      });
    }
  });
}

function openMoveItemSectionModal(container, roadmapId, item) {
  const sections = state.roadmapSections
    .filter(s => s.roadmapId === roadmapId)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  modalManager.openModal({
    title: `Move "${escapeHtml(item.title)}"`,
    bodyHtml: `
      <form id="moveItemForm" style="display: flex; flex-direction: column; gap: 1rem;">
        <div class="form-group">
          <label class="form-label" for="moveTargetSection">Select Target Section</label>
          <select class="form-select" id="moveTargetSection">
            <option value="" ${!item.sectionId ? 'selected' : ''}>(No Section / General)</option>
            ${sections.map(s => `
              <option value="${s.id}" ${item.sectionId === s.id ? 'selected' : ''}>
                ${escapeHtml(s.title)}
              </option>
            `).join('')}
          </select>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" data-action="cancel">Cancel</button>
          <button type="submit" class="btn btn-primary">Move Item</button>
        </div>
      </form>
    `,
    onOpen: (modalBody) => {
      const form = modalBody.querySelector('#moveItemForm');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const targetSec = modalBody.querySelector('#moveTargetSection').value || null;
        state.moveRoadmapItemSection(item.id, targetSec);
        modalManager.closeModal();
        modalManager.showToast('Item moved', 'success');
        renderRoadmapsView(container);
      });
    }
  });
}

function confirmDeleteItem(container, item) {
  modalManager.confirm({
    title: 'Delete Item',
    message: `Are you sure you want to delete "${item.title}"?`,
    confirmText: 'Yes, Delete',
    onConfirm: () => {
      state.deleteRoadmapItem(item.id);
      modalManager.showToast('Item deleted', 'info');
      renderRoadmapsView(container);
    }
  });
}

function openBulkAddModal(container, roadmapId) {
  const sections = state.roadmapSections
    .filter(s => s.roadmapId === roadmapId)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  modalManager.openModal({
    title: 'Bulk Add Checklist Items',
    bodyHtml: `
      <form id="bulkAddForm" class="bulk-add-container">
        <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5;">
          Paste your syllabus or topic list below. Each non-empty line becomes one item. Numbering prefixes like <code>01 →</code>, <code>1.</code>, or <code>1)</code> will automatically be cleaned.
        </p>

        ${sections.length > 0 ? `
          <div class="form-group">
            <label class="form-label" for="bulkTargetSection">Target Section</label>
            <select class="form-select" id="bulkTargetSection">
              <option value="">(No Section / General)</option>
              ${sections.map(s => `<option value="${s.id}">${escapeHtml(s.title)}</option>`).join('')}
            </select>
          </div>
        ` : ''}

        <div class="form-group">
          <label class="form-label" for="bulkTextarea">Items (One per line)</label>
          <textarea 
            class="form-textarea bulk-add-textarea" 
            id="bulkTextarea" 
            placeholder="Introduction to Programming\nFlow of Program\nIntroduction to Java\nFirst Java Program\nConditionals and Loops\nFunctions / Methods\nArrays and ArrayList\nLinear Search\nBinary Search"
          ></textarea>
        </div>

        <div class="bulk-add-counter" id="bulkCounterText">
          0 items ready to add
        </div>

        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" data-action="cancel">Cancel</button>
          <button type="submit" class="btn btn-primary" id="bulkSubmitBtn" disabled>Add 0 Items</button>
        </div>
      </form>
    `,
    onOpen: (modalBody) => {
      const textarea = modalBody.querySelector('#bulkTextarea');
      const counterText = modalBody.querySelector('#bulkCounterText');
      const submitBtn = modalBody.querySelector('#bulkSubmitBtn');
      const form = modalBody.querySelector('#bulkAddForm');

      const countValidLines = (text) => {
        const lines = (text || '').split('\n');
        let count = 0;
        for (const line of lines) {
          const cleaned = state.cleanBulkTitle(line);
          if (cleaned.length > 0) count++;
        }
        return count;
      };

      const updateCounter = () => {
        const count = countValidLines(textarea.value);
        counterText.textContent = `${count} item${count === 1 ? '' : 's'} ready to add`;
        submitBtn.textContent = `Add ${count} Item${count === 1 ? '' : 's'}`;
        submitBtn.disabled = count === 0;
      };

      textarea.addEventListener('input', updateCounter);

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const count = countValidLines(textarea.value);
        if (count === 0) return;

        const secSelect = modalBody.querySelector('#bulkTargetSection');
        const sectionId = secSelect ? secSelect.value || null : null;

        const added = state.bulkAddRoadmapItems(roadmapId, sectionId, textarea.value);
        modalManager.closeModal();
        modalManager.showToast(`Added ${added.length} items to roadmap!`, 'success');
        renderRoadmapsView(container);
      });
    }
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Timetables View Component (Logically separated Academic & Career Timetables)
import { state, CATEGORIES, getCategoryStyle } from '../state.js';
import { DAYS_OF_WEEK, formatTime } from '../utils/dateUtils.js';
import { icons } from '../icons.js';
import { modalManager } from './modal.js';

let activeTimetableType = 'academic'; // 'academic' | 'career'
let activeDayFilter = 'all'; // 'all' | 'Monday' | ... | 'Sunday'

export function renderTimetableView(container) {
  const isAcademic = activeTimetableType === 'academic';
  const slots = isAcademic ? state.academicTimetable : state.careerTimetable;

  const displayDays = activeDayFilter === 'all' ? DAYS_OF_WEEK : [activeDayFilter];

  container.innerHTML = `
    <!-- Header -->
    <div class="timetable-header">
      <div class="timetable-title-area">
        <h2>${isAcademic ? 'Academic Timetable' : 'Career Timetable'}</h2>
        <p>${
          isAcademic
            ? 'Manage your weekly recurring college classes, labs, and faculty schedules.'
            : 'Manage your recurring career focus blocks: DSA, ML, Projects, and Open Source.'
        }</p>
      </div>
      <button class="btn btn-primary" id="addSlotBtn">
        ${icons.plus} Add ${isAcademic ? 'Academic' : 'Career'} Slot
      </button>
    </div>

    <!-- Timetable Switcher: Kept logically separate -->
    <div class="timetable-type-switcher">
      <button class="tt-switch-btn ${isAcademic ? 'active-academic' : ''}" id="switchAcademicBtn">
        ${icons.book} Academic Timetable
      </button>
      <button class="tt-switch-btn ${!isAcademic ? 'active-career' : ''}" id="switchCareerBtn">
        ${icons.briefcase} Career Timetable
      </button>
    </div>

    <!-- Day Selector Tabs (for quick filtering) -->
    <div class="day-selector-tabs">
      <button class="day-tab-btn ${activeDayFilter === 'all' ? 'active' : ''}" data-day="all">Full Week</button>
      ${DAYS_OF_WEEK.map(
        day => `
        <button class="day-tab-btn ${activeDayFilter === day ? 'active' : ''}" data-day="${day}">${day}</button>
      `
      ).join('')}
    </div>

    <!-- Weekly Grid -->
    <div class="weekly-grid">
      ${displayDays
        .map(day => {
          const daySlots = slots
            .filter(s => s.day === day)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));

          return `
          <div class="day-column">
            <div class="day-column-header">
              <span class="day-name">${day}</span>
              <span class="day-slot-count">${daySlots.length} slot${daySlots.length === 1 ? '' : 's'}</span>
            </div>
            <div class="day-column-body">
              ${
                daySlots.length > 0
                  ? daySlots
                      .map(slot => {
                        const style = !isAcademic ? getCategoryStyle(slot.category) : null;
                        return `
                        <div class="slot-card" data-slot-id="${slot.id}">
                          <div class="slot-time">
                            ${icons.clock} ${formatTime(slot.startTime)} &ndash; ${formatTime(slot.endTime)}
                          </div>
                          <div class="slot-subject">
                            ${isAcademic ? slot.subject : slot.activity}
                          </div>

                          <div class="slot-meta">
                            ${
                              isAcademic
                                ? `
                                ${
                                  slot.classroom
                                    ? `<span>${icons.mapPin} ${slot.classroom}</span>`
                                    : ''
                                }
                                ${
                                  slot.faculty
                                    ? `<span>${icons.user} ${slot.faculty}</span>`
                                    : ''
                                }
                              `
                                : `
                                <span class="badge" style="background: ${style.bg}; color: ${style.color}; font-size: 0.7rem; padding: 0.15rem 0.5rem;">
                                  ${slot.category}
                                </span>
                              `
                            }
                          </div>

                          ${
                            slot.notes
                              ? `<div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.35rem;">
                                  ${slot.notes}
                                </div>`
                              : ''
                          }

                          <div class="slot-actions">
                            <button class="btn btn-ghost btn-sm btn-icon-only" data-action="edit-slot" title="Edit Slot">
                              ${icons.edit}
                            </button>
                            <button class="btn btn-ghost btn-sm btn-icon-only" data-action="delete-slot" title="Delete Slot">
                              ${icons.trash}
                            </button>
                          </div>
                        </div>
                      `;
                      })
                      .join('')
                  : `<div class="empty-day-notice">No slots scheduled</div>`
              }
            </div>
          </div>
        `;
        })
        .join('')}
    </div>
  `;

  attachTimetableEvents(container);
}

function attachTimetableEvents(container) {
  // Switch Timetable Type
  const switchAcadBtn = container.querySelector('#switchAcademicBtn');
  const switchCareerBtn = container.querySelector('#switchCareerBtn');

  if (switchAcadBtn) {
    switchAcadBtn.addEventListener('click', () => {
      activeTimetableType = 'academic';
      renderTimetableView(container);
    });
  }

  if (switchCareerBtn) {
    switchCareerBtn.addEventListener('click', () => {
      activeTimetableType = 'career';
      renderTimetableView(container);
    });
  }

  // Day Filter Tabs
  container.querySelectorAll('.day-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeDayFilter = btn.dataset.day;
      renderTimetableView(container);
    });
  });

  // Add Slot
  const addSlotBtn = container.querySelector('#addSlotBtn');
  if (addSlotBtn) {
    addSlotBtn.addEventListener('click', () => {
      if (activeTimetableType === 'academic') {
        openAcademicSlotModal();
      } else {
        openCareerSlotModal();
      }
    });
  }

  // Slot Card Actions
  container.querySelectorAll('.slot-card').forEach(card => {
    const slotId = card.dataset.slotId;
    const isAcad = activeTimetableType === 'academic';
    const slotList = isAcad ? state.academicTimetable : state.careerTimetable;
    const slot = slotList.find(s => s.id === slotId);
    if (!slot) return;

    // Edit Slot
    const editBtn = card.querySelector('[data-action="edit-slot"]');
    if (editBtn) {
      editBtn.addEventListener('click', () => {
        if (isAcad) {
          openAcademicSlotModal(slot);
        } else {
          openCareerSlotModal(slot);
        }
      });
    }

    // Delete Slot
    const deleteBtn = card.querySelector('[data-action="delete-slot"]');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        modalManager.confirm({
          title: `Delete ${isAcad ? 'Academic' : 'Career'} Slot`,
          message: `Are you sure you want to remove "${isAcad ? slot.subject : slot.activity}" from ${slot.day}?`,
          onConfirm: () => {
            if (isAcad) {
              state.deleteAcademicSlot(slotId);
            } else {
              state.deleteCareerSlot(slotId);
            }
            modalManager.showToast('Slot deleted', 'info');
            renderTimetableView(container);
          }
        });
      });
    }
  });
}

// Modal for Academic Timetable Slot
export function openAcademicSlotModal(slot = null) {
  const isEditing = !!slot;
  const initial = slot || {
    day: activeDayFilter !== 'all' ? activeDayFilter : 'Monday',
    startTime: '09:00',
    endTime: '10:00',
    subject: '',
    classroom: '',
    faculty: '',
    notes: ''
  };

  modalManager.openModal({
    title: isEditing ? 'Edit Academic Slot' : 'Add Academic Slot',
    bodyHtml: `
      <form id="academicSlotForm">
        <div class="form-group">
          <label class="form-label" for="acadSubject">Subject / Activity *</label>
          <input type="text" id="acadSubject" name="subject" class="form-input" required placeholder="e.g. Operating Systems" value="${initial.subject}">
        </div>

        <div class="form-group">
          <label class="form-label" for="acadDay">Day of Week *</label>
          <select id="acadDay" name="day" class="form-select" required>
            ${DAYS_OF_WEEK.map(
              day => `<option value="${day}" ${initial.day === day ? 'selected' : ''}>${day}</option>`
            ).join('')}
          </select>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="acadStartTime">Start Time *</label>
            <input type="time" id="acadStartTime" name="startTime" class="form-input" required value="${initial.startTime}">
          </div>

          <div class="form-group">
            <label class="form-label" for="acadEndTime">End Time *</label>
            <input type="time" id="acadEndTime" name="endTime" class="form-input" required value="${initial.endTime}">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="acadClassroom">Classroom / Lab (optional)</label>
            <input type="text" id="acadClassroom" name="classroom" class="form-input" placeholder="e.g. Lecture Hall 2" value="${initial.classroom}">
          </div>

          <div class="form-group">
            <label class="form-label" for="acadFaculty">Faculty / Professor (optional)</label>
            <input type="text" id="acadFaculty" name="faculty" class="form-input" placeholder="e.g. Dr. Sharma" value="${initial.faculty}">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="acadNotes">Notes (optional)</label>
          <textarea id="acadNotes" name="notes" class="form-textarea" placeholder="Chapters covered, required materials...">${initial.notes}</textarea>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" data-action="cancel">Cancel</button>
          <button type="submit" class="btn btn-primary">${isEditing ? 'Save Changes' : 'Add Slot'}</button>
        </div>
      </form>
    `,
    onSubmit: (formData) => {
      if (isEditing) {
        state.updateAcademicSlot(slot.id, formData);
        modalManager.showToast('Academic slot updated', 'success');
      } else {
        state.addAcademicSlot(formData);
        modalManager.showToast('Academic slot added', 'success');
      }
      modalManager.closeModal();
      const container = document.getElementById('view-timetables');
      if (container) renderTimetableView(container);
    }
  });
}

// Modal for Career Timetable Slot
export function openCareerSlotModal(slot = null) {
  const isEditing = !!slot;
  const initial = slot || {
    day: activeDayFilter !== 'all' ? activeDayFilter : 'Monday',
    startTime: '18:00',
    endTime: '19:30',
    activity: '',
    category: 'DSA',
    notes: ''
  };

  const careerCategories = ['DSA', 'ML', 'Python', 'Project', 'Open Source', 'Certification', 'Personal'];

  modalManager.openModal({
    title: isEditing ? 'Edit Career Slot' : 'Add Career Slot',
    bodyHtml: `
      <form id="careerSlotForm">
        <div class="form-group">
          <label class="form-label" for="carActivity">Activity Name *</label>
          <input type="text" id="carActivity" name="activity" class="form-input" required placeholder="e.g. LeetCode Trees & Graphs" value="${initial.activity}">
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="carDay">Day of Week *</label>
            <select id="carDay" name="day" class="form-select" required>
              ${DAYS_OF_WEEK.map(
                day => `<option value="${day}" ${initial.day === day ? 'selected' : ''}>${day}</option>`
              ).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="carCategory">Category *</label>
            <select id="carCategory" name="category" class="form-select" required>
              ${careerCategories.map(
                cat => `<option value="${cat}" ${initial.category === cat ? 'selected' : ''}>${cat}</option>`
              ).join('')}
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="carStartTime">Start Time *</label>
            <input type="time" id="carStartTime" name="startTime" class="form-input" required value="${initial.startTime}">
          </div>

          <div class="form-group">
            <label class="form-label" for="carEndTime">End Time *</label>
            <input type="time" id="carEndTime" name="endTime" class="form-input" required value="${initial.endTime}">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="carNotes">Notes (optional)</label>
          <textarea id="carNotes" name="notes" class="form-textarea" placeholder="Resources, target problem counts, sprint focus...">${initial.notes}</textarea>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" data-action="cancel">Cancel</button>
          <button type="submit" class="btn btn-primary">${isEditing ? 'Save Changes' : 'Add Slot'}</button>
        </div>
      </form>
    `,
    onSubmit: (formData) => {
      if (isEditing) {
        state.updateCareerSlot(slot.id, formData);
        modalManager.showToast('Career slot updated', 'success');
      } else {
        state.addCareerSlot(formData);
        modalManager.showToast('Career slot added', 'success');
      }
      modalManager.closeModal();
      const container = document.getElementById('view-timetables');
      if (container) renderTimetableView(container);
    }
  });
}

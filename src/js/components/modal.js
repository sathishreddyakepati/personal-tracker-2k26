// Accessible Universal Modal & Drawer Manager
import { icons } from '../icons.js';

class ModalManager {
  constructor() {
    this.modalOverlay = null;
    this.modalContent = null;
    this.modalTitle = null;
    this.modalBody = null;
    this.modalCloseBtn = null;
    this.currentSubmitHandler = null;

    // Toast Container
    this.toastContainer = null;

    // Day Detail Drawer
    this.drawerOverlay = null;
    this.drawer = null;
  }

  init() {
    this.modalOverlay = document.getElementById('modalOverlay');
    this.modalTitle = document.getElementById('modalTitle');
    this.modalBody = document.getElementById('modalBody');
    this.modalCloseBtn = document.getElementById('modalCloseBtn');
    this.toastContainer = document.getElementById('toastContainer');
    this.drawerOverlay = document.getElementById('drawerOverlay');

    if (this.modalCloseBtn) {
      this.modalCloseBtn.addEventListener('click', () => this.closeModal());
    }

    if (this.modalOverlay) {
      this.modalOverlay.addEventListener('click', (e) => {
        if (e.target === this.modalOverlay) {
          this.closeModal();
        }
      });
    }

    if (this.drawerOverlay) {
      this.drawerOverlay.addEventListener('click', (e) => {
        if (e.target === this.drawerOverlay) {
          this.closeDrawer();
        }
      });
    }

    // Escape key listener
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.modalOverlay && this.modalOverlay.classList.contains('active')) {
          this.closeModal();
        }
        if (this.drawerOverlay && this.drawerOverlay.classList.contains('active')) {
          this.closeDrawer();
        }
      }
    });
  }

  openModal({ title, bodyHtml, onSubmit, onOpen }) {
    if (!this.modalOverlay) return;
    this.modalTitle.textContent = title || '';
    this.modalBody.innerHTML = bodyHtml || '';
    this.currentSubmitHandler = onSubmit;

    this.modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    const form = this.modalBody.querySelector('form');
    if (form && onSubmit) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        onSubmit(data, form);
      });
    }

    const cancelBtn = this.modalBody.querySelector('[data-action="cancel"]');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.closeModal());
    }

    if (onOpen) {
      onOpen(this.modalBody);
    }
  }

  closeModal() {
    if (!this.modalOverlay) return;
    this.modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
    this.modalBody.innerHTML = '';
    this.currentSubmitHandler = null;
  }

  // Confirm Dialog
  confirm({ title = 'Are you sure?', message = 'This action cannot be undone.', confirmText = 'Delete', onConfirm }) {
    this.openModal({
      title,
      bodyHtml: `
        <div class="confirm-modal">
          <p class="confirm-message">${message}</p>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" data-action="cancel">Cancel</button>
            <button type="button" class="btn btn-danger" id="confirmActionBtn">${confirmText}</button>
          </div>
        </div>
      `,
      onOpen: (container) => {
        const btn = container.querySelector('#confirmActionBtn');
        if (btn) {
          btn.addEventListener('click', () => {
            this.closeModal();
            if (onConfirm) onConfirm();
          });
        }
      }
    });
  }

  // Slide-over Drawer (e.g. for Day inspector)
  openDrawer({ title, contentHtml, onOpen }) {
    if (!this.drawerOverlay) return;
    const titleEl = document.getElementById('drawerTitle');
    const bodyEl = document.getElementById('drawerBody');
    const closeBtn = document.getElementById('drawerCloseBtn');

    if (titleEl) titleEl.textContent = title;
    if (bodyEl) bodyEl.innerHTML = contentHtml;

    if (closeBtn) {
      closeBtn.onclick = () => this.closeDrawer();
    }

    this.drawerOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    if (onOpen && bodyEl) {
      onOpen(bodyEl);
    }
  }

  closeDrawer() {
    if (!this.drawerOverlay) return;
    this.drawerOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Notification Toasts
  showToast(message, type = 'success', duration = 3000) {
    if (!this.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type} animate-slide-in`;

    let iconSvg = icons.checkCircle;
    if (type === 'error') iconSvg = icons.x;
    if (type === 'info') iconSvg = icons.info;

    toast.innerHTML = `
      <span class="toast-icon">${iconSvg}</span>
      <span class="toast-text">${message}</span>
    `;

    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-fadeout');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, duration);
  }
}

export const modalManager = new ModalManager();

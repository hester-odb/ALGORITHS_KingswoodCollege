/**
 * Toast.js
 * Encapsulated Toast Notification Dispatcher.
 */
class Toast {
  static #container = null;

  static #getContainer() {
    if (!this.#container) {
      this.#container = document.createElement('div');
      this.#container.className = 'toast-container';
      document.body.appendChild(this.#container);
    }
    return this.#container;
  }

  static show(message, type = 'success', duration = 3500) {
    const container = this.#getContainer();
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = Icons.get('check');
    if (type === 'warning') icon = Icons.get('clock');
    if (type === 'error') icon = Icons.get('spark');

    toast.innerHTML = `<span>${icon}</span><span>${Formatters.escapeHtml(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  static success(msg) { this.show(msg, 'success'); }
  static warning(msg) { this.show(msg, 'warning'); }
  static error(msg) { this.show(msg, 'error'); }
}

window.Toast = Toast;

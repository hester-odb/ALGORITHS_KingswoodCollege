/**
 * formatters.js
 * Encapsulated date, string, and status formatters
 */
const Formatters = (function () {
  function formatDate(isoString) {
    if (!isoString) return 'N/A';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return isoString;
    }
  }

  function formatTimeAgo(isoString) {
    if (!isoString) return 'Just now';
    try {
      const now = new Date();
      const past = new Date(isoString);
      const diffMs = now - past;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 30) return `${diffDays}d ago`;
      return formatDate(isoString);
    } catch {
      return 'Recently';
    }
  }

  function getStatusBadge(status) {
    if (status === 'Available') {
      return `<span class="badge badge-available"><span class="badge-dot"></span>Available</span>`;
    } else if (status === 'In Use') {
      return `<span class="badge badge-inuse"><span class="badge-dot"></span>In Use</span>`;
    } else {
      return `<span class="badge badge-maintenance"><span class="badge-dot"></span>Maintenance</span>`;
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  return {
    formatDate,
    formatTimeAgo,
    getStatusBadge,
    escapeHtml
  };
})();

window.Formatters = Formatters;

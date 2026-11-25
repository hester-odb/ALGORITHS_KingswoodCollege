/**
 * ActivityLogView.js
 * Encapsulated Activity & Audit Feed Component.
 */
class ActivityLogView {
  #store;
  #container;

  constructor(containerId, store) {
    this.#container = document.getElementById(containerId);
    this.#store = store;

    this.#render();

    this.#store.subscribe((state, changedKey) => {
      if (changedKey === 'activityLogs' || changedKey === 'activeTab') {
        if (state.activeTab === 'activity') {
          this.#render();
        }
      }
    });
  }

  #render() {
    const logs = this.#store.getState().activityLogs || [];

    this.#container.innerHTML = `
      <div class="view-toolbar">
        <div>
          <h2 style="font-size: 1.25rem; font-weight: 700;">Operational Audit Timeline</h2>
          <p class="text-muted" style="font-size: 0.85rem;">Recent supplies checkout, return, and document management activity.</p>
        </div>
        <button class="btn btn-secondary btn-sm" id="refreshAuditBtn">
          ${Icons.get('spark')} Refresh Feed
        </button>
      </div>

      <div class="timeline" id="timelineList">
        ${logs.length === 0 ? `
          <div style="text-align: center; padding: 3rem; background: var(--color-surface); border-radius: var(--radius-lg); border: 1px dashed var(--color-border);">
            <p class="text-muted">No operational activities recorded yet.</p>
          </div>
        ` : logs.map(log => {
          let badgeColor = 'var(--color-primary-subtle)';
          let textColor = 'var(--color-primary-dark)';
          let icon = Icons.get('check');

          if (log.action === 'CHECKOUT') {
            badgeColor = 'var(--color-amber-subtle)';
            textColor = 'var(--color-amber-dark)';
            icon = Icons.get('clock');
          } else if (log.action === 'CREATE') {
            badgeColor = 'var(--color-spark-subtle)';
            textColor = 'var(--color-spark-dark)';
            icon = Icons.get('plus');
          }

          return `
            <div class="timeline-item">
              <div class="timeline-icon" style="background: ${badgeColor}; color: ${textColor};">
                ${icon}
              </div>
              <div class="timeline-content">
                <h4>${Formatters.escapeHtml(log.action)}: ${Formatters.escapeHtml(log.entityName)}</h4>
                <p>
                  <strong>${Formatters.escapeHtml(log.performedBy || 'Staff')}</strong> 
                  ${log.action === 'CHECKOUT' ? `checked out gear to <em>${Formatters.escapeHtml(log.details?.assignedTo || log.performedBy)}</em> (${Formatters.escapeHtml(log.details?.department || 'Operations')})` : ''}
                  ${log.action === 'CHECKIN' ? `checked item back into available inventory (Condition: ${Formatters.escapeHtml(log.details?.condition || 'Good')})` : ''}
                  ${log.action === 'CREATE' ? `registered new ${Formatters.escapeHtml(log.entityType?.toLowerCase() || 'asset')} into the hub` : ''}
                </p>
                <div class="timeline-time">${Formatters.formatTimeAgo(log.createdAt)} • ${Formatters.formatDate(log.createdAt)}</div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    const refreshBtn = this.#container.querySelector('#refreshAuditBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        const freshLogs = LocalStorageAdapter.getActivity();
        this.#store.setActivityLogs(freshLogs);
        Toast.success('Activity feed refreshed');
      });
    }
  }
}

window.ActivityLogView = ActivityLogView;

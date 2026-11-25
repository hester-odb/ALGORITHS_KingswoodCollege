/**
 * QuickStats.js
 * Encapsulated KPI Summary Bar Component.
 */
class QuickStats {
  #store;
  #container;

  constructor(containerId, store) {
    this.#container = document.getElementById(containerId);
    this.#store = store;
    this.#render();

    this.#store.subscribe((state, changedKey) => {
      if (changedKey === 'stats' || changedKey === 'inventoryItems' || changedKey === 'documents') {
        this.#render();
      }
    });
  }

  #render() {
    const { stats } = this.#store.getState();

    this.#container.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-info">
            <div class="stat-label">Total Gear & Tools</div>
            <div class="stat-value">${stats.totalItems}</div>
            <div class="stat-subtext">Classroom, Lab & Computing</div>
          </div>
          <div class="stat-icon-wrapper stat-icon-total">
            ${Icons.get('box')}
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-info">
            <div class="stat-label">Available Now</div>
            <div class="stat-value" style="color: var(--color-primary);">${stats.availableItems}</div>
            <div class="stat-subtext">Ready for immediate checkout</div>
          </div>
          <div class="stat-icon-wrapper stat-icon-available">
            ${Icons.get('check')}
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-info">
            <div class="stat-label">Currently In Use</div>
            <div class="stat-value" style="color: var(--color-amber-dark);">${stats.inUseItems}</div>
            <div class="stat-subtext">In classrooms or workshops</div>
          </div>
          <div class="stat-icon-wrapper stat-icon-inuse">
            ${Icons.get('clock')}
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-info">
            <div class="stat-label">Project Files & Guides</div>
            <div class="stat-value" style="color: var(--color-purple);">${stats.totalDocs}</div>
            <div class="stat-subtext">Organized across 5 team folders</div>
          </div>
          <div class="stat-icon-wrapper stat-icon-docs">
            ${Icons.get('folder')}
          </div>
        </div>
      </div>
    `;
  }
}

window.QuickStats = QuickStats;

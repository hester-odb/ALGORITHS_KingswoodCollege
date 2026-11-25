/**
 * InventoryView.js
 * Encapsulated Supply & Gear Inventory View.
 * Implements visual item cards, real-time search, availability filter pills, and checkout actions.
 */
class InventoryView {
  #store;
  #inventoryService;
  #container;
  #currentSearch = '';

  constructor(containerId, store, inventoryService) {
    this.#container = document.getElementById(containerId);
    this.#store = store;
    this.#inventoryService = inventoryService;

    this.#renderLayout();
    this.#bindEvents();

    this.#store.subscribe((state, changedKey) => {
      if (changedKey === 'inventoryItems' || changedKey === 'inventoryFilter' || changedKey === 'activeTab') {
        if (state.activeTab === 'inventory') {
          this.#renderItems();
        }
      }
    });
  }

  #renderLayout() {
    this.#container.innerHTML = `
      <div class="view-toolbar">
        <div class="search-input-wrapper">
          ${Icons.get('search')}
          <input type="text" class="search-input" id="inventorySearchInput" placeholder="Search gear by name, model, room, serial, or borrower..." />
        </div>

        <div class="filter-group">
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--color-text-muted); margin-right: 0.25rem;">STATUS:</span>
          <button class="filter-pill active" data-status="All">All</button>
          <button class="filter-pill" data-status="Available">Available</button>
          <button class="filter-pill" data-status="In Use">In Use</button>
        </div>

        <button class="btn btn-primary" id="addNewGearBtn">
          ${Icons.get('plus')} Add Equipment
        </button>
      </div>

      <div class="filter-group mb-2" id="categoryFilterBar">
        <span style="font-size: 0.78rem; font-weight: 700; color: var(--color-text-muted); margin-right: 0.25rem;">CATEGORY:</span>
        <button class="filter-pill active" data-category="All">All Categories</button>
        <button class="filter-pill" data-category="Classroom Tools">Classroom Tools</button>
        <button class="filter-pill" data-category="Sensors & Robotics">Sensors & Robotics</button>
        <button class="filter-pill" data-category="Presentation">Presentation</button>
        <button class="filter-pill" data-category="Computing">Computing</button>
        <button class="filter-pill" data-category="Lab Tools">Lab Tools</button>
        <button class="filter-pill" data-category="Audio/Visual">Audio/Visual</button>
      </div>

      <div class="gear-grid" id="gearGridContainer">
        <!-- Rendered items go here -->
      </div>
    `;
  }

  #bindEvents() {
    // Search
    const searchInput = this.#container.querySelector('#inventorySearchInput');
    searchInput.addEventListener('input', (e) => {
      this.#currentSearch = e.target.value;
      this.#applyFilter();
    });

    // Status Filter Pills
    this.#container.querySelectorAll('[data-status]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.#container.querySelectorAll('[data-status]').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.#store.setInventoryFilter({ status: e.target.getAttribute('data-status') });
        this.#applyFilter();
      });
    });

    // Category Filter Pills
    this.#container.querySelectorAll('[data-category]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.#container.querySelectorAll('[data-category]').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.#store.setInventoryFilter({ category: e.target.getAttribute('data-category') });
        this.#applyFilter();
      });
    });

    // Add Gear Button
    this.#container.querySelector('#addNewGearBtn').addEventListener('click', () => {
      window.Modals.openItemModal();
    });

    // Action clicks on item cards
    const grid = this.#container.querySelector('#gearGridContainer');
    grid.addEventListener('click', (e) => {
      const checkoutBtn = e.target.closest('[data-action="checkout"]');
      if (checkoutBtn) {
        const itemId = checkoutBtn.getAttribute('data-id');
        const item = this.#store.getState().inventoryItems.find(i => i.id === itemId);
        if (item) window.Modals.openCheckoutModal(item);
        return;
      }

      const checkinBtn = e.target.closest('[data-action="checkin"]');
      if (checkinBtn) {
        const itemId = checkinBtn.getAttribute('data-id');
        const item = this.#store.getState().inventoryItems.find(i => i.id === itemId);
        if (item) window.Modals.openCheckinModal(item);
        return;
      }
    });
  }

  async #applyFilter() {
    const { inventoryFilter } = this.#store.getState();
    const items = await this.#inventoryService.getAllItems({
      status: inventoryFilter.status,
      category: inventoryFilter.category,
      search: this.#currentSearch
    });
    this.#renderItems(items);
  }

  #renderItems(itemsToRender = null) {
    const grid = this.#container.querySelector('#gearGridContainer');
    const items = itemsToRender || this.#store.getState().inventoryItems;

    if (!items || items.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: var(--color-surface); border-radius: var(--radius-lg); border: 1px dashed var(--color-border);">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">🔍</div>
          <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--color-text-main);">No equipment found</h3>
          <p class="text-muted" style="margin-top: 0.25rem;">Try adjusting your keyword search or category filter pills.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = items.map(item => `
      <div class="gear-card">
        <div class="gear-card-image">
          <img src="${item.imageUrl || 'assets/gear/default-gear.svg'}" 
               alt="${Formatters.escapeHtml(item.name)}" 
               loading="lazy" 
               onerror="this.onerror=null; this.src='assets/gear/default-gear.svg';" />
          <div class="gear-card-badge">
            ${item.getStatusBadgeHtml()}
          </div>
        </div>

        <div class="gear-card-body">
          <div class="gear-category-row">
            <span class="badge badge-category">${Formatters.escapeHtml(item.category)}</span>
            <span class="gear-serial">${Formatters.escapeHtml(item.serialNumber)}</span>
          </div>

          <h3 class="gear-title">${Formatters.escapeHtml(item.name)}</h3>

          <div class="gear-location">
            ${Icons.get('mapPin')}
            <span>${Formatters.escapeHtml(item.location)}</span>
          </div>

          <p class="gear-notes">${Formatters.escapeHtml(item.notes || 'No operational notes attached.')}</p>

          ${item.getBorrowerInfoHtml()}

          <div class="gear-card-footer">
            ${item.isAvailable() ? `
              <button class="btn btn-primary btn-sm w-100" data-action="checkout" data-id="${item.id}">
                ${Icons.get('clock')} Check Out
              </button>
            ` : `
              <button class="btn btn-amber btn-sm w-100" data-action="checkin" data-id="${item.id}">
                ${Icons.get('check')} Return / Check In
              </button>
            `}
          </div>
        </div>
      </div>
    `).join('');
  }
}

window.InventoryView = InventoryView;

/**
 * Navbar.js
 * Encapsulated Header & Navigation Component.
 */
class Navbar {
  #store;
  #container;

  static STAFF_MEMBERS = [
    { name: 'Sarah Chen', role: 'Curriculum & Education Lead', department: 'Education & Curriculum' },
    { name: 'Marcus Brody', role: 'Senior Hardware Engineer', department: 'Hardware Engineering' },
    { name: 'Dr. Elena Vance', role: 'Head of Research & Technology', department: 'R&D' },
    { name: 'Aisha Patel', role: 'Community & Outreach Manager', department: 'Community Outreach' },
    { name: 'Kevin O\'Connor', role: 'Product & UX Designer', department: 'Product Design' }
  ];

  constructor(containerId, store) {
    this.#container = document.getElementById(containerId);
    this.#store = store;
    this.#render();
    this.#bindEvents();

    this.#store.subscribe((state, changedKey) => {
      if (changedKey === 'activeTab' || changedKey === 'currentUser') {
        this.#updateActiveStates(state);
      }
    });
  }

  #render() {
    const state = this.#store.getState();
    this.#container.innerHTML = `
      <div class="hub-nav-inner">
        <a class="brand-wrapper" href="#" id="brandLogoBtn">
          <div class="brand-logo-icon">
            ${Icons.get('spark')}
          </div>
          <div class="brand-text">
            <h1>EcoSpark Hub</h1>
            <span>Internal Operations</span>
          </div>
        </a>

        <div class="nav-tabs" role="tablist">
          <button class="nav-tab-btn ${state.activeTab === 'inventory' ? 'active' : ''}" data-tab="inventory">
            ${Icons.get('box')} Supplies & Gear
          </button>
          <button class="nav-tab-btn ${state.activeTab === 'documents' ? 'active' : ''}" data-tab="documents">
            ${Icons.get('folder')} Document Hub
          </button>
          <button class="nav-tab-btn ${state.activeTab === 'activity' ? 'active' : ''}" data-tab="activity">
            ${Icons.get('activity')} Activity Log
          </button>
        </div>

        <div class="user-menu">
          <button class="btn btn-secondary btn-sm" id="resetDataBtn" title="Sync local offline gear illustrations & reset sample data" style="padding: 0.35rem 0.65rem; font-size: 0.78rem;">
            ${Icons.get('spark')} Sync Assets
          </button>
          <div class="user-selector-wrapper" title="Switch simulated active team member">
            <div class="user-avatar" id="navUserAvatar">SC</div>
            <select class="user-selector-select" id="staffSelector">
              ${Navbar.STAFF_MEMBERS.map(m => `
                <option value="${m.name}" ${m.name === state.currentUser.name ? 'selected' : ''}>
                  ${m.name} (${m.department})
                </option>
              `).join('')}
            </select>
          </div>
        </div>
      </div>
    `;
    this.#updateAvatar(state.currentUser.name);
  }

  #bindEvents() {
    this.#container.addEventListener('click', (e) => {
      const tabBtn = e.target.closest('.nav-tab-btn');
      if (tabBtn) {
        const tab = tabBtn.getAttribute('data-tab');
        this.#store.setActiveTab(tab);
      }

      if (e.target.closest('#brandLogoBtn')) {
        e.preventDefault();
        this.#store.setActiveTab('inventory');
      }
    });

    const selector = this.#container.querySelector('#staffSelector');
    selector.addEventListener('change', (e) => {
      const selected = Navbar.STAFF_MEMBERS.find(m => m.name === e.target.value);
      if (selected) {
        this.#store.setCurrentUser(selected);
        Toast.success(`Switched active staff to ${selected.name}`);
      }
    });

    const resetBtn = this.#container.querySelector('#resetDataBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Sync local offline assets and reload default EcoSpark data?')) {
          LocalStorageAdapter.resetAllData();
          const items = LocalStorageAdapter.getInventory().map(i => new ItemViewModel(i));
          const docs = LocalStorageAdapter.getDocuments().map(d => new DocumentViewModel(d));
          const folders = LocalStorageAdapter.getFolders();
          this.#store.setInventoryData(items);
          this.#store.setDocumentData(docs, folders);
          this.#store.setActivityLogs(LocalStorageAdapter.getActivity());
          Toast.success('Synced local assets & restored default inventory!');
        }
      });
    }
  }

  #updateActiveStates(state) {
    const buttons = this.#container.querySelectorAll('.nav-tab-btn');
    buttons.forEach(btn => {
      if (btn.getAttribute('data-tab') === state.activeTab) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    this.#updateAvatar(state.currentUser.name);
  }

  #updateAvatar(name) {
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const avatar = this.#container.querySelector('#navUserAvatar');
    if (avatar) avatar.textContent = initials;
  }
}

window.Navbar = Navbar;

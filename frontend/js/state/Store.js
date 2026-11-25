/**
 * Store.js
 * Encapsulated Central Observable State Store for EcoSpark Hub.
 */
class Store {
  #state;
  #listeners;

  constructor() {
    this.#state = {
      activeTab: 'inventory', // 'inventory' | 'documents' | 'dashboard' | 'activity'
      currentUser: {
        name: 'Sarah Chen',
        role: 'Curriculum & Education Lead',
        department: 'Education'
      },
      searchQuery: '',
      inventoryFilter: {
        status: 'All',
        category: 'All'
      },
      documentFilter: {
        folderId: 'all',
        category: 'All',
        tag: 'All'
      },
      inventoryItems: [],
      documents: [],
      folders: [],
      activityLogs: [],
      stats: {
        totalItems: 0,
        availableItems: 0,
        inUseItems: 0,
        totalDocs: 0
      }
    };
    this.#listeners = new Set();
  }

  getState() {
    // Return shallow copy to protect state mutability
    return { ...this.#state };
  }

  subscribe(listener) {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  #notify(changedKey) {
    for (const listener of this.#listeners) {
      listener(this.getState(), changedKey);
    }
  }

  setActiveTab(tab) {
    this.#state.activeTab = tab;
    this.#notify('activeTab');
  }

  setCurrentUser(user) {
    this.#state.currentUser = user;
    this.#notify('currentUser');
  }

  setSearchQuery(query) {
    this.#state.searchQuery = query;
    this.#notify('searchQuery');
  }

  setInventoryFilter(filters) {
    this.#state.inventoryFilter = { ...this.#state.inventoryFilter, ...filters };
    this.#notify('inventoryFilter');
  }

  setDocumentFilter(filters) {
    this.#state.documentFilter = { ...this.#state.documentFilter, ...filters };
    this.#notify('documentFilter');
  }

  setInventoryData(items) {
    this.#state.inventoryItems = items;
    this.#updateStats();
    this.#notify('inventoryItems');
  }

  setDocumentData(docs, folders) {
    if (docs) this.#state.documents = docs;
    if (folders) this.#state.folders = folders;
    this.#updateStats();
    this.#notify('documents');
  }

  setActivityLogs(logs) {
    this.#state.activityLogs = logs;
    this.#notify('activityLogs');
  }

  #updateStats() {
    const items = this.#state.inventoryItems;
    const available = items.filter(i => i.isAvailable()).length;
    const inUse = items.filter(i => i.isInUse()).length;
    const docs = this.#state.documents;

    this.#state.stats = {
      totalItems: items.length,
      availableItems: available,
      inUseItems: inUse,
      totalDocs: docs.length
    };
    this.#notify('stats');
  }
}

window.Store = Store;

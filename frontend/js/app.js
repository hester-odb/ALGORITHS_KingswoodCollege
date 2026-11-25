/**
 * app.js
 * EcoSpark Innovations Hub - Application Bootstrapper
 * Orchestrates dependency injection, services, state store, and component mounting.
 */
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Initializing EcoSpark Operations Hub...');

  // 1. Dependency Injection: Initialize Store & Services
  const store = new Store();
  const apiClient = new ApiClient();
  await apiClient.checkHealth();

  const inventoryService = new InventoryService(apiClient);
  const documentService = new DocumentService(apiClient);

  // 2. Initialize Modals
  Modals.init(store, inventoryService, documentService);

  // 3. Mount UI Components
  const navbar = new Navbar('hubNavbarContainer', store);
  const quickStats = new QuickStats('quickStatsContainer', store);
  const inventoryView = new InventoryView('inventoryViewContainer', store, inventoryService);
  const documentExplorer = new DocumentExplorer('documentExplorerContainer', store, documentService);
  const activityLogView = new ActivityLogView('activityViewContainer', store);

  // 4. View Switcher logic based on Active Tab
  const inventorySection = document.getElementById('inventorySection');
  const documentSection = document.getElementById('documentSection');
  const activitySection = document.getElementById('activitySection');

  function switchTab(activeTab) {
    inventorySection.classList.add('d-none');
    documentSection.classList.add('d-none');
    activitySection.classList.add('d-none');

    if (activeTab === 'inventory') {
      inventorySection.classList.remove('d-none');
    } else if (activeTab === 'documents') {
      documentSection.classList.remove('d-none');
    } else if (activeTab === 'activity') {
      activitySection.classList.remove('d-none');
    }
  }

  store.subscribe((state, changedKey) => {
    if (changedKey === 'activeTab') {
      switchTab(state.activeTab);
    }
  });

  // 5. Initial Data Load
  try {
    const [items, docs, folders] = await Promise.all([
      inventoryService.getAllItems(),
      documentService.getAllDocuments(),
      documentService.getAllFolders()
    ]);

    store.setInventoryData(items);
    store.setDocumentData(docs, folders);
    store.setActivityLogs(LocalStorageAdapter.getActivity());

    console.log(`✅ Loaded ${items.length} gear items, ${docs.length} documents, ${folders.length} folders.`);
  } catch (err) {
    console.error('Error during initial load:', err);
    Toast.error('Failed to load initial hub data');
  }

  // Set default view
  switchTab(store.getState().activeTab);
});

/**
 * DocumentExplorer.js
 * Encapsulated Document & Knowledge Hub Component.
 * Implements folder tree navigation, breadcrumbs, tag filtering, search, and document cards.
 */
class DocumentExplorer {
  #store;
  #documentService;
  #container;
  #currentSearch = '';

  constructor(containerId, store, documentService) {
    this.#container = document.getElementById(containerId);
    this.#store = store;
    this.#documentService = documentService;

    this.#renderLayout();
    this.#bindEvents();

    this.#store.subscribe((state, changedKey) => {
      if (changedKey === 'documents' || changedKey === 'folders' || changedKey === 'documentFilter' || changedKey === 'activeTab') {
        if (state.activeTab === 'documents') {
          this.#renderFolderSidebar();
          this.#renderDocuments();
        }
      }
    });
  }

  #renderLayout() {
    this.#container.innerHTML = `
      <div class="view-toolbar">
        <div class="search-input-wrapper">
          ${Icons.get('search')}
          <input type="text" class="search-input" id="docSearchInput" placeholder="Search files, guides, schematics, tags, or authors..." />
        </div>

        <button class="btn btn-primary" id="uploadDocBtn">
          ${Icons.get('plus')} New Document
        </button>
      </div>

      <div class="explorer-container">
        <!-- Sidebar: Folder Hierarchy -->
        <aside class="folder-sidebar">
          <div class="sidebar-title">
            <span>Company Folders</span>
            <span style="font-size: 0.75rem; color: var(--color-primary); cursor: pointer;" id="newFolderTriggerBtn">+ New</span>
          </div>
          <ul class="folder-tree-list" id="folderTreeList">
            <!-- Folders rendered here -->
          </ul>
        </aside>

        <!-- Main Document Area -->
        <main class="document-content">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
            <div id="breadcrumbNav" style="display: flex; align-items: center; gap: 0.5rem; font-weight: 600; font-size: 0.9rem; color: var(--color-text-main);">
              <!-- Breadcrumbs rendered here -->
            </div>

            <div class="filter-group" id="tagFilterBar">
              <!-- Tag filter pills rendered here -->
            </div>
          </div>

          <div class="document-grid" id="documentGridContainer">
            <!-- Document cards rendered here -->
          </div>
        </main>
      </div>
    `;
  }

  #bindEvents() {
    // Search
    const searchInput = this.#container.querySelector('#docSearchInput');
    searchInput.addEventListener('input', (e) => {
      this.#currentSearch = e.target.value;
      this.#applyFilter();
    });

    // Upload Doc Button
    this.#container.querySelector('#uploadDocBtn').addEventListener('click', () => {
      window.Modals.openNewDocModal();
    });

    // New Folder Trigger
    this.#container.querySelector('#newFolderTriggerBtn').addEventListener('click', () => {
      window.Modals.openNewFolderModal();
    });

    // Folder selection
    const folderList = this.#container.querySelector('#folderTreeList');
    folderList.addEventListener('click', (e) => {
      const item = e.target.closest('.folder-tree-item');
      if (item) {
        const folderId = item.getAttribute('data-folder-id');
        this.#store.setDocumentFilter({ folderId });
        this.#applyFilter();
      }
    });

    // Tag filter click
    const tagBar = this.#container.querySelector('#tagFilterBar');
    tagBar.addEventListener('click', (e) => {
      const pill = e.target.closest('.filter-pill');
      if (pill) {
        tagBar.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const tag = pill.getAttribute('data-tag');
        this.#store.setDocumentFilter({ tag });
        this.#applyFilter();
      }
    });

    // Document Card Click (Open Preview)
    const docGrid = this.#container.querySelector('#documentGridContainer');
    docGrid.addEventListener('click', (e) => {
      const docCard = e.target.closest('.doc-card');
      if (docCard) {
        const docId = docCard.getAttribute('data-id');
        const doc = this.#store.getState().documents.find(d => d.id === docId);
        if (doc) window.Modals.openDocPreviewModal(doc);
      }
    });
  }

  async #applyFilter() {
    const { documentFilter } = this.#store.getState();
    const docs = await this.#documentService.getAllDocuments({
      folderId: documentFilter.folderId,
      category: documentFilter.category,
      tag: documentFilter.tag,
      search: this.#currentSearch
    });
    this.#renderDocuments(docs);
  }

  #renderFolderSidebar() {
    const list = this.#container.querySelector('#folderTreeList');
    const { folders, documentFilter } = this.#store.getState();

    list.innerHTML = `
      <li class="folder-tree-item ${documentFilter.folderId === 'all' ? 'active' : ''}" data-folder-id="all">
        <span style="display: flex; align-items: center; gap: 0.5rem;">
          ${Icons.get('folder')} All Documents
        </span>
        <span class="folder-badge-count">${this.#store.getState().documents.length}</span>
      </li>
      ${folders.map(f => `
        <li class="folder-tree-item ${documentFilter.folderId === f.id ? 'active' : ''}" data-folder-id="${f.id}">
          <span style="display: flex; align-items: center; gap: 0.5rem;">
            ${Icons.get('folder')} ${Formatters.escapeHtml(f.name)}
          </span>
          <span class="folder-badge-count">${f.itemCount || 0}</span>
        </li>
      `).join('')}
    `;
  }

  #renderDocuments(docsToRender = null) {
    const grid = this.#container.querySelector('#documentGridContainer');
    const breadcrumb = this.#container.querySelector('#breadcrumbNav');
    const tagBar = this.#container.querySelector('#tagFilterBar');
    const state = this.#store.getState();
    const docs = docsToRender || state.documents;

    // Breadcrumb text
    let activeFolderText = 'All Documents';
    if (state.documentFilter.folderId !== 'all') {
      const found = state.folders.find(f => f.id === state.documentFilter.folderId);
      if (found) activeFolderText = found.name;
    }
    breadcrumb.innerHTML = `
      <span class="text-muted">EcoSpark Files</span>
      <span class="text-muted">/</span>
      <span>${Formatters.escapeHtml(activeFolderText)}</span>
      <span class="badge badge-category" style="margin-left: 0.5rem;">${docs.length} files</span>
    `;

    // Render Tag Bar
    const allTags = new Set();
    state.documents.forEach(d => d.tags.forEach(t => allTags.add(t)));
    tagBar.innerHTML = `
      <button class="filter-pill ${state.documentFilter.tag === 'All' ? 'active' : ''}" data-tag="All">All Tags</button>
      ${Array.from(allTags).slice(0, 5).map(t => `
        <button class="filter-pill ${state.documentFilter.tag === t ? 'active' : ''}" data-tag="${t}">#${t}</button>
      `).join('')}
    `;

    if (!docs || docs.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: var(--color-surface); border-radius: var(--radius-lg); border: 1px dashed var(--color-border);">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">📂</div>
          <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--color-text-main);">No documents in this view</h3>
          <p class="text-muted" style="margin-top: 0.25rem;">Try selecting "All Documents" or adding a new file.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = docs.map(doc => `
      <div class="doc-card" data-id="${doc.id}">
        <div class="doc-card-header">
          ${doc.getTypeIconHtml()}
          <span class="badge badge-category">${Formatters.escapeHtml(doc.category)}</span>
        </div>

        <h3 class="doc-title">${Formatters.escapeHtml(doc.title)}</h3>
        <div class="doc-filename">${Formatters.escapeHtml(doc.filename)}</div>
        <p class="doc-desc">${Formatters.escapeHtml(doc.description || 'No description provided.')}</p>

        <div class="doc-tags-list">
          ${doc.tags.map(t => `<span class="doc-tag">#${Formatters.escapeHtml(t)}</span>`).join('')}
        </div>

        <div class="doc-meta-row">
          <span>By ${Formatters.escapeHtml(doc.author)}</span>
          <span>${doc.fileSize} • v${doc.version}</span>
        </div>
      </div>
    `).join('');
  }
}

window.DocumentExplorer = DocumentExplorer;

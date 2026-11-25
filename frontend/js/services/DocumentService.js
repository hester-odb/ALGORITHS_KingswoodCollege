/**
 * DocumentService.js
 * Encapsulated frontend service for documents, notes, and folders.
 */
class DocumentService {
  #client;

  constructor(apiClient) {
    this.#client = apiClient;
  }

  async getAllFolders() {
    if (this.#client.isOnline) {
      try {
        const res = await this.#client.request('/folders');
        return res.data;
      } catch (err) {
        console.warn('Backend folders failed, falling back to LocalStorage:', err.message);
      }
    }
    return LocalStorageAdapter.getFolders();
  }

  async getAllDocuments({ folderId, category, tag, search } = {}) {
    if (this.#client.isOnline) {
      try {
        const query = new URLSearchParams();
        if (folderId) query.set('folderId', folderId);
        if (category) query.set('category', category);
        if (tag) query.set('tag', tag);
        if (search) query.set('search', search);

        const res = await this.#client.request(`/documents?${query.toString()}`);
        return res.data.map(d => new DocumentViewModel(d));
      } catch (err) {
        console.warn('Backend docs failed, falling back to LocalStorage:', err.message);
      }
    }

    let docs = LocalStorageAdapter.getDocuments();
    if (folderId && folderId !== 'all') {
      docs = docs.filter(d => d.folderId === folderId);
    }
    if (category && category !== 'All') {
      docs = docs.filter(d => d.category.toLowerCase() === category.toLowerCase());
    }
    if (tag && tag !== 'All') {
      const cleanTag = tag.toLowerCase();
      docs = docs.filter(d => d.tags.map(t => t.toLowerCase()).includes(cleanTag));
    }
    if (search && search.trim()) {
      const term = search.trim().toLowerCase();
      docs = docs.filter(d =>
        d.title.toLowerCase().includes(term) ||
        d.filename.toLowerCase().includes(term) ||
        d.description.toLowerCase().includes(term) ||
        d.tags.some(t => t.includes(term))
      );
    }
    return docs.map(d => new DocumentViewModel(d));
  }

  async createDocument(docData, performedBy) {
    if (this.#client.isOnline) {
      try {
        const res = await this.#client.request('/documents', {
          method: 'POST',
          body: JSON.stringify({ ...docData, performedBy })
        });
        return new DocumentViewModel(res.data);
      } catch (err) {
        console.warn('Backend createDoc failed, falling back to LocalStorage:', err.message);
      }
    }

    const docs = LocalStorageAdapter.getDocuments();
    const newDoc = {
      id: 'doc-' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      title: docData.title.trim(),
      filename: docData.filename || `${docData.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.${docData.fileType || 'doc'}`,
      folderId: docData.folderId || 'folder-001',
      category: docData.category || 'General',
      fileType: (docData.fileType || 'doc').toLowerCase(),
      fileSize: docData.fileSize || '18 KB',
      author: performedBy || 'EcoSpark Staff',
      description: docData.description || '',
      tags: Array.isArray(docData.tags) ? docData.tags : [],
      content: docData.content || '',
      version: docData.version || '1.0'
    };

    docs.unshift(newDoc);
    LocalStorageAdapter.saveDocuments(docs);
    LocalStorageAdapter.logActivity('CREATE', 'DOCUMENT', newDoc.id, newDoc.title, performedBy, newDoc);
    return new DocumentViewModel(newDoc);
  }

  async createFolder(folderData, performedBy) {
    if (this.#client.isOnline) {
      try {
        const res = await this.#client.request('/folders', {
          method: 'POST',
          body: JSON.stringify({ ...folderData, performedBy })
        });
        return res.data;
      } catch (err) {
        console.warn('Backend createFolder failed, falling back to LocalStorage:', err.message);
      }
    }

    const folders = LocalStorageAdapter.getFolders();
    const newFolder = {
      id: 'folder-' + Date.now(),
      createdAt: new Date().toISOString(),
      name: folderData.name.trim(),
      parentId: folderData.parentId || null,
      icon: folderData.icon || 'folder',
      color: folderData.color || '#10B981',
      description: folderData.description || '',
      itemCount: 0
    };
    folders.push(newFolder);
    LocalStorageAdapter.saveFolders(folders);
    LocalStorageAdapter.logActivity('CREATE', 'FOLDER', newFolder.id, newFolder.name, performedBy);
    return newFolder;
  }
}

window.DocumentService = DocumentService;

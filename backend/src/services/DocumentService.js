/**
 * DocumentService.js
 * Encapsulated business logic service for folders, project documents, guides, and notes.
 */
const DocumentItem = require('../models/DocumentItem');
const Folder = require('../models/Folder');
const DocumentRepository = require('../repositories/DocumentRepository');
const FolderRepository = require('../repositories/FolderRepository');
const AuditService = require('./AuditService');

class DocumentService {
  #docRepo;
  #folderRepo;
  #auditService;

  constructor(
    docRepo = new DocumentRepository(),
    folderRepo = new FolderRepository(),
    auditService = new AuditService()
  ) {
    this.#docRepo = docRepo;
    this.#folderRepo = folderRepo;
    this.#auditService = auditService;
  }

  getAllFolders() {
    const folders = this.#folderRepo.findAll();
    const docs = this.#docRepo.findAll();

    // Enhance folders with item counts
    return folders.map(f => {
      const json = f.toJSON();
      json.itemCount = docs.filter(d => d.folderId === f.id).length;
      return json;
    });
  }

  createFolder(folderData, performedBy = 'EcoSpark Staff') {
    const folder = new Folder(folderData);
    this.#folderRepo.save(folder);

    this.#auditService.log({
      action: 'CREATE',
      entityType: 'FOLDER',
      entityId: folder.id,
      entityName: folder.name,
      performedBy,
      details: { parentId: folder.parentId }
    });

    const json = folder.toJSON();
    json.itemCount = 0;
    return json;
  }

  getAllDocuments({ folderId, category, tag, search } = {}) {
    let docs = this.#docRepo.findAll();

    if (folderId && folderId !== 'all') {
      docs = docs.filter(d => d.folderId === folderId);
    }

    if (category && category !== 'All') {
      docs = docs.filter(d => d.category.toLowerCase() === category.toLowerCase());
    }

    if (tag && tag !== 'All') {
      const cleanTag = tag.toLowerCase();
      docs = docs.filter(d => d.tags.includes(cleanTag));
    }

    if (search && search.trim()) {
      const term = search.trim().toLowerCase();
      docs = docs.filter(d =>
        d.title.toLowerCase().includes(term) ||
        d.filename.toLowerCase().includes(term) ||
        d.category.toLowerCase().includes(term) ||
        d.description.toLowerCase().includes(term) ||
        d.author.toLowerCase().includes(term) ||
        d.tags.some(t => t.includes(term))
      );
    }

    return docs.map(d => d.toJSON());
  }

  getDocumentById(id) {
    const doc = this.#docRepo.findById(id);
    if (!doc) {
      throw new Error(`Document with ID "${id}" was not found.`);
    }
    return doc.toJSON();
  }

  createDocument(docData, performedBy = 'EcoSpark Staff') {
    const doc = new DocumentItem(docData);
    this.#docRepo.save(doc);

    this.#auditService.log({
      action: 'CREATE',
      entityType: 'DOCUMENT',
      entityId: doc.id,
      entityName: doc.title,
      performedBy,
      details: {
        filename: doc.filename,
        category: doc.category,
        folderId: doc.folderId,
        tags: doc.tags
      }
    });

    return doc.toJSON();
  }

  updateDocument(id, updates, performedBy = 'EcoSpark Staff') {
    const doc = this.#docRepo.findById(id);
    if (!doc) {
      throw new Error(`Document with ID "${id}" was not found.`);
    }

    doc.updateDetails(updates);
    this.#docRepo.save(doc);

    this.#auditService.log({
      action: 'UPDATE',
      entityType: 'DOCUMENT',
      entityId: doc.id,
      entityName: doc.title,
      performedBy,
      details: updates
    });

    return doc.toJSON();
  }

  deleteDocument(id, performedBy = 'EcoSpark Staff') {
    const doc = this.#docRepo.findById(id);
    if (!doc) {
      throw new Error(`Document with ID "${id}" was not found.`);
    }

    const title = doc.title;
    this.#docRepo.deleteById(id);

    this.#auditService.log({
      action: 'DELETE',
      entityType: 'DOCUMENT',
      entityId: id,
      entityName: title,
      performedBy,
      details: {}
    });

    return { success: true, id };
  }

  getAllTags() {
    const docs = this.#docRepo.findAll();
    const tagSet = new Set();
    for (const d of docs) {
      for (const t of d.tags) {
        tagSet.add(t);
      }
    }
    return Array.from(tagSet).sort();
  }
}

module.exports = DocumentService;

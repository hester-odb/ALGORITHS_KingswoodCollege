/**
 * DocumentRepository.js
 * Encapsulated data access methods for documents and files.
 */
const BaseRepository = require('./BaseRepository');
const DocumentItem = require('../models/DocumentItem');

class DocumentRepository extends BaseRepository {
  constructor() {
    super('documents.json', DocumentItem);
  }

  findByFolder(folderId) {
    return this.protectedQuery(doc => doc.folderId === folderId);
  }

  findByCategory(category) {
    return this.protectedQuery(doc => doc.category.toLowerCase() === category.toLowerCase());
  }

  findByTag(tag) {
    const cleanTag = tag.toLowerCase();
    return this.protectedQuery(doc => doc.tags.includes(cleanTag));
  }

  search(keyword) {
    if (!keyword) return this.findAll();
    const term = keyword.toLowerCase();
    return this.protectedQuery(doc => {
      return (
        doc.title.toLowerCase().includes(term) ||
        doc.filename.toLowerCase().includes(term) ||
        doc.category.toLowerCase().includes(term) ||
        doc.description.toLowerCase().includes(term) ||
        doc.author.toLowerCase().includes(term) ||
        doc.tags.some(t => t.includes(term))
      );
    });
  }
}

module.exports = DocumentRepository;

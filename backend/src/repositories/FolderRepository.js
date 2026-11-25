/**
 * FolderRepository.js
 * Encapsulated data access methods for folder hierarchy.
 */
const BaseRepository = require('./BaseRepository');
const Folder = require('../models/Folder');

class FolderRepository extends BaseRepository {
  constructor() {
    super('folders.json', Folder);
  }

  findByParent(parentId) {
    return this.protectedQuery(folder => folder.parentId === parentId);
  }

  getRootFolders() {
    return this.protectedQuery(folder => !folder.parentId || folder.parentId === 'root');
  }
}

module.exports = FolderRepository;

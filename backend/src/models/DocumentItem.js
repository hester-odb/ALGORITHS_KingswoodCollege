/**
 * DocumentItem.js
 * Encapsulated Domain Model for company files, design notes, and guides.
 */
const BaseEntity = require('./BaseEntity');

class DocumentItem extends BaseEntity {
  #title;
  #filename;
  #folderId;
  #category; // 'Guides & Manuals' | 'Hardware Specs' | 'Design Notes' | 'Operations' | 'Curriculum'
  #fileType; // 'pdf' | 'markdown' | 'cad' | 'code' | 'doc' | 'sheet'
  #fileSize; // In bytes or formatted string
  #author;
  #description;
  #tags;
  #content; // Text or preview representation
  #version;

  constructor({
    id = null,
    createdAt = null,
    updatedAt = null,
    title,
    filename,
    folderId = 'root',
    category = 'General',
    fileType = 'doc',
    fileSize = '12 KB',
    author = 'EcoSpark Staff',
    description = '',
    tags = [],
    content = '',
    version = '1.0'
  }) {
    super(id, createdAt, updatedAt);

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      throw new Error('DocumentItem validation error: Title is required.');
    }

    this.#title = title.trim();
    this.#filename = filename ? filename.trim() : `${this.#title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.${fileType}`;
    this.#folderId = folderId || 'root';
    this.#category = category.trim();
    this.#fileType = fileType.toLowerCase();
    this.#fileSize = fileSize;
    this.#author = author.trim();
    this.#description = description ? description.trim() : '';
    this.#tags = Array.isArray(tags) ? Array.from(new Set(tags.map(t => t.trim().toLowerCase()).filter(Boolean))) : [];
    this.#content = content || '';
    this.#version = version;
  }

  // Getters
  get title() { return this.#title; }
  get filename() { return this.#filename; }
  get folderId() { return this.#folderId; }
  get category() { return this.#category; }
  get fileType() { return this.#fileType; }
  get fileSize() { return this.#fileSize; }
  get author() { return this.#author; }
  get description() { return this.#description; }
  get tags() { return [...this.#tags]; }
  get content() { return this.#content; }
  get version() { return this.#version; }

  // Encapsulated operations
  moveToFolder(newFolderId) {
    if (!newFolderId) throw new Error('Target folder ID cannot be empty.');
    this.#folderId = newFolderId;
    this.protectedTouch();
  }

  addTag(tag) {
    if (!tag || typeof tag !== 'string') return;
    const cleanTag = tag.trim().toLowerCase();
    if (cleanTag && !this.#tags.includes(cleanTag)) {
      this.#tags.push(cleanTag);
      this.protectedTouch();
    }
  }

  removeTag(tag) {
    const cleanTag = tag.trim().toLowerCase();
    const index = this.#tags.indexOf(cleanTag);
    if (index !== -1) {
      this.#tags.splice(index, 1);
      this.protectedTouch();
    }
  }

  updateDetails({ title, description, category, tags, content, version }) {
    if (title !== undefined) {
      if (!title || title.trim().length === 0) throw new Error('Document title cannot be empty.');
      this.#title = title.trim();
    }
    if (description !== undefined) this.#description = description.trim();
    if (category !== undefined) this.#category = category.trim();
    if (tags !== undefined && Array.isArray(tags)) {
      this.#tags = Array.from(new Set(tags.map(t => t.trim().toLowerCase()).filter(Boolean)));
    }
    if (content !== undefined) this.#content = content;
    if (version !== undefined) this.#version = version;
    this.protectedTouch();
  }

  toJSON() {
    return {
      ...super.toJSON(),
      title: this.#title,
      filename: this.#filename,
      folderId: this.#folderId,
      category: this.#category,
      fileType: this.#fileType,
      fileSize: this.#fileSize,
      author: this.#author,
      description: this.#description,
      tags: [...this.#tags],
      content: this.#content,
      version: this.#version
    };
  }

  static fromJSON(data) {
    return new DocumentItem(data);
  }
}

module.exports = DocumentItem;

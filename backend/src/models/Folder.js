/**
 * Folder.js
 * Encapsulated Domain Model for folder hierarchy.
 */
const BaseEntity = require('./BaseEntity');

class Folder extends BaseEntity {
  #name;
  #parentId; // null for root folders
  #icon;
  #color;
  #description;

  constructor({
    id = null,
    createdAt = null,
    updatedAt = null,
    name,
    parentId = null,
    icon = 'folder',
    color = '#10B981',
    description = ''
  }) {
    super(id, createdAt, updatedAt);

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new Error('Folder validation error: Name is required.');
    }

    this.#name = name.trim();
    this.#parentId = parentId;
    this.#icon = icon;
    this.#color = color;
    this.#description = description ? description.trim() : '';
  }

  get name() { return this.#name; }
  get parentId() { return this.#parentId; }
  get icon() { return this.#icon; }
  get color() { return this.#color; }
  get description() { return this.#description; }

  updateName(newName) {
    if (!newName || newName.trim().length === 0) throw new Error('Folder name cannot be empty.');
    this.#name = newName.trim();
    this.protectedTouch();
  }

  toJSON() {
    return {
      ...super.toJSON(),
      name: this.#name,
      parentId: this.#parentId,
      icon: this.#icon,
      color: this.#color,
      description: this.#description
    };
  }

  static fromJSON(data) {
    return new Folder(data);
  }
}

module.exports = Folder;

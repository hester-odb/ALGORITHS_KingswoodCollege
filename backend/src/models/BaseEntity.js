/**
 * BaseEntity.js
 * Base Domain Entity providing encapsulation of identity and timestamps.
 */
class BaseEntity {
  #id;
  #createdAt;
  #updatedAt;

  constructor(id = null, createdAt = null, updatedAt = null) {
    this.#id = id || this.#generateUUID();
    this.#createdAt = createdAt || new Date().toISOString();
    this.#updatedAt = updatedAt || this.#createdAt;
  }

  #generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  get id() {
    return this.#id;
  }

  get createdAt() {
    return this.#createdAt;
  }

  get updatedAt() {
    return this.#updatedAt;
  }

  protectedTouch() {
    this.#updatedAt = new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.#id,
      createdAt: this.#createdAt,
      updatedAt: this.#updatedAt
    };
  }
}

module.exports = BaseEntity;

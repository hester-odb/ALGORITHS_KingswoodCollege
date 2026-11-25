/**
 * BaseRepository.js
 * Encapsulated data access layer providing persistent JSON storage,
 * indexing, in-memory caching, and CRUD operations.
 */
const fs = require('fs');
const path = require('path');
const AppConfig = require('../config/AppConfig');

class BaseRepository {
  #filePath;
  #EntityClass;
  #cache;
  #isLoaded;

  constructor(filename, EntityClass) {
    const config = AppConfig.getInstance();
    this.#filePath = path.join(config.dataDir, filename);
    this.#EntityClass = EntityClass;
    this.#cache = new Map();
    this.#isLoaded = false;

    this.#ensureDataDirExists(config.dataDir);
  }

  #ensureDataDirExists(dataDir) {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  #loadSync() {
    if (this.#isLoaded) return;

    if (fs.existsSync(this.#filePath)) {
      try {
        const raw = fs.readFileSync(this.#filePath, 'utf8');
        const jsonList = JSON.parse(raw);
        this.#cache.clear();
        for (const item of jsonList) {
          const entity = this.#EntityClass.fromJSON(item);
          this.#cache.set(entity.id, entity);
        }
      } catch (err) {
        console.error(`[BaseRepository] Error loading ${this.#filePath}:`, err.message);
        this.#cache.clear();
      }
    } else {
      this.#cache.clear();
      this.#saveSync();
    }
    this.#isLoaded = true;
  }

  #saveSync() {
    try {
      const array = Array.from(this.#cache.values()).map(entity => entity.toJSON());
      fs.writeFileSync(this.#filePath, JSON.stringify(array, null, 2), 'utf8');
    } catch (err) {
      console.error(`[BaseRepository] Error saving ${this.#filePath}:`, err.message);
      throw err;
    }
  }

  // Public Query Methods
  findAll() {
    this.#loadSync();
    return Array.from(this.#cache.values());
  }

  findById(id) {
    this.#loadSync();
    return this.#cache.get(id) || null;
  }

  save(entity) {
    this.#loadSync();
    this.#cache.set(entity.id, entity);
    this.#saveSync();
    return entity;
  }

  saveAll(entities) {
    this.#loadSync();
    for (const entity of entities) {
      this.#cache.set(entity.id, entity);
    }
    this.#saveSync();
    return entities;
  }

  deleteById(id) {
    this.#loadSync();
    const existed = this.#cache.delete(id);
    if (existed) {
      this.#saveSync();
    }
    return existed;
  }

  count() {
    this.#loadSync();
    return this.#cache.size;
  }

  // Protected cache access for specialized queries in subclasses
  protectedQuery(predicate) {
    this.#loadSync();
    const results = [];
    for (const entity of this.#cache.values()) {
      if (predicate(entity)) {
        results.push(entity);
      }
    }
    return results;
  }
}

module.exports = BaseRepository;

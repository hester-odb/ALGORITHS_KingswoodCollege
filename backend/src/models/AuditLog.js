/**
 * AuditLog.js
 * Encapsulated immutable Domain Model for tracking checkout, returns, and inventory actions.
 */
const BaseEntity = require('./BaseEntity');

class AuditLog extends BaseEntity {
  #action; // 'CHECKOUT' | 'CHECKIN' | 'CREATE' | 'UPDATE' | 'DELETE'
  #entityType; // 'INVENTORY' | 'DOCUMENT' | 'FOLDER'
  #entityId;
  #entityName;
  #performedBy;
  #details;

  constructor({
    id = null,
    createdAt = null,
    updatedAt = null,
    action,
    entityType,
    entityId,
    entityName,
    performedBy = 'EcoSpark System',
    details = {}
  }) {
    super(id, createdAt, updatedAt);

    this.#action = action;
    this.#entityType = entityType;
    this.#entityId = entityId;
    this.#entityName = entityName;
    this.#performedBy = performedBy;
    this.#details = typeof details === 'object' && details !== null ? Object.freeze({ ...details }) : {};

    // Freeze instance to enforce complete immutability
    Object.freeze(this);
  }

  get action() { return this.#action; }
  get entityType() { return this.#entityType; }
  get entityId() { return this.#entityId; }
  get entityName() { return this.#entityName; }
  get performedBy() { return this.#performedBy; }
  get details() { return { ...this.#details }; }

  toJSON() {
    return {
      ...super.toJSON(),
      action: this.#action,
      entityType: this.#entityType,
      entityId: this.#entityId,
      entityName: this.#entityName,
      performedBy: this.#performedBy,
      details: { ...this.#details }
    };
  }

  static fromJSON(data) {
    return new AuditLog(data);
  }
}

module.exports = AuditLog;

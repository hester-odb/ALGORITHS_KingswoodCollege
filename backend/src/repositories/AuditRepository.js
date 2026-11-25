/**
 * AuditRepository.js
 * Encapsulated data access methods for immutable audit logs.
 */
const BaseRepository = require('./BaseRepository');
const AuditLog = require('../models/AuditLog');

class AuditRepository extends BaseRepository {
  constructor() {
    super('audit_logs.json', AuditLog);
  }

  getRecent(limit = 20) {
    const logs = this.findAll();
    logs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return logs.slice(0, limit);
  }

  findByEntity(entityType, entityId) {
    return this.protectedQuery(log => log.entityType === entityType && log.entityId === entityId);
  }
}

module.exports = AuditRepository;

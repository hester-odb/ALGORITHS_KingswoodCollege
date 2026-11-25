/**
 * AuditService.js
 * Encapsulated service for recording and retrieving operational audit events.
 */
const AuditLog = require('../models/AuditLog');
const AuditRepository = require('../repositories/AuditRepository');

class AuditService {
  #auditRepo;

  constructor(auditRepo = new AuditRepository()) {
    this.#auditRepo = auditRepo;
  }

  log({ action, entityType, entityId, entityName, performedBy, details = {} }) {
    const log = new AuditLog({
      action,
      entityType,
      entityId,
      entityName,
      performedBy,
      details
    });
    this.#auditRepo.save(log);
    return log;
  }

  getRecentActivity(limit = 25) {
    return this.#auditRepo.getRecent(limit).map(l => l.toJSON());
  }
}

module.exports = AuditService;

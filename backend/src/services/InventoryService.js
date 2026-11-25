/**
 * InventoryService.js
 * Encapsulated business logic service for supplies, gear, and checkout workflows.
 */
const InventoryItem = require('../models/InventoryItem');
const InventoryRepository = require('../repositories/InventoryRepository');
const AuditService = require('./AuditService');

class InventoryService {
  #inventoryRepo;
  #auditService;

  constructor(inventoryRepo = new InventoryRepository(), auditService = new AuditService()) {
    this.#inventoryRepo = inventoryRepo;
    this.#auditService = auditService;
  }

  getAllItems({ status, category, search, location } = {}) {
    let items = this.#inventoryRepo.findAll();

    if (search && search.trim()) {
      const term = search.trim().toLowerCase();
      items = items.filter(i =>
        i.name.toLowerCase().includes(term) ||
        i.category.toLowerCase().includes(term) ||
        i.serialNumber.toLowerCase().includes(term) ||
        i.location.toLowerCase().includes(term) ||
        (i.assignedTo && i.assignedTo.toLowerCase().includes(term))
      );
    }

    if (status && status !== 'All') {
      items = items.filter(i => i.status.toLowerCase() === status.toLowerCase());
    }

    if (category && category !== 'All') {
      items = items.filter(i => i.category.toLowerCase() === category.toLowerCase());
    }

    if (location && location !== 'All') {
      items = items.filter(i => i.location.toLowerCase().includes(location.toLowerCase()));
    }

    return items.map(item => item.toJSON());
  }

  getItemById(id) {
    const item = this.#inventoryRepo.findById(id);
    if (!item) {
      throw new Error(`Inventory item with ID "${id}" was not found.`);
    }
    return item.toJSON();
  }

  createItem(itemData, performedBy = 'EcoSpark Staff') {
    const item = new InventoryItem(itemData);
    this.#inventoryRepo.save(item);

    this.#auditService.log({
      action: 'CREATE',
      entityType: 'INVENTORY',
      entityId: item.id,
      entityName: item.name,
      performedBy,
      details: {
        category: item.category,
        serialNumber: item.serialNumber,
        location: item.location,
        status: item.status
      }
    });

    return item.toJSON();
  }

  checkOutItem(id, { staffName, department, expectedReturnDate, notes }, performedBy = null) {
    const item = this.#inventoryRepo.findById(id);
    if (!item) {
      throw new Error(`Inventory item with ID "${id}" was not found.`);
    }

    item.checkOut({ staffName, department, expectedReturnDate, notes });
    this.#inventoryRepo.save(item);

    const user = performedBy || staffName;
    this.#auditService.log({
      action: 'CHECKOUT',
      entityType: 'INVENTORY',
      entityId: item.id,
      entityName: item.name,
      performedBy: user,
      details: {
        assignedTo: staffName,
        department,
        expectedReturnDate,
        notes
      }
    });

    return item.toJSON();
  }

  checkInItem(id, { condition, notes } = {}, performedBy = 'EcoSpark Staff') {
    const item = this.#inventoryRepo.findById(id);
    if (!item) {
      throw new Error(`Inventory item with ID "${id}" was not found.`);
    }

    const previousHolder = item.assignedTo;
    item.checkIn({ condition, notes });
    this.#inventoryRepo.save(item);

    this.#auditService.log({
      action: 'CHECKIN',
      entityType: 'INVENTORY',
      entityId: item.id,
      entityName: item.name,
      performedBy,
      details: {
        returnedFrom: previousHolder,
        condition: item.condition,
        notes
      }
    });

    return item.toJSON();
  }

  updateItem(id, updates, performedBy = 'EcoSpark Staff') {
    const item = this.#inventoryRepo.findById(id);
    if (!item) {
      throw new Error(`Inventory item with ID "${id}" was not found.`);
    }

    item.updateDetails(updates);
    this.#inventoryRepo.save(item);

    this.#auditService.log({
      action: 'UPDATE',
      entityType: 'INVENTORY',
      entityId: item.id,
      entityName: item.name,
      performedBy,
      details: updates
    });

    return item.toJSON();
  }

  deleteItem(id, performedBy = 'EcoSpark Staff') {
    const item = this.#inventoryRepo.findById(id);
    if (!item) {
      throw new Error(`Inventory item with ID "${id}" was not found.`);
    }

    const itemName = item.name;
    this.#inventoryRepo.deleteById(id);

    this.#auditService.log({
      action: 'DELETE',
      entityType: 'INVENTORY',
      entityId: id,
      entityName: itemName,
      performedBy,
      details: {}
    });

    return { success: true, id };
  }

  getStats() {
    const all = this.#inventoryRepo.findAll();
    const available = all.filter(i => i.isAvailable()).length;
    const inUse = all.filter(i => i.isInUse()).length;
    const maintenance = all.filter(i => i.status === InventoryItem.STATUS_MAINTENANCE).length;

    // Categories breakdown
    const categories = {};
    for (const item of all) {
      categories[item.category] = (categories[item.category] || 0) + 1;
    }

    return {
      total: all.length,
      available,
      inUse,
      maintenance,
      categories
    };
  }
}

module.exports = InventoryService;

/**
 * InventoryRepository.js
 * Encapsulated data access methods for equipment & supplies.
 */
const BaseRepository = require('./BaseRepository');
const InventoryItem = require('../models/InventoryItem');

class InventoryRepository extends BaseRepository {
  constructor() {
    super('inventory.json', InventoryItem);
  }

  findByStatus(status) {
    return this.protectedQuery(item => item.status.toLowerCase() === status.toLowerCase());
  }

  findByCategory(category) {
    return this.protectedQuery(item => item.category.toLowerCase() === category.toLowerCase());
  }

  findByLocation(location) {
    return this.protectedQuery(item => item.location.toLowerCase().includes(location.toLowerCase()));
  }

  search(keyword) {
    if (!keyword) return this.findAll();
    const term = keyword.toLowerCase();
    return this.protectedQuery(item => {
      return (
        item.name.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term) ||
        item.serialNumber.toLowerCase().includes(term) ||
        item.location.toLowerCase().includes(term) ||
        (item.assignedTo && item.assignedTo.toLowerCase().includes(term))
      );
    });
  }
}

module.exports = InventoryRepository;

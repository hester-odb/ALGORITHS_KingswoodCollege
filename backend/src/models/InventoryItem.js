/**
 * InventoryItem.js
 * Encapsulated Domain Model for supplies and gear.
 * Enforces business logic invariants regarding availability and checkout states.
 */
const BaseEntity = require('./BaseEntity');

class InventoryItem extends BaseEntity {
  #name;
  #category;
  #serialNumber;
  #location;
  #status; // 'Available' | 'In Use' | 'Maintenance'
  #assignedTo; // null or Staff Name
  #assignedDepartment; // null or Department
  #checkoutDate; // ISO string or null
  #expectedReturnDate; // ISO string or null
  #condition; // 'Excellent' | 'Good' | 'Fair' | 'Needs Attention'
  #notes;
  #imageUrl;

  static STATUS_AVAILABLE = 'Available';
  static STATUS_IN_USE = 'In Use';
  static STATUS_MAINTENANCE = 'Maintenance';

  constructor({
    id = null,
    createdAt = null,
    updatedAt = null,
    name,
    category = 'General',
    serialNumber = '',
    location = 'Main Office',
    status = InventoryItem.STATUS_AVAILABLE,
    assignedTo = null,
    assignedDepartment = null,
    checkoutDate = null,
    expectedReturnDate = null,
    condition = 'Good',
    notes = '',
    imageUrl = ''
  }) {
    super(id, createdAt, updatedAt);

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new Error('InventoryItem validation error: Item name is required.');
    }

    this.#name = name.trim();
    this.#category = category.trim();
    this.#serialNumber = serialNumber ? serialNumber.trim() : `ES-${Math.floor(1000 + Math.random() * 9000)}`;
    this.#location = location.trim();
    this.#status = [InventoryItem.STATUS_AVAILABLE, InventoryItem.STATUS_IN_USE, InventoryItem.STATUS_MAINTENANCE].includes(status)
      ? status
      : InventoryItem.STATUS_AVAILABLE;
    this.#assignedTo = assignedTo;
    this.#assignedDepartment = assignedDepartment;
    this.#checkoutDate = checkoutDate;
    this.#expectedReturnDate = expectedReturnDate;
    this.#condition = condition;
    this.#notes = notes ? notes.trim() : '';
    this.#imageUrl = imageUrl || 'assets/gear/default-gear.svg';
  }

  // Getters - Read-only external access
  get name() { return this.#name; }
  get category() { return this.#category; }
  get serialNumber() { return this.#serialNumber; }
  get location() { return this.#location; }
  get status() { return this.#status; }
  get assignedTo() { return this.#assignedTo; }
  get assignedDepartment() { return this.#assignedDepartment; }
  get checkoutDate() { return this.#checkoutDate; }
  get expectedReturnDate() { return this.#expectedReturnDate; }
  get condition() { return this.#condition; }
  get notes() { return this.#notes; }
  get imageUrl() { return this.#imageUrl; }

  // State Inquiry Invariants
  isAvailable() {
    return this.#status === InventoryItem.STATUS_AVAILABLE;
  }

  isInUse() {
    return this.#status === InventoryItem.STATUS_IN_USE;
  }

  // Encapsulated Business Transitions
  checkOut({ staffName, department = 'General', expectedReturnDate = null, notes = '' }) {
    if (!this.isAvailable()) {
      throw new Error(`Cannot check out "${this.#name}": Item is currently "${this.#status}" (held by ${this.#assignedTo || 'another process'}).`);
    }

    if (!staffName || typeof staffName !== 'string' || staffName.trim().length === 0) {
      throw new Error('Cannot check out item: Staff member name is required.');
    }

    this.#status = InventoryItem.STATUS_IN_USE;
    this.#assignedTo = staffName.trim();
    this.#assignedDepartment = department ? department.trim() : 'Operations';
    this.#checkoutDate = new Date().toISOString();
    this.#expectedReturnDate = expectedReturnDate || null;
    if (notes && notes.trim()) {
      this.#notes = notes.trim();
    }
    this.protectedTouch();
  }

  checkIn({ condition = null, notes = '' } = {}) {
    if (this.isAvailable()) {
      throw new Error(`Cannot check in "${this.#name}": Item is already marked as Available.`);
    }

    const previousHolder = this.#assignedTo;
    this.#status = InventoryItem.STATUS_AVAILABLE;
    this.#assignedTo = null;
    this.#assignedDepartment = null;
    this.#checkoutDate = null;
    this.#expectedReturnDate = null;

    if (condition) {
      this.#condition = condition;
    }
    if (notes && notes.trim()) {
      this.#notes = notes.trim();
    }
    this.protectedTouch();

    return previousHolder;
  }

  updateDetails({ name, category, serialNumber, location, condition, notes, imageUrl }) {
    if (name !== undefined) {
      if (!name || name.trim().length === 0) throw new Error('Item name cannot be empty.');
      this.#name = name.trim();
    }
    if (category !== undefined) this.#category = category.trim();
    if (serialNumber !== undefined) this.#serialNumber = serialNumber.trim();
    if (location !== undefined) this.#location = location.trim();
    if (condition !== undefined) this.#condition = condition;
    if (notes !== undefined) this.#notes = notes.trim();
    if (imageUrl !== undefined) this.#imageUrl = imageUrl;
    this.protectedTouch();
  }

  setMaintenance(inMaintenance, notes = '') {
    if (inMaintenance) {
      this.#status = InventoryItem.STATUS_MAINTENANCE;
      this.#assignedTo = null;
    } else {
      this.#status = InventoryItem.STATUS_AVAILABLE;
    }
    if (notes) this.#notes = notes;
    this.protectedTouch();
  }

  toJSON() {
    return {
      ...super.toJSON(),
      name: this.#name,
      category: this.#category,
      serialNumber: this.#serialNumber,
      location: this.#location,
      status: this.#status,
      assignedTo: this.#assignedTo,
      assignedDepartment: this.#assignedDepartment,
      checkoutDate: this.#checkoutDate,
      expectedReturnDate: this.#expectedReturnDate,
      condition: this.#condition,
      notes: this.#notes,
      imageUrl: this.#imageUrl
    };
  }

  static fromJSON(data) {
    return new InventoryItem(data);
  }
}

module.exports = InventoryItem;

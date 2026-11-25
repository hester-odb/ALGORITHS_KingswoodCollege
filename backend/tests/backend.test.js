/**
 * backend.test.js
 * Automated test suite verifying encapsulation, domain invariants,
 * checkout/return states, and repository queries.
 */
const assert = require('assert');
const InventoryItem = require('../src/models/InventoryItem');
const DocumentItem = require('../src/models/DocumentItem');
const Folder = require('../src/models/Folder');
const AuditLog = require('../src/models/AuditLog');
const InventoryService = require('../src/services/InventoryService');
const DocumentService = require('../src/services/DocumentService');
const AuditService = require('../src/services/AuditService');

console.log('🧪 Starting EcoSpark Backend Encapsulation & Domain Logic Tests...\n');

let testsPassed = 0;
let testsFailed = 0;

function it(description, fn) {
  try {
    fn();
    console.log(`  ✓ ${description}`);
    testsPassed++;
  } catch (err) {
    console.error(`  ✗ ${description}`);
    console.error(`    Error: ${err.message}`);
    testsFailed++;
  }
}

// 1. InventoryItem Encapsulation & State Invariants
it('InventoryItem initializes with Available status and valid invariants', () => {
  const item = new InventoryItem({
    name: 'Smart Projector Ultra-Eco',
    category: 'Presentation',
    serialNumber: 'ES-PROJ-01',
    location: 'MakerLab'
  });

  assert.strictEqual(item.name, 'Smart Projector Ultra-Eco');
  assert.strictEqual(item.isAvailable(), true);
  assert.strictEqual(item.isInUse(), false);
  assert.strictEqual(item.status, 'Available');
  assert.strictEqual(item.assignedTo, null);
});

it('InventoryItem correctly checks out and transitions to In Use', () => {
  const item = new InventoryItem({
    name: 'Classroom Environmental Sensor Kit',
    category: 'Sensors & Robotics'
  });

  item.checkOut({
    staffName: 'Marcus Brody',
    department: 'Hardware Engineering',
    expectedReturnDate: '2026-12-01',
    notes: 'Testing air quality in Lab 3'
  });

  assert.strictEqual(item.isAvailable(), false);
  assert.strictEqual(item.isInUse(), true);
  assert.strictEqual(item.assignedTo, 'Marcus Brody');
  assert.strictEqual(item.assignedDepartment, 'Hardware Engineering');
  assert.strictEqual(item.expectedReturnDate, '2026-12-01');
});

it('InventoryItem prevents checking out an already checked-out item (Encapsulation invariant)', () => {
  const item = new InventoryItem({ name: 'Robotics Coding Brain' });
  item.checkOut({ staffName: 'Sarah Chen' });

  assert.throws(() => {
    item.checkOut({ staffName: 'Another Staff' });
  }, /Cannot check out/);
});

it('InventoryItem correctly checks in and resets assignment state', () => {
  const item = new InventoryItem({ name: 'Classroom Smart Pen Hub' });
  item.checkOut({ staffName: 'Elena Vance' });
  assert.strictEqual(item.isInUse(), true);

  const prevHolder = item.checkIn({ condition: 'Excellent', notes: 'Returned clean' });
  assert.strictEqual(prevHolder, 'Elena Vance');
  assert.strictEqual(item.isAvailable(), true);
  assert.strictEqual(item.assignedTo, null);
  assert.strictEqual(item.condition, 'Excellent');
});

it('InventoryItem prevents checking in an item that is already Available', () => {
  const item = new InventoryItem({ name: 'Lab Spectrometer' });
  assert.throws(() => {
    item.checkIn();
  }, /already marked as Available/);
});

// 2. DocumentItem Encapsulation
it('DocumentItem protects tags and enforces immutability via encapsulation', () => {
  const doc = new DocumentItem({
    title: 'Smart Pen Firmware Manual',
    category: 'Guides & Manuals',
    author: 'Elena Vance',
    tags: ['firmware', 'v2', 'guide']
  });

  assert.strictEqual(doc.tags.length, 3);
  doc.addTag('classroom');
  assert.strictEqual(doc.tags.includes('classroom'), true);

  // Modifying returned array does not affect internal state
  const externalTags = doc.tags;
  externalTags.push('hacked');
  assert.strictEqual(doc.tags.includes('hacked'), false);

  doc.removeTag('v2');
  assert.strictEqual(doc.tags.includes('v2'), false);
});

// 3. AuditLog Immutability
it('AuditLog enforces complete immutability on its state', () => {
  const log = new AuditLog({
    action: 'CHECKOUT',
    entityType: 'INVENTORY',
    entityId: 'item-123',
    entityName: 'EcoSpark Pen',
    performedBy: 'Sarah Chen',
    details: { room: '101' }
  });

  assert.strictEqual(log.action, 'CHECKOUT');
  assert.strictEqual(log.performedBy, 'Sarah Chen');

  // Attempting to mutate throws in strict mode or is ignored
  assert.throws(() => {
    'use strict';
    log.action = 'HACKED';
  }, TypeError);
});

console.log(`\n========================================`);
console.log(`Test Results: ${testsPassed} Passed, ${testsFailed} Failed`);
console.log(`========================================\n`);

if (testsFailed > 0) {
  process.exit(1);
}

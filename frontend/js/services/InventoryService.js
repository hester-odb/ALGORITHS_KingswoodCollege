/**
 * InventoryService.js
 * Encapsulated frontend service for supplies, equipment, and checkouts.
 */
class InventoryService {
  #client;

  constructor(apiClient) {
    this.#client = apiClient;
  }

  async getAllItems({ status, category, search } = {}) {
    if (this.#client.isOnline) {
      try {
        const query = new URLSearchParams();
        if (status) query.set('status', status);
        if (category) query.set('category', category);
        if (search) query.set('search', search);

        const res = await this.#client.request(`/inventory?${query.toString()}`);
        return res.data.map(i => new ItemViewModel(i));
      } catch (err) {
        console.warn('Backend call failed, falling back to LocalStorage:', err.message);
      }
    }

    // Fallback LocalStorage
    let items = LocalStorageAdapter.getInventory();
    if (status && status !== 'All') {
      items = items.filter(i => i.status.toLowerCase() === status.toLowerCase());
    }
    if (category && category !== 'All') {
      items = items.filter(i => i.category.toLowerCase() === category.toLowerCase());
    }
    if (search && search.trim()) {
      const term = search.trim().toLowerCase();
      items = items.filter(i =>
        i.name.toLowerCase().includes(term) ||
        i.serialNumber.toLowerCase().includes(term) ||
        i.location.toLowerCase().includes(term) ||
        (i.assignedTo && i.assignedTo.toLowerCase().includes(term))
      );
    }
    return items.map(i => new ItemViewModel(i));
  }

  async checkOutItem(id, checkoutData, performedBy) {
    if (this.#client.isOnline) {
      try {
        const res = await this.#client.request(`/inventory/${id}/checkout`, {
          method: 'POST',
          body: JSON.stringify({ ...checkoutData, performedBy })
        });
        return new ItemViewModel(res.data);
      } catch (err) {
        console.warn('Backend checkout failed, falling back to LocalStorage:', err.message);
      }
    }

    // LocalStorage mutation
    const items = LocalStorageAdapter.getInventory();
    const item = items.find(i => i.id === id);
    if (!item) throw new Error('Item not found');
    if (item.status !== 'Available') throw new Error(`Item is already "${item.status}"`);

    item.status = 'In Use';
    item.assignedTo = checkoutData.staffName.trim();
    item.assignedDepartment = checkoutData.department || 'Operations';
    item.checkoutDate = new Date().toISOString();
    item.expectedReturnDate = checkoutData.expectedReturnDate || null;
    item.updatedAt = new Date().toISOString();
    if (checkoutData.notes) item.notes = checkoutData.notes.trim();

    LocalStorageAdapter.saveInventory(items);
    LocalStorageAdapter.logActivity(
      'CHECKOUT',
      'INVENTORY',
      item.id,
      item.name,
      performedBy || checkoutData.staffName,
      checkoutData
    );

    return new ItemViewModel(item);
  }

  async checkInItem(id, checkinData, performedBy) {
    if (this.#client.isOnline) {
      try {
        const res = await this.#client.request(`/inventory/${id}/checkin`, {
          method: 'POST',
          body: JSON.stringify({ ...checkinData, performedBy })
        });
        return new ItemViewModel(res.data);
      } catch (err) {
        console.warn('Backend checkin failed, falling back to LocalStorage:', err.message);
      }
    }

    // LocalStorage mutation
    const items = LocalStorageAdapter.getInventory();
    const item = items.find(i => i.id === id);
    if (!item) throw new Error('Item not found');
    if (item.status === 'Available') throw new Error('Item is already Available');

    const prevHolder = item.assignedTo;
    item.status = 'Available';
    item.assignedTo = null;
    item.assignedDepartment = null;
    item.checkoutDate = null;
    item.expectedReturnDate = null;
    item.updatedAt = new Date().toISOString();
    if (checkinData.condition) item.condition = checkinData.condition;
    if (checkinData.notes) item.notes = checkinData.notes.trim();

    LocalStorageAdapter.saveInventory(items);
    LocalStorageAdapter.logActivity(
      'CHECKIN',
      'INVENTORY',
      item.id,
      item.name,
      performedBy || 'Staff',
      { returnedFrom: prevHolder, ...checkinData }
    );

    return new ItemViewModel(item);
  }

  async createItem(itemData, performedBy) {
    if (this.#client.isOnline) {
      try {
        const res = await this.#client.request('/inventory', {
          method: 'POST',
          body: JSON.stringify({ ...itemData, performedBy })
        });
        return new ItemViewModel(res.data);
      } catch (err) {
        console.warn('Backend createItem failed, falling back to LocalStorage:', err.message);
      }
    }

    const items = LocalStorageAdapter.getInventory();
    const newItem = {
      id: 'item-' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      name: itemData.name.trim(),
      category: itemData.category || 'General',
      serialNumber: itemData.serialNumber || `ES-${Math.floor(1000 + Math.random() * 9000)}`,
      location: itemData.location || 'Main Office',
      status: 'Available',
      assignedTo: null,
      assignedDepartment: null,
      checkoutDate: null,
      expectedReturnDate: null,
      condition: itemData.condition || 'Excellent',
      notes: itemData.notes || '',
      imageUrl: itemData.imageUrl || 'assets/gear/default-gear.svg'
    };

    items.unshift(newItem);
    LocalStorageAdapter.saveInventory(items);
    LocalStorageAdapter.logActivity('CREATE', 'INVENTORY', newItem.id, newItem.name, performedBy, newItem);
    return new ItemViewModel(newItem);
  }
}

window.InventoryService = InventoryService;

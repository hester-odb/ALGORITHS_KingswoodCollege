/**
 * InventoryController.js
 * Request handler encapsulating HTTP requests for supplies and equipment.
 */
const Middleware = require('../routes/Middleware');

class InventoryController {
  #inventoryService;

  constructor(inventoryService) {
    this.#inventoryService = inventoryService;
  }

  async getAll(req, res, { query }) {
    try {
      const items = this.#inventoryService.getAllItems({
        status: query.status,
        category: query.category,
        location: query.location,
        search: query.search
      });
      Middleware.sendJson(res, 200, { success: true, count: items.length, data: items });
    } catch (err) {
      Middleware.sendError(res, 500, err.message);
    }
  }

  async getById(req, res, { params }) {
    try {
      const item = this.#inventoryService.getItemById(params.id);
      Middleware.sendJson(res, 200, { success: true, data: item });
    } catch (err) {
      Middleware.sendError(res, 404, err.message);
    }
  }

  async create(req, res) {
    try {
      const body = await Middleware.parseJsonBody(req);
      const created = this.#inventoryService.createItem(body, body.performedBy || 'EcoSpark Staff');
      Middleware.sendJson(res, 201, { success: true, data: created });
    } catch (err) {
      Middleware.sendError(res, 400, err.message);
    }
  }

  async checkOut(req, res, { params }) {
    try {
      const body = await Middleware.parseJsonBody(req);
      const updated = this.#inventoryService.checkOutItem(
        params.id,
        {
          staffName: body.staffName,
          department: body.department,
          expectedReturnDate: body.expectedReturnDate,
          notes: body.notes
        },
        body.performedBy || body.staffName
      );
      Middleware.sendJson(res, 200, { success: true, message: 'Equipment checked out successfully', data: updated });
    } catch (err) {
      Middleware.sendError(res, 400, err.message);
    }
  }

  async checkIn(req, res, { params }) {
    try {
      const body = await Middleware.parseJsonBody(req);
      const updated = this.#inventoryService.checkInItem(
        params.id,
        {
          condition: body.condition,
          notes: body.notes
        },
        body.performedBy || 'EcoSpark Staff'
      );
      Middleware.sendJson(res, 200, { success: true, message: 'Equipment checked in successfully', data: updated });
    } catch (err) {
      Middleware.sendError(res, 400, err.message);
    }
  }

  async update(req, res, { params }) {
    try {
      const body = await Middleware.parseJsonBody(req);
      const updated = this.#inventoryService.updateItem(params.id, body, body.performedBy || 'EcoSpark Staff');
      Middleware.sendJson(res, 200, { success: true, data: updated });
    } catch (err) {
      Middleware.sendError(res, 400, err.message);
    }
  }

  async delete(req, res, { params }) {
    try {
      const result = this.#inventoryService.deleteItem(params.id);
      Middleware.sendJson(res, 200, { success: true, message: 'Item removed from inventory', data: result });
    } catch (err) {
      Middleware.sendError(res, 404, err.message);
    }
  }
}

module.exports = InventoryController;

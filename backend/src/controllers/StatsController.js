/**
 * StatsController.js
 * Request handler encapsulating dashboard stats and audit activity.
 */
const Middleware = require('../routes/Middleware');

class StatsController {
  #inventoryService;
  #docService;
  #auditService;

  constructor(inventoryService, docService, auditService) {
    this.#inventoryService = inventoryService;
    this.#docService = docService;
    this.#auditService = auditService;
  }

  async getDashboardStats(req, res) {
    try {
      const invStats = this.#inventoryService.getStats();
      const allDocs = this.#docService.getAllDocuments();
      const allFolders = this.#docService.getAllFolders();

      const stats = {
        inventory: invStats,
        documents: {
          totalDocuments: allDocs.length,
          totalFolders: allFolders.length
        },
        timestamp: new Date().toISOString()
      };

      Middleware.sendJson(res, 200, { success: true, data: stats });
    } catch (err) {
      Middleware.sendError(res, 500, err.message);
    }
  }

  async getActivityFeed(req, res, { query }) {
    try {
      const limit = parseInt(query.limit, 10) || 25;
      const logs = this.#auditService.getRecentActivity(limit);
      Middleware.sendJson(res, 200, { success: true, count: logs.length, data: logs });
    } catch (err) {
      Middleware.sendError(res, 500, err.message);
    }
  }
}

module.exports = StatsController;

/**
 * api/index.js
 * Vercel Serverless Function entry point for EcoSpark Hub API.
 * Delegates incoming serverless requests to the encapsulated backend controllers and router.
 */
const AppConfig = require('../backend/src/config/AppConfig');
const Router = require('../backend/src/routes/Router');
const Middleware = require('../backend/src/routes/Middleware');

// Repositories
const InventoryRepository = require('../backend/src/repositories/InventoryRepository');
const DocumentRepository = require('../backend/src/repositories/DocumentRepository');
const FolderRepository = require('../backend/src/repositories/FolderRepository');
const AuditRepository = require('../backend/src/repositories/AuditRepository');

// Services
const AuditService = require('../backend/src/services/AuditService');
const InventoryService = require('../backend/src/services/InventoryService');
const DocumentService = require('../backend/src/services/DocumentService');

// Controllers
const InventoryController = require('../backend/src/controllers/InventoryController');
const DocumentController = require('../backend/src/controllers/DocumentController');
const StatsController = require('../backend/src/controllers/StatsController');

// Singleton router setup for warm serverless invocations
let routerInstance = null;

function getRouter() {
  if (routerInstance) return routerInstance;

  const router = new Router();
  const auditRepo = new AuditRepository();
  const inventoryRepo = new InventoryRepository();
  const documentRepo = new DocumentRepository();
  const folderRepo = new FolderRepository();

  const auditService = new AuditService(auditRepo);
  const inventoryService = new InventoryService(inventoryRepo, auditService);
  const docService = new DocumentService(documentRepo, folderRepo, auditService);

  const inventoryController = new InventoryController(inventoryService);
  const docController = new DocumentController(docService);
  const statsController = new StatsController(inventoryService, docService, auditService);

  // Health
  router.get('/api/health', (req, res) => {
    Middleware.sendJson(res, 200, {
      status: 'UP',
      service: 'EcoSpark Hub API (Vercel Serverless)',
      timestamp: new Date().toISOString()
    });
  });

  // Supplies & Gear Inventory Endpoints
  router.get('/api/inventory', (req, res, ctx) => inventoryController.getAll(req, res, ctx));
  router.get('/api/inventory/:id', (req, res, ctx) => inventoryController.getById(req, res, ctx));
  router.post('/api/inventory', (req, res, ctx) => inventoryController.create(req, res, ctx));
  router.put('/api/inventory/:id', (req, res, ctx) => inventoryController.update(req, res, ctx));
  router.delete('/api/inventory/:id', (req, res, ctx) => inventoryController.delete(req, res, ctx));
  router.post('/api/inventory/:id/checkout', (req, res, ctx) => inventoryController.checkOut(req, res, ctx));
  router.post('/api/inventory/:id/checkin', (req, res, ctx) => inventoryController.checkIn(req, res, ctx));

  // Documents & Folders Endpoints
  router.get('/api/documents', (req, res, ctx) => docController.getAllDocs(req, res, ctx));
  router.get('/api/documents/:id', (req, res, ctx) => docController.getDocById(req, res, ctx));
  router.post('/api/documents', (req, res, ctx) => docController.createDoc(req, res, ctx));
  router.put('/api/documents/:id', (req, res, ctx) => docController.updateDoc(req, res, ctx));
  router.delete('/api/documents/:id', (req, res, ctx) => docController.deleteDoc(req, res, ctx));

  router.get('/api/folders', (req, res, ctx) => docController.getAllFolders(req, res, ctx));
  router.post('/api/folders', (req, res, ctx) => docController.createFolder(req, res, ctx));
  router.get('/api/tags', (req, res, ctx) => docController.getAllTags(req, res, ctx));

  // Dashboard Stats & Activity Feed
  router.get('/api/stats', (req, res, ctx) => statsController.getDashboardStats(req, res, ctx));
  router.get('/api/activity', (req, res, ctx) => statsController.getActivityFeed(req, res, ctx));

  routerInstance = router;
  return routerInstance;
}

module.exports = async (req, res) => {
  // CORS
  const handled = Middleware.handleCors(req, res, '*');
  if (handled) return;

  const router = getRouter();
  const match = router.match(req.method, req.url);

  if (match) {
    await match.handler(req, res, {
      params: match.params,
      query: match.query,
      pathname: match.pathname
    });
  } else {
    Middleware.sendError(res, 404, `Endpoint ${req.method} ${req.url} was not found on EcoSpark API.`);
  }
};

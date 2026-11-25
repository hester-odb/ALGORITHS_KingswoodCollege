/**
 * server.js
 * EcoSpark Innovations Internal Hub - Backend Server
 * 
 * Production-ready, zero-dependency native Node.js HTTP server.
 * Implements strict encapsulation, layered routing, and RESTful API endpoints.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const AppConfig = require('./src/config/AppConfig');
const Router = require('./src/routes/Router');
const Middleware = require('./src/routes/Middleware');

// Repositories
const InventoryRepository = require('./src/repositories/InventoryRepository');
const DocumentRepository = require('./src/repositories/DocumentRepository');
const FolderRepository = require('./src/repositories/FolderRepository');
const AuditRepository = require('./src/repositories/AuditRepository');

// Services
const AuditService = require('./src/services/AuditService');
const InventoryService = require('./src/services/InventoryService');
const DocumentService = require('./src/services/DocumentService');

// Controllers
const InventoryController = require('./src/controllers/InventoryController');
const DocumentController = require('./src/controllers/DocumentController');
const StatsController = require('./src/controllers/StatsController');

class Server {
  #config;
  #server;
  #router;

  constructor() {
    this.#config = AppConfig.getInstance();
    this.#router = new Router();
    this.#setupRoutes();
    this.#server = http.createServer((req, res) => this.#handleRequest(req, res));
  }

  #setupRoutes() {
    // Instantiate Layered Architecture with Dependency Injection
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

    // Health check & API root
    this.#router.get('/api/health', (req, res) => {
      Middleware.sendJson(res, 200, {
        status: 'UP',
        service: 'EcoSpark Hub API',
        timestamp: new Date().toISOString()
      });
    });

    // Supplies & Gear Inventory Endpoints
    this.#router.get('/api/inventory', (req, res, ctx) => inventoryController.getAll(req, res, ctx));
    this.#router.get('/api/inventory/:id', (req, res, ctx) => inventoryController.getById(req, res, ctx));
    this.#router.post('/api/inventory', (req, res, ctx) => inventoryController.create(req, res, ctx));
    this.#router.put('/api/inventory/:id', (req, res, ctx) => inventoryController.update(req, res, ctx));
    this.#router.delete('/api/inventory/:id', (req, res, ctx) => inventoryController.delete(req, res, ctx));
    this.#router.post('/api/inventory/:id/checkout', (req, res, ctx) => inventoryController.checkOut(req, res, ctx));
    this.#router.post('/api/inventory/:id/checkin', (req, res, ctx) => inventoryController.checkIn(req, res, ctx));

    // Documents & Folders Endpoints
    this.#router.get('/api/documents', (req, res, ctx) => docController.getAllDocs(req, res, ctx));
    this.#router.get('/api/documents/:id', (req, res, ctx) => docController.getDocById(req, res, ctx));
    this.#router.post('/api/documents', (req, res, ctx) => docController.createDoc(req, res, ctx));
    this.#router.put('/api/documents/:id', (req, res, ctx) => docController.updateDoc(req, res, ctx));
    this.#router.delete('/api/documents/:id', (req, res, ctx) => docController.deleteDoc(req, res, ctx));

    this.#router.get('/api/folders', (req, res, ctx) => docController.getAllFolders(req, res, ctx));
    this.#router.post('/api/folders', (req, res, ctx) => docController.createFolder(req, res, ctx));
    this.#router.get('/api/tags', (req, res, ctx) => docController.getAllTags(req, res, ctx));

    // Dashboard Stats & Activity Feed
    this.#router.get('/api/stats', (req, res, ctx) => statsController.getDashboardStats(req, res, ctx));
    this.#router.get('/api/activity', (req, res, ctx) => statsController.getActivityFeed(req, res, ctx));
  }

  #handleRequest(req, res) {
    // 1. CORS Preflight & Headers
    const handled = Middleware.handleCors(req, res, this.#config.corsOrigin);
    if (handled) return;

    // 2. Route Matching
    const match = this.#router.match(req.method, req.url);
    if (match) {
      match.handler(req, res, {
        params: match.params,
        query: match.query,
        pathname: match.pathname
      });
      return;
    }

    // 3. Serve Frontend Static Assets & Web App (if requesting non-API route)
    if (req.method === 'GET' && !req.url.startsWith('/api')) {
      const frontendDir = path.resolve(__dirname, '..', 'frontend');
      const urlPath = req.url.split('?')[0];
      const filePath = urlPath === '/' ? path.join(frontendDir, 'index.html') : path.join(frontendDir, urlPath);

      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes = {
          '.html': 'text/html; charset=utf-8',
          '.css': 'text/css; charset=utf-8',
          '.js': 'application/javascript; charset=utf-8',
          '.svg': 'image/svg+xml',
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.json': 'application/json',
          '.ico': 'image/x-icon'
        };

        res.writeHead(200, {
          'Content-Type': mimeTypes[ext] || 'application/octet-stream',
          'Access-Control-Allow-Origin': '*'
        });
        fs.createReadStream(filePath).pipe(res);
        return;
      }
    }

    Middleware.sendError(res, 404, `Endpoint ${req.method} ${req.url} was not found on EcoSpark API.`);
  }

  start(port = null) {
    const listenPort = port || this.#config.port;
    const host = this.#config.host;

    this.#server.listen(listenPort, host, () => {
      console.log(`=======================================================`);
      console.log(`⚡ EcoSpark Innovations Hub - Backend API Online!`);
      console.log(`⚡ Listening at: http://${host}:${listenPort}/api/health`);
      console.log(`⚡ Inventory API: http://${host}:${listenPort}/api/inventory`);
      console.log(`⚡ Documents API: http://${host}:${listenPort}/api/documents`);
      console.log(`=======================================================`);
    });
    return this.#server;
  }

  stop() {
    return new Promise(resolve => this.#server.close(resolve));
  }
}

// Auto-run if executed directly
if (require.main === module) {
  const server = new Server();
  server.start();
}

module.exports = Server;

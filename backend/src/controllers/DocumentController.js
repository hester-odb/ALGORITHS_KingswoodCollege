/**
 * DocumentController.js
 * Request handler encapsulating HTTP requests for files, guides, and folders.
 */
const Middleware = require('../routes/Middleware');

class DocumentController {
  #docService;

  constructor(docService) {
    this.#docService = docService;
  }

  async getAllDocs(req, res, { query }) {
    try {
      const docs = this.#docService.getAllDocuments({
        folderId: query.folderId,
        category: query.category,
        tag: query.tag,
        search: query.search
      });
      Middleware.sendJson(res, 200, { success: true, count: docs.length, data: docs });
    } catch (err) {
      Middleware.sendError(res, 500, err.message);
    }
  }

  async getDocById(req, res, { params }) {
    try {
      const doc = this.#docService.getDocumentById(params.id);
      Middleware.sendJson(res, 200, { success: true, data: doc });
    } catch (err) {
      Middleware.sendError(res, 404, err.message);
    }
  }

  async createDoc(req, res) {
    try {
      const body = await Middleware.parseJsonBody(req);
      const created = this.#docService.createDocument(body, body.performedBy || 'EcoSpark Staff');
      Middleware.sendJson(res, 201, { success: true, data: created });
    } catch (err) {
      Middleware.sendError(res, 400, err.message);
    }
  }

  async updateDoc(req, res, { params }) {
    try {
      const body = await Middleware.parseJsonBody(req);
      const updated = this.#docService.updateDocument(params.id, body, body.performedBy || 'EcoSpark Staff');
      Middleware.sendJson(res, 200, { success: true, data: updated });
    } catch (err) {
      Middleware.sendError(res, 400, err.message);
    }
  }

  async deleteDoc(req, res, { params }) {
    try {
      const result = this.#docService.deleteDocument(params.id);
      Middleware.sendJson(res, 200, { success: true, message: 'Document deleted successfully', data: result });
    } catch (err) {
      Middleware.sendError(res, 404, err.message);
    }
  }

  async getAllFolders(req, res) {
    try {
      const folders = this.#docService.getAllFolders();
      Middleware.sendJson(res, 200, { success: true, count: folders.length, data: folders });
    } catch (err) {
      Middleware.sendError(res, 500, err.message);
    }
  }

  async createFolder(req, res) {
    try {
      const body = await Middleware.parseJsonBody(req);
      const created = this.#docService.createFolder(body, body.performedBy || 'EcoSpark Staff');
      Middleware.sendJson(res, 201, { success: true, data: created });
    } catch (err) {
      Middleware.sendError(res, 400, err.message);
    }
  }

  async getAllTags(req, res) {
    try {
      const tags = this.#docService.getAllTags();
      Middleware.sendJson(res, 200, { success: true, data: tags });
    } catch (err) {
      Middleware.sendError(res, 500, err.message);
    }
  }
}

module.exports = DocumentController;

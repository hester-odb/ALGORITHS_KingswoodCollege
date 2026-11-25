/**
 * Middleware.js
 * Encapsulated HTTP request processing, CORS headers, JSON parser, and error response formatting.
 */
class Middleware {
  static handleCors(req, res, corsOrigin = '*') {
    res.setHeader('Access-Control-Allow-Origin', corsOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Max-Age', '86400');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return true; // handled
    }
    return false;
  }

  static parseJsonBody(req) {
    if (req.body !== undefined) {
      if (typeof req.body === 'string') {
        try {
          return Promise.resolve(req.body.trim() ? JSON.parse(req.body) : {});
        } catch (err) {
          return Promise.reject(new Error(`Invalid JSON format: ${err.message}`));
        }
      }
      return Promise.resolve(req.body || {});
    }

    return new Promise((resolve, reject) => {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
        // Limit body size to 5MB
        if (body.length > 5 * 1024 * 1024) {
          reject(new Error('Request payload too large'));
        }
      });

      req.on('end', () => {
        if (!body || body.trim() === '') {
          return resolve({});
        }
        try {
          const parsed = JSON.parse(body);
          resolve(parsed);
        } catch (err) {
          reject(new Error(`Invalid JSON format: ${err.message}`));
        }
      });

      req.on('error', err => reject(err));
    });
  }

  static sendJson(res, statusCode, data) {
    res.writeHead(statusCode, {
      'Content-Type': 'application/json; charset=utf-8'
    });
    res.end(JSON.stringify(data));
  }

  static sendError(res, statusCode, message, details = null) {
    res.writeHead(statusCode, {
      'Content-Type': 'application/json; charset=utf-8'
    });
    res.end(JSON.stringify({
      error: true,
      statusCode,
      message,
      details,
      timestamp: new Date().toISOString()
    }));
  }
}

module.exports = Middleware;

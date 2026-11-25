/**
 * Router.js
 * Encapsulated REST URL Router with support for parameterized paths (e.g. /api/inventory/:id).
 */
const url = require('url');

class Router {
  #routes = [];

  register(method, pattern, handler) {
    // Convert pattern like "/api/inventory/:id/checkout" into regex
    const paramNames = [];
    const regexPattern = pattern.replace(/:([a-zA-Z0-9_]+)/g, (_, paramName) => {
      paramNames.push(paramName);
      return '([^/]+)';
    });

    const regex = new RegExp(`^${regexPattern}$`);
    this.#routes.push({
      method: method.toUpperCase(),
      pattern,
      regex,
      paramNames,
      handler
    });
  }

  get(pattern, handler) { this.register('GET', pattern, handler); }
  post(pattern, handler) { this.register('POST', pattern, handler); }
  put(pattern, handler) { this.register('PUT', pattern, handler); }
  delete(pattern, handler) { this.register('DELETE', pattern, handler); }

  match(reqMethod, reqUrl) {
    const parsedUrl = url.parse(reqUrl, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;

    for (const route of this.#routes) {
      if (route.method !== reqMethod.toUpperCase()) continue;

      const match = pathname.match(route.regex);
      if (match) {
        const params = {};
        route.paramNames.forEach((name, index) => {
          params[name] = decodeURIComponent(match[index + 1]);
        });

        return {
          handler: route.handler,
          params,
          query,
          pathname
        };
      }
    }
    return null;
  }
}

module.exports = Router;

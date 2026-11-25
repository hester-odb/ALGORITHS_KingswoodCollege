/**
 * AppConfig.js
 * Encapsulated application configuration singleton.
 */
const path = require('path');

class AppConfig {
  static #instance = null;
  #port;
  #host;
  #dataDir;
  #corsOrigin;

  constructor() {
    if (AppConfig.#instance) {
      return AppConfig.#instance;
    }

    this.#port = parseInt(process.env.PORT, 10) || 5000;
    this.#host = process.env.HOST || '127.0.0.1';
    this.#dataDir = path.resolve(__dirname, '..', 'data');
    this.#corsOrigin = process.env.CORS_ORIGIN || '*';

    AppConfig.#instance = Object.freeze(this);
  }

  static getInstance() {
    if (!AppConfig.#instance) {
      new AppConfig();
    }
    return AppConfig.#instance;
  }

  get port() {
    return this.#port;
  }

  get host() {
    return this.#host;
  }

  get dataDir() {
    return this.#dataDir;
  }

  get corsOrigin() {
    return this.#corsOrigin;
  }
}

module.exports = AppConfig;

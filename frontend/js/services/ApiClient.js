/**
 * ApiClient.js
 * Encapsulated HTTP communication client with automatic offline/standalone fallback.
 */
class ApiClient {
  #baseUrl;
  #isOnlineBackend;

  constructor() {
    this.#baseUrl =
      window.ECOSPARK_API_URL ||
        (window.location.protocol === 'files') ? 'http://localhost:5000/api' : '/api'; z
    this.#isOnlineBackend = false;
  }

  async checkHealth() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);

      const res = await fetch(`${this.#baseUrl}/health`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        this.#isOnlineBackend = true;
        console.log('⚡ Connected to EcoSpark Live Backend API!');
        return true;
      }
    } catch {
      this.#isOnlineBackend = false;
      console.log('🌱 EcoSpark Hub running in Resilient Client/LocalStorage Mode.');
    }
    return false;
  }

  get isOnline() {
    return this.#isOnlineBackend;
  }

  async request(endpoint, options = {}) {
    if (!this.#isOnlineBackend) {
      throw new Error('BACKEND_OFFLINE');
    }

    const url = `${this.#baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    const response = await fetch(url, {
      ...options,
      headers
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'API request failed');
    }
    return json;
  }
}

window.ApiClient = ApiClient;

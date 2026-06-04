// Matrix-FX API Connector Bridge

const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : '/api'; // Dynamic baseline fallback for cloud deployment environments

const MatrixAPI = {
  // Global token helper initialization
  getToken: () => localStorage.getItem('matrix_fx_auth_token'),
  setToken: (token) => localStorage.setItem('matrix_fx_auth_token', token),
  clearToken: () => localStorage.removeItem('matrix_fx_auth_token'),

  // Secure API Header configurations generator
  getHeaders: () => {
    const headers = { 'Content-Type': 'application/json' };
    const token = MatrixAPI.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },

  // Auth Operations Handlers
  auth: {
    register: async (username, email, password) => {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      return response.json();
    },
    login: async (email, password) => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      return response.json();
    }
  },

  // Active Position Tracking Ledger Requests
  trades: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/trades`, {
        method: 'GET',
        headers: MatrixAPI.getHeaders()
      });
      return response.json();
    },
    create: async (tradeData) => {
      const response = await fetch(`${API_BASE_URL}/trades`, {
        method: 'POST',
        headers: MatrixAPI.getHeaders(),
        body: JSON.stringify(tradeData)
      });
      return response.json();
    },
    close: async (tradeId, exitPrice) => {
      const response = await fetch(`${API_BASE_URL}/trades/${tradeId}`, {
        method: 'DELETE',
        headers: MatrixAPI.getHeaders(),
        body: JSON.stringify({ exitPrice })
      });
      return response.json();
    }
  },

  // Real-Time Analytics & Signals Request Handler
  market: {
    getRates: async () => {
      const response = await fetch(`${API_BASE_URL}/market/rates`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      return response.json();
    },
    analyzePair: async (pair) => {
      const response = await fetch(`${API_BASE_URL}/market/analyze`, {
        method: 'POST',
        headers: MatrixAPI.getHeaders(),
        body: JSON.stringify({ pair })
      });
      return response.json();
    }
  }
};

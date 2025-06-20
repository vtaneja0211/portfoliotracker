import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface StockTransaction {
  symbol: string;
  shares: number;
  price: number;
  holding_type: 'stock' | 'cash';
  purchase_date?: string;
}

export const portfolioApi = {
  addStock: async (transaction: StockTransaction) => {
    const response = await api.post('/portfolio/add', transaction);
    return response.data;
  },

  removeStock: async (transaction: StockTransaction) => {
    const response = await api.post('/portfolio/remove', transaction);
    return response.data;
  },

  getPortfolioSummary: async () => {
    const response = await api.get('/portfolio/summary');
    return response.data;
  },

  getPerformanceMetrics: async () => {
    const response = await api.get('/performance/metrics');
    return response.data;
  },

  getPortfolioInsights: async () => {
    const response = await api.get('/performance/insights');
    return response.data;
  },
}; 
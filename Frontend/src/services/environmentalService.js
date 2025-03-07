// src/services/environmentalService.js
import axios from 'axios';

// Base URL for API
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Add request interceptor for authentication
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Environmental monitoring API service
const environmentalService = {
  // Get current readings from all sensors
  getCurrentReadings: async () => {
    try {
      const response = await apiClient.get('/readings/current');
      return response.data;
    } catch (error) {
      console.error('Error fetching current readings:', error);
      throw error;
    }
  },

  // Get historical data with filters
  getHistoricalData: async (params) => {
    try {
      const response = await apiClient.get('/readings/historical', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching historical data:', error);
      throw error;
    }
  },

  // Get readings for a specific time range
  getReadingsByTimeRange: async (timeRange) => {
    const now = new Date();
    let startTime;
    
    switch(timeRange) {
      case '1h':
        startTime = new Date(now.getTime() - (60 * 60 * 1000));
        break;
      case '6h':
        startTime = new Date(now.getTime() - (6 * 60 * 60 * 1000));
        break;
      case '24h':
        startTime = new Date(now.getTime() - (24 * 60 * 60 * 1000));
        break;
      default:
        startTime = new Date(now.getTime() - (60 * 60 * 1000)); // Default to 1 hour
    }
    
    try {
      const response = await apiClient.get('/readings/range', {
        params: {
          start_time: startTime.toISOString(),
          end_time: now.toISOString()
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching readings by time range:', error);
      throw error;
    }
  },

  // Get alert configuration
  getAlertConfig: async () => {
    try {
      const response = await apiClient.get('/alerts/config');
      return response.data;
    } catch (error) {
      console.error('Error fetching alert configuration:', error);
      throw error;
    }
  },

  // Update alert configuration
  updateAlertConfig: async (config) => {
    try {
      const response = await apiClient.put('/alerts/config', config);
      return response.data;
    } catch (error) {
      console.error('Error updating alert configuration:', error);
      throw error;
    }
  },

  // Get recent alerts
  getRecentAlerts: async (limit = 10) => {
    try {
      const response = await apiClient.get('/alerts/recent', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching recent alerts:', error);
      throw error;
    }
  },

  // Get system status
  getSystemStatus: async () => {
    try {
      const response = await apiClient.get('/system/status');
      return response.data;
    } catch (error) {
      console.error('Error fetching system status:', error);
      throw error;
    }
  }
};

export default environmentalService;
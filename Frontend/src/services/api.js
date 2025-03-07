// frontend/src/services/api.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const fetchAirQualityData = async (city) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/air-quality`, {
      params: { city }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching air quality data:', error);
    throw error;
  }
};

export const fetchWeatherData = async (location) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/weather`, {
      params: { location }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};

export const fetchAlerts = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/alerts`);
    return response.data;
  } catch (error) {
    console.error('Error fetching alerts:', error);
    throw error;
  }
};
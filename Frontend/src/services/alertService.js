// src/services/alertService.js
import { API_BASE_URL } from '../utils/constants';

export const fetchAlertConfigurations = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/alerts/configurations`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching alert configurations:', error);
    throw error;
  }
};

export const saveAlertConfiguration = async (configData) => {
  try {
    const method = configData.id ? 'PUT' : 'POST';
    const url = configData.id 
      ? `${API_BASE_URL}/api/alerts/configurations/${configData.id}` 
      : `${API_BASE_URL}/api/alerts/configurations`;
      
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(configData),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error saving alert configuration:', error);
    throw error;
  }
};

export const deleteAlertConfiguration = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/alerts/configurations/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting alert configuration:', error);
    throw error;
  }
};

export const testAlertConfiguration = async (configData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/alerts/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(configData),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error testing alert configuration:', error);
    throw error;
  }
};
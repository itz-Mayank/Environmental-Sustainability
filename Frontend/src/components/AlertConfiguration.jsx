// src/components/AlertConfiguration.jsx
import React, { useEffect, useState } from 'react';
import { deleteAlertConfiguration, fetchAlertConfigurations, saveAlertConfiguration } from '../services/alertService';

const AlertConfiguration = () => {
  const [alertConfigs, setAlertConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form state
  const [newConfig, setNewConfig] = useState({
    parameter: 'temperature',
    condition: 'above',
    threshold: 30,
    severity: 'warning',
    notificationChannel: 'email',
    enabled: true
  });
  
  // Available parameters for monitoring
  const parameters = [
    { id: 'temperature', label: 'Temperature (°C)' },
    { id: 'humidity', label: 'Humidity (%)' },
    { id: 'co2', label: 'CO2 (ppm)' },
    { id: 'tvoc', label: 'TVOC (ppb)' },
    { id: 'pm25', label: 'PM2.5 (μg/m³)' }
  ];
  
  const conditions = [
    { id: 'above', label: 'Above' },
    { id: 'below', label: 'Below' },
    { id: 'equal', label: 'Equal to' }
  ];
  
  const severityLevels = [
    { id: 'info', label: 'Information' },
    { id: 'warning', label: 'Warning' },
    { id: 'critical', label: 'Critical' }
  ];
  
  const notificationChannels = [
    { id: 'email', label: 'Email' },
    { id: 'sms', label: 'SMS' },
    { id: 'push', label: 'Push Notification' },
    { id: 'webhook', label: 'Webhook' }
  ];
  
  useEffect(() => {
    loadAlertConfigurations();
  }, []);
  
  const loadAlertConfigurations = async () => {
    try {
      setLoading(true);
      const data = await fetchAlertConfigurations();
      setAlertConfigs(data);
      setError(null);
    } catch (err) {
      setError('Failed to load alert configurations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewConfig({
      ...newConfig,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Convert threshold to number
      const configToSave = {
        ...newConfig,
        threshold: parseFloat(newConfig.threshold)
      };
      
      await saveAlertConfiguration(configToSave);
      await loadAlertConfigurations();
      
      // Reset form
      setNewConfig({
        parameter: 'temperature',
        condition: 'above',
        threshold: 30,
        severity: 'warning',
        notificationChannel: 'email',
        enabled: true
      });
      
    } catch (err) {
      setError('Failed to save alert configuration');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this alert configuration?')) {
      try {
        setLoading(true);
        await deleteAlertConfiguration(id);
        await loadAlertConfigurations();
      } catch (err) {
        setError('Failed to delete alert configuration');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };
  
  // Helper to get label from ID
  const getLabelById = (array, id) => {
    const item = array.find(item => item.id === id);
    return item ? item.label : id;
  };
  
  return (
    <div className="alert-configuration-container">
      <h2>Alert Configuration</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="alert-form-container">
        <h3>Create New Alert</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="parameter">Parameter</label>
            <select 
              id="parameter" 
              name="parameter" 
              value={newConfig.parameter} 
              onChange={handleInputChange}
              required
            >
              {parameters.map(param => (
                <option key={param.id} value={param.id}>{param.label}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="condition">Condition</label>
            <select 
              id="condition" 
              name="condition" 
              value={newConfig.condition} 
              onChange={handleInputChange}
              required
            >
              {conditions.map(cond => (
                <option key={cond.id} value={cond.id}>{cond.label}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="threshold">Threshold</label>
            <input 
              type="number" 
              id="threshold" 
              name="threshold" 
              value={newConfig.threshold} 
              onChange={handleInputChange}
              step="0.01"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="severity">Severity</label>
            <select 
              id="severity" 
              name="severity" 
              value={newConfig.severity} 
              onChange={handleInputChange}
              required
            >
              {severityLevels.map(level => (
                <option key={level.id} value={level.id}>{level.label}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="notificationChannel">Notification Channel</label>
            <select 
              id="notificationChannel" 
              name="notificationChannel" 
              value={newConfig.notificationChannel} 
              onChange={handleInputChange}
              required
            >
              {notificationChannels.map(channel => (
                <option key={channel.id} value={channel.id}>{channel.label}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group checkbox">
            <label htmlFor="enabled">
              <input 
                type="checkbox" 
                id="enabled" 
                name="enabled" 
                checked={newConfig.enabled} 
                onChange={handleInputChange}
              />
              Enable Alert
            </label>
          </div>
          
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Alert Configuration'}
          </button>
        </form>
      </div>
      
      <div className="alert-list-container">
        <h3>Configured Alerts</h3>
        {loading ? (
          <p>Loading alert configurations...</p>
        ) : alertConfigs.length === 0 ? (
          <p>No alert configurations found. Create your first alert above.</p>
        ) : (
          <table className="alert-table">
            <thead>
              <tr>
                <th>Parameter</th>
                <th>Condition</th>
                <th>Threshold</th>
                <th>Severity</th>
                <th>Notification</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {alertConfigs.map(config => (
                <tr key={config.id} className={!config.enabled ? 'disabled-alert' : ''}>
                  <td>{getLabelById(parameters, config.parameter)}</td>
                  <td>{getLabelById(conditions, config.condition)}</td>
                  <td>{config.threshold}</td>
                  <td>
                    <span className={`severity-badge ${config.severity}`}>
                      {getLabelById(severityLevels, config.severity)}
                    </span>
                  </td>
                  <td>{getLabelById(notificationChannels, config.notificationChannel)}</td>
                  <td>
                    <span className={`status-badge ${config.enabled ? 'active' : 'inactive'}`}>
                      {config.enabled ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(config.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AlertConfiguration;
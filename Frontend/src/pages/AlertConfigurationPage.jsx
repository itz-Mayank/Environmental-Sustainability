// src/pages/AlertConfigurationPage.jsx
import React from 'react';
import AlertConfiguration from '../components/AlertConfiguration';
import '../components/AlertConfiguration.css';

const AlertConfigurationPage = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Alert Management</h1>
        <p>Configure environmental thresholds and notification preferences</p>
      </div>
      
      <AlertConfiguration />
      
      <div className="info-box">
        <h4>About Alert Configuration</h4>
        <p>
          Set up custom alerts to monitor your environmental parameters. When readings cross
          your defined thresholds, you'll receive notifications through your selected channels.
        </p>
        <ul>
          <li>Define thresholds for temperature, humidity, CO2, TVOC, and PM2.5</li>
          <li>Choose severity levels to prioritize alerts</li>
          <li>Select your preferred notification channels</li>
          <li>Enable or disable alerts as needed</li>
        </ul>
      </div>
    </div>
  );
};

export default AlertConfigurationPage;
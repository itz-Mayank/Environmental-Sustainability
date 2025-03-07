import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
    AlertSystem,
    WeatherWidget
} from './components';

const EnvironmentalDashboard = () => {
  const [environmentalData, setEnvironmentalData] = useState({
    airQuality: [],
    waterQuality: [],
    weatherData: null,
    alerts: []
  });

  const fetchRealTimeData = async () => {
    try {
      const [airQuality, waterQuality, weather, alerts] = await Promise.all([
        axios.get('/api/air-quality'),
        axios.get('/api/water-quality'),
        axios.get('/api/weather'),
        axios.get('/api/alerts')
      ]);

      setEnvironmentalData({
        airQuality: airQuality.data,
        waterQuality: waterQuality.data,
        weatherData: weather.data,
        alerts: alerts.data
      });
    } catch (error) {
      console.error('Data fetching error:', error);
    }
  };

  useEffect(() => {
    fetchRealTimeData();
    const intervalId = setInterval(fetchRealTimeData, 300000); // Refresh every 5 minutes
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="environmental-dashboard">
      <h1>Environmental Sustainability Dashboard</h1>
      
      <div className="dashboard-grid">
        <WeatherWidget data={environmentalData.weatherData} />
        
        <AirQualitySection 
          data={environmentalData.airQuality} 
          alerts={environmentalData.alerts.filter(a => a.type === 'air')}
        />
        
        <WaterQualitySection 
          data={environmentalData.waterQuality}
          alerts={environmentalData.alerts.filter(a => a.type === 'water')}
        />
        
        <PredictionSection 
          airData={environmentalData.airQuality}
          waterData={environmentalData.waterQuality}
        />
        
        <AlertSystem alerts={environmentalData.alerts} />
      </div>
    </div>
  );
};

export default EnvironmentalDashboard;
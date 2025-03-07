// src/pages/Dashboard.jsx
import { AlertTriangle, BarChart, CloudRain, Droplets, ThermometerSun, Timer, Wind } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import environmentalService from '../services/environmentalService';

const Dashboard = () => {
  // State for storing sensor data
  const [sensorData, setSensorData] = useState([]);
  const [currentReadings, setCurrentReadings] = useState({
    temperature: 0,
    humidity: 0,
    pressure: 0,
    rainfall: 0,
    windSpeed: 0,
    timestamp: new Date().toLocaleTimeString()
  });
  const [timeRange, setTimeRange] = useState('1h');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [systemStatus, setSystemStatus] = useState({ status: 'unknown', sensors: [] });
  const [recentAlerts, setRecentAlerts] = useState([]);

  // Fetch current readings
  const fetchCurrentReadings = async () => {
    try {
      const data = await environmentalService.getCurrentReadings();
      setCurrentReadings({
        temperature: data.temperature,
        humidity: data.humidity,
        pressure: data.pressure,
        rainfall: data.rainfall,
        windSpeed: data.wind_speed,
        timestamp: new Date(data.timestamp).toLocaleTimeString()
      });
    } catch (err) {
      console.error('Failed to fetch current readings', err);
      setError('Failed to fetch current readings. Please try again later.');
    }
  };

  // Fetch historical data based on time range
  const fetchHistoricalData = async () => {
    try {
      setLoading(true);
      const data = await environmentalService.getReadingsByTimeRange(timeRange);
      
      // Format data for chart display
      const formattedData = data.map(reading => ({
        time: new Date(reading.timestamp).getTime(),
        temperature: reading.temperature,
        humidity: reading.humidity,
        pressure: reading.pressure,
        rainfall: reading.rainfall,
        windSpeed: reading.wind_speed
      }));
      
      setSensorData(formattedData);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch historical data', err);
      setError('Failed to fetch historical data. Please try again later.');
      setLoading(false);
    }
  };

  // Fetch system status
  const fetchSystemStatus = async () => {
    try {
      const status = await environmentalService.getSystemStatus();
      setSystemStatus(status);
    } catch (err) {
      console.error('Failed to fetch system status', err);
    }
  };

  // Fetch recent alerts
  const fetchRecentAlerts = async () => {
    try {
      const alerts = await environmentalService.getRecentAlerts(5);
      setRecentAlerts(alerts);
    } catch (err) {
      console.error('Failed to fetch recent alerts', err);
    }
  };

  // Initial data fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchCurrentReadings(),
          fetchHistoricalData(),
          fetchSystemStatus(),
          fetchRecentAlerts()
        ]);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data. Please try again later.');
        setLoading(false);
      }
    };

    fetchInitialData();

    // Set up polling for real-time updates (every 30 seconds)
    const intervalId = setInterval(() => {
      fetchCurrentReadings();
      fetchRecentAlerts();
    }, 30000);
    
    // Clean up
    return () => clearInterval(intervalId);
  }, []);

  // Fetch new data when time range changes
  useEffect(() => {
    fetchHistoricalData();
  }, [timeRange]);

  // Format time for charts
  const formatTime = (time) => {
    return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading && sensorData.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error && sensorData.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 bg-red-50 rounded-lg">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-700 mb-2">Error Loading Data</h2>
          <p className="text-gray-700">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Environmental Monitoring Dashboard</h1>
        
        {/* Time range selector */}
        <div className="mb-6 flex items-center space-x-2">
          <Timer className="h-5 w-5 text-gray-600" />
          <span className="font-medium">Time Range:</span>
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="p-2 border rounded-md bg-white shadow-sm"
          >
            <option value="1h">Last Hour</option>
            <option value="6h">Last 6 Hours</option>
            <option value="24h">Last 24 Hours</option>
          </select>
        </div>
        
        {/* Current readings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-md flex items-center">
            <ThermometerSun className="h-10 w-10 text-red-500 mr-4" />
            <div>
              <p className="text-sm text-gray-500">Temperature</p>
              <p className="text-2xl font-semibold">{currentReadings.temperature}°C</p>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md flex items-center">
            <Droplets className="h-10 w-10 text-blue-500 mr-4" />
            <div>
              <p className="text-sm text-gray-500">Humidity</p>
              <p className="text-2xl font-semibold">{currentReadings.humidity}%</p>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md flex items-center">
            <BarChart className="h-10 w-10 text-purple-500 mr-4" />
            <div>
              <p className="text-sm text-gray-500">Pressure</p>
              <p className="text-2xl font-semibold">{currentReadings.pressure} hPa</p>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md flex items-center">
            <CloudRain className="h-10 w-10 text-blue-700 mr-4" />
            <div>
              <p className="text-sm text-gray-500">Rainfall</p>
              <p className="text-2xl font-semibold">{currentReadings.rainfall} mm</p>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md flex items-center">
            <Wind className="h-10 w-10 text-teal-500 mr-4" />
            <div>
              <p className="text-sm text-gray-500">Wind Speed</p>
              <p className="text-2xl font-semibold">{currentReadings.windSpeed} m/s</p>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md flex items-center">
            <Timer className="h-10 w-10 text-gray-500 mr-4" />
            <div>
              <p className="text-sm text-gray-500">Last Updated</p>
              <p className="text-2xl font-semibold">{currentReadings.timestamp}</p>
            </div>
          </div>
        </div>
        
        {/* Charts */}
        <div className="space-y-6">
          {loading && (
            <div className="py-4 text-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-2 text-gray-600">Updating charts...</p>
            </div>
          )}
          
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Temperature Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={sensorData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="time" 
                  tickFormatter={formatTime} 
                  interval="preserveStartEnd"
                />
                <YAxis 
                  domain={['dataMin - 1', 'dataMax + 1']} 
                  unit="°C"
                />
                <Tooltip 
                  formatter={(value) => [`${value}°C`, 'Temperature']}
                  labelFormatter={(time) => formatTime(time)}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="temperature" 
                  stroke="#ef4444" 
                  activeDot={{ r: 8 }}
                  name="Temperature"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Humidity & Rainfall</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={sensorData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="time" 
                  tickFormatter={formatTime} 
                  interval="preserveStartEnd"
                />
                <YAxis 
                  yAxisId="left"
                  domain={[0, 100]}
                  unit="%"
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 'dataMax + 0.5']}
                  unit=" mm"
                />
                <Tooltip 
                  formatter={(value, name) => {
                    return name === 'humidity' ? 
                      [`${value}%`, 'Humidity'] : 
                      [`${value} mm`, 'Rainfall'];
                  }}
                  labelFormatter={(time) => formatTime(time)}
                />
                <Legend />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="humidity" 
                  stroke="#3b82f6" 
                  name="Humidity"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="rainfall" 
                  stroke="#1e40af" 
                  name="Rainfall"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Pressure & Wind Speed</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={sensorData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="time" 
                  tickFormatter={formatTime} 
                  interval="preserveStartEnd"
                />
                <YAxis 
                  yAxisId="left"
                  domain={['dataMin - 5', 'dataMax + 5']}
                  unit=" hPa"
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 'dataMax + 2']}
                  unit=" m/s"
                />
                <Tooltip 
                  formatter={(value, name) => {
                    return name === 'pressure' ? 
                      [`${value} hPa`, 'Pressure'] : 
                      [`${value} m/s`, 'Wind Speed'];
                  }}
                  labelFormatter={(time) => formatTime(time)}
                />
                <Legend />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="pressure" 
                  stroke="#8b5cf6" 
                  name="Pressure"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="windSpeed" 
                  stroke="#0d9488" 
                  name="Wind Speed"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Status and alerts section */}
        <div className="mt-6 bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">System Status</h2>
          <div className="flex items-center">
            <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
              systemStatus.status === 'operational' ? 'bg-green-500' : 
              systemStatus.status === 'warning' ? 'bg-yellow-500' : 
              systemStatus.status === 'critical' ? 'bg-red-500' : 'bg-gray-500'
            }`}></span>
            <p className={
              systemStatus.status === 'operational' ? 'text-green-700' : 
              systemStatus.status === 'warning' ? 'text-yellow-700' : 
              systemStatus.status === 'critical' ? 'text-red-700' : 'text-gray-700'
            }>
              {systemStatus.status === 'operational' ? 'All systems operational' :
               systemStatus.status === 'warning' ? 'Some sensors reporting issues' :
               systemStatus.status === 'critical' ? 'Critical system issues detected' : 'System status unknown'}
            </p>
          </div>
          
          {systemStatus.sensors && systemStatus.sensors.length > 0 && (
            <div className="mt-3">
              <h3 className="font-medium mb-2">Sensor Status</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {systemStatus.sensors.map((sensor, index) => (
                  <div key={index} className="text-sm flex items-center">
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                      sensor.status === 'operational' ? 'bg-green-500' : 
                      sensor.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></span>
                    <span>{sensor.name}: {sensor.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-4">
            <h3 className="font-medium mb-2">Recent Alerts</h3>
            {recentAlerts.length > 0 ? (
              <ul className="space-y-2">
                {recentAlerts.map((alert, index) => (
                  <li key={index} className={`p-2 rounded text-sm ${
                    alert.severity === 'high' ? 'bg-red-50 text-red-700' : 
                    alert.severity === 'medium' ? 'bg-yellow-50 text-yellow-700' : 
                    'bg-blue-50 text-blue-700'
                  }`}>
                    <div className="flex items-start">
                      <AlertTriangle className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="font-medium">{alert.message}</p>
                        <p className="text-xs mt-1">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="p-2 bg-gray-50 rounded text-sm text-gray-600">No recent alerts</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
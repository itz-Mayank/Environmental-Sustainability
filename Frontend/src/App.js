// src/App.js

import React, { useEffect, useState } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import components
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

import "./index.css"; // Ensure you have this file for global styles
import AirQuality from './pages/AirQuality';
import Alerts from './pages/Alerts';
import Analytics from './pages/Analytics';
import Dashboard from './pages/Dashboard';
import MapView from './pages/MapView';
import News from './pages/News';
import Settings from './pages/Settings';
import WaterQuality from './pages/WaterQuality';
import AlertService from './services/AlertService';

ReactDOM.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.getElementById("root")
);


// CSS
import './App.css';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Initialize AlertService
  const alertService = new AlertService();

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Fetch alerts on component mount
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const fetchedAlerts = await alertService.getActiveAlerts();
        setAlerts(fetchedAlerts);
        
        // Show toast notifications for critical alerts
        const criticalAlerts = fetchedAlerts.filter(alert => alert.severity === 'critical');
        criticalAlerts.forEach(alert => {
          toast.error(alert.message, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        });
      } catch (error) {
        console.error('Failed to fetch alerts:', error);
        toast.error('Failed to fetch alerts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
    
    // Set up interval to check for new alerts every 5 minutes
    const alertInterval = setInterval(fetchAlerts, 5 * 60 * 1000);
    
    // Clean up interval on component unmount
    return () => clearInterval(alertInterval);
  }, []);

  return (
    <Router>
      <div className={`app-container ${darkMode ? 'dark' : ''}`}>
        <Navbar 
          toggleSidebar={toggleSidebar} 
          toggleDarkMode={toggleDarkMode} 
          darkMode={darkMode} 
          alertCount={alerts.length}
        />
        
        <div className="main-content">
          <Sidebar isOpen={sidebarOpen} />
          
          <div className={`content-area ${sidebarOpen ? 'sidebar-open' : ''}`}>
            <Routes>
              <Route path="/" element={<Dashboard alerts={alerts} />} />
              <Route path="/air-quality" element={<AirQuality />} />
              <Route path="/water-quality" element={<WaterQuality />} />
              <Route path="/alerts" element={<Alerts alerts={alerts} />} />
              <Route path="/map" element={<MapView />} />
              <Route path="/news" element={<News />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
            </Routes>
          </div>
        </div>
        
        <Footer />
        
        {/* Toast notifications for alerts */}
        <ToastContainer />
      </div>
    </Router>
  );
}

export default App;
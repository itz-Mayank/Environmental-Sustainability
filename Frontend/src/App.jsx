// src/App.jsx
import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import AlertConfigurationPage from './pages/AlertConfigurationPage';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <div className="content-wrapper">
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/alerts" element={<AlertConfigurationPage />} />
              {/* Add other routes as needed */}
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
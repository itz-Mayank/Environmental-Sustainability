# backend/services/alert_service.py

import pandas as pd
import logging
from datetime import datetime, timedelta

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class AlertService:
    """
    Service to handle environmental alerts
    """
    
    def __init__(self):
        """
        Initialize the alert service
        """
        # In-memory storage for active alerts
        # In a production environment, this would use a database
        self.active_alerts = []
        
        # Define thresholds for different parameters
        self.air_quality_thresholds = {
            'pm25': 35.0,      # μg/m³, WHO guideline
            'pm10': 50.0,      # μg/m³, WHO guideline
            'o3': 100.0,       # μg/m³
            'no2': 40.0,       # μg/m³
            'so2': 20.0,       # μg/m³
            'co': 10000.0,     # μg/m³
            'aqi': 150.0       # AQI - Unhealthy threshold
        }
        
        self.water_quality_thresholds = {
            'pH': {'min': 6.5, 'max': 8.5},
            'DO': {'min': 4.0, 'max': float('inf')},  # Dissolved oxygen, mg/L
            'BOD': {'min': 0.0, 'max': 3.0},          # Biological oxygen demand, mg/L
            'COD': {'min': 0.0, 'max': 10.0},         # Chemical oxygen demand, mg/L
            'TDS': {'min': 0.0, 'max': 500.0},        # Total dissolved solids, mg/L
            'Turbidity': {'min': 0.0, 'max': 5.0},    # NTU
            'Nitrates': {'min': 0.0, 'max': 10.0},    # mg/L
            'Phosphates': {'min': 0.0, 'max': 0.1},   # mg/L
            'Fecal Coliform': {'min': 0.0, 'max': 200.0},  # CFU/100mL
            'wqi': {'min': 0.0, 'max': 50.0}          # WQI - Good threshold
        }
    
    def check_air_quality_alerts(self, data):
        """
        Check air quality data for threshold violations and generate alerts
        
        Args:
            data (pd.DataFrame): DataFrame containing air quality data
            
        Returns:
            list: List of alert dictionaries
        """
        if data.empty:
            return []
            
        alerts = []
        
        # Check each parameter against its threshold
        for param, threshold in self.air_quality_thresholds.items():
            if param in data.columns:
                # Find rows where parameter exceeds threshold
                violations = data[data[param] > threshold]
                
                for _, row in violations.iterrows():
                    # Create alert
                    alert = {
                        'id': f"air_{param}_{datetime.now().strftime('%Y%m%d%H%M%S')}",
                        'type': 'air',
                        'parameter': param,
                        'value': float(row[param]),
                        'threshold': threshold,
                        'location': row.get('location', 'Unknown'),
                        'timestamp': row.get('timestamp', datetime.now().isoformat()),
                        'severity': self._calculate_air_alert_severity(param, row[param], threshold),
                        'message': f"Air quality alert: {param} level of {row[param]:.2f} exceeds threshold of {threshold}",
                        'created_at': datetime.now().isoformat()
                    }
                    
                    alerts.append(alert)
                    self.active_alerts.append(alert)
        
        # Log alerts
        if alerts:
            logger.info(f"Generated {len(alerts)} air quality alerts")
        
        return alerts
    
    def check_water_quality_alerts(self, data):
        """
        Check water quality data for threshold violations and generate alerts
        
        Args:
            data (pd.DataFrame): DataFrame containing water quality data
            
        Returns:
            list: List of alert dictionaries
        """
        if data.empty:
            return []
            
        alerts = []
        
        # Check each parameter against its thresholds
        for param, thresholds in self.water_quality_thresholds.items():
            if param in data.columns:
                # Find rows where parameter is outside the acceptable range
                min_val = thresholds['min']
                max_val = thresholds['max']
                
                violations = data[(data[param] < min_val) | (data[param] > max_val)]
                
                for _, row in violations.iterrows():
                    value = float(row[param])
                    # Determine if it's a min or max violation
                    if value < min_val:
                        threshold_type = 'minimum'
                        threshold_value = min_val
                    else:
                        threshold_type = 'maximum'
                        threshold_value = max_val
                    
                    # Create alert
                    alert = {
                        'id': f"water_{param}_{datetime.now().strftime('%Y%m%d%H%M%S')}",
                        'type': 'water',
                        'parameter': param,
                        'value': value,
                        'threshold_type': threshold_type,
                        'threshold_value': threshold_value,
                        'location': row.get('location', 'Unknown'),
                        'water_body': row.get('water_body', 'Unknown'),
                        'timestamp': row.get('timestamp', datetime.now().isoformat()),
                        'severity': self._calculate_water_alert_severity(param, value, min_val, max_val),
                        'message': f"Water quality alert: {param} level of {value:.2f} is outside acceptable range ({min_val} - {max_val})",
                        'created_at': datetime.now().isoformat()
                    }
                    
                    alerts.append(alert)
                    self.active_alerts.append(alert)
        
        # Log alerts
        if alerts:
            logger.info(f"Generated {len(alerts)} water quality alerts")
        
        return alerts
    
    def get_active_alerts(self, alert_type=None, location=None):
        """
        Get active alerts, optionally filtered by type and location
        
        Args:
            alert_type (str, optional): Type of alert ('air', 'water')
            location (str, optional): Location to filter by
            
        Returns:
            list: List of alert dictionaries
        """
        # Clean up expired alerts (older than 24 hours)
        self._cleanup_expired_alerts()
        
        # Filter alerts
        filtered_alerts = self.active_alerts
        
        if alert_type:
            filtered_alerts = [alert for alert in filtered_alerts if alert['type'] == alert_type]
            
        if location:
            filtered_alerts = [alert for alert in filtered_alerts if alert.get('location') == location]
        
        return filtered_alerts
    
    def _calculate_air_alert_severity(self, parameter, value, threshold):
        """
        Calculate severity level for air quality alerts
        
        Args:
            parameter (str): Parameter name
            value (float): Parameter value
            threshold (float): Alert threshold
            
        Returns:
            str: Severity level ('low', 'medium', 'high', 'critical')
        """
        # Calculate how much the value exceeds the threshold
        exceedance_ratio = value / threshold
        
        if exceedance_ratio <= 1.2:
            return 'low'
        elif exceedance_ratio <= 1.5:
            return 'medium'
        elif exceedance_ratio <= 2.0:
            return 'high'
        else:
            return 'critical'
    
    def _calculate_water_alert_severity(self, parameter, value, min_threshold, max_threshold):
        """
        Calculate severity level for water quality alerts
        
        Args:
            parameter (str): Parameter name
            value (float): Parameter value
            min_threshold (float): Minimum acceptable value
            max_threshold (float): Maximum acceptable value
            
        Returns:
            str: Severity level ('low', 'medium', 'high', 'critical')
        """
        # Calculate how far the value is from the acceptable range
        if value < min_threshold:
            deviation_ratio = min_threshold / value if value > 0 else float('inf')
        else:  # value > max_threshold
            deviation_ratio = value / max_threshold
        
        if deviation_ratio <= 1.2:
            return 'low'
        elif deviation_ratio <= 1.5:
            return 'medium'
        elif deviation_ratio <= 2.0:
            return 'high'
        else:
            return 'critical'
    
    def _cleanup_expired_alerts(self):
        """
        Remove alerts older than 24 hours
        """
        expiration_time = datetime.now() - timedelta(hours=24)
        expiration_time_str = expiration_time.isoformat()
        
        active_alerts_count = len(self.active_alerts)
        self.active_alerts = [alert for alert in self.active_alerts 
                             if alert.get('created_at', '9999-12-31T23:59:59') > expiration_time_str]
        
        removed_count = active_alerts_count - len(self.active_alerts)
        if removed_count > 0:
            logger.info(f"Removed {removed_count} expired alerts")
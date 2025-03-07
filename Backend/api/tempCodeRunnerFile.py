# backend/api/routes.py

from flask import Blueprint, request, jsonify
from flask_cors import CORS
import pandas as pd
import json
import logging
from datetime import datetime
from ..data_processing.data_fetcher import DataFetcher
from ..data_processing.data_processor import DataProcessor
from ..models.environmental_model import EnvironmentalModel
from ..services.alert_service import AlertService

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Create Blueprint
api = Blueprint('api', __name__)
CORS(api)  # Enable CORS

# Initialize services
config = {
    'imd_api_url': 'https://mausam.imd.gov.in/api',
    'imd_api_key': 'your_imd_api_key'  # Replace with actual API key or environment variable
}
data_fetcher = DataFetcher(config)
data_processor = DataProcessor()
aqi_model = EnvironmentalModel(model_type='random_forest')
wqi_model = EnvironmentalModel(model_type='gradient_boosting')
alert_service = AlertService()

# Routes
@api.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat()
    })

@api.route('/air-quality', methods=['GET'])
def get_air_quality():
    """Get air quality data for a given location"""
    city = request.args.get('city', 'Delhi')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    try:
        # Fetch data
        raw_data = data_fetcher.fetch_air_quality_data(city, start_date, end_date)
        
        # Process data
        processed_data = data_processor.process_air_quality_data(raw_data)
        
        # Check for alerts
        alerts = alert_service.check_air_quality_alerts(processed_data)
        
        # Prepare response
        response = {
            'city': city,
            'start_date': start_date,
            'end_date': end_date,
            'data': processed_data.to_dict(orient='records'),
            'alerts': alerts
        }
        
        return jsonify(response)
    
    except Exception as e:
        logger.error(f"Error fetching air quality data: {e}")
        return jsonify({
            'error': str(e),
            'city': city,
            'status': 'failed'
        }), 500

@api.route('/water-quality', methods=['GET'])
def get_water_quality():
    """Get water quality data for a given river or location"""
    river_name = request.args.get('river')
    location = request.args.get('location')
    
    if not river_name and not location:
        return jsonify({
            'error': 'Either river name or location must be provided',
            'status': 'failed'
        }), 400
    
    try:
        # Fetch data
        raw_data = data_fetcher.fetch_water_quality_data(river_name, location)
        
        # Process data
        processed_data = data_processor.process_water_quality_data(raw_data)
        
        # Check for alerts
        alerts = alert_service.check_water_quality_alerts(processed_data)
        
        # Prepare response
        response = {
            'river': river_name,
            'location': location,
            'data': processed_data.to_dict(orient='records'),
            'alerts': alerts
        }
        
        return jsonify(response)
    
    except Exception as e:
        logger.error(f"Error fetching water quality data: {e}")
        return jsonify({
            'error': str(e),
            'river': river_name,
            'location': location,
            'status': 'failed'
        }), 500

@api.route('/weather', methods=['GET'])
def get_weather_data():
    """Get precipitation and temperature data for a given location"""
    location = request.args.get('location', 'Delhi')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    try:
        # Fetch data
        raw_data = data_fetcher.fetch_precipitation_temperature_data(location, start_date, end_date)
        
        # Process data
        processed_data = data_processor.clean_weather_data(raw_data)
        
        # Prepare response
        response = {
            'location': location,
            'start_date': start_date,
            'end_date': end_date,
            'data': processed_data.to_dict(orient='records')
        }
        
        return jsonify(response)
    
    except Exception as e:
        logger.error(f"Error fetching weather data: {e}")
        return jsonify({
            'error': str(e),
            'location': location,
            'status': 'failed'
        }), 500

@api.route('/satellite-data', methods=['GET'])
def get_satellite_data():
    """Get satellite data for a given location"""
    location = request.args.get('location', 'Delhi')
    date = request.args.get('date')
    
    try:
        # Fetch data
        data = data_fetcher.fetch_satellite_data(location, date)
        
        # Prepare response
        response = {
            'location': location,
            'date': date,
            'data': data
        }
        
        return jsonify(response)
    
    except Exception as e:
        logger.error(f"Error fetching satellite data: {e}")
        return jsonify({
            'error': str(e),
            'location': location,
            'status': 'failed'
        }), 500

@api.route('/population', methods=['GET'])
def get_population_data():
    """Get population data for a given district"""
    district = request.args.get('district')
    
    if not district:
        return jsonify({
            'error': 'District must be provided',
            'status': 'failed'
        }), 400
    
    try:
        # Fetch data
        data = data_fetcher.fetch_population_data(district)
        
        # Prepare response
        response = {
            'district': district,
            'data': data
        }
        
        return jsonify(response)
    
    except Exception as e:
        logger.error(f"Error fetching population data: {e}")
        return jsonify({
            'error': str(e),
            'district': district,
            'status': 'failed'
        }), 500

@api.route('/predict/aqi', methods=['POST'])
def predict_aqi():
    """Predict AQI based on input data"""
    data = request.json
    
    if not data:
        return jsonify({
            'error': 'No data provided',
            'status': 'failed'
        }), 400
    
    try:
        # Convert JSON to DataFrame
        df = pd.DataFrame(data)
        
        # Make prediction
        predictions = aqi_model.predict_aqi(df)
        
        if predictions is None:
            return jsonify({
                'error': 'Failed to make predictions',
                'status': 'failed'
            }), 500
        
        # Prepare response
        response = {
            'predictions': predictions.tolist(),
            'status': 'success'
        }
        
        return jsonify(response)
    
    except Exception as e:
        logger.error(f"Error predicting AQI: {e}")
        return jsonify({
            'error': str(e),
            'status': 'failed'
        }), 500

@api.route('/predict/water-quality', methods=['POST'])
def predict_water_quality():
    """Predict water quality based on input data"""
    data = request.json
    
    if not data:
        return jsonify({
            'error': 'No data provided',
            'status': 'failed'
        }), 400
    
    try:
        # Convert JSON to DataFrame
        df = pd.DataFrame(data)
        
        # Make prediction
        predictions = wqi_model.predict_water_quality(df)
        
        if predictions is None:
            return jsonify({
                'error': 'Failed to make predictions',
                'status': 'failed'
            }), 500
        
        # Prepare response
        response = {
            'predictions': predictions.tolist(),
            'status': 'success'
        }
        
        return jsonify(response)
    
    except Exception as e:
        logger.error(f"Error predicting water quality: {e}")
        return jsonify({
            'error': str(e),
            'status': 'failed'
        }), 500

@api.route('/alerts', methods=['GET'])
def get_alerts():
    """Get all active alerts"""
    alert_type = request.args.get('type')  # 'air', 'water', or None for all
    location = request.args.get('location')
    
    try:
        # Get alerts
        alerts = alert_service.get_active_alerts(alert_type, location)
        
        # Prepare response
        response = {
            'count': len(alerts),
            'alerts': alerts,
            'status': 'success'
        }
        
        return jsonify(response)
    
    except Exception as e:
        logger.error(f"Error fetching alerts: {e}")
        return jsonify({
            'error': str(e),
            'status': 'failed'
        }), 500
        
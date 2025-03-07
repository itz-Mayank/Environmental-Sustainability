# backend/data_processing/data_processor.py

import pandas as pd
import numpy as np
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, MinMaxScaler
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class DataProcessor:
    """
    Class to process and clean environmental data
    """
    
    def __init__(self):
        """
        Initialize the data processor
        """
        # Initialize imputers for different types of data
        self.numeric_imputer = SimpleImputer(strategy='mean')
        self.categorical_imputer = SimpleImputer(strategy='most_frequent')
        self.scaler = StandardScaler()
        self.min_max_scaler = MinMaxScaler()
        
    def clean_weather_data(self, df):
        """
        Clean and preprocess weather data
        
        Args:
            df (pd.DataFrame): DataFrame containing weather data
            
        Returns:
            pd.DataFrame: Cleaned DataFrame
        """
        if df.empty:
            logger.warning("Empty DataFrame provided to clean_weather_data")
            return df
            
        logger.info(f"Cleaning weather data. Initial shape: {df.shape}")
        
        try:
            # Make a copy to avoid modifying the original
            cleaned_df = df.copy()
            
            # Convert date columns to datetime
            date_columns = [col for col in cleaned_df.columns if 'date' in col.lower()]
            for col in date_columns:
                cleaned_df[col] = pd.to_datetime(cleaned_df[col], errors='coerce')
            
            # Handle missing values in numeric columns
            numeric_columns = cleaned_df.select_dtypes(include=['float64', 'int64']).columns
            if len(numeric_columns) > 0:
                cleaned_df[numeric_columns] = self.numeric_imputer.fit_transform(cleaned_df[numeric_columns])
            
            # Handle outliers - cap at 3 standard deviations
            for col in numeric_columns:
                mean = cleaned_df[col].mean()
                std = cleaned_df[col].std()
                cleaned_df[col] = cleaned_df[col].clip(lower=mean - 3*std, upper=mean + 3*std)
            
            logger.info(f"Finished cleaning weather data. Final shape: {cleaned_df.shape}")
            return cleaned_df
            
        except Exception as e:
            logger.error(f"Error in clean_weather_data: {e}")
            return df  # Return original data on error
    
    def process_air_quality_data(self, df):
        """
        Process air quality data and calculate AQI
        
        Args:
            df (pd.DataFrame): DataFrame containing air quality data
            
        Returns:
            pd.DataFrame: Processed DataFrame with AQI calculations
        """
        if df.empty:
            logger.warning("Empty DataFrame provided to process_air_quality_data")
            return df
            
        logger.info(f"Processing air quality data. Initial shape: {df.shape}")
        
        try:
            # Make a copy to avoid modifying the original
            processed_df = df.copy()
            
            # Calculate AQI based on pollutants
            # This is a simplified example of AQI calculation
            # Actual AQI calculation depends on specific pollutants and their breakpoints
            
            # Check if the necessary columns exist
            pollutants = ['pm25', 'pm10', 'o3', 'co', 'so2', 'no2']
            existing_pollutants = [p for p in pollutants if p in processed_df.columns]
            
            if not existing_pollutants:
                logger.warning("No pollutant columns found in air quality data")
                return processed_df
            
            # Normalize pollutant values
            for pollutant in existing_pollutants:
                processed_df[f'{pollutant}_norm'] = processed_df[pollutant] / processed_df[pollutant].max()
            
            # Simple AQI calculation (this should be replaced with the proper calculation)
            processed_df['aqi'] = processed_df[[f'{p}_norm' for p in existing_pollutants]].mean(axis=1) * 500
            
            # Add AQI category
            aqi_categories = [
                (0, 50, 'Good'),
                (51, 100, 'Moderate'),
                (101, 150, 'Unhealthy for Sensitive Groups'),
                (151, 200, 'Unhealthy'),
                (201, 300, 'Very Unhealthy'),
                (301, 500, 'Hazardous')
            ]
            
            def get_aqi_category(aqi_value):
                for low, high, category in aqi_categories:
                    if low <= aqi_value <= high:
                        return category
                return 'Unknown'
            
            processed_df['aqi_category'] = processed_df['aqi'].apply(get_aqi_category)
            
            logger.info(f"Finished processing air quality data. Final shape: {processed_df.shape}")
            return processed_df
            
        except Exception as e:
            logger.error(f"Error in process_air_quality_data: {e}")
            return df  # Return original data on error
    
    def process_water_quality_data(self, df):
        """
        Process water quality data and calculate WQI
        
        Args:
            df (pd.DataFrame): DataFrame containing water quality data
            
        Returns:
            pd.DataFrame: Processed DataFrame with WQI calculations
        """
        if df.empty:
            logger.warning("Empty DataFrame provided to process_water_quality_data")
            return df
            
        logger.info(f"Processing water quality data. Initial shape: {df.shape}")
        
        try:
            # Make a copy to avoid modifying the original
            processed_df = df.copy()
            
            # Example parameters for WQI calculation
            wqi_params = {
                'pH': {'weight': 0.12, 'ideal': 7.0},
                'DO': {'weight': 0.18, 'ideal': 14.6},  # Dissolved oxygen
                'BOD': {'weight': 0.15, 'ideal': 0},    # Biological oxygen demand
                'TDS': {'weight': 0.10, 'ideal': 0},    # Total dissolved solids
                'Turbidity': {'weight': 0.08, 'ideal': 0},
                'Nitrates': {'weight': 0.10, 'ideal': 0},
                'Phosphates': {'weight': 0.10, 'ideal': 0},
                'Temperature': {'weight': 0.07, 'ideal': 25},
                'Fecal Coliform': {'weight': 0.10, 'ideal': 0}
            }
            
            # Check which parameters are available in the data
            available_params = [param for param in wqi_params.keys() if param in processed_df.columns]
            
            if not available_params:
                logger.warning("No water quality parameters found in data")
                return processed_df
            
            # Calculate sub-indices for each parameter (simplified version)
            for param in available_params:
                # Normalize the parameter value (0-1 scale)
                ideal_value = wqi_params[param]['ideal']
                max_value = processed_df[param].max() if processed_df[param].max() > 0 else 1
                
                # Calculate how far each value is from the ideal (0 is best)
                processed_df[f'{param}_index'] = abs(processed_df[param] - ideal_value) / max_value
            
            # Calculate WQI as weighted average of sub-indices
            total_weight = sum(wqi_params[param]['weight'] for param in available_params)
            
            processed_df['wqi'] = sum(
                processed_df[f'{param}_index'] * wqi_params[param]['weight'] 
                for param in available_params
            ) / total_weight * 100
            
            # Add WQI category
            wqi_categories = [
                (0, 25, 'Excellent'),
                (26, 50, 'Good'),
                (51, 75, 'Fair'),
                (76, 100, 'Poor'),
                (101, float('inf'), 'Very Poor')
            ]
            
            def get_wqi_category(wqi_value):
                for low, high, category in wqi_categories:
                    if low <= wqi_value <= high:
                        return category
                return 'Unknown'
            
            processed_df['wqi_category'] = processed_df['wqi'].apply(get_wqi_category)
            
            logger.info(f"Finished processing water quality data. Final shape: {processed_df.shape}")
            return processed_df
            
        except Exception as e:
            logger.error(f"Error in process_water_quality_data: {e}")
            return df  # Return original data on error
    
    def normalize_data_for_visualization(self, df, columns=None):
        """
        Normalize data for visualization purposes
        
        Args:
            df (pd.DataFrame): DataFrame to normalize
            columns (list, optional): List of columns to normalize. If None, all numeric columns are normalized.
            
        Returns:
            pd.DataFrame: DataFrame with normalized columns
        """
        if df.empty:
            return df
            
        # Make a copy to avoid modifying the original
        normalized_df = df.copy()
        
        # Determine which columns to normalize
        if columns is None:
            columns = normalized_df.select_dtypes(include=['float64', 'int64']).columns
        else:
            columns = [col for col in columns if col in normalized_df.columns]
        
        if not columns:
            return normalized_df
            
        # Apply min-max scaling
        normalized_df[columns] = self.min_max_scaler.fit_transform(normalized_df[columns])
        
        return normalized_df
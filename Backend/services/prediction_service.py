import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

class EnvironmentalPredictionService:
    def __init__(self):
        self.air_quality_model = RandomForestRegressor()
        self.water_quality_model = RandomForestRegressor()
        self.scaler = StandardScaler()

    def train_air_quality_model(self, historical_data):
        """
        Train air quality prediction model
        
        Args:
            historical_data (pd.DataFrame): Historical environmental data
        """
        features = [
            'temperature', 'humidity', 'wind_speed', 
            'industrial_activity', 'vehicle_density'
        ]
        
        X = historical_data[features]
        y = historical_data['air_quality_index']
        
        X_scaled = self.scaler.fit_transform(X)
        X_train, X_test, y_train, y_test = train_test_split(X_scaled, y)
        
        self.air_quality_model.fit(X_train, y_train)
        
    def predict_air_quality(self, current_conditions):
        """
        Predict future air quality
        
        Args:
            current_conditions (dict): Current environmental conditions
        
        Returns:
            float: Predicted air quality index
        """
        features_df = pd.DataFrame([current_conditions])
        scaled_features = self.scaler.transform(features_df)
        
        return self.air_quality_model.predict(scaled_features)[0]
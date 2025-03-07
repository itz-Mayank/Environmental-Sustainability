# backend/models/environmental_model.py

import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.metrics import mean_squared_error, r2_score
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class EnvironmentalModel:
    """
    Class for machine learning models related to environmental data prediction
    """
    
    def __init__(self, model_type='random_forest'):
        """
        Initialize the environmental model
        
        Args:
            model_type (str): Type of model to use ('random_forest', 'gradient_boosting', or 'linear')
        """
        self.model_type = model_type
        self.model = None
        self.features = None
        
        if model_type == 'random_forest':
            self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        elif model_type == 'gradient_boosting':
            self.model = GradientBoostingRegressor(n_estimators=100, random_state=42)
        elif model_type == 'linear':
            self.model = LinearRegression()
        else:
            logger.error(f"Unknown model type: {model_type}. Using RandomForest as default.")
            self.model = RandomForestRegressor(n_estimators=100, random_state=42)
            
    def train_aqi_prediction_model(self, data, target_column='aqi', features=None, test_size=0.2):
        """
        Train a model to predict AQI (Air Quality Index)
        
        Args:
            data (pd.DataFrame): DataFrame containing features and target
            target_column (str): Name of the target column
            features (list, optional): List of feature columns. If None, all columns except target are used.
            test_size (float): Proportion of data to use for testing
            
        Returns:
            dict: Dictionary containing model metrics
        """
        logger.info(f"Training AQI prediction model using {self.model_type}")
        
        try:
            # Prepare features and target
            if features is None:
                features = [col for col in data.columns if col != target_column]
                
            # Store feature names for future prediction
            self.features = features
                
            X = data[features]
            y = data[target_column]
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=test_size, random_state=42)
            
            # Train model
            self.model.fit(X_train, y_train)
            
            # Evaluate model
            y_pred = self.model.predict(X_test)
            mse = mean_squared_error(y_test, y_pred)
            rmse = np.sqrt(mse)
            r2 = r2_score(y_test, y_pred)
            
            logger.info(f"Model trained. RMSE: {rmse:.2f}, R²: {r2:.2f}")
            
            # Return metrics
            return {
                'model_type': self.model_type,
                'features': features,
                'target': target_column,
                'mse': mse,
                'rmse': rmse,
                'r2': r2
            }
            
        except Exception as e:
            logger.error(f"Error training AQI prediction model: {e}")
            return {
                'error': str(e),
                'model_type': self.model_type,
                'status': 'failed'
            }
    
    def predict_aqi(self, data):
        """
        Predict AQI based on input data
        
        Args:
            data (pd.DataFrame): DataFrame containing feature data
            
        Returns:
            np.array: Array of predicted AQI values
        """
        if self.model is None:
            logger.error("Model has not been trained yet.")
            return None
            
        if self.features is None:
            logger.error("Feature list is not available.")
            return None
            
        # Ensure data has all required features
        missing_features = [feature for feature in self.features if feature not in data.columns]
        if missing_features:
            logger.error(f"Missing features in input data: {missing_features}")
            return None
            
        # Make predictions
        try:
            predictions = self.model.predict(data[self.features])
            return predictions
        except Exception as e:
            logger.error(f"Error making predictions: {e}")
            return None
    
    def train_water_quality_model(self, data, target_column='wqi', features=None, test_size=0.2):
        """
        Train a model to predict WQI (Water Quality Index)
        
        Args:
            data (pd.DataFrame): DataFrame containing features and target
            target_column (str): Name of the target column
            features (list, optional): List of feature columns. If None, all columns except target are used.
            test_size (float): Proportion of data to use for testing
            
        Returns:
            dict: Dictionary containing model metrics
        """
        logger.info(f"Training water quality prediction model using {self.model_type}")
        
        try:
            # Prepare features and target
            if features is None:
                features = [col for col in data.columns if col != target_column]
                
            # Store feature names for future prediction
            self.features = features
                
            X = data[features]
            y = data[target_column]
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=test_size, random_state=42)
            
            # Hyperparameter tuning for RandomForest
            if self.model_type == 'random_forest':
                param_grid = {
                    'n_estimators': [50, 100, 200],
                    'max_depth': [None, 10, 20, 30],
                    'min_samples_split': [2, 5, 10]
                }
                grid_search = GridSearchCV(self.model, param_grid, cv=3, n_jobs=-1)
                grid_search.fit(X_train, y_train)
                self.model = grid_search.best_estimator_
                logger.info(f"Best parameters: {grid_search.best_params_}")
            else:
                # Train model without hyperparameter tuning
                self.model.fit(X_train, y_train)
            
            # Evaluate model
            y_pred = self.model.predict(X_test)
            mse = mean_squared_error(y_test, y_pred)
            rmse = np.sqrt(mse)
            r2 = r2_score(y_test, y_pred)
            
            logger.info(f"Model trained. RMSE: {rmse:.2f}, R²: {r2:.2f}")
            
            # Return metrics
            return {
                'model_type': self.model_type,
                'features': features,
                'target': target_column,
                'mse': mse,
                'rmse': rmse,
                'r2': r2,
                'feature_importance': self._get_feature_importance() if hasattr(self.model, 'feature_importances_') else None
            }
            
        except Exception as e:
            logger.error(f"Error training water quality prediction model: {e}")
            return {
                'error': str(e),
                'model_type': self.model_type,
                'status': 'failed'
            }
    
    def predict_water_quality(self, data):
        """
        Predict water quality based on input data
        
        Args:
            data (pd.DataFrame): DataFrame containing feature data
            
        Returns:
            np.array: Array of predicted WQI values
        """
        if self.model is None:
            logger.error("Model has not been trained yet.")
            return None
            
        if self.features is None:
            logger.error("Feature list is not available.")
            return None
            
        # Ensure data has all required features
        missing_features = [feature for feature in self.features if feature not in data.columns]
        if missing_features:
            logger.error(f"Missing features in input data: {missing_features}")
            return None
            
        # Make predictions
        try:
            predictions = self.model.predict(data[self.features])
            return predictions
        except Exception as e:
            logger.error(f"Error making predictions: {e}")
            return None
    
    def _get_feature_importance(self):
        """
        Get feature importance from the model
        
        Returns:
            dict: Dictionary mapping feature names to importance scores
        """
        if not hasattr(self.model, 'feature_importances_'):
            return None
            
        if self.features is None:
            return None
            
        return dict(zip(self.features, self.model.feature_importances_))
    
    def save_model(self, filepath):
        """
        Save the trained model to a file
        
        Args:
            filepath (str): Path to save the model
            
        Returns:
            bool: True if successful, False otherwise
        """
        if self.model is None:
            logger.error("No model to save.")
            return False
            
        try:
            # Save model and features
            model_data = {
                'model': self.model,
                'features': self.features,
                'model_type': self.model_type
            }
            joblib.dump(model_data, filepath)
            logger.info(f"Model saved to {filepath}")
            return True
        except Exception as e:
            logger.error(f"Error saving model: {e}")
            return False
    
    def load_model(self, filepath):
        """
        Load a trained model from a file
        
        Args:
            filepath (str): Path to the saved model
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            model_data = joblib.load(filepath)
            self.model = model_data['model']
            self.features = model_data['features']
            self.model_type = model_data['model_type']
            logger.info(f"Model loaded from {filepath}")
            return True
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            return False
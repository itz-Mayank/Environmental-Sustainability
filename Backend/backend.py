from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import requests
import mysql.connector
from datetime import datetime

app = FastAPI()

# MySQL Database Configuration
db_config = {
    "host": "localhost",
    "user": "root",
    "password": "your_password",
    "database": "environment_db"
}

# Replace with your API Key
OPENWEATHER_API_KEY = "YOUR_API_KEY"
AQI_API = "http://api.openweathermap.org/data/2.5/air_pollution"
GEO_API = "http://api.openweathermap.org/geo/1.0/direct"

class AQIData(BaseModel):
    city: str
    aqi: float
    timestamp: str

class WQIData(BaseModel):
    location: str
    wqi: float
    timestamp: str

# 🔹 Root Endpoint
@app.get("/")
def root():
    return {"message": "Welcome to the AQI & WQI API!"}

# 🔹 Get latitude & longitude of a city
def get_city_coordinates(city):
    response = requests.get(f"{GEO_API}?q={city}&limit=1&appid={OPENWEATHER_API_KEY}")
    if response.status_code == 200 and response.json():
        location = response.json()[0]
        return location["lat"], location["lon"]
    return None, None

# 🔹 Fetch real-time AQI Data
@app.get("/get_aqi/{city}")
def get_aqi(city: str):
    lat, lon = get_city_coordinates(city)
    if lat is None or lon is None:
        raise HTTPException(status_code=404, detail="City not found")

    response = requests.get(f"{AQI_API}?lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY}")
    if response.status_code == 200:
        data = response.json()
        return {"city": city, "aqi": data["list"][0]["main"]["aqi"], "timestamp": datetime.now().isoformat()}
    
    raise HTTPException(status_code=500, detail="Failed to fetch AQI data")

# 🔹 Fetch real-time WQI Data (Dummy API for Now)
@app.get("/get_wqi/{location}")
def get_wqi(location: str):
    # 🔸 Replace with actual API when available
    sample_wqi_data = {"location": location, "wqi": 85, "timestamp": datetime.now().isoformat()}
    return sample_wqi_data

# 🔹 Store AQI Data in MySQL
@app.post("/store_aqi")
def store_aqi(data: AQIData):
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        cursor.execute("INSERT INTO aqi_data (city, aqi, timestamp) VALUES (%s, %s, %s)", 
                       (data.city, data.aqi, data.timestamp))
        conn.commit()
        return {"message": "AQI data stored successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

# 🔹 Store WQI Data in MySQL
@app.post("/store_wqi")
def store_wqi(data: WQIData):
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        cursor.execute("INSERT INTO wqi_data (location, wqi, timestamp) VALUES (%s, %s, %s)", 
                       (data.location, data.wqi, data.timestamp))
        conn.commit()
        return {"message": "WQI data stored successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

import React, { useState, useEffect } from 'react';
import { 
  getEnvironmentalConditions, 
  getFireRiskLevel, 
  getEnvironmentalAlerts,
  getAirQualityIndex
} from '../../services/api/environmentService';

/**
 * EnvironmentDashboard component
 * 
 * Displays current environmental conditions, fire risk levels,
 * and active alerts for a user's location.
 */
const EnvironmentDashboard = () => {
  const [conditions, setConditions] = useState(null);
  const [fireRisk, setFireRisk] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [airQuality, setAirQuality] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Load environmental data on component mount
  useEffect(() => {
    loadEnvironmentalData();
  }, []);

  // Function to load all environmental data
  const loadEnvironmentalData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get user's location
      const userLocation = await getCurrentLocation();
      
      // Fetch environmental data in parallel
      const [conditionsData, fireRiskData, alertsData, airQualityData] = await Promise.all([
        getEnvironmentalConditions(userLocation),
        getFireRiskLevel(userLocation),
        getEnvironmentalAlerts(userLocation, 50), // 50km radius
        getAirQualityIndex(userLocation)
      ]);
      
      // Update state with fetched data
      setConditions(conditionsData);
      setFireRisk(fireRiskData);
      setAlerts(alertsData.alerts || []);
      setAirQuality(airQualityData);
      setLocation(userLocation);
    } catch (err) {
      console.error('Error loading environmental data:', err);
      setError('Failed to load environmental data. Please check your connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Get user's current location
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          resolve(userLocation);
        },
        (err) => {
          console.error('Error getting location:', err);
          reject(err);
        }
      );
    });
  };

  // Handle manual refresh
  const handleRefresh = () => {
    setRefreshing(true);
    loadEnvironmentalData();
  };

  // Get risk level color
  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'Low':
        return 'bg-green-100 text-green-800';
      case 'Moderate':
        return 'bg-yellow-100 text-yellow-800';
      case 'High':
        return 'bg-orange-100 text-orange-800';
      case 'Extreme':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get air quality color
  const getAirQualityColor = (index) => {
    if (index <= 50) return 'bg-green-100 text-green-800';
    if (index <= 100) return 'bg-yellow-100 text-yellow-800';
    if (index <= 150) return 'bg-orange-100 text-orange-800';
    if (index <= 200) return 'bg-red-100 text-red-800';
    return 'bg-purple-100 text-purple-800';
  };

  // Get air quality label
  const getAirQualityLabel = (index) => {
    if (index <= 50) return 'Good';
    if (index <= 100) return 'Moderate';
    if (index <= 150) return 'Unhealthy for Sensitive Groups';
    if (index <= 200) return 'Unhealthy';
    if (index <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  };

  // Get weather icon
  const getWeatherIcon = (condition) => {
    switch (condition) {
      case 'Clear':
        return '☀️';
      case 'Partly Cloudy':
        return '⛅';
      case 'Cloudy':
        return '☁️';
      case 'Rain':
        return '🌧️';
      case 'Thunderstorm':
        return '⛈️';
      case 'Snow':
        return '❄️';
      case 'Fog':
        return '🌫️';
      default:
        return '🌡️';
    }
  };

  return (
    <div className="environment-dashboard">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-green-700">Environmental Conditions</h2>
        
        <button 
          className={`p-2 rounded-full ${refreshing ? 'bg-gray-200' : 'bg-green-100 hover:bg-green-200'}`}
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <span className={`text-lg ${refreshing ? 'animate-spin' : ''}`}>🔄</span>
        </button>
      </div>
      
      {/* Loading state */}
      {loading && !refreshing && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <button 
            className="mt-2 bg-red-700 text-white px-4 py-2 rounded-md text-sm"
            onClick={loadEnvironmentalData}
          >
            Try Again
          </button>
        </div>
      )}
      
      {/* Main dashboard content */}
      {!loading && !error && conditions && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current conditions card */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Current Conditions</h3>
            
            <div className="flex items-center mb-4">
              <span className="text-5xl mr-4">{getWeatherIcon(conditions.condition)}</span>
              <div>
                <p className="text-3xl font-bold">{conditions.temperature}°C</p>
                <p className="text-gray-600">{conditions.condition}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-xs text-gray-500">Humidity</p>
                <p className="text-xl font-semibold">{conditions.humidity}%</p>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-xs text-gray-500">Wind</p>
                <p className="text-xl font-semibold">{conditions.windSpeed} km/h</p>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-xs text-gray-500">Visibility</p>
                <p className="text-xl font-semibold">{conditions.visibility} km</p>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-xs text-gray-500">Precipitation</p>
                <p className="text-xl font-semibold">{conditions.precipitation} mm</p>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 mt-4">
              Last updated: {new Date(conditions.timestamp).toLocaleTimeString()}
            </p>
          </div>
          
          {/* Air quality card */}
          {airQuality && (
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Air Quality</h3>
              
              <div className="flex flex-col items-center mb-4">
                <div className={`text-center p-4 rounded-full w-24 h-24 flex items-center justify-center ${getAirQualityColor(airQuality.aqi)}`}>
                  <span className="text-3xl font-bold">{airQuality.aqi}</span>
                </div>
                <p className="mt-2 font-medium">{getAirQualityLabel(airQuality.aqi)}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-xs text-gray-500">PM2.5</p>
                  <p className="text-xl font-semibold">{airQuality.pm25} μg/m³</p>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-xs text-gray-500">PM10</p>
                  <p className="text-xl font-semibold">{airQuality.pm10} μg/m³</p>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-xs text-gray-500">Ozone (O₃)</p>
                  <p className="text-xl font-semibold">{airQuality.o3} ppb</p>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-xs text-gray-500">NO₂</p>
                  <p className="text-xl font-semibold">{airQuality.no2} ppb</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Fire risk card */}
          {fireRisk && (
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Fire Risk Level</h3>
              
              <div className="flex items-center mb-4">
                <div className={`p-4 rounded-md ${getRiskLevelColor(fireRisk.level)}`}>
                  <p className="text-2xl font-bold">{fireRisk.level}</p>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm">{fireRisk.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-xs text-gray-500">Soil Moisture</p>
                  <p className="text-xl font-semibold">{fireRisk.soilMoisture}%</p>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-xs text-gray-500">Vegetation Dryness</p>
                  <p className="text-xl font-semibold">{fireRisk.vegetationDryness}%</p>
                </div>
              </div>
              
              <p className="mt-4 text-sm">
                {fireRisk.recommendation}
              </p>
            </div>
          )}
          
          {/* Active alerts */}
          <div className="bg-white rounded-lg shadow-md p-4 md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Active Alerts</h3>
            
            {alerts.length === 0 ? (
              <div className="text-center p-8 bg-gray-50 rounded-lg">
                <p className="text-gray-600">No active alerts in your area</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map(alert => (
                  <div key={alert.id} className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r-md">
                    <div className="flex justify-between">
                      <h4 className="font-bold text-red-700">{alert.title}</h4>
                      <span className="text-sm bg-red-200 text-red-800 px-2 py-1 rounded">
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{alert.description}</p>
                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                      <span>Issued: {new Date(alert.issuedAt).toLocaleString()}</span>
                      <span>Expires: {new Date(alert.expiresAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnvironmentDashboard;

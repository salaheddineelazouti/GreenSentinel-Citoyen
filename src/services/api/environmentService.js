/**
 * Environment Service
 * 
 * This service handles environmental data such as weather conditions,
 * fire risk levels, and environmental alerts for a given location.
 */

import { apiRequest } from './apiClient';
import { queueOperation } from '../offline/queueManager';

/**
 * Get current weather and environmental conditions for a location
 * 
 * @param {Object} coordinates - Location coordinates
 * @param {number} coordinates.latitude - Latitude
 * @param {number} coordinates.longitude - Longitude
 * @returns {Promise<Object>} Weather and environmental data
 */
export const getEnvironmentalConditions = async (coordinates) => {
  try {
    return await apiRequest('/environment/conditions', {
      method: 'GET',
      params: coordinates
    });
  } catch (error) {
    console.error('Error fetching environmental conditions:', error);
    throw error;
  }
};

/**
 * Get fire risk level for a location
 * 
 * @param {Object} coordinates - Location coordinates
 * @param {number} coordinates.latitude - Latitude
 * @param {number} coordinates.longitude - Longitude
 * @returns {Promise<Object>} Fire risk data
 */
export const getFireRiskLevel = async (coordinates) => {
  try {
    return await apiRequest('/environment/fire-risk', {
      method: 'GET',
      params: coordinates
    });
  } catch (error) {
    console.error('Error fetching fire risk level:', error);
    throw error;
  }
};

/**
 * Get active environmental alerts for a location
 * 
 * @param {Object} coordinates - Location coordinates
 * @param {number} coordinates.latitude - Latitude
 * @param {number} coordinates.longitude - Longitude
 * @param {number} [radius=50] - Radius in kilometers
 * @returns {Promise<Object>} Environmental alerts
 */
export const getEnvironmentalAlerts = async (coordinates, radius = 50) => {
  try {
    return await apiRequest('/environment/alerts', {
      method: 'GET',
      params: { ...coordinates, radius }
    });
  } catch (error) {
    console.error('Error fetching environmental alerts:', error);
    throw error;
  }
};

/**
 * Subscribe to alert notifications for a specific area
 * 
 * @param {Object} area - Area to monitor
 * @param {string} area.name - Name of the area
 * @param {Object} area.coordinates - Coordinates of the area center
 * @param {number} area.radius - Radius in kilometers
 * @param {Array<string>} alertTypes - Types of alerts to subscribe to
 * @returns {Promise<Object>} Subscription status
 */
export const subscribeToAreaAlerts = async (area, alertTypes) => {
  try {
    return await apiRequest('/environment/alerts/subscribe', {
      method: 'POST',
      data: { area, alertTypes }
    });
  } catch (error) {
    if (!navigator.onLine) {
      return queueOperation('environment', 'subscribeAlerts', { area, alertTypes });
    }
    console.error('Error subscribing to area alerts:', error);
    throw error;
  }
};

/**
 * Unsubscribe from alert notifications for a specific area
 * 
 * @param {string} subscriptionId - ID of the subscription to cancel
 * @returns {Promise<Object>} Unsubscription status
 */
export const unsubscribeFromAreaAlerts = async (subscriptionId) => {
  try {
    return await apiRequest(`/environment/alerts/subscribe/${subscriptionId}`, {
      method: 'DELETE'
    });
  } catch (error) {
    if (!navigator.onLine) {
      return queueOperation('environment', 'unsubscribeAlerts', { subscriptionId });
    }
    console.error('Error unsubscribing from area alerts:', error);
    throw error;
  }
};

/**
 * Get forecast of environmental conditions for the next few days
 * 
 * @param {Object} coordinates - Location coordinates
 * @param {number} coordinates.latitude - Latitude
 * @param {number} coordinates.longitude - Longitude
 * @param {number} [days=7] - Number of days to forecast
 * @returns {Promise<Object>} Environmental forecast
 */
export const getEnvironmentalForecast = async (coordinates, days = 7) => {
  try {
    return await apiRequest('/environment/forecast', {
      method: 'GET',
      params: { ...coordinates, days }
    });
  } catch (error) {
    console.error('Error fetching environmental forecast:', error);
    throw error;
  }
};

/**
 * Get air quality index for a location
 * 
 * @param {Object} coordinates - Location coordinates
 * @param {number} coordinates.latitude - Latitude
 * @param {number} coordinates.longitude - Longitude
 * @returns {Promise<Object>} Air quality data
 */
export const getAirQualityIndex = async (coordinates) => {
  try {
    return await apiRequest('/environment/air-quality', {
      method: 'GET',
      params: coordinates
    });
  } catch (error) {
    console.error('Error fetching air quality index:', error);
    throw error;
  }
};

/**
 * Get seasonal environmental information
 * 
 * @param {Object} coordinates - Location coordinates
 * @param {number} coordinates.latitude - Latitude
 * @param {number} coordinates.longitude - Longitude
 * @returns {Promise<Object>} Seasonal information
 */
export const getSeasonalInfo = async (coordinates) => {
  try {
    return await apiRequest('/environment/seasonal', {
      method: 'GET',
      params: coordinates
    });
  } catch (error) {
    console.error('Error fetching seasonal information:', error);
    throw error;
  }
};

/**
 * Report an environmental condition change
 * 
 * @param {Object} data - Environmental condition data
 * @returns {Promise<Object>} Response data
 */
export const reportEnvironmentalCondition = async (data) => {
  try {
    return await apiRequest('/environment/conditions/report', {
      method: 'POST',
      data
    });
  } catch (error) {
    if (!navigator.onLine) {
      return queueOperation('environment', 'reportCondition', data);
    }
    console.error('Error reporting environmental condition:', error);
    throw error;
  }
};

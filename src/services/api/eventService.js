/**
 * Event Service
 * 
 * Service for managing community events, including retrieving event information,
 * registering for events, and tracking participation.
 */

import { apiRequest } from './apiClient';
import { queueOperation } from '../offline/queueManager';

/**
 * Get upcoming community events
 * 
 * @param {Object} options - Options for filtering events
 * @param {number} options.page - Page number for pagination
 * @param {number} options.limit - Number of events per page
 * @param {string} options.type - Filter by event type
 * @param {Object} options.location - User location for nearby events
 * @param {number} options.radius - Search radius in kilometers
 * @returns {Promise<Object>} Paginated events with metadata
 */
export const getEvents = async (options = {}) => {
  try {
    return await apiRequest('/events', {
      method: 'GET',
      params: options
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

/**
 * Get a specific event by ID
 * 
 * @param {string} eventId - ID of the event to retrieve
 * @returns {Promise<Object>} Event details
 */
export const getEventById = async (eventId) => {
  try {
    return await apiRequest(`/events/${eventId}`, {
      method: 'GET'
    });
  } catch (error) {
    console.error(`Error fetching event ${eventId}:`, error);
    throw error;
  }
};

/**
 * Register for an event
 * 
 * @param {string} eventId - ID of the event to register for
 * @returns {Promise<Object>} Registration confirmation
 */
export const registerForEvent = async (eventId) => {
  try {
    // First try to submit directly
    try {
      const response = await apiRequest(`/events/${eventId}/register`, {
        method: 'POST'
      });
      return response;
    } catch (error) {
      // If network error or server unavailable, queue for later
      if (error.message.includes('network') || error.status === 503) {
        return queueOperation('events', 'register', { eventId });
      }
      
      // For other errors, re-throw
      throw error;
    }
  } catch (error) {
    console.error(`Error registering for event ${eventId}:`, error);
    throw error;
  }
};

/**
 * Cancel registration for an event
 * 
 * @param {string} eventId - ID of the event to cancel registration for
 * @returns {Promise<boolean>} Success status
 */
export const cancelEventRegistration = async (eventId) => {
  try {
    await apiRequest(`/events/${eventId}/register`, {
      method: 'DELETE'
    });
    return true;
  } catch (error) {
    console.error(`Error canceling event registration ${eventId}:`, error);
    throw error;
  }
};

/**
 * Get events the user is registered for
 * 
 * @param {Object} options - Options for filtering events
 * @returns {Promise<Array>} Array of registered events
 */
export const getUserEvents = async (options = {}) => {
  try {
    return await apiRequest('/events/user', {
      method: 'GET',
      params: options
    });
  } catch (error) {
    console.error('Error fetching user events:', error);
    throw error;
  }
};

/**
 * Check if user is registered for a specific event
 * 
 * @param {string} eventId - ID of the event to check
 * @returns {Promise<boolean>} Registration status
 */
export const checkEventRegistration = async (eventId) => {
  try {
    const response = await apiRequest(`/events/${eventId}/registration`);
    return response.registered === true;
  } catch (error) {
    console.error(`Error checking event registration ${eventId}:`, error);
    return false;
  }
};

/**
 * Get nearby community events
 * 
 * @param {Object} location - User's current location
 * @param {number} location.lat - Latitude
 * @param {number} location.lng - Longitude
 * @param {number} radius - Search radius in kilometers
 * @returns {Promise<Array>} Array of nearby events
 */
export const getNearbyEvents = async (location, radius = 50) => {
  try {
    return await apiRequest('/events/nearby', {
      method: 'GET',
      params: {
        lat: location.lat,
        lng: location.lng,
        radius
      }
    });
  } catch (error) {
    console.error('Error fetching nearby events:', error);
    throw error;
  }
};

/**
 * Submit feedback for an event
 * 
 * @param {string} eventId - ID of the event
 * @param {Object} feedback - Feedback data
 * @param {number} feedback.rating - Rating from 1-5
 * @param {string} feedback.comment - Optional feedback comment
 * @returns {Promise<Object>} Submission confirmation
 */
export const submitEventFeedback = async (eventId, feedback) => {
  try {
    return await apiRequest(`/events/${eventId}/feedback`, {
      method: 'POST',
      data: feedback
    });
  } catch (error) {
    console.error(`Error submitting feedback for event ${eventId}:`, error);
    throw error;
  }
};

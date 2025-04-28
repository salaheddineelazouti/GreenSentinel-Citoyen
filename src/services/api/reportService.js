/**
 * Report Service
 * 
 * Service for managing incident reports, including submitting new reports
 * and retrieving report history and status.
 */

import { apiRequest } from './apiClient';
import { queueOperation } from '../offline/queueManager';
import { compressImage } from '../media/mediaCompressor';

/**
 * Submit a new incident report
 * 
 * @param {Object} reportData - Report data
 * @param {string} reportData.type - Type of incident (fire, logging, etc.)
 * @param {Array} reportData.photos - Array of photo blobs or URLs
 * @param {Object} reportData.location - Location coordinates {lat, lng}
 * @param {string} reportData.description - Description of the incident
 * @param {string} reportData.severity - Severity level (low, medium, high, critical)
 * @param {string} reportData.area - Affected area size (small, medium, large)
 * @param {string} [reportData.additionalNotes] - Additional notes
 * @returns {Promise<Object>} Created report data with ID and status
 */
export const submitReport = async (reportData) => {
  try {
    // Process photos if present
    let processedPhotos = [];
    if (reportData.photos && reportData.photos.length > 0) {
      // Compress each photo before uploading
      processedPhotos = await Promise.all(
        reportData.photos.map(async (photo) => {
          // If it's already a string URL, return as is
          if (typeof photo === 'string') return photo;
          
          // If it's a blob or file, compress it
          if (photo.blob) {
            const compressed = await compressImage(photo.blob);
            return compressed;
          }
          
          return photo;
        })
      );
    }
    
    // Prepare data for API
    const apiData = {
      ...reportData,
      photos: processedPhotos,
      timestamp: reportData.timestamp || new Date().toISOString()
    };
    
    // First try to submit directly
    try {
      const response = await apiRequest('/reports', {
        method: 'POST',
        data: apiData
      });
      return response;
    } catch (error) {
      // If network error or server unavailable, queue for later
      if (error.message.includes('network') || error.status === 503) {
        // Queue the operation for when connectivity is restored
        return queueOperation('reports', 'create', apiData);
      }
      
      // For other errors, re-throw
      throw error;
    }
  } catch (error) {
    console.error('Error submitting report:', error);
    throw error;
  }
};

/**
 * Get user's report history
 * 
 * @param {Object} options - Options for filtering reports
 * @param {number} options.page - Page number for pagination
 * @param {number} options.limit - Number of reports per page
 * @param {string} options.status - Filter by status (pending, verified, rejected)
 * @param {string} options.type - Filter by report type
 * @returns {Promise<Object>} Paginated reports with metadata
 */
export const getUserReports = async (options = {}) => {
  try {
    return await apiRequest('/reports/user', {
      method: 'GET',
      params: options
    });
  } catch (error) {
    console.error('Error fetching user reports:', error);
    throw error;
  }
};

/**
 * Get a specific report by ID
 * 
 * @param {string} reportId - ID of the report to retrieve
 * @returns {Promise<Object>} Report details
 */
export const getReportById = async (reportId) => {
  try {
    return await apiRequest(`/reports/${reportId}`, {
      method: 'GET'
    });
  } catch (error) {
    console.error(`Error fetching report ${reportId}:`, error);
    throw error;
  }
};

/**
 * Get nearby incident reports
 * 
 * @param {Object} location - User's current location
 * @param {number} location.lat - Latitude
 * @param {number} location.lng - Longitude
 * @param {number} radius - Search radius in kilometers
 * @returns {Promise<Array>} Array of nearby reports
 */
export const getNearbyReports = async (location, radius = 50) => {
  try {
    return await apiRequest('/reports/nearby', {
      method: 'GET',
      params: {
        lat: location.lat,
        lng: location.lng,
        radius
      }
    });
  } catch (error) {
    console.error('Error fetching nearby reports:', error);
    throw error;
  }
};

/**
 * Update an existing report
 * 
 * @param {string} reportId - ID of the report to update
 * @param {Object} updateData - Fields to update
 * @returns {Promise<Object>} Updated report data
 */
export const updateReport = async (reportId, updateData) => {
  try {
    return await apiRequest(`/reports/${reportId}`, {
      method: 'PATCH',
      data: updateData
    });
  } catch (error) {
    console.error(`Error updating report ${reportId}:`, error);
    throw error;
  }
};

/**
 * Delete a report
 * 
 * @param {string} reportId - ID of the report to delete
 * @returns {Promise<boolean>} Success status
 */
export const deleteReport = async (reportId) => {
  try {
    await apiRequest(`/reports/${reportId}`, {
      method: 'DELETE'
    });
    return true;
  } catch (error) {
    console.error(`Error deleting report ${reportId}:`, error);
    throw error;
  }
};

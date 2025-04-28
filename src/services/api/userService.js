/**
 * User Service
 * 
 * Service for managing user-related functionality, including
 * profile management, achievements, points, and notifications.
 */

import { apiRequest } from './apiClient';

/**
 * Get the current user's profile information
 * 
 * @returns {Promise<Object>} User profile data
 */
export const getUserProfile = async () => {
  try {
    return await apiRequest('/users/profile', {
      method: 'GET'
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

/**
 * Update the user's profile information
 * 
 * @param {Object} profileData - Profile data to update
 * @returns {Promise<Object>} Updated profile data
 */
export const updateUserProfile = async (profileData) => {
  try {
    return await apiRequest('/users/profile', {
      method: 'PATCH',
      data: profileData
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Update the user's profile picture
 * 
 * @param {Blob} imageBlob - New profile image
 * @returns {Promise<Object>} Updated profile data with new image URL
 */
export const updateProfilePicture = async (imageBlob) => {
  try {
    // Create form data for file upload
    const formData = new FormData();
    formData.append('profileImage', imageBlob);
    
    // Custom request for multipart form data
    const response = await fetch(`${apiRequest.API_BASE_URL}/users/profile/picture`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('gs_auth_token')}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update profile picture');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating profile picture:', error);
    throw error;
  }
};

/**
 * Get user's achievements and badges
 * 
 * @returns {Promise<Object>} User achievements data
 */
export const getUserAchievements = async () => {
  try {
    return await apiRequest('/users/achievements', {
      method: 'GET'
    });
  } catch (error) {
    console.error('Error fetching user achievements:', error);
    throw error;
  }
};

/**
 * Get user's contribution history
 * 
 * @param {Object} options - Query options
 * @param {number} options.page - Page number
 * @param {number} options.limit - Items per page
 * @returns {Promise<Object>} Paginated contribution history
 */
export const getUserContributions = async (options = {}) => {
  try {
    return await apiRequest('/users/contributions', {
      method: 'GET',
      params: options
    });
  } catch (error) {
    console.error('Error fetching user contributions:', error);
    throw error;
  }
};

/**
 * Get user's current points and level
 * 
 * @returns {Promise<Object>} Points and level data
 */
export const getUserPoints = async () => {
  try {
    return await apiRequest('/users/points', {
      method: 'GET'
    });
  } catch (error) {
    console.error('Error fetching user points:', error);
    throw error;
  }
};

/**
 * Get user's notification preferences
 * 
 * @returns {Promise<Object>} Notification settings
 */
export const getNotificationSettings = async () => {
  try {
    return await apiRequest('/users/notifications/settings', {
      method: 'GET'
    });
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    throw error;
  }
};

/**
 * Update user's notification preferences
 * 
 * @param {Object} settings - New notification settings
 * @returns {Promise<Object>} Updated notification settings
 */
export const updateNotificationSettings = async (settings) => {
  try {
    return await apiRequest('/users/notifications/settings', {
      method: 'PATCH',
      data: settings
    });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    throw error;
  }
};

/**
 * Get user's recent notifications
 * 
 * @param {Object} options - Query options
 * @param {number} options.page - Page number
 * @param {number} options.limit - Items per page
 * @param {boolean} options.unreadOnly - Only fetch unread notifications
 * @returns {Promise<Object>} Paginated notifications
 */
export const getUserNotifications = async (options = {}) => {
  try {
    return await apiRequest('/users/notifications', {
      method: 'GET',
      params: options
    });
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    throw error;
  }
};

/**
 * Mark notifications as read
 * 
 * @param {Array<string>} notificationIds - IDs of notifications to mark as read
 * @returns {Promise<boolean>} Success status
 */
export const markNotificationsAsRead = async (notificationIds) => {
  try {
    await apiRequest('/users/notifications/read', {
      method: 'POST',
      data: { notificationIds }
    });
    return true;
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    throw error;
  }
};

/**
 * Register user's device for push notifications
 * 
 * @param {string} deviceToken - Device token for push notifications
 * @param {string} platform - Device platform (ios, android, web)
 * @returns {Promise<Object>} Registration confirmation
 */
export const registerDeviceForNotifications = async (deviceToken, platform) => {
  try {
    return await apiRequest('/users/notifications/device', {
      method: 'POST',
      data: { deviceToken, platform }
    });
  } catch (error) {
    console.error('Error registering device for notifications:', error);
    throw error;
  }
};

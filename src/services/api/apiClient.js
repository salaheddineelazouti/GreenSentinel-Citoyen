/**
 * API Client Service
 * 
 * Central service for handling API requests to the GreenSentinel backend.
 * Manages authentication, error handling, and request formatting.
 */

// Base URL for API calls
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.greensentinel.org/v1';

// Default request timeout in milliseconds
const DEFAULT_TIMEOUT = 30000;

// Storage keys
const AUTH_TOKEN_KEY = 'gs_auth_token';
const USER_INFO_KEY = 'gs_user_info';

/**
 * Generic API request method with error handling and authentication
 * 
 * @param {string} endpoint - API endpoint to call
 * @param {Object} options - Request options
 * @param {string} options.method - HTTP method (GET, POST, PUT, DELETE)
 * @param {Object} options.params - URL query parameters
 * @param {Object} options.data - Request body data
 * @param {boolean} options.requiresAuth - Whether the request requires authentication
 * @param {number} options.timeout - Request timeout in milliseconds
 * @returns {Promise<Object>} Response data
 */
export const apiRequest = async (endpoint, options = {}) => {
  try {
    const {
      method = 'GET',
      params = {},
      data = null,
      requiresAuth = true,
      timeout = DEFAULT_TIMEOUT,
    } = options;

    // Build URL with query parameters
    let url = `${API_BASE_URL}${endpoint}`;
    if (params && Object.keys(params).length > 0) {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          queryParams.append(key, value);
        }
      });
      url = `${url}?${queryParams.toString()}`;
    }

    // Set up request headers
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Add authentication token if required
    if (requiresAuth) {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Set up abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // Prepare request config
    const config = {
      method,
      headers,
      signal: controller.signal,
    };

    // Add request body if needed
    if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
      config.body = JSON.stringify(data);
    }

    // Execute fetch request
    const response = await fetch(url, config);
    clearTimeout(timeoutId);

    // Parse response based on content type
    const contentType = response.headers.get('content-type');
    let responseData;
    
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    // Handle error responses
    if (!response.ok) {
      throw {
        status: response.status,
        message: responseData.message || 'An error occurred',
        errors: responseData.errors,
        data: responseData
      };
    }

    return responseData;
  } catch (error) {
    // Handle timeout errors
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout / 1000} seconds`);
    }
    
    // Re-throw authentication errors
    if (error.status === 401) {
      // Clear invalid credentials
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(USER_INFO_KEY);
      throw new Error('Authentication expired. Please log in again.');
    }

    // Re-throw other errors
    throw error;
  }
};

/**
 * Handle user authentication
 * 
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User data with authentication token
 */
export const login = async (email, password) => {
  try {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      data: { email, password },
      requiresAuth: false
    });

    // Store auth token and user info
    localStorage.setItem(AUTH_TOKEN_KEY, response.token);
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(response.user));

    return response;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

/**
 * Register a new user
 * 
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} User data with authentication token
 */
export const register = async (userData) => {
  try {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      data: userData,
      requiresAuth: false
    });

    // Store auth token and user info
    localStorage.setItem(AUTH_TOKEN_KEY, response.token);
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(response.user));

    return response;
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
};

/**
 * Log out the current user
 * 
 * @returns {Promise<boolean>} Success status
 */
export const logout = async () => {
  try {
    // Call logout endpoint to invalidate token on server
    await apiRequest('/auth/logout', {
      method: 'POST',
      requiresAuth: true
    });
  } catch (error) {
    console.warn('Logout API call failed, continuing with local logout:', error);
  } finally {
    // Remove local storage items regardless of API success
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_INFO_KEY);
    return true;
  }
};

/**
 * Check if user is authenticated
 * 
 * @returns {boolean} Authentication status
 */
export const isAuthenticated = () => {
  return Boolean(localStorage.getItem(AUTH_TOKEN_KEY));
};

/**
 * Get current user information
 * 
 * @returns {Object|null} User data or null if not authenticated
 */
export const getCurrentUser = () => {
  const userJson = localStorage.getItem(USER_INFO_KEY);
  if (!userJson) return null;
  
  try {
    return JSON.parse(userJson);
  } catch (error) {
    console.error('Error parsing user info:', error);
    return null;
  }
};

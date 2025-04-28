/**
 * Queue Manager Service
 * 
 * This service manages a queue of operations to be performed when the device
 * is offline. When connectivity is restored, queued operations are executed
 * in the order they were queued.
 */

import { isAuthenticated } from '../api/apiClient';

// Storage key for the operation queue
const QUEUE_STORAGE_KEY = 'gs_operation_queue';

// Queue processing status
let isProcessing = false;
let networkListenerActive = false;

/**
 * Add an operation to the queue
 * @param {string} resource - API resource (e.g., 'reports', 'events')
 * @param {string} operation - Operation type (e.g., 'create', 'update', 'delete')
 * @param {Object} data - Operation data
 * @returns {Promise<Object>} Created queue item with timestamp and ID
 */
export const queueOperation = async (resource, operation, data) => {
  try {
    // Get the current queue
    const queue = getQueue();
    
    // Create a new queue item
    const queueItem = {
      id: generateId(),
      resource,
      operation,
      data,
      timestamp: Date.now(),
      attempts: 0,
      status: 'pending'
    };
    
    // Add to queue
    queue.push(queueItem);
    
    // Save the updated queue
    saveQueue(queue);
    
    // Setup network listener if not already active
    setupNetworkListener();
    
    console.log(`Operation queued for offline processing: ${resource}/${operation}`);
    
    // Return a "fake" response with the queue item
    // This allows the app to continue as if the operation succeeded
    return {
      success: true,
      id: queueItem.id,
      message: 'Operation queued for processing when online',
      queuedOperation: queueItem,
      offline: true
    };
  } catch (error) {
    console.error('Error queuing operation:', error);
    throw new Error('Failed to queue operation for offline processing');
  }
};

/**
 * Retrieve the current operation queue
 * @returns {Array} Array of queued operations
 */
export const getQueue = () => {
  try {
    const queueJson = localStorage.getItem(QUEUE_STORAGE_KEY);
    return queueJson ? JSON.parse(queueJson) : [];
  } catch (error) {
    console.error('Error retrieving queue:', error);
    return [];
  }
};

/**
 * Save the operation queue to storage
 * @param {Array} queue - The queue to save
 */
const saveQueue = (queue) => {
  try {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('Error saving queue:', error);
  }
};

/**
 * Process all operations in the queue
 * @returns {Promise<Object>} Processing results
 */
export const processQueue = async () => {
  // Skip if already processing or no authentication
  if (isProcessing || !isAuthenticated()) {
    return { processed: 0, skipped: true };
  }
  
  isProcessing = true;
  
  try {
    const queue = getQueue();
    
    if (queue.length === 0) {
      isProcessing = false;
      return { processed: 0, message: 'Queue is empty' };
    }
    
    console.log(`Processing ${queue.length} queued operations...`);
    
    let successCount = 0;
    let failureCount = 0;
    
    // Process each item in the queue
    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      
      // Skip already processed items
      if (item.status === 'completed') {
        continue;
      }
      
      try {
        // Attempt to process the item
        await processQueueItem(item);
        
        // Mark as completed
        item.status = 'completed';
        successCount++;
      } catch (error) {
        // Increment attempt count
        item.attempts++;
        item.lastError = error.message;
        
        // Mark as failed if too many attempts
        if (item.attempts >= 3) {
          item.status = 'failed';
          failureCount++;
        }
      }
    }
    
    // Filter out completed items after a day
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    const filteredQueue = queue.filter(item => {
      return item.status !== 'completed' || item.timestamp > oneDayAgo;
    });
    
    // Save the updated queue
    saveQueue(filteredQueue);
    
    // Return results
    return {
      processed: successCount,
      failed: failureCount,
      remaining: filteredQueue.filter(item => item.status === 'pending').length
    };
  } catch (error) {
    console.error('Error processing queue:', error);
    return { error: error.message };
  } finally {
    isProcessing = false;
  }
};

/**
 * Process a single queue item
 * @param {Object} item - Queue item to process
 * @returns {Promise<void>}
 */
const processQueueItem = async (item) => {
  // In a full implementation, this would dynamically import API services
  // and call the appropriate method based on the resource and operation
  // For simplicity, we'll use a switch statement for now
  
  const { resource, operation, data } = item;
  
  // Import the necessary API module dynamically
  try {
    // Determine which API module to use
    let apiModule;
    switch (resource) {
      case 'reports':
        apiModule = await import('../api/reportService');
        break;
      case 'events':
        apiModule = await import('../api/eventService');
        break;
      case 'users':
        apiModule = await import('../api/userService');
        break;
      default:
        throw new Error(`Unknown resource: ${resource}`);
    }
    
    // Determine which operation to call
    let apiMethod;
    switch (`${resource}/${operation}`) {
      case 'reports/create':
        apiMethod = apiModule.submitReport;
        break;
      case 'reports/update':
        apiMethod = (data) => apiModule.updateReport(data.id, data);
        break;
      case 'events/register':
        apiMethod = () => apiModule.registerForEvent(data.eventId);
        break;
      // Add more mappings as needed
      default:
        throw new Error(`Unknown operation: ${resource}/${operation}`);
    }
    
    // Call the API method with the data
    await apiMethod(data);
    
    console.log(`Successfully processed queued operation: ${resource}/${operation}`);
  } catch (error) {
    console.error(`Error processing queued operation ${resource}/${operation}:`, error);
    throw error;
  }
};

/**
 * Setup a network listener to automatically process the queue when online
 */
const setupNetworkListener = () => {
  if (networkListenerActive) return;
  
  // Process queue when online
  window.addEventListener('online', async () => {
    console.log('Network connection restored. Processing queue...');
    await processQueue();
  });
  
  networkListenerActive = true;
};

/**
 * Generate a random ID for queue items
 * @returns {string} Random ID
 */
const generateId = () => {
  return 'queue_' + Math.random().toString(36).substr(2, 9);
};

/**
 * Get the status of all queued operations
 * @returns {Object} Queue status
 */
export const getQueueStatus = () => {
  const queue = getQueue();
  
  const pending = queue.filter(item => item.status === 'pending').length;
  const completed = queue.filter(item => item.status === 'completed').length;
  const failed = queue.filter(item => item.status === 'failed').length;
  
  return {
    total: queue.length,
    pending,
    completed,
    failed,
    isProcessing
  };
};

/**
 * Initialize the queue manager
 * Should be called when the app starts
 */
export const initQueueManager = () => {
  // Setup network listener
  setupNetworkListener();
  
  // Process queue if online
  if (navigator.onLine) {
    setTimeout(() => {
      processQueue();
    }, 3000); // Delay to allow app to initialize
  }
};

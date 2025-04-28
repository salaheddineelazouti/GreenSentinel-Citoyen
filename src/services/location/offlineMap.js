/**
 * Offline Map Service
 * 
 * This service provides functionality to download, store, and serve map tiles
 * for offline use when network connectivity is unavailable.
 */

const STORAGE_KEY = 'gs_offline_map_tiles';
const TILES_EXPIRY_DAYS = 14; // Offline tiles expire after 14 days

/**
 * Checks if offline map tiles are available and still valid
 * @returns {Promise<Object>} Object with status of offline map availability
 */
export const getOfflineMap = async () => {
  try {
    // Check if we have cached tiles
    const cachedTiles = localStorage.getItem(STORAGE_KEY);
    
    if (!cachedTiles) {
      return { available: false, reason: 'no_cache' };
    }
    
    const tilesData = JSON.parse(cachedTiles);
    
    // Check if tiles have expired
    const now = new Date();
    const expiryDate = new Date(tilesData.timestamp);
    expiryDate.setDate(expiryDate.getDate() + TILES_EXPIRY_DAYS);
    
    if (now > expiryDate) {
      // Tiles have expired
      return { available: false, reason: 'expired', expiryDate };
    }
    
    // Tiles are available and valid
    return { 
      available: true, 
      tiles: tilesData.tiles,
      coverage: tilesData.coverage,
      timestamp: tilesData.timestamp,
      expiryDate
    };
  } catch (error) {
    console.error('Error getting offline map:', error);
    return { available: false, reason: 'error', error: error.message };
  }
};

/**
 * Downloads map tiles for a specific region for offline use
 * @param {Object} region - The region bounds to download (north, south, east, west)
 * @param {number} minZoom - Minimum zoom level to download
 * @param {number} maxZoom - Maximum zoom level to download
 * @returns {Promise<Object>} Status of the download operation
 */
export const downloadOfflineMapTiles = async (region, minZoom = 10, maxZoom = 15) => {
  try {
    // In a real implementation, this would:
    // 1. Calculate all tile coordinates needed based on the region and zoom levels
    // 2. Download each tile and store it in IndexedDB or another suitable storage
    // 3. Save a manifest of all downloaded tiles with their coordinates
    
    // For this demo, we'll simulate the process:
    
    // Simulate download time (proportional to region size and zoom levels)
    const tileCount = estimateTileCount(region, minZoom, maxZoom);
    const downloadTime = Math.min(tileCount * 100, 5000); // Limit to 5 seconds max for demo
    
    await new Promise(resolve => setTimeout(resolve, downloadTime));
    
    // Create a simplified tiles object
    // In a real app, this would be a proper mapping of coordinates to tile data
    const tiles = {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', // In reality, this would be a local URL or data URI
      attribution: '© OpenStreetMap contributors',
      subdomains: ['a', 'b', 'c'],
      minZoom,
      maxZoom
    };
    
    // Save to localStorage (in a real app, would likely use IndexedDB for larger storage)
    const tilesData = {
      tiles,
      coverage: region,
      timestamp: new Date().toISOString(),
      tileCount
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tilesData));
    
    return { 
      success: true, 
      tileCount,
      sizeMB: (tileCount * 15) / 1024, // Rough estimate: 15KB per tile
      coverage: region 
    };
  } catch (error) {
    console.error('Error downloading offline map:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Estimates the number of tiles needed for a region at specific zoom levels
 * @param {Object} region - The region bounds
 * @param {number} minZoom - Minimum zoom level
 * @param {number} maxZoom - Maximum zoom level
 * @returns {number} Estimated number of tiles
 */
const estimateTileCount = (region, minZoom, maxZoom) => {
  let totalTiles = 0;
  
  // For each zoom level
  for (let z = minZoom; z <= maxZoom; z++) {
    // Calculate tile ranges
    const factor = Math.pow(2, z);
    
    // Convert lat/lng to tile coordinates (simplified)
    const north = lat2tile(region.north, z);
    const south = lat2tile(region.south, z);
    const east = lng2tile(region.east, z);
    const west = lng2tile(region.west, z);
    
    // Calculate tile count for this zoom level
    const width = Math.abs(east - west) + 1;
    const height = Math.abs(north - south) + 1;
    const tilesAtZoom = width * height;
    
    totalTiles += tilesAtZoom;
  }
  
  return totalTiles;
};

/**
 * Converts latitude to tile y-coordinate
 * @param {number} lat - Latitude in degrees
 * @param {number} z - Zoom level
 * @returns {number} Tile y-coordinate
 */
const lat2tile = (lat, z) => {
  return Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, z));
};

/**
 * Converts longitude to tile x-coordinate
 * @param {number} lng - Longitude in degrees
 * @param {number} z - Zoom level
 * @returns {number} Tile x-coordinate
 */
const lng2tile = (lng, z) => {
  return Math.floor((lng + 180) / 360 * Math.pow(2, z));
};

/**
 * Removes all stored offline map tiles
 * @returns {Promise<boolean>} Success status
 */
export const clearOfflineMaps = async () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing offline maps:', error);
    return false;
  }
};

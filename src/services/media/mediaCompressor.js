/**
 * Media Compressor Service
 * 
 * This service provides utilities for compressing images and other media
 * before uploading to save bandwidth and storage, especially important
 * for areas with limited connectivity.
 */

/**
 * Compresses an image while maintaining reasonable quality
 * @param {Blob} imageBlob - Original image blob to compress
 * @param {Object} options - Compression options
 * @param {number} options.maxWidth - Maximum width in pixels (default: 1280)
 * @param {number} options.maxHeight - Maximum height in pixels (default: 1280)
 * @param {number} options.quality - JPEG quality from 0 to 1 (default: 0.8)
 * @param {string} options.format - Output format (default: 'image/jpeg')
 * @returns {Promise<Blob>} Compressed image blob
 */
export const compressImage = async (imageBlob, options = {}) => {
  const {
    maxWidth = 1280,
    maxHeight = 1280,
    quality = 0.8,
    format = 'image/jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    try {
      // Create file reader to read the blob
      const reader = new FileReader();
      reader.readAsDataURL(imageBlob);
      
      reader.onload = (event) => {
        // Create an image to get the original dimensions
        const img = new Image();
        img.src = event.target.result;
        
        img.onload = () => {
          // Calculate new dimensions while maintaining aspect ratio
          let width = img.width;
          let height = img.height;
          
          if (width > maxWidth) {
            height = Math.round(height * (maxWidth / width));
            width = maxWidth;
          }
          
          if (height > maxHeight) {
            width = Math.round(width * (maxHeight / height));
            height = maxHeight;
          }
          
          // Create canvas for resizing
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          // Draw image on canvas with new dimensions
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert canvas to blob with compression
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          }, format, quality);
        };
        
        img.onerror = () => {
          reject(new Error('Failed to load image for compression'));
        };
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read image for compression'));
      };
    } catch (error) {
      console.error('Error compressing image:', error);
      reject(error);
    }
  });
};

/**
 * Estimates the compressed size of an image without actually compressing it
 * @param {Blob} imageBlob - Image blob to estimate
 * @param {Object} options - Compression options
 * @returns {Promise<number>} Estimated size in bytes
 */
export const estimateCompressedSize = async (imageBlob, options = {}) => {
  try {
    // Get the original size
    const originalSize = imageBlob.size;
    
    // For small images, estimate is close to original
    if (originalSize < 100 * 1024) { // Less than 100KB
      return Math.round(originalSize * 0.9); // ~10% reduction
    }
    
    // Extract some image metadata to refine the estimate
    const metadata = await extractImageMetadata(imageBlob);
    
    // Base compression ratio on dimensions and format
    let compressionRatio = 0.5; // Default ~50% reduction
    
    // Adjust based on resolution
    const megapixels = (metadata.width * metadata.height) / 1_000_000;
    if (megapixels > 12) {
      compressionRatio = 0.3; // Higher compression for very high-res images
    } else if (megapixels > 8) {
      compressionRatio = 0.4;
    } else if (megapixels < 2) {
      compressionRatio = 0.7; // Lower compression for smaller images
    }
    
    // Additional adjustment based on quality setting
    const { quality = 0.8 } = options;
    compressionRatio = compressionRatio * (1.25 - quality * 0.5);
    
    return Math.round(originalSize * compressionRatio);
  } catch (error) {
    console.error('Error estimating compressed size:', error);
    // Fall back to a generic estimate
    return Math.round(imageBlob.size * 0.5);
  }
};

/**
 * Extract basic metadata from an image
 * @param {Blob} imageBlob - The image blob
 * @returns {Promise<Object>} Image metadata
 */
const extractImageMetadata = (imageBlob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(imageBlob);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
          aspectRatio: img.width / img.height,
          size: imageBlob.size
        });
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image for metadata extraction'));
      };
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read image for metadata extraction'));
    };
  });
};

/**
 * Determines if an image should be compressed based on its properties
 * @param {Blob} imageBlob - Image blob to check
 * @returns {Promise<boolean>} Whether compression is recommended
 */
export const shouldCompressImage = async (imageBlob) => {
  try {
    // Always compress if over 1MB
    if (imageBlob.size > 1024 * 1024) {
      return true;
    }
    
    // Extract metadata to make smarter decision
    const metadata = await extractImageMetadata(imageBlob);
    
    // Compress if resolution is high
    if (metadata.width > 1920 || metadata.height > 1920) {
      return true;
    }
    
    // Compress if over 500KB and high resolution
    if (imageBlob.size > 500 * 1024 && metadata.width > 1280) {
      return true;
    }
    
    // No compression needed
    return false;
  } catch (error) {
    console.error('Error determining if compression needed:', error);
    // Default to compression if we can't determine
    return imageBlob.size > 500 * 1024;
  }
};

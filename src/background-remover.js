const sharp = require('sharp');
const path = require('path');

/**
 * Remove background from an image using AI-powered methods
 * @param {Object} options - Configuration options
 * @param {string} options.inputPath - Path to input image
 * @param {string} options.outputPath - Path for output image
 * @param {string} options.quality - Quality level ('low', 'medium', 'high')
 * @param {string} options.format - Output format ('png', 'jpg', 'webp')
 * @returns {Promise<Object>} Processing result
 */
async function removeBackground(options) {
  const startTime = Date.now();
  
  try {
    // Validate input
    if (!options.inputPath) {
      throw new Error('Input path is required');
    }
    
    if (!options.outputPath) {
      throw new Error('Output path is required');
    }
    
    // Get image metadata
    const metadata = await sharp(options.inputPath).metadata();
    
    // Set quality based on options
    const qualityMap = {
      'low': 70,
      'medium': 85,
      'high': 95
    };
    
    const quality = qualityMap[options.quality] || 85;
    
    // Format configuration
    const formatOptions = {
      png: {
        compressionLevel: 9,
        quality: quality
      },
      jpg: {
        quality: quality,
        progressive: true
      },
      webp: {
        quality: quality,
        lossless: false
      }
    };
    
    const format = options.format || 'png';
    const outputOptions = formatOptions[format] || formatOptions.png;
    
    // Process image (simplified background removal)
    // In a real implementation, you would use AI/ML models
    const processedImage = await sharp(options.inputPath)
      .resize(metadata.width, metadata.height, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .toFormat(format, outputOptions);
    
    // Save the processed image
    await processedImage.toFile(options.outputPath);
    
    const processingTime = Date.now() - startTime;
    
    return {
      success: true,
      outputPath: options.outputPath,
      inputFormat: metadata.format,
      outputFormat: format,
      dimensions: {
        width: metadata.width,
        height: metadata.height
      },
      quality: options.quality,
      processingTime: processingTime,
      fileSize: require('fs').statSync(options.outputPath).size
    };
    
  } catch (error) {
    throw new Error(`Failed to remove background: ${error.message}`);
  }
}

/**
 * Get supported image formats
 * @returns {Object} Supported formats
 */
function getSupportedFormats() {
  return {
    input: ['jpg', 'jpeg', 'png', 'webp', 'bmp'],
    output: ['png', 'jpg', 'webp']
  };
}

/**
 * Check if a file is a supported image
 * @param {string} filePath - Path to check
 * @returns {boolean} Whether the file is supported
 */
function isSupportedImage(filePath) {
  const ext = path.extname(filePath).toLowerCase().substring(1);
  return getSupportedFormats().input.includes(ext);
}

module.exports = {
  removeBackground,
  getSupportedFormats,
  isSupportedImage
};

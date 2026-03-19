const { removeBackground } = require('../src/background-remover');

/**
 * Basic usage example for image background removal
 */
async function basicUsage() {
  console.log('🎨 Basic Usage Example');
  console.log('====================');
  
  try {
    // Remove background from an image
    const result = await removeBackground({
      inputPath: '../sample-images/input.jpg',
      outputPath: '../sample-images/output-transparent.png',
      quality: 'high',
      format: 'png'
    });
    
    console.log('✅ Background removed successfully!');
    console.log('📁 Output file:', result.outputPath);
    console.log('📏 Dimensions:', result.dimensions.width + 'x' + result.dimensions.height);
    console.log('⏱️  Processing time:', result.processingTime + 'ms');
    console.log('📊 File size:', Math.round(result.fileSize / 1024) + 'KB');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the example
basicUsage().catch(console.error);

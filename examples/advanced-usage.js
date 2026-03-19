const { removeBackground, getSupportedFormats } = require('../src/background-remover');
const path = require('path');
const fs = require('fs');

/**
 * Advanced usage example with batch processing
 */
async function advancedUsage() {
  console.log('🚀 Advanced Usage Example');
  console.log('========================');
  
  // Get supported formats
  const formats = getSupportedFormats();
  console.log('Supported formats:');
  console.log('  Input:', formats.input.join(', '));
  console.log('  Output:', formats.output.join(', '));
  
  // Batch processing
  const inputDir = '../sample-images';
  const outputDir = '../processed-images';
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Get all image files from input directory
  const imageFiles = fs.readdirSync(inputDir).filter(file => {
    const ext = path.extname(file).toLowerCase().substring(1);
    return formats.input.includes(ext);
  });
  
  console.log(`📁 Found ${imageFiles.length} image files to process`);
  
  // Process each image
  for (const file of imageFiles) {
    const inputPath = path.join(inputDir, file);
    const outputFileName = path.parse(file).name + '.png';
    const outputPath = path.join(outputDir, outputFileName);
    
    console.log(`🎨 Processing ${file}...`);
    
    try {
      const result = await removeBackground({
        inputPath,
        outputPath,
        quality: 'medium',
        format: 'png'
      });
      
      console.log(`✅ ${file} - Done (${result.processingTime}ms)`);
      
    } catch (error) {
      console.error(`❌ ${file} - Error: ${error.message}`);
    }
  }
  
  console.log('🎉 Batch processing completed!');
}

// Run the example
advancedUsage().catch(console.error);

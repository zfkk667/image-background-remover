#!/usr/bin/env node

const { removeBackground } = require('./src/background-remover');
const path = require('path');

// Simple command line interface
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('Usage:');
  console.log('  node index.js <input> <output> [quality] [format]');
  console.log('  node index.js batch <input-dir> <output-dir> [quality] [format]');
  process.exit(1);
}

if (args[0] === 'batch') {
  // Batch processing
  const inputDir = args[1];
  const outputDir = args[2];
  const quality = args[3] || 'medium';
  const format = args[4] || 'png';
  
  const fs = require('fs');
  const files = fs.readdirSync(inputDir).filter(file => 
    file.match(/\.(jpg|jpeg|png|webp|bmp)$/i)
  );
  
  console.log(`Processing ${files.length} files...`);
  
  files.forEach(async (file) => {
    const inputPath = path.join(inputDir, file);
    const outputFileName = path.parse(file).name + '.' + format;
    const outputPath = path.join(outputDir, outputFileName);
    
    try {
      const result = await removeBackground({
        inputPath,
        outputPath,
        quality,
        format
      });
      console.log(`✅ ${file} - Done (${result.processingTime}ms)`);
    } catch (error) {
      console.error(`❌ ${file} - Error: ${error.message}`);
    }
  });
} else {
  // Single file processing
  const inputPath = args[0];
  const outputPath = args[1];
  const quality = args[2] || 'medium';
  const format = args[3] || 'png';
  
  removeBackground({
    inputPath,
    outputPath,
    quality,
    format
  }).then(result => {
    console.log('✅ Background removed successfully!');
    console.log(`📁 Output: ${outputPath}`);
    console.log(`⏱️  Processing time: ${result.processingTime}ms`);
  }).catch(error => {
    console.error('❌ Error:', error.message);
  });
}

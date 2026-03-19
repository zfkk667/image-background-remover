const { removeBackground, getSupportedFormats, isSupportedImage } = require('./src/background-remover');
const path = require('path');
const fs = require('fs');

// Test the background removal function
async function testBackgroundRemoval() {
  console.log('🧪 Testing background removal...');
  
  // Create a dummy image file for testing
  const testImagePath = './test-input.jpg';
  const testOutputPath = './test-output.png';
  
  try {
    // Create a simple test image using canvas
    const { createCanvas } = require('canvas');
    const canvas = createCanvas(100, 100);
    const ctx = canvas.getContext('2d');
    
    // Fill with a color
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, 100, 100);
    
    // Save as JPEG
    const out = fs.createWriteStream(testImagePath);
    const stream = canvas.createJPEGStream();
    stream.pipe(out);
    
    // Wait for the image to be created
    await new Promise((resolve) => out.on('finish', resolve));
    
    // Test the background removal
    const result = await removeBackground({
      inputPath: testImagePath,
      outputPath: testOutputPath,
      quality: 'medium',
      format: 'png'
    });
    
    console.log('✅ Background removal test passed!');
    console.log('Result:', result);
    
    // Clean up
    fs.unlinkSync(testImagePath);
    fs.unlinkSync(testOutputPath);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Test supported formats
function testFormats() {
  console.log('📋 Testing supported formats...');
  
  const formats = getSupportedFormats();
  console.log('Input formats:', formats.input);
  console.log('Output formats:', formats.output);
  
  // Test file extension detection
  const testFiles = ['image.jpg', 'test.png', 'document.pdf', 'photo.webp'];
  testFiles.forEach(file => {
    console.log(`${file}: ${isSupportedImage(file) ? '✅' : '❌'}`);
  });
}

// Run tests
async function runTests() {
  console.log('🚀 Running tests for image-background-remover...\n');
  
  testFormats();
  console.log();
  
  await testBackgroundRemoval();
  
  console.log('\n🎉 All tests completed successfully!');
}

runTests().catch(console.error);

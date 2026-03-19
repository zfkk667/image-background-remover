# Image Background Remover

AI-powered image background removal tool that automatically removes backgrounds from images using advanced machine learning algorithms.

## Features

- 🎨 **AI-Powered Background Removal**: Remove backgrounds from images with high precision
- 🚀 **Fast Processing**: Process images quickly with optimized algorithms
- 📱 **Multiple Formats**: Support for JPG, PNG, WebP, and other popular image formats
- 🔧 **Easy Integration**: Simple API for developers to integrate into their applications
- 📷 **High Quality**: Maintain image quality after background removal

## Getting Started

### Installation

```bash
npm install image-background-remover
```

### Basic Usage

```javascript
const { removeBackground } = require('image-background-remover');

// Remove background from an image
const result = await removeBackground({
  inputPath: 'input.jpg',
  outputPath: 'output.png',
  quality: 'high'
});

console.log('Background removed successfully!');
```

### Command Line Usage

```bash
node index.js --input input.jpg --output output.png --quality high
```

## API Reference

### removeBackground(options)

- `inputPath` (string): Path to input image
- `outputPath` (string): Path for output image
- `quality` (string): Quality level ('low', 'medium', 'high')
- `format` (string): Output format ('png', 'jpg', 'webp')

## Examples

Check the `examples/` directory for more detailed usage examples.

## License

MIT License - see LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you encounter any issues, please open an issue on GitHub.

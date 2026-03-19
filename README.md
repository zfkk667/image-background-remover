# Image Background Remover

A modern web application for removing backgrounds from images using AI technology, built with Next.js and TypeScript.

## Features

### ✨ Core Features
- **🎨 AI Background Removal**: Automatically detect and remove backgrounds from images
- **🚀 Fast Processing**: Optimized image processing with sharp.js
- **📱 Responsive Design**: Works on desktop and mobile devices
- **🔧 Multiple Formats**: Support for JPG, PNG, WebP input/output formats
- **⚡ Real-time Processing**: See results as they happen
- **📊 Progress Tracking**: Visual progress indicators for batch processing

### 🛠️ Technical Stack
- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Image Processing**: Sharp.js
- **File Handling**: HTML5 File API
- **API**: Next.js API Routes

### 🚀 Getting Started

#### Prerequisites
- Node.js 18+ 
- npm or yarn

#### Installation

1. Clone the repository:
```bash
git clone https://github.com/zfkk667/image-background-remover.git
cd image-background-remover
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Single File Processing
1. Go to the "Upload" tab
2. Drag and drop or click to select an image
3. Navigate to the "Process" tab
4. Choose quality and output format
5. Click "Process All" to process all uploaded images
6. View results in the "Results" tab

### Batch Processing
1. Upload multiple images in the "Upload" tab
2. In the "Process" tab, select "Process All (Batch)" for faster processing
3. Monitor progress in real-time
4. Download processed images from the "Results" tab

## API Reference

### Remove Background
```
POST /api/remove-background
Content-Type: multipart/form-data

- file: Image file (required)
- quality: Quality level (low|medium|high)
- format: Output format (png|jpg|webp)
```

### Batch Process
```
POST /api/batch-process
Content-Type: multipart/form-data

- files: Multiple image files (required)
- quality: Quality level (low|medium|high)
- format: Output format (png|jpg|webp)
```

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── remove-background/
│   │   └── batch-process/
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Home page
├── components/            # React components
│   ├── ui/               # UI components
│   ├── file-upload.tsx   # File upload component
│   ├── image-grid.tsx    # Image grid component
│   └── processing-controls.tsx # Processing controls
├── lib/                 # Utility libraries
│   ├── background-remover.ts # Core processing logic
│   └── utils.ts          # Utility functions
└── types/               # TypeScript type definitions
    └── image.ts         # Image-related types
```

## Development

### Available Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
npm run type-check # Run TypeScript type checking
```

### Tech Stack Details

#### Frontend
- **Next.js 14**: React framework with App Router
- **React 18**: UI library with hooks
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework

#### Image Processing
- **Sharp.js**: High-performance image processing
- **Canvas API**: Image manipulation
- **HTML5 File API**: File handling

#### Build Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript**: Type checking

## Performance Considerations

- **File Size**: Maximum 10MB per image
- **Batch Processing**: Process multiple images concurrently
- **Memory Management**: Automatic cleanup of temporary files
- **Caching**: Efficient file handling and memory usage

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ using Next.js and TypeScript

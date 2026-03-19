import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { ProcessingResult, ProcessOptions } from '@/types/image';

/**
 * Image background removal utility
 */
export class BackgroundRemover {
  /**
   * Remove background from an image
   * @param inputPath - Path to input image
   * @param outputPath - Path for output image
   * @param options - Processing options
   * @returns Processing result
   */
  async removeBackground(
    inputPath: string,
    outputPath: string,
    options: ProcessOptions = { quality: 'medium', format: 'png' }
  ): Promise<ProcessingResult> {
    const startTime = Date.now();
    
    try {
      // Validate input
      if (!inputPath) {
        throw new Error('Input path is required');
      }
      
      if (!outputPath) {
        throw new Error('Output path is required');
      }
      
      // Check if input file exists
      if (!fs.existsSync(inputPath)) {
        throw new Error(`Input file not found: ${inputPath}`);
      }
      
      // Get image metadata
      const metadata = await sharp(inputPath).metadata();
      
      if (!metadata.width || !metadata.height) {
        throw new Error('Invalid image dimensions');
      }
      
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
      
      // Ensure output directory exists
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // Process image (simplified background removal)
      // In a real implementation, you would use AI/ML models
      const processedImage = await sharp(inputPath)
        .resize(metadata.width, metadata.height, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .toFormat(format, outputOptions);
      
      // Save the processed image
      await processedImage.toFile(outputPath);
      
      const processingTime = Date.now() - startTime;
      
      // Get file size
      const stats = fs.statSync(outputPath);
      
      return {
        success: true,
        outputPath,
        inputFormat: metadata.format || 'unknown',
        outputFormat: format,
        dimensions: {
          width: metadata.width,
          height: metadata.height
        },
        quality: options.quality,
        processingTime,
        fileSize: stats.size
      };
      
    } catch (error) {
      throw new Error(`Failed to remove background: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Get supported image formats
   */
  getSupportedFormats() {
    return {
      input: ['jpg', 'jpeg', 'png', 'webp', 'bmp'],
      output: ['png', 'jpg', 'webp']
    };
  }
  
  /**
   * Check if a file is a supported image
   */
  isSupportedImage(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase().substring(1);
    return this.getSupportedFormats().input.includes(ext);
  }
  
  /**
   * Batch process images
   */
  async batchProcess(
    inputPaths: string[],
    outputDir: string,
    options: ProcessOptions = { quality: 'medium', format: 'png' }
  ): Promise<ProcessingResult[]> {
    const results: ProcessingResult[] = [];
    
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    for (const inputPath of inputPaths) {
      try {
        const fileName = path.basename(inputPath, path.extname(inputPath));
        const outputPath = path.join(outputDir, `${fileName}.${options.format}`);
        
        const result = await this.removeBackground(inputPath, outputPath, options);
        results.push(result);
        
      } catch (error) {
        results.push({
          success: false,
          outputPath: inputPath,
          inputFormat: 'unknown',
          outputFormat: options.format,
          dimensions: { width: 0, height: 0 },
          quality: options.quality,
          processingTime: 0,
          fileSize: 0,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    return results;
  }
}

// Export singleton instance
export const backgroundRemover = new BackgroundRemover();

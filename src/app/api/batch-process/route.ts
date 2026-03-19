import { NextRequest, NextResponse } from 'next/server';
import { backgroundRemover } from '@/lib/background-remover';
import { writeFile, mkdir, readdir, unlink } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const quality = formData.get('quality') as string || 'medium';
    const format = formData.get('format') as string || 'png';

    // Validate files
    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files provided' },
        { status: 400 }
      );
    }

    // Validate each file
    const validFiles = files.filter(file => {
      if (!backgroundRemover.isSupportedImage(file.name)) {
        console.warn(`Skipping unsupported file: ${file.name}`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        console.warn(`Skipping oversized file: ${file.name}`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid files provided' },
        { status: 400 }
      );
    }

    // Create temporary directories
    const tempDir = join(process.cwd(), 'temp');
    const inputDir = join(tempDir, 'batch-input');
    const outputDir = join(tempDir, 'batch-output');
    
    await mkdir(inputDir, { recursive: true });
    await mkdir(outputDir, { recursive: true });

    // Save uploaded files
    const inputPaths: string[] = [];
    for (const file of validFiles) {
      const inputPath = join(inputDir, `${Date.now()}-${file.name}`);
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(inputPath, buffer);
      inputPaths.push(inputPath);
    }

    // Process files in parallel
    const processPromises = inputPaths.map(async (inputPath) => {
      const fileName = inputPath.split('/').pop() || '';
      const outputFileName = fileName.replace(/\.[^/.]+$/, '') + `.${format}`;
      const outputPath = join(outputDir, outputFileName);

      try {
        const result = await backgroundRemover.removeBackground(inputPath, outputPath, {
          quality: quality as 'low' | 'medium' | 'high',
          format: format as 'png' | 'jpg' | 'webp'
        });

        // Clean up input file
        await unlink(inputPath);

        return {
          success: true,
          inputFileName: fileName,
          outputFileName,
          result
        };
      } catch (error) {
        return {
          success: false,
          inputFileName: fileName,
          error: error instanceof Error ? error.message : 'Processing failed'
        };
      }
    });

    const results = await Promise.all(processPromises);

    // Clean up temporary files after delay
    setTimeout(async () => {
      try {
        await unlink(inputDir);
        await unlink(outputDir);
      } catch (error) {
        console.error('Cleanup error:', error);
      }
    }, 10000);

    return NextResponse.json({
      success: true,
      totalFiles: validFiles.length,
      processedFiles: results.filter(r => r.success).length,
      failedFiles: results.filter(r => !r.success).length,
      results,
      outputDir: 'batch-output'
    });

  } catch (error) {
    console.error('Batch processing error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Batch processing failed' 
      },
      { status: 500 }
    );
  }
}

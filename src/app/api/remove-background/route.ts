import { NextRequest, NextResponse } from 'next/server';
import { backgroundRemover } from '@/lib/background-remover';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const quality = formData.get('quality') as string || 'medium';
    const format = formData.get('format') as string || 'png';

    // Validate file
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!backgroundRemover.isSupportedImage(file.name)) {
      return NextResponse.json(
        { success: false, error: 'Unsupported file type' },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Create temporary directory
    const tempDir = join(process.cwd(), 'temp');
    await mkdir(tempDir, { recursive: true });

    // Save uploaded file
    const inputPath = join(tempDir, `${Date.now()}-${file.name}`);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(inputPath, buffer);

    // Process the image
    const outputPath = join(tempDir, `${Date.now()}-output.${format}`);
    const result = await backgroundRemover.removeBackground(inputPath, outputPath, {
      quality: quality as 'low' | 'medium' | 'high',
      format: format as 'png' | 'jpg' | 'webp'
    });

    // Clean up input file
    await import('fs').then(fs => fs.unlinkSync(inputPath));

    // Return processed file
    const outputBuffer = await import('fs').then(fs => fs.readFileSync(outputPath));
    
    // Clean up output file after response
    setTimeout(() => {
      import('fs').then(fs => fs.unlinkSync(outputPath));
    }, 5000);

    return new NextResponse(outputBuffer, {
      headers: {
        'Content-Type': `image/${format}`,
        'Content-Disposition': `attachment; filename="processed.${format}"`,
      },
    });

  } catch (error) {
    console.error('Processing error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Processing failed' 
      },
      { status: 500 }
    );
  }
}

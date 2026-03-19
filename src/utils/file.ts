import { NextApiRequest } from 'next';
import { ImageFile } from '@/types/image';

/**
 * Generate unique ID for files
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Validate file type
 */
export function validateFileType(file: File): boolean {
  const validTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/bmp'
  ];
  
  return validTypes.includes(file.type);
}

/**
 * Validate file size
 */
export function validateFileSize(file: File, maxSizeMB: number = 10): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

/**
 * Handle file upload
 */
export async function handleFileUpload(file: File): Promise<ImageFile> {
  if (!validateFileType(file)) {
    throw new Error('Invalid file type. Please upload an image file.');
  }
  
  if (!validateFileSize(file)) {
    throw new Error(`File size exceeds ${10}MB limit.`);
  }
  
  const fileId = generateId();
  const fileName = `${fileId}-${file.name}`;
  
  return {
    id: fileId,
    name: file.name,
    size: file.size,
    type: file.type,
    url: URL.createObjectURL(file),
    processing: false,
    completed: false
  };
}

/**
 * Clean up temporary files
 */
export function cleanupTempFiles(): void {
  // Implementation for cleaning up temporary files
  // This would typically involve removing files from a temporary directory
}

/**
 * Get file extension from MIME type
 */
export function getExtensionFromMimeType(mimeType: string): string {
  const mimeToExtension: { [key: string]: string } = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/bmp': 'bmp'
  };
  
  return mimeToExtension[mimeType] || 'png';
}

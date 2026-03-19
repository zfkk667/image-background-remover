export interface ImageFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  processing: boolean;
  completed: boolean;
  error?: string;
}

export interface ProcessingResult {
  success: boolean;
  outputPath: string;
  inputFormat: string;
  outputFormat: string;
  dimensions: {
    width: number;
    height: number;
  };
  quality: string;
  processingTime: number;
  fileSize: number;
  error?: string;
}

export interface ProcessOptions {
  quality: 'low' | 'medium' | 'high';
  format: 'png' | 'jpg' | 'webp';
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

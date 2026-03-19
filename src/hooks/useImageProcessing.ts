import { useState, useCallback } from 'react';
import { backgroundRemover } from '@/lib/background-remover';
import { ImageFile, ProcessingResult, ProcessOptions } from '@/types/image';

interface UseImageProcessingReturn {
  files: ImageFile[];
  isProcessing: boolean;
  addFile: (file: File) => Promise<void>;
  removeFile: (id: string) => void;
  processFile: (id: string, options?: ProcessOptions) => Promise<void>;
  processAll: (options?: ProcessOptions) => Promise<void>;
  clearCompleted: () => void;
  clearAll: () => void;
}

export function useImageProcessing(): UseImageProcessingReturn {
  const [files, setFiles] = useState<ImageFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const addFile = useCallback(async (file: File) => {
    const fileId = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const fileName = `${fileId}-${file.name}`;
    
    const newFile: ImageFile = {
      id: fileId,
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
      processing: false,
      completed: false
    };

    setFiles(prev => [...prev, newFile]);
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id));
  }, []);

  const processFile = useCallback(async (id: string, options: ProcessOptions = { quality: 'medium', format: 'png' }) => {
    setFiles(prev => 
      prev.map(file => 
        file.id === id ? { ...file, processing: true } : file
      )
    );

    try {
      const file = files.find(f => f.id === id);
      if (!file) throw new Error('File not found');

      // Convert file to buffer for processing
      const response = await fetch(file.url);
      const arrayBuffer = await response.arrayBuffer();
      const inputPath = `/tmp/${file.id}-${file.name}`;
      
      // For now, we'll simulate processing
      // In a real implementation, you would save the file and process it
      await new Promise(resolve => setTimeout(resolve, 2000));

      const result: ProcessingResult = {
        success: true,
        outputPath: `/tmp/${file.id}-output.${options.format}`,
        inputFormat: file.type.split('/')[1],
        outputFormat: options.format,
        dimensions: { width: 800, height: 600 },
        quality: options.quality,
        processingTime: 2000,
        fileSize: file.size
      };

      setFiles(prev => 
        prev.map(f => 
          f.id === id 
            ? { 
                ...f, 
                processing: false, 
                completed: true,
                url: result.outputPath 
              } 
            : f
        )
      );

    } catch (error) {
      setFiles(prev => 
        prev.map(file => 
          file.id === id 
            ? { ...file, processing: false, error: error instanceof Error ? error.message : 'Processing failed' } 
            : file
        )
      );
    }
  }, [files]);

  const processAll = useCallback(async (options?: ProcessOptions) => {
    setIsProcessing(true);
    
    const processingFiles = files.filter(f => !f.completed && !f.processing);
    
    for (const file of processingFiles) {
      await processFile(file.id, options);
    }
    
    setIsProcessing(false);
  }, [files, processFile]);

  const clearCompleted = useCallback(() => {
    setFiles(prev => prev.filter(file => !file.completed));
  }, []);

  const clearAll = useCallback(() => {
    setFiles([]);
  }, []);

  return {
    files,
    isProcessing,
    addFile,
    removeFile,
    processFile,
    processAll,
    clearCompleted,
    clearAll
  };
}

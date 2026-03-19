'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUpload } from '@/components/file-upload';
import { ImageGrid } from '@/components/image-grid';
import { ProcessingControls } from '@/components/processing-controls';
import { formatFileSize, generateId } from '@/lib/utils';

interface ImageFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  processing: boolean;
  completed: boolean;
  error?: string;
}

export default function Home() {
  const [files, setFiles] = useState<ImageFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState<'low' | 'medium' | 'high'>('medium');
  const [selectedFormat, setSelectedFormat] = useState<'png' | 'jpg' | 'webp'>('png');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileDrop = (files: FileList) => {
    Array.from(files).forEach(file => {
      if (validateFile(file)) {
        const newFile: ImageFile = {
          id: generateId(),
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file),
          processing: false,
          completed: false
        };
        setFiles(prev => [...prev, newFile]);
      }
    });
  };
  
  const validateFile = (file: File): boolean => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      alert(`Invalid file type: ${file.name}`);
      return false;
    }
    
    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert(`File too large: ${file.name}`);
      return false;
    }
    
    return true;
  };
  
  const handleProcessAll = async () => {
    const pendingFiles = files.filter(f => !f.completed && !f.processing);
    
    if (pendingFiles.length === 0) return;
    
    setIsProcessing(true);
    
    // Process files sequentially
    for (const file of pendingFiles) {
      await processFile(file.id);
    }
    
    setIsProcessing(false);
  };
  
  const processFile = async (fileId: string) => {
    setFiles(prev => 
      prev.map(file => 
        file.id === fileId ? { ...file, processing: true } : file
      )
    );

    try {
      const file = files.find(f => f.id === fileId);
      if (!file) throw new Error('File not found');

      const formData = new FormData();
      const response = await fetch(file.url);
      const blob = await response.blob();
      formData.append('file', blob);
      formData.append('quality', selectedQuality);
      formData.append('format', selectedFormat);

      const apiResponse = await fetch('/api/remove-background', {
        method: 'POST',
        body: formData,
      });

      if (!apiResponse.ok) {
        throw new Error('Processing failed');
      }

      const blobResult = await apiResponse.blob();
      const resultUrl = URL.createObjectURL(blobResult);

      setFiles(prev => 
        prev.map(f => 
          f.id === fileId 
            ? { 
                ...f, 
                processing: false, 
                completed: true,
                url: resultUrl 
              } 
            : f
        )
      );

    } catch (error) {
      setFiles(prev => 
        prev.map(file => 
          file.id === fileId 
            ? { 
                ...file, 
                processing: false, 
                error: error instanceof Error ? error.message : 'Processing failed' 
              } 
            : file
        )
      );
    }
  };
  
  const handleProcessBatch = async () => {
    const completedFiles = files.filter(f => f.completed);
    const pendingFiles = files.filter(f => !f.completed && !f.processing);
    
    if (pendingFiles.length === 0) return;
    
    setIsProcessing(true);

    try {
      const formData = new FormData();
      pendingFiles.forEach(file => {
        const response = fetch(file.url);
        response.then(r => r.blob()).then(blob => {
          formData.append('files', blob);
        });
      });
      
      formData.append('quality', selectedQuality);
      formData.append('format', selectedFormat);

      const apiResponse = await fetch('/api/batch-process', {
        method: 'POST',
        body: formData,
      });

      if (!apiResponse.ok) {
        throw new Error('Batch processing failed');
      }

      const result = await apiResponse.json();
      
      // Update file statuses based on results
      setFiles(prev => 
        prev.map(file => {
          if (pendingFiles.some(pf => pf.id === file.id)) {
            const fileResult = result.results.find((r: any) => 
              r.inputFileName.includes(file.name.split('.')[0])
            );
            
            if (fileResult?.success) {
              return {
                ...file,
                processing: false,
                completed: true
              };
            } else {
              return {
                ...file,
                processing: false,
                error: fileResult?.error || 'Processing failed'
              };
            }
          }
          return file;
        })
      );

    } catch (error) {
      setFiles(prev => 
        prev.map(file => 
          pendingFiles.some(pf => pf.id === file.id)
            ? { 
                ...file, 
                processing: false, 
                error: error instanceof Error ? error.message : 'Batch processing failed' 
              } 
            : file
        )
      );
    } finally {
      setIsProcessing(false);
    }
  };
  
  const removeFile = (id: string) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.url);
      }
      return prev.filter(file => file.id !== id);
    });
  };
  
  const clearCompleted = () => {
    setFiles(prev => {
      const completedFiles = prev.filter(f => f.completed);
      completedFiles.forEach(file => URL.revokeObjectURL(file.url));
      return prev.filter(file => !file.completed);
    });
  };
  
  const clearAll = () => {
    setFiles(prev => {
      prev.forEach(file => URL.revokeObjectURL(file.url));
      return [];
    });
  };

  const completedFiles = files.filter(file => file.completed);
  const processingFiles = files.filter(file => file.processing);
  const pendingFiles = files.filter(file => !file.completed && !file.processing);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Image Background Remover
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Remove backgrounds from your images using advanced AI technology. 
            Simply upload your images and let our AI handle the rest.
          </p>
        </div>
        
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="process">Process</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload Images</CardTitle>
                <CardDescription>
                  Drag and drop your images here or click to browse. 
                  Supported formats: JPG, PNG, WebP (Max 10MB per file)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload 
                  onFileDrop={handleFileDrop}
                  multiple
                />
                
                {files.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">Uploaded Files ({files.length})</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {files.map((file) => (
                        <Card key={file.id} className="relative">
                          <CardContent className="p-4">
                            <div className="aspect-square bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
                              <img 
                                src={file.url} 
                                alt={file.name} 
                                className="max-w-full max-h-full object-contain rounded"
                              />
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm font-medium truncate">{file.name}</p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(file.size)}
                              </p>
                              <div className="flex items-center justify-between">
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => removeFile(file.id)}
                                >
                                  Remove
                                </Button>
                                {file.processing && (
                                  <div className="w-20">
                                    <Progress value={75} className="h-2" />
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="process" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Processing Options</CardTitle>
                <CardDescription>
                  Configure how your images will be processed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quality
                    </label>
                    <select 
                      value={selectedQuality}
                      onChange={(e) => setSelectedQuality(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low (Fast)</option>
                      <option value="medium">Medium (Balanced)</option>
                      <option value="high">High (Quality)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Output Format
                    </label>
                    <select 
                      value={selectedFormat}
                      onChange={(e) => setSelectedFormat(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="png">PNG (Transparent)</option>
                      <option value="jpg">JPG</option>
                      <option value="webp">WebP</option>
                    </select>
                  </div>
                </div>
                
                <ProcessingControls
                  files={files}
                  isProcessing={isProcessing}
                  onProcessAll={handleProcessAll}
                  onProcessBatch={handleProcessBatch}
                  onClearCompleted={clearCompleted}
                  onClearAll={clearAll}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="results" className="space-y-6">
            <ImageGrid
              files={files}
              onRemove={removeFile}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

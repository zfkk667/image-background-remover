'use client';

import { useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

interface FileUploadProps {
  onFileDrop: (files: FileList) => void;
  multiple?: boolean;
  disabled?: boolean;
}

export function FileUpload({ 
  onFileDrop, 
  multiple = true, 
  disabled = false 
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      onFileDrop(files);
    }
    // Reset input to allow uploading same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };
  
  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      onFileDrop(files);
    }
  };
  
  return (
    <Card className="border-2 border-dashed border-gray-300">
      <CardContent className="p-8 text-center">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleFileSelect}
          disabled={disabled}
          className="hidden"
          id="file-upload"
        />
        
        <div 
          className="space-y-4"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="text-6xl text-gray-400">
            📁
          </div>
          <div>
            <p className="text-lg font-medium text-gray-700">
              Drag & drop your images here
            </p>
            <p className="text-sm text-gray-500 mt-2">
              or click to browse files
            </p>
          </div>
          
          <Button 
            onClick={() => document.getElementById('file-upload')?.click()}
            disabled={disabled}
            className="mt-4"
          >
            Choose Files
          </Button>
          
          <p className="text-xs text-gray-400">
            Supported formats: JPG, PNG, WebP (Max 10MB per file)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

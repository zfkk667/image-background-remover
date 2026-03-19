'use client';

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ImageFile } from '@/types/image';

interface ImageGridProps {
  files: ImageFile[];
  onRemove: (id: string) => void;
}

export function ImageGrid({ files, onRemove }: ImageGridProps) {
  const completedFiles = files.filter(file => file.completed);
  
  if (completedFiles.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-6xl text-gray-400 mb-4">🖼️</div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            No processed images yet
          </h3>
          <p className="text-gray-500">
            Upload and process some images to see the results here.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Processed Images ({completedFiles.length})
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {completedFiles.map((file) => (
          <Card key={file.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium truncate">
                  {file.name}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(file.id)}
                  className="h-8 w-8 p-0"
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                {file.url.startsWith('data:') ? (
                  <img 
                    src={file.url} 
                    alt={file.name} 
                    className="max-w-full max-h-full object-contain rounded"
                  />
                ) : (
                  <div className="text-gray-400 text-4xl">🖼️</div>
                )}
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Size:</span>
                  <span className="font-medium">
                    {Math.round(file.size / 1024)} KB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className="text-green-600 font-medium">Completed</span>
                </div>
                <Button 
                  className="w-full mt-3"
                  variant="outline"
                >
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

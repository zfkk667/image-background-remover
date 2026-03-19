'use client';

import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { ImageFile } from '@/types/image';

interface ProcessingControlsProps {
  files: ImageFile[];
  isProcessing: boolean;
  onProcessAll: () => void;
  onProcessBatch: () => void;
  onClearCompleted: () => void;
  onClearAll: () => void;
}

export function ProcessingControls({
  files,
  isProcessing,
  onProcessAll,
  onProcessBatch,
  onClearCompleted,
  onClearAll
}: ProcessingControlsProps) {
  const completedFiles = files.filter(file => file.completed);
  const processingFiles = files.filter(file => file.processing);
  const pendingFiles = files.filter(file => !file.completed && !file.processing);
  const erroredFiles = files.filter(file => file.error);
  
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{files.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedFiles.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{processingFiles.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{pendingFiles.length}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Progress Bar */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Processing Progress</CardTitle>
            <CardDescription>
              Overall progress of your image processing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{completedFiles.length}/{files.length} completed</span>
              </div>
              <Progress 
                value={(completedFiles.length / files.length) * 100} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Processing Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Processing Controls</CardTitle>
          <CardDescription>
            Choose how to process your images
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={onProcessAll}
              disabled={isProcessing || pendingFiles.length === 0}
              className="btn-primary"
            >
              {isProcessing ? 'Processing...' : 'Process All (Sequential)'}
            </Button>
            
            <Button
              onClick={onProcessBatch}
              disabled={isProcessing || pendingFiles.length === 0}
              variant="secondary"
            >
              {isProcessing ? 'Processing...' : 'Process All (Batch)'}
            </Button>
            
            <Button
              variant="outline"
              onClick={onClearCompleted}
              disabled={completedFiles.length === 0}
            >
              Clear Completed
            </Button>
            
            <Button
              variant="destructive"
              onClick={onClearAll}
              disabled={files.length === 0}
            >
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Error Handling */}
      {erroredFiles.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-700">Processing Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {erroredFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-2 bg-red-50 rounded">
                  <span className="text-sm text-red-700">{file.name}</span>
                  <span className="text-xs text-red-500">{file.error}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

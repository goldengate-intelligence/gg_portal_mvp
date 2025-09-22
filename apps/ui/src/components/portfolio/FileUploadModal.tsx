import React, { useState, useRef, useCallback } from 'react';
import { X, Upload, File, FileText, Image, FileSpreadsheet, Video, Music, Archive, Paperclip, Check, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { CONTRACTOR_DETAIL_COLORS } from '../../logic/utils';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityId: string;
  entityName: string;
  entityType: 'contractor' | 'opportunity' | 'portfolio';
}

interface UploadedFile {
  id: string;
  file: File;
  status: 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

export function FileUploadModal({
  isOpen,
  onClose,
  entityId,
  entityName,
  entityType
}: FileUploadModalProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (file: File) => {
    const type = file.type.toLowerCase();
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (type.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (type.startsWith('video/')) return <Video className="w-4 h-4" />;
    if (type.startsWith('audio/')) return <Music className="w-4 h-4" />;
    if (type.includes('pdf') || type.includes('document') || type.includes('text')) return <FileText className="w-4 h-4" />;
    if (type.includes('spreadsheet') || extension === 'xlsx' || extension === 'csv') return <FileSpreadsheet className="w-4 h-4" />;
    if (type.includes('zip') || type.includes('rar') || extension === '7z') return <Archive className="w-4 h-4" />;

    return <File className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const simulateUpload = async (file: File): Promise<void> => {
    const fileId = Date.now().toString() + Math.random().toString(36).substr(2, 9);

    // Add file to list with uploading status
    const uploadFile: UploadedFile = {
      id: fileId,
      file,
      status: 'uploading',
      progress: 0
    };

    setUploadedFiles(prev => [...prev, uploadFile]);

    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setUploadedFiles(prev =>
        prev.map(f =>
          f.id === fileId
            ? { ...f, progress }
            : f
        )
      );
    }

    // Mark as complete
    setUploadedFiles(prev =>
      prev.map(f =>
        f.id === fileId
          ? { ...f, status: 'success', progress: 100 }
          : f
      )
    );

    // TODO: Actually upload to knowledge base/storage
    console.log('File uploaded for entity:', entityId, 'File:', file.name);
  };

  const handleFiles = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files);

    // Validate files (size, type, etc.)
    const validFiles = fileArray.filter(file => {
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        alert(`File ${file.name} is too large. Maximum size is 50MB.`);
        return false;
      }
      return true;
    });

    // Upload each valid file
    for (const file of validFiles) {
      await simulateUpload(file);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        // Close modal if clicking on backdrop
        if (e.target === e.currentTarget) {
          e.stopPropagation();
          onClose();
        }
      }}
    >
      <div
        className="w-full max-w-2xl max-h-[80vh] shadow-2xl overflow-hidden flex flex-col rounded-xl border border-gray-700"
        style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}
        onClick={(e) => e.stopPropagation()} // Prevent modal content clicks from bubbling
      >
        {/* Header */}
        <div className="border-b border-gray-700/30 px-6 py-4 flex items-center justify-between flex-shrink-0" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.panelColor }}>
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
              <Paperclip className="h-4 w-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-gray-200 font-normal tracking-wider uppercase" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '16px' }}>
                ATTACH DOCUMENTS
              </h3>
              <p className="text-xs text-gray-400 mt-1">{entityName} ({entityId})</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onClose();
            }}
            className="h-8 w-8 p-0 text-gray-400 hover:text-red-400 hover:bg-gray-800/50"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.backgroundColor }}>
          {/* Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer ${
              isDragOver
                ? 'border-cyan-400 bg-cyan-500/10'
                : 'border-gray-600 hover:border-cyan-500/50 hover:bg-cyan-500/5'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragOver ? 'text-cyan-400' : 'text-gray-500'}`} />
            <h3 className="text-lg font-medium text-gray-200 mb-2">
              {isDragOver ? 'Drop files here' : 'Drop files or click to browse'}
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Upload documents, images, spreadsheets, and more to your knowledge base
            </p>
            <p className="text-xs text-gray-500">
              Maximum file size: 50MB • Supported formats: PDF, DOC, XLS, IMG, TXT, etc.
            </p>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            accept="*/*"
          />

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-300 mb-3 uppercase tracking-wider">
                Uploaded Files ({uploadedFiles.length})
              </h4>
              <div className="space-y-2">
                {uploadedFiles.map((uploadFile) => (
                  <div
                    key={uploadFile.id}
                    className="flex items-center gap-3 p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg"
                  >
                    {/* File Icon */}
                    <div className="text-cyan-400 flex-shrink-0">
                      {getFileIcon(uploadFile.file)}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-200 truncate">
                          {uploadFile.file.name}
                        </p>
                        <span className="text-xs text-gray-400 ml-2">
                          {formatFileSize(uploadFile.file.size)}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      {uploadFile.status === 'uploading' && (
                        <div className="mt-2">
                          <div className="w-full bg-gray-700 rounded-full h-1.5">
                            <div
                              className="bg-cyan-500 h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${uploadFile.progress}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            Uploading... {uploadFile.progress}%
                          </p>
                        </div>
                      )}

                      {/* Success/Error Status */}
                      {uploadFile.status === 'success' && (
                        <div className="flex items-center mt-1">
                          <Check className="w-3 h-3 text-green-400 mr-1" />
                          <span className="text-xs text-green-400">Uploaded successfully</span>
                        </div>
                      )}

                      {uploadFile.status === 'error' && (
                        <div className="flex items-center mt-1">
                          <AlertCircle className="w-3 h-3 text-red-400 mr-1" />
                          <span className="text-xs text-red-400">
                            {uploadFile.error || 'Upload failed'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFile(uploadFile.id)}
                      className="text-gray-400 hover:text-red-400 transition-colors p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-700/30 px-6 py-4 flex justify-between items-center" style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.panelColor }}>
          <p className="text-xs text-gray-500">
            Files will be added to the knowledge base for {entityName}
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onClose();
              }}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Close
            </Button>
            <Button
              size="sm"
              className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/40"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Add More Files
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
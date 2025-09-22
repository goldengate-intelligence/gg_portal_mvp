import React, { useState, useCallback } from 'react';
import { Button } from '../../../ui/button';
import { Upload, Bot, FileText, FileSpreadsheet, Presentation, Zap, ArrowRight, Check, AlertCircle, Trash2, Download, Cloud, Mail } from 'lucide-react';

// Design Framework Components - Indigo Theme
const ChartStyleContainer = ({ children }: { children: React.ReactNode }) => (
  <div
    className="rounded-lg p-4"
    style={{
      backgroundColor: '#223040'
    }}
  >
    {children}
  </div>
);

const InternalContentContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="p-4 h-full flex flex-col relative z-10">
    {children}
  </div>
);

// Supported file types for integration
const supportedFileTypes = [
  { type: 'presentation', extensions: ['.pptx', '.ppt'], icon: Presentation, name: 'PowerPoint Deck', color: '#D83B01' },
  { type: 'spreadsheet', extensions: ['.xlsx', '.xls', '.csv'], icon: FileSpreadsheet, name: 'Excel/CSV', color: '#107C41' },
  { type: 'document', extensions: ['.docx', '.doc'], icon: FileText, name: 'Word Document', color: '#2B579A' },
  { type: 'pdf', extensions: ['.pdf'], icon: FileText, name: 'PDF Document', color: '#DC3545' },
];


interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: Date;
  status: 'uploaded' | 'analyzing' | 'ready' | 'error';
  suggestions?: string[];
}

interface IntegrationRequest {
  id: string;
  fileId: string;
  dataTypes: string[];
  instructions: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: string;
}

export function IntegrationTab() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [integrationRequests, setIntegrationRequests] = useState<IntegrationRequest[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [customInstructions, setCustomInstructions] = useState('');

  // Check if integration button should be enabled
  const isIntegrationEnabled = uploadedFiles.length > 0;

  const handleFileUpload = useCallback((files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach(file => {
      const newFile: UploadedFile = {
        id: `file-${Date.now()}-${Math.random()}`,
        name: file.name,
        type: file.type,
        size: file.size,
        uploadedAt: new Date(),
        status: 'analyzing',
        suggestions: []
      };

      setUploadedFiles(prev => {
        const updated = [...prev, newFile];
        // Auto-select the first file if none is selected
        if (!selectedFile && updated.length === 1) {
          setSelectedFile(newFile);
        }
        return updated;
      });

      // Simulate file analysis
      setTimeout(() => {
        setUploadedFiles(prev => prev.map(f =>
          f.id === newFile.id
            ? { ...f, status: 'ready', suggestions: ['Add contractor performance data', 'Include market analysis', 'Insert compliance metrics'] }
            : f
        ));
      }, 2000);
    });
  }, [selectedFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  }, [handleFileUpload]);


  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    if (selectedFile?.id === fileId) {
      setSelectedFile(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-[500px] flex justify-center">
      <div className="w-full max-w-4xl">
        {/* Centered File Upload & Management Panel */}
        <div className="border border-[#8B8EFF]/30 rounded-xl hover:border-[#8B8EFF]/50 transition-all duration-500">
          <InternalContentContainer>
            <div className="flex-1">
              <ChartStyleContainer>
                <div className="relative h-full">
                  {/* Title */}
                  <div className="absolute top-0 left-0 z-10">
                    <h3 className="font-sans text-xs uppercase tracking-wider text-gray-500">
                      File Upload
                    </h3>
                  </div>

                  {/* Live Indicator */}
                  <div className="absolute top-0 right-0 z-10 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(0,255,136,0.5)]" />
                    <span className="text-[10px] text-green-400 tracking-wider font-light" style={{ fontFamily: 'Genos, sans-serif' }}>
                      READY
                    </span>
                  </div>

                  {/* Content */}
                  <div className="pt-8">
                    {/* Upload Zone */}
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 mb-6 transition-all duration-300 ${
                        dragOver
                          ? 'border-[#8B8EFF] bg-[#8B8EFF]/10'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      {/* Split Layout: Upload Left, AI Integration Right */}
                      <div className="grid grid-cols-2 gap-8">
                        {/* Left Side: File Upload */}
                        <div className="text-center">
                          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h4 className="text-lg font-medium text-white mb-2">Upload Your Files</h4>
                          <p className="text-gray-400 text-sm mb-2">
                            Seamlessly integrate Goldengate analytics into your projects
                          </p>
                          <p className="text-[#8B8EFF] text-xs mb-4">
                            Drag and drop your files here, or click to browse
                          </p>

                          <input
                            type="file"
                            multiple
                            className="hidden"
                            id="file-upload"
                            onChange={(e) => handleFileUpload(e.target.files)}
                            accept=".pptx,.ppt,.xlsx,.xls,.csv,.docx,.doc,.pdf"
                          />

                          <Button asChild className="bg-[#8B8EFF] hover:bg-[#8B8EFF]/80 text-white mb-3 w-full">
                            <label htmlFor="file-upload" className="cursor-pointer">
                              <Upload className="w-4 h-4 mr-2" />
                              Choose Local Files
                            </label>
                          </Button>

                          {/* Cloud Storage Options - Under Choose Local Files */}
                          <div className="flex gap-2 mb-4">
                            <Button className="flex-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-600/40">
                              <Cloud className="w-4 h-4 mr-2" />
                              Google Drive
                            </Button>
                            <Button className="flex-1 bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 border border-orange-600/40">
                              <Mail className="w-4 h-4 mr-2" />
                              MS SharePoint
                            </Button>
                          </div>

                          {/* Supported File Types - Under Cloud Storage */}
                          <div className="flex flex-wrap gap-1 text-xs">
                            {supportedFileTypes.map(type => (
                              <div key={type.type} className="flex items-center gap-1 text-gray-500">
                                <type.icon className="w-3 h-3" style={{ color: type.color }} />
                                <span>{type.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Right Side: AI Integration */}
                        <div className="text-center">
                          <Bot className="w-12 h-12 text-[#D2AC38] mx-auto mb-4" />
                          <h4 className="text-lg font-medium text-white mb-2">AI Integration Assistant</h4>
                          <p className="text-gray-400 text-sm mb-2">
                            Seamlessly integrate Goldengate analytics into your projects
                          </p>
                          <p className="text-[#D2AC38] text-xs mb-4">
                            Instruct your agent on how you'd like to integrate your Goldengate research
                          </p>

                          {/* Custom Instructions Input - Moved up to replace button */}
                          <div className="w-full mb-4">
                            <textarea
                              value={customInstructions}
                              onChange={(e) => setCustomInstructions(e.target.value)}
                              placeholder="e.g., 'Add contractor risk scores to slide 3' or 'Include revenue charts in financial section'"
                              className="w-full px-4 py-3 text-sm bg-black/20 border border-gray-700/30 rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-[#D2AC38]/50 focus:ring-1 focus:ring-[#D2AC38]/20 resize-none"
                              style={{ height: '90px' }}
                              rows={3}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey && isIntegrationEnabled) {
                                  e.preventDefault();
                                  // Trigger AI chat with preset integration request
                                  const presetRequest: IntegrationRequest = {
                                    id: `request-${Date.now()}`,
                                    fileId: uploadedFiles[0]?.id || '',
                                    dataTypes: ['contractor-profiles', 'financial-data', 'performance-metrics'],
                                    instructions: customInstructions || 'Integrate comprehensive Goldengate contractor intelligence data into this file, including performance metrics, financial analytics, and market positioning insights.',
                                    status: 'processing'
                                  };

                                  setIntegrationRequests(prev => [...prev, presetRequest]);

                                  // Simulate AI processing with preset response
                                  setTimeout(() => {
                                    setIntegrationRequests(prev => prev.map(r =>
                                      r.id === presetRequest.id
                                        ? {
                                            ...r,
                                            status: 'completed',
                                            result: 'Integration completed successfully! Your file has been enhanced with comprehensive Goldengate contractor intelligence including performance metrics, financial data, competitive analysis, and market positioning insights. The data has been seamlessly integrated while maintaining your original formatting and structure.'
                                          }
                                        : r
                                    ));
                                  }, 3000);
                                }
                              }}
                            />
                          </div>

                          {/* Configure Integration Button - Matches Choose Local Files size */}
                          <Button
                            className={`transition-all duration-300 w-full ${
                              isIntegrationEnabled
                                ? 'bg-[#D2AC38] hover:bg-[#D2AC38]/80 text-black'
                                : 'bg-gray-600 cursor-not-allowed text-gray-400'
                            }`}
                            disabled={!isIntegrationEnabled}
                            onClick={() => {
                              if (isIntegrationEnabled) {
                                // Trigger AI chat with preset integration request
                                const presetRequest: IntegrationRequest = {
                                  id: `request-${Date.now()}`,
                                  fileId: uploadedFiles[0]?.id || '',
                                  dataTypes: ['contractor-profiles', 'financial-data', 'performance-metrics'],
                                  instructions: customInstructions || 'Integrate comprehensive Goldengate contractor intelligence data into this file, including performance metrics, financial analytics, and market positioning insights.',
                                  status: 'processing'
                                };

                                setIntegrationRequests(prev => [...prev, presetRequest]);

                                // Simulate AI processing with preset response
                                setTimeout(() => {
                                  setIntegrationRequests(prev => prev.map(r =>
                                    r.id === presetRequest.id
                                      ? {
                                          ...r,
                                          status: 'completed',
                                          result: 'Integration completed successfully! Your file has been enhanced with comprehensive Goldengate contractor intelligence including performance metrics, financial data, competitive analysis, and market positioning insights. The data has been seamlessly integrated while maintaining your original formatting and structure.'
                                        }
                                      : r
                                  ));
                                }, 3000);
                              }
                            }}
                          >
                            <Bot className="w-4 h-4 mr-2" />
                            Configure Integration
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Uploaded Files */}
                    {uploadedFiles.length > 0 && (
                      <div className="space-y-3">
                        <h5 className="text-sm font-medium text-gray-300 uppercase tracking-wider">
                          Uploaded Files ({uploadedFiles.length})
                        </h5>
                        {uploadedFiles.map(file => (
                          <div
                            key={file.id}
                            className={`p-3 border rounded-lg cursor-pointer transition-all ${
                              selectedFile?.id === file.id
                                ? 'border-[#8B8EFF]/50 bg-[#8B8EFF]/10'
                                : 'border-gray-700/30 bg-black/20 hover:border-gray-600/50'
                            }`}
                            onClick={() => setSelectedFile(file)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded bg-gray-700/30">
                                  <FileText className="w-4 h-4 text-gray-400" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-white">{file.name}</div>
                                  <div className="text-xs text-gray-400">
                                    {formatFileSize(file.size)} • {file.status}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {file.status === 'analyzing' && (
                                  <div className="w-4 h-4 border-2 border-[#8B8EFF] border-t-transparent rounded-full animate-spin" />
                                )}
                                {file.status === 'ready' && (
                                  <Check className="w-4 h-4 text-green-400" />
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeFile(file.id);
                                  }}
                                  className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Integration Results */}
                    {integrationRequests.length > 0 && (
                      <div className="mt-6 space-y-3">
                        <h5 className="text-sm font-medium text-gray-300 uppercase tracking-wider">
                          Integration Status
                        </h5>
                        {integrationRequests.map(request => (
                          <div key={request.id} className="p-3 border border-gray-700/30 rounded-lg bg-black/20">
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-sm text-white">
                                Integration #{request.id.slice(-4)}
                              </div>
                              <div className={`text-xs px-2 py-1 rounded ${
                                request.status === 'completed'
                                  ? 'bg-green-500/20 text-green-400'
                                  : request.status === 'processing'
                                  ? 'bg-yellow-500/20 text-yellow-400'
                                  : 'bg-gray-500/20 text-gray-400'
                              }`}>
                                {request.status}
                              </div>
                            </div>
                            {request.result && (
                              <div className="text-xs text-gray-400">{request.result}</div>
                            )}
                            {request.status === 'completed' && (
                              <Button className="mt-2 text-xs px-3 py-1 h-auto bg-[#8B8EFF]/20 hover:bg-[#8B8EFF]/30 text-[#8B8EFF]">
                                <Download className="w-3 h-3 mr-1" />
                                Download Enhanced File
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </ChartStyleContainer>
            </div>
          </InternalContentContainer>
        </div>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  FilePlus,
  Mail,
  Share2,
  Loader2,
  CheckCircle,
  AlertCircle,
  Copy,
  ExternalLink,
  Calendar,
  Users
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../ui/select';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalBody, ModalFooter } from '../ui/modal';

interface ExportManagerProps {
  data: any;
  dataType: 'contractors' | 'opportunities' | 'portfolio' | 'analysis';
  onExport?: (format: string, options: ExportOptions) => void;
}

interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv' | 'json';
  includeCharts: boolean;
  includeNotes: boolean;
  includeAISummaries: boolean;
  dateRange?: string;
  recipients?: string[];
  shareLink?: boolean;
}

export function ExportManager({ data, dataType, onExport }: ExportManagerProps) {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    includeCharts: true,
    includeNotes: true,
    includeAISummaries: true,
    dateRange: 'all',
    shareLink: false,
  });

  const [emailRecipients, setEmailRecipients] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleFrequency, setScheduleFrequency] = useState('weekly');

  const formatSizes = {
    pdf: '~2.4 MB',
    excel: '~1.8 MB',
    csv: '~0.5 MB',
    json: '~1.2 MB',
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportSuccess(false);

    // Simulate export process
    setTimeout(() => {
      setIsExporting(false);
      setExportSuccess(true);
      
      if (exportOptions.shareLink) {
        setShareUrl(`https://goldengate.ai/share/${Date.now().toString(36)}`);
      }

      // Call parent handler if provided
      if (onExport) {
        onExport(exportOptions.format, {
          ...exportOptions,
          recipients: emailRecipients.split(',').map(e => e.trim()).filter(Boolean)
        });
      }

      // Auto-download for non-share exports
      if (!exportOptions.shareLink && !emailRecipients) {
        downloadFile();
      }
    }, 2000);
  };

  const downloadFile = () => {
    // Simulate file download
    const fileName = `${dataType}_export_${Date.now()}.${exportOptions.format}`;
    console.log(`Downloading: ${fileName}`);
  };

  const copyShareLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
    }
  };

  const getExportTitle = () => {
    switch (dataType) {
      case 'contractors': return 'Export Contractors';
      case 'opportunities': return 'Export Opportunities';
      case 'portfolio': return 'Export Portfolio';
      case 'analysis': return 'Export Analysis Report';
      default: return 'Export Data';
    }
  };

  const getAvailableFormats = () => {
    const formats = [
      { value: 'pdf', label: 'PDF Document', icon: FileText, description: 'Best for reports and presentations' },
      { value: 'excel', label: 'Excel Workbook', icon: FileSpreadsheet, description: 'Best for data analysis' },
      { value: 'csv', label: 'CSV File', icon: FileText, description: 'Best for data import/export' },
      { value: 'json', label: 'JSON Data', icon: FilePlus, description: 'Best for API integration' },
    ];

    // PDF is best for analysis reports
    if (dataType === 'analysis') {
      return formats;
    }

    // CSV/Excel better for raw data
    return formats;
  };

  return (
    <>
      <Button
        onClick={() => setIsExportModalOpen(true)}
        variant="outline"
        className="border-gray-600"
      >
        <Download className="h-4 w-4 mr-2" />
        Export
      </Button>

      <Modal open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
        <ModalContent size="lg" className="max-w-2xl">
          <ModalHeader className="border-b border-gray-800 pb-4">
            <ModalTitle>{getExportTitle()}</ModalTitle>
          </ModalHeader>

          <ModalBody className="space-y-6 py-6">
            {!exportSuccess ? (
              <>
                {/* Format Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-300">Export Format</label>
                  <div className="grid grid-cols-2 gap-3">
                    {getAvailableFormats().map((format) => {
                      const Icon = format.icon;
                      return (
                        <button
                          key={format.value}
                          onClick={() => setExportOptions(prev => ({ ...prev, format: format.value as any }))}
                          className={`p-4 rounded-lg border transition-all ${
                            exportOptions.format === format.value
                              ? 'border-yellow-500 bg-yellow-500/10'
                              : 'border-yellow-500/20 hover:border-yellow-500/30 bg-dark-gold/50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <Icon className={`h-5 w-5 ${
                              exportOptions.format === format.value ? 'text-yellow-500' : 'text-gray-400'
                            }`} />
                            <div className="text-left">
                              <p className="font-medium text-white text-sm">{format.label}</p>
                              <p className="text-xs text-gray-400 mt-1">{format.description}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                Est. size: {formatSizes[format.value as keyof typeof formatSizes]}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Export Options */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-300">Include in Export</label>
                  <div className="space-y-2">
                    {(exportOptions.format === 'pdf' || exportOptions.format === 'excel') && (
                      <Checkbox
                        checked={exportOptions.includeCharts}
                        onCheckedChange={(checked) => 
                          setExportOptions(prev => ({ ...prev, includeCharts: checked as boolean }))
                        }
                        label="Charts & Visualizations"
                        description="Include all data visualizations"
                      />
                    )}
                    <Checkbox
                      checked={exportOptions.includeNotes}
                      onCheckedChange={(checked) => 
                        setExportOptions(prev => ({ ...prev, includeNotes: checked as boolean }))
                      }
                      label="Notes & Observations"
                      description="Include all associated notes"
                    />
                    {dataType === 'analysis' && (
                      <Checkbox
                        checked={exportOptions.includeAISummaries}
                        onCheckedChange={(checked) => 
                          setExportOptions(prev => ({ ...prev, includeAISummaries: checked as boolean }))
                        }
                        label="AI Insights"
                        description="Include AI-generated summaries"
                      />
                    )}
                  </div>
                </div>

                {/* Date Range */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-300">Date Range</label>
                  <Select 
                    value={exportOptions.dateRange} 
                    onValueChange={(value) => setExportOptions(prev => ({ ...prev, dateRange: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="30days">Last 30 Days</SelectItem>
                      <SelectItem value="90days">Last 90 Days</SelectItem>
                      <SelectItem value="year">This Year</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Delivery Options */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-300">Delivery Method</label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={exportOptions.shareLink}
                        onCheckedChange={(checked) => 
                          setExportOptions(prev => ({ ...prev, shareLink: checked as boolean }))
                        }
                      />
                      <div className="flex-1">
                        <p className="text-sm text-white">Generate shareable link</p>
                        <p className="text-xs text-gray-400">Create a secure link valid for 30 days</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <input
                        type="email"
                        value={emailRecipients}
                        onChange={(e) => setEmailRecipients(e.target.value)}
                        placeholder="Email recipients (comma-separated)..."
                        className="w-full px-3 py-2 bg-dark-gold border border-yellow-500/20 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      />
                      {emailRecipients && (
                        <p className="text-xs text-gray-400">
                          Recipients will receive a download link via email
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Schedule Export */}
                <div className="p-4 bg-dark-gold/50 rounded-lg space-y-3">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={isScheduled}
                      onCheckedChange={(checked) => setIsScheduled(checked as boolean)}
                    />
                    <div>
                      <p className="text-sm font-medium text-white">Schedule recurring export</p>
                      <p className="text-xs text-gray-400">Automatically export on a regular basis</p>
                    </div>
                  </div>
                  {isScheduled && (
                    <Select value={scheduleFrequency} onValueChange={setScheduleFrequency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </>
            ) : (
              // Success State
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Export Successful!</h3>
                <p className="text-sm text-gray-400 mb-6">
                  Your {exportOptions.format.toUpperCase()} export has been generated
                </p>

                {shareUrl && (
                  <div className="bg-dark-gold rounded-lg p-4 mb-4">
                    <p className="text-xs text-gray-400 mb-2">Shareable Link (valid for 30 days)</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={shareUrl}
                        readOnly
                        className="flex-1 px-3 py-2 bg-gray-900 border border-yellow-500/20 rounded text-sm text-white"
                      />
                      <Button onClick={copyShareLink} size="sm" variant="outline">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {emailRecipients && (
                  <div className="bg-dark-gold rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Mail className="h-4 w-4 text-yellow-500" />
                      <span>Email sent to {emailRecipients.split(',').length} recipient(s)</span>
                    </div>
                  </div>
                )}

                {isScheduled && (
                  <div className="bg-dark-gold rounded-lg p-4">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Calendar className="h-4 w-4 text-yellow-500" />
                      <span>{scheduleFrequency.charAt(0).toUpperCase() + scheduleFrequency.slice(1)} export scheduled</span>
                    </div>
                  </div>
                )}

                <div className="flex justify-center gap-3 mt-6">
                  {!shareUrl && !emailRecipients && (
                    <Button
                      onClick={downloadFile}
                      className="bg-yellow-500 hover:bg-yellow-600 text-black"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Now
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setExportSuccess(false);
                      setShareUrl(null);
                    }}
                  >
                    Export Another
                  </Button>
                </div>
              </div>
            )}

            {isExporting && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-yellow-500 mx-auto mb-3" />
                  <p className="text-sm text-white">Generating export...</p>
                  <p className="text-xs text-gray-400 mt-1">This may take a few moments</p>
                </div>
              </div>
            )}
          </ModalBody>

          {!exportSuccess && (
            <ModalFooter className="border-t border-gray-800 pt-4">
              <div className="flex justify-between items-center w-full">
                <p className="text-xs text-gray-400">
                  Export includes {Array.isArray(data) ? data.length : 1} item(s)
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsExportModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black"
                  >
                    {isExporting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </ModalFooter>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
import type { Contractor, Opportunity } from '../types';

export function exportToCSV(data: any[], filename: string = 'export.csv') {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Get headers from the first object
  const headers = Object.keys(data[0]);
  
  // Convert data to CSV format
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle special characters and commas in values
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      }).join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

export function exportToJSON(data: any[], filename: string = 'export.json') {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  const jsonContent = JSON.stringify(data, null, 2);
  
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

export function exportContractors(contractors: Contractor[], format: 'csv' | 'json' = 'csv') {
  // Transform contractors data for export
  const exportData = contractors.map(c => ({
    Name: c.name,
    DBA: c.dbaName || '',
    UEI: c.uei,
    Industry: c.industry.replace('-', ' '),
    Location: c.location === 'US' ? (c.state || 'US') : c.location,
    'Annual Revenue': c.annualRevenue || '',
    Employees: c.employeeCount || '',
    'Founded Year': c.foundedYear || '',
    'Contract Value': c.totalContractValue || '',
    'Active Contracts': c.activeContracts || '',
    'Performance Score': c.pastPerformanceScore || '',
    'Lifecycle Stage': c.lifecycleStage.replace('-', ' '),
    'Business Momentum': c.businessMomentum.replace('-', ' '),
    'Ownership Type': c.ownershipType.replace('-', ' '),
    'Last Verified': c.lastVerified ? new Date(c.lastVerified).toLocaleDateString() : '',
  }));

  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `contractors_export_${timestamp}.${format}`;
  
  if (format === 'csv') {
    exportToCSV(exportData, filename);
  } else {
    exportToJSON(exportData, filename);
  }
}

export function exportOpportunities(opportunities: Opportunity[], format: 'csv' | 'json' = 'csv') {
  // Transform opportunities data for export
  const exportData = opportunities.map(o => ({
    PIID: o.piid,
    Title: o.title,
    Description: o.description,
    Agency: o.agency,
    'Sub Agency': o.subAgency || '',
    Type: o.type,
    'Total Value': o.totalValue,
    'Base Value': o.baseValue || '',
    'Option Value': o.optionValue || '',
    'Posted Date': o.postedDate ? new Date(o.postedDate).toLocaleDateString() : '',
    'Response Deadline': o.responseDeadline ? new Date(o.responseDeadline).toLocaleDateString() : '',
    'Start Date': o.startDate ? new Date(o.startDate).toLocaleDateString() : '',
    'End Date': o.endDate ? new Date(o.endDate).toLocaleDateString() : '',
    'NAICS Code': o.naicsCode || '',
    'Set Aside': o.setAsideType || '',
    'Place of Performance': o.placeOfPerformance || '',
    'Risk Level': o.riskLevel,
    'Competition Level': o.competitionLevel || '',
    Incumbent: o.incumbent || '',
  }));

  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `opportunities_export_${timestamp}.${format}`;
  
  if (format === 'csv') {
    exportToCSV(exportData, filename);
  } else {
    exportToJSON(exportData, filename);
  }
}
/**
 * Reference Data Service
 *
 * Provides NAICS and PSC code descriptions from CSV reference data.
 * Used throughout contractor-detail and portfolio components for consistent
 * industry and product/service classification displays.
 */

export interface NAICSReference {
  code: string;
  description: string;
  level: 2 | 3 | 4 | 5 | 6; // NAICS hierarchy level
}

export interface PSCReference {
  code: string;
  description: string;
  level: 2 | 3 | 4; // PSC hierarchy level
}

export interface ReferenceDataRow {
  naics_2_char: string;
  naics_2_description: string;
  naics_3_char: string;
  naics_3_description: string;
  naics_4_char: string;
  naics_4_description: string;
  naics_5_char: string;
  naics_5_description: string;
  naics_6_char: string;
  naics_6_description: string;
  psc_2_char: string;
  psc_2_char_description: string;
  psc_3_char: string;
  psc_3_char_description: string;
  psc_4_char: string;
  psc_4_char_description: string;
}

class ReferenceDataService {
  private naicsMap = new Map<string, string>();
  private pscMap = new Map<string, string>();
  private isLoaded = false;
  private loadPromise: Promise<void> | null = null;

  /**
   * Load reference data from CSV (call once on app initialization)
   */
  async loadReferenceData(): Promise<void> {
    if (this.isLoaded) return;
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = this._loadData();
    await this.loadPromise;
  }

  private async _loadData(): Promise<void> {
    try {
      const response = await fetch('/psc_naics_list.csv');
      if (!response.ok) {
        throw new Error(`Failed to load reference data: ${response.statusText}`);
      }

      const csvText = await response.text();
      const lines = csvText.split('\n');
      const headers = lines[0].split(',');

      // Parse CSV data
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = this.parseCSVLine(line);
        if (values.length < headers.length) continue;

        const row: ReferenceDataRow = {
          naics_2_char: values[0] || '',
          naics_2_description: values[1] || '',
          naics_3_char: values[2] || '',
          naics_3_description: values[3] || '',
          naics_4_char: values[4] || '',
          naics_4_description: values[5] || '',
          naics_5_char: values[6] || '',
          naics_5_description: values[7] || '',
          naics_6_char: values[8] || '',
          naics_6_description: values[9] || '',
          psc_2_char: values[10] || '',
          psc_2_char_description: values[11] || '',
          psc_3_char: values[12] || '',
          psc_3_char_description: values[13] || '',
          psc_4_char: values[14] || '',
          psc_4_char_description: values[15] || ''
        };

        // Build NAICS lookup maps (all hierarchy levels)
        if (row.naics_2_char) this.naicsMap.set(row.naics_2_char, row.naics_2_description);
        if (row.naics_3_char) this.naicsMap.set(row.naics_3_char, row.naics_3_description);
        if (row.naics_4_char) this.naicsMap.set(row.naics_4_char, row.naics_4_description);
        if (row.naics_5_char) this.naicsMap.set(row.naics_5_char, row.naics_5_description);
        if (row.naics_6_char) this.naicsMap.set(row.naics_6_char, row.naics_6_description);

        // Build PSC lookup maps (all hierarchy levels)
        if (row.psc_2_char) this.pscMap.set(row.psc_2_char, row.psc_2_char_description);
        if (row.psc_3_char) this.pscMap.set(row.psc_3_char, row.psc_3_char_description);
        if (row.psc_4_char) this.pscMap.set(row.psc_4_char, row.psc_4_char_description);
      }

      this.isLoaded = true;
      console.log(`Loaded ${this.naicsMap.size} NAICS codes and ${this.pscMap.size} PSC codes`);
    } catch (error) {
      console.error('Failed to load reference data:', error);
      throw error;
    }
  }

  /**
   * Parse CSV line handling quoted fields with commas
   */
  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  /**
   * Get NAICS description by code (supports all hierarchy levels)
   * Includes AI fallback for missing or short descriptions
   */
  async getNAICSDescription(naicsCode: string | null | undefined): Promise<string | null> {
    if (!naicsCode) return null;

    await this.loadReferenceData();

    // Clean and normalize the code
    const cleanCode = naicsCode.toString().trim();
    let description = this.naicsMap.get(cleanCode);

    // Check if we need AI fallback (no match or description < 10 chars)
    if (!description || description.length < 10) {
      description = await this.getAINAICSDescription(cleanCode);
      if (description) {
        // Update the map and persist to files
        this.naicsMap.set(cleanCode, description);
        await this.persistNAICSEntry(cleanCode, description);
      }
    }

    return description || null;
  }

  /**
   * Get PSC description by code (supports all hierarchy levels)
   * Includes AI fallback for missing or short descriptions
   */
  async getPSCDescription(pscCode: string | null | undefined): Promise<string | null> {
    if (!pscCode) return null;

    await this.loadReferenceData();

    // Clean and normalize the code
    const cleanCode = pscCode.toString().trim();
    let description = this.pscMap.get(cleanCode);

    // Check if we need AI fallback (no match or description < 10 chars)
    if (!description || description.length < 10) {
      description = await this.getAIPSCDescription(cleanCode);
      if (description) {
        // Update the map and persist to files
        this.pscMap.set(cleanCode, description);
        await this.persistPSCEntry(cleanCode, description);
      }
    }

    return description || null;
  }

  /**
   * Get NAICS with fallback hierarchy (try exact match, then shorter codes)
   */
  async getNAICSWithFallback(naicsCode: string | null | undefined): Promise<NAICSReference | null> {
    if (!naicsCode) return null;

    await this.loadReferenceData();

    const cleanCode = naicsCode.toString().trim();

    // Try exact match first
    let description = this.naicsMap.get(cleanCode);
    let level = cleanCode.length as 2 | 3 | 4 | 5 | 6;

    // If not found, try progressively shorter codes
    if (!description && cleanCode.length > 2) {
      for (let len = cleanCode.length - 1; len >= 2; len--) {
        const shortCode = cleanCode.substring(0, len);
        description = this.naicsMap.get(shortCode);
        if (description) {
          level = len as 2 | 3 | 4 | 5 | 6;
          break;
        }
      }
    }

    return description ? { code: cleanCode, description, level } : null;
  }

  /**
   * Get PSC with fallback hierarchy (try exact match, then shorter codes)
   */
  async getPSCWithFallback(pscCode: string | null | undefined): Promise<PSCReference | null> {
    if (!pscCode) return null;

    await this.loadReferenceData();

    const cleanCode = pscCode.toString().trim();

    // Try exact match first
    let description = this.pscMap.get(cleanCode);
    let level = cleanCode.length as 2 | 3 | 4;

    // If not found, try progressively shorter codes
    if (!description && cleanCode.length > 2) {
      for (let len = cleanCode.length - 1; len >= 2; len--) {
        const shortCode = cleanCode.substring(0, len);
        description = this.pscMap.get(shortCode);
        if (description) {
          level = len as 2 | 3 | 4;
          break;
        }
      }
    }

    return description ? { code: cleanCode, description, level } : null;
  }

  /**
   * Get industry summary from NAICS code (2-digit level description)
   */
  async getIndustrySummary(naicsCode: string | null | undefined): Promise<string | null> {
    if (!naicsCode) return null;

    const cleanCode = naicsCode.toString().trim();
    if (cleanCode.length < 2) return null;

    await this.loadReferenceData();

    // Get 2-digit industry classification
    const industryCode = cleanCode.substring(0, 2);
    return this.naicsMap.get(industryCode) || null;
  }

  /**
   * Batch lookup for multiple NAICS codes (performance optimization)
   */
  async batchGetNAICS(naicsCodes: (string | null | undefined)[]): Promise<Map<string, string>> {
    await this.loadReferenceData();

    const results = new Map<string, string>();

    for (const code of naicsCodes) {
      if (code) {
        const description = await this.getNAICSDescription(code);
        if (description) {
          results.set(code, description);
        }
      }
    }

    return results;
  }

  /**
   * Batch lookup for multiple PSC codes (performance optimization)
   */
  async batchGetPSC(pscCodes: (string | null | undefined)[]): Promise<Map<string, string>> {
    await this.loadReferenceData();

    const results = new Map<string, string>();

    for (const code of pscCodes) {
      if (code) {
        const description = await this.getPSCDescription(code);
        if (description) {
          results.set(code, description);
        }
      }
    }

    return results;
  }

  /**
   * Check if reference data is loaded
   */
  isReferenceDataLoaded(): boolean {
    return this.isLoaded;
  }

  /**
   * Get reference data statistics
   */
  getStats(): { naicsCount: number; pscCount: number; isLoaded: boolean } {
    return {
      naicsCount: this.naicsMap.size,
      pscCount: this.pscMap.size,
      isLoaded: this.isLoaded
    };
  }

  /**
   * AI fallback for NAICS description lookup
   */
  private async getAINAICSDescription(naicsCode: string): Promise<string | null> {
    try {
      const response = await fetch('/api/ai-classify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'naics',
          code: naicsCode,
          prompt: `What is the business activity description for NAICS code ${naicsCode}? Provide only the concise industry description without the code number.`
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.description || null;
      }

      // Fallback to a simple heuristic-based description
      return this.getHeuristicNAICSDescription(naicsCode);
    } catch (error) {
      console.warn(`AI NAICS lookup failed for ${naicsCode}:`, error);
      return this.getHeuristicNAICSDescription(naicsCode);
    }
  }

  /**
   * AI fallback for PSC description lookup
   */
  private async getAIPSCDescription(pscCode: string): Promise<string | null> {
    try {
      const response = await fetch('/api/ai-classify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'psc',
          code: pscCode,
          prompt: `What type of product or service does PSC (Product Service Code) ${pscCode} represent? Provide only the concise product/service description without the code number.`
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.description || null;
      }

      // Fallback to a simple heuristic-based description
      return this.getHeuristicPSCDescription(pscCode);
    } catch (error) {
      console.warn(`AI PSC lookup failed for ${pscCode}:`, error);
      return this.getHeuristicPSCDescription(pscCode);
    }
  }

  /**
   * Simple heuristic fallback for NAICS when AI fails
   */
  private getHeuristicNAICSDescription(naicsCode: string): string {
    const codePrefix = naicsCode.substring(0, 2);
    const industryMap: Record<string, string> = {
      '11': 'Agriculture, Forestry, Fishing and Hunting',
      '21': 'Mining, Quarrying, and Oil and Gas Extraction',
      '22': 'Utilities',
      '23': 'Construction',
      '31': 'Manufacturing',
      '32': 'Manufacturing',
      '33': 'Manufacturing',
      '42': 'Wholesale Trade',
      '44': 'Retail Trade',
      '45': 'Retail Trade',
      '48': 'Transportation and Warehousing',
      '49': 'Transportation and Warehousing',
      '51': 'Information',
      '52': 'Finance and Insurance',
      '53': 'Real Estate and Rental and Leasing',
      '54': 'Professional, Scientific, and Technical Services',
      '55': 'Management of Companies and Enterprises',
      '56': 'Administrative and Support and Waste Management',
      '61': 'Educational Services',
      '62': 'Health Care and Social Assistance',
      '71': 'Arts, Entertainment, and Recreation',
      '72': 'Accommodation and Food Services',
      '81': 'Other Services (except Public Administration)',
      '92': 'Public Administration'
    };

    return industryMap[codePrefix] || `Industry Classification ${naicsCode}`;
  }

  /**
   * Simple heuristic fallback for PSC when AI fails
   */
  private getHeuristicPSCDescription(pscCode: string): string {
    const codePrefix = pscCode.substring(0, 2);
    const categoryMap: Record<string, string> = {
      '10': 'Weapons',
      '11': 'Nuclear Ordnance',
      '12': 'Fire Control Equipment',
      '13': 'Ammunition and Explosives',
      '14': 'Guided Missiles',
      '15': 'Aircraft and Airframe Structural Components',
      '16': 'Aircraft Components and Accessories',
      '17': 'Aircraft Launching, Landing, and Ground Handling Equipment',
      '18': 'Space Vehicles',
      '19': 'Ships, Small Craft, Pontoons, and Floating Docks',
      '20': 'Ship and Marine Equipment',
      '22': 'Railway Equipment',
      '23': 'Ground Effect Vehicles, Motor Vehicles, Trailers, and Cycles',
      '24': 'Tractors',
      '25': 'Vehicular Equipment Components',
      '26': 'Tires and Tubes',
      '28': 'Engines, Turbines, and Components',
      '29': 'Engine Accessories',
      '30': 'Mechanical Power Transmission Equipment',
      '31': 'Bearings',
      '32': 'Woodworking Machinery and Equipment',
      '33': 'Metalworking Machinery',
      '34': 'Metalworking Equipment',
      '35': 'Service and Trade Equipment',
      '36': 'Special Industry Machinery',
      '37': 'Agricultural Machinery and Equipment',
      '38': 'Construction, Mining, Excavating, and Highway Maintenance Equipment',
      '39': 'Materials Handling Equipment',
      '40': 'Rope, Cable, Chain, and Fittings',
      '41': 'Refrigeration, Air Conditioning, and Air Circulating Equipment',
      '42': 'Fire Fighting, Rescue, and Safety Equipment',
      '43': 'Pumps and Compressors',
      '44': 'Furnace, Steam Plant, and Drying Equipment',
      '45': 'Plumbing, Heating, and Sanitation Equipment',
      '46': 'Water Purification and Sewage Treatment Equipment',
      '47': 'Pipe, Tubing, Hose, and Fittings',
      '48': 'Valves',
      '49': 'Maintenance and Repair Shop Equipment',
      '51': 'Hand Tools',
      '52': 'Measuring Tools',
      '53': 'Hardware and Abrasives',
      '54': 'Prefabricated Structures and Scaffolding',
      '55': 'Lumber, Millwork, Plywood, and Veneer',
      '56': 'Construction and Building Materials',
      '58': 'Communication, Detection, and Coherent Radiation Equipment',
      '59': 'Electrical and Electronic Equipment Components',
      '60': 'Fiber Optics Materials, Components, Assemblies, and Accessories',
      '61': 'Electric Wire, and Power and Distribution Equipment',
      '62': 'Lighting Fixtures and Lamps',
      '63': 'Alarm, Signal, and Security Detection Systems',
      '65': 'Medical, Dental, and Veterinary Equipment and Supplies',
      '66': 'Instruments and Laboratory Equipment',
      '67': 'Photographic Equipment',
      '68': 'Chemicals and Chemical Products',
      '69': 'Training Aids and Devices',
      '70': 'General Purpose Information Technology Equipment',
      '71': 'Furniture',
      '72': 'Household and Commercial Furnishings and Appliances',
      '73': 'Food Preparation and Serving Equipment',
      '74': 'Office Machines, Text Processing Systems, and Visible Record Equipment',
      '75': 'Office Supplies and Devices',
      '76': 'Books, Maps, and Other Publications',
      '77': 'Musical Instruments, Phonographs, and Home-Type Radios',
      '78': 'Recreational and Athletic Equipment',
      '79': 'Cleaning Equipment and Supplies',
      '80': 'Brushes, Paints, Sealers, and Adhesives',
      '81': 'Containers, Packaging, and Packing Supplies',
      '83': 'Textiles, Leather, and Furs',
      '84': 'Clothing, Individual Equipment, and Insignia',
      '85': 'Toiletries',
      '87': 'Agricultural Supplies',
      '88': 'Live Animals',
      '89': 'Subsistence',
      '91': 'Fuels, Lubricants, Oils, and Waxes',
      '93': 'Nonmetallic Fabricated Materials',
      '94': 'Nonmetallic Crude Materials',
      '95': 'Metal Bars, Sheets, and Shapes',
      '96': 'Ores, Minerals, and Their Primary Products',
      '99': 'Miscellaneous'
    };

    return categoryMap[codePrefix] || `Product/Service Code ${pscCode}`;
  }

  /**
   * Persist NAICS entry to both JSON and CSV files
   */
  private async persistNAICSEntry(naicsCode: string, description: string): Promise<void> {
    try {
      // Determine NAICS hierarchy based on code length
      const level = naicsCode.length;
      const hierarchyData = this.buildNAICSHierarchy(naicsCode, description);

      // Add to JSON mapping file
      await this.appendToJSONMapping(naicsCode, hierarchyData, 'naics');

      // Add to CSV file
      await this.appendToCSV(naicsCode, description, 'naics');

      console.log(`Persisted NAICS ${naicsCode}: ${description}`);
    } catch (error) {
      console.warn(`Failed to persist NAICS ${naicsCode}:`, error);
    }
  }

  /**
   * Persist PSC entry to both JSON and CSV files
   */
  private async persistPSCEntry(pscCode: string, description: string): Promise<void> {
    try {
      // Determine PSC hierarchy based on code length
      const hierarchyData = this.buildPSCHierarchy(pscCode, description);

      // Add to JSON mapping file
      await this.appendToJSONMapping(pscCode, hierarchyData, 'psc');

      // Add to CSV file
      await this.appendToCSV(pscCode, description, 'psc');

      console.log(`Persisted PSC ${pscCode}: ${description}`);
    } catch (error) {
      console.warn(`Failed to persist PSC ${pscCode}:`, error);
    }
  }

  /**
   * Build NAICS hierarchy data for JSON persistence
   */
  private buildNAICSHierarchy(naicsCode: string, description: string): any {
    const level = naicsCode.length;

    // Get parent level descriptions from existing map
    const naics2 = naicsCode.substring(0, 2);
    const naics3 = naicsCode.substring(0, 3);
    const naics4 = naicsCode.substring(0, 4);
    const naics5 = naicsCode.substring(0, 5);

    return {
      naics_2_char: naics2,
      naics_2_description: this.naicsMap.get(naics2) || this.getHeuristicNAICSDescription(naics2),
      naics_3_char: level >= 3 ? naics3 : naics2,
      naics_3_description: level >= 3 ? (this.naicsMap.get(naics3) || description) : this.naicsMap.get(naics2) || this.getHeuristicNAICSDescription(naics2),
      naics_4_char: level >= 4 ? naics4 : (level >= 3 ? naics3 : naics2),
      naics_4_description: level >= 4 ? (this.naicsMap.get(naics4) || description) : (level >= 3 ? (this.naicsMap.get(naics3) || description) : this.naicsMap.get(naics2) || this.getHeuristicNAICSDescription(naics2)),
      naics_5_char: level >= 5 ? naics5 : (level >= 4 ? naics4 : (level >= 3 ? naics3 : naics2)),
      naics_5_description: level >= 5 ? (this.naicsMap.get(naics5) || description) : (level >= 4 ? (this.naicsMap.get(naics4) || description) : (level >= 3 ? (this.naicsMap.get(naics3) || description) : this.naicsMap.get(naics2) || this.getHeuristicNAICSDescription(naics2))),
      naics_6_char: naicsCode,
      naics_6_description: description,
      keywords: [description.toUpperCase(), 'AI Generated'],
      pscMappings: []
    };
  }

  /**
   * Build PSC hierarchy data for JSON persistence
   */
  private buildPSCHierarchy(pscCode: string, description: string): any {
    const level = pscCode.length;

    // Get parent level descriptions from existing map
    const psc2 = pscCode.substring(0, 2);
    const psc3 = pscCode.substring(0, 3);

    return {
      psc_2_char: psc2,
      psc_2_char_description: this.pscMap.get(psc2) || this.getHeuristicPSCDescription(psc2),
      psc_3_char: level >= 3 ? psc3 : psc2,
      psc_3_char_description: level >= 3 ? (this.pscMap.get(psc3) || description) : this.pscMap.get(psc2) || this.getHeuristicPSCDescription(psc2),
      psc_4_char: pscCode,
      psc_4_char_description: description
    };
  }

  /**
   * Append entry to JSON mapping file (client-side implementation would use API)
   */
  private async appendToJSONMapping(code: string, hierarchyData: any, type: 'naics' | 'psc'): Promise<void> {
    // In a real implementation, this would call an API endpoint to update the server-side JSON file
    // For now, we'll just log what would be added
    console.log(`Would add to JSON mapping (${type}):`, { code, hierarchyData });
  }

  /**
   * Append entry to CSV file (client-side implementation would use API)
   */
  private async appendToCSV(code: string, description: string, type: 'naics' | 'psc'): Promise<void> {
    // In a real implementation, this would call an API endpoint to update the server-side CSV file
    // For now, we'll just log what would be added
    const timestamp = new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' });
    console.log(`Would add to CSV (${type}): ${code}, ${description}, ai, ${timestamp}`);
  }
}

// Export singleton instance
export const referenceDataService = new ReferenceDataService();

// Export types
export type { ReferenceDataRow, NAICSReference, PSCReference };
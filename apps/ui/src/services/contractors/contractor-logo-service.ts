/**
 * Contractor Logo Service
 *
 * Handles contractor logo retrieval from API/hosting solution.
 * Provides caching and fallback strategies for logo display.
 */

import { LargeDataCache } from '../caching/large-data-cache';

export interface LogoConfig {
  apiUrl: string;
  apiKey?: string;
  cdnUrl?: string;
  fallbackEnabled: boolean;
}

export interface LogoResponse {
  logoUrl: string | null;
  source: 'api' | 'cdn' | 'fallback' | 'cached';
  quality: 'high' | 'medium' | 'low';
  lastUpdated?: string;
}

class ContractorLogoService {
  private config: LogoConfig;
  private cache: LargeDataCache;

  // Static fallback logos for well-known contractors
  private readonly FALLBACK_LOGOS: Record<string, string> = {
    // Defense contractors
    'RTX987654321': '/contractor-logos/raytheon.png',
    'LMT123456789': '/contractor-logos/lockheed-martin.png',
    'BA987654321': '/contractor-logos/boeing.png',
    'NOC123456789': '/contractor-logos/northrop-grumman.png',
    'GD987654321': '/contractor-logos/general-dynamics.png',
    'BAE456789123': '/contractor-logos/bae-systems.png',

    // Technology contractors
    'IBM123456789': '/contractor-logos/ibm.png',
    'MSFT987654321': '/contractor-logos/microsoft.png',
    'AMZN123456789': '/contractor-logos/amazon.png',
    'GOOG987654321': '/contractor-logos/google.png',

    // Healthcare
    'JNJ123456789': '/contractor-logos/johnson-johnson.png',
    'PFE987654321': '/contractor-logos/pfizer.png',

    // Engineering/Construction
    'CAT123456789': '/contractor-logos/caterpillar.png',
    'HON987654321': '/contractor-logos/honeywell.png',

    // Trio and other specific contractors
    'TFL123456789': '/contractor-logos/trio-fabrication.png'
  };

  constructor(config: LogoConfig) {
    this.config = config;
    this.cache = new LargeDataCache({
      maxCacheSize: 10_000, // Cache up to 10k logo URLs
      ttlMinutes: 60 * 24   // 24 hour cache for logos
    });
  }

  /**
   * Get contractor logo URL
   */
  async getContractorLogo(uei: string, companyName?: string): Promise<LogoResponse> {
    // Check cache first
    const cacheKey = `logo:${uei}`;
    const cached = this.cache.get<LogoResponse>(cacheKey);
    if (cached) {
      return { ...cached, source: 'cached' };
    }

    // Try API first
    try {
      const apiResult = await this.fetchFromAPI(uei, companyName);
      if (apiResult.logoUrl) {
        this.cache.set(cacheKey, apiResult);
        return apiResult;
      }
    } catch (error) {
      console.warn('Logo API failed, falling back to other sources:', error);
    }

    // Try CDN if available
    if (this.config.cdnUrl) {
      try {
        const cdnResult = await this.fetchFromCDN(uei, companyName);
        if (cdnResult.logoUrl) {
          this.cache.set(cacheKey, cdnResult);
          return cdnResult;
        }
      } catch (error) {
        console.warn('Logo CDN failed, falling back to static logos:', error);
      }
    }

    // Try static fallback
    const fallbackResult = this.getFallbackLogo(uei, companyName);
    if (fallbackResult.logoUrl) {
      this.cache.set(cacheKey, fallbackResult);
      return fallbackResult;
    }

    // Return null if no logo found
    const noLogoResult: LogoResponse = {
      logoUrl: null,
      source: 'fallback',
      quality: 'low'
    };

    this.cache.set(cacheKey, noLogoResult);
    return noLogoResult;
  }

  /**
   * Get multiple contractor logos efficiently
   */
  async getMultipleLogos(requests: Array<{ uei: string; companyName?: string }>): Promise<Record<string, LogoResponse>> {
    const results: Record<string, LogoResponse> = {};

    // Process in batches to avoid overwhelming the API
    const batchSize = 10;
    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);

      const batchPromises = batch.map(async ({ uei, companyName }) => {
        const result = await this.getContractorLogo(uei, companyName);
        return { uei, result };
      });

      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach(({ uei, result }) => {
        results[uei] = result;
      });
    }

    return results;
  }

  /**
   * Preload logos for a list of contractors
   */
  async preloadLogos(ueis: string[]): Promise<void> {
    // Load in background, don't wait for results
    this.getMultipleLogos(ueis.map(uei => ({ uei })))
      .catch(error => console.warn('Logo preloading failed:', error));
  }

  /**
   * Get logo placeholder/initials fallback
   */
  getLogoPlaceholder(companyName: string): {
    initials: string;
    backgroundColor: string;
    textColor: string;
  } {
    const initials = this.generateCompanyInitials(companyName);
    const backgroundColor = this.generateColorFromString(companyName);

    return {
      initials,
      backgroundColor,
      textColor: this.getContrastingTextColor(backgroundColor)
    };
  }

  /**
   * Clear logo cache
   */
  clearCache(uei?: string): void {
    if (uei) {
      this.cache.delete(`logo:${uei}`);
    } else {
      this.cache.clear('logo:');
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; hitRate: number } {
    return this.cache.getStats();
  }

  /**
   * Private: Fetch logo from API
   */
  private async fetchFromAPI(uei: string, companyName?: string): Promise<LogoResponse> {
    const url = `${this.config.apiUrl}/contractor-logo`;
    const params = new URLSearchParams({ uei });
    if (companyName) params.append('company', companyName);

    const response = await fetch(`${url}?${params}`, {
      headers: {
        ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
      },
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });

    if (!response.ok) {
      throw new Error(`Logo API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      logoUrl: data.logoUrl || null,
      source: 'api',
      quality: data.quality || 'high',
      lastUpdated: data.lastUpdated
    };
  }

  /**
   * Private: Fetch logo from CDN
   */
  private async fetchFromCDN(uei: string, companyName?: string): Promise<LogoResponse> {
    // Try multiple naming conventions
    const possiblePaths = [
      `${this.config.cdnUrl}/logos/${uei.toLowerCase()}.png`,
      `${this.config.cdnUrl}/logos/${uei.toLowerCase()}.jpg`,
      ...(companyName ? [
        `${this.config.cdnUrl}/logos/${companyName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`,
        `${this.config.cdnUrl}/logos/${companyName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.jpg`
      ] : [])
    ];

    for (const path of possiblePaths) {
      try {
        const response = await fetch(path, { method: 'HEAD', signal: AbortSignal.timeout(3000) });
        if (response.ok) {
          return {
            logoUrl: path,
            source: 'cdn',
            quality: 'medium'
          };
        }
      } catch {
        // Continue to next path
      }
    }

    throw new Error('No logo found in CDN');
  }

  /**
   * Private: Get fallback logo from static assets
   */
  private getFallbackLogo(uei: string, companyName?: string): LogoResponse {
    // Check direct UEI mapping
    if (this.FALLBACK_LOGOS[uei]) {
      return {
        logoUrl: this.FALLBACK_LOGOS[uei],
        source: 'fallback',
        quality: 'medium'
      };
    }

    // Check company name patterns
    if (companyName) {
      const name = companyName.toLowerCase();

      // Major defense contractors
      if (name.includes('raytheon')) return { logoUrl: this.FALLBACK_LOGOS['RTX987654321'], source: 'fallback', quality: 'medium' };
      if (name.includes('lockheed')) return { logoUrl: this.FALLBACK_LOGOS['LMT123456789'], source: 'fallback', quality: 'medium' };
      if (name.includes('boeing')) return { logoUrl: this.FALLBACK_LOGOS['BA987654321'], source: 'fallback', quality: 'medium' };
      if (name.includes('northrop')) return { logoUrl: this.FALLBACK_LOGOS['NOC123456789'], source: 'fallback', quality: 'medium' };
      if (name.includes('general dynamics')) return { logoUrl: this.FALLBACK_LOGOS['GD987654321'], source: 'fallback', quality: 'medium' };
      if (name.includes('bae systems')) return { logoUrl: this.FALLBACK_LOGOS['BAE456789123'], source: 'fallback', quality: 'medium' };

      // Technology companies
      if (name.includes('ibm')) return { logoUrl: this.FALLBACK_LOGOS['IBM123456789'], source: 'fallback', quality: 'medium' };
      if (name.includes('microsoft')) return { logoUrl: this.FALLBACK_LOGOS['MSFT987654321'], source: 'fallback', quality: 'medium' };
      if (name.includes('amazon')) return { logoUrl: this.FALLBACK_LOGOS['AMZN123456789'], source: 'fallback', quality: 'medium' };
      if (name.includes('google')) return { logoUrl: this.FALLBACK_LOGOS['GOOG987654321'], source: 'fallback', quality: 'medium' };

      // Trio Fabrication
      if (name.includes('trio')) return { logoUrl: this.FALLBACK_LOGOS['TFL123456789'], source: 'fallback', quality: 'medium' };
    }

    return { logoUrl: null, source: 'fallback', quality: 'low' };
  }

  /**
   * Private: Generate company initials
   */
  private generateCompanyInitials(companyName: string): string {
    // Special cases for well-known patterns
    if (companyName.includes('Trio')) return 'TFL';
    if (companyName.includes('Raytheon')) return 'RTX';
    if (companyName.includes('BAE')) return 'BAE';

    // General algorithm
    return companyName
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .slice(0, 3)
      .toUpperCase();
  }

  /**
   * Private: Generate consistent color from string
   */
  private generateColorFromString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Generate a pleasant color (avoid too light or too dark)
    const hue = hash % 360;
    return `hsl(${hue}, 60%, 45%)`;
  }

  /**
   * Private: Get contrasting text color
   */
  private getContrastingTextColor(backgroundColor: string): string {
    // Simple contrast check - for production, use a proper contrast ratio calculation
    return '#ffffff'; // White text generally works well with the generated colors
  }
}

// Export singleton instance
export const contractorLogoService = new ContractorLogoService({
  apiUrl: process.env.VITE_LOGO_API_URL || 'http://localhost:8002/api',
  apiKey: process.env.VITE_LOGO_API_KEY,
  cdnUrl: process.env.VITE_LOGO_CDN_URL,
  fallbackEnabled: true
});

export { ContractorLogoService };
/**
 * Baseline State Logger
 *
 * This module handles logging of baseline states when activity monitors are created,
 * tracking the original state for comparison with future changes.
 */

import type { ActivityBaseline, ActivityDetails } from './activity-monitoring';
import { activityMonitoringService } from './activity-monitoring';

export interface BaselineLog {
  id: string;
  baselineId: string;
  entityId: string;
  entityName: string;
  feature: string;
  createdAt: Date;
  originalState: {
    value: number;
    details: ActivityDetails;
    snapshot: Record<string, any>;
  };
  thresholdSettings: {
    threshold: number;
    operator: '>' | '<' | '>=' | '<=' | '==' | '!=';
    alertOnIncrease: boolean;
    alertOnDecrease: boolean;
  };
  metadata: {
    createdBy?: string;
    description?: string;
    tags?: string[];
    monitoringPeriod?: 'daily' | 'weekly' | 'monthly';
    autoDeactivate?: Date;
  };
}

export class BaselineLogger {
  private logs: Map<string, BaselineLog> = new Map();

  /**
   * Creates a baseline log when a new activity monitor is set up
   */
  logBaseline(
    baseline: ActivityBaseline,
    options: {
      description?: string;
      tags?: string[];
      createdBy?: string;
      monitoringPeriod?: BaselineLog['metadata']['monitoringPeriod'];
      autoDeactivate?: Date;
      alertOnIncrease?: boolean;
      alertOnDecrease?: boolean;
    } = {}
  ): BaselineLog {
    const logId = `log-${baseline.id}-${Date.now()}`;

    const log: BaselineLog = {
      id: logId,
      baselineId: baseline.id,
      entityId: baseline.entityId,
      entityName: baseline.entityName,
      feature: baseline.feature,
      createdAt: new Date(),
      originalState: {
        value: baseline.baselineValue,
        details: { ...baseline.details },
        snapshot: this.createDetailedSnapshot(baseline)
      },
      thresholdSettings: {
        threshold: baseline.threshold,
        operator: '>',
        alertOnIncrease: options.alertOnIncrease ?? true,
        alertOnDecrease: options.alertOnDecrease ?? false
      },
      metadata: {
        createdBy: options.createdBy || 'system',
        description: options.description || this.generateDefaultDescription(baseline),
        tags: options.tags || [],
        monitoringPeriod: options.monitoringPeriod || 'daily',
        autoDeactivate: options.autoDeactivate
      }
    };

    this.logs.set(logId, log);
    return log;
  }

  /**
   * Creates a detailed snapshot of the current state for comparison
   */
  private createDetailedSnapshot(baseline: ActivityBaseline): Record<string, any> {
    const snapshot: Record<string, any> = {
      totalCount: baseline.baselineValue,
      timestamp: baseline.baselineDate,
      entityInfo: {
        id: baseline.entityId,
        name: baseline.entityName
      },
      featureType: baseline.feature,
      breakdown: {},
      sources: []
    };

    // Feature-specific breakdown
    switch (baseline.feature) {
      case 'new_awards':
        snapshot.breakdown = this.createAwardsBreakdown(baseline.details);
        break;
      case 'new_obligations':
        snapshot.breakdown = this.createObligationsBreakdown(baseline.details);
        break;
      case 'new_subawards':
        snapshot.breakdown = this.createSubawardsBreakdown(baseline.details);
        break;
      case 'new_relationships':
        snapshot.breakdown = this.createRelationshipsBreakdown(baseline.details);
        break;
    }

    // Source details
    snapshot.sources = baseline.details.sources.map(source => ({
      id: source.id,
      name: source.name,
      value: source.value,
      date: source.date,
      metadata: source.metadata
    }));

    return snapshot;
  }

  /**
   * Creates awards-specific breakdown
   */
  private createAwardsBreakdown(details: ActivityDetails): Record<string, any> {
    const breakdown = {
      totalAwards: details.sources.length,
      byContractType: {} as Record<string, number>,
      byAgency: {} as Record<string, number>,
      byValue: {
        under100k: 0,
        between100k500k: 0,
        between500k1m: 0,
        over1m: 0
      },
      averageValue: 0,
      totalValue: 0
    };

    details.sources.forEach(source => {
      const metadata = source.metadata || {};

      // Contract type breakdown
      const contractType = metadata.contractType || 'Unknown';
      breakdown.byContractType[contractType] = (breakdown.byContractType[contractType] || 0) + 1;

      // Agency breakdown
      const agency = metadata.agency || 'Unknown';
      breakdown.byAgency[agency] = (breakdown.byAgency[agency] || 0) + 1;

      // Value breakdown
      const value = metadata.value || 0;
      breakdown.totalValue += value;

      if (value < 100000) breakdown.byValue.under100k++;
      else if (value < 500000) breakdown.byValue.between100k500k++;
      else if (value < 1000000) breakdown.byValue.between500k1m++;
      else breakdown.byValue.over1m++;
    });

    breakdown.averageValue = breakdown.totalValue / (details.sources.length || 1);

    return breakdown;
  }

  /**
   * Creates obligations-specific breakdown
   */
  private createObligationsBreakdown(details: ActivityDetails): Record<string, any> {
    const breakdown = {
      totalObligations: details.sources.length,
      byType: {} as Record<string, number>,
      byFiscalYear: {} as Record<string, number>,
      totalAmount: 0,
      averageAmount: 0
    };

    details.sources.forEach(source => {
      const metadata = source.metadata || {};

      const obligationType = metadata.obligationType || 'Unknown';
      breakdown.byType[obligationType] = (breakdown.byType[obligationType] || 0) + 1;

      const fiscalYear = metadata.fiscalYear?.toString() || 'Unknown';
      breakdown.byFiscalYear[fiscalYear] = (breakdown.byFiscalYear[fiscalYear] || 0) + 1;

      breakdown.totalAmount += metadata.amount || 0;
    });

    breakdown.averageAmount = breakdown.totalAmount / (details.sources.length || 1);

    return breakdown;
  }

  /**
   * Creates subawards-specific breakdown
   */
  private createSubawardsBreakdown(details: ActivityDetails): Record<string, any> {
    const breakdown = {
      totalSubawards: details.sources.length,
      bySubcontractorType: {} as Record<string, number>,
      byWorkType: {} as Record<string, number>,
      totalValue: 0,
      averageValue: 0
    };

    details.sources.forEach(source => {
      const metadata = source.metadata || {};

      const subcontractorType = metadata.subcontractorType || 'Unknown';
      breakdown.bySubcontractorType[subcontractorType] = (breakdown.bySubcontractorType[subcontractorType] || 0) + 1;

      const workType = metadata.workType || 'Unknown';
      breakdown.byWorkType[workType] = (breakdown.byWorkType[workType] || 0) + 1;

      breakdown.totalValue += metadata.value || 0;
    });

    breakdown.averageValue = breakdown.totalValue / (details.sources.length || 1);

    return breakdown;
  }

  /**
   * Creates relationships-specific breakdown
   */
  private createRelationshipsBreakdown(details: ActivityDetails): Record<string, any> {
    const breakdown = {
      totalRelationships: details.sources.length,
      byRelationshipType: {} as Record<string, number>,
      byPartnerSize: {} as Record<string, number>,
      byIndustry: {} as Record<string, number>
    };

    details.sources.forEach(source => {
      const metadata = source.metadata || {};

      const relationshipType = metadata.relationshipType || 'Unknown';
      breakdown.byRelationshipType[relationshipType] = (breakdown.byRelationshipType[relationshipType] || 0) + 1;

      const partnerSize = metadata.partnerSize || 'Unknown';
      breakdown.byPartnerSize[partnerSize] = (breakdown.byPartnerSize[partnerSize] || 0) + 1;

      const industry = metadata.industry || 'Unknown';
      breakdown.byIndustry[industry] = (breakdown.byIndustry[industry] || 0) + 1;
    });

    return breakdown;
  }

  /**
   * Generates a default description for the baseline log
   */
  private generateDefaultDescription(baseline: ActivityBaseline): string {
    const featureNames = {
      new_awards: 'New Awards',
      new_obligations: 'New Obligations',
      new_subawards: 'New Subawards',
      new_relationships: 'New Relationships'
    };

    const featureName = featureNames[baseline.feature] || baseline.feature;
    const formattedValue = activityMonitoringService.formatActivityValue(baseline.feature, baseline.baselineValue);

    return `Monitoring ${featureName} for ${baseline.entityName}. Baseline: ${formattedValue}. Threshold: ${baseline.threshold}.`;
  }

  /**
   * Gets all baseline logs
   */
  getAllLogs(): BaselineLog[] {
    return Array.from(this.logs.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Gets logs for a specific entity
   */
  getLogsForEntity(entityId: string): BaselineLog[] {
    return this.getAllLogs().filter(log => log.entityId === entityId);
  }

  /**
   * Gets logs for a specific feature
   */
  getLogsForFeature(feature: string): BaselineLog[] {
    return this.getAllLogs().filter(log => log.feature === feature);
  }

  /**
   * Gets a specific baseline log
   */
  getLog(logId: string): BaselineLog | undefined {
    return this.logs.get(logId);
  }

  /**
   * Gets the baseline log for a specific baseline ID
   */
  getLogForBaseline(baselineId: string): BaselineLog | undefined {
    return this.getAllLogs().find(log => log.baselineId === baselineId);
  }

  /**
   * Updates baseline log metadata
   */
  updateLogMetadata(logId: string, metadata: Partial<BaselineLog['metadata']>): boolean {
    const log = this.logs.get(logId);
    if (!log) return false;

    log.metadata = { ...log.metadata, ...metadata };
    return true;
  }

  /**
   * Removes a baseline log
   */
  removeLog(logId: string): boolean {
    return this.logs.delete(logId);
  }

  /**
   * Generates a human-readable summary of the baseline state
   */
  generateStatelogSummary(logId: string): string {
    const log = this.logs.get(logId);
    if (!log) return 'Log not found';

    const featureNames = {
      new_awards: 'Awards',
      new_obligations: 'Obligations',
      new_subawards: 'Subawards',
      new_relationships: 'Relationships'
    };

    const featureName = featureNames[log.feature as keyof typeof featureNames] || log.feature;
    const snapshot = log.originalState.snapshot;
    const breakdown = snapshot.breakdown || {};

    let summary = `${log.entityName} had ${log.originalState.value} ${featureName.toLowerCase()} when monitoring began on ${log.createdAt.toLocaleDateString()}.\n\n`;

    // Add feature-specific details
    switch (log.feature) {
      case 'new_awards':
        summary += `Awards Breakdown:\n`;
        if (breakdown.byContractType) {
          summary += `• By Type: ${Object.entries(breakdown.byContractType).map(([type, count]) => `${type} (${count})`).join(', ')}\n`;
        }
        if (breakdown.byAgency) {
          summary += `• By Agency: ${Object.entries(breakdown.byAgency).map(([agency, count]) => `${agency} (${count})`).join(', ')}\n`;
        }
        if (breakdown.totalValue) {
          summary += `• Total Value: $${(breakdown.totalValue / 1000000).toFixed(1)}M\n`;
        }
        break;

      case 'new_subawards':
        summary += `Subawards Breakdown:\n`;
        if (breakdown.bySubcontractorType) {
          summary += `• By Contractor Type: ${Object.entries(breakdown.bySubcontractorType).map(([type, count]) => `${type} (${count})`).join(', ')}\n`;
        }
        if (breakdown.byWorkType) {
          summary += `• By Work Type: ${Object.entries(breakdown.byWorkType).map(([type, count]) => `${type} (${count})`).join(', ')}\n`;
        }
        break;

      case 'new_relationships':
        summary += `Relationships Breakdown:\n`;
        if (breakdown.byRelationshipType) {
          summary += `• By Type: ${Object.entries(breakdown.byRelationshipType).map(([type, count]) => `${type} (${count})`).join(', ')}\n`;
        }
        if (breakdown.byIndustry) {
          summary += `• By Industry: ${Object.entries(breakdown.byIndustry).map(([industry, count]) => `${industry} (${count})`).join(', ')}\n`;
        }
        break;
    }

    summary += `\nThreshold: Alert when changes exceed ${log.thresholdSettings.threshold} ${featureName.toLowerCase()}.`;

    return summary;
  }
}

// Export singleton instance
export const baselineLogger = new BaselineLogger();
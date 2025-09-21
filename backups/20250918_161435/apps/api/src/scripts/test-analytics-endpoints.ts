#!/usr/bin/env bun
/**
 * Test script for new analytics endpoints
 * Tests the critical features added for UI enhancement
 */

import { db } from '../db';
import { contractorProfiles } from '../db/schema';
import { eq } from 'drizzle-orm';

const API_BASE = 'http://localhost:3001/api/v1';

// Helper to make authenticated requests
async function apiRequest(path: string, options: RequestInit = {}) {
  // You would normally get this from auth, using a placeholder for now
  const token = 'test-token'; 
  
  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
}

async function testAnalyticsEndpoints() {
  console.log('🧪 Testing Analytics Endpoints...\n');

  try {
    // Get a sample contractor profile to test with
    const sampleProfile = await db.query.contractorProfiles.findFirst();
    
    if (!sampleProfile) {
      console.error('❌ No contractor profiles found. Please run data import first.');
      return;
    }

    console.log(`Using contractor: ${sampleProfile.displayName} (${sampleProfile.id})\n`);

    // Test 1: Performance Metrics Endpoint
    console.log('1️⃣ Testing Performance Metrics Endpoint...');
    const metricsResponse = await apiRequest(`/analytics/metrics/${sampleProfile.id}/monthly?months=12`);
    if (metricsResponse.ok) {
      const metricsData = await metricsResponse.json();
      console.log('✅ Performance metrics retrieved successfully');
      console.log(`   - Contractor: ${metricsData.contractor.name}`);
      console.log(`   - Metrics count: ${metricsData.metrics.length}`);
      console.log(`   - Total revenue: $${metricsData.summary.totalRevenue.toLocaleString()}`);
      console.log(`   - Latest status: ${metricsData.summary.latestActivityStatus}`);
    } else {
      console.error('❌ Failed to fetch performance metrics:', metricsResponse.statusText);
    }

    // Test 2: Peer Comparison Endpoint
    console.log('\n2️⃣ Testing Peer Comparison Endpoint...');
    const peerResponse = await apiRequest(`/analytics/peer-comparison/${sampleProfile.id}`);
    if (peerResponse.ok) {
      const peerData = await peerResponse.json();
      console.log('✅ Peer comparison data retrieved successfully');
      if (peerData.currentPercentiles) {
        console.log(`   - Revenue percentile: ${peerData.currentPercentiles.revenue}th`);
        console.log(`   - Growth percentile: ${peerData.currentPercentiles.growth}th`);
        console.log(`   - Overall score: ${peerData.currentPercentiles.overall}`);
        console.log(`   - Peer group size: ${peerData.peerGroup?.size || 0}`);
      } else {
        console.log('   ⚠️  No peer comparison data available for this contractor');
      }
    } else {
      console.error('❌ Failed to fetch peer comparison:', peerResponse.statusText);
    }

    // Test 3: Network Relationships Endpoint
    console.log('\n3️⃣ Testing Network Relationships Endpoint...');
    const networkResponse = await apiRequest(`/analytics/network/${sampleProfile.id}?limit=5`);
    if (networkResponse.ok) {
      const networkData = await networkResponse.json();
      console.log('✅ Network relationships retrieved successfully');
      console.log(`   - As Prime: ${networkData.relationships.asPrime.count} subcontractors`);
      console.log(`   - As Sub: ${networkData.relationships.asSubcontractor.count} prime contractors`);
      console.log(`   - Total network value: $${networkData.networkSummary.totalNetworkValue.toLocaleString()}`);
      console.log(`   - Avg strength score: ${networkData.networkSummary.avgStrengthScore.toFixed(0)}`);
    } else {
      console.error('❌ Failed to fetch network relationships:', networkResponse.statusText);
    }

    // Test 4: Iceberg Opportunities Endpoint
    console.log('\n4️⃣ Testing Iceberg Opportunities Endpoint...');
    const icebergResponse = await apiRequest('/analytics/opportunities/iceberg?limit=10&minScore=50');
    if (icebergResponse.ok) {
      const icebergData = await icebergResponse.json();
      console.log('✅ Iceberg opportunities retrieved successfully');
      console.log(`   - Total opportunities: ${icebergData.summary.total}`);
      console.log(`   - High tier: ${icebergData.summary.byTier.high}`);
      console.log(`   - Medium tier: ${icebergData.summary.byTier.medium}`);
      console.log(`   - Average score: ${icebergData.summary.avgScore.toFixed(0)}`);
      console.log(`   - Total potential value: $${icebergData.summary.totalPotentialValue.toLocaleString()}`);
      
      if (icebergData.opportunities.length > 0) {
        const topOpp = icebergData.opportunities[0];
        console.log(`\n   Top opportunity:`);
        console.log(`   - ${topOpp.contractorName}`);
        console.log(`   - Iceberg score: ${topOpp.scores.iceberg}`);
        console.log(`   - Sub:Prime ratio: ${topOpp.scores.subToPrimeRatio.toFixed(1)}:1`);
        console.log(`   - Hidden revenue: ${topOpp.scores.hiddenRevenuePercentage.toFixed(0)}%`);
      }
    } else {
      console.error('❌ Failed to fetch iceberg opportunities:', icebergResponse.statusText);
    }

    // Test 5: Portfolio Risk Analysis (mock portfolio)
    console.log('\n5️⃣ Testing Portfolio Risk Analysis Endpoint...');
    const riskResponse = await apiRequest('/analytics/portfolios/test-portfolio-123/risk-analysis');
    if (riskResponse.ok) {
      const riskData = await riskResponse.json();
      console.log('✅ Portfolio risk analysis retrieved successfully');
      console.log(`   - Agency concentration HHI: ${riskData.riskMetrics.agencyConcentration.hhiScore.toFixed(0)}`);
      console.log(`   - Agency risk level: ${riskData.riskMetrics.agencyConcentration.riskLevel}`);
      console.log(`   - Industry concentration HHI: ${riskData.riskMetrics.industryConcentration.hhiScore.toFixed(0)}`);
      console.log(`   - Industry risk level: ${riskData.riskMetrics.industryConcentration.riskLevel}`);
    } else {
      console.error('❌ Failed to fetch portfolio risk analysis:', riskResponse.statusText);
    }

    console.log('\n✨ Analytics endpoint testing complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    process.exit(0);
  }
}

// Run tests
console.log('🚀 Starting Analytics Endpoint Tests\n');
console.log('Make sure the API server is running on port 3001\n');

testAnalyticsEndpoints();
import React from 'react';
import type { NetworkSummary as NetworkSummaryType, NetworkNode } from '../types';

interface NetworkSummaryProps {
  summary: NetworkSummaryType;
  mainContractor: NetworkNode;
}

export default function NetworkSummary({ summary, mainContractor }: NetworkSummaryProps) {
  const formatCurrency = (amount: number): string => {
    if (amount >= 1e9) {
      return `$${(amount / 1e9).toFixed(1)}B`;
    } else if (amount >= 1e6) {
      return `$${(amount / 1e6).toFixed(1)}M`;
    } else if (amount >= 1e3) {
      return `$${(amount / 1e3).toFixed(0)}K`;
    } else {
      return `$${amount.toLocaleString()}`;
    }
  };

  const inflowPercentage = summary.totalRelationships > 0
    ? (summary.inflowRelationships / summary.totalRelationships * 100).toFixed(0)
    : 0;

  const outflowPercentage = summary.totalRelationships > 0
    ? (summary.outflowRelationships / summary.totalRelationships * 100).toFixed(0)
    : 0;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Network Analysis</h2>
          <p className="text-gray-600 text-sm">
            Active relationships for {mainContractor.name}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(summary.totalActiveValue)}
          </div>
          <div className="text-sm text-gray-500">Total Active Value</div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border border-blue-100">
          <div className="text-2xl font-bold text-gray-900">
            {summary.totalRelationships}
          </div>
          <div className="text-sm text-gray-600">Total Relationships</div>
          <div className="mt-1">
            <span className="text-green-600 text-xs">
              {inflowPercentage}% inflow
            </span>
            <span className="text-gray-400 mx-1">•</span>
            <span className="text-orange-600 text-xs">
              {outflowPercentage}% outflow
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-blue-100">
          <div className="text-2xl font-bold text-gray-900">
            {summary.geographicReach.states}
          </div>
          <div className="text-sm text-gray-600">States</div>
          <div className="text-xs text-gray-500 mt-1">
            Primary: {summary.geographicReach.primaryState || 'N/A'}
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-blue-100">
          <div className="text-2xl font-bold text-gray-900">
            {summary.relationshipTypes.agencies + summary.relationshipTypes.primes}
          </div>
          <div className="text-sm text-gray-600">Government & Primes</div>
          <div className="text-xs text-gray-500 mt-1">
            {summary.relationshipTypes.agencies} agencies, {summary.relationshipTypes.primes} primes
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-blue-100">
          <div className="text-2xl font-bold text-gray-900">
            {summary.relationshipTypes.subs + summary.relationshipTypes.subsidiaries}
          </div>
          <div className="text-sm text-gray-600">Subs & Subsidiaries</div>
          <div className="text-xs text-gray-500 mt-1">
            {summary.relationshipTypes.subs} subs, {summary.relationshipTypes.subsidiaries} subsidiaries
          </div>
        </div>
      </div>

      {/* Flow Direction Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-4 border border-green-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-green-800">Inflow Relationships</h3>
            <span className="text-green-600 font-bold">{summary.inflowRelationships}</span>
          </div>
          <div className="text-sm text-gray-600 mb-2">Money flowing TO contractor</div>
          <div className="w-full bg-green-100 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.max(inflowPercentage, 5)}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Agencies, primes, and parent companies providing work
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-orange-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-orange-800">Outflow Relationships</h3>
            <span className="text-orange-600 font-bold">{summary.outflowRelationships}</span>
          </div>
          <div className="text-sm text-gray-600 mb-2">Money flowing FROM contractor</div>
          <div className="w-full bg-orange-100 rounded-full h-2">
            <div
              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.max(outflowPercentage, 5)}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Subcontractors and subsidiaries receiving work
          </div>
        </div>
      </div>
    </div>
  );
}
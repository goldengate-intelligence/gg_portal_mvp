import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, ExternalLink, AlertCircle, TrendingUp, TrendingDown, Star } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge, IndustryBadge, PerformanceBadge } from '../ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import type { PortfolioItem } from '../../types';

interface PortfolioItemCardProps {
  item: PortfolioItem;
  viewMode: 'grid' | 'list';
  onRemove: () => void;
}

export function PortfolioItemCard({ item, viewMode, onRemove }: PortfolioItemCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  const getMomentumIcon = (momentum: string) => {
    if (momentum.includes('growth')) return <TrendingUp className="h-3 w-3 text-green-400" />;
    if (momentum.includes('declining')) return <TrendingDown className="h-3 w-3 text-red-400" />;
    return null;
  };

  if (viewMode === 'grid') {
    return (
      <div ref={setNodeRef} style={style}>
        <Card variant="interactive" className="relative group">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="absolute top-2 left-2 p-1 rounded cursor-move opacity-0 group-hover:opacity-100 transition-opacity bg-dark-gold"
          >
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>

          {/* Remove Button */}
          <button
            onClick={onRemove}
            className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity bg-dark-gold hover:bg-red-600"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-white" />
          </button>

          {/* Priority Indicator */}
          {item.priority === 'high' && (
            <div className="absolute top-0 right-0 w-0 h-0 border-t-[40px] border-t-red-500 border-l-[40px] border-l-transparent">
              <Star className="h-4 w-4 text-white absolute -top-9 right-1" />
            </div>
          )}

          <CardHeader className="pb-3">
            <CardTitle size="md" className="pr-8">{item.contractor.name}</CardTitle>
            <CardDescription>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs">{item.contractor.uei}</span>
                {item.alertsEnabled && <AlertCircle className="h-3 w-3 text-yellow-500" />}
              </div>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-1">
              <IndustryBadge industry={item.contractor.industry} />
              {item.contractor.pastPerformanceScore && (
                <PerformanceBadge score={item.contractor.pastPerformanceScore} showScore={false} />
              )}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Contract Value</span>
                <span className="text-white font-medium">
                  {item.contractor.totalContractValue ? formatCurrency(item.contractor.totalContractValue) : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Added</span>
                <span className="text-white">{formatDate(item.addedAt)}</span>
              </div>
            </div>

            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {item.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // List View
  return (
    <div ref={setNodeRef} style={style}>
      <div className="bg-medium-gray border border-yellow-500/20 rounded-lg p-4 hover:border-yellow-500 transition-colors group">
        <div className="flex items-center gap-4">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="p-1 rounded cursor-move hover:bg-dark-gold"
          >
            <GripVertical className="h-5 w-5 text-gray-500" />
          </div>

          {/* Priority Indicator */}
          <div className={`${getPriorityColor(item.priority)}`}>
            {item.priority === 'high' && <Star className="h-4 w-4" />}
            {item.priority === 'medium' && <AlertCircle className="h-4 w-4" />}
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-yellow-500 font-aptos">
                {item.contractor.name}
              </h3>
              <Badge variant="outline" className="font-mono text-xs">
                {item.contractor.uei}
              </Badge>
              <IndustryBadge industry={item.contractor.industry} />
              {getMomentumIcon(item.contractor.businessMomentum)}
            </div>
            
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="text-gray-400">Contract Value: </span>
                <span className="text-white font-medium">
                  {item.contractor.totalContractValue ? formatCurrency(item.contractor.totalContractValue) : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Performance: </span>
                <span className="text-white font-medium">
                  {item.contractor.pastPerformanceScore || 'N/A'}/100
                </span>
              </div>
              <div>
                <span className="text-gray-400">Active Contracts: </span>
                <span className="text-white font-medium">
                  {item.contractor.activeContracts || 0}
                </span>
              </div>
            </div>

            {item.notes && (
              <p className="text-xs text-gray-500 mt-2 italic">{item.notes}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {item.alertsEnabled && (
              <Badge variant="warning" className="text-xs">
                <AlertCircle className="h-3 w-3 mr-1" />
                Alerts ON
              </Badge>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
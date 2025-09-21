import React from 'react';
import { cn, CONTRACTOR_DETAIL_COLORS } from '../../lib/utils';

interface HudCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'danger' | 'warning' | 'success' | 'info';
  priority?: 'critical' | 'high' | 'medium' | 'low';
  scanning?: boolean;
  targetLocked?: boolean;
  dataStream?: boolean;
  isPanel?: boolean;
}

export function HudCard({ 
  children, 
  className,
  variant = 'default',
  priority = 'medium',
  scanning = false,
  targetLocked = false,
  dataStream = false,
  isPanel = false
}: HudCardProps) {
  const variantColors = {
    default: 'border-gray-600/30',
    danger: 'border-red-500/30',
    warning: 'border-yellow-500/30',
    success: 'border-green-500/30',
    info: 'border-gray-500/30'
  };

  const priorityIndicators = {
    critical: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500'
  };

  return (
    <div className={cn(
      "relative group",
      "transition-all duration-500",
      "rounded-lg border",
      variantColors[variant],
      isPanel && CONTRACTOR_DETAIL_COLORS.panelColor,
      className
    )} style={{ backgroundColor: !isPanel ? CONTRACTOR_DETAIL_COLORS.backgroundColor : undefined }}>
      {/* Background color applied directly to parent */}

      {/* Animated grid overlay - Disabled */}
      {false && (
        <div className="absolute inset-0 rounded-lg overflow-hidden opacity-20">
          <div 
            className="absolute inset-0" 
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 60 0 L 0 0 0 60' fill='none' stroke='%2300D9FF' stroke-width='0.5' opacity='0.5'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E")`,
              backgroundSize: '60px 60px'
            }}
          />
        </div>
      )}




      {/* Data stream effect */}
      {dataStream && (
        <div className="absolute bottom-2 left-2 right-2 h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500 to-transparent animate-pulse" />
        </div>
      )}

      {/* Content container */}
      <div className="relative z-10">
        {children}
      </div>

    </div>
  );
}

export function HudCardHeader({ 
  children, 
  className,
  icon,
  status = 'online'
}: {
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  status?: 'online' | 'offline' | 'pending';
}) {
  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-red-500',
    pending: 'bg-yellow-500'
  };

  return (
    <div className={cn("p-4 border-b border-gray-600/20", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              {icon}
            </div>
          )}
          <div>{children}</div>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-2 h-2 rounded-full animate-pulse",
            statusColors[status]
          )} />
          <span className="text-xs text-gray-400 font-mono uppercase">
            {status}
          </span>
        </div>
      </div>
    </div>
  );
}

export function HudCardContent({ 
  children, 
  className 
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("p-4", className)}>
      {children}
    </div>
  );
}

export function HudCardTitle({ 
  children, 
  className,
  tactical = false
}: {
  children: React.ReactNode;
  className?: string;
  tactical?: boolean;
}) {
  return (
    <h3 className={cn(
      "font-orbitron text-yellow-400 uppercase tracking-wider",
      tactical && "text-xs opacity-70",
      !tactical && "text-lg font-semibold",
      className
    )}>
      {tactical && "◆ "}
      {children}
      {tactical && " ◆"}
    </h3>
  );
}

export function HudCardDescription({ 
  children, 
  className 
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn(
      "text-sm text-gray-400/70", { fontFamily: 'Genos, sans-serif' },
      className
    )}>
      {children}
    </p>
  );
}

// Tactical data display component
export function TacticalDisplay({
  label,
  value,
  unit,
  trend,
  alert = false,
  growth = false,
  growthValue,
  size = 'sm'
}: {
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  alert?: boolean;
  growth?: boolean;
  growthValue?: number;
  size?: 'sm' | 'md' | 'lg';
}) {
  const trendIcons = {
    up: '▲',
    down: '▼',
    stable: '━'
  };

  const trendColors = {
    up: 'text-gray-300',
    down: 'text-gray-400',
    stable: 'text-gray-400'
  };

  const sizeClasses = {
    sm: {
      container: "p-2",
      label: "text-xs",
      value: "text-sm",
      unit: "text-xs",
      trend: "text-xs"
    },
    md: {
      container: "p-3",
      label: "text-sm",
      value: "text-xs",
      unit: "text-xs",
      trend: "text-xs"
    },
    lg: {
      container: "p-4",
      label: "text-sm",
      value: "text-xl",
      unit: "text-sm",
      trend: "text-base"
    }
  };

  const currentSize = sizeClasses[size];

  // Determine color based on growthValue
  const getGrowthColor = () => {
    if (!growth || growthValue === undefined) return "text-gray-100";
    if (alert) return "text-red-400";

    if (growthValue >= 1) return "text-green-400";
    if (growthValue > -1 && growthValue < 1) return "text-[#D2AC38]";
    return "text-red-400"; // -1% or lower
  };

  return (
    <div className={cn(
      "flex items-center justify-between",
      currentSize.container,
      "border border-gray-600/20 rounded-lg backdrop-blur-sm",
      alert && "border-red-500/30 bg-gradient-to-r from-red-500/10 to-transparent animate-pulse"
    )} style={{ backgroundColor: CONTRACTOR_DETAIL_COLORS.containerColor }}>
      <span className={cn(currentSize.label, "text-gray-400 uppercase tracking-wider font-normal")} style={{ fontFamily: 'Genos, sans-serif' }}>
        {label}
      </span>
      <div className="flex items-center gap-2">
        <span className={cn(
          currentSize.value, "font-normal tracking-wide",
          getGrowthColor()
        )} style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
          {value}
        </span>
        {unit && (
          <span className={cn(currentSize.unit, "text-gray-500 font-mono")}>{unit}</span>
        )}
        {trend && (
          <span className={cn(currentSize.trend, growth ? "text-green-400" : trendColors[trend])}>
            {trendIcons[trend]}
          </span>
        )}
      </div>
    </div>
  );
}

// Reticle/Crosshair component for targeting
export function TargetReticle({ 
  size = 100,
  color = '#FFD700',
  animated = true 
}: {
  size?: number;
  color?: string;
  animated?: boolean;
}) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      className={cn(animated && "animate-pulse")}
    >
      {/* Outer circle */}
      <circle 
        cx="50" 
        cy="50" 
        r="45" 
        fill="none" 
        stroke={color} 
        strokeWidth="0.5" 
        opacity="0.5"
      />
      
      {/* Inner circle */}
      <circle 
        cx="50" 
        cy="50" 
        r="30" 
        fill="none" 
        stroke={color} 
        strokeWidth="1" 
        opacity="0.7"
        strokeDasharray="5 5"
        className={cn(animated && "animate-spin")}
        style={{ transformOrigin: 'center', animationDuration: '10s' }}
      />
      
      {/* Crosshairs */}
      <line x1="50" y1="5" x2="50" y2="25" stroke={color} strokeWidth="1" />
      <line x1="50" y1="75" x2="50" y2="95" stroke={color} strokeWidth="1" />
      <line x1="5" y1="50" x2="25" y2="50" stroke={color} strokeWidth="1" />
      <line x1="75" y1="50" x2="95" y2="50" stroke={color} strokeWidth="1" />
      
      {/* Center dot */}
      <circle cx="50" cy="50" r="2" fill={color} />
    </svg>
  );
}
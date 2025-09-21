import * as React from "react"
import { cn } from "../../lib/utils"
import { Heart } from "lucide-react"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: 'default' | 'elevated' | 'outlined' | 'interactive'
  }
>(({ className, variant = 'default', ...props }, ref) => {
  const variants = {
    default: "bg-medium-gray border border-gray-700/30 text-white",
    elevated: "bg-medium-gray border border-gray-700/30 shadow-lg shadow-black/25 text-white",
    outlined: "bg-transparent border border-gray-600/30 text-white",
    interactive: "bg-medium-gray border border-gray-700/30 hover:border-gray-600/50 hover:shadow-lg hover:shadow-gray-600/10 text-white transition-all duration-200 cursor-pointer"
  }

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-lg",
        variants[variant],
        className
      )}
      {...props}
    />
  )
})
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    size?: 'sm' | 'md' | 'lg' | 'xl'
  }
>(({ className, size = 'md', ...props }, ref) => {
  const sizes = {
    sm: "text-sm font-medium",
    md: "text-lg font-semibold", 
    lg: "text-xl font-semibold",
    xl: "text-2xl font-bold"
  }

  return (
    <h3
      ref={ref}
      className={cn(
        "leading-none tracking-tight text-yellow-500 font-aptos",
        sizes[size],
        className
      )}
      {...props}
    />
  )
})
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-gray-400 font-aptos", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

// Specialized card variants for the platform
const ContractorCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    contractor: {
      id: string
      name: string
      industry: string
      location: string
      state?: string
      totalContractValue?: number
      pastPerformanceScore?: number
      totalUeis?: number
      totalAgencies?: number
      activeContracts?: number
    }
    isFavorite?: boolean
    onToggleFavorite?: (contractorId: string) => void
    onClick?: () => void
  }
>(({ className, contractor, isFavorite = false, onToggleFavorite, onClick, ...props }, ref) => {
  const formatCurrency = (value: number) => {
    if (value >= 1e15) return `$${(value / 1e15).toFixed(1)}Q`
    if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`
    if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`
    return `$${value.toFixed(0)}`
  }

  return (
    <Card 
      ref={ref} 
      variant={onClick ? "interactive" : "default"}
      className={cn("w-full", className)}
      onClick={onClick}
      {...props}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle size="md">{contractor.name}</CardTitle>
            <CardDescription>
              {contractor.industry.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} • {contractor.location === 'US' ? contractor.state || 'US' : contractor.location}
            </CardDescription>
          </div>
          <div className="flex items-start gap-2">
            {contractor.totalUeis && contractor.totalUeis > 1 && (
              <div className="px-2 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs text-yellow-500 font-aptos">
                {contractor.totalUeis} UEIs
              </div>
            )}
            {onToggleFavorite && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleFavorite(contractor.id)
                }}
                className={cn(
                  "p-1.5 rounded-lg transition-all duration-200",
                  isFavorite 
                    ? "bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30" 
                    : "bg-black/20 text-gray-400 hover:text-yellow-500 hover:bg-yellow-500/10"
                )}
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
              </button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-400 font-aptos">Total Value</span>
          <span className="text-white font-aptos font-medium">
            {contractor.totalContractValue ? formatCurrency(contractor.totalContractValue) : 'N/A'}
          </span>
        </div>
        {contractor.activeContracts !== undefined && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400 font-aptos">Contracts</span>
            <span className="text-white font-aptos font-medium">
              {contractor.activeContracts.toLocaleString()}
            </span>
          </div>
        )}
        {contractor.totalAgencies !== undefined && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400 font-aptos">Agencies</span>
            <span className="text-white font-aptos font-medium">
              {contractor.totalAgencies}
            </span>
          </div>
        )}
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-400 font-aptos">Performance</span>
          <span className={cn(
            "font-aptos font-medium",
            contractor.pastPerformanceScore && contractor.pastPerformanceScore >= 90 ? "text-green-400" :
            contractor.pastPerformanceScore && contractor.pastPerformanceScore >= 80 ? "text-yellow-400" : "text-red-400"
          )}>
            {contractor.pastPerformanceScore ? `${contractor.pastPerformanceScore}/100` : 'N/A'}
          </span>
        </div>
      </CardContent>
    </Card>
  )
})
ContractorCard.displayName = "ContractorCard"

const OpportunityCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    opportunity: {
      title: string
      agency: string
      piid: string
      totalValue: number
      responseDeadline?: Date
      riskLevel: 'low' | 'medium' | 'high' | 'critical'
    }
    onClick?: () => void
  }
>(({ className, opportunity, onClick, ...props }, ref) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  const riskColors = {
    low: 'text-green-400',
    medium: 'text-yellow-400', 
    high: 'text-orange-400',
    critical: 'text-red-400'
  }

  return (
    <Card 
      ref={ref}
      variant={onClick ? "interactive" : "default"}
      className={cn("w-full", className)}
      onClick={onClick}
      {...props}
    >
      <CardHeader className="pb-3">
        <CardTitle size="md" className="line-clamp-2">{opportunity.title}</CardTitle>
        <CardDescription>
          {opportunity.agency} • {opportunity.piid}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-400 font-aptos">Total Value</span>
          <span className="text-white font-aptos font-medium">
            {formatCurrency(opportunity.totalValue)}
          </span>
        </div>
        {opportunity.responseDeadline && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400 font-aptos">Deadline</span>
            <span className="text-white font-aptos font-medium">
              {formatDate(opportunity.responseDeadline)}
            </span>
          </div>
        )}
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-400 font-aptos">Risk Level</span>
          <span className={cn(
            "font-aptos font-medium capitalize",
            riskColors[opportunity.riskLevel]
          )}>
            {opportunity.riskLevel}
          </span>
        </div>
      </CardContent>
    </Card>
  )
})
OpportunityCard.displayName = "OpportunityCard"

const MetricCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    title: string
    value: string | number
    description?: string
    trend?: 'up' | 'down' | 'stable'
    trendValue?: string
  }
>(({ className, title, value, description, trend, trendValue, ...props }, ref) => {
  const trendIcons = {
    up: '↗',
    down: '↘', 
    stable: '→'
  }

  const trendColors = {
    up: 'text-green-400',
    down: 'text-red-400',
    stable: 'text-gray-400'
  }

  return (
    <Card ref={ref} className={cn("p-6", className)} {...props}>
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle size="sm" className="text-gray-300">{title}</CardTitle>
        {trend && (
          <span className={cn("text-sm", trendColors[trend])}>
            {trendIcons[trend]} {trendValue}
          </span>
        )}
      </div>
      <div>
        <div className="text-2xl font-bold text-yellow-500 font-aptos">{value}</div>
        {description && (
          <p className="text-xs text-gray-500 font-aptos">{description}</p>
        )}
      </div>
    </Card>
  )
})
MetricCard.displayName = "MetricCard"

export { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent,
  ContractorCard,
  OpportunityCard,
  MetricCard
}
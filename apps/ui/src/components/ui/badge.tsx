import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 font-aptos",
  {
    variants: {
      variant: {
        default: "border-transparent bg-yellow-500 text-black hover:bg-yellow-600",
        secondary: "border-transparent bg-medium-gray text-gray-300 hover:bg-lighter-gray",
        destructive: "border-transparent bg-red-600 text-white hover:bg-red-700",
        outline: "border-dark-gray text-gray-300 hover:bg-medium-gray",
        success: "border-transparent bg-green-600 text-white hover:bg-green-700",
        warning: "border-transparent bg-orange-500 text-black hover:bg-orange-600",
        info: "border-transparent bg-lighter-gray text-white hover:bg-medium-gray",
        // Industry-specific variants
        defense: "border-transparent bg-red-900 text-red-100 hover:bg-red-800",
        it: "border-transparent bg-dark-gray text-gray-100 hover:bg-medium-gray",
        construction: "border-transparent bg-orange-900 text-orange-100 hover:bg-orange-800",
        healthcare: "border-transparent bg-pink-900 text-pink-100 hover:bg-pink-800",
        // Risk level variants
        "risk-low": "border-transparent bg-green-900 text-green-100",
        "risk-medium": "border-transparent bg-yellow-900 text-yellow-100",
        "risk-high": "border-transparent bg-orange-900 text-orange-100",
        "risk-critical": "border-transparent bg-red-900 text-red-100",
        // Status variants
        active: "border-transparent bg-green-700 text-white",
        inactive: "border-transparent bg-lighter-gray text-gray-300",
        pending: "border-transparent bg-yellow-700 text-yellow-100",
        expired: "border-transparent bg-red-700 text-white",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(badgeVariants({ variant, size }), className)} {...props} />
    )
  }
)
Badge.displayName = "Badge"

// Specialized badge components for the platform
const IndustryBadge = React.forwardRef<
  HTMLDivElement,
  Omit<BadgeProps, 'variant'> & {
    industry: string
  }
>(({ className, industry, ...props }, ref) => {
  const getIndustryVariant = (industry: string) => {
    if (industry.includes('defense')) return 'defense'
    if (industry.includes('information-technology') || industry.includes('it')) return 'it'
    if (industry.includes('construction')) return 'construction'
    if (industry.includes('healthcare')) return 'healthcare'
    return 'secondary'
  }

  return (
    <Badge
      ref={ref}
      variant={getIndustryVariant(industry) as any}
      className={className}
      {...props}
    >
      {industry.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
    </Badge>
  )
})
IndustryBadge.displayName = "IndustryBadge"

const RiskBadge = React.forwardRef<
  HTMLDivElement,
  Omit<BadgeProps, 'variant'> & {
    level: 'low' | 'medium' | 'high' | 'critical'
  }
>(({ className, level, ...props }, ref) => {
  return (
    <Badge
      ref={ref}
      variant={`risk-${level}` as any}
      className={className}
      {...props}
    >
      {level.toUpperCase()}
    </Badge>
  )
})
RiskBadge.displayName = "RiskBadge"

const StatusBadge = React.forwardRef<
  HTMLDivElement,
  Omit<BadgeProps, 'variant'> & {
    status: 'active' | 'inactive' | 'pending' | 'expired' | 'completed'
  }
>(({ className, status, ...props }, ref) => {
  const getVariant = (status: string) => {
    switch (status) {
      case 'active': return 'active'
      case 'inactive': return 'inactive'
      case 'pending': return 'pending'
      case 'expired': return 'expired'
      case 'completed': return 'success'
      default: return 'secondary'
    }
  }

  return (
    <Badge
      ref={ref}
      variant={getVariant(status) as any}
      className={className}
      {...props}
    >
      {status.replace('-', ' ').toUpperCase()}
    </Badge>
  )
})
StatusBadge.displayName = "StatusBadge"

const PerformanceBadge = React.forwardRef<
  HTMLDivElement,
  Omit<BadgeProps, 'variant'> & {
    score: number
    showScore?: boolean
  }
>(({ className, score, showScore = true, ...props }, ref) => {
  const getVariant = (score: number) => {
    if (score >= 95) return 'success'
    if (score >= 90) return 'default'
    if (score >= 80) return 'warning'
    if (score >= 70) return 'secondary'
    return 'destructive'
  }

  const getLabel = (score: number) => {
    if (score >= 95) return 'Excellent'
    if (score >= 90) return 'Very Good'
    if (score >= 80) return 'Good'
    if (score >= 70) return 'Fair'
    return 'Poor'
  }

  return (
    <Badge
      ref={ref}
      variant={getVariant(score)}
      className={className}
      {...props}
    >
      {showScore ? `${score}/100` : getLabel(score)}
    </Badge>
  )
})
PerformanceBadge.displayName = "PerformanceBadge"

const TagBadge = React.forwardRef<
  HTMLDivElement,
  Omit<BadgeProps, 'variant'> & {
    tag: string
    onRemove?: () => void
  }
>(({ className, tag, onRemove, ...props }, ref) => {
  return (
    <Badge
      ref={ref}
      variant="outline"
      className={cn("gap-1", className)}
      {...props}
    >
      {tag}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="ml-1 hover:text-red-400 transition-colors"
        >
          ×
        </button>
      )}
    </Badge>
  )
})
TagBadge.displayName = "TagBadge"

export { 
  Badge, 
  badgeVariants,
  IndustryBadge,
  RiskBadge,
  StatusBadge,
  PerformanceBadge,
  TagBadge
}
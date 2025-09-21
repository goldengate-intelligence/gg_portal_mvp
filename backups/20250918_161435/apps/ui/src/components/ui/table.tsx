import * as React from "react"
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react"
import { cn } from "../../lib/utils"

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto rounded-lg border-2 border-cyan-500/30 bg-black/90 backdrop-blur-xl shadow-[0_0_50px_rgba(0,217,255,0.15)]">
    {/* Tactical grid overlay */}
    <div className="absolute inset-0 opacity-5 pointer-events-none">
      <div className="absolute inset-0 tactical-grid" />
    </div>
    
    {/* HUD Corner accents */}
    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-yellow-400/60" />
    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-yellow-400/60" />
    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-yellow-400/60" />
    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-yellow-400/60" />
    
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm relative z-10", className)}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b border-cyan-500/30 bg-black/70 backdrop-blur-sm", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t-2 border-cyan-500/30 bg-black/70 font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement> & {
    clickable?: boolean
  }
>(({ className, clickable, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b border-cyan-500/20 transition-all duration-200 hover:bg-cyan-500/10 hover:border-cyan-500/40 hover:shadow-[0_0_20px_rgba(0,217,255,0.1)] data-[state=selected]:bg-yellow-500/20 data-[state=selected]:border-yellow-500/50",
      clickable && "cursor-pointer hover:bg-cyan-500/15 group",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement> & {
    sortable?: boolean
    sortDirection?: 'asc' | 'desc' | null
    onSort?: () => void
  }
>(({ className, children, sortable, sortDirection, onSort, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-14 px-6 text-left align-middle font-bold text-yellow-400 uppercase text-xs tracking-widest [&:has([role=checkbox])]:pr-0 font-orbitron bg-gradient-to-r from-black/50 via-cyan-500/5 to-black/50 hover:from-cyan-500/10 hover:via-cyan-500/15 hover:to-cyan-500/10 border-b-2 border-yellow-400/30",
      sortable && "cursor-pointer hover:text-yellow-300 select-none transition-all duration-200 hover:shadow-[0_2px_10px_rgba(255,215,0,0.2)]",
      className
    )}
    onClick={sortable ? onSort : undefined}
    {...props}
  >
    <div className="flex items-center gap-2 group">
      {children}
      {sortable && (
        <span className="ml-auto inline-flex items-center">
          {sortDirection === 'asc' ? (
            <ChevronUp className="h-4 w-4 text-yellow-400 animate-pulse" />
          ) : sortDirection === 'desc' ? (
            <ChevronDown className="h-4 w-4 text-yellow-400 animate-pulse" />
          ) : (
            <ChevronsUpDown className="h-3 w-3 text-cyan-400/70 opacity-70 group-hover:opacity-100 group-hover:text-yellow-400 transition-all duration-200" />
          )}
        </span>
      )}
    </div>
  </th>
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("px-6 py-4 align-middle text-cyan-400/90 font-mono text-sm [&:has([role=checkbox])]:pr-0 transition-all duration-200 group-hover:text-cyan-300", className)}
    {...props}
  />
))
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-gray-400 font-aptos", className)}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

// Sortable table hook
export interface SortConfig<T> {
  key: keyof T | null
  direction: 'asc' | 'desc'
}

export function useSortableData<T>(
  items: T[],
  config: SortConfig<T> | null = null
) {
  const [sortConfig, setSortConfig] = React.useState<SortConfig<T> | null>(config)

  const sortedItems = React.useMemo(() => {
    if (!sortConfig?.key) {
      return items
    }

    const sorted = [...items].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof T]
      const bValue = b[sortConfig.key as keyof T]

      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })

    return sorted
  }, [items, sortConfig])

  const requestSort = (key: keyof T) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === 'asc'
    ) {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const getSortDirection = (key: keyof T): 'asc' | 'desc' | null => {
    if (!sortConfig || sortConfig.key !== key) {
      return null
    }
    return sortConfig.direction
  }

  return { items: sortedItems, requestSort, sortConfig, getSortDirection }
}

// Data table component with built-in features
interface DataTableProps<T> {
  data: T[]
  columns: {
    key: keyof T
    header: string
    sortable?: boolean
    render?: (value: any, item: T) => React.ReactNode
    className?: string
  }[]
  onRowClick?: (item: T) => void
  emptyMessage?: string
  className?: string
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  onRowClick,
  emptyMessage = "No data available",
  className,
}: DataTableProps<T>) {
  const { items, requestSort, getSortDirection } = useSortableData(data)

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-cyan-400/70 font-orbitron bg-black/70 border-2 border-cyan-500/30 rounded-lg backdrop-blur-xl">
        <div className="w-16 h-16 mb-6 border-2 border-yellow-400/50 rounded-full flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-yellow-400/70 rounded-full animate-pulse" />
        </div>
        <div className="text-lg font-bold text-yellow-400 uppercase tracking-wider mb-2">
          NO TARGETS ACQUIRED
        </div>
        <div className="text-sm text-cyan-400/60 font-mono uppercase tracking-wide">
          {emptyMessage.toUpperCase()}
        </div>
      </div>
    )
  }

  return (
    <Table className={className}>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead
              key={String(column.key)}
              sortable={column.sortable}
              sortDirection={getSortDirection(column.key)}
              onSort={column.sortable ? () => requestSort(column.key) : undefined}
              className={column.className}
            >
              {column.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item, index) => (
          <TableRow
            key={index}
            clickable={!!onRowClick}
            onClick={onRowClick ? () => onRowClick(item) : undefined}
            className={index % 2 === 0 ? 'bg-black/30' : 'bg-black/10'}
          >
            {columns.map((column) => (
              <TableCell key={String(column.key)} className={column.className}>
                {column.render
                  ? column.render(item[column.key], item)
                  : String(item[column.key] ?? '')}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

// Specialized contractor table
interface ContractorTableProps {
  contractors: Array<{
    id: string
    name: string
    uei: string
    industry: string
    location: string
    state?: string
    totalContractValue?: number
    pastPerformanceScore?: number
  }>
  onRowClick?: (contractor: any) => void
  className?: string
}

export function ContractorTable({ contractors, onRowClick, className }: ContractorTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value)
  }

  const columns = [
    {
      key: 'name' as const,
      header: 'TARGET DESIGNATION',
      sortable: true,
      render: (value: string, item: any) => (
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-cyan-300 font-semibold group-hover:text-yellow-400 transition-colors">
            {value}
          </span>
        </div>
      ),
    },
    {
      key: 'uei' as const,
      header: 'UEI CODE',
      sortable: false,
      className: 'font-mono text-xs',
      render: (value: string) => (
        <div className="px-2 py-1 bg-black/50 border border-cyan-500/30 rounded font-mono text-xs text-yellow-400">
          {value}
        </div>
      ),
    },
    {
      key: 'industry' as const,
      header: 'SECTOR',
      sortable: true,
      render: (value: string) => (
        <span className="uppercase font-mono text-cyan-400/90">
          {value.replace('-', ' ')}
        </span>
      ),
    },
    {
      key: 'state' as const,
      header: 'AO LOCATION',
      sortable: true,
      render: (_: any, item: any) => (
        <div className="flex items-center gap-2">
          <span className="w-1 h-1 bg-cyan-400 rounded-full" />
          <span className="font-mono text-cyan-400/90 uppercase">
            {item.state || item.location}
          </span>
        </div>
      ),
    },
    {
      key: 'totalContractValue' as const,
      header: 'CONTRACT VALUE',
      sortable: true,
      render: (value: number) => value ? (
        <span className="text-yellow-400 font-bold font-mono">
          {formatCurrency(value)}
        </span>
      ) : (
        <span className="text-gray-500 font-mono">CLASSIFIED</span>
      ),
      className: 'text-right',
    },
    {
      key: 'pastPerformanceScore' as const,
      header: 'THREAT LEVEL',
      sortable: true,
      render: (value: number) => {
        if (!value) return (
          <div className="flex items-center justify-center">
            <span className="px-2 py-1 bg-gray-500/20 border border-gray-500/30 rounded text-gray-400 font-mono text-xs">
              UNKNOWN
            </span>
          </div>
        )
        const color = value >= 90 ? 'bg-red-500/20 border-red-500/50 text-red-400' : 
                     value >= 80 ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400' : 
                     'bg-green-500/20 border-green-500/50 text-green-400'
        const level = value >= 90 ? 'HIGH' : value >= 80 ? 'MEDIUM' : 'LOW'
        return (
          <div className="flex items-center justify-center">
            <div className={`px-2 py-1 border rounded font-mono text-xs font-bold ${color} flex items-center gap-1`}>
              <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              {level}
            </div>
          </div>
        )
      },
      className: 'text-center',
    },
  ]

  return (
    <div className="relative">
      {/* Matrix header bar */}
      <div className="mb-4 px-4 py-2 bg-black/70 border border-cyan-500/30 rounded-t backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-cyan-400 font-orbitron font-bold uppercase tracking-wider">
              MATRIX VIEW • TARGET ANALYSIS
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
            <span>RECORDS:</span>
            <span className="text-yellow-400 font-bold">{contractors.length.toLocaleString()}</span>
          </div>
        </div>
      </div>
      
      <DataTable
        data={contractors}
        columns={columns}
        onRowClick={onRowClick}
        emptyMessage="SCANNING FOR TARGETS"
        className={className}
      />
    </div>
  )
}

// Specialized opportunity table
interface OpportunityTableProps {
  opportunities: Array<{
    id: string
    piid: string
    title: string
    agency: string
    totalValue: number
    responseDeadline?: Date
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
  }>
  onRowClick?: (opportunity: any) => void
  className?: string
}

export function OpportunityTable({ opportunities, onRowClick, className }: OpportunityTableProps) {
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

  const getDaysUntilDeadline = (deadline?: Date) => {
    if (!deadline) return null
    const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return days
  }

  const columns = [
    {
      key: 'piid' as const,
      header: 'PIID',
      sortable: false,
      className: 'font-mono text-xs',
      render: (value: string) => (
        <span className="px-2 py-1 bg-black/50 rounded text-yellow-500/70 border border-yellow-500/10">
          {value}
        </span>
      ),
    },
    {
      key: 'title' as const,
      header: 'Title',
      sortable: true,
      className: 'max-w-md',
      render: (value: string) => (
        <div className="font-medium text-white truncate pr-4" title={value}>
          {value}
        </div>
      ),
    },
    {
      key: 'agency' as const,
      header: 'Agency',
      sortable: true,
    },
    {
      key: 'totalValue' as const,
      header: 'Value',
      sortable: true,
      render: (value: number) => (
        <span className="text-yellow-500 font-semibold">
          {formatCurrency(value)}
        </span>
      ),
      className: 'text-right',
    },
    {
      key: 'responseDeadline' as const,
      header: 'Deadline',
      sortable: true,
      render: (value: Date) => {
        if (!value) return <span className="text-gray-500">N/A</span>
        const days = getDaysUntilDeadline(value)
        const urgencyColor = days && days <= 7 ? 'text-red-400' : days && days <= 14 ? 'text-orange-400' : 'text-gray-300'
        return (
          <div className="flex flex-col gap-1">
            <span className={urgencyColor}>{formatDate(value)}</span>
            {days !== null && days > 0 && (
              <span className="text-xs text-gray-500">{days} days left</span>
            )}
          </div>
        )
      },
    },
    {
      key: 'riskLevel' as const,
      header: 'Risk',
      sortable: true,
      render: (value: string) => {
        const colors = {
          low: 'bg-green-500/10 text-green-400 border-green-500/20',
          medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
          high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
          critical: 'bg-red-500/10 text-red-400 border-red-500/20'
        }
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[value as keyof typeof colors]}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
            {value.toUpperCase()}
          </span>
        )
      },
      className: 'text-center',
    },
  ]

  return (
    <DataTable
      data={opportunities}
      columns={columns}
      onRowClick={onRowClick}
      emptyMessage="No opportunities found"
      className={className}
    />
  )
}

export { 
  Table, 
  TableHeader, 
  TableBody, 
  TableFooter, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableCaption 
}
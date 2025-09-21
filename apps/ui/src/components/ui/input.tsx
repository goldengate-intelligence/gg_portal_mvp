import * as React from "react"
import { cn } from "../../lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
    variant?: 'default' | 'search' | 'filter'
    icon?: React.ReactNode
  }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = 'default', icon, ...props }, ref) => {
    const baseStyles = "flex h-10 w-full rounded-md border px-3 py-2 text-sm font-aptos placeholder:text-yellow-500/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-yellow-500/50 focus-visible:border-yellow-500/50 disabled:cursor-not-allowed disabled:opacity-50 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-yellow-500"
    
    const variants = {
      default: "border-yellow-500/30 bg-black text-yellow-500",
      search: "border-yellow-500/30 bg-black text-yellow-500 pl-10",
      filter: "border-yellow-500/30 bg-black text-yellow-500"
    }

    if (icon) {
      return (
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
          <input
            type={type}
            className={cn(
              baseStyles,
              variants[variant],
              "pl-10",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
      )
    }

    return (
      <input
        type={type}
        className={cn(
          baseStyles,
          variants[variant],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

// Search Input component
const SearchInput = React.forwardRef<HTMLInputElement, Omit<InputProps, 'variant'>>(
  ({ className, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        variant="search"
        placeholder="Search contractors..."
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        }
        className={className}
        {...props}
      />
    )
  }
)
SearchInput.displayName = "SearchInput"

// Filter Input component
const FilterInput = React.forwardRef<HTMLInputElement, Omit<InputProps, 'variant'>>(
  ({ className, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        variant="filter"
        className={cn("h-8 text-xs", className)}
        {...props}
      />
    )
  }
)
FilterInput.displayName = "FilterInput"

// Textarea component
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-yellow-500/30 bg-black px-3 py-2 text-sm text-yellow-500 font-aptos placeholder:text-yellow-500/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-yellow-500/50 focus-visible:border-yellow-500/50 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Input, SearchInput, FilterInput, Textarea }
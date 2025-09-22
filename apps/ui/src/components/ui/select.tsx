import * as React from "react"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "../../logic/utils"

export interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  children?: React.ReactNode
}

export interface SelectItemProps {
  value: string
  children: React.ReactNode
  disabled?: boolean
  className?: string
}

export interface SelectContentProps {
  children: React.ReactNode
  className?: string
}

export interface SelectTriggerProps {
  children: React.ReactNode
  className?: string
}

const SelectContext = React.createContext<{
  value?: string
  onValueChange?: (value: string) => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  disabled?: boolean
}>({
  isOpen: false,
  setIsOpen: () => {},
})

const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  ({ value, onValueChange, disabled, className, children, ...props }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false)
    const selectRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
          setIsOpen(false)
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
      <SelectContext.Provider value={{ value, onValueChange, isOpen, setIsOpen, disabled }}>
        <div 
          ref={selectRef} 
          className={cn("relative", className)} 
          {...props}
        >
          {children}
        </div>
      </SelectContext.Provider>
    )
  }
)
Select.displayName = "Select"

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ children, className, ...props }, ref) => {
    const { isOpen, setIsOpen, disabled } = React.useContext(SelectContext)

    return (
      <button
        ref={ref}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-yellow-500/20 bg-dark-gold px-3 py-2 text-sm text-white font-aptos placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-yellow-500/50 focus:border-yellow-500/50 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDown 
          className={cn(
            "h-4 w-4 text-gray-400 transition-transform duration-200",
            isOpen && "transform rotate-180"
          )} 
        />
      </button>
    )
  }
)
SelectTrigger.displayName = "SelectTrigger"

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ children, className, ...props }, ref) => {
    const { isOpen } = React.useContext(SelectContext)

    if (!isOpen) return null

    return (
      <div
        ref={ref}
        className={cn(
          "absolute z-50 top-full left-0 w-full mt-1 max-h-60 overflow-auto rounded-md border border-yellow-500/20 bg-dark-gold shadow-lg",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ value, children, disabled, className, ...props }, ref) => {
    const { value: selectedValue, onValueChange, setIsOpen } = React.useContext(SelectContext)
    const isSelected = selectedValue === value

    const handleClick = () => {
      if (!disabled && onValueChange) {
        onValueChange(value)
        setIsOpen(false)
      }
    }

    return (
      <div
        ref={ref}
        onClick={handleClick}
        className={cn(
          "flex cursor-pointer items-center px-3 py-2 text-sm text-white font-aptos hover:bg-gold-800 focus:bg-gold-700",
          isSelected && "bg-gold-700",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
        {...props}
      >
        <span className="flex-1">{children}</span>
        {isSelected && <Check className="h-4 w-4 text-yellow-500" />}
      </div>
    )
  }
)
SelectItem.displayName = "SelectItem"

const SelectValue = React.forwardRef<HTMLSpanElement, { 
  placeholder?: string
  className?: string 
}>(
  ({ placeholder, className, ...props }, ref) => {
    const { value } = React.useContext(SelectContext)

    return (
      <span
        ref={ref}
        className={cn(
          value ? "text-white" : "text-gray-400",
          className
        )}
        {...props}
      >
        {value || placeholder}
      </span>
    )
  }
)
SelectValue.displayName = "SelectValue"

// Multi-select component
interface MultiSelectProps {
  values: string[]
  onValuesChange: (values: string[]) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  children: React.ReactNode
}

const MultiSelectContext = React.createContext<{
  values: string[]
  onValuesChange: (values: string[]) => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  disabled?: boolean
}>({
  values: [],
  onValuesChange: () => {},
  isOpen: false,
  setIsOpen: () => {},
})

const MultiSelect = React.forwardRef<HTMLDivElement, MultiSelectProps>(
  ({ values, onValuesChange, disabled, className, children, ...props }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false)
    const selectRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
          setIsOpen(false)
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
      <MultiSelectContext.Provider value={{ values, onValuesChange, isOpen, setIsOpen, disabled }}>
        <div 
          ref={selectRef} 
          className={cn("relative", className)} 
          {...props}
        >
          {children}
        </div>
      </MultiSelectContext.Provider>
    )
  }
)
MultiSelect.displayName = "MultiSelect"

const MultiSelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ children, className, ...props }, ref) => {
    const { isOpen, setIsOpen, disabled } = React.useContext(MultiSelectContext)

    return (
      <button
        ref={ref}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-yellow-500/20 bg-dark-gold px-3 py-2 text-sm text-white font-aptos placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-yellow-500/50 focus:border-yellow-500/50 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      >
        <div className="flex flex-wrap gap-1 flex-1 min-h-[20px]">
          {children}
        </div>
        <ChevronDown 
          className={cn(
            "h-4 w-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ml-2",
            isOpen && "transform rotate-180"
          )} 
        />
      </button>
    )
  }
)
MultiSelectTrigger.displayName = "MultiSelectTrigger"

const MultiSelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ children, className, ...props }, ref) => {
    const { isOpen } = React.useContext(MultiSelectContext)

    if (!isOpen) return null

    return (
      <div
        ref={ref}
        className={cn(
          "absolute z-50 top-full left-0 w-full mt-1 max-h-60 overflow-auto rounded-md border border-yellow-500/20 bg-dark-gold shadow-lg",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
MultiSelectContent.displayName = "MultiSelectContent"

const MultiSelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ value, children, disabled, className, ...props }, ref) => {
    const { values, onValuesChange } = React.useContext(MultiSelectContext)
    const isSelected = values.includes(value)

    const handleClick = () => {
      if (!disabled && onValuesChange) {
        if (isSelected) {
          onValuesChange(values.filter(v => v !== value))
        } else {
          onValuesChange([...values, value])
        }
      }
    }

    return (
      <div
        ref={ref}
        onClick={handleClick}
        className={cn(
          "flex cursor-pointer items-center px-3 py-2 text-sm text-white font-aptos hover:bg-gold-800 focus:bg-gold-700",
          isSelected && "bg-gold-700",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
        {...props}
      >
        <span className="flex-1">{children}</span>
        {isSelected && <Check className="h-4 w-4 text-yellow-500" />}
      </div>
    )
  }
)
MultiSelectItem.displayName = "MultiSelectItem"

export {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  MultiSelect,
  MultiSelectTrigger,
  MultiSelectContent,
  MultiSelectItem,
}
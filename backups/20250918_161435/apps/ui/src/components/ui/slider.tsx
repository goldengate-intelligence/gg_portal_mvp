import * as React from "react"
import { cn } from "../../lib/utils"

interface SliderProps {
  value?: number[]
  onValueChange?: (value: number[]) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  className?: string
  showValue?: boolean
  formatValue?: (value: number) => string
  marks?: { value: number; label?: string }[]
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  ({ 
    value = [0], 
    onValueChange, 
    min = 0, 
    max = 100, 
    step = 1, 
    disabled = false,
    className,
    showValue = false,
    formatValue,
    marks,
    ...props 
  }, ref) => {
    const [internalValue, setInternalValue] = React.useState(value)
    const [isDragging, setIsDragging] = React.useState(false)
    const sliderRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
      setInternalValue(value)
    }, [value])

    const percentage = ((internalValue[0] - min) / (max - min)) * 100

    const handleMouseDown = (e: React.MouseEvent) => {
      if (disabled) return
      setIsDragging(true)
      updateValue(e)
    }

    const updateValue = (e: MouseEvent | React.MouseEvent) => {
      if (!sliderRef.current || disabled) return

      const rect = sliderRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
      const newValue = min + (percentage / 100) * (max - min)
      
      // Round to step
      const steppedValue = Math.round(newValue / step) * step
      const clampedValue = Math.max(min, Math.min(max, steppedValue))
      
      setInternalValue([clampedValue])
      onValueChange?.([clampedValue])
    }

    React.useEffect(() => {
      if (!isDragging) return

      const handleMouseMove = (e: MouseEvent) => updateValue(e)
      const handleMouseUp = () => setIsDragging(false)

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }, [isDragging, min, max, step, disabled])

    const displayValue = formatValue ? formatValue(internalValue[0]) : internalValue[0]

    return (
      <div className={cn("relative w-full", className)} ref={ref} {...props}>
        {showValue && (
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-400 font-aptos">{formatValue ? formatValue(min) : min}</span>
            <span className="text-sm text-yellow-500 font-aptos font-medium">{displayValue}</span>
            <span className="text-sm text-gray-400 font-aptos">{formatValue ? formatValue(max) : max}</span>
          </div>
        )}
        
        <div
          ref={sliderRef}
          className={cn(
            "relative h-2 w-full rounded-full bg-gray-700",
            disabled && "opacity-50 cursor-not-allowed",
            !disabled && "cursor-pointer"
          )}
          onMouseDown={handleMouseDown}
        >
          {/* Track fill */}
          <div
            className="absolute h-full rounded-full bg-yellow-500"
            style={{ width: `${percentage}%` }}
          />
          
          {/* Thumb */}
          <div
            className={cn(
              "absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-2 border-yellow-500 bg-gray-900 shadow-md transition-shadow",
              !disabled && "hover:shadow-lg hover:shadow-yellow-500/25",
              isDragging && "shadow-lg shadow-yellow-500/25"
            )}
            style={{ left: `calc(${percentage}% - 10px)` }}
          />
          
          {/* Marks */}
          {marks && marks.map((mark) => {
            const markPercentage = ((mark.value - min) / (max - min)) * 100
            return (
              <div
                key={mark.value}
                className="absolute top-1/2 -translate-y-1/2"
                style={{ left: `${markPercentage}%` }}
              >
                <div className="h-2 w-0.5 bg-gray-600" />
                {mark.label && (
                  <span className="absolute top-4 left-1/2 -translate-x-1/2 text-xs text-gray-500 font-aptos whitespace-nowrap">
                    {mark.label}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)
Slider.displayName = "Slider"

// Range Slider (two handles)
interface RangeSliderProps {
  value?: [number, number]
  onValueChange?: (value: [number, number]) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  className?: string
  showValue?: boolean
  formatValue?: (value: number) => string
}

const RangeSlider = React.forwardRef<HTMLDivElement, RangeSliderProps>(
  ({ 
    value = [0, 100], 
    onValueChange, 
    min = 0, 
    max = 100, 
    step = 1, 
    disabled = false,
    className,
    showValue = false,
    formatValue,
    ...props 
  }, ref) => {
    const [internalValue, setInternalValue] = React.useState(value)
    const [draggingIndex, setDraggingIndex] = React.useState<number | null>(null)
    const sliderRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
      setInternalValue(value)
    }, [value])

    const percentages = [
      ((internalValue[0] - min) / (max - min)) * 100,
      ((internalValue[1] - min) / (max - min)) * 100,
    ]

    const handleMouseDown = (index: number) => (e: React.MouseEvent) => {
      if (disabled) return
      e.stopPropagation()
      setDraggingIndex(index)
    }

    const updateValue = (e: MouseEvent) => {
      if (!sliderRef.current || disabled || draggingIndex === null) return

      const rect = sliderRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
      const newValue = min + (percentage / 100) * (max - min)
      
      // Round to step
      const steppedValue = Math.round(newValue / step) * step
      const clampedValue = Math.max(min, Math.min(max, steppedValue))
      
      const newValues: [number, number] = [...internalValue] as [number, number]
      newValues[draggingIndex] = clampedValue
      
      // Ensure min <= max
      if (draggingIndex === 0 && clampedValue > newValues[1]) {
        newValues[0] = newValues[1]
      } else if (draggingIndex === 1 && clampedValue < newValues[0]) {
        newValues[1] = newValues[0]
      } else {
        newValues[draggingIndex] = clampedValue
      }
      
      setInternalValue(newValues)
      onValueChange?.(newValues)
    }

    React.useEffect(() => {
      if (draggingIndex === null) return

      const handleMouseMove = (e: MouseEvent) => updateValue(e)
      const handleMouseUp = () => setDraggingIndex(null)

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }, [draggingIndex, min, max, step, disabled, internalValue])

    const displayValues = internalValue.map(v => formatValue ? formatValue(v) : v)

    return (
      <div className={cn("relative w-full", className)} ref={ref} {...props}>
        {showValue && (
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-400 font-aptos">{formatValue ? formatValue(min) : min}</span>
            <span className="text-sm text-yellow-500 font-aptos font-medium">
              {displayValues[0]} - {displayValues[1]}
            </span>
            <span className="text-sm text-gray-400 font-aptos">{formatValue ? formatValue(max) : max}</span>
          </div>
        )}
        
        <div
          ref={sliderRef}
          className={cn(
            "relative h-2 w-full rounded-full bg-gray-700",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {/* Track fill between handles */}
          <div
            className="absolute h-full bg-yellow-500"
            style={{
              left: `${percentages[0]}%`,
              width: `${percentages[1] - percentages[0]}%`,
            }}
          />
          
          {/* Thumbs */}
          {[0, 1].map((index) => (
            <div
              key={index}
              className={cn(
                "absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-2 border-yellow-500 bg-gray-900 shadow-md transition-shadow cursor-pointer",
                !disabled && "hover:shadow-lg hover:shadow-yellow-500/25",
                draggingIndex === index && "shadow-lg shadow-yellow-500/25 z-10"
              )}
              style={{ left: `calc(${percentages[index]}% - 10px)` }}
              onMouseDown={handleMouseDown(index)}
            />
          ))}
        </div>
      </div>
    )
  }
)
RangeSlider.displayName = "RangeSlider"

// Exponential Value Slider (for contract values)
interface ExponentialSliderProps {
  value?: number
  onValueChange?: (value: number) => void
  min?: number
  max?: number
  disabled?: boolean
  className?: string
}

export const ExponentialSlider = React.forwardRef<HTMLDivElement, ExponentialSliderProps>(
  ({ value = 0, onValueChange, min = 0, max = 10000000000, disabled = false, className, ...props }, ref) => {
    // Convert linear slider position to exponential value
    const valueToPosition = (val: number) => {
      if (val <= min) return 0
      if (val >= max) return 100
      const minLog = Math.log(min || 1)
      const maxLog = Math.log(max)
      const scale = (Math.log(val) - minLog) / (maxLog - minLog)
      return scale * 100
    }

    // Convert exponential value to linear slider position
    const positionToValue = (pos: number) => {
      const minLog = Math.log(min || 1)
      const maxLog = Math.log(max)
      const scale = pos / 100
      const value = Math.exp(minLog + scale * (maxLog - minLog))
      return Math.round(value)
    }

    const formatCurrency = (val: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
        maximumFractionDigits: 1
      }).format(val)
    }

    const marks = [
      { value: 10000, label: '$10K' },
      { value: 100000, label: '$100K' },
      { value: 1000000, label: '$1M' },
      { value: 10000000, label: '$10M' },
      { value: 100000000, label: '$100M' },
      { value: 1000000000, label: '$1B' },
    ].filter(m => m.value >= min && m.value <= max)

    const [sliderValue, setSliderValue] = React.useState([valueToPosition(value || min)])

    const handleChange = (newValue: number[]) => {
      const actualValue = positionToValue(newValue[0])
      setSliderValue(newValue)
      onValueChange?.(actualValue)
    }

    return (
      <Slider
        ref={ref}
        value={sliderValue}
        onValueChange={handleChange}
        min={0}
        max={100}
        step={1}
        disabled={disabled}
        className={className}
        showValue={true}
        formatValue={(v) => formatCurrency(positionToValue(v))}
        marks={marks.map(m => ({ value: valueToPosition(m.value), label: m.label }))}
        {...props}
      />
    )
  }
)
ExponentialSlider.displayName = "ExponentialSlider"

export { Slider, RangeSlider }
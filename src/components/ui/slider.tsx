"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SingleSliderProps {
  value: number
  onValueChange: (value: number) => void
  min: number
  max: number
  step?: number
  className?: string
  disabled?: boolean
  range?: false
}

interface RangeSliderProps {
  value: [number, number]
  onValueChange: (value: [number, number]) => void
  min: number
  max: number
  step?: number
  className?: string
  disabled?: boolean
  range: true
}

type SliderProps = SingleSliderProps | RangeSliderProps

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  ({ min, max, step = 1, className, disabled = false, range = false, ...props }, ref) => {
    // Always call hooks at the top level
    const [isDragging, setIsDragging] = React.useState<'min' | 'max' | null>(null)
    const sliderRef = React.useRef<HTMLDivElement>(null)
    
    if (range) {
      const { value, onValueChange } = props as RangeSliderProps
      const [minVal, maxVal] = value
      
      const getValueFromPosition = (clientX: number) => {
        const rect = sliderRef.current?.getBoundingClientRect()
        if (!rect) return minVal
        
        const percentage = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100))
        const newValue = ((percentage / 100) * (max - min) + min)
        return Math.round(newValue / step) * step
      }
      
      const handleMouseDown = (thumb: 'min' | 'max') => (e: React.MouseEvent) => {
        if (disabled) return
        e.preventDefault()
        setIsDragging(thumb)
        
        const handleMouseMove = (moveEvent: MouseEvent) => {
          const newValue = getValueFromPosition(moveEvent.clientX)
          const clampedValue = Math.max(min, Math.min(max, newValue))
          
          if (thumb === 'min') {
            onValueChange([Math.min(clampedValue, maxVal), maxVal])
          } else {
            onValueChange([minVal, Math.max(clampedValue, minVal)])
          }
        }
        
        const handleMouseUp = () => {
          setIsDragging(null)
          document.removeEventListener('mousemove', handleMouseMove)
          document.removeEventListener('mouseup', handleMouseUp)
        }
        
        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
      }
      
      const handleTrackClick = (e: React.MouseEvent) => {
        if (disabled || isDragging) return
        
        const newValue = getValueFromPosition(e.clientX)
        const clampedValue = Math.max(min, Math.min(max, newValue))
        
        // Determine which thumb is closer and update that one
        const distToMin = Math.abs(clampedValue - minVal)
        const distToMax = Math.abs(clampedValue - maxVal)
        
        if (distToMin <= distToMax) {
          onValueChange([Math.min(clampedValue, maxVal), maxVal])
        } else {
          onValueChange([minVal, Math.max(clampedValue, minVal)])
        }
      }
      
      const minPercentage = ((minVal - min) / (max - min)) * 100
      const maxPercentage = ((maxVal - min) / (max - min)) * 100
      
      return (
        <div ref={ref} className={cn("relative flex items-center select-none touch-none", className)}>
          <div 
            ref={sliderRef}
            className="relative flex-1 h-2 bg-gray-700 rounded-lg cursor-pointer"
            onClick={handleTrackClick}
          >
            {/* Active range */}
            <div 
              className="absolute h-2 bg-cyan-600 rounded-lg pointer-events-none"
              style={{ 
                left: `${minPercentage}%`, 
                width: `${maxPercentage - minPercentage}%` 
              }}
            />
            
            {/* Min thumb */}
            <div
              className="absolute w-4 h-4 bg-white border-2 border-cyan-600 rounded-full shadow-md transform -translate-y-1 cursor-pointer hover:scale-110 transition-transform z-10"
              style={{ left: `calc(${minPercentage}% - 8px)` }}
              onMouseDown={handleMouseDown('min')}
            />
            
            {/* Max thumb */}
            <div
              className="absolute w-4 h-4 bg-white border-2 border-cyan-600 rounded-full shadow-md transform -translate-y-1 cursor-pointer hover:scale-110 transition-transform z-10"
              style={{ left: `calc(${maxPercentage}% - 8px)` }}
              onMouseDown={handleMouseDown('max')}
            />
          </div>
          
          <div className="ml-3 min-w-[4rem] text-right text-sm text-gray-300">
            {typeof minVal === 'number' && minVal % 1 !== 0 ? minVal.toFixed(1) : minVal} - {typeof maxVal === 'number' && maxVal % 1 !== 0 ? maxVal.toFixed(1) : maxVal}
          </div>
        </div>
      )
    } else {
      const { value, onValueChange } = props as SingleSliderProps
      
      return (
        <div className={cn("relative flex items-center select-none touch-none", className)}>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onValueChange(Number(e.target.value))}
            disabled={disabled}
            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #0891b2 0%, #0891b2 ${((value - min) / (max - min)) * 100}%, #374151 ${((value - min) / (max - min)) * 100}%, #374151 100%)`
            }}
          />
          <div className="ml-3 min-w-[3rem] text-right text-sm text-gray-300">
            {value}
          </div>
          
          <style jsx>{`
            .slider::-webkit-slider-thumb {
              appearance: none;
              height: 16px;
              width: 16px;
              border-radius: 50%;
              background: #ffffff;
              border: 2px solid #0891b2;
              cursor: pointer;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            }
            
            .slider::-moz-range-thumb {
              height: 16px;
              width: 16px;
              border-radius: 50%;
              background: #ffffff;
              border: 2px solid #0891b2;
              cursor: pointer;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            }
          `}</style>
        </div>
      )
    }
  }
)
Slider.displayName = "Slider"

export { Slider }

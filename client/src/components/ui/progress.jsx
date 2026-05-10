import React from 'react'
import { cn } from '../../lib/utils'

export function Progress({ value = 0, className, indicatorClassName }) {
  const clamped = Math.max(0, Math.min(100, value))

  return (
    <div
      className={cn(
        'h-2 w-full overflow-hidden rounded-full bg-surface-container-high',
        className
      )}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
    >
      <div
        className={cn(
          'h-full rounded-full transition-all duration-300',
          indicatorClassName
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}

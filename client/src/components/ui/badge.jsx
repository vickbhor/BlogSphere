import React from 'react'
import { cn } from '../../lib/utils'

export function Badge({ className, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-outline-variant/40 bg-surface-container px-2.5 py-1 text-xs font-semibold text-on-surface',
        className
      )}
      {...props}
    />
  )
}

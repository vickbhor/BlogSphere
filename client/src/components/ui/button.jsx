import React from 'react'
import { cn } from '../../lib/utils'

const variants = {
  default:
    'bg-primary text-on-primary hover:brightness-110 shadow-lg shadow-primary/20',
  outline:
    'border border-outline-variant/70 bg-surface-container/70 text-on-surface hover:bg-surface-container-high',
  ghost: 'text-on-surface hover:bg-surface-container-high/70',
}

const sizes = {
  default: 'h-11 px-4 py-2 text-sm',
  lg: 'h-12 px-5 text-base',
  icon: 'h-11 w-11',
}

export const Button = React.forwardRef(function Button(
  {
    className,
    variant = 'default',
    size = 'default',
    type = 'button',
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-60',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
})

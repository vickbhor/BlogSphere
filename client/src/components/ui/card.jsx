import React from 'react'
import { cn } from '../../lib/utils'

export function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        'rounded-3xl border border-outline-variant/35 bg-surface/55 backdrop-blur-xl shadow-[0_12px_40px_-18px_rgba(0,0,0,0.35)]',
        className
      )}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }) {
  return <div className={cn('px-6 pt-6', className)} {...props} />
}

export function CardTitle({ className, ...props }) {
  return (
    <h3
      className={cn(
        'text-lg font-headline font-bold text-on-surface',
        className
      )}
      {...props}
    />
  )
}

export function CardContent({ className, ...props }) {
  return <div className={cn('px-6 pb-6', className)} {...props} />
}

import React, { createContext, useContext, useMemo, useState } from 'react'
import { cn } from '../../lib/utils'

const TabsContext = createContext(null)

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  className,
  children,
}) {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const activeValue = value ?? internalValue

  const setValue = (next) => {
    onValueChange?.(next)
    if (value === undefined) setInternalValue(next)
  }

  const contextValue = useMemo(
    () => ({ value: activeValue, setValue }),
    [activeValue]
  )

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={cn('w-full', className)}>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabsList({ className, ...props }) {
  return (
    <div
      className={cn(
        'inline-flex h-11 items-center rounded-xl bg-surface-container p-1 text-on-surface-variant',
        className
      )}
      {...props}
    />
  )
}

export function TabsTrigger({ value, className, children, ...props }) {
  const context = useContext(TabsContext)
  if (!context) return null

  const active = context.value === value

  return (
    <button
      type="button"
      onClick={() => context.setValue(value)}
      className={cn(
        'inline-flex h-9 items-center justify-center rounded-lg px-3 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        active
          ? 'bg-surface text-on-surface shadow-sm'
          : 'hover:text-on-surface',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function TabsContent({ value, className, children }) {
  const context = useContext(TabsContext)
  if (!context || context.value !== value) return null

  return <div className={cn('mt-5', className)}>{children}</div>
}

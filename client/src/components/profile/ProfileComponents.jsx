import React from 'react'
import { motion } from 'framer-motion'

// STAT CARD COMPONENT

export function StatCard({ icon: Icon, value, label, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4 }}
      className="group flex flex-col items-center gap-2 rounded-2xl border border-outline-variant/35 bg-surface-container/70 p-5 transition-all hover:shadow-[0_14px_40px_-20px_rgba(0,0,0,0.5)]"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary transition-transform group-hover:scale-110">
        <Icon size={18} />
      </div>
      <span className="text-2xl font-headline font-extrabold text-on-surface">
        {value ?? 0}
      </span>
      <span className="text-xs text-on-surface-variant font-medium uppercase tracking-widest">
        {label}
      </span>
    </motion.div>
  )
}

// PROFILE FIELD COMPONENT

export function ProfileField({ icon: Icon, label, value }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3 border-b border-outline-variant/20 py-3 last:border-0">
      <Icon size={16} className="text-primary mt-0.5 flex-shrink-0" />
      <div className="min-w-0">
        <p className="mb-0.5 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
          {label}
        </p>
        <p className="text-sm text-on-surface break-all">{value}</p>
      </div>
    </div>
  )
}

// MAIN COMPONENT

export function SocialPill({ label, url, icon: Icon }) {
  if (!url) return null
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-high hover:bg-surface-container-highest transition-colors"
    >
      <Icon size={14} className="text-on-surface-variant" />
      <span className="text-xs font-semibold text-on-surface-variant group-hover:text-on-surface">
        {label}
      </span>
    </a>
  )
}

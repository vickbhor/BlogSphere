import React, { useEffect } from 'react'
import { motion } from 'framer-motion'

export default function About() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="layout-container pb-24 relative overflow-hidden">
      <div className="absolute top-20 right-0 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[150px] mix-blend-screen -z-10 pointer-events-none" />

      <div className="pt-12 md:pt-24 mb-16 max-w-3xl border-b border-border/50 pb-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 mb-8 text-sm font-label uppercase tracking-widest text-primary"
        >
          About Our Publication
        </motion.div>
        <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tighter mb-8 leading-tight">
          Curating the <br />{' '}
          <span className="text-gray-500 italic font-light">Intersection</span>{' '}
          of Code & Art.
        </h1>
        <p className="text-xl text-muted-foreground font-body leading-relaxed">
          Velora Journal is a premium editorial destination established in 2026.
          We believe that frontend engineering has evolved past functional
          requirements to become a true medium of artistic expression.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        <div>
          <h2 className="text-3xl font-display font-bold mb-6">
            Our Philosophy
          </h2>
          <div className="prose prose-lg dark:prose-invert font-body text-muted-foreground leading-loose">
            <p>
              We reject the rigid, boxed-in constraints of traditional web
              design. Instead, we champion the "Luminous Archive"—a digital
              space that feels like a high-end physical gallery where content is
              curated, not just displayed.
            </p>
            <p>
              Our articles dive deep into the technical implementation of these
              aesthetics. From complex WebGL shaders to accessible color
              layering and typography scales, our writers are lead engineers and
              creative directors at top-tier firms.
            </p>
          </div>
        </div>
        <div className="glass-card rounded-3xl p-10 flex flex-col items-start justify-center text-center">
          <h3 className="text-2xl font-display font-bold text-foreground mb-4 w-full">
            Join the Collective
          </h3>
          <p className="font-body text-muted-foreground mb-8 w-full">
            We are always looking for insightful technical writers and
            boundary-pushing designers.
          </p>
          <button className="px-8 py-4 w-full rounded-full bg-primary text-primary-foreground font-label uppercase tracking-widest font-bold text-sm hover:glow-primary transition-all duration-300">
            Pitch an Article
          </button>
        </div>
      </div>
    </div>
  )
}

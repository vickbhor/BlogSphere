import React, { memo } from 'react'
import { Link } from 'react-router-dom'
import { Mail, MessageCircle, Share2, Globe } from 'lucide-react'
import { APP_CONFIG } from '../constants'

const Footer = memo(function Footer() {
  return (
    <footer className="bg-surface-container-low pt-24 pb-12 mt-20 border-t border-border/50">
      <div className="layout-container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <Link
              to="/"
              className="text-3xl font-display font-bold tracking-tighter flex items-center gap-2 mb-6"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-primary-foreground text-lg shadow-[0_0_15px_-3px_hsl(var(--primary))]">
                V
              </div>
              Velora<span className="text-primary font-light">Journal</span>
            </Link>
            <p className="text-muted-foreground font-body max-w-sm leading-relaxed mb-8">
              The premium editorial destination for modern creatives,
              developers, and designers seeking inspiration and insight.
            </p>
            <div className="flex space-x-4">
              {[Mail, MessageCircle, Share2, Globe].map((Icon, idx) => (
                <a
                  key={idx}
                  href="#"
                  aria-label={`Social icon ${idx + 1}`}
                  className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold text-lg mb-6 tracking-tight">
              Features
            </h4>
            <ul className="space-y-4 font-body text-muted-foreground">
              <li>
                <Link
                  to="/blogs?category=Lifestyle"
                  className="hover:text-primary transition-colors"
                >
                  Lifestyle Trends
                </Link>
              </li>
              <li>
                <Link
                  to="/blogs?category=Technology"
                  className="hover:text-primary transition-colors"
                >
                  Frontend Architecture
                </Link>
              </li>
              <li>
                <Link
                  to="/blogs?category=Entertainment"
                  className="hover:text-primary transition-colors"
                >
                  Entertainment News
                </Link>
              </li>
              <li>
                <Link
                  to="/blogs?category=Travel"
                  className="hover:text-primary transition-colors"
                >
                  Travel Guides
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-lg mb-6 tracking-tight">
              Company
            </h4>
            <ul className="space-y-4 font-body text-muted-foreground">
              <li>
                <Link
                  to="/about"
                  className="hover:text-primary transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Advertising
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-border/50 text-sm font-label text-muted-foreground uppercase tracking-widest">
          <p>
            &copy; {new Date().getFullYear()} {APP_CONFIG.APP_NAME}. All rights
            reserved.
          </p>
          <div className="flex justify-center space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-primary transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
})

export default Footer

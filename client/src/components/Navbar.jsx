import React, { useState, memo } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, Search, Moon, Sun, LogOut, PenTool } from 'lucide-react'
import { useTheme } from './ThemeProvider'
import { cn } from '../lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { APP_CONFIG } from '../constants'

const Navbar = memo(function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
    setIsOpen(false)
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const handleSearchClick = () => {
    if (location.pathname === '/') {
      window.dispatchEvent(new CustomEvent('focusSearch'))
    } else {
      navigate('/blogs')
    }
  }

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Blogs', path: '/blogs' },
    { name: 'Authors', path: '/authors' },
    { name: 'About', path: '/about' },
  ]

  const renderThemeToggle = () => (
    <button
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className="p-2 hover:bg-slate-100/50 dark:hover:bg-white/10 rounded-full transition-all scale-95 active:scale-90 duration-200 text-on-surface-variant flex items-center justify-center"
    >
      <AnimatePresence mode="wait">
        {theme === 'dark' ? (
          <motion.div
            key="moon"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Sun size={20} />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Moon size={20} />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  )

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/60 dark:bg-[#161926]/60 backdrop-blur-xl shadow-sm dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
      <div className="flex justify-between items-center px-4 sm:px-8 py-4 max-w-7xl mx-auto font-headline font-medium tracking-tight">
        <Link
          to="/"
          className="text-xl sm:text-2xl font-bold tracking-tighter text-slate-900 dark:text-[#ffdd79]"
        >
          {APP_CONFIG.APP_NAME}
        </Link>

        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => {
            const isActive =
              location.pathname === link.path ||
              (link.path !== '/' && location.pathname.startsWith(link.path))
            return (
              <Link
                key={link.name}
                to={link.path}
                className={cn(
                  'transition-colors text-sm md:text-base',
                  isActive
                    ? 'text-primary border-b-2 border-primary pb-1 font-bold'
                    : 'text-on-surface-variant hover:text-on-surface'
                )}
              >
                {link.name}
              </Link>
            )
          })}
        </div>

        <div className="flex md:hidden items-center space-x-2">
          {renderThemeToggle()}

          <button
            onClick={handleSearchClick}
            aria-label="Search"
            className="p-2 hover:bg-slate-100/50 dark:hover:bg-white/10 rounded-full transition-all scale-95 active:scale-90 duration-200 text-on-surface-variant flex items-center justify-center"
          >
            <Search size={18} />
          </button>

          <button
            className="md:hidden text-foreground p-2"
            aria-label="Toggle menu"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <div className="hidden md:flex items-center space-x-6">
          <div className="flex items-center space-x-4">
            {renderThemeToggle()}
            <button
              onClick={handleSearchClick}
              aria-label="Search"
              className="p-2 hover:bg-slate-100/50 dark:hover:bg-white/10 rounded-full transition-all scale-95 active:scale-90 duration-200 text-on-surface-variant flex items-center justify-center"
            >
              <Search size={20} />
            </button>
          </div>
          <div className="h-6 w-px bg-outline-variant opacity-20"></div>
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/write-blog"
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-all font-bold text-sm"
              >
                <PenTool size={16} /> Write
              </Link>
              <Link
                to="/my-profile"
                className="flex items-center gap-2 group hover:text-primary transition-colors max-w-[150px] lg:max-w-xs"
              >
                <span className="text-sm font-semibold text-on-surface truncate">
                  {user.name || user.email}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-outline-variant/50 text-sm font-bold text-on-surface-variant hover:text-rose-500 hover:border-rose-500/50 transition-all"
              >
                <LogOut size={15} /> Logout
              </button>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="text-on-surface-variant hover:text-on-surface transition-colors font-medium text-sm"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-6 py-2.5 bg-primary text-on-primary rounded-full font-bold scale-95 active:scale-90 duration-200 shadow-lg shadow-primary/10 inline-block text-sm"
              >
                Subscribe
              </Link>
            </>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-t border-border w-full overflow-hidden"
          >
            <div className="flex flex-col space-y-4 p-6 font-headline">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="text-lg font-medium text-foreground/90 hover:text-primary transition-colors"
                >
                  {link.name}
                </Link>
              ))}

              <div className="border-t border-border pt-4 mt-4 space-y-3">
                {user ? (
                  <>
                    <Link
                      to="/write-blog"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-semibold"
                    >
                      <PenTool size={18} />
                      <span>Write Blog</span>
                    </Link>
                    <Link
                      to="/my-profile"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 rounded-lg bg-surface-container/50 hover:bg-surface-container transition-colors text-foreground font-semibold"
                    >
                      <span>{user.name || user.email}</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-3 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 transition-colors text-rose-500 font-semibold"
                    >
                      <LogOut size={18} />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="w-full px-4 py-3 rounded-lg bg-surface-container/50 hover:bg-surface-container transition-colors text-foreground font-semibold text-center"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsOpen(false)}
                      className="w-full px-4 py-3 rounded-lg bg-primary text-on-primary hover:bg-primary/90 transition-colors font-bold text-center"
                    >
                      Subscribe
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-0 left-0 w-full h-0.5 z-40 bg-transparent">
        <div className="h-full bg-primary w-1/3 shadow-[0_0_10px_#ffdd79]"></div>
      </div>
    </nav>
  )
})

export default Navbar

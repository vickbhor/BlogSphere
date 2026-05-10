import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, ArrowRight, Loader2, RefreshCw } from 'lucide-react'
import { getAuthPayload, verifyOtp, resendOtp } from '../services/authApi'
import { useAuth } from '../context/AuthContext'
import { toast } from '../components/Toast'

export default function OtpVerify() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const email = location.state?.email || ''

  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const refs = useRef([])

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  // Guard: if no email, push back to register
  useEffect(() => {
    if (!email) navigate('/register')
  }, [email, navigate])

  const handleDigit = (index, value) => {
    const clean = value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = clean
    setDigits(next)
    if (clean && index < 5) refs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (paste.length === 6) {
      setDigits(paste.split(''))
      refs.current[5]?.focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const otp = digits.join('')
    if (otp.length < 6) {
      toast('Please enter the 6-digit OTP.', 'error')
      return
    }
    setLoading(true)
    try {
      const data = await verifyOtp({ email, otp })
      const auth = getAuthPayload(data, { email })
      login(auth.user, auth.token)
      toast(
        data.message || 'Email verified! Welcome to Velora Journal.',
        'success'
      )
      navigate('/')
    } catch (err) {
      toast(err.message || 'Invalid OTP. Please check and try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (countdown > 0) return
    setResending(true)
    try {
      const data = await resendOtp({ email })
      toast(data.message || 'OTP resent to your email!', 'success')
      setCountdown(60)
      setDigits(['', '', '', '', '', ''])
      refs.current[0]?.focus()
    } catch (err) {
      toast(err.message || 'Failed to resend OTP.', 'error')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(at_50%_30%,hsl(var(--primary)/0.12)_0px,transparent_60%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <Link
            to="/"
            className="inline-block text-2xl font-headline font-bold tracking-tighter text-primary mb-8"
          >
            Velora Journal
          </Link>
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ repeat: Infinity, repeatDelay: 3, duration: 0.5 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20 mb-6 text-primary"
          >
            <ShieldCheck size={30} />
          </motion.div>
          <h1 className="text-4xl font-headline font-extrabold tracking-tight mb-2 text-on-surface">
            Verify your email
          </h1>
          <p className="text-on-surface-variant text-sm">
            We sent a 6-digit code to{' '}
            <span className="font-bold text-on-surface">{email}</span>
          </p>
        </div>

        <div className="bg-surface-container-low border border-outline-variant/40 rounded-[2rem] p-8 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* OTP Inputs */}
            <div className="flex justify-center gap-3" onPaste={handlePaste}>
              {digits.map((d, i) => (
                <motion.input
                  key={i}
                  ref={(el) => (refs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleDigit(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  whileFocus={{ scale: 1.08 }}
                  className={`w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 bg-surface-container transition-all duration-200 outline-none text-on-surface ${d ? 'border-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.15)]' : 'border-outline-variant/50 focus:border-primary'}`}
                />
              ))}
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.97 }}
              className="w-full py-3.5 rounded-xl bg-primary text-on-primary font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Verifying...
                </>
              ) : (
                <>
                  Verify OTP <ArrowRight size={18} />
                </>
              )}
            </motion.button>
          </form>

          {/* Resend Section */}
          <div className="mt-6 text-center">
            <p className="text-sm text-on-surface-variant mb-3">
              Didn't receive it?
            </p>
            <button
              onClick={handleResend}
              disabled={countdown > 0 || resending}
              className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline disabled:text-on-surface-variant disabled:cursor-not-allowed disabled:no-underline transition-colors"
            >
              <AnimatePresence mode="wait">
                {resending ? (
                  <motion.span
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Loader2 size={15} className="animate-spin" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="icon"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <RefreshCw size={15} />
                  </motion.span>
                )}
              </AnimatePresence>
              {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
            </button>
          </div>

          <p className="text-center mt-6 text-sm text-on-surface-variant">
            Wrong email?{' '}
            <Link
              to="/register"
              className="text-primary font-bold hover:underline"
            >
              Go back
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

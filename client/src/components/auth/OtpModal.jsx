import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, RefreshCw, ShieldCheck, X } from 'lucide-react'
import { verifyOtp, resendOtp } from '../../services/authApi'
import { toast } from '../Toast'
import { Button } from '../ui/button'

export default function OtpModal({
  open,
  onOpenChange,
  email,
  onVerified,
  title = 'Verify your email',
}) {
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [submitting, setSubmitting] = useState(false)
  const [resending, setResending] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const refs = useRef([])

  useEffect(() => {
    if (!open) return
    setDigits(['', '', '', '', '', ''])
    setCountdown(60)
    const focusTimer = setTimeout(() => refs.current[0]?.focus(), 50)
    return () => clearTimeout(focusTimer)
  }, [open])

  useEffect(() => {
    if (!open || countdown <= 0) return
    const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown, open])

  useEffect(() => {
    if (!open) return
    const onEsc = (event) => {
      if (event.key === 'Escape') onOpenChange(false)
    }
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [open, onOpenChange])

  const handleDigit = (index, value) => {
    const clean = value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = clean
    setDigits(next)
    if (clean && index < 5) refs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus()
      return
    }
    if (event.key === 'ArrowLeft' && index > 0) {
      refs.current[index - 1]?.focus()
      return
    }
    if (event.key === 'ArrowRight' && index < 5)
      refs.current[index + 1]?.focus()
  }

  const handlePaste = (event) => {
    const paste = event.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, 6)
    if (paste.length !== 6) return
    setDigits(paste.split(''))
    refs.current[5]?.focus()
  }

  const submitOtp = async (event) => {
    event.preventDefault()
    const otp = digits.join('')
    if (otp.length !== 6) {
      toast('Please enter the full 6-digit OTP.', 'error')
      return
    }

    setSubmitting(true)
    try {
      const data = await verifyOtp({ email, otp })
      if (data.success || data.message?.toLowerCase().includes('success')) {
        toast(data.message || 'Email verified successfully.', 'success')
        onVerified(data)
        onOpenChange(false)
      } else {
        toast(data.message || 'Invalid OTP. Please try again.', 'error')
      }
    } catch {
      toast('Network error while verifying OTP.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const resend = async () => {
    if (countdown > 0 || !email) return
    setResending(true)
    try {
      const data = await resendOtp({ email })
      if (data.success || data.message?.toLowerCase().includes('success')) {
        toast(data.message || 'OTP resent to your inbox.', 'success')
        setCountdown(60)
        setDigits(['', '', '', '', '', ''])
        refs.current[0]?.focus()
      } else {
        toast(data.message || 'Could not resend OTP.', 'error')
      }
    } catch {
      toast('Network error while resending OTP.', 'error')
    } finally {
      setResending(false)
    }
  }

  const canSubmit = digits.join('').length === 6 && !submitting

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[250] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={() => onOpenChange(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="otp-modal-title"
            className="relative z-10 w-full max-w-md rounded-3xl border border-white/20 bg-surface/70 p-6 shadow-2xl backdrop-blur-2xl"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="absolute right-4 top-4 rounded-md p-1 text-on-surface-variant hover:bg-surface-container-high/70 hover:text-on-surface"
              aria-label="Close OTP modal"
            >
              <X size={18} />
            </button>

            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
                <ShieldCheck size={26} />
              </div>
              <h2
                id="otp-modal-title"
                className="text-2xl font-headline font-bold text-on-surface"
              >
                {title}
              </h2>
              <p className="mt-2 text-sm text-on-surface-variant">
                Enter the 6-digit code sent to{' '}
                <span className="font-semibold text-on-surface">{email}</span>
              </p>
            </div>

            <form onSubmit={submitOtp} className="space-y-5">
              <div
                className="flex justify-center gap-2 sm:gap-3"
                onPaste={handlePaste}
              >
                {digits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      refs.current[index] = el
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={digit}
                    aria-label={`OTP digit ${index + 1}`}
                    onChange={(event) => handleDigit(index, event.target.value)}
                    onKeyDown={(event) => handleKeyDown(index, event)}
                    className="h-14 w-11 rounded-xl border-2 border-outline-variant/70 bg-surface-container text-center text-2xl font-bold text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25 sm:w-12"
                  />
                ))}
              </div>

              <Button type="submit" className="w-full" disabled={!canSubmit}>
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Verifying
                    code...
                  </>
                ) : (
                  'Verify OTP'
                )}
              </Button>
            </form>

            <div className="mt-4 flex items-center justify-between gap-3 text-sm">
              <p className="text-on-surface-variant">Did not get it?</p>
              <button
                type="button"
                onClick={resend}
                disabled={countdown > 0 || resending}
                className="inline-flex items-center gap-1.5 font-semibold text-primary transition hover:underline disabled:cursor-not-allowed disabled:text-on-surface-variant disabled:no-underline"
              >
                {resending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <RefreshCw size={14} />
                )}
                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
              </button>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

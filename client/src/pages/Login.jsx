import React, { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Globe,
  ShieldCheck,
} from 'lucide-react'
import { FaGithub } from 'react-icons/fa'
import { getAuthPayload, loginUser } from '../services/authApi'
import { useAuth } from '../context/AuthContext'
import { toast } from '../components/Toast'
import { Button } from '../components/ui/button'
import OtpModal from '../components/auth/OtpModal'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState('')
  const [touched, setTouched] = useState({ email: false, password: false })
  const [otpOpen, setOtpOpen] = useState(false)

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const validations = useMemo(() => {
    const email = form.email.trim()
    const password = form.password
    return {
      email: {
        valid: EMAIL_PATTERN.test(email),
        message: email ? 'Valid email format' : 'Email is required',
      },
      password: {
        valid: password.length >= 6,
        message:
          password.length >= 6 ? 'Password looks good' : 'Minimum 6 characters',
      },
    }
  }, [form.email, form.password])

  const isFormValid = validations.email.valid && validations.password.valid

  const setFieldTouched = (name) =>
    setTouched((prev) => ({ ...prev, [name]: true }))

  const socialLogin = (provider) => {
    toast(`${provider} login will be connected soon.`, 'info')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched({ email: true, password: true })

    if (!isFormValid) {
      toast('Please provide valid credentials before continuing.', 'error')
      return
    }

    setLoading(true)
    try {
      const data = await loginUser(form)
      const auth = getAuthPayload(data, { email: form.email.trim() })
      login(auth.user, auth.token)
      toast(data.message || 'Welcome back!', 'success')
      navigate('/')
    } catch (err) {
      toast(err.message || 'Login failed. Check your credentials.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const onOtpVerified = (data) => {
    const auth = getAuthPayload(data, { email: form.email.trim() })
    login(auth.user, auth.token)
    navigate('/')
  }

  const FieldIndicator = ({ field }) => {
    if (!touched[field] && !form[field]) return null
    if (validations[field].valid) {
      return (
        <CheckCircle2
          size={17}
          className="text-emerald-500"
          aria-hidden="true"
        />
      )
    }
    return (
      <AlertCircle size={17} className="text-rose-500" aria-hidden="true" />
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-mesh pointer-events-none" />

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
          <h1 className="text-4xl font-headline font-extrabold tracking-tight mb-2 text-on-surface text-glow">
            Welcome back
          </h1>
          <p className="text-on-surface-variant">
            Sign in to continue reading.
          </p>
        </div>

        <div className="glass-card rounded-[2rem] p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="space-y-1.5">
              <label htmlFor="email" className="sr-only">
                Email Address
              </label>
              <div
                className={`group relative flex items-center rounded-xl border bg-surface-container/80 transition-all duration-300 ${focused === 'email' ? 'border-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.15)]' : 'border-outline-variant/60'}`}
              >
                <motion.div
                  animate={{
                    scale: focused === 'email' ? 1.12 : 1,
                    color:
                      focused === 'email'
                        ? 'hsl(var(--primary))'
                        : 'hsl(var(--on-surface-variant))',
                  }}
                  transition={{ duration: 0.2 }}
                  className="pl-4 pr-2"
                >
                  <Mail size={18} />
                </motion.div>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  onFocus={() => setFocused('email')}
                  onBlur={() => {
                    setFocused('')
                    setFieldTouched('email')
                  }}
                  placeholder=" "
                  autoComplete="email"
                  aria-invalid={touched.email && !validations.email.valid}
                  aria-describedby="login-email-hint"
                  className="peer h-14 flex-1 bg-transparent px-1 pr-9 text-sm text-on-surface outline-none"
                />
                <span className="pointer-events-none absolute left-11 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant transition-all duration-200 peer-focus:top-4 peer-focus:text-xs peer-focus:text-primary peer-[:not(:placeholder-shown)]:top-4 peer-[:not(:placeholder-shown)]:text-xs">
                  Email address
                </span>
                <div className="pr-3">
                  <FieldIndicator field="email" />
                </div>
              </div>
              <p
                id="login-email-hint"
                className="text-xs text-on-surface-variant"
              >
                {validations.email.message}
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div
                className={`group relative flex items-center rounded-xl border bg-surface-container/80 transition-all duration-300 ${focused === 'password' ? 'border-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.15)]' : 'border-outline-variant/60'}`}
              >
                <motion.div
                  animate={{
                    scale: focused === 'password' ? 1.12 : 1,
                    color:
                      focused === 'password'
                        ? 'hsl(var(--primary))'
                        : 'hsl(var(--on-surface-variant))',
                  }}
                  transition={{ duration: 0.2 }}
                  className="pl-4 pr-2"
                >
                  <Lock size={18} />
                </motion.div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  onFocus={() => setFocused('password')}
                  onBlur={() => {
                    setFocused('')
                    setFieldTouched('password')
                  }}
                  placeholder=" "
                  autoComplete="current-password"
                  aria-invalid={touched.password && !validations.password.valid}
                  aria-describedby="login-password-hint"
                  className="peer h-14 flex-1 bg-transparent px-1 pr-16 text-sm text-on-surface outline-none"
                />
                <span className="pointer-events-none absolute left-11 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant transition-all duration-200 peer-focus:top-4 peer-focus:text-xs peer-focus:text-primary peer-[:not(:placeholder-shown)]:top-4 peer-[:not(:placeholder-shown)]:text-xs">
                  Password
                </span>
                <div className="flex items-center gap-1 pr-3">
                  <FieldIndicator field="password" />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="text-on-surface-variant hover:text-primary transition-colors"
                    aria-label={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                  >
                    <AnimatePresence mode="wait">
                      {showPassword ? (
                        <motion.div
                          key="off"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <EyeOff size={18} />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="on"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <Eye size={18} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                </div>
              </div>
              <p
                id="login-password-hint"
                className="text-xs text-on-surface-variant"
              >
                {validations.password.message}
              </p>
            </div>


            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-primary dark:text-primary hover:underline font-medium transition-all"
              >
                Forgot password?
              </Link>
            </div>

            <motion.div
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.99 }}
            >
              <Button type="submit" disabled={loading} className="w-full h-12">
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Signing in...
                  </>
                ) : (
                  <>
                    Sign In <ArrowRight size={18} />
                  </>
                )}
              </Button>
            </motion.div>

            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-outline-variant/60" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest text-on-surface-variant">
                <span className="bg-surface px-3">or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => socialLogin('Google')}
                className="w-full"
              >
                <Globe size={16} /> Google
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => socialLogin('GitHub')}
                className="w-full"
              >
                <FaGithub size={16} /> GitHub
              </Button>
            </div>

            <Button
              type="button"
              variant="ghost"
              className="w-full text-primary"
              onClick={() => {
                if (!validations.email.valid) {
                  setTouched((prev) => ({ ...prev, email: true }))
                  toast(
                    'Enter a valid email first so we can verify it with OTP.',
                    'error'
                  )
                  return
                }
                setOtpOpen(true)
              }}
            >
              <ShieldCheck size={16} /> Verify via OTP
            </Button>
          </form>

          <p className="text-center mt-3 text-sm text-on-surface-variant">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-primary font-bold hover:underline"
            >
              Create one
            </Link>
          </p>
        </div>
      </motion.div>

      <OtpModal
        open={otpOpen}
        onOpenChange={setOtpOpen}
        email={form.email.trim()}
        onVerified={onOtpVerified}
        title="Complete sign in with OTP"
      />
    </div>
  )
}

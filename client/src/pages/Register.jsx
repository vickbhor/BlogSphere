import React, { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Globe,
} from 'lucide-react'
import { FaGithub } from 'react-icons/fa'
import { getAuthPayload, registerUser } from '../services/authApi'
import { useAuth } from '../context/AuthContext'
import { toast } from '../components/Toast'
import { Progress } from '../components/ui/progress'
import { Button } from '../components/ui/button'
import OtpModal from '../components/auth/OtpModal'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function getPasswordStrength(value) {
  let score = 0
  if (value.length >= 8) score += 25
  if (/[A-Z]/.test(value)) score += 20
  if (/[a-z]/.test(value)) score += 20
  if (/\d/.test(value)) score += 20
  if (/[^A-Za-z0-9]/.test(value)) score += 15

  if (score < 40) return { value: score, label: 'Weak', color: 'bg-rose-500' }
  if (score < 75)
    return { value: score, label: 'Moderate', color: 'bg-amber-500' }
  return { value: score, label: 'Strong', color: 'bg-emerald-500' }
}

export default function Register() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    gender: 'male',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState('')
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    gender: false,
  })
  const [otpOpen, setOtpOpen] = useState(false)

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const strength = useMemo(
    () => getPasswordStrength(form.password),
    [form.password]
  )

  const validations = useMemo(() => {
    return {
      name: {
        valid: form.name.trim().length >= 2,
        message:
          form.name.trim().length >= 2
            ? 'Looks good'
            : 'Use at least 2 characters',
      },
      email: {
        valid: EMAIL_PATTERN.test(form.email.trim()),
        message: EMAIL_PATTERN.test(form.email.trim())
          ? 'Valid email format'
          : 'Enter a valid email',
      },
      password: {
        valid: form.password.length >= 8 && strength.value >= 50,
        message:
          form.password.length >= 8
            ? `${strength.label} password`
            : 'Minimum 8 characters',
      },
      gender: {
        valid: form.gender === 'male' || form.gender === 'female',
        message:
          form.gender === 'male' || form.gender === 'female'
            ? 'Selected'
            : 'Please select gender',
      },
    }
  }, [
    form.name,
    form.email,
    form.password,
    form.gender,
    strength.label,
    strength.value,
  ])

  const isFormValid =
    validations.name.valid &&
    validations.email.valid &&
    validations.password.valid &&
    validations.gender.valid

  const setFieldTouched = (name) =>
    setTouched((prev) => ({ ...prev, [name]: true }))

  const socialRegister = (provider) => {
    toast(`${provider} signup will be connected soon.`, 'info')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched({ name: true, email: true, password: true, gender: true })

    if (!isFormValid) {
      toast('Please fix the highlighted fields before continuing.', 'error')
      return
    }

    setLoading(true)
    try {
      const data = await registerUser(form)
      toast(
        data.message ||
          'Registration successful. Verify your email to continue.',
        'success'
      )
      setOtpOpen(true)
    } catch (err) {
      toast(err.message || 'Registration failed. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const onOtpVerified = (data) => {
    const auth = getAuthPayload(data, {
      email: form.email.trim(),
      name: form.name.trim(),
      gender: form.gender,
    })
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
    <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-background relative overflow-hidden">
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
            Create account
          </h1>
          <p className="text-on-surface-variant">
            Join thousands of curious minds.
          </p>
        </div>

        <div className="glass-card rounded-[2rem] p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="space-y-1.5">
              <label htmlFor="name" className="sr-only">
                Full Name
              </label>
              <div
                className={`group relative flex items-center rounded-xl border bg-surface-container/80 transition-all duration-300 ${focused === 'name' ? 'border-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.15)]' : 'border-outline-variant/60'}`}
              >
                <motion.div
                  animate={{
                    scale: focused === 'name' ? 1.12 : 1,
                    color:
                      focused === 'name'
                        ? 'hsl(var(--primary))'
                        : 'hsl(var(--on-surface-variant))',
                  }}
                  transition={{ duration: 0.2 }}
                  className="pl-4 pr-2"
                >
                  <User size={18} />
                </motion.div>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  onFocus={() => setFocused('name')}
                  onBlur={() => {
                    setFocused('')
                    setFieldTouched('name')
                  }}
                  placeholder=" "
                  autoComplete="name"
                  aria-invalid={touched.name && !validations.name.valid}
                  aria-describedby="register-name-hint"
                  className="peer h-14 flex-1 bg-transparent px-1 pr-9 text-sm text-on-surface outline-none"
                />
                <span className="pointer-events-none absolute left-11 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant transition-all duration-200 peer-focus:top-4 peer-focus:text-xs peer-focus:text-primary peer-[:not(:placeholder-shown)]:top-4 peer-[:not(:placeholder-shown)]:text-xs">
                  Full name
                </span>
                <div className="pr-3">
                  <FieldIndicator field="name" />
                </div>
              </div>
              <p
                id="register-name-hint"
                className="text-xs text-on-surface-variant"
              >
                {validations.name.message}
              </p>
            </div>

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
                  aria-describedby="register-email-hint"
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
                id="register-email-hint"
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
                  autoComplete="new-password"
                  aria-invalid={touched.password && !validations.password.valid}
                  aria-describedby="register-password-hint register-strength-hint"
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
                id="register-password-hint"
                className="text-xs text-on-surface-variant"
              >
                {validations.password.message}
              </p>
              <div className="space-y-1.5" aria-live="polite">
                <div className="flex items-center justify-between text-xs text-on-surface-variant">
                  <span>Password strength</span>
                  <span id="register-strength-hint" className="font-semibold">
                    {strength.label}
                  </span>
                </div>
                <Progress
                  value={strength.value}
                  indicatorClassName={strength.color}
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                Gender
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                ].map(({ value, label }) => (
                  <label
                    key={value}
                    className={`cursor-pointer rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                      form.gender === value
                        ? 'border-primary bg-primary/15 text-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.1)]'
                        : 'border-outline-variant/60 bg-surface-container/70 text-on-surface-variant hover:border-primary/45'
                    }`}
                  >
                    <input
                      type="radio"
                      name="gender"
                      value={value}
                      checked={form.gender === value}
                      onChange={handleChange}
                      onBlur={() => setFieldTouched('gender')}
                      className="sr-only"
                    />
                    {label}
                  </label>
                ))}
              </div>
              {touched.gender && !validations.gender.valid && (
                <p className="text-xs text-rose-500">
                  {validations.gender.message}
                </p>
              )}
            </div>

            <motion.div
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.99 }}
            >
              <Button type="submit" disabled={loading} className="w-full h-12">
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Creating
                    account...
                  </>
                ) : (
                  <>
                    Create Account <ArrowRight size={18} />
                  </>
                )}
              </Button>
            </motion.div>

            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-outline-variant/60" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest text-on-surface-variant">
                <span className="bg-surface px-3">or sign up with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => socialRegister('Google')}
                className="w-full"
              >
                <Globe size={16} /> Google
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => socialRegister('GitHub')}
                className="w-full"
              >
                <FaGithub size={16} /> GitHub
              </Button>
            </div>
          </form>

          <p className="text-center mt-3 text-sm text-on-surface-variant">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-primary font-bold hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>

      <OtpModal
        open={otpOpen}
        onOpenChange={setOtpOpen}
        email={form.email.trim()}
        onVerified={onOtpVerified}
      />
    </div>
  )
}

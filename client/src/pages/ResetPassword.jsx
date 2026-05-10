import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { resetPassword } from '../services/authApi'
import { toast } from '../components/Toast'
import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowRight,
} from 'lucide-react'

// Password validation constants
const PASSWORD_MIN_LENGTH = 8
const PASSWORD_MAX_LENGTH = 32
const PASSWORD_REQUIREMENTS = {
  minLength: (pass) => pass.length >= PASSWORD_MIN_LENGTH,
  maxLength: (pass) => pass.length <= PASSWORD_MAX_LENGTH,
  uppercase: (pass) => /[A-Z]/.test(pass),
  lowercase: (pass) => /[a-z]/.test(pass),
  number: (pass) => /[0-9]/.test(pass),
  special: (pass) => /[^A-Za-z0-9]/.test(pass),
}

export default function ResetPassword() {
  const navigate = useNavigate()
  const { token } = useParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [isTokenValid, setIsTokenValid] = useState(true)

  // Password validation
  const validatePassword = (pass) => {
    const newErrors = {}

    if (!pass) {
      newErrors.password = 'Password is required'
    } else {
      if (!PASSWORD_REQUIREMENTS.minLength(pass)) {
        newErrors.password = `Password must be at least ${PASSWORD_MIN_LENGTH} characters`
      }
      if (!PASSWORD_REQUIREMENTS.maxLength(pass)) {
        newErrors.password = `Password must not exceed ${PASSWORD_MAX_LENGTH} characters`
      }
      if (!PASSWORD_REQUIREMENTS.uppercase(pass)) {
        newErrors.passwordStrength =
          'Password should contain at least one uppercase letter'
      }
      if (!PASSWORD_REQUIREMENTS.number(pass)) {
        newErrors.passwordStrength =
          'Password should contain at least one number'
      }
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (pass !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Password strength indicator
  const getPasswordStrength = () => {
    if (!password) return null

    let strength = 0
    if (PASSWORD_REQUIREMENTS.minLength(password)) strength += 25
    if (password.length > 12) strength += 25
    if (
      PASSWORD_REQUIREMENTS.uppercase(password) &&
      PASSWORD_REQUIREMENTS.lowercase(password)
    )
      strength += 25
    if (
      PASSWORD_REQUIREMENTS.number(password) &&
      PASSWORD_REQUIREMENTS.special(password)
    )
      strength += 25

    if (strength <= 25) return { label: 'Weak', color: 'bg-error', percent: 25 }
    if (strength <= 50)
      return { label: 'Fair', color: 'bg-warning', percent: 50 }
    if (strength <= 75)
      return { label: 'Good', color: 'bg-info', percent: 75 }
    return { label: 'Strong', color: 'bg-success', percent: 100 }
  }

  const resetPasswordMutation = useMutation({
    mutationFn: () =>
      resetPassword(token, { password, confirmPassword }),
    onSuccess: (data) => {
      toast(
        data?.message || 'Password reset successfully! Redirecting to login...',
        'success'
      )
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    },
    onError: (error) => {
      const errorMessage =
        error?.message || 'Failed to reset password. Please try again.'
      toast(errorMessage, 'error')

      const msgLower = errorMessage.toLowerCase()
      // Check if token is expired or invalid
      if (
        (error?.status === 400 ||
          error?.status === 401 ||
          error?.status === 404) &&
        (msgLower.includes('expired') ||
          msgLower.includes('invalid') ||
          msgLower.includes('token'))
      ) {
        setIsTokenValid(false)
      }
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!token) {
      setIsTokenValid(false)
      return
    }

    if (validatePassword(password)) {
      resetPasswordMutation.mutate()
    }
  }

  const handlePasswordChange = (e) => {
    const value = e.target.value
    setPassword(value)
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: '' }))
    }
  }

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value
    setConfirmPassword(value)
    if (errors.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: '' }))
    }
  }

  const passwordStrength = getPasswordStrength()
  const isPasswordMatch =
    password && confirmPassword && password === confirmPassword

  if (!token) {
    setIsTokenValid(false)
  }

  const isLoading = resetPasswordMutation.isPending
  const getPasswordStrengthColor = (strength) => {
    if (!strength) return 'text-on-surface-variant'
    if (strength.color === 'bg-error') return 'text-error'
    if (strength.color === 'bg-warning') return 'text-warning'
    if (strength.color === 'bg-info') return 'text-info'
    return 'text-success'
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-background to-surface dark:from-background dark:to-surface-variant transition-colors duration-300">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-surface dark:bg-surface-dim rounded-2xl shadow-lg dark:shadow-2xl p-8 border border-outline-variant dark:border-outline transition-all duration-300">
          {!isTokenValid ? (
            // Invalid Token State
            <>
              <div className="mb-8 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-error/10 dark:bg-error/20 mb-4 transition-colors">
                  <AlertCircle className="w-7 h-7 text-error" aria-hidden="true" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-on-surface dark:text-on-surface-variant mb-2">
                  Link Expired
                </h1>
                <p className="text-on-surface-variant dark:text-on-surface-variant text-sm md:text-base">
                  The password reset link has expired. Please request a new one.
                </p>
              </div>

              <Link
                to="/forgot-password"
                className="w-full bg-primary hover:bg-primary-hover dark:bg-primary dark:hover:bg-primary-hover text-on-primary font-semibold py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <Lock className="w-5 h-5" aria-hidden="true" />
                <span>Request New Reset Link</span>
              </Link>

              <Link
                to="/login"
                className="w-full mt-4 px-4 py-3 rounded-lg border-2 border-outline-variant dark:border-outline text-on-surface dark:text-on-surface-variant font-semibold hover:bg-surface-variant dark:hover:bg-outline-variant transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <span>Back to Login</span>
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </Link>
            </>
          ) : (
            // Reset Password Form
            <>
              <div className="mb-8 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 dark:bg-primary/20 mb-4 transition-colors">
                  <Lock className="w-7 h-7 text-primary" aria-hidden="true" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-on-surface dark:text-on-surface-variant mb-2">
                  Reset Password
                </h1>
                <p className="text-on-surface-variant dark:text-on-surface-variant text-sm md:text-base">
                  Enter your new password below.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Password Input */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-on-surface dark:text-on-surface-variant mb-2"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={handlePasswordChange}
                      placeholder="Enter new password"
                      className={`w-full px-4 py-3 pr-12 rounded-lg border-2 bg-background dark:bg-surface-dim text-on-surface dark:text-on-surface-variant placeholder-on-surface-variant/50 dark:placeholder-on-surface-variant/50 transition-all duration-200 ${
                        errors.password
                          ? 'border-error focus:border-error focus:outline-none'
                          : 'border-outline-variant dark:border-outline focus:border-primary dark:focus:border-primary focus:outline-none'
                      }`}
                      aria-label="New password"
                      aria-describedby={
                        errors.password ? 'password-error' : 'password-requirements'
                      }
                      disabled={isLoading}
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded"
                      aria-label={
                        showPassword
                          ? 'Hide password'
                          : 'Show password'
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" aria-hidden="true" />
                      ) : (
                        <Eye className="w-5 h-5" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p id="password-error" className="mt-2 text-sm text-error flex items-center gap-1" role="alert">
                      <AlertCircle className="w-4 h-4" aria-hidden="true" />
                      {errors.password}
                    </p>
                  )}

                  {/* Password Strength Indicator */}
                  {password && (
                    <div id="password-requirements" className="mt-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-on-surface-variant">
                          Password Strength
                        </span>
                        {passwordStrength && (
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded ${getPasswordStrengthColor(
                              passwordStrength
                            )}`}
                            aria-live="polite"
                          >
                            {passwordStrength.label}
                          </span>
                        )}
                      </div>
                      <div className="w-full bg-outline-variant dark:bg-outline rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            passwordStrength?.color || 'bg-outline-variant'
                          }`}
                          style={{ width: `${passwordStrength?.percent || 0}%` }}
                          role="progressbar"
                          aria-valuenow={passwordStrength?.percent || 0}
                          aria-valuemin="0"
                          aria-valuemax="100"
                          aria-label="Password strength indicator"
                        ></div>
                      </div>
                      <div className="text-xs text-on-surface-variant space-y-1">
                        <p>
                          <span aria-label={PASSWORD_REQUIREMENTS.minLength(password) ? 'Met' : 'Not met'}>
                            {PASSWORD_REQUIREMENTS.minLength(password)
                              ? '✓'
                              : '○'}
                          </span>{' '}
                          At least {PASSWORD_MIN_LENGTH} characters
                        </p>
                        <p>
                          <span aria-label={PASSWORD_REQUIREMENTS.uppercase(password) && PASSWORD_REQUIREMENTS.lowercase(password) ? 'Met' : 'Not met'}>
                            {PASSWORD_REQUIREMENTS.uppercase(password) &&
                            PASSWORD_REQUIREMENTS.lowercase(password)
                              ? '✓'
                              : '○'}
                          </span>{' '}
                          Mix of uppercase & lowercase
                        </p>
                        <p>
                          <span aria-label={PASSWORD_REQUIREMENTS.number(password) && PASSWORD_REQUIREMENTS.special(password) ? 'Met' : 'Not met'}>
                            {PASSWORD_REQUIREMENTS.number(password) &&
                            PASSWORD_REQUIREMENTS.special(password)
                              ? '✓'
                              : '○'}
                          </span>{' '}
                          Numbers & special characters
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password Input */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-on-surface dark:text-on-surface-variant mb-2"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={handleConfirmPasswordChange}
                      placeholder="Confirm new password"
                      className={`w-full px-4 py-3 pr-12 rounded-lg border-2 bg-background dark:bg-surface-dim text-on-surface dark:text-on-surface-variant placeholder-on-surface-variant/50 dark:placeholder-on-surface-variant/50 transition-all duration-200 ${
                        errors.confirmPassword
                          ? 'border-error focus:border-error focus:outline-none'
                          : isPasswordMatch
                            ? 'border-success focus:border-success focus:outline-none'
                            : 'border-outline-variant dark:border-outline focus:border-primary dark:focus:border-primary focus:outline-none'
                      }`}
                      aria-label="Confirm password"
                      aria-describedby={
                        errors.confirmPassword
                          ? 'confirm-password-error'
                          : isPasswordMatch
                            ? 'confirm-password-success'
                            : undefined
                      }
                      disabled={isLoading}
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded"
                      aria-label={
                        showConfirmPassword
                          ? 'Hide confirm password'
                          : 'Show confirm password'
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" aria-hidden="true" />
                      ) : (
                        <Eye className="w-5 h-5" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p id="confirm-password-error" className="mt-2 text-sm text-error flex items-center gap-1" role="alert">
                      <AlertCircle className="w-4 h-4" aria-hidden="true" />
                      {errors.confirmPassword}
                    </p>
                  )}
                  {isPasswordMatch && !errors.confirmPassword && (
                    <p id="confirm-password-success" className="mt-2 text-sm text-success flex items-center gap-1" aria-live="polite">
                      <CheckCircle className="w-4 h-4" aria-hidden="true" />
                      Passwords match
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || !isPasswordMatch}
                  className="w-full bg-primary hover:bg-primary-hover dark:bg-primary dark:hover:bg-primary-hover text-on-primary font-semibold py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  aria-busy={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                      <span>Resetting...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" aria-hidden="true" />
                      <span>Reset Password</span>
                    </>
                  )}
                </button>
              </form>

              {/* Back to Login */}
              <Link
                to="/login"
                className="block w-full mt-4 text-center px-4 py-3 rounded-lg border-2 border-outline-variant dark:border-outline text-on-surface dark:text-on-surface-variant font-semibold hover:bg-surface-variant dark:hover:bg-outline-variant transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Back to Login
              </Link>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-on-surface-variant dark:text-on-surface-variant text-sm">
            Need help?{' '}
            <Link
              to="/contact"
              className="text-primary dark:text-primary font-semibold hover:underline transition-all focus:outline-none focus:ring-2 focus:ring-primary rounded"
            >
              Contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
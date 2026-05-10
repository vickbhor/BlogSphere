import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { forgotPassword } from '../services/authApi'
import { toast } from '../components/Toast'
import { Mail, ArrowLeft, Loader2 } from 'lucide-react'

// Email validation regex constant
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')

  // Email validation function
  const validateEmail = (emailValue) => {
    return EMAIL_REGEX.test(emailValue)
  }

  const forgotPasswordMutation = useMutation({
    mutationFn: () => forgotPassword({ email }),
    onSuccess: (data) => {
      toast(
        data?.message || 'Password reset email sent successfully! Check your inbox.',
        'success'
      )
      setEmail('')
      setEmailError('')
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    },
    onError: (error) => {
      const errorMessage =
        error?.message ||
        'Failed to send password reset email. Please try again.'
      toast(errorMessage, 'error')
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validation
    const trimmedEmail = email.trim()
    
    if (!trimmedEmail) {
      setEmailError('Email is required')
      return
    }

    if (!validateEmail(trimmedEmail)) {
      setEmailError('Please enter a valid email address')
      return
    }

    setEmailError('')
    forgotPasswordMutation.mutate()
  }

  const handleEmailChange = (e) => {
    setEmail(e.target.value)
    // Clear error on input change
    if (emailError) {
      setEmailError('')
    }
  }

  const isFormValid = email.trim() && validateEmail(email) && !emailError
  const isLoading = forgotPasswordMutation.isPending

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-background to-surface dark:from-background dark:to-surface-variant transition-colors duration-300">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-surface dark:bg-surface-dim rounded-2xl shadow-lg dark:shadow-2xl p-8 border border-outline-variant dark:border-outline transition-all duration-300">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 dark:bg-primary/20 mb-4 transition-colors">
              <Mail className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-on-surface dark:text-on-surface-variant mb-2">
              Forgot Password?
            </h1>
            <p className="text-on-surface-variant dark:text-on-surface-variant text-sm md:text-base">
              No worries! We'll send you a link to reset your password.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-on-surface dark:text-on-surface-variant mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="you@example.com"
                  className={`w-full px-4 py-3 rounded-lg border-2 bg-background dark:bg-surface-dim text-on-surface dark:text-on-surface-variant placeholder-on-surface-variant/50 dark:placeholder-on-surface-variant/50 transition-all duration-200 ${
                    emailError
                      ? 'border-error focus:border-error focus:outline-none'
                      : 'border-outline-variant dark:border-outline focus:border-primary dark:focus:border-primary focus:outline-none'
                  }`}
                  aria-label="Email address"
                  aria-describedby={emailError ? 'email-error' : undefined}
                  disabled={isLoading}
                  autoComplete="email"
                  required
                />
                {!emailError && isFormValid && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-5 h-5 rounded-full bg-success flex items-center justify-center" aria-label="Valid email">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
              {emailError && (
                <p id="email-error" className="mt-2 text-sm text-error" role="alert">
                  {emailError}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || (!email.trim())}
              className="w-full bg-primary hover:bg-primary-hover dark:bg-primary dark:hover:bg-primary-hover text-on-primary font-semibold py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed active:scale-95"
              aria-busy={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5" aria-hidden="true" />
                  <span>Send Reset Link</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-variant dark:border-outline"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-surface dark:bg-surface-dim text-on-surface-variant">
                Or
              </span>
            </div>
          </div>

          {/* Back to Login */}
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg border-2 border-outline-variant dark:border-outline text-on-surface dark:text-on-surface-variant font-semibold hover:bg-surface-variant dark:hover:bg-outline-variant transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
            <span>Back to Login</span>
          </Link>

          {/* Help Text */}
          <p className="text-center text-xs md:text-sm text-on-surface-variant dark:text-on-surface-variant mt-6">
            Check your spam folder if you don't see the email within a few minutes.
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-on-surface-variant dark:text-on-surface-variant text-sm">
            Remember your password?{' '}
            <Link
              to="/login"
              className="text-primary dark:text-primary font-semibold hover:underline transition-all focus:outline-none focus:ring-2 focus:ring-primary rounded"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
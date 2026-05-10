import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Skeleton } from '../components/ui/skeleton'
import { getPostsByAuthor } from '../services/postApi'
import { useAuthorProfile } from '../hooks/useFollow'
import { FollowButton } from '../components/follow/FollowButton'
import {
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Eye,
  Users,
  Heart,
  Share2,
  Mail,
  BookOpen,
  Award,
  TrendingUp,
  MessageCircle,
  Download,
  Copy,
  Check,
} from 'lucide-react'
import { toast } from '../components/Toast'

// PLACEHOLDER IMAGE

const PLACEHOLDER_IMAGE =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"%3E%3Cdefs%3E%3ClinearGradient id="grad" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%234f46e5;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%237c3aed;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="800" height="600" fill="url(%23grad)"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial, sans-serif" font-size="36" fill="white" text-anchor="middle" dy=".3em" opacity="0.7"%3EArticle%3C/text%3E%3C/svg%3E'

// ANIMATED BACKGROUND COMPONENT

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-surface-container-low" />

      <motion.div
        animate={{ x: [0, 30, 0], y: [0, 20, 0], rotate: [0, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
      />

      <motion.div
        animate={{ x: [0, -30, 0], y: [0, -20, 0], rotate: [360, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"
      />

      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/3 rounded-full blur-3xl"
      />
    </div>
  )
}

// SKELETON COMPONENTS

function ProfileSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative z-10 bg-surface-container-low/80 backdrop-blur-xl rounded-3xl p-8 md:p-12 mb-12 border border-primary/10"
    >
      <div className="flex flex-col md:flex-row items-center gap-8">
        <Skeleton className="w-32 h-32 rounded-full" />
        <div className="flex-1 text-center md:text-left w-full">
          <Skeleton className="h-8 w-48 rounded-lg mb-4 mx-auto md:mx-0" />
          <Skeleton className="h-4 w-96 rounded-lg mb-6 mx-auto md:mx-0" />
          <div className="flex gap-8 justify-center md:justify-start flex-wrap">
            <Skeleton className="h-12 w-24 rounded-lg" />
            <Skeleton className="h-12 w-24 rounded-lg" />
            <Skeleton className="h-12 w-24 rounded-lg" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function PostCardSkeleton({ delay = 0 }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="flex flex-col rounded-2xl border border-outline-variant/25 bg-surface-container-low/80 backdrop-blur-sm p-4 overflow-hidden"
    >
      <div className="mb-4 aspect-video w-full rounded-xl overflow-hidden">
        <Skeleton className="w-full h-full" />
      </div>
      <Skeleton className="h-6 w-3/4 rounded-lg mb-3" />
      <Skeleton className="h-4 w-full rounded-lg mb-4" />
      <Skeleton className="h-4 w-2/3 rounded-lg" />
    </motion.article>
  )
}

// STATS CARD COMPONENT WITH COUNTER ANIMATION

const StatsCard = ({ icon: Icon, label, value, delay, color = 'blue' }) => {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    let start = 0
    const end = parseInt(value) || 0
    const duration = 2
    const increment = end / (duration * 60)

    const interval = setInterval(() => {
      start += increment
      if (start >= end) {
        setDisplayValue(end)
        clearInterval(interval)
      } else {
        setDisplayValue(Math.floor(start))
      }
    }, 1000 / 60)

    return () => clearInterval(interval)
  }, [value])

  const colorClasses = {
    blue: 'from-blue-500/20 to-blue-500/5',
    purple: 'from-purple-500/20 to-purple-500/5',
    rose: 'from-rose-500/20 to-rose-500/5',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className={`group relative bg-gradient-to-br ${colorClasses[color]} backdrop-blur-xl rounded-3xl p-8 border border-primary/20 cursor-pointer overflow-hidden`}
    >
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
        animate={{
          background: [
            'linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, transparent 100%)',
            'linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, transparent 100%)',
            'linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, transparent 100%)',
          ],
        }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <motion.div
            whileHover={{ scale: 1.2, rotate: 10 }}
            className="p-3 rounded-full bg-primary/20 group-hover:bg-primary/30 transition-all"
          >
            <Icon size={24} className="text-primary" />
          </motion.div>
          <span className="text-xs font-bold text-primary/60 uppercase tracking-widest">
            {label}
          </span>
        </div>

        <motion.p
          className="text-4xl font-bold text-on-surface mb-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {typeof value === 'string' ? value : displayValue.toLocaleString()}
        </motion.p>

        <p className="text-sm text-on-surface-variant">{label}</p>
      </div>
    </motion.div>
  )
}

// ENGAGEMENT METRIC COMPONENT

const EngagementMetric = ({ label, value, icon: Icon, percentage }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-surface-container-low/80 backdrop-blur rounded-2xl p-4 border border-outline-variant/20"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
          {label}
        </span>
        <Icon size={16} className="text-primary" />
      </div>
      <p className="text-2xl font-bold text-on-surface mb-2">
        {value.toLocaleString()}
      </p>
      <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-purple-500"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percentage, 100)}%` }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  )
}

// ACHIEVEMENT BADGE COMPONENT

const AchievementBadge = ({ icon: Icon, title, description, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      whileHover={{ scale: 1.1, rotateZ: 5 }}
      className="bg-gradient-to-br from-primary/20 to-purple-500/10 border border-primary/30 rounded-2xl p-4 text-center cursor-pointer"
    >
      <motion.div
        className="flex justify-center mb-3"
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, delay }}
      >
        <Icon size={28} className="text-primary" />
      </motion.div>
      <h4 className="font-semibold text-sm text-on-surface mb-1">{title}</h4>
      <p className="text-xs text-on-surface-variant">{description}</p>
    </motion.div>
  )
}

// MAIN COMPONENT

export default function AuthorProfile() {
  const { authorId } = useParams()
  const navigate = useNavigate()

  const [posts, setPosts] = useState([])
  const [isLoadingPosts, setIsLoadingPosts] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [email, setEmail] = useState('')
  const [emailSubmitted, setEmailSubmitted] = useState(false)
  const [copied, setCopied] = useState(false)

  const limit = 9

  const { data: authorData, isLoading: isLoadingAuthor, error: authorError, refetch: refetchAuthor } = useAuthorProfile(authorId)

  // Derived state from query
  const userData = authorData?.user || authorData?.data || null
  const totalEngagement = userData?.posts?.reduce((sum, post) => {
    return sum + (post.stats?.likes || 0) + (post.stats?.views || 0)
  }, 0) || 0

  const author = userData ? {
    ...userData,
    totalEngagement,
    joinedDate: userData.createdAt,
  } : null
  const error = authorError

  const loadAuthorPosts = async () => {
    setIsLoadingPosts(true)

    try {
      const response = await getPostsByAuthor(authorId, currentPage, limit)
      setPosts(response?.data || [])
      setTotalPages(response?.pages || 1)
    } catch (err) {
      console.error('Error loading posts:', err)
    } finally {
      setIsLoadingPosts(false)
    }
  }

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [authorId])

  useEffect(() => {
    loadAuthorPosts()
  }, [currentPage])

  const handleRetry = () => {
    refetchAuthor()
  }

  const handleNewsletterSubmit = (e) => {
    e.preventDefault()
    setEmailSubmitted(true)
    toast('Successfully subscribed! Check your email.', 'success')
    setTimeout(() => {
      setEmail('')
      setEmailSubmitted(false)
    }, 2000)
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    toast('Link copied to clipboard!', 'success')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadProfile = () => {
    if (!author) return

    const profileData = {
      name: author.name,
      role: author.role,
      bio: author.bio,
      totalPosts: author.totalPosts,
      followers: author.totalFollowers,
      engagement: author.totalEngagement,
      joinedDate: author.joinedDate,
    }

    const dataStr = JSON.stringify(profileData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${author.name}-profile.json`
    link.click()
    toast('Profile downloaded!', 'success')
  }

  // LOADING STATE

  if (isLoadingAuthor) {
    return (
      <div className="relative min-h-screen bg-background">
        <AnimatedBackground />
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20 pt-12 md:pt-24 pb-24">
          <button
            onClick={() => navigate('/authors')}
            className="inline-flex items-center gap-2 text-primary mb-8 hover:opacity-80 transition-opacity"
          >
            <ArrowLeft size={20} />
            Back to Authors
          </button>
          <ProfileSkeleton />
          <h2 className="text-3xl font-headline font-bold mb-8">Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <PostCardSkeleton key={i} delay={i * 0.05} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ERROR STATE

  if (error) {
    return (
      <div className="relative min-h-screen bg-background">
        <AnimatedBackground />
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20 pt-12 md:pt-24 pb-24">
          <button
            onClick={() => navigate('/authors')}
            className="inline-flex items-center gap-2 text-primary mb-8 hover:opacity-80 transition-opacity"
          >
            <ArrowLeft size={20} />
            Back to Authors
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto text-center mt-12"
          >
            <div className="bg-surface-container-low/80 backdrop-blur-xl rounded-3xl p-12 border border-error/20">
              <motion.div
                className="flex justify-center mb-6"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="bg-error/10 p-4 rounded-full">
                  <AlertCircle className="w-8 h-8 text-error" />
                </div>
              </motion.div>

              <h2 className="text-2xl font-headline font-bold mb-3 text-on-surface">
                Unable to Load Author Profile
              </h2>

              <p className="text-on-surface-variant mb-8">
                {error?.message || 'Author not found or something went wrong.'}
              </p>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRetry}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-full font-semibold hover:opacity-90 transition-opacity"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  // MAIN CONTENT

  return (
    <article className="relative min-h-screen bg-background overflow-hidden">
      <AnimatedBackground />

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20 pt-12 md:pt-24 pb-24">
        {/* Back Button */}
        <motion.button
          whileHover={{ scale: 1.02, x: -5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/authors')}
          className="inline-flex items-center gap-2 text-primary mb-8 hover:opacity-80 transition-opacity font-semibold"
        >
          <ArrowLeft size={20} />
          Back to Authors
        </motion.button>

        {/* Author Profile Card - Enhanced */}
        {author && (
          <>
            {/* Main Profile Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative bg-gradient-to-br from-surface-container-low/80 to-surface-container-high/40 backdrop-blur-xl rounded-3xl p-8 md:p-12 mb-8 border border-primary/20 overflow-hidden"
            >
              <motion.div
                className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 8, repeat: Infinity }}
              />

              <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
                {/* Avatar with Animation */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="relative flex-shrink-0"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    className="absolute inset-0 w-32 h-32 bg-gradient-to-br from-primary/50 to-purple-500/50 rounded-full blur-lg opacity-75"
                  />
                  <img
                    loading="lazy"
                    src={author.avatar}
                    alt={author.name}
                    className="relative w-32 h-32 rounded-full object-cover border-4 border-surface-container-low shadow-2xl"
                    onError={(e) => {
                      e.target.src = `https://i.pravatar.cc/150?u=${author._id}`
                    }}
                  />
                </motion.div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left">
                  <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-4xl md:text-5xl font-headline font-bold text-on-surface mb-2"
                  >
                    {author.name}
                  </motion.h1>

                  {/* Role & Badges */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mb-4 flex justify-center md:justify-start gap-2 flex-wrap"
                  >
                    <span className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-purple-500/20 text-primary font-semibold text-sm border border-primary/30">
                      {author.role === 'admin' ? '👨‍💼 Admin' : '✍️ Writer'}
                    </span>
                    {author.totalFollowers > 100 && (
                      <span className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-600 font-semibold text-sm border border-yellow-500/30">
                        ⭐ Popular Author
                      </span>
                    )}
                  </motion.div>

                  {/* Bio */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-on-surface-variant text-lg mb-6 max-w-2xl leading-relaxed"
                  >
                    {author.bio ||
                      'Passionate content creator sharing expertise and insights.'}
                  </motion.p>

                  {/* Join Date */}
                  {author.joinedDate && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.45 }}
                      className="text-xs text-on-surface-variant mb-4 uppercase tracking-wider"
                    >
                      Joined{' '}
                      {new Date(author.joinedDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                      })}
                    </motion.p>
                  )}

                  {/* Quick Stats */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex gap-6 justify-center md:justify-start mb-8 flex-wrap"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-primary/20">
                        <BookOpen size={20} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-primary">
                          {author.totalPosts || 0}
                        </p>
                        <p className="text-xs text-on-surface-variant uppercase tracking-wider">
                          Articles
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-primary/20">
                        <Users size={20} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-primary">
                          {author.totalFollowers || 0}
                        </p>
                        <p className="text-xs text-on-surface-variant uppercase tracking-wider">
                          Followers
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-primary/20">
                        <TrendingUp size={20} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-primary">
                          {(author.totalEngagement || 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-on-surface-variant uppercase tracking-wider">
                          Engagement
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Social Links & Actions */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="flex gap-3 justify-center md:justify-start flex-wrap flex-col sm:flex-row"
                  >
                    {author.socialLinks && (
                      <div className="flex gap-2 flex-wrap">
                        {author.socialLinks.twitter && (
                          <motion.a
                            whileHover={{ scale: 1.1, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            href={author.socialLinks.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-full bg-surface-bright/80 hover:bg-primary/30 transition-all text-sm font-semibold border border-outline-variant/30"
                          >
                            Twitter
                          </motion.a>
                        )}
                        {author.socialLinks.github && (
                          <motion.a
                            whileHover={{ scale: 1.1, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            href={author.socialLinks.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-full bg-surface-bright/80 hover:bg-primary/30 transition-all text-sm font-semibold border border-outline-variant/30"
                          >
                            GitHub
                          </motion.a>
                        )}
                        {author.socialLinks.linkedin && (
                          <motion.a
                            whileHover={{ scale: 1.1, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            href={author.socialLinks.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-full bg-surface-bright/80 hover:bg-primary/30 transition-all text-sm font-semibold border border-outline-variant/30"
                          >
                            LinkedIn
                          </motion.a>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 flex-wrap items-center">
                      <FollowButton 
                        userId={author._id} 
                        initialIsFollowing={authorData?.isFollowing || author.isFollowing} 
                        className="py-2.5 px-6 min-w-[140px] text-sm" 
                      />

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCopyLink}
                        className="px-4 py-2 rounded-full bg-primary/20 hover:bg-primary/30 text-primary transition-all text-sm font-semibold border border-primary/30 inline-flex items-center gap-2"
                      >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                        {copied ? 'Copied' : 'Share'}
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleDownloadProfile}
                        className="px-4 py-2 rounded-full bg-surface-bright/80 hover:bg-surface-bright transition-all text-sm font-semibold border border-outline-variant/30 inline-flex items-center gap-2"
                      >
                        <Download size={16} />
                        Download
                      </motion.button>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Enhanced Stats Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-12"
            >
              <h3 className="text-xl font-headline font-bold mb-6">
                Author Statistics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard
                  icon={BookOpen}
                  label="Total Articles"
                  value={author.totalPosts || 0}
                  delay={0}
                  color="blue"
                />
                <StatsCard
                  icon={Users}
                  label="Total Followers"
                  value={author.totalFollowers || 0}
                  delay={0.1}
                  color="purple"
                />
                <StatsCard
                  icon={TrendingUp}
                  label="Total Engagement"
                  value={author.totalEngagement || 0}
                  delay={0.2}
                  color="rose"
                />
              </div>
            </motion.div>

            {/* Engagement Metrics */}
            {posts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-12"
              >
                <h3 className="text-xl font-headline font-bold mb-6">
                  Recent Post Metrics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {posts.slice(0, 3).map((post, i) => {
                    const totalViews = posts.reduce(
                      (sum, p) => sum + (p.stats?.views || 0),
                      0
                    )
                    const currentViews = post.stats?.views || 0
                    const percentage =
                      totalViews > 0 ? (currentViews / totalViews) * 100 : 0

                    return (
                      <EngagementMetric
                        key={i}
                        label={post.title?.substring(0, 20) + '...'}
                        value={currentViews}
                        icon={Eye}
                        percentage={percentage}
                      />
                    )
                  })}
                </div>
              </motion.div>
            )}

            {/* Achievements Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-12"
            >
              <h3 className="text-xl font-headline font-bold mb-6">
                Achievements
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <AchievementBadge
                  icon={Award}
                  title="Top Writer"
                  description={author.totalPosts > 5 ? 'Verified' : 'Not Yet'}
                  delay={0}
                />
                <AchievementBadge
                  icon={Heart}
                  title="Popular"
                  description={
                    author.totalFollowers > 50 ? 'Active' : 'Building'
                  }
                  delay={0.1}
                />
                <AchievementBadge
                  icon={TrendingUp}
                  title="Trending"
                  description={author.totalEngagement > 100 ? 'Hot' : 'Cold'}
                  delay={0.2}
                />
                <AchievementBadge
                  icon={MessageCircle}
                  title="Engaged"
                  description="Community"
                  delay={0.3}
                />
              </div>
            </motion.div>
          </>
        )}

        {/* Articles Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-3xl font-headline font-bold mb-4">
            Featured Articles
          </h2>
          <p className="text-on-surface-variant mb-12">
            {author
              ? `Explore ${author.name}'s latest insights and stories`
              : 'Explore latest articles'}
          </p>

          {isLoadingPosts ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <PostCardSkeleton key={i} delay={i * 0.05} />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <p className="text-on-surface-variant text-lg mb-4">
                This author hasn't published any articles yet.
              </p>
              <Link
                to="/blogs"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-full font-semibold hover:opacity-90 transition-opacity"
              >
                Browse All Articles
              </Link>
            </motion.div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {posts.map((post, i) => {
                  const postSlug = post.slug
                  const postTitle = post.title || 'Untitled'
                  const postImage = post.featuredImage || PLACEHOLDER_IMAGE
                  const readTime = post.stats?.readingTime || 1
                  const views = post.stats?.views || 0
                  const likes = post.stats?.likes || 0
                  const publishedDate = post.publishedAt || post.createdAt

                  let formattedDate = ''
                  if (publishedDate) {
                    try {
                      const date = new Date(publishedDate)
                      formattedDate = date.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    } catch (e) {
                      formattedDate = publishedDate
                    }
                  }

                  return (
                    <motion.article
                      key={`${postSlug}-${i}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ y: -8 }}
                      className="group flex flex-col bg-surface-container-low/80 backdrop-blur-sm rounded-2xl overflow-hidden border border-outline-variant/25 hover:border-primary/30 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-2xl"
                    >
                      {/* Image */}
                      <Link
                        to={`/post/${postSlug}`}
                        state={{ post }}
                        className="relative mb-0 aspect-video overflow-hidden bg-surface-container-high"
                      >
                        <img
                          src={postImage}
                          alt={postTitle}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          loading="lazy"
                          onError={(e) => {
                            e.target.src = PLACEHOLDER_IMAGE
                          }}
                        />

                        <motion.div
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: 1 }}
                          className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent flex flex-col justify-end p-4"
                        >
                          <div className="flex gap-3 flex-wrap">
                            <motion.span
                              whileHover={{ scale: 1.1 }}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-black/50 backdrop-blur rounded-full text-white text-xs font-semibold"
                            >
                              <Eye size={14} /> {views}
                            </motion.span>
                            <motion.span
                              whileHover={{ scale: 1.1 }}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-black/50 backdrop-blur rounded-full text-white text-xs font-semibold"
                            >
                              <Heart size={14} /> {likes}
                            </motion.span>
                          </div>
                        </motion.div>
                      </Link>

                      {/* Content */}
                      <div className="p-4 flex-1 flex flex-col">
                        <Link
                          to={`/post/${postSlug}`}
                          state={{ post }}
                          className="flex-1"
                        >
                          <h3 className="text-lg font-headline font-bold text-on-surface mb-2 group-hover:text-primary transition-colors line-clamp-2">
                            {postTitle}
                          </h3>
                        </Link>

                        {/* Footer */}
                        <div className="flex items-center justify-between text-xs text-on-surface-variant pt-3 border-t border-outline-variant/20 mt-auto">
                          <span className="font-semibold">{formattedDate}</span>
                          <span className="px-2 py-1 rounded-full bg-primary/10 text-primary font-bold">
                            {readTime} min
                          </span>
                        </div>
                      </div>
                    </motion.article>
                  )
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center justify-center gap-4 flex-wrap mt-16"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className="px-6 py-3 rounded-full bg-surface-container-low/80 backdrop-blur border border-outline-variant/30 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-bright transition-all font-semibold"
                  >
                    ← Previous
                  </motion.button>

                  <div className="flex items-center gap-2 flex-wrap justify-center">
                    {Array.from({ length: Math.min(totalPages, 5) }).map(
                      (_, i) => {
                        const pageNum = i + 1
                        return (
                          <motion.button
                            key={pageNum}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-10 h-10 rounded-full font-semibold transition-all ${
                              currentPage === pageNum
                                ? 'bg-primary text-on-primary shadow-lg shadow-primary/50'
                                : 'bg-surface-bright text-on-surface hover:bg-surface-bright/80'
                            }`}
                          >
                            {pageNum}
                          </motion.button>
                        )
                      }
                    )}
                    {totalPages > 5 && (
                      <span className="text-on-surface-variant">...</span>
                    )}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="px-6 py-3 rounded-full bg-surface-container-low/80 backdrop-blur border border-outline-variant/30 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-bright transition-all font-semibold"
                  >
                    Next →
                  </motion.button>
                </motion.div>
              )}
            </>
          )}
        </motion.div>

        {/* Newsletter Section */}
        {author && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-24 bg-gradient-to-br from-primary/20 via-purple-500/10 to-background/50 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-primary/30 relative overflow-hidden"
          >
            <motion.div
              className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 8, repeat: Infinity }}
            />

            <div className="relative z-10 max-w-2xl mx-auto text-center">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="flex justify-center mb-6"
              >
                <div className="p-3 rounded-full bg-primary/20">
                  <Mail size={28} className="text-primary" />
                </div>
              </motion.div>

              <h3 className="text-2xl md:text-3xl font-headline font-bold mb-3">
                Subscribe to {author.name.split(' ')[0]}'s Newsletter
              </h3>
              <p className="text-on-surface-variant mb-8">
                Get exclusive content, latest articles, and insights delivered
                to your inbox.
              </p>

              <form
                onSubmit={handleNewsletterSubmit}
                className="flex gap-3 mb-4 flex-col sm:flex-row max-w-md mx-auto"
              >
                <input
                  type="email"
                  aria-label="Email for newsletter subscription"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 px-4 py-3 rounded-full bg-surface-container-low/80 border border-surface-container-high focus:border-primary focus:outline-none transition-all"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="px-6 py-3 bg-primary text-on-primary rounded-full font-semibold hover:shadow-lg hover:shadow-primary/50 transition-all"
                >
                  Subscribe
                </motion.button>
              </form>

              {emailSubmitted && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-green-500 text-sm font-semibold"
                >
                  ✓ Thanks for subscribing!
                </motion.p>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </article>
  )
}

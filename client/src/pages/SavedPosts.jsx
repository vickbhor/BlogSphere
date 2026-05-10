import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Skeleton } from '../components/ui/skeleton'
import { getMySavedPosts } from '../services/postApi'
import { AlertCircle, RefreshCw, BookmarkX, Eye, ArrowLeft } from 'lucide-react'
import { toast } from '../components/Toast'
import { useAuth } from '../context/AuthContext'

// Placeholder image
const PLACEHOLDER_IMAGE =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"%3E%3Cdefs%3E%3ClinearGradient id="grad" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%234f46e5;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%237c3aed;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="800" height="600" fill="url(%23grad)"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial, sans-serif" font-size="36" fill="white" text-anchor="middle" dy=".3em" opacity="0.7"%3ESaved Post%3C/text%3E%3C/svg%3E'

// SKELETON COMPONENT

function BlogCardSkeleton({ delay = 0 }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="flex flex-col rounded-3xl border border-outline-variant/25 bg-surface-container-low p-4 overflow-hidden"
    >
      <div className="mb-6 aspect-[4/3] w-full rounded-2xl overflow-hidden">
        <Skeleton className="w-full h-full animate-pulse" />
      </div>

      <div className="px-2 pb-2 flex-1 flex flex-col space-y-3">
        <Skeleton className="h-3 w-20 rounded-full animate-pulse" />

        <div className="space-y-2">
          <Skeleton className="h-6 w-full rounded-lg animate-pulse" />
          <Skeleton className="h-6 w-4/5 rounded-lg animate-pulse" />
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-outline-variant/30 pt-4">
          <Skeleton className="h-4 w-24 rounded-full animate-pulse" />
          <Skeleton className="h-7 w-20 rounded-full animate-pulse" />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-outline-variant/30">
          <div className="flex items-center gap-2">
            <Skeleton className="w-8 h-8 rounded-full animate-pulse" />
            <Skeleton className="h-3 w-24 rounded-full animate-pulse" />
          </div>
          <Skeleton className="h-3 w-12 rounded-full animate-pulse" />
        </div>
      </div>
    </motion.article>
  )
}

// MAIN COMPONENT

export default function SavedPosts() {
  const [savedPosts, setSavedPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalSaved, setTotalSaved] = useState(0)
  const navigate = useNavigate()

  const limit = 10

  const { token } = useAuth()

  // LOAD SAVED POSTS

  const loadSavedPosts = async () => {
    if (!token) {
      toast('Please login to view saved posts', 'info')
      navigate('/login')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await getMySavedPosts(token, currentPage, limit)
      setSavedPosts(response?.data || [])
      setTotalSaved(response?.total || 0)
      setTotalPages(response?.pages || 1)
    } catch (err) {
      setError(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRetry = () => {
    loadSavedPosts()
  }

  // LOAD ON MOUNT AND PAGE CHANGE

  useEffect(() => {
    window.scrollTo(0, 0)
    loadSavedPosts()
  }, [currentPage, token])

  // LOADING STATE

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 pb-24 pt-12 md:pt-24 min-h-screen bg-background text-on-surface">
        <h1 className="text-5xl md:text-7xl font-headline font-extrabold tracking-tight mb-16">
          Saved Posts
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {Array.from({ length: 9 }).map((_, i) => (
            <BlogCardSkeleton key={`skeleton-${i}`} delay={i * 0.08} />
          ))}
        </div>
      </div>
    )
  }

  // ERROR STATE

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 pb-24 pt-12 md:pt-24 min-h-screen bg-background text-on-surface">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 flex items-center gap-3"
        >
          <Link
            to="/my-profile"
            className="inline-flex items-center gap-2 rounded-full border border-outline-variant/35 bg-surface-container/65 px-4 py-2 text-sm font-medium text-on-surface-variant transition-all hover:text-on-surface"
          >
            <ArrowLeft size={15} /> Back to Profile
          </Link>
        </motion.div>

        <h1 className="text-5xl md:text-7xl font-headline font-extrabold tracking-tight mb-16">
          Saved Posts
        </h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="bg-surface-container-low rounded-3xl p-12 border border-error/20">
            <div className="flex justify-center mb-6">
              <div className="bg-error/10 p-4 rounded-full">
                <AlertCircle className="w-8 h-8 text-error" />
              </div>
            </div>

            <h2 className="text-2xl font-headline font-bold mb-3 text-on-surface">
              Unable to Load Saved Posts
            </h2>

            <p className="text-on-surface-variant mb-8">
              {error?.message || 'Something went wrong.'}
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
    )
  }

  // EMPTY STATE

  if (savedPosts.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 pb-24 pt-12 md:pt-24 min-h-screen bg-background text-on-surface">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 flex items-center gap-3"
        >
          <Link
            to="/my-profile"
            className="inline-flex items-center gap-2 rounded-full border border-outline-variant/35 bg-surface-container/65 px-4 py-2 text-sm font-medium text-on-surface-variant transition-all hover:text-on-surface"
          >
            <ArrowLeft size={15} /> Back to Profile
          </Link>
        </motion.div>

        <h1 className="text-5xl md:text-7xl font-headline font-extrabold tracking-tight mb-16">
          Saved Posts
        </h1>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="bg-surface-container-low rounded-2xl p-12 max-w-md w-full">
            <BookmarkX className="w-12 h-12 text-on-surface-variant/50 mx-auto mb-6" />
            <h2 className="text-2xl font-headline font-bold text-on-surface mb-2">
              No Saved Posts
            </h2>
            <p className="text-on-surface-variant mb-6">
              You haven't saved any posts yet. Start saving posts to find them
              here!
            </p>
            <Link
              to="/blogs"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-full font-semibold hover:opacity-90 transition-opacity"
            >
              Browse Blogs
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  // MAIN CONTENT

  return (
    <article className="pb-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 pt-12 md:pt-24 min-h-screen bg-background text-on-surface">
        {/* BACK BUTTON */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 flex items-center gap-3"
        >
          <Link
            to="/my-profile"
            className="inline-flex items-center gap-2 rounded-full border border-outline-variant/35 bg-surface-container/65 px-4 py-2 text-sm font-medium text-on-surface-variant transition-all hover:text-on-surface"
          >
            <ArrowLeft size={15} /> Back to Profile
          </Link>
        </motion.div>

        {/* TITLE */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-headline font-extrabold tracking-tight mb-16"
        >
          Saved Posts
        </motion.h1>

        {/* INFO */}
        <div className="mb-12 text-on-surface-variant">
          <p className="text-lg">
            You have{' '}
            <span className="font-bold text-on-surface">{totalSaved}</span>{' '}
            saved post(s)
          </p>
        </div>

        {/* BLOG GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-12">
          {savedPosts.map((post, i) => {
            const postId = post.id || post._id
            const postSlug = post.slug
            const postImage = post.featuredImage || PLACEHOLDER_IMAGE
            const postTitle = post.title || 'Untitled'
            const readTime = post.stats?.readingTime || 1
            const views = post.stats?.views || 0
            const publishedDate = post.publishedAt || post.createdAt

            const authorId = post.author?.id || post.author?._id || postId
            const authorName = post.author?.name || 'Anonymous'
            const authorAvatar =
              post.author?.avatar || `https://i.pravatar.cc/150?u=${authorId}`

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
                key={`${postSlug}-${postId}-${i}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="flex flex-col group cursor-pointer bg-surface-container-low rounded-3xl p-4 hover:bg-surface-container-high transition-all duration-500 border border-transparent hover:border-primary/30"
              >
                {/* IMAGE SECTION */}
                <div className="aspect-[4/3] rounded-2xl overflow-hidden relative mb-6 shadow-md w-full bg-surface-container-high">
                  <Link
                    to={`/post/${postSlug}`}
                    state={{ post }}
                    className="absolute inset-0 z-20"
                  />
                  <img
                    src={postImage}
                    alt={postTitle}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = PLACEHOLDER_IMAGE
                    }}
                  />
                </div>

                {/* CONTENT SECTION */}
                <div className="px-2 pb-2 flex-1 flex flex-col">
                  {/* TITLE */}
                  <Link to={`/post/${postSlug}`} state={{ post }}>
                    <h3 className="text-2xl font-headline font-bold leading-tight mb-3 group-hover:text-primary transition-colors line-clamp-2">
                      {postTitle}
                    </h3>
                  </Link>

                  {/* FOOTER */}
                  <div className="flex items-center justify-between text-sm font-label text-on-surface-variant mt-auto pt-4 border-t border-outline-variant/30">
                    <span className="text-xs">{formattedDate}</span>
                    <span className="font-medium bg-surface-bright px-3 py-1 rounded-full text-xs">
                      {readTime} min read
                    </span>
                  </div>

                  {/* AUTHOR & VIEWS */}
                  <div className="flex items-center justify-between text-xs font-label text-on-surface-variant mt-4 pt-4 border-t border-outline-variant/20">
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={authorAvatar}
                        alt={authorName}
                        className="w-7 h-7 rounded-full object-cover border border-outline-variant/30 flex-shrink-0"
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = `https://i.pravatar.cc/150?u=${authorId}`
                        }}
                      />
                      <span className="truncate font-medium">{authorName}</span>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                      <Eye size={14} className="text-primary" />
                      <span className="font-semibold">{views}</span>
                    </div>
                  </div>
                </div>
              </motion.article>
            )
          })}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setCurrentPage((prev) => Math.max(1, prev - 1))
              }}
              disabled={currentPage === 1}
              className="px-6 py-3 rounded-full glass-card disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-bright transition-all"
            >
              ← Previous
            </motion.button>

            <div className="flex items-center gap-2 flex-wrap justify-center">
              {Array.from({ length: totalPages }).map((_, i) => (
                <motion.button
                  key={i + 1}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded-full font-semibold transition-all ${
                    currentPage === i + 1
                      ? 'bg-primary text-on-primary shadow-lg'
                      : 'bg-surface-bright text-on-surface hover:bg-surface-bright/80'
                  }`}
                >
                  {i + 1}
                </motion.button>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }}
              disabled={currentPage === totalPages}
              className="px-6 py-3 rounded-full glass-card disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-bright transition-all"
            >
              Next →
            </motion.button>
          </div>
        )}
      </div>
    </article>
  )
}

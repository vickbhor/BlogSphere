import React, { useEffect, useState, useRef } from 'react'
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom'
import { Share2, Bookmark, Heart, ArrowLeft, Clock, Eye } from 'lucide-react'
import { motion } from 'framer-motion'
import DOMPurify from 'dompurify'
import { Skeleton } from '../components/ui/skeleton'
import { toast } from '../components/Toast'
import { getPostBySlug, likePost, savePost } from '../services/postApi'
import { useAuth } from '../context/AuthContext'

function PostSkeleton() {
  return (
    <div className="pb-24">
      {/* Hero Skeleton */}
      <div className="relative w-full h-[60vh] min-h-[400px] bg-surface-container-low animate-pulse" />

      <div className="layout-container mt-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="hidden lg:block lg:col-span-2" />

        <div className="lg:col-span-8">
          {/* Meta Skeleton */}
          <div className="flex items-center justify-between mb-12 pb-8 border-b border-outline-variant/30">
            <div className="flex items-center gap-4">
              <Skeleton className="w-14 h-14 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <div className="space-y-2 text-right">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const PostActions = ({
  likes,
  isLiked,
  isSaved,
  isLiking,
  isSaving,
  handleLike,
  handleSave,
  handleShare,
}) => (
  <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-max lg:static lg:translate-x-0 lg:w-full">
    <div className="flex lg:flex-col items-center gap-4 lg:gap-6 glass-card px-6 py-3 lg:py-6 rounded-full lg:w-16 lg:mx-auto lg:sticky lg:top-32 shadow-xl border border-outline-variant/30 bg-background/80 backdrop-blur-xl">
      <button
        onClick={handleLike}
        disabled={isLiking}
        className={`flex lg:flex-col items-center gap-1.5 lg:gap-1 p-2 rounded-lg transition-colors ${
          isLiked
            ? 'text-primary'
            : 'text-on-surface-variant hover:text-primary'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        title={`${likes} likes`}
      >
        <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
        {likes > 0 && (
          <span className="text-sm lg:text-xs font-semibold lg:font-normal">
            {likes}
          </span>
        )}
      </button>
      <div className="w-px h-6 lg:w-8 lg:h-px bg-outline-variant lg:my-2" />
      <button
        onClick={handleSave}
        disabled={isSaving}
        className={`text-on-surface-variant hover:text-primary transition-colors p-2 rounded-lg cursor-pointer ${
          isSaved ? 'text-primary' : ''
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        title={isSaved ? 'Unsave post' : 'Save post'}
      >
        <Bookmark size={20} fill={isSaved ? 'currentColor' : 'none'} />
      </button>
      <div className="w-px h-4 lg:hidden bg-outline-variant/50" />
      <button
        onClick={handleShare}
        className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-lg"
        title="Share post"
      >
        <Share2 size={20} />
      </button>
    </div>
  </div>
)

export default function Post() {
  const { slug } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isLiked, setIsLiked] = useState(false)
  const [likes, setLikes] = useState(0)
  const [views, setViews] = useState(0)
  const [isLiking, setIsLiking] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [postId, setPostId] = useState(null)
  
  const { token, user } = useAuth()

  //   Use ref to prevent double fetch in Strict Mode
  const fetchedRef = useRef(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  useEffect(() => {
    if (fetchedRef.current) return

    const fetchPost = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getPostBySlug(slug)
        const postData = data.data || data

        setPost(data)
        setPostId(postData._id)
        setViews(postData?.stats?.views || 0)
        setLikes(postData?.stats?.likes || 0)
        setIsLiked(postData?.isLiked || postData?.userLiked || false)
        setIsSaved(postData?.isSaved || postData?.userSaved || false)
      } catch (err) {
        setError(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPost()
    fetchedRef.current = true
  }, [slug])

  // Handle like button click
  const handleLike = async () => {
    if (!token) {
      toast('Please login to like posts', 'info')
      setTimeout(() => navigate('/login'), 500)
      return
    }

    if (!postId) {
      toast('Post data not loaded', 'error')
      return
    }

    setIsLiking(true)
    try {
      const result = await likePost(token, postId)
      const newIsLiked = result?.isLiked ?? !isLiked
      const newLikes = result?.likes ?? likes

      setIsLiked(newIsLiked)
      setLikes(newLikes)

      if (typeof window !== 'undefined') {
        try {
          const likedPosts = JSON.parse(
            localStorage.getItem('likedPosts') || '{}'
          )
          if (newIsLiked) {
            likedPosts[postId] = true
          } else {
            delete likedPosts[postId]
          }
          localStorage.setItem('likedPosts', JSON.stringify(likedPosts))
        } catch (e) {
          console.warn('LocalStorage error', e)
        }
      }

      toast(newIsLiked ? 'Post liked!' : 'Post unliked', 'success')
    } catch (err) {
      toast(err.message || 'Failed to like post', 'error')
    } finally {
      setIsLiking(false)
    }
  }

  // Load liked and saved posts from localStorage on mount (safe fallback)
  useEffect(() => {
    if (postId && token && typeof window !== 'undefined') {
      try {
        const likedPosts = JSON.parse(
          localStorage.getItem('likedPosts') || '{}'
        )
        if (likedPosts[postId]) {
          setIsLiked(true)
        }

        const savedPosts = JSON.parse(
          localStorage.getItem('savedPosts') || '{}'
        )
        if (savedPosts[postId]) {
          setIsSaved(true)
        }
      } catch (e) {
        console.warn('LocalStorage error', e)
      }
    }
  }, [postId, token])

  // Handle save button click
  const handleSave = async () => {
    if (!token) {
      toast('Please login to save posts', 'info')
      setTimeout(() => navigate('/login'), 500)
      return
    }

    if (!postId) {
      toast('Post data not loaded', 'error')
      return
    }

    setIsSaving(true)
    try {
      const result = await savePost(token, postId)
      const newIsSaved =
        result?.isSaved !== undefined ? result.isSaved : !isSaved

      setIsSaved(newIsSaved)

      if (typeof window !== 'undefined') {
        try {
          const savedPosts = JSON.parse(
            localStorage.getItem('savedPosts') || '{}'
          )
          if (newIsSaved) {
            savedPosts[postId] = true
          } else {
            delete savedPosts[postId]
          }
          localStorage.setItem('savedPosts', JSON.stringify(savedPosts))
        } catch (e) {
          console.warn('LocalStorage error', e)
        }
      }

      toast(
        newIsSaved
          ? 'Post saved to your collection!'
          : 'Post removed from collection',
        'success'
      )
    } catch (err) {
      toast(err.message || 'Failed to save post', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  // Handle share
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title || 'Check out this blog post',
        text: post?.description || 'Read this interesting article',
        url: window.location.href,
      }).catch((e) => console.log('Error sharing:', e))
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast('Link copied to clipboard', 'success')
    }
  }

  if (isLoading) {
    return <PostSkeleton />
  }

  if (error || !post) {
    return (
      <article className="pb-24">
        <div className="layout-container mt-12 text-center">
          <div className="bg-surface-container-low rounded-3xl p-12 max-w-md mx-auto">
            <h2 className="text-2xl font-headline font-bold text-on-surface mb-2">
              Post Not Found
            </h2>
            <p className="text-on-surface-variant mb-6">
              {error?.message ||
                'The blog post you are looking for does not exist.'}
            </p>
            <Link
              to="/blogs"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-full font-semibold hover:opacity-90 transition-opacity"
            >
              <ArrowLeft size={16} /> Back to Blogs
            </Link>
          </div>
        </div>
      </article>
    )
  }

  // Extract data from API response
  const postData = post.data || post
  const authorId = postData?.author?.id || postData?.author?._id || 'unknown'
  const authorName = postData?.author?.name || 'Anonymous Author'
  const authorAvatar =
    postData?.author?.avatar || `https://i.pravatar.cc/150?u=${authorId}`
  const authorRole = postData?.author?.role || 'Author'

  const featuredImage =
    postData?.featuredImage ||
    postData?.image ||
    postData?.thumbnail ||
    `https://images.unsplash.com/photo-1516534775068-bb6c2ff74b3f?q=80&w=2670&auto=format&fit=crop`
  const title = postData?.title || 'Untitled Post'
  const category = postData?.category || 'Uncategorized'
  const description = postData?.description || postData?.excerpt || ''
  const content = postData?.content || postData?.body || ''
  const publishedDate = postData?.publishedAt || postData?.createdAt
  const readingTime = postData?.stats?.readingTime || postData?.readTime || 1
  const tags = postData?.tags || []

  return (
    <article className="pb-24">
      {/* Hero Image Full Width */}
      <div className="relative w-full h-[60vh] min-h-[400px]">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent z-10" />
        <img
          loading="lazy"
          src={featuredImage}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            e.target.src = `https://images.unsplash.com/photo-1516534775068-bb6c2ff74b3f?q=80&w=2670&auto=format&fit=crop`
          }}
        />

        <div className="absolute inset-0 z-20 flex flex-col justify-end pb-16 layout-container">
          <Link
            to="/blogs"
            className="inline-flex items-center gap-2 text-primary font-label uppercase text-sm tracking-widest hover:underline mb-8 w-fit mt-10"
          >
            <ArrowLeft size={16} /> Back to stories
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border border-primary/20 mb-4 text-xs font-label uppercase tracking-widest text-primary w-fit">
            {category}
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl lg:text-7xl font-display font-bold leading-tight tracking-tighter max-w-4xl"
          >
            {title}
          </motion.h1>
        </div>
      </div>

      <div className="layout-container mt-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Responsive Actions Bar */}
        <div className="lg:col-span-2 relative">
          <PostActions
            likes={likes}
            isLiked={isLiked}
            isSaved={isSaved}
            isLiking={isLiking}
            isSaving={isSaving}
            handleLike={handleLike}
            handleSave={handleSave}
            handleShare={handleShare}
          />
        </div>

        {/* Content */}
        <div className="lg:col-span-8">
          {/* Author Section */}
          <div className="flex items-center justify-between mb-12 pb-8 border-b border-outline-variant/30">
            <div className="flex items-center gap-4">
              <img
                loading="lazy"
                src={authorAvatar}
                alt={authorName}
                className="w-14 h-14 rounded-full border-2 border-primary/20 object-cover"
                onError={(e) => {
                  e.target.src = `https://i.pravatar.cc/150?u=${authorId}`
                }}
              />
              <div>
                <p className="font-display font-bold text-lg">{authorName}</p>
                <p className="text-on-surface-variant font-label text-sm uppercase tracking-widest mt-1">
                  {authorRole}
                </p>
              </div>
            </div>
            <div className="text-right font-label text-sm uppercase tracking-widest text-on-surface-variant">
              <p>
                {new Date(publishedDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
              <p className="mt-1 flex items-center gap-1 justify-end">
                <Clock size={14} /> {readingTime} min read
              </p>
              <p className="mt-1 flex items-center gap-1 justify-end">
                <Eye size={14} /> {views} views
              </p>
            </div>
          </div>

          {/* Description */}
          {description && (
            <p className="text-2xl text-on-surface font-display leading-snug mb-8">
              {description}
            </p>
          )}

          {/* Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none font-body text-on-surface-variant leading-loose">
            {content ? (
              <div
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(content),
                }}
              />
            ) : (
              <p>No content available for this post.</p>
            )}
          </div>

          {/* Tags Section */}
          {tags && tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-outline-variant/30">
              <h3 className="text-sm font-label uppercase tracking-widest text-on-surface-variant mb-4">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-medium hover:bg-surface-bright transition-colors cursor-pointer"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Stats Section */}
          <div className="mt-12 pt-8 border-t border-outline-variant/30 grid grid-cols-3 gap-4">
            <div className="bg-surface-container-low rounded-2xl p-4 text-center">
              <p className="text-2xl font-headline font-bold text-on-surface">
                {views}
              </p>
              <p className="text-xs text-on-surface-variant uppercase tracking-widest mt-1">
                Views
              </p>
            </div>
            <div className="bg-surface-container-low rounded-2xl p-4 text-center">
              <p className="text-2xl font-headline font-bold text-on-surface">
                {likes}
              </p>
              <p className="text-xs text-on-surface-variant uppercase tracking-widest mt-1">
                Likes
              </p>
            </div>
            <div className="bg-surface-container-low rounded-2xl p-4 text-center">
              <p className="text-2xl font-headline font-bold text-on-surface">
                {readingTime}
              </p>
              <p className="text-xs text-on-surface-variant uppercase tracking-widest mt-1">
                Min Read
              </p>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

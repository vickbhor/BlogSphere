import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
  Search,
  ArrowRight,
  Quote,
  AlertCircle,
  RotateCcw,
  TrendingUp,
} from 'lucide-react'
import {
  getFeaturedPosts,
  getAllPosts,
  getTopPosts,
} from '../services/postApi'
import { useTopAuthors, useAllAuthors } from '../hooks/useFollow'
import { FollowButton } from '../components/follow/FollowButton'

// ===== ANIMATED COMPONENTS =====
const AnimatedSection = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
    viewport={{ once: true, margin: '-100px' }}
  >
    {children}
  </motion.div>
)

const SkeletonLoader = ({ type = 'card', count = 1 }) => {
  const variants = {
    card: 'bg-surface-container-high rounded-xl p-6 md:p-8 h-32',
    author: 'flex flex-col items-center gap-4',
    blog: 'bg-surface-container-high rounded-xl p-6 md:p-8',
  }

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`${variants[type]} animate-pulse`}>
          {type === 'author' && (
            <>
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-surface-container-low"></div>
              <div className="w-24 h-4 bg-surface-container-low rounded"></div>
              <div className="w-20 h-3 bg-surface-container-low rounded"></div>
            </>
          )}
          {type === 'blog' && (
            <div className="space-y-4">
              <div className="h-24 w-24 bg-surface-container-low rounded-full"></div>
              <div className="h-3 bg-surface-container-low rounded w-20"></div>
              <div className="h-5 bg-surface-container-low rounded"></div>
            </div>
          )}
        </div>
      ))}
    </>
  )
}

const ErrorState = ({ message, onRetry, compact = false }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`flex items-center justify-center gap-4 ${compact ? 'py-8' : 'py-16'} text-center`}
  >
    <div className="flex flex-col items-center gap-3">
      <AlertCircle size={32} className="text-red-500" />
      <p className="text-on-surface-variant text-sm md:text-base">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 flex items-center gap-2 px-6 py-2 rounded-full bg-primary text-on-primary font-bold text-sm hover:shadow-lg transition-all"
        >
          <RotateCcw size={16} />
          Try Again
        </button>
      )}
    </div>
  </motion.div>
)

// ===== MEMOIZED CARD COMPONENTS =====
const BlogCardSmall = React.memo(({ post, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.1 }}
    viewport={{ once: true }}
  >
    <Link
      to={`/post/${post.slug}`}
      className="bg-surface-container-high rounded-xl p-6 md:p-8 flex flex-col justify-between hover:bg-surface-bright transition-all duration-300 relative overflow-hidden group h-full"
    >
      <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
        <Quote size={80} className="rotate-180" />
      </div>
      <div className="relative z-10">
        <span className="text-primary text-xs font-bold tracking-widest uppercase mb-3 block">
          {post?.category || 'General'}
        </span>
        <h3 className="font-headline text-lg md:text-xl font-bold leading-tight mb-3 line-clamp-2">
          {post?.title}
        </h3>
        <p className="text-on-surface-variant text-sm line-clamp-2 leading-relaxed">
          {post?.description || 'Discover amazing insights.'}
        </p>
      </div>
      <div className="pt-4 border-t border-outline-variant/20 flex items-center justify-between relative z-10 mt-4">
        <span className="text-xs font-bold text-on-surface-variant">
          READ ARTICLE
        </span>
        <ArrowRight
          size={16}
          className="text-primary group-hover:translate-x-2 transition-transform"
        />
      </div>
    </Link>
  </motion.div>
))
BlogCardSmall.displayName = 'BlogCardSmall'

const AuthorCard = React.memo(({ author, index, getFallbackAvatar }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      viewport={{ once: true }}
    >
      <Link
        to={`/author-profile/${author._id}`}
        className="flex flex-col items-center gap-4 group cursor-pointer"
      >
        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-[6px] border-surface-container-high group-hover:border-primary transition-all duration-300 shadow-xl">
          <img
            loading="lazy"
            decoding="async"
            src={author.avatar || getFallbackAvatar(author.name)}
            alt={author.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        </div>
        <div className="text-center w-full">
          <h4 className="font-headline font-bold text-xl mb-1 line-clamp-1">    
            {author.name}
          </h4>
          <p className="text-xs text-primary font-bold tracking-widest uppercase mb-2">
            {author.role === 'admin' ? 'Verified Author' : 'Author'}
          </p>
          <p className="text-xs text-on-surface-variant line-clamp-2 px-2 min-h-[2rem] flex items-center justify-center mb-3">
            {author.bio && author.bio.trim() ? author.bio : 'Not added yet'}    
          </p>
        </div>
      </Link>
      <div className="w-full px-4 mt-2 mb-4">
        <FollowButton
          userId={author._id}
          initialIsFollowing={author.isFollowing}
          className="w-full"
        />
      </div>
    </motion.div>
  )
})
AuthorCard.displayName = 'AuthorCard'

const TopBlogCard = React.memo(({ blog, index, getPostImage, getReadTime, getFallbackAvatar }) => {
  const colors = [
    'hover:border-violet-500/30 before:bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.1),transparent_70%)]',
    'hover:border-amber-500/30 before:bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.1),transparent_70%)]',
    'hover:border-teal-500/30 before:bg-[radial-gradient(circle_at_50%_0%,rgba(20,184,166,0.1),transparent_70%)]',
    'hover:border-rose-500/30 before:bg-[radial-gradient(circle_at_50%_0%,rgba(244,63,94,0.1),transparent_70%)]',
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      viewport={{ once: true }}
      className={`bg-surface p-6 md:p-8 rounded-xl group hover:translate-y-[-8px] transition-all duration-300 border border-surface-container-high relative overflow-hidden before:absolute before:inset-0 ${colors[index % colors.length]}`}
    >
      <div className="relative z-10 flex flex-col h-full">
        <div className="mb-6 flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-surface-container-high group-hover:border-primary transition-colors">
              <img
                loading="lazy"
                decoding="async"
                src={blog?.author?.avatar || getFallbackAvatar(blog?.author?.name || 'Author')}
                alt={blog?.author?.name || 'Author'}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-on-surface flex items-center gap-1">
                {blog?.author?.name || 'Unknown Author'}
                {blog?.author?.role === 'admin' && (
                  <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </span>
              <span className="text-primary text-[10px] font-bold tracking-widest uppercase mt-0.5">
                {blog.category || 'General'}
              </span>
            </div>
          </div>
        </div>

        <h3 className="font-headline text-base md:text-lg font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors min-h-[3rem] flex items-start">
          {blog.title}
        </h3>

        <div className="flex items-center gap-2 text-xs text-on-surface-variant mb-4">
          <TrendingUp size={14} />
          <span>{blog.stats?.views || 0} views</span>
          <span>•</span>
          <span>{getReadTime(blog)}</span>
        </div>

        <p className="text-on-surface-variant text-xs md:text-sm line-clamp-2 mb-auto leading-relaxed">
          {blog.description || 'Discover amazing insights.'}
        </p>

        <Link
          to={`/post/${blog.slug}`}
          className="block w-full py-2 md:py-3 rounded-full border border-outline-variant text-xs md:text-sm font-bold hover:bg-primary hover:text-on-primary hover:border-primary transition-all active:scale-95 text-center mt-6"
        >
          Read Article
        </Link>
      </div>
    </motion.div>
  )
})
TopBlogCard.displayName = 'TopBlogCard'

// ===== MAIN COMPONENT =====
export default function Home() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const { data: topAuthorsData, isLoading: isLoadingAuthors1, error: authorsError1 } = useTopAuthors(4)
  const { data: allAuthorsData, isLoading: isLoadingAuthors2, error: authorsError2 } = useAllAuthors({ page: 1, limit: 1 })
  const topAuthors = topAuthorsData?.data || []
  const totalAuthors = allAuthorsData?.total || 0
  const isLoadingAuthors = isLoadingAuthors1 || isLoadingAuthors2
  const authorsError = authorsError1 || authorsError2

  const [latestPosts, setLatestPosts] = useState([])
  const [topPosts, setTopPosts] = useState([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [dataError, setDataError] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = useCallback(async () => {
    setIsLoadingData(true)
    setDataError(null)
    try {
      const [latestRes, featuredRes, topRes] = await Promise.all([
        getAllPosts(1, 4),
        getFeaturedPosts(),
        getTopPosts(),
      ])
      setLatestPosts(latestRes?.data || [])
      setTopPosts(topRes?.data || [])
    } catch (e) {
      console.error('Error loading posts:', e)
      setLatestPosts([])
      setTopPosts([])
      setDataError('Failed to load posts. Please try again.')
    } finally {
      setIsLoadingData(false)
    }
  }, [])

  const getFallbackAvatar = useCallback((name) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=150`
  }, [])

  const getPostImage = useCallback((post) => {
    return (
      post?.featuredImage ||
      post?.coverImage ||
      post?.image ||
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop'
    )
  }, [])

  const getReadTime = useCallback((post) => {
    if (post?.stats?.readingTime) return `${post.stats.readingTime} min read`
    // Dynamic fallback calculation based on content length
    const content = post?.content || post?.description || ''
    const wordCount = content.split(/\s+/).length
    // Assuming 200 words per minute, min 1 min 
    const readingTime = Math.max(1, Math.ceil((wordCount || 1000) / 200))
    return `${readingTime} min read`
  }, [])

  const handleSearch = useCallback(
    (e) => {
      e.preventDefault()
      if (searchQuery.trim()) {
        navigate(`/blogs?q=${encodeURIComponent(searchQuery)}`)
      }
    },
    [searchQuery, navigate]
  )

  const handleSubscribe = useCallback((e) => {
    e.preventDefault()
    alert('Thank you for subscribing!')
  }, [])

  // Focus search effect
  React.useEffect(() => {
    const handleFocusSearch = () => {
      const searchInput = document.getElementById('home-search-input')
      if (searchInput) {
        searchInput.focus()
        searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
    window.addEventListener('focusSearch', handleFocusSearch)
    return () => window.removeEventListener('focusSearch', handleFocusSearch)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  }

  return (
    <div className="bg-background text-on-surface font-body selection:bg-primary selection:text-on-primary">
      <main className="bg-mesh pt-32 min-h-screen">
        {/* Hero Section */}
        <AnimatedSection>
          <section className="max-w-7xl mx-auto px-4 md:px-8 mb-32 relative">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="lg:w-1/2">
                <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase mb-6 border border-primary/20">
                  Editorial Excellence
                </span>
                <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter leading-[1.05] text-on-surface mb-8 text-glow">
                  Thoughts in Motion,
                  <br />
                  Stories in Style
                </h1>
                <p className="text-xl text-on-surface-variant leading-relaxed mb-10 max-w-lg">
                  Dive into a curated archive of contemporary culture,
                  minimalist design, and the minds shaping our digital future.
                </p>
                <div className="flex items-center gap-6 flex-wrap">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to="/blogs"
                      className="group flex items-center gap-3 bg-surface-bright p-1 pr-6 rounded-full hover:bg-surface-container-highest transition-all duration-300"
                    >
                      <span className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary">
                        <ArrowRight size={20} />
                      </span>
                      <span className="font-bold">Explore Archive</span>
                    </Link>
                  </motion.div>
                  <Link to="/authors" className="flex -space-x-3">
                    {isLoadingAuthors ? (
                      <>
                        <div className="w-10 h-10 rounded-full border-2 border-surface bg-surface-container-high animate-pulse"></div>
                        <div className="w-10 h-10 rounded-full border-2 border-surface bg-surface-container-high animate-pulse"></div>
                        <div className="w-10 h-10 rounded-full bg-surface-container-highest border-2 border-surface flex items-center justify-center text-[10px] font-bold text-on-surface-variant">
                          +0
                        </div>
                      </>
                    ) : topAuthors.length > 0 ? (
                      <>
                        {topAuthors.slice(0, 2).map((author) => (
                          <img
                            key={author._id}
                            loading="lazy"
                            decoding="async"
                            className="w-10 h-10 rounded-full border-2 border-surface object-cover hover:scale-110 transition-transform"
                            alt={author.name}
                            src={
                              author.avatar || getFallbackAvatar(author.name)
                            }
                            title={author.name}
                          />
                        ))}
                        <div className="w-10 h-10 rounded-full bg-surface-container-highest border-2 border-surface flex items-center justify-center text-[10px] font-bold text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer">
                          +{Math.max(0, totalAuthors - 2)}
                        </div>
                      </>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-surface-container-highest border-2 border-surface flex items-center justify-center text-[10px] font-bold text-on-surface-variant">
                        +{totalAuthors}
                      </div>
                    )}
                  </Link>
                </div>
              </div>

              {/* Hidden on mobile and tablet, visible only on desktop (lg) */}
              <motion.div
                className="hidden lg:block lg:w-1/2 relative"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                {latestPosts[0] && (
                  <Link
                    to={`/post/${latestPosts[0].slug}`}
                    className="block relative rounded-xl overflow-hidden shadow-2xl group cursor-pointer aspect-[4/3]"
                  >
                    <img
                      fetchpriority="high"
                      decoding="async"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      alt={latestPosts[0].title}
                      src={getPostImage(latestPosts[0])}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-80"></div>
                    <div className="absolute bottom-0 p-6 md:p-10 w-full">
                      <div className="glass-card p-6 md:p-8 rounded-lg border border-white/5 hover:translate-y-[-8px] transition-transform duration-500 shadow-2xl">
                        <span className="text-primary text-xs font-bold tracking-widest uppercase mb-4 block">
                          {latestPosts[0]?.category || 'General'}
                        </span>
                        <h2 className="font-headline text-2xl md:text-3xl font-bold mb-4 leading-tight">
                          {latestPosts[0].title}
                        </h2>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-on-surface-variant">
                            {getReadTime(latestPosts[0])} •{' '}
                            {latestPosts[0]?.createdAt
                              ? new Date(
                                  latestPosts[0]?.createdAt
                                ).toLocaleDateString()
                              : 'Today'}
                          </span>
                          <ArrowRight
                            size={20}
                            className="text-primary transform -rotate-45"
                          />
                        </div>
                      </div>
                    </div>
                  </Link>
                )}
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-primary/20 blur-[60px] rounded-full"></div>
              </motion.div>
            </div>
          </section>
        </AnimatedSection>

        {/* Search & Filter Section */}
        <AnimatedSection delay={0.2}>
          <section className="max-w-7xl mx-auto px-4 md:px-8 mb-24">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
              <form
                onSubmit={handleSearch}
                className="relative w-full md:w-96 group"
              >
                <Search
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors"
                />
                <input
                  id="home-search-input"
                  aria-label="Search the archive"
                  className="w-full bg-surface-container-highest border-none rounded-md py-4 pl-12 pr-6 text-on-surface focus:ring-2 focus:ring-primary/50 placeholder:text-on-surface-variant transition-all outline-none"
                  placeholder="Search the archive..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute inset-0 rounded-md ring-2 ring-primary opacity-0 group-focus-within:opacity-20 blur-xl transition-opacity pointer-events-none"></div>
              </form>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to="/blogs"
                  className="px-6 py-2 rounded-full bg-primary text-on-primary font-bold text-sm hover:shadow-lg transition-all"
                >
                  All
                </Link>
                <Link
                  to="/blogs?category=Technology"
                  className="px-6 py-2 rounded-full bg-surface-container-low text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface transition-all text-sm font-semibold"
                >
                  Technology
                </Link>
                <Link
                  to="/blogs?category=Lifestyle"
                  className="px-6 py-2 rounded-full bg-surface-container-low text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface transition-all text-sm font-semibold"
                >
                  Lifestyle
                </Link>
                <Link
                  to="/blogs?category=Travel"
                  className="px-6 py-2 rounded-full bg-surface-container-low text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface transition-all text-sm font-semibold"
                >
                  Travel
                </Link>
                <Link
                  to="/blogs?category=Business"
                  className="px-6 py-2 rounded-full bg-surface-container-low text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface transition-all text-sm font-semibold"
                >
                  Business
                </Link>
              </div>
            </div>
          </section>
        </AnimatedSection>

        {/* Latest Insights Bento Grid */}
        <AnimatedSection delay={0.3}>
          <section className="max-w-7xl mx-auto px-4 md:px-8 mb-32">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="font-headline text-4xl font-bold tracking-tight mb-2">
                  Latest Insights
                </h2>
                <p className="text-on-surface-variant">
                  Deep dives into the trends that define tomorrow.
                </p>
              </div>
              <Link
                to="/blogs"
                className="text-primary font-bold flex items-center gap-2 group whitespace-nowrap hover:gap-3 transition-all"
              >
                View all stories
                <ArrowRight
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Large Card */}
              {isLoadingData ? (
                <div className="md:col-span-6 bg-surface-container-low rounded-xl h-[400px] md:h-[500px] animate-pulse"></div>
              ) : dataError ? (
                <div className="md:col-span-6">
                  <ErrorState message={dataError} onRetry={loadData} compact />
                </div>
              ) : latestPosts[0] ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="md:col-span-6"
                >
                  <Link
                    to={`/post/${latestPosts[0].slug}`}
                    className="md:col-span-6 group relative overflow-hidden rounded-xl bg-surface-container-low h-[400px] md:h-[500px] block"
                  >
                    <img
                      fetchpriority="high"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
                      alt={latestPosts[0].title}
                      src={getPostImage(latestPosts[0])}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent"></div>
                    <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end">
                      <span className="bg-primary/20 text-primary border border-primary/20 px-3 py-1 rounded-full text-xs font-bold w-fit mb-6 uppercase">
                        {latestPosts[0]?.category || 'General'}
                      </span>
                      <h3 className="font-headline text-3xl md:text-4xl font-bold mb-6 max-w-xl group-hover:text-primary transition-colors line-clamp-3">
                        {latestPosts[0].title}
                      </h3>
                      <div className="flex items-center gap-4">
                        <img
                          loading="lazy"
                          decoding="async"
                          className="w-10 h-10 rounded-full object-cover"
                          alt={latestPosts[0]?.author?.name || 'Anonymous'}
                          src={
                            latestPosts[0]?.author?.avatar ||
                            getFallbackAvatar(latestPosts[0]?.author?.name)
                          }
                        />
                        <div>
                            <p className="font-bold text-sm flex items-center gap-1">
                              {latestPosts[0]?.author?.name || 'Anonymous'}
                              {latestPosts[0]?.author?.role === 'admin' && (
                                <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              )}
                          </p>
                          <p className="text-xs text-on-surface-variant">
                            {latestPosts[0]?.createdAt
                              ? new Date(
                                  latestPosts[0]?.createdAt
                                ).toLocaleDateString()
                              : 'Today'}{' '}
                            • {getReadTime(latestPosts[0])}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ) : null}

              {/* Small Cards */}
              <div className="md:col-span-6 grid grid-cols-1 gap-8">
                {isLoadingData ? (
                  <SkeletonLoader type="card" count={2} />
                ) : dataError ? (
                  <ErrorState message={dataError} onRetry={loadData} compact />
                ) : latestPosts.slice(1, 3).length > 0 ? (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="space-y-8"
                  >
                    {latestPosts.slice(1, 3).map((post, index) => (
                      <BlogCardSmall
                        key={post._id || index}
                        post={post}
                        index={index}
                      />
                    ))}
                  </motion.div>
                ) : (
                  <ErrorState message="No latest posts available" />
                )}
              </div>
            </div>
          </section>
        </AnimatedSection>

        {/* Featured Minds Section */}
        <AnimatedSection delay={0.4}>
          <section className="max-w-7xl mx-auto px-4 md:px-8 mb-24">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="font-headline text-4xl font-bold tracking-tight mb-2">
                  Featured Minds
                </h2>
                <p className="text-on-surface-variant">
                  Voices shaping our culture and design.
                </p>
              </div>
              <Link
                to="/authors"
                className="text-primary font-bold flex items-center gap-2 group whitespace-nowrap hover:gap-3 transition-all"
              >
                All authors
                <ArrowRight
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {isLoadingAuthors ? (
                <SkeletonLoader type="author" count={4} />
              ) : authorsError ? (
                <div className="col-span-2 md:col-span-4">
                  <ErrorState message={authorsError} onRetry={loadAuthors} />
                </div>
              ) : topAuthors.length > 0 ? (
                <motion.div
                  className="contents"
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  {topAuthors.slice(0, 4).map((author, index) => (
                    <AuthorCard
                      key={author._id}
                      author={author}
                      index={index}
                      getFallbackAvatar={getFallbackAvatar}
                    />
                  ))}
                </motion.div>
              ) : (
                <div className="col-span-2 md:col-span-4">
                  <ErrorState message="No featured authors available" />
                </div>
              )}
            </div>
          </section>
        </AnimatedSection>

        {/* Top Blogs Section */}
        <AnimatedSection delay={0.5}>
          <section className="bg-surface-container-low py-24 md:py-32 rounded-[4rem] mb-32 mx-4 md:mx-0">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
              <div className="text-center mb-16 md:mb-20">
                <h2 className="font-headline text-3xl md:text-4xl font-extrabold mb-4">
                  Top Blogs
                </h2>
                <p className="text-on-surface-variant text-base md:text-lg">
                  The most featured stories from our community.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                {isLoadingData ? (
                  <SkeletonLoader type="blog" count={4} />
                ) : dataError ? (
                  <div className="col-span-1 sm:col-span-2 lg:col-span-4">
                    <ErrorState message={dataError} onRetry={loadData} />
                  </div>
                ) : topPosts && topPosts.length > 0 ? (
                  <motion.div
                    className="contents"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                  >
                    {topPosts.slice(0, 4).map((blog, idx) => (
                      <TopBlogCard
                        key={blog._id || idx}
                        blog={blog}
                        index={idx}
                        getPostImage={getPostImage}
                        getReadTime={getReadTime}
                        getFallbackAvatar={getFallbackAvatar}
                      />
                    ))}
                  </motion.div>
                ) : (
                  <div className="col-span-1 sm:col-span-2 lg:col-span-4">
                    <ErrorState message="No top blogs available at the moment" />
                  </div>
                )}
              </div>
            </div>
          </section>
        </AnimatedSection>

        {/* Newsletter Section */}
        <AnimatedSection delay={0.6}>
          <section className="max-w-7xl mx-auto px-4 md:px-8 mb-32">
            <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-surface-container-high to-surface-container-highest p-1 md:p-12">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
              <motion.div
                className="relative flex flex-col lg:flex-row items-center justify-between gap-12 bg-surface/80 backdrop-blur-3xl rounded-[2.5rem] p-12 md:p-20 border border-white/5"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="max-w-xl">
                  <h2 className="font-headline text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
                    Join the Archive.
                  </h2>
                  <p className="text-lg text-on-surface-variant leading-relaxed">
                    Get exclusive insights, editorial picks, and stories from
                    the Velora Journal delivered directly to your inbox every
                    Sunday.
                  </p>
                </div>
                <div className="w-full lg:w-auto">
                  <form
                    onSubmit={handleSubscribe}
                    className="flex flex-col sm:flex-row gap-4 w-full"
                  >
                    <input
                      required
                      aria-label="Email address for newsletter"
                      className="px-8 py-5 rounded-full bg-surface-bright border-none focus:ring-2 focus:ring-primary/50 text-on-surface w-full sm:w-80 outline-none"
                      placeholder="Your best email address"
                      type="email"
                    />
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-10 py-5 bg-primary text-on-primary rounded-full font-bold text-lg hover:shadow-[0_0_20px_rgba(255,221,121,0.4)] transition-all whitespace-nowrap"
                    >
                      Subscribe Now
                    </motion.button>
                  </form>
                  <p className="text-[10px] text-on-surface-variant/60 mt-4 text-center sm:text-left">
                    By joining, you agree to our privacy policy and terms.
                  </p>
                </div>
              </motion.div>
              {/* Ambient Glow Decoration */}
              <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary/10 blur-[120px] rounded-full z-0 pointer-events-none"></div>
            </div>
          </section>
        </AnimatedSection>
      </main>
    </div>
  )
}

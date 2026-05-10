import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Skeleton } from '../components/ui/skeleton'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { FollowButton } from '../components/follow/FollowButton'
import { useAllAuthors } from '../hooks/useFollow'
import {
  Users,
  AlertCircle,
  RefreshCw,
  BookOpen,
  Search,
  Award,
} from 'lucide-react'
import { toast } from '../components/Toast'

// SKELETON COMPONENT

function AuthorCardSkeleton({ delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="flex flex-col items-center rounded-3xl border border-outline-variant/25 bg-surface-container-low p-8 text-center overflow-hidden"
    >
      <Skeleton className="w-24 h-24 rounded-full mb-6" />
      <Skeleton className="h-6 w-32 rounded-lg mb-3" />
      <Skeleton className="h-4 w-40 rounded-lg mb-6" />
      <div className="flex gap-6 mb-6 w-full justify-center">
        <div className="flex flex-col items-center">
          <Skeleton className="h-6 w-12 rounded-lg mb-2" />
          <Skeleton className="h-3 w-16 rounded-full" />
        </div>
        <div className="flex flex-col items-center">
          <Skeleton className="h-6 w-12 rounded-lg mb-2" />
          <Skeleton className="h-3 w-16 rounded-full" />
        </div>
      </div>
      <Skeleton className="h-10 w-32 rounded-full" />
    </motion.div>
  )
}

// ANIMATED BACKGROUND COMPONENT

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
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
    </div>
  )
}

// HEADER SECTION COMPONENT

const HeaderSection = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-0 relative"
    >
      {/* Background Blobs */}
      <div className="absolute -left-10 top-0 w-48 h-48 rounded-full bg-primary/20 blur-[80px] mix-blend-screen -z-10" />
      <div className="absolute right-20 top-20 w-32 h-32 rounded-full bg-tertiary/20 blur-[60px] mix-blend-screen -z-10" />
    </motion.div>
  )
}

// SEARCH & FILTER COMPONENT

const AuthorFilters = ({ onSearchChange, onFilterChange, totalAuthors }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')

  const handleSearch = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    onSearchChange(value)
  }

  const handleFilter = (type) => {
    setFilterType(type)
    onFilterChange(type)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-16"
    >
      {/* Container with left badge and center search */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:gap-8 mb-8">
        {/* Left: Meet Our Community Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 backdrop-blur mb-6 lg:mb-0 w-fit"
        >
          <span className="text-sm font-semibold text-primary">
            Meet Our Community
          </span>
        </motion.div>

        {/* Center: Search Bar */}
        <div className="relative flex-1 max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5" />
          <input
            type="text"
            aria-label="Search authors"
            placeholder="Search authors by name or interest..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-12 pr-6 py-4 rounded-full border-2 border-outline-variant/30 bg-surface-container-low/80 backdrop-blur focus:border-primary focus:outline-none transition-all text-on-surface placeholder-on-surface-variant/50"
          />
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-3 items-center">
        <span className="text-sm font-semibold text-on-surface-variant uppercase tracking-wide">
          Filter:
        </span>
        {['all', 'trending', 'new', 'verified'].map((type) => (
          <motion.button
            key={type}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleFilter(type)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              filterType === type
                ? 'bg-primary text-on-primary shadow-lg'
                : 'bg-surface-container border border-outline-variant/30 text-on-surface hover:bg-surface-container-high'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}

// SECTION TITLE COMPONENT

const SectionTitle = ({ icon: Icon, title, subtitle, badge }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="flex items-center justify-between mb-10"
    >
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-primary/10 rounded-xl shadow-sm border border-primary/20">
          <Icon className="text-primary w-6 h-6" />
        </div>
        <div>
          <h2 className="text-3xl font-headline font-bold">{title}</h2>
          <p className="text-xs text-on-surface-variant mt-1">{subtitle}</p>
        </div>
      </div>

      {badge && (
        <Badge className="hidden md:flex py-1.5 px-4 text-sm font-medium bg-primary/10 text-primary border-primary/20">
          {badge}
        </Badge>
      )}
    </motion.div>
  )
}

// ERROR STATE COMPONENT

const ErrorState = ({ error, onRetry }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto text-center my-20"
    >
      <div className="bg-surface-container-low rounded-[2rem] p-12 border border-error/20 shadow-sm">
        <motion.div
          className="flex justify-center mb-6"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="bg-error/10 p-5 rounded-full">
            <AlertCircle className="w-10 h-10 text-error" />
          </div>
        </motion.div>
        <h2 className="text-2xl font-headline font-bold mb-3 text-on-surface">
          Unable to Load Authors
        </h2>
        <p className="text-on-surface-variant mb-8 font-body">
          {error?.message ||
            'We encountered an error while fetching our community authors.'}
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRetry}
          className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-primary text-on-primary rounded-full font-semibold hover:opacity-90 shadow-md transition-all"
        >
          <RefreshCw className="w-4.5 h-4.5" />
          Try Again
        </motion.button>
      </div>
    </motion.div>
  )
}

// EMPTY STATE COMPONENT

const EmptyState = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-32 bg-surface-container-lowest rounded-[3rem] border border-outline-variant/30 border-dashed"
    >
      <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-6">
        <Search className="w-10 h-10 text-on-surface-variant/50" />
      </div>
      <h3 className="text-2xl font-headline font-bold mb-2">
        No authors found
      </h3>
      <p className="text-on-surface-variant font-medium">
        Try adjusting your search or filters
      </p>
    </motion.div>
  )
}

// AUTHOR CARD COMPONENT

const AuthorCard = ({ author, onViewProfile }) => {
  const getFallbackAvatar = (name) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=150`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative flex flex-col items-center rounded-[2rem] border border-outline-variant/30 bg-surface-container-lowest p-8 hover:bg-surface-container-low hover:border-primary/30 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer"
    >
      {/* Avatar Container */}
      <div className="relative mb-5 transition-transform duration-300 group-hover:scale-105">
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <img
          loading="lazy"
          src={author.avatar || getFallbackAvatar(author.name)}
          onError={(e) => {
            e.target.src = getFallbackAvatar(author.name)
          }}
          alt={author.name}
          className="relative w-28 h-28 rounded-full object-cover border-[3px] border-surface shadow-sm ring-1 ring-outline-variant/20 group-hover:ring-primary/40 transition-all z-10"
        />
        {author.role === 'admin' && (
          <div className="absolute bottom-0 right-0 w-7 h-7 bg-primary rounded-full border-2 border-surface flex items-center justify-center">
            <Award className="w-3.5 h-3.5 text-white" />
          </div>
        )}
      </div>

      {/* Author Name */}
      <h3 className="text-xl font-headline font-bold text-on-surface mb-1 text-center line-clamp-1">
        {author.name}
      </h3>

      {/* Verified Badge */}
      {author.role === 'admin' && (
        <Badge className="mb-3 text-xs py-0.5 px-2.5 bg-primary/10 text-primary border-primary/20">
          Verified Author
        </Badge>
      )}

      {/* Bio */}
      {author.bio ? (
        <p className="text-sm text-on-surface-variant text-center mb-6 line-clamp-2 px-2 min-h-[2.5rem]">
          {author.bio}
        </p>
      ) : (
        <p className="text-sm text-on-surface-variant/50 text-center mb-6 italic min-h-[2.5rem]">
          Exploring ideas...
        </p>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 mb-8 w-full justify-center">
        <div className="text-center px-4 py-2 bg-surface-container rounded-2xl flex-1">
          <p className="text-xl font-bold text-on-surface">
            {author.totalPosts}
          </p>
          <p className="text-[11px] font-medium uppercase tracking-wide text-on-surface-variant mt-0.5">
            Posts
          </p>
        </div>
        <div className="text-center px-4 py-2 bg-surface-container rounded-2xl flex-1">
          <p className="text-xl font-bold text-on-surface">
            {author.totalFollowers}
          </p>
          <p className="text-[11px] font-medium uppercase tracking-wide text-on-surface-variant mt-0.5">
            Follows
          </p>
        </div>
      </div>

      {/* View Profile Button & Follow Button */}
      <div className="w-full flex flex-wrap sm:flex-nowrap gap-3 mt-auto">
        <Button
          variant="outline"
          onClick={() => onViewProfile(author._id)}
          className="flex-1 rounded-full min-w-0 px-1"
        >
          <span className="truncate">View Profile</span>
        </Button>
        <FollowButton 
          userId={author._id} 
          initialIsFollowing={author.isFollowing} 
          className="flex-1 min-w-0 px-2" 
        />
      </div>
    </motion.div>
  )
}

// AUTHORS GRID COMPONENT

const AuthorsGrid = ({ authors, onViewProfile, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {Array.from({ length: 12 }).map((_, i) => (
          <AuthorCardSkeleton key={i} delay={i * 0.05} />
        ))}
      </div>
    )
  }

  if (authors.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-16">
      {authors.map((author, i) => (
        <AuthorCard
          key={author._id || i}
          author={author}
          onViewProfile={onViewProfile}
        />
      ))}
    </div>
  )
}

// PAGINATION COMPONENT

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="flex flex-col items-center justify-center gap-6 pt-12"
    >
      <div className="text-center text-sm text-on-surface-variant">
        Page <span className="font-bold text-on-surface">{currentPage}</span> of{' '}
        <span className="font-bold text-on-surface">{totalPages}</span>
      </div>

      <div className="flex items-center justify-center gap-3 sm:gap-6 flex-wrap">
        {/* Previous Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-4 sm:px-6 py-3 rounded-full border border-outline-variant/30 bg-surface-container-low font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-container hover:shadow-sm transition-all text-sm sm:text-base"
        >
          ← <span className="hidden sm:inline">Previous</span>
        </motion.button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-surface-container-low p-2 rounded-full border border-outline-variant/30 shadow-sm flex-wrap justify-center">
          {/* First Page */}
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onPageChange(1)}
            className={`w-10 h-10 rounded-full font-bold text-sm transition-all ${
              currentPage === 1
                ? 'bg-primary text-on-primary shadow-md'
                : 'bg-transparent text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            1
          </motion.button>

          {/* Ellipsis - Start */}
          {currentPage > 3 && (
            <span className="text-on-surface-variant">...</span>
          )}

          {/* Middle Pages */}
          {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
            let pageNum = currentPage
            if (totalPages <= 5) {
              pageNum = i + 1
            } else {
              if (currentPage <= 3) pageNum = i + 1
              else if (currentPage >= totalPages - 2)
                pageNum = totalPages - 4 + i
              else pageNum = currentPage - 2 + i
            }

            if (pageNum === 1 || pageNum === totalPages) return null

            return (
              <motion.button
                key={pageNum}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onPageChange(pageNum)}
                className={`w-10 h-10 rounded-full font-bold text-sm transition-all ${
                  currentPage === pageNum
                    ? 'bg-primary text-on-primary shadow-md'
                    : 'bg-transparent text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                {pageNum}
              </motion.button>
            )
          })}

          {/* Ellipsis - End */}
          {currentPage < totalPages - 2 && (
            <span className="text-on-surface-variant">...</span>
          )}

          {/* Last Page */}
          {totalPages > 1 && (
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onPageChange(totalPages)}
              className={`w-10 h-10 rounded-full font-bold text-sm transition-all ${
                currentPage === totalPages
                  ? 'bg-primary text-on-primary shadow-md'
                  : 'bg-transparent text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              {totalPages}
            </motion.button>
          )}
        </div>

        {/* Next Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-4 sm:px-6 py-3 rounded-full border border-outline-variant/30 bg-surface-container-low font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-container hover:shadow-sm transition-all text-sm sm:text-base"
        >
          <span className="hidden sm:inline">Next</span> →
        </motion.button>
      </div>
    </motion.div>
  )
}

// MAIN AUTHORS COMPONENT

export default function Authors() {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')

  const navigate = useNavigate()
  const limit = 12

  const { data: response, isLoading, isError, error, refetch } = useAllAuthors({
    page: currentPage,
    limit,
    search: searchTerm
  })

  // Client-side fallback filtering for 'trending'/'verified' if API doesn't support it directly
  let authors = response?.data || []
  if (filterType === 'trending') {
    authors = authors.filter((a) => a.totalFollowers > 50)
  } else if (filterType === 'verified') {
    authors = authors.filter((a) => a.role === 'admin')
  }

  const totalAuthors = response?.total || 0
  const totalPages = response?.pages || 1

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentPage])

  const handleRetry = () => {
    refetch()
  }

  const handleViewProfile = (authorId) => {
    navigate(`/author-profile/${authorId}`)
  }

  return (
    <div className="relative min-h-screen bg-background overflow-hidden pb-24">
      <AnimatedBackground />

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20 pt-4 md:pt-4 min-h-screen">
        <HeaderSection />

        <AuthorFilters
          onSearchChange={setSearchTerm}
          onFilterChange={setFilterType}
          totalAuthors={totalAuthors}
        />

        <div>
          {/* Section Title */}
          <SectionTitle
            icon={Users}
            title="Community Authors"
            subtitle="Discover amazing writers"
            badge={
              <>
                <BookOpen className="w-3.5 h-3.5 mr-1.5" /> {totalAuthors}{' '}
                creators
              </>
            }
          />

          {/* Error State */}
          {error ? (
            <ErrorState error={error} onRetry={handleRetry} />
          ) : (
            <>
              {/* Authors Grid */}
              <AuthorsGrid
                authors={authors}
                onViewProfile={handleViewProfile}
                isLoading={isLoading}
              />

              {/* Pagination */}
              {!isLoading && authors.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

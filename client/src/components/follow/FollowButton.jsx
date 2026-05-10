import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Plus, Check, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useFollow } from '../../hooks/useFollow'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../ui/button'
import { toast } from '../Toast'

// Animation configuration
const MOTION_CONFIG = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
  transition: { duration: 0.2 },
}

// Button state types
const BUTTON_STATES = {
  LOADING: 'loading',
  FOLLOWING: 'following',
  FOLLOW: 'follow',
}

const isCurrentUser = (user, userId) => {
  return user?._id === userId || user?.id === userId
}

const parseFollowResult = (result) => {
  if (typeof result?.isFollowing === 'boolean') {
    return result.isFollowing
  }

  const message = result?.message?.toLowerCase() || ''
  if (message.includes('unfollow')) {
    return false
  }

  if (message.includes('follow success') || message.includes('follow')) {
    return true
  }

  return false
}

const StateContent = ({ state }) => {
  const contentMap = {
    [BUTTON_STATES.LOADING]: (
      <div className="flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Updating</span>
      </div>
    ),
    [BUTTON_STATES.FOLLOWING]: (
      <div className="flex items-center gap-2">
        <Check className="w-4 h-4 text-primary" />
        <span className="hidden sm:inline">Following</span>
        <span className="sm:hidden">Following</span>
      </div>
    ),
    [BUTTON_STATES.FOLLOW]: (
      <div className="flex items-center gap-2">
        <Plus className="w-4 h-4" />
        <span className="hidden sm:inline">Follow</span>
        <span className="sm:hidden">Follow</span>
      </div>
    ),
  }

  return contentMap[state] || null
}

export function FollowButton({
  userId,
  initialIsFollowing,
  className = '',
}) {
  const { user } = useAuth()
  const { toggleFollowAsync, isLoading } = useFollow(userId)

  const [isFollowing, setIsFollowing] = useState(
    initialIsFollowing ?? (user?.following?.includes(userId) || false)
  )

  // Update following state when dependencies change
  useEffect(() => {
    if (initialIsFollowing !== undefined && !isLoading) {
      setIsFollowing(initialIsFollowing)
    } else if (initialIsFollowing === undefined && user?.following && !isLoading) {
      setIsFollowing(user.following.includes(userId))
    }
  }, [initialIsFollowing, user?.following, userId, isLoading])

  // Determine current button state
  const buttonState = useMemo(() => {
    if (isLoading) return BUTTON_STATES.LOADING
    return isFollowing ? BUTTON_STATES.FOLLOWING : BUTTON_STATES.FOLLOW
  }, [isLoading, isFollowing])

  // Handle follow/unfollow toggle
  const handleToggle = useCallback(
    async (e) => {
      e.preventDefault()
      e.stopPropagation()

      if (!user) {
        toast('Please login to follow authors', 'error')
        return
      }

      const previousState = isFollowing
      setIsFollowing(!previousState)

      try {
        const result = await toggleFollowAsync()
        const newFollowingState = parseFollowResult(result)
        setIsFollowing(newFollowingState)
        toast(result?.message || 'Follow status updated', 'success')
      } catch (err) {
        setIsFollowing(previousState)
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update follow status'
        toast(errorMessage, 'error')
      }
    },
    [user, toggleFollowAsync, isFollowing]
  )

  // Don't render button for current user
  if (isCurrentUser(user, userId)) {
    return null
  }

  return (
    <Button
      variant={isFollowing ? 'outline' : 'default'}
      size="default"
      onClick={handleToggle}
      disabled={isLoading}
      aria-label={isFollowing ? 'Unfollow user' : 'Follow user'}
      className={`min-w-[120px] rounded-full group ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={buttonState}
          {...MOTION_CONFIG}
        >
          <StateContent state={buttonState} />
        </motion.div>
      </AnimatePresence>
    </Button>
  )
}
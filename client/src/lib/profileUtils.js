import { ShieldCheck, BookOpen, Users, Flame } from 'lucide-react'

function formatDisplayDate(value, withTime = false) {
  if (!value) return 'N/A'

  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: withTime ? 'short' : 'long',
    day: 'numeric',
    ...(withTime && { hour: '2-digit', minute: '2-digit' }),
  })
}

// CREATE ENGAGEMENT SERIES

function createEngagementSeries(profile) {
  const base = Math.max(4, profile?.totalPosts || 6)
  const labels = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8']

  return labels.map((label, idx) => {
    const growth = Math.round((profile.totalFollowers || 0) * ((idx + 1) / 14))
    return {
      label,
      reads: base * 8 + idx * 5,
      interactions: base * 3 + idx * 2 + growth,
    }
  })
}

// CREATE ACTIVITY TIMELINE

function createActivity(profile) {
  const created = profile?.createdAt || Date.now()
  const lastLogin = profile?.lastLoginAt || Date.now()

  return [
    {
      id: 'a1',
      icon: ShieldCheck,
      title: 'Profile verified',
      description: 'Account trust level upgraded after verification.',
      time: formatDisplayDate(lastLogin, true),
    },
    {
      id: 'a2',
      icon: BookOpen,
      title: 'Published new content',
      description: `Your writing portfolio now includes ${profile?.totalPosts ?? 0} published posts.`,
      time: `${Math.max(1, profile?.totalPosts ?? 1)} days ago`,
    },
    {
      id: 'a3',
      icon: Users,
      title: 'Community growth milestone',
      description: `Network reached ${profile?.totalFollowers ?? 0} followers and ${profile?.totalFollowing ?? 0} following.`,
      time: `${Math.max(2, Math.ceil((profile?.totalFollowers ?? 10) / 15))} days ago`,
    },
    {
      id: 'a4',
      icon: Flame,
      title: 'Joined platform',
      description: 'Created your account and completed onboarding.',
      time: formatDisplayDate(created),
    },
  ]
}

// GENERATE PEOPLE PAGE

function generatePeoplePage(profile, kind, pageParam = 0) {
  const total =
    kind === 'followers' ? profile.totalFollowers : profile.totalFollowing
  const pageSize = 12
  const start = pageParam * pageSize
  const end = Math.min(total, start + pageSize)
  const hasMore = end < total

  const people = Array.from({ length: Math.max(0, end - start) }, (_, idx) => {
    const rank = start + idx + 1
    const namePrefix = kind === 'followers' ? 'Follower' : 'Following'
    return {
      id: `${kind}-${rank}`,
      name: `${namePrefix} ${rank}`,
      handle: `@${namePrefix.toLowerCase()}${rank}`,
      bio:
        rank % 2 === 0
          ? 'Writes about design systems and product craft.'
          : 'Explores frontend performance and DX patterns.',
      since: `${(rank % 11) + 1}d`,
    }
  })

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        items: people,
        nextCursor: hasMore ? pageParam + 1 : undefined,
      })
    }, 500)
  })
}

// GET NORMALIZED USER

function getNormalizedUser(payload) {
  return payload?.user || payload?.data?.user || payload?.data || null
}

// NORMALIZE GENDER CODE

function normalizeGenderCode(value) {
  const raw = String(value || '')
    .trim()
    .toLowerCase()
  if (raw === 'm' || raw === 'male') return 'M'
  if (raw === 'f' || raw === 'female') return 'F'
  return 'O'
}

// GET GENDER LABEL

function getGenderLabel(value) {
  const raw = String(value || '').trim()
  if (!raw) return 'Not specified'

  const normalized = raw.toLowerCase()
  if (normalized === 'm' || normalized === 'male') return 'Male'
  if (normalized === 'f' || normalized === 'female') return 'Female'
  if (normalized === 'o' || normalized === 'other') return 'Other'

  return raw
}

// IS CUSTOM GENDER

function isCustomGender(value) {
  const raw = String(value || '')
    .trim()
    .toLowerCase()
  return (
    Boolean(raw) && !['m', 'male', 'f', 'female', 'o', 'other'].includes(raw)
  )
}

export {
  formatDisplayDate,
  createEngagementSeries,
  createActivity,
  generatePeoplePage,
  getNormalizedUser,
  normalizeGenderCode,
  getGenderLabel,
  isCustomGender,
}

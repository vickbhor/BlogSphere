import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  formatDisplayDate,
  createEngagementSeries,
  createActivity,
  generatePeoplePage,
  getNormalizedUser,
  normalizeGenderCode,
  getGenderLabel,
  isCustomGender,
} from '../lib/profileUtils'

import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  User,
  Mail,
  BadgeCheck,
  BookOpen,
  Users,
  UserPlus,
  Globe,
  Calendar,
  Clock,
  ShieldCheck,
  Flame,
  ArrowLeft,
  PencilLine,
  Activity,
  Sparkles,
  TrendingUp,
  ChevronRight,
  Loader2,
  Lock,
  Trash2,
  AlertTriangle,
  Bookmark,
  Star,
  ExternalLink,
  Eye,
} from 'lucide-react'
import { FaGithub, FaLinkedinIn } from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'
import { FiGlobe } from 'react-icons/fi'
import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts'
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { useAuthorProfile } from '../hooks/useFollow'
import { FollowButton } from '../components/follow/FollowButton'
import {
  getMyProfile,
  updateMyProfile,
  uploadProfileImage,
  changePassword,
  deleteAccount,
} from '../services/authApi'
import { getMySavedPosts } from '../services/postApi'
import { toast } from '../components/Toast'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Skeleton } from '../components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'

// PLACEHOLDER IMAGE

const PLACEHOLDER_IMAGE =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"%3E%3Cdefs%3E%3ClinearGradient id="grad" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%234f46e5;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%237c3aed;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="800" height="600" fill="url(%23grad)"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial, sans-serif" font-size="36" fill="white" text-anchor="middle" dy=".3em" opacity="0.7"%3ESaved Post%3C/text%3E%3C/svg%3E'

import {
  StatCard,
  ProfileField,
  SocialPill,
} from '../components/profile/ProfileComponents'


function NetworkUserCard({ person }) {
  const isId = typeof person === 'string';
  const id = isId ? person : person._id || person.id;
  
  const { data, isLoading } = useAuthorProfile(id);
  const user = data?.author || data?.user || (!isId ? person : null);

  const getFallbackAvatar = (name) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=random`;

  if (isLoading && !user) {
    return (
      <div className="flex items-center gap-4 rounded-2xl border border-outline-variant/30 bg-surface-container/55 p-4 animate-pulse">
        <div className="h-12 w-12 rounded-full bg-outline-variant/20" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-outline-variant/20 rounded w-1/3" />
          <div className="h-3 bg-outline-variant/20 rounded w-1/2" />
        </div>
      </div>
    )
  }

  if (!user) return null;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="flex items-center gap-4 rounded-2xl border border-outline-variant/30 bg-surface-container/55 p-4"
    >
      <Link to={`/author/${id}`} className="shrink-0">
        <img 
          src={user.avatar || getFallbackAvatar(user.name)} 
          alt={user.name}
          onError={(e) => { e.target.src = getFallbackAvatar(user.name) }}
          className="h-12 w-12 rounded-full object-cover border border-primary/20"
        />
      </Link>
      <div className="flex-1 min-w-0">
        <Link to={`/author/${id}`} className="hover:underline">
          <p className="font-semibold text-on-surface truncate cursor-pointer">
            {user.name}
          </p>
        </Link>
        <p className="text-xs text-on-surface-variant truncate">
          {user.bio || 'Author'}
        </p>
      </div>
      <div className="shrink-0 flex items-center justify-center min-w-[90px] min-h-[32px]">
        <FollowButton userId={id} className="h-8 text-xs px-3 w-full" />
      </div>
    </motion.div>
  )
}

export default function MyProfile() {
  const navigate = useNavigate()
  const { user: authUser, token, login, logout } = useAuth()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('overview')
  const [networkTab, setNetworkTab] = useState('followers')
  const [editOpen, setEditOpen] = useState(false)
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false)
  const [savedPostsData, setSavedPostsData] = useState([])
  const [savedPostsLoading, setSavedPostsLoading] = useState(false)
  const [draft, setDraft] = useState({
    name: '',
    bio: '',
    gender: 'M',
    customGender: '',
    website: '',
    twitter: '',
    github: '',
    linkedin: '',
  })
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [deletePassword, setDeletePassword] = useState('')
  const [chartSize, setChartSize] = useState({ width: 0, height: 0 })

  
  
  const chartContainerRef = useRef(null)
  const imageInputRef = useRef(null)

  useEffect(() => {
    if (!token) navigate('/login')
  }, [token, navigate])

  const {
    data: profile,
    isLoading,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: ['my-profile', token],
    enabled: Boolean(token),
    retry: false,
    queryFn: async () => {
      const data = await getMyProfile(token)
      if (!data?.user) {
        throw new Error(data?.message || 'Failed to load profile.')
      }
      return data.user
    },
  })

  useEffect(() => {
    if (!profile) return
    const normalizedGender = normalizeGenderCode(profile.gender)
    const customGender = isCustomGender(profile.gender)
      ? String(profile.gender).trim()
      : ''

    setDraft({
      name: profile.name || '',
      bio: profile.bio || '',
      gender: normalizedGender,
      customGender,
      website: profile.socialLinks?.website || '',
      twitter: profile.socialLinks?.twitter || '',
      github: profile.socialLinks?.github || '',
      linkedin: profile.socialLinks?.linkedin || '',
    })
  }, [profile])

  useEffect(() => {
    if (!isError) return

    if (error?.status === 401) {
      logout()
      toast('Your session expired. Please sign in again.', 'error')
      navigate('/login')
      return
    }

    toast('Unable to load your profile right now.', 'error')
  }, [error?.status, isError, logout, navigate])

  //   LOAD SAVED POSTS
  const loadSavedPosts = async () => {
    if (!token) return
    setSavedPostsLoading(true)
    try {
      const response = await getMySavedPosts(token, 1, 6)
      setSavedPostsData(response?.data || [])
    } catch (err) {
      console.error('Error loading saved posts:', err)
    } finally {
      setSavedPostsLoading(false)
    }
  }

  //   LOAD SAVED POSTS WHEN TAB ACTIVE
  useEffect(() => {
    if (activeTab === 'saved' && token) {
      loadSavedPosts()
    }
  }, [activeTab, token])

  useEffect(() => {
    if (activeTab !== 'overview') return

    const node = chartContainerRef.current
    if (!node) return

    let frameId = null
    const updateState = () => {
      if (frameId) cancelAnimationFrame(frameId)
      frameId = requestAnimationFrame(() => {
        const { width, height } = node.getBoundingClientRect()
        setChartSize({ width, height })
      })
    }

    updateState()
    const observer = new ResizeObserver(updateState)
    observer.observe(node)

    return () => {
      observer.disconnect()
      if (frameId) cancelAnimationFrame(frameId)
    }
  }, [activeTab])

  

  

  

  

  const followers = useMemo(() => profile?.followers || [], [profile])

  const following = useMemo(() => profile?.following || [], [profile])

  const activity = useMemo(
    () => (profile ? createActivity(profile) : []),
    [profile]
  )
  const engagement = useMemo(
    () => (profile ? createEngagementSeries(profile) : []),
    [profile]
  )

  const mergeProfileIntoCache = (incomingProfile) => {
    queryClient.setQueryData(['my-profile', token], (prev) => ({
      ...(prev || {}),
      ...(incomingProfile || {}),
      socialLinks: {
        ...(prev?.socialLinks || {}),
        ...(incomingProfile?.socialLinks || {}),
      },
    }))
  }

  const profileUpdateMutation = useMutation({
    mutationFn: (payload) => updateMyProfile(token, payload),
    onSuccess: (response) => {
      const updatedUser = getNormalizedUser(response)
      if (updatedUser) {
        mergeProfileIntoCache(updatedUser)
        if (authUser && token) {
          login({ ...authUser, ...updatedUser }, token)
        }
      }
      toast(response?.message || 'Profile updated successfully.', 'success')
      setEditOpen(false)
    },
    onError: (error) => {
      toast(
        error?.message || 'Could not update profile. Please try again.',
        'error'
      )
    },
  })

  const imageUploadMutation = useMutation({
    mutationFn: (file) => uploadProfileImage(token, file),
    onSuccess: (response) => {
      const updatedUser = getNormalizedUser(response)
      if (updatedUser) {
        mergeProfileIntoCache(updatedUser)
        if (authUser && token) {
          login({ ...authUser, ...updatedUser }, token)
        }
      }
      toast(response?.message || 'Profile image updated.', 'success')
    },
    onError: (error) => {
      toast(
        error?.message || 'Image upload failed. Try another image.',
        'error'
      )
    },
  })

  const changePasswordMutation = useMutation({
    mutationFn: (payload) => changePassword(token, payload),
    onSuccess: (response) => {
      toast(response?.message || 'Password changed successfully.', 'success')
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
      setChangePasswordOpen(false)
    },
    onError: (error) => {
      toast(error?.message || 'Failed to change password.', 'error')
    },
  })

  const deleteAccountMutation = useMutation({
    mutationFn: () => deleteAccount(token, deletePassword),
    onSuccess: () => {
      toast('Account deleted successfully. Redirecting...', 'success')
      setDeletePassword('')
      setTimeout(() => {
        login(null, '')
        navigate('/login')
      }, 1500)
    },
    onError: (error) => {
      toast(error?.message || 'Failed to delete account.', 'error')
    },
  })

  const hasSocialLinks = useMemo(
    () => Object.values(profile?.socialLinks || {}).some(Boolean),
    [profile]
  )

  const saveDraft = () => {
    if (!profile || profileUpdateMutation.isPending) return

    const finalGender =
      draft.gender === 'O'
        ? draft.customGender.trim() || 'Other'
        : draft.gender === 'F'
          ? 'female'
          : 'male'

    profileUpdateMutation.mutate({
      name: draft.name.trim(),
      bio: draft.bio,
      gender: finalGender,
      socialLinks: {
        website: draft.website,
        twitter: draft.twitter,
        github: draft.github,
        linkedin: draft.linkedin,
      },
    })
  }

  const onImageSelected = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    imageUploadMutation.mutate(file)
    event.target.value = ''
  }

  const handleChangePassword = () => {
    if (!passwordForm.oldPassword.trim()) {
      toast('Current password is required.', 'error')
      return
    }
    if (!passwordForm.newPassword.trim()) {
      toast('New password is required.', 'error')
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast('Passwords do not match.', 'error')
      return
    }
    if (passwordForm.newPassword.length < 6) {
      toast('Password must be at least 6 characters.', 'error')
      return
    }

    changePasswordMutation.mutate({
      currentPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword,
      confirmPassword: passwordForm.confirmPassword,
    })
  }

  const handleDeleteAccount = () => {
    if (!deletePassword.trim()) {
      toast('Please enter your password to confirm deletion.', 'error')
      return
    }
    if (deleteAccountMutation.isPending) return
    deleteAccountMutation.mutate()
  }

  // LOADING STATE

  if (isLoading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-background px-4 pb-24 pt-8">
        <div className="pointer-events-none absolute inset-0 bg-mesh opacity-70" />
        <div className="relative mx-auto max-w-6xl space-y-6">
          <Skeleton className="h-44 w-full rounded-3xl" />
          <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
            <Skeleton className="h-[420px] w-full rounded-3xl" />
            <Skeleton className="h-[420px] w-full rounded-3xl" />
          </div>
          <div className="flex items-center justify-center gap-2 text-on-surface-variant">
            <Loader2 size={18} className="animate-spin" /> Loading premium
            profile...
          </div>
        </div>
      </div>
    )
  }

  if (!profile) return null

  // MAIN RENDER

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative min-h-screen overflow-hidden bg-background pb-24"
    >
      <div className="pointer-events-none absolute inset-0 bg-mesh opacity-80" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(at_12%_18%,hsl(var(--primary)/0.16)_0px,transparent_46%),radial-gradient(at_88%_12%,hsl(var(--accent)/0.12)_0px,transparent_44%)]" />

      <div className="relative mx-auto max-w-6xl px-4 pt-6 sm:px-6 lg:px-8">
        {/* PROFILE HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-6 rounded-3xl border border-outline-variant/30 bg-surface/55 p-6 backdrop-blur-xl shadow-[0_14px_45px_-22px_rgba(0,0,0,0.5)]"
        >
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-outline-variant/35 bg-surface-container/65 px-4 py-2 text-sm font-medium text-on-surface-variant transition-all hover:text-on-surface"
            >
              <ArrowLeft size={15} /> Back to home
            </Link>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                className="neon-button-static-green rounded-full hover:bg-emerald-400/10"
                onClick={() => setEditOpen(true)}
              >
                <PencilLine size={16} /> Edit Profile
              </Button>
              <Button
                type="button"
                variant="outline"
                className="neon-button-static-red rounded-full hover:bg-rose-400/10"
                onClick={() => setChangePasswordOpen(true)}
              >
                <Lock size={16} /> Change Password
              </Button>
            </div>
          </div>

          <div className="grid items-center gap-3 md:grid-cols-[auto_1fr]">
            <div className="relative flex-shrink-0">
              <img
                loading="lazy"
                src={profile.avatar}
                alt={profile.name}
                className="profile-avatar-neon-ring h-20 w-20 rounded-full border-3 border-surface object-cover shadow-md sm:h-24 sm:w-24"
                onError={(event) => {
                  event.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&size=150`
                }}
              />
              {profile.isVerified && (
                <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-surface bg-emerald-500 text-white">
                  <BadgeCheck size={12} />
                </div>
              )}
            </div>

            <div className="min-w-0">
              <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                <h1 className="text-lg font-headline font-extrabold tracking-tight text-on-surface sm:text-xl">
                  {profile.name}
                </h1>
                <Badge className="text-xs">{profile.role}</Badge>
                {profile.isVerified && (
                  <Badge className="border-emerald-500/35 bg-emerald-500/12 text-emerald-500 text-xs">
                    <ShieldCheck size={10} /> Verified
                  </Badge>
                )}
                <Badge className="border-sky-400/35 bg-sky-400/12 text-sky-400 text-xs">
                  <User size={10} />
                  {getGenderLabel(profile.gender)}
                </Badge>
              </div>

              <p className="truncate text-xs text-on-surface-variant">
                {profile.email}
              </p>

              <p className="mt-1 line-clamp-1 text-xs text-on-surface/75 sm:line-clamp-2">
                {profile.bio || 'No bio yet.'}
              </p>

              <div className="mt-2 flex flex-wrap gap-1.5">
                <SocialPill
                  label="Twitter"
                  url={profile.socialLinks?.twitter}
                  icon={FaXTwitter}
                />
                <SocialPill
                  label="GitHub"
                  url={profile.socialLinks?.github}
                  icon={FaGithub}
                />
                <SocialPill
                  label="LinkedIn"
                  url={profile.socialLinks?.linkedin}
                  icon={FaLinkedinIn}
                />
                <SocialPill
                  label="Website"
                  url={profile.socialLinks?.website}
                  icon={FiGlobe}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* STATS CARDS */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard icon={BookOpen} value={profile.totalPosts} label="Posts" />
          <StatCard
            icon={Users}
            value={profile.totalFollowers}
            label="Followers"
            delay={0.05}
          />
          <StatCard
            icon={UserPlus}
            value={profile.totalFollowing}
            label="Following"
            delay={0.1}
          />
        </div>

        {/* TABS */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="network">Network</TabsTrigger>
            <TabsTrigger value="saved">
              <Bookmark size={15} /> Saved Posts
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45 }}
              className="grid gap-6 lg:grid-cols-[360px_1fr]"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-widest text-on-surface-variant">
                    <User size={14} /> Account Info
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ProfileField
                    icon={Mail}
                    label="Email"
                    value={profile.email}
                  />
                  <ProfileField
                    icon={Flame}
                    label="Member ID"
                    value={profile.id || profile._id}
                  />
                  <ProfileField
                    icon={User}
                    label="Gender"
                    value={getGenderLabel(profile.gender)}
                  />
                  <ProfileField
                    icon={Calendar}
                    label="Joined"
                    value={formatDisplayDate(profile.createdAt)}
                  />
                  <ProfileField
                    icon={Clock}
                    label="Last Active"
                    value={formatDisplayDate(profile.lastLoginAt, true)}
                  />
                  <ProfileField
                    icon={Globe}
                    label="Primary Website"
                    value={profile.socialLinks?.website || 'Not added'}
                  />
                </CardContent>
              </Card>

              <Card className="min-w-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-widest text-on-surface-variant">
                    <TrendingUp size={14} /> Engagement Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    ref={chartContainerRef}
                    className="h-[300px] min-h-[300px] w-full min-w-0"
                  >
                    {activeTab === 'overview' &&
                    chartSize.width > 10 &&
                    chartSize.height > 10 ? (
                      <AreaChart
                        width={Math.floor(chartSize.width)}
                        height={Math.max(300, Math.floor(chartSize.height))}
                        data={engagement}
                        margin={{ left: -20, right: 8, top: 16, bottom: 4 }}
                      >
                        <defs>
                          <linearGradient
                            id="readsGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor="hsl(var(--primary))"
                              stopOpacity={0.5}
                            />
                            <stop
                              offset="100%"
                              stopColor="hsl(var(--primary))"
                              stopOpacity={0.05}
                            />
                          </linearGradient>
                          <linearGradient
                            id="engagementGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor="hsl(var(--accent))"
                              stopOpacity={0.45}
                            />
                            <stop
                              offset="100%"
                              stopColor="hsl(var(--accent))"
                              stopOpacity={0.04}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="4 4"
                          stroke="hsl(var(--outline-variant))"
                          opacity={0.5}
                        />
                        <XAxis
                          dataKey="label"
                          stroke="hsl(var(--on-surface-variant))"
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="hsl(var(--on-surface-variant))"
                          tickLine={false}
                          axisLine={false}
                          width={26}
                        />
                        <Tooltip
                          contentStyle={{
                            background: 'hsl(var(--surface))',
                            border: '1px solid hsl(var(--outline-variant))',
                            borderRadius: '12px',
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="reads"
                          stroke="hsl(var(--primary))"
                          fill="url(#readsGradient)"
                          strokeWidth={2}
                        />
                        <Area
                          type="monotone"
                          dataKey="interactions"
                          stroke="hsl(var(--accent))"
                          fill="url(#engagementGradient)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    ) : (
                      <Skeleton className="h-full w-full rounded-2xl" />
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge className="bg-primary/12 text-primary border-primary/20">
                      Reads trend
                    </Badge>
                    <Badge className="bg-accent/12 text-on-surface border-outline-variant/40">
                      Interaction trend
                    </Badge>
                    <Badge>{isFetching ? 'Refreshing' : 'Synced'}</Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* ACTIVITY TAB */}
          <TabsContent value="activity">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-widest text-on-surface-variant">
                    <Activity size={14} /> Activity Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-5">
                    {activity.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.06, duration: 0.35 }}
                        className="grid grid-cols-[auto_1fr] items-start gap-3"
                      >
                        <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-primary">
                          <item.icon size={15} />
                        </div>
                        <div className="rounded-2xl border border-outline-variant/30 bg-surface-container/50 p-4 transition-all hover:translate-x-1">
                          <p className="text-sm font-semibold text-on-surface">
                            {item.title}
                          </p>
                          <p className="mt-1 text-sm text-on-surface-variant">
                            {item.description}
                          </p>
                          <p className="mt-2 text-xs uppercase tracking-widest text-on-surface-variant">
                            {item.time}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* NETWORK TAB */}
          <TabsContent value="network" className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={networkTab === 'followers' ? 'default' : 'outline'}
                className="rounded-full"
                onClick={() => setNetworkTab('followers')}
              >
                <Users size={15} /> Followers
              </Button>
              <Button
                type="button"
                variant={networkTab === 'following' ? 'default' : 'outline'}
                className="rounded-full"
                onClick={() => setNetworkTab('following')}
              >
                <UserPlus size={15} /> Following
              </Button>
            </div>

            <AnimatePresence mode="wait">
              {networkTab === 'followers' ? (
                <motion.div
                  key="followers"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm uppercase tracking-widest text-on-surface-variant">
                        Followers List
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {followers.length > 0 ? (
    followers.map((person, i) => (
      <NetworkUserCard key={typeof person === 'string' ? person : person._id || i} person={person} />
    ))
  ) : (
    <p className="text-on-surface-variant text-sm col-span-full text-center py-4">No followers found.</p>
  )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  key="following"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm uppercase tracking-widest text-on-surface-variant">
                        Following List
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {following.length > 0 ? (
    following.map((person, i) => (
      <NetworkUserCard key={typeof person === 'string' ? person : person._id || i} person={person} />
    ))
  ) : (
    <p className="text-on-surface-variant text-sm col-span-full text-center py-4">No following found.</p>
  )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          {/*   SAVED POSTS TAB */}
          <TabsContent value="saved" className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45 }}
            >
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <div className="flex items-center gap-3 justify-between">
                    <div className="flex items-center gap-2">
                      <Bookmark
                        className="text-primary"
                        size={18}
                        fill="currentColor"
                      />
                      <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-widest text-on-surface-variant">
                        Reading List
                      </CardTitle>
                    </div>
                    <Link
                      to="/saved-posts"
                      className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                    >
                      View All <ExternalLink size={12} />
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {savedPostsLoading ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-64 w-full rounded-2xl" />
                      ))}
                    </div>
                  ) : savedPostsData.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center py-12 text-center"
                    >
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
                        <Bookmark className="w-8 h-8 text-primary/50" />
                      </div>
                      <p className="text-sm text-on-surface-variant mb-3">
                        No saved posts yet
                      </p>
                      <Link
                        to="/blogs"
                        className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                      >
                        Start saving posts →
                      </Link>
                    </motion.div>
                  ) : (
                    <>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {savedPostsData.map((post, idx) => (
                          <motion.div
                            key={post._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="group relative rounded-2xl overflow-hidden border border-primary/20 hover:border-primary/40 transition-all duration-300 bg-surface-container-low"
                          >
                            {/* Image */}
                            <Link
                              to={`/post/${post.slug}`}
                              state={{ post }}
                              className="block relative h-40 overflow-hidden bg-surface-container"
                            >
                              <img
                                loading="lazy"
                                src={post.featuredImage || PLACEHOLDER_IMAGE}
                                alt={post.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                onError={(e) =>
                                  (e.target.src = PLACEHOLDER_IMAGE)
                                }
                              />
                              {/* Overlay */}
                              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                                <span className="text-xs font-semibold text-white">
                                  Read Post →
                                </span>
                              </div>
                            </Link>

                            {/* Content */}
                            <div className="p-3">
                              <Link
                                to={`/post/${post.slug}`}
                                state={{ post }}
                                className="block mb-2"
                              >
                                <h3 className="font-semibold text-sm text-on-surface line-clamp-2 group-hover:text-primary transition-colors">
                                  {post.title}
                                </h3>
                              </Link>

                              <div className="flex items-center justify-between text-xs text-on-surface-variant mb-2">
                                <span className="truncate">
                                  {post.author?.name || 'Anonymous'}
                                </span>
                                <div className="flex items-center gap-0.5">
                                  <Eye size={12} />
                                  {post.stats?.views || 0}
                                </div>
                              </div>

                              {/* Badge */}
                              <div className="flex items-center gap-1 text-xs text-primary">
                                <Star size={11} fill="currentColor" />
                                <span>Saved</span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* View All Button */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mt-6 text-center"
                      >
                        <Link
                          to="/saved-posts"
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all font-semibold text-sm"
                        >
                          View All Saved Posts ({savedPostsData.length}+)
                          <ExternalLink size={14} />
                        </Link>
                      </motion.div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* SOCIAL LINKS SUGGESTION */}
        {!hasSocialLinks && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35 }}
            className="mt-6"
          >
            <Card className="border-dashed">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 text-on-surface-variant">
                  <Sparkles size={16} className="text-primary" />
                  Add social links in edit profile to enrich your public card.
                  <Button
                    type="button"
                    size="default"
                    variant="ghost"
                    className="ml-auto"
                    onClick={() => setEditOpen(true)}
                  >
                    Add now <ChevronRight size={14} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* DANGER ZONE */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45 }}
          className="mt-8"
        >
          <Card className="border-rose-500/20 bg-rose-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-widest text-rose-500">
                <AlertTriangle size={16} /> Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-on-surface">
                  Delete your account permanently
                </p>
                <p className="mt-1 text-xs text-on-surface-variant">
                  This action cannot be undone. All your data will be lost.
                </p>
              </div>
              <Button
                type="button"
                className="w-full bg-rose-500 hover:bg-rose-600 text-white"
                onClick={() => setDeleteAccountOpen(true)}
              >
                <Trash2 size={16} /> Delete Account
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* EDIT PROFILE MODAL */}
      <AnimatePresence>
        {editOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[220] flex items-center justify-center p-4"
            onMouseDown={() => setEditOpen(false)}
          >
            <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              onMouseDown={(event) => event.stopPropagation()}
              className="modal-scroll-thin relative z-10 w-full max-w-lg max-h-[88vh] overflow-y-auto rounded-3xl border border-outline-variant/35 bg-surface/80 p-4 pr-3 sm:p-5 sm:pr-4 backdrop-blur-2xl"
            >
              <h2 className="text-xl font-headline font-bold text-on-surface">
                Edit Profile
              </h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                Keep your profile fresh and readable.
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-outline-variant/35 bg-surface-container/40 p-2.5 sm:flex-nowrap">
                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl border border-outline-variant/40 bg-surface-container/60">
                  {imageUploadMutation.isPending ? (
                    <Skeleton className="h-full w-full" />
                  ) : (
                    <img
                      loading="lazy"
                      src={profile.avatar}
                      alt={profile.name}
                      className="h-full w-full object-cover"
                      onError={(event) => {
                        event.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&size=120`
                      }}
                    />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-on-surface">
                    Profile Image
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    JPG, PNG, or WEBP. Recommended square ratio.
                  </p>
                </div>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={onImageSelected}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto flex-shrink-0"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={imageUploadMutation.isPending}
                >
                  {imageUploadMutation.isPending ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />{' '}
                      Uploading...
                    </>
                  ) : (
                    'Upload'
                  )}
                </Button>
              </div>

              <div className="mt-4 space-y-3.5">
                <label className="block">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    Display Name
                  </span>
                  <input
                    value={draft.name}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        name: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-outline-variant/45 bg-surface-container/70 px-3 py-2.5 text-sm text-on-surface outline-none focus:border-primary"
                  />
                </label>

                <div className="block">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    Gender
                  </span>
                  <div className="flex gap-3">
                    {[
                      { value: 'M', label: 'Male' },
                      { value: 'F', label: 'Female' },
                      { value: 'O', label: 'Custom' },
                    ].map(({ value, label }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() =>
                          setDraft((prev) => ({ ...prev, gender: value }))
                        }
                        className={`flex-1 rounded-xl border py-2 text-sm font-medium transition-all ${
                          draft.gender === value
                            ? 'border-primary bg-primary/15 text-primary'
                            : 'border-outline-variant/45 bg-surface-container/70 text-on-surface-variant hover:border-primary/40'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {draft.gender === 'O' && (
                    <input
                      value={draft.customGender}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          customGender: event.target.value,
                        }))
                      }
                      className="mt-2 w-full rounded-xl border border-outline-variant/45 bg-surface-container/70 px-3 py-2 text-sm text-on-surface outline-none focus:border-primary"
                      placeholder="Enter custom gender"
                    />
                  )}
                </div>

                <label className="block">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    Bio
                  </span>
                  <textarea
                    rows={4}
                    value={draft.bio}
                    onChange={(event) =>
                      setDraft((prev) => ({ ...prev, bio: event.target.value }))
                    }
                    className="w-full resize-none rounded-xl border border-outline-variant/45 bg-surface-container/70 px-3 py-2 text-sm text-on-surface outline-none focus:border-primary"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    Website
                  </span>
                  <div className="relative">
                    <FiGlobe className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                    <input
                      value={draft.website}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          website: event.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-outline-variant/45 bg-surface-container/70 py-2 pl-10 pr-3 text-sm text-on-surface outline-none focus:border-primary"
                      placeholder="example.com"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    GitHub
                  </span>
                  <div className="relative">
                    <FaGithub className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                    <input
                      value={draft.github}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          github: event.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-outline-variant/45 bg-surface-container/70 py-2 pl-10 pr-3 text-sm text-on-surface outline-none focus:border-primary"
                      placeholder="github.com/username"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    Twitter / X
                  </span>
                  <div className="relative">
                    <FaXTwitter className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                    <input
                      value={draft.twitter}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          twitter: event.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-outline-variant/45 bg-surface-container/70 py-2 pl-10 pr-3 text-sm text-on-surface outline-none focus:border-primary"
                      placeholder="x.com/username"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    LinkedIn
                  </span>
                  <div className="relative">
                    <FaLinkedinIn className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                    <input
                      value={draft.linkedin}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          linkedin: event.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-outline-variant/45 bg-surface-container/70 py-2 pl-10 pr-3 text-sm text-on-surface outline-none focus:border-primary"
                      placeholder="linkedin.com/in/username"
                    />
                  </div>
                </label>
              </div>

              <div className="mt-5 flex justify-end gap-2.5">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setEditOpen(false)}
                  disabled={
                    profileUpdateMutation.isPending ||
                    imageUploadMutation.isPending
                  }
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={saveDraft}
                  disabled={
                    profileUpdateMutation.isPending ||
                    imageUploadMutation.isPending
                  }
                >
                  {profileUpdateMutation.isPending ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CHANGE PASSWORD MODAL */}
      <AnimatePresence>
        {changePasswordOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[220] flex items-center justify-center p-4"
            onMouseDown={() => setChangePasswordOpen(false)}
          >
            <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              onMouseDown={(event) => event.stopPropagation()}
              className="relative z-10 w-full max-w-lg rounded-3xl border border-outline-variant/35 bg-surface/80 p-4 sm:p-5 backdrop-blur-2xl"
            >
              <h2 className="text-xl font-headline font-bold text-on-surface">
                Change Password
              </h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                Update your password to keep your account secure.
              </p>

              <div className="mt-5 space-y-3.5">
                <label className="block">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    Current Password
                  </span>
                  <input
                    type="password"
                    value={passwordForm.oldPassword}
                    onChange={(event) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        oldPassword: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-outline-variant/45 bg-surface-container/70 px-3 py-2 text-sm text-on-surface outline-none focus:border-primary"
                    placeholder="Enter your current password"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    New Password
                  </span>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(event) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        newPassword: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-outline-variant/45 bg-surface-container/70 px-3 py-2 text-sm text-on-surface outline-none focus:border-primary"
                    placeholder="Enter a new password"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    Confirm Password
                  </span>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(event) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        confirmPassword: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-outline-variant/45 bg-surface-container/70 px-3 py-2 text-sm text-on-surface outline-none focus:border-primary"
                    placeholder="Confirm your new password"
                  />
                </label>
              </div>

              <div className="mt-5 flex justify-end gap-2.5">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setChangePasswordOpen(false)}
                  disabled={changePasswordMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleChangePassword}
                  disabled={changePasswordMutation.isPending}
                >
                  {changePasswordMutation.isPending ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Updating...
                    </>
                  ) : (
                    'Change Password'
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DELETE ACCOUNT MODAL */}
      <AnimatePresence>
        {deleteAccountOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[220] flex items-center justify-center p-4"
            onMouseDown={() => setDeleteAccountOpen(false)}
          >
            <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              onMouseDown={(event) => event.stopPropagation()}
              className="relative z-10 w-full max-w-lg rounded-3xl border border-rose-500/30 bg-rose-500/5 p-4 sm:p-5 backdrop-blur-2xl"
            >
              <div className="mb-4 flex items-center gap-3 text-rose-500">
                <AlertTriangle size={24} />
                <h2 className="text-xl font-headline font-bold">
                  Delete Account
                </h2>
              </div>
              <p className="text-sm text-on-surface-variant">
                This action cannot be undone. All your data, posts, and profile
                information will be permanently deleted.
              </p>

              <div className="mt-4">
                <label className="block">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    Confirm Password
                  </span>
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(event) => setDeletePassword(event.target.value)}
                    className="w-full rounded-xl border border-rose-500/40 bg-surface-container/70 px-3 py-2 text-sm text-on-surface outline-none focus:border-rose-500"
                    placeholder="Enter your password to confirm"
                  />
                </label>
              </div>

              <div className="mt-6 flex justify-end gap-2.5">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setDeleteAccountOpen(false)
                    setDeletePassword('')
                  }}
                  disabled={deleteAccountMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="bg-rose-500 hover:bg-rose-600 text-white"
                  onClick={handleDeleteAccount}
                  disabled={deleteAccountMutation.isPending}
                >
                  {deleteAccountMutation.isPending ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={14} /> Delete Account
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

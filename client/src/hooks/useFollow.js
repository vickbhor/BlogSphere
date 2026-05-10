import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toggleFollow, getAuthorProfile, getAllAuthors, getTopAuthors } from '../services/followApi'
import { useAuth } from '../context/AuthContext'

export function useFollow(userId) {
  const { token, user, updateUser } = useAuth()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => toggleFollow(token, userId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['author', userId] })
      queryClient.invalidateQueries({ queryKey: ['authors'] })
      queryClient.invalidateQueries({ queryKey: ['topAuthors'] })
      
      if(user) {
        queryClient.invalidateQueries({ queryKey: ['myProfile'] })
        queryClient.invalidateQueries({ queryKey: ['my-profile'] })
        
        let newFollowing = [...(user.following || [])]
        
        if (data?.message?.toLowerCase().includes('unfollow') || data?.isFollowing === false) {
          newFollowing = newFollowing.filter(id => id !== userId)
        } else if (data?.message?.toLowerCase().includes('follow success') || data?.message?.toLowerCase().includes('follow') || data?.isFollowing === true) {
          if (!newFollowing.includes(userId)) {
            newFollowing.push(userId)
          }
        }
        
        updateUser({ following: newFollowing })
      }
    }
  })

  return {
    toggleFollow: mutation.mutate,
    toggleFollowAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error
  }
}

export function useAuthorProfile(userId) {
  const { token } = useAuth()
  return useQuery({
    queryKey: ['author', userId],
    queryFn: () => getAuthorProfile(userId, token),
    enabled: !!userId,
  })
}

export function useAllAuthors(params) {
  const { token } = useAuth()
  return useQuery({
    queryKey: ['authors', params],
    queryFn: () => getAllAuthors(params, token)
  })
}

export function useTopAuthors(limit = 5) {
  const { token } = useAuth()
  return useQuery({
    queryKey: ['topAuthors', limit],
    queryFn: () => getTopAuthors(limit, token)
  })
}
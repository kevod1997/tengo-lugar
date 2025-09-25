import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '@/actions/notifications'
import { useEffect } from 'react'
import { toast } from 'sonner'

export function useNotificationQueries() {
  const queryClient = useQueryClient()

  // Get notifications query
  const {
    data: notificationsResponse,
    isLoading: isLoadingNotifications,
    error: notificationsError,
    refetch: refetchNotifications
  } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    select: (response) => response.success ? response.data : [],
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true
  })

  // Mark single notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => markNotificationRead({ notificationId }),
    onMutate: async (notificationId) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['notifications'] })

      // Snapshot the previous value
      const previousNotifications = queryClient.getQueryData(['notifications'])

      // Optimistically update to the new value
      queryClient.setQueryData(['notifications'], (old: any) => {
        // Handle the actual cache structure: {success: true, data: [...]}
        if (!old || typeof old !== 'object') {
          return old
        }
        
        // Check if it's the server response format
        if (old.success && Array.isArray(old.data)) {
          const updatedData = old.data.map((notification: any) => {
            const isMatch = notification.id === notificationId
            return isMatch
              ? { ...notification, read: true }
              : notification
          })
          
          return { ...old, data: updatedData }
        }
        
        // Fallback: if it's already just the array
        if (Array.isArray(old)) {
          const updated = old.map((notification: any) => {
            const isMatch = notification.id === notificationId
            return isMatch
              ? { ...notification, read: true }
              : notification
          })
          
          return updated
        }
        
        return old
      })

      // Return a context object with the snapshotted value
      return { previousNotifications }
    },
    onSuccess: (response) => {
      if (response.success) {
        toast.success('Notificación marcada como leída')
      } else {
        toast.error('Error al marcar la notificación como leída')
      }
    },
    onError: (err, notificationId, context) => {
      console.error('Mark as read error:', err)
      toast.error('Error al marcar la notificación como leída')
      
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousNotifications) {
        queryClient.setQueryData(['notifications'], context.previousNotifications)
      }
    }
  })

  // Mark all notifications as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onMutate: async () => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['notifications'] })

      // Snapshot the previous value
      const previousNotifications = queryClient.getQueryData(['notifications'])

      // Optimistically update to the new value - mark all as read
      queryClient.setQueryData(['notifications'], (old: any) => {
        // Handle the actual cache structure: {success: true, data: [...]}
        if (!old || typeof old !== 'object') {
          return old
        }
        
        // Check if it's the server response format
        if (old.success && Array.isArray(old.data)) {
          const updatedData = old.data.map((notification: any) => {
            return { ...notification, read: true }
          })
          
          return { ...old, data: updatedData }
        }
        
        // Fallback: if it's already just the array
        if (Array.isArray(old)) {
          const updated = old.map((notification: any) => {
            return { ...notification, read: true }
          })
          
          return updated
        }
        
        return old
      })

      // Return a context object with the snapshotted value
      return { previousNotifications }
    },
    onSuccess: (response) => {
      if (!response.success) {
        toast.error('Error al marcar todas las notificaciones como leídas')
      }
    },
    onError: (err, variables, context) => {
      console.error('Mark all as read error:', err)
      toast.error('Error al marcar todas las notificaciones como leídas')
      
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousNotifications) {
        queryClient.setQueryData(['notifications'], context.previousNotifications)
      }
    }
  })

  // Error handling
  useEffect(() => {
    if (notificationsError) {
      toast.error('Error al cargar las notificaciones')
    }
  }, [notificationsError])

  // Parse notifications data
  const notifications = notificationsResponse || []
  const unreadCount = notifications.filter((n: any) => !n.read).length

  return {
    // Data
    notifications,
    unreadCount,
    isLoadingNotifications,
    notificationsError,

    // Actions
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    refetchNotifications,

    // Loading states
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
  }
}
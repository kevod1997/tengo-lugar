import prisma from "@/lib/prisma"
import { NotificationRole } from "@/types/notification-types"
import { ServiceError } from "@/lib/exceptions/service-error"

export class NotificationRepository {
  
  async getUsersByRole(role: NotificationRole): Promise<string[]> {
    try {
      let whereCondition: any = {}

      if (role === 'driver') {
        whereCondition = { driver: { isNot: null } }
      } else if (role === 'passenger') {
        whereCondition = { passenger: { isNot: null } }
      } else if (role === 'admin') {
        whereCondition = { role: 'ADMIN' }
      }

      const usersWithRole = await prisma.user.findMany({
        where: whereCondition,
        select: { id: true }
      })

      return usersWithRole.map(user => user.id)
    } catch {
      throw ServiceError.DatabaseError(
        `Failed to get users by role: ${role}`,
        'notification-repository.ts',
        'getUsersByRole'
      )
    }
  }

  async getAllUserIds(): Promise<string[]> {
    try {
      const allUsers = await prisma.user.findMany({
        select: { id: true }
      })
      return allUsers.map(user => user.id)
    } catch {
      throw ServiceError.DatabaseError(
        'Failed to get all user IDs',
        'notification-repository.ts',
        'getAllUserIds'
      )
    }
  }

  async validateUserIds(userIds: string[]): Promise<string[]> {
    try {
      const existingUsers = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true }
      })
      return existingUsers.map(user => user.id)
    } catch {
      throw ServiceError.DatabaseError(
        'Failed to validate user IDs',
        'notification-repository.ts',
        'validateUserIds'
      )
    }
  }

  async createNotifications(
    userIds: string[],
    title: string,
    message: string,
    link?: string
  ): Promise<any[]> {
    try {
      const createdNotifications: any[] = []

      await prisma.$transaction(async (tx) => {
        for (const userId of userIds) {
          const notification = await tx.notification.create({
            data: {
              title,
              message,
              link: link || null,
              userId,
              read: false
            }
          })
          createdNotifications.push(notification)
        }
      })

      return createdNotifications
    } catch {
      throw ServiceError.DatabaseError(
        'Failed to create notifications',
        'notification-repository.ts',
        'createNotifications'
      )
    }
  }

  async createNotificationsBatch(
    userIds: string[],
    title: string,
    message: string,
    link?: string
  ): Promise<any[]> {
    try {
      const notificationData = userIds.map(userId => ({
        title,
        message,
        link: link || null,
        userId,
        read: false
      }))

      const result = await prisma.notification.createMany({
        data: notificationData
      })

      // Get the created notifications for response
      const createdNotifications = await prisma.notification.findMany({
        where: {
          userId: { in: userIds },
          title,
          message,
          createdAt: {
            gte: new Date(Date.now() - 5000) // Within last 5 seconds
          }
        },
        orderBy: { createdAt: 'desc' },
        take: result.count
      })

      return createdNotifications
    } catch {
      throw ServiceError.DatabaseError(
        'Failed to create notifications in batch',
        'notification-repository.ts',
        'createNotificationsBatch'
      )
    }
  }
}
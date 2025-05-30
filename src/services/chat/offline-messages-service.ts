import { getCacheService } from "./cache-service";

export interface PendingMessage {
  id: string;
  roomId: string;
  content: string;
  userId: string;
  timestamp: string;
  retryCount: number;
}

export class OfflineMessagesService {
  private cacheService = getCacheService();
  
  private getKey(userId: string, roomId: string): string {
    return `offline:messages:${userId}:${roomId}`;
  }

  async savePendingMessage(userId: string, roomId: string, message: PendingMessage): Promise<void> {
    const key = this.getKey(userId, roomId);
    const messages = await this.getPendingMessages(userId, roomId);
    messages.push(message);
    
    // Guardar por 24 horas
    await this.cacheService.set(key, messages, 86400);
  }

  async getPendingMessages(userId: string, roomId: string): Promise<PendingMessage[]> {
    const key = this.getKey(userId, roomId);
    const messages = await this.cacheService.get<PendingMessage[]>(key);
    return messages || [];
  }

  async removePendingMessage(userId: string, roomId: string, messageId: string): Promise<void> {
    const key = this.getKey(userId, roomId);
    const messages = await this.getPendingMessages(userId, roomId);
    const filtered = messages.filter(msg => msg.id !== messageId);
    
    if (filtered.length > 0) {
      await this.cacheService.set(key, filtered, 86400);
    } else {
      await this.cacheService.delete(key);
    }
  }

  async clearPendingMessages(userId: string, roomId: string): Promise<void> {
    const key = this.getKey(userId, roomId);
    await this.cacheService.delete(key);
  }
}
import { ChatMessage } from "@/types/chat-types";

export interface ChatHistoryResponse {
  messages: ChatMessage[];
}

export interface ChatRoomInfo {
  status: 'active' | 'not_created';
  room_id?: string;
  trip_id: string;
  can_create?: boolean;
  created_at?: string;
}

export class ChatService {
  private baseUrl: string;
  private token: string;

  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

//   async fetchHistory(roomId: string, limit = 50, beforeId?: string): Promise<ChatHistoryResponse> {
//     const params = new URLSearchParams({ limit: limit.toString() });
//     if (beforeId) params.append('before_id', beforeId);

//     const response = await fetch(`${this.baseUrl}/chat/${roomId}/messages?${params}`, {
//       headers: {
//         'Authorization': `Bearer ${this.token}`,
//         'Content-Type': 'application/json'
//       }
//     });
//     console.log(`Fetching chat history for room ${roomId} from ${this.baseUrl}/chat/${roomId}/messages?${params}`);
//     console.log(response.json())

//     if (!response.ok) {
//       throw new Error(`Failed to fetch chat history: ${response.statusText}`);
//     }

//     return response.json();
//   }

    async fetchHistory(roomId: string, limit = 50, beforeId?: string): Promise<ChatHistoryResponse> {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (beforeId) params.append('before_id', beforeId);

    const fetchUrl = `${this.baseUrl}/chat/${roomId}/messages?${params}`;
    console.log(`Fetching chat history for room ${roomId} from ${fetchUrl} with token: ${this.token ? this.token.substring(0, 20) + '...' : 'null'}`);

    const response = await fetch(fetchUrl, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`Response status from ${fetchUrl}: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      let errorBody = "Could not read error body";
      try {
        errorBody = await response.text(); // Try to get error details from body
      } catch (e) {
        console.error("Failed to read error body:", e);
      }
      console.error(`Failed to fetch chat history from ${fetchUrl}. Status: ${response.status}. Body: ${errorBody}`);
      throw new Error(`Failed to fetch chat history: ${response.statusText}`); // statusText will be "Not Found" for a 404
    }

    // If response.ok is true, then try to parse JSON
    return response.json();
  }

  async getTripChatRoom(tripId: string): Promise<ChatRoomInfo> {
    const response = await fetch(`${this.baseUrl}/trip/${tripId}/chat`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log(`Fetching chat room for trip ${tripId} from ${this.baseUrl}/trip/${tripId}/chat`);
    console.log(response)

    if (!response.ok) {
      throw new Error(`Failed to get chat room info: ${response.statusText}`);
    }

    return response.json();
  }

  async createChatRoom(tripId: string): Promise<{ room_id: string; trip_id: string; message: string }> {
    const response = await fetch(`${this.baseUrl}/chat/create/${tripId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to create chat room: ${response.statusText}`);
    }

    return response.json();
  }

  async getActiveUsers(roomId: string): Promise<{ active_users: any[] }> {
    const response = await fetch(`${this.baseUrl}/chat/${roomId}/users`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get active users: ${response.statusText}`);
    }

    return response.json();
  }
}
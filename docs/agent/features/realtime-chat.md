# Real-time Chat Integration

## Overview
Tengo Lugar integrates with an external chat service for real-time communication between drivers and passengers.

**API URL**: Configured via `NEXT_PUBLIC_CHAT_API_URL`
**WebSocket URL**: Configured via `NEXT_PUBLIC_CHAT_WEBSOCKET_URL`

---

## Architecture

### Components

1. **JWT Token Generation** - `/api/auth/token` endpoint
2. **Chat Room Creation** - Automatic per trip
3. **WebSocket Connection** - Real-time messaging
4. **Authentication** - JWT tokens with user role and trip context

---

## JWT Token Generation

### Token Endpoint

**Location**: [src/app/api/auth/token/route.ts](../../../src/app/api/auth/token/route.ts)

Generates JWT tokens for external service authentication.

### Token Structure

```typescript
interface ChatTokenPayload {
  userId: string;
  email: string;
  role: 'admin' | 'user';
  name: string;
  // Optional trip context
  tripId?: string;
  tripRole?: 'driver' | 'passenger';
}
```

### Generate Token

```typescript
'use client'

export async function getChatToken() {
  const response = await fetch('/api/auth/token', {
    method: 'GET',
    credentials: 'include', // Include cookies
  });

  if (!response.ok) {
    throw new Error('Failed to generate chat token');
  }

  const { token } = await response.json();
  return token;
}
```

---

## Chat Room Creation

### Automatic Room Creation

When a trip is created, a chat room is automatically created for all participants.

```typescript
'use server'

import { requireAuthentication } from "@/utils/helpers/auth-helper";
import { createChatRoom } from "@/lib/chat/chat-api";

export async function createTrip(tripData: any) {
  const session = await requireAuthentication('create-trip.ts', 'createTrip');

  // Create trip in database
  const trip = await prisma.trip.create({
    data: tripData,
    include: {
      driverCar: {
        include: {
          driver: {
            include: { user: true }
          }
        }
      }
    }
  });

  // Create chat room
  const chatRoom = await createChatRoom({
    tripId: trip.id,
    participants: [
      {
        userId: trip.driverCar.driver.userId,
        role: 'driver'
      }
    ]
  });

  // Update trip with chat room ID
  await prisma.trip.update({
    where: { id: trip.id },
    data: { chatRoomId: chatRoom.id }
  });

  return ApiHandler.handleSuccess(trip, 'Trip created');
}
```

### Add Passenger to Chat Room

```typescript
export async function addPassengerToTrip(tripId: string, passengerId: string) {
  const session = await requireAuthentication('add-passenger.ts', 'addPassengerToTrip');

  // Add passenger to trip
  const tripPassenger = await prisma.tripPassenger.create({
    data: {
      tripId,
      passengerId
    },
    include: {
      trip: true,
      passenger: {
        include: { user: true }
      }
    }
  });

  // Add passenger to chat room
  await addParticipantToChatRoom(tripPassenger.trip.chatRoomId, {
    userId: tripPassenger.passenger.userId,
    role: 'passenger'
  });

  return ApiHandler.handleSuccess(tripPassenger);
}
```

---

## Client-Side Chat Integration

### Initialize Chat Client

```typescript
'use client'

import { useEffect, useState } from 'react';
import { getChatToken } from '@/lib/chat/get-token';

export function ChatComponent({ tripId }: { tripId: string }) {
  const [chatToken, setChatToken] = useState<string | null>(null);
  const [chatClient, setChatClient] = useState<any>(null);

  useEffect(() => {
    async function initChat() {
      // Get JWT token
      const token = await getChatToken();
      setChatToken(token);

      // Initialize chat client
      const client = new ChatClient({
        apiUrl: process.env.NEXT_PUBLIC_CHAT_API_URL,
        wsUrl: process.env.NEXT_PUBLIC_CHAT_WEBSOCKET_URL,
        token
      });

      await client.connect();
      setChatClient(client);
    }

    initChat();

    return () => {
      chatClient?.disconnect();
    };
  }, []);

  if (!chatClient) {
    return <div>Loading chat...</div>;
  }

  return <ChatInterface client={chatClient} tripId={tripId} />;
}
```

### Send Message

```typescript
export function ChatInterface({ client, tripId }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    // Listen for new messages
    client.on('message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    // Load chat history
    client.loadHistory(tripId).then(setMessages);
  }, [client, tripId]);

  const sendMessage = async () => {
    await client.sendMessage(tripId, {
      text: inputValue,
      timestamp: new Date().toISOString()
    });

    setInputValue('');
  };

  return (
    <div>
      <div className="messages">
        {messages.map((msg) => (
          <div key={msg.id}>
            <strong>{msg.sender.name}:</strong> {msg.text}
          </div>
        ))}
      </div>

      <input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
```

---

## WebSocket Connection

### Connect to Chat WebSocket

```typescript
class ChatClient {
  private ws: WebSocket | null = null;
  private token: string;
  private wsUrl: string;

  constructor(config: { apiUrl: string; wsUrl: string; token: string }) {
    this.token = config.token;
    this.wsUrl = config.wsUrl;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(`${this.wsUrl}?token=${this.token}`);

      this.ws.onopen = () => {
        console.log('Chat WebSocket connected');
        resolve(true);
      };

      this.ws.onerror = (error) => {
        console.error('Chat WebSocket error:', error);
        reject(error);
      };

      this.ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      };

      this.ws.onclose = () => {
        console.log('Chat WebSocket disconnected');
        // Attempt reconnection
        setTimeout(() => this.connect(), 5000);
      };
    });
  }

  private handleMessage(message: any) {
    // Emit message event
    this.emit('message', message);
  }

  sendMessage(roomId: string, message: any) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }

    this.ws.send(JSON.stringify({
      type: 'message',
      roomId,
      message
    }));
  }

  disconnect() {
    this.ws?.close();
  }
}
```

---

## Chat API Integration

### Chat API Client

**Location**: [src/lib/chat/chat-api.ts](../../../src/lib/chat/chat-api.ts)

```typescript
export async function createChatRoom(data: {
  tripId: string;
  participants: Array<{ userId: string; role: string }>;
}) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_CHAT_API_URL}/rooms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${await getServiceToken()}`
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error('Failed to create chat room');
  }

  return response.json();
}

export async function addParticipantToChatRoom(
  roomId: string,
  participant: { userId: string; role: string }
) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_CHAT_API_URL}/rooms/${roomId}/participants`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getServiceToken()}`
      },
      body: JSON.stringify(participant)
    }
  );

  if (!response.ok) {
    throw new Error('Failed to add participant');
  }

  return response.json();
}

export async function getChatHistory(roomId: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_CHAT_API_URL}/rooms/${roomId}/messages`,
    {
      headers: {
        'Authorization': `Bearer ${await getServiceToken()}`
      }
    }
  );

  if (!response.ok) {
    throw new Error('Failed to get chat history');
  }

  return response.json();
}
```

---

## Authentication Flow

### Token Flow Diagram

```
1. User logs in to Tengo Lugar
   ↓
2. User accesses trip chat
   ↓
3. Frontend requests JWT token from /api/auth/token
   ↓
4. Token includes: userId, role, tripId context
   ↓
5. Frontend connects to Chat WebSocket with token
   ↓
6. Chat service validates token with JWKS
   ↓
7. User can send/receive messages
```

### Token Cookie Forwarding

The token endpoint forwards the user's session cookie:

```typescript
// In /api/auth/token route
export async function GET(request: NextRequest) {
  // Get session cookie
  const cookie = request.headers.get('cookie');

  // Forward to better-auth to verify session
  const { data: session } = await betterFetch<Session>("/api/auth/get-session", {
    baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
    headers: { cookie: cookie || "" },
  });

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Generate JWT token for chat service
  const token = generateChatToken({
    userId: session.user.id,
    email: session.user.email,
    role: session.user.role,
    name: session.user.name
  });

  return NextResponse.json({ token });
}
```

---

## Environment Variables

```bash
# Chat Service
NEXT_PUBLIC_CHAT_API_URL=https://chat-api.example.com
NEXT_PUBLIC_CHAT_WEBSOCKET_URL=wss://chat-ws.example.com

# JWT Configuration (for external service)
JWT_SECRET=your-jwt-secret
JWT_ISSUER=tengo-lugar
JWT_AUDIENCE=chat-service
```

---

## Security Considerations

### 1. Token Expiration

JWT tokens should have short expiration times:

```typescript
const token = jwt.sign(payload, JWT_SECRET, {
  expiresIn: '1h', // 1 hour
  issuer: JWT_ISSUER,
  audience: JWT_AUDIENCE
});
```

### 2. Token Validation

The chat service should validate tokens using JWKS:

```typescript
// Chat service validates token
const decoded = jwt.verify(token, publicKey, {
  issuer: 'tengo-lugar',
  audience: 'chat-service'
});
```

### 3. Room Access Control

Verify user has access to chat room:

```typescript
export async function accessChatRoom(roomId: string) {
  const session = await requireAuthentication('access-chat.ts', 'accessChatRoom');

  // Verify user is participant
  const trip = await prisma.trip.findFirst({
    where: {
      chatRoomId: roomId,
      OR: [
        { driverCar: { driver: { userId: session.user.id } } },
        { passengers: { some: { passenger: { userId: session.user.id } } } }
      ]
    }
  });

  if (!trip) {
    throw ServerActionError.AuthorizationFailed('access-chat.ts', 'accessChatRoom');
  }

  return true;
}
```

---

## Troubleshooting

### Token Generation Failed

**Issue**: `/api/auth/token` returns 401

**Solution**: Verify user session cookie is being sent:
```typescript
fetch('/api/auth/token', {
  credentials: 'include' // Include cookies
});
```

### WebSocket Connection Failed

**Issue**: WebSocket connection fails immediately

**Solution**: Check NEXT_PUBLIC_CHAT_WEBSOCKET_URL and token validity

### Messages Not Delivered

**Issue**: Messages sent but not received by other participants

**Solution**: Verify chat room ID and participant membership

---

## Related Documentation

- [Authentication Patterns](../patterns/authentication.md) - JWT token generation
- [WebSocket Notifications](websocket-notifications.md) - WebSocket patterns
- [Server Actions](../patterns/server-actions.md) - Chat room creation

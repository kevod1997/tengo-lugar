'use client'
import React, { useState, useRef, useEffect } from 'react';

export default function ChatTest() {
  const [token, setToken] = useState('');
  const [roomId, setRoomId] = useState('');
  const [status, setStatus] = useState('Disconnected');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<{content: string, type: string}[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const connect = () => {
    if (!token || !roomId) {
      addMessage('Please enter both token and room ID', 'system');
      return;
    }

    // Close existing connection if any
    if (socketRef.current) {
      socketRef.current.close();
    }

    // Connect to WebSocket
    const socket = new WebSocket(`wss://chatroomapi-production.up.railway.app/ws/${roomId}`);
    socketRef.current = socket;

    setStatus('Connecting...');

    socket.onopen = () => {
      // Send authentication token
      socket.send(JSON.stringify({ token }));
      setStatus('Connected');
      addMessage('WebSocket connected', 'system');
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Received:', data);

      if (data.type === 'system') {
        addMessage(data.content, 'system');
      } else if (data.type === 'message') {
        addMessage(`${data.user_name}: ${data.content}`, 'message');
      } else if (data.type === 'error') {
        addMessage(`Error: ${data.content}`, 'error');
      }
    };

    socket.onclose = () => {
      setStatus('Disconnected');
      addMessage('WebSocket connection closed', 'system');
    };

    socket.onerror = (error) => {
      setStatus('Error');
      addMessage(`WebSocket error: ${error.toString()}`, 'error');
    };
  };

  const sendMessage = () => {
    if (message && socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ message }));
      setMessage('');
    }
  };

  const addMessage = (content: string, type: string) => {
    setMessages(prev => [...prev, { content, type }]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-5">
      <h1 className="text-2xl font-bold mb-4">WebSocket Chat Test</h1>
      
      <div className="mb-3">
        <label htmlFor="token" className="block mb-1">JWT Token:</label>
        <input
          type="text"
          id="token"
          className="w-full p-2 border rounded"
          placeholder="Paste your JWT token here"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
      </div>
      
      <div className="mb-3">
        <label htmlFor="room-id" className="block mb-1">Room ID:</label>
        <input
          type="text"
          id="room-id"
          className="w-full p-2 border rounded"
          placeholder="Enter room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
      </div>
      
      <button 
        className="px-4 py-2 bg-blue-500 text-white rounded mb-3"
        onClick={connect}
      >
        Connect
      </button>
      
      <div className={`mb-3 p-2 font-bold ${
        status === 'Connected' ? 'bg-green-100' : 
        status === 'Connecting...' ? 'bg-yellow-100' : 'bg-red-100'
      } rounded`}>
        Status: {status}
      </div>
      
      <div className="h-96 border rounded p-3 mb-3 overflow-y-auto">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`mb-2 ${
              msg.type === 'system' ? 'text-gray-500' : 
              msg.type === 'error' ? 'text-red-500' : ''
            }`}
          >
            {msg.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="flex">
        <input
          type="text"
          className="flex-grow p-2 border rounded-l"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={status !== 'Connected'}
        />
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-r"
          onClick={sendMessage}
          disabled={status !== 'Connected'}
        >
          Send
        </button>
      </div>
    </div>
  );
}
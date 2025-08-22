'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { websocketNotificationService } from '@/services/websocket/websocket-notification-service';
import Header from '@/components/header/header';

interface LogEntry {
  id: string;
  timestamp: string;
  type: 'info' | 'error' | 'success' | 'warning';
  message: string;
}

export default function TestWebSocketPage() {
  const [connectionState, setConnectionState] = useState('disconnected');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [messageCount, setMessageCount] = useState(0);

  const addLog = (type: LogEntry['type'], message: string) => {
    const logEntry: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
    };
    setLogs(prev => [...prev, logEntry]);
  };

  useEffect(() => {
    // Set up event listeners
    const handleConnected = () => {
      setConnectionState('connected');
      addLog('success', `WebSocket connected successfully!`);
    };

    const handleDisconnected = (data: any) => {
      setConnectionState('disconnected');
      addLog('warning', `WebSocket disconnected: ${data?.reason || 'Unknown reason'}`);
    };

    const handleMessage = (data: any) => {
      setMessageCount(prev => prev + 1);
      addLog('info', `Message received: ${JSON.stringify(data)}`);
    };

    const handleError = (data: any) => {
      addLog('error', `WebSocket error: ${JSON.stringify(data)}`);
    };

    const handleReconnecting = (data: any) => {
      setConnectionState('reconnecting');
      addLog('warning', `Reconnecting... Attempt ${data?.attempt || 'unknown'}`);
    };

    // Add event listeners
    websocketNotificationService.on('connected', handleConnected);
    websocketNotificationService.on('disconnected', handleDisconnected);
    websocketNotificationService.on('message', handleMessage);
    websocketNotificationService.on('error', handleError);
    websocketNotificationService.on('reconnecting', handleReconnecting);

    // Update initial state
    setConnectionState(websocketNotificationService.getConnectionState());
    setIsAuthenticated(websocketNotificationService.isAuthenticatedStatus());

    // Cleanup event listeners on unmount
    return () => {
      websocketNotificationService.off('connected', handleConnected);
      websocketNotificationService.off('disconnected', handleDisconnected);
      websocketNotificationService.off('message', handleMessage);
      websocketNotificationService.off('error', handleError);
      websocketNotificationService.off('reconnecting', handleReconnecting);
    };
  }, []);

  const handleConnect = async () => {
    try {
      setConnectionState('connecting');
      addLog('info', 'Attempting to connect...');
      await websocketNotificationService.connect();
      setIsAuthenticated(websocketNotificationService.isAuthenticatedStatus());
    } catch (error) {
      addLog('error', `Connection failed: ${(error as Error).message}`);
      setConnectionState('disconnected');
    }
  };

  const handleDisconnect = () => {
    addLog('info', 'Manually disconnecting...');
    websocketNotificationService.disconnect();
    setConnectionState('disconnected');
  };

  const handleSendPing = () => {
    if (websocketNotificationService.isConnected()) {
      websocketNotificationService.send({ type: 'ping', payload: { timestamp: Date.now() } });
      addLog('info', 'Sent ping message');
    } else {
      addLog('error', 'Cannot send message: WebSocket not connected');
    }
  };

  const handleSendBroadcast = () => {
    if (websocketNotificationService.isConnected()) {
      websocketNotificationService.send({ 
        type: 'broadcast', 
        payload: { message: `Test message from Tengo Lugar at ${new Date().toLocaleTimeString()}` } 
      });
      addLog('info', 'Sent broadcast message');
    } else {
      addLog('error', 'Cannot send message: WebSocket not connected');
    }
  };

  const clearLogs = () => {
    setLogs([]);
    setMessageCount(0);
  };

  const getConnectionBadgeVariant = () => {
    switch (connectionState) {
      case 'connected': return 'default';
      case 'connecting': case 'reconnecting': return 'secondary';
      case 'disconnected': case 'closed': return 'destructive';
      default: return 'outline';
    }
  };

  const getLogTypeColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      case 'info': default: return 'text-blue-600';
    }
  };

  return (
    <>
      <Header
        breadcrumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Test WebSocket' },
        ]}
      />
      <div className="page-content max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">WebSocket Service Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Connection Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Connection Status
                <Badge variant={getConnectionBadgeVariant()}>
                  {connectionState}
                </Badge>
              </CardTitle>
              <CardDescription>
                WebSocket connection to notification server
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Authenticated:</span>
                <Badge variant={isAuthenticated ? 'default' : 'destructive'}>
                  {isAuthenticated ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Messages Received:</span>
                <Badge variant="outline">{messageCount}</Badge>
              </div>
              
              <div className="flex gap-2 flex-wrap">
                <Button 
                  onClick={handleConnect} 
                  disabled={connectionState === 'connected' || connectionState === 'connecting'}
                  size="sm"
                >
                  Connect
                </Button>
                <Button 
                  onClick={handleDisconnect} 
                  disabled={connectionState === 'disconnected'}
                  variant="outline"
                  size="sm"
                >
                  Disconnect
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Message Testing Card */}
          <Card>
            <CardHeader>
              <CardTitle>Message Testing</CardTitle>
              <CardDescription>
                Send test messages to the WebSocket server
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <Button 
                  onClick={handleSendPing} 
                  disabled={connectionState !== 'connected'}
                  size="sm"
                >
                  Send Ping
                </Button>
                <Button 
                  onClick={handleSendBroadcast} 
                  disabled={connectionState !== 'connected'}
                  variant="outline"
                  size="sm"
                >
                  Send Broadcast
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                These buttons will send test messages to the WebSocket server. 
                Messages will appear in the logs below.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Logs Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Connection Logs
              <Button onClick={clearLogs} variant="outline" size="sm">
                Clear Logs
              </Button>
            </CardTitle>
            <CardDescription>
              Real-time logs of WebSocket events and messages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96 w-full border rounded-md p-4">
              {logs.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No logs yet. Connect to the WebSocket to see activity.
                </div>
              ) : (
                <div className="space-y-2">
                  {logs.map((log) => (
                    <div key={log.id} className="flex gap-2 text-sm font-mono">
                      <span className="text-muted-foreground">{log.timestamp}</span>
                      <span className={getLogTypeColor(log.type)}>
                        [{log.type.toUpperCase()}]
                      </span>
                      <span>{log.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
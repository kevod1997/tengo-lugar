'use client';

import { useState, useEffect } from 'react';

import { toast } from 'sonner';

import { sendTargetedNotification } from '@/actions/notifications/send-targeted-notification';
import Header from '@/components/header/header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useNotifications } from '@/hooks/notifications/useNotifications';
import { useWebSocket } from '@/hooks/websocket/useWebSocket';
import type { TargetedNotificationData } from '@/types/notification-types';

interface LogEntry {
  id: string;
  timestamp: string;
  type: 'info' | 'error' | 'success' | 'warning';
  message: string;
}

export default function TestWebSocketPage() {
  const { 
    connectionState, 
    isConnected, 
    isConnecting, 
    sendMessage, 
    service 
  } = useWebSocket();
  
  const { notifications, unreadCount } = useNotifications();
  
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [messageCount, setMessageCount] = useState(0);
  
  // Notification testing state
  const [notificationTitle, setNotificationTitle] = useState('Test Notification');
  const [notificationMessage, setNotificationMessage] = useState('This is a test message from WebSocket');
  const [targetingType, setTargetingType] = useState<'single' | 'multiple' | 'role' | 'broadcast'>('single');
  const [targetUserId, setTargetUserId] = useState('');
  const [targetUserIds, setTargetUserIds] = useState('');
  const [targetRole, setTargetRole] = useState<'driver' | 'passenger' | 'admin'>('driver');
  const [isSendingNotification, setIsSendingNotification] = useState(false);

  const addLog = (type: LogEntry['type'], message: string) => {
    const logEntry: LogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
    };
    setLogs(prev => [...prev, logEntry]);
  };

  useEffect(() => {
    // Set up event listeners using the service reference from the hook
    const handleConnected = () => {
      addLog('success', `WebSocket connected successfully!`);
    };

    const handleDisconnected = (data: any) => {
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
      addLog('warning', `Reconnecting... Attempt ${data?.attempt || 'unknown'}`);
    };

    // Add event listeners
    service.on('connected', handleConnected);
    service.on('disconnected', handleDisconnected);
    service.on('message', handleMessage);
    service.on('error', handleError);
    service.on('reconnecting', handleReconnecting);

    // Cleanup event listeners on unmount
    return () => {
      service.off('connected', handleConnected);
      service.off('disconnected', handleDisconnected);
      service.off('message', handleMessage);
      service.off('error', handleError);
      service.off('reconnecting', handleReconnecting);
    };
  }, [service]);

  const handleConnect = async () => {
    try {
      addLog('info', 'Attempting to connect...');
      await service.connectWithRetry();
    } catch (error) {
      addLog('error', `Connection failed: ${(error as Error).message}`);
    }
  };

  const handleDisconnect = () => {
    addLog('info', 'Manually disconnecting...');
    service.disconnect();
  };

  const handleSendPing = () => {
    if (isConnected) {
      sendMessage({ type: 'ping', payload: { timestamp: Date.now() } });
      addLog('info', 'Sent ping message');
    } else {
      addLog('error', 'Cannot send message: WebSocket not connected');
    }
  };

  const handleSendBroadcast = () => {
    if (isConnected) {
      sendMessage({ 
        type: 'broadcast', 
        payload: { message: `Test message from Tengo Lugar at ${new Date().toLocaleTimeString()}` } 
      });
      addLog('info', 'Sent broadcast message');
    } else {
      addLog('error', 'Cannot send message: WebSocket not connected');
    }
  };

  const handleSendTestNotification = async () => {
    if (!notificationTitle.trim() || !notificationMessage.trim()) {
      toast.error('Title and message are required');
      return;
    }

    // Validate targeting specific requirements
    if (targetingType === 'single' && !targetUserId.trim()) {
      toast.error('User ID is required for single user targeting');
      return;
    }

    if (targetingType === 'multiple' && !targetUserIds.trim()) {
      toast.error('User IDs are required for multiple user targeting');
      return;
    }

    setIsSendingNotification(true);
    addLog('info', `Starting real notification: "${notificationTitle}"`);
    addLog('info', `Targeting: ${targetingType}`);

    try {
      // Build notification data based on targeting type
      const notificationData: TargetedNotificationData = {
        title: notificationTitle,
        message: notificationMessage,
      };

      switch (targetingType) {
        case 'single':
          notificationData.targetUserId = targetUserId.trim();
          addLog('info', `Target: Single user ${targetUserId}`);
          break;
        case 'multiple':
          notificationData.targetUserIds = targetUserIds.split(',').map(id => id.trim()).filter(Boolean);
          addLog('info', `Target: Multiple users (${notificationData.targetUserIds.length})`);
          break;
        case 'role':
          notificationData.targetRole = targetRole;
          addLog('info', `Target: Role ${targetRole}`);
          break;
        case 'broadcast':
          notificationData.broadcast = true;
          addLog('info', 'Target: Broadcast to all users');
          break;
      }

      // Call the real server action
      addLog('info', 'Calling sendTargetedNotification server action...');
      const result = await sendTargetedNotification(notificationData);

      if (result.success) {
        addLog('success', `✅ Success: ${result.message}`);
        if (result.data) {
          addLog('success', `📊 Created ${result.data.notificationsCreated} notifications for ${result.data.targetUsers} users`);
          toast.success(`Notification sent successfully! Created ${result.data.notificationsCreated} notifications.`);
        } else {
          addLog('warning', 'Notification sent, but no data returned.');
          toast.success('Notification sent successfully!');
        }
        
        // Clear form on success
        setNotificationTitle('Test Notification');
        setNotificationMessage('This is a test message from WebSocket');
        setTargetUserId('');
        setTargetUserIds('');
      } else {
        addLog('error', `❌ Error: ${result.error?.message || 'Unknown error'}`);
        toast.error('Failed to send notification');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      addLog('error', `💥 Exception: ${errorMessage}`);
      toast.error('Error sending notification');
    } finally {
      setIsSendingNotification(false);
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
      case 'disconnected': case 'error': return 'destructive';
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <span>Is Connected:</span>
                <Badge variant={isConnected ? 'default' : 'destructive'}>
                  {isConnected ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Messages Received:</span>
                <Badge variant="outline">{messageCount}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Notifications:</span>
                <Badge variant="outline">{notifications.length} ({unreadCount} unread)</Badge>
              </div>
              
              <div className="flex gap-2 flex-wrap">
                <Button 
                  onClick={handleConnect} 
                  disabled={isConnected || isConnecting}
                  size="sm"
                >
                  Connect
                </Button>
                <Button 
                  onClick={handleDisconnect} 
                  disabled={!isConnected}
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
                  disabled={!isConnected}
                  size="sm"
                >
                  Send Ping
                </Button>
                <Button 
                  onClick={handleSendBroadcast} 
                  disabled={!isConnected}
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

          {/* Notification Testing Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Real Notification Testing</CardTitle>
              <CardDescription>
                Send targeted notifications via Server Action - creates in DB and triggers WebSocket
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={notificationTitle}
                    onChange={(e) => setNotificationTitle(e.target.value)}
                    placeholder="Enter notification title"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="message">Message</Label>
                  <Input
                    id="message"
                    value={notificationMessage}
                    onChange={(e) => setNotificationMessage(e.target.value)}
                    placeholder="Enter notification message"
                  />
                </div>
              </div>

              <div className="grid gap-3">
                <Label>Targeting Type</Label>
                <RadioGroup value={targetingType} onValueChange={(value: 'single' | 'multiple' | 'role' | 'broadcast') => setTargetingType(value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="single" id="single" />
                    <Label htmlFor="single">Single User</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="multiple" id="multiple" />
                    <Label htmlFor="multiple">Multiple Users</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="role" id="role" />
                    <Label htmlFor="role">By Role</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="broadcast" id="broadcast" />
                    <Label htmlFor="broadcast">Broadcast (All Users)</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Conditional targeting fields */}
              {targetingType === 'single' && (
                <div className="grid gap-2">
                  <Label htmlFor="targetUserId">Target User ID</Label>
                  <Input
                    id="targetUserId"
                    value={targetUserId}
                    onChange={(e) => setTargetUserId(e.target.value)}
                    placeholder="Enter user ID (e.g., user123)"
                  />
                </div>
              )}

              {targetingType === 'multiple' && (
                <div className="grid gap-2">
                  <Label htmlFor="targetUserIds">Target User IDs</Label>
                  <Textarea
                    id="targetUserIds"
                    value={targetUserIds}
                    onChange={(e) => setTargetUserIds(e.target.value)}
                    placeholder="Enter user IDs separated by commas (e.g., user1, user2, user3)"
                    rows={3}
                  />
                </div>
              )}

              {targetingType === 'role' && (
                <div className="grid gap-2">
                  <Label htmlFor="targetRole">Target Role</Label>
                  <Select value={targetRole} onValueChange={(value: 'driver' | 'passenger' | 'admin') => setTargetRole(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select target role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="driver">Drivers</SelectItem>
                      <SelectItem value="passenger">Passengers</SelectItem>
                      <SelectItem value="admin">Admins</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {targetingType === 'broadcast' && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    ⚠️ This will send the notification to ALL users in the database.
                  </p>
                </div>
              )}

              <Button 
                onClick={handleSendTestNotification}
                disabled={isSendingNotification || !notificationTitle.trim() || !notificationMessage.trim()}
                className="w-full"
              >
                {isSendingNotification ? 'Sending Real Notification...' : 'Send Real Notification'}
              </Button>

              <p className="text-sm text-muted-foreground">
                This creates real notifications in the database and triggers WebSocket messages to connected clients.
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
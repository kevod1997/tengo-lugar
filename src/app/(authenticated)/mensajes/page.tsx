import { headers } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { MessageSquareText, AlertCircle } from 'lucide-react';

import type { ActiveChatInfo } from '@/actions/chat/get-active-user-chats';
import { getActiveUserChats } from '@/actions/chat/get-active-user-chats'; 
import Header from '@/components/header/header';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { auth } from '@/lib/auth';

export default async function MensajesPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !session.user) {
    redirect('/login?redirect_url=/mensajes');
  }

  const chatsResponse = await getActiveUserChats();

  return (
    <>
      <Header
        breadcrumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Mensajes' },
        ]}
      />
      <div className="page-content">
        <h1 className="text-3xl font-bold mb-6">Mis Chats</h1>
        
        {!chatsResponse.success ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {chatsResponse.error?.message || 'Error al cargar los chats'}
            </AlertDescription>
          </Alert>
        ) : !chatsResponse.data || chatsResponse.data.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquareText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">
              {chatsResponse.message || 'No tienes viajes activos con chats disponibles.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {chatsResponse.data.map((chat: ActiveChatInfo) => { 
              return (
                <Card key={chat.tripId} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center">
                        <MessageSquareText className="mr-2 h-5 w-5 text-primary" />
                        {chat.tripName}
                      </span>
                      {chat.chatRoomId ? (
                        <Link href={`/mensajes/sala/${chat.chatRoomId}?tripId=${chat.tripId}`} passHref>
                          <Button variant="outline" size="sm">Abrir Chat</Button>
                        </Link>
                      ) : (
                        <Button variant="outline" size="sm" disabled>
                          Chat no disponible
                        </Button>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {chat.chatRoomId 
                        ? 'Chat disponible.' 
                        : 'Chat no disponible.'
                      }
                      {` Creado el: ${new Date(chat.createdAt).toLocaleDateString()}`}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
        
        {chatsResponse.success && chatsResponse.message && (
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {chatsResponse.message}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
// src/app/mensajes/page.tsx
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquareText } from 'lucide-react';
import Header from '@/components/header/header';
import { getActiveUserChats, ActiveChatInfo } from '@/actions/chat/get-active-user-chats'; 

export default async function MensajesPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !session.user) {
    return (
      <div className="container mx-auto py-6 px-4">
        <Header breadcrumbs={[{ label: 'Inicio', href: '/' }, { label: 'Mensajes' }]} />
        <p className="mt-6">Debes iniciar sesión para ver tus mensajes.</p>
      </div>
    );
  }

  const activeChats: ActiveChatInfo[] = await getActiveUserChats();

  return (
    <>
      <Header
        breadcrumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Mensajes' },
        ]}
      />
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-3xl font-bold mb-6">Mis Chats</h1>
        {activeChats.length === 0 ? (
          <p className="text-muted-foreground">No tienes viajes activos con chats disponibles.</p>
        ) : (
          <div className="space-y-4">
            {activeChats.map((chat) => { 
              return (
                <Card key={chat.tripId} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center">
                        <MessageSquareText className="mr-2 h-5 w-5 text-primary" />
                        {chat.tripName}
                      </span>
                      <Link href={`/mensajes/sala/${chat.roomId}?tripId=${chat.tripId}`} passHref>
                        <Button variant="outline" size="sm">Abrir Chat</Button>
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Chat disponible.
                      {` Creado el: ${new Date(chat.createdAt).toLocaleDateString()}`}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
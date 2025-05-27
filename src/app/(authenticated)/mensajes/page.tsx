// src/app/mensajes/page.tsx
import { getActiveUserChats } from '@/actions/chat/get-active-user-chats';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquareText } from 'lucide-react';
import Header from '@/components/header/header';

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

  const activeChats = await getActiveUserChats();

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
              if (chat.status === 'not_created') { 
                // Si la sala no existe, a pesar de que deberían crearse automáticamente,
                // es mejor no mostrar nada o un mensaje de "Pendiente de creación".
                // O si 'not_created' también significa que el usuario actual (ej. pasajero)
                // aún no debe verla hasta que el conductor haga algo, esta lógica puede cambiar.
                // Por ahora, si es 'not_created' simplemente no mostramos botón de abrir.
                return (
                  <Card key={chat.tripId}>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <MessageSquareText className="mr-2 h-5 w-5 text-muted-foreground" />
                        {chat.tripName}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                       <p className="text-sm text-muted-foreground">
                        El chat para este viaje está pendiente o no disponible por el momento.
                      </p>
                    </CardContent>
                  </Card>
                );
              }

              if (chat.status === 'active' && chat.roomId) {
                return (
                  <Card key={chat.tripId} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center">
                          <MessageSquareText className="mr-2 h-5 w-5 text-primary" />
                          {chat.tripName}
                        </span>
                        <Link href={`/mensajes/room/${chat.roomId}?tripId=${chat.tripId}`} passHref>
                          <Button variant="outline" size="sm">Abrir Chat</Button>
                        </Link>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Chat disponible.
                        {chat.createdAt && ` Creado el: ${new Date(chat.createdAt).toLocaleDateString()}`}
                      </p>
                    </CardContent>
                  </Card>
                );
              }

              // Manejar otros estados como 'error' o 'no_access'
              return (
                 <Card key={chat.tripId}>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <MessageSquareText className="mr-2 h-5 w-5 text-muted-foreground" />
                        {chat.tripName}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                       <p className="text-sm text-destructive">
                        {chat.status === 'error' ? 'Error al cargar información del chat.' : 'No tienes acceso a este chat.'}
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
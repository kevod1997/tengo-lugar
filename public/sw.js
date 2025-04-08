// This service worker handles push notifications and notification clicks

self.addEventListener('push', function(event) {
  if (!event.data) return;

  try {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'Nueva notificación',
      icon: data.icon || '/icon.png',
      badge: '/badge.png',
      vibrate: [100, 50, 100], // Good for mobile notifications
      data: {
        url: data.url || '/', // URL to open when notification is clicked
        dateOfArrival: Date.now(),
        ...data.data
      },
      // Additional useful options
      tag: data.tag, // For notification grouping
      requireInteraction: data.requireInteraction || false, // Keep notification visible until user interacts
      actions: data.actions || [] // Action buttons on the notification
    };

    event.waitUntil(self.registration.showNotification(data.title || 'Tengo Lugar', options));
  } catch (error) {
    console.error('Error showing notification:', error);
    
    // Fallback if parsing JSON fails
    event.waitUntil(
      self.registration.showNotification('Tengo Lugar', {
        body: event.data.text() || 'Nueva notificación',
        icon: '/icon.png',
        badge: '/badge.png'
      })
    );
  }
});

// self.addEventListener('notificationclick', function(event) {
//   console.log('Notification click received.');
//   event.notification.close();
  
//   // Get URL from notification data or use default
//   const urlToOpen = event.notification.data?.url || 'https://tengo-lugar.vercel.app/';
  
//   // Check if there's already a window/tab open with this URL
//   event.waitUntil(
//     clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
//       // Try to find an existing window with our URL
//       for (let i = 0; i < clientList.length; i++) {
//         const client = clientList[i];
//         const url = new URL(client.url);
//         const appUrl = new URL(urlToOpen);
        
//         // If we find a window with our app's domain
//         if (url.origin === appUrl.origin) {
//           // If it's the exact URL or root, focus it
//           if (client.url === urlToOpen || (url.pathname === '/' && appUrl.pathname === '/')) {
//             return client.focus();
//           }
//         }
//       }
      
//       // If no matching window found, open a new one
//       return clients.openWindow(urlToOpen);
//     })
//   );
// });

// Make sure service worker activates and takes control quickly

self.addEventListener('notificationclick', function(event) {
  console.log('Notification click received.');
  event.notification.close();
  
  console.log('Notification data:', event.notification.data);
  
  const originUrl = self.location.origin;
  console.log('Service Worker origin:', originUrl);
  
  let urlToOpen;
  
  try {
    if (event.notification.data && event.notification.data.url) {
      if (!event.notification.data.url.startsWith('http')) {
        urlToOpen = `${originUrl}${event.notification.data.url.startsWith('/') ? '' : '/'}${event.notification.data.url}`;
      } else {
        urlToOpen = event.notification.data.url;
      }
      new URL(urlToOpen);
    } else {
      urlToOpen = originUrl + '/';
    }
  } catch (e) {
    console.error('Invalid URL in notification data:', e);
    urlToOpen = originUrl + '/';
  }
  
  console.log('Target URL:', urlToOpen);
  const targetUrl = new URL(urlToOpen);
  
  event.waitUntil(
    clients.matchAll({ 
      type: 'window', 
      includeUncontrolled: true 
    }).then(function(windowClients) {
      console.log('Found window clients:', windowClients.length);
      
      // Verificar si hay ventanas exactamente iguales primero
      const exactMatch = windowClients.find(client => {
        return client.url === urlToOpen;
      });
      
      if (exactMatch) {
        console.log('Found window with exact URL match, just focusing without navigation');
        return exactMatch.focus();
      }
      
      // Buscar ventanas con el mismo origen
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        const clientUrl = new URL(client.url);
        
        console.log('Checking client:', client.url);
        
        if (clientUrl.origin === targetUrl.origin) {
          console.log('Found existing window with matching origin');
          
          // Comprobar si las rutas son similares (ejem: / y /dashboard)
          if (clientUrl.pathname === targetUrl.pathname) {
            console.log('Pathname matches exactly, just focusing');
            return client.focus();
          }
          
          // Si la ruta es diferente pero el origen es el mismo,
          // comprobar si la app ya está completamente cargada
          if (client.url.includes('/auth-redirect')) {
            console.log('Client is in auth-redirect, waiting for proper initialization');
            // Opcional: podrías intentar otra ventana o continuar con la siguiente
            continue;
          }
          
          console.log('Navigating within existing window');
          
          // Solo navegar si la URL de destino es diferente a la actual
          if (client.url !== urlToOpen) {
            // Posible opción 1: Usar postMessage para comunicar con la ventana
            // Esto evita el refresh y permite usar el router de Next.js
            client.postMessage({
              type: 'NAVIGATE',
              url: targetUrl.pathname + targetUrl.search + targetUrl.hash
            });
            
            return client.focus();
          } else {
            // Si ya estamos en la URL correcta, solo enfocar
            return client.focus();
          }
        }
      }
      
      // Si no hay ventanas con nuestra app, abrimos una nueva
      console.log('No existing window found, opening new one');
      return clients.openWindow(urlToOpen);
    }).catch(error => {
      console.error('Error handling click:', error);
      return clients.openWindow(originUrl);
    })
  );
});

self.addEventListener('install', function(event) {
  self.skipWaiting(); // Activate new service worker immediately
});

self.addEventListener('activate', function(event) {
  event.waitUntil(clients.claim()); // Take control of clients immediately
});
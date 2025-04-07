// self.addEventListener('push', function (event) {
//   if (event.data) {
//     const data = event.data.json()
//     const options = {
//       body: data.body,
//       icon: data.icon || '/icon.png',
//       badge: '/badge.png',
//       vibrate: [100, 50, 100],
//       data: {
//         dateOfArrival: Date.now(),
//         primaryKey: '2',
//       },
//     }
//     event.waitUntil(self.registration.showNotification(data.title, options))
//   }
// })
 
// self.addEventListener('notificationclick', function (event) {
//   console.log('Notification click received.')
//   event.notification.close()
//   event.waitUntil(clients.openWindow('https://tengo-lugar.vercel.app/'))
// })

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

self.addEventListener('notificationclick', function(event) {
  console.log('Notification click received.');
  event.notification.close();
  
  // Get URL from notification data or use default
  const urlToOpen = event.notification.data?.url || 'https://tengo-lugar.vercel.app/';
  
  // Check if there's already a window/tab open with this URL
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // Try to find an existing window with our URL
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        const url = new URL(client.url);
        const appUrl = new URL(urlToOpen);
        
        // If we find a window with our app's domain
        if (url.origin === appUrl.origin) {
          // If it's the exact URL or root, focus it
          if (client.url === urlToOpen || (url.pathname === '/' && appUrl.pathname === '/')) {
            return client.focus();
          }
        }
      }
      
      // If no matching window found, open a new one
      return clients.openWindow(urlToOpen);
    })
  );
});

// Make sure service worker activates and takes control quickly
self.addEventListener('install', function(event) {
  self.skipWaiting(); // Activate new service worker immediately
});

self.addEventListener('activate', function(event) {
  event.waitUntil(clients.claim()); // Take control of clients immediately
});
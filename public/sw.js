self.addEventListener('push', function (event) {
    if (event.data) {
      try {
        const data = event.data.json();
        const options = {
          body: data.body || '',
          icon: data.icon || '/icon.png',
          badge: '/badge.png',
          data: {
            ...data,
            dateOfArrival: Date.now(),
          },
          vibrate: [100, 50, 100],
          requireInteraction: data.requireInteraction || false,
        };
  
        event.waitUntil(
          self.registration.showNotification(data.title || 'Tengo Lugar', options)
        );
      } catch (e) {
        console.error('Error showing notification:', e);
      }
    }
  });
  
  self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    
    // Custom data from notification
    const data = event.notification.data;
    let url = '/';
    
    // If the notification has a specific URL to open
    if (data && data.url) {
      url = data.url;
    }
    
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then(function (clientList) {
          // Check if there's already a window/tab open with the target URL
          for (let i = 0; i < clientList.length; i++) {
            const client = clientList[i];
            if (client.url === url && 'focus' in client) {
              return client.focus();
            }
          }
          // If no window/tab is open with the URL, open a new one
          if (clients.openWindow) {
            return clients.openWindow(url);
          }
        })
    );
  });
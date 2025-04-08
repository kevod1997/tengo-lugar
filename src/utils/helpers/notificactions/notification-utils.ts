// Archivo: components/notifications/utils/notificationUtils.ts

/**
 * Convierte una cadena base64 a un Uint8Array para las claves VAPID
 */
export function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
  
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }
  
  /**
   * Verifica la compatibilidad del navegador para notificaciones push
   */
  export function checkBrowserCompatibility() {
    // Verificar si estamos en HTTPS (obligatorio para notificaciones)
    const isSecureContext = window.isSecureContext;
    if (!isSecureContext) {
      return {
        compatible: false,
        reason: 'Se requiere una conexión segura (HTTPS) para las notificaciones push.'
      };
    }
  
    // Detectar iOS y Safari primero, antes de verificar API Push
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  
    // PWA installed check (has standalone mode)
    const isPWA = window.matchMedia('(display-mode: standalone)').matches;
  
    // Verificar iOS específicamente
    if (isIOS) {
      // Obtener la versión de iOS
      const match = navigator.userAgent.match(/OS (\d+)_(\d+)_?(\d+)?/);
      if (match) {
        const version = [
          parseInt(match[1], 10),
          parseInt(match[2], 10),
        ];
  
        // Si es iOS pero no está instalado como PWA
        if (!isPWA) {
          return {
            compatible: false,
            reason: 'NEEDS_PWA_INSTALL',
            iosVersion: `${version[0]}.${version[1]}`,
            browser: isSafari ? 'safari' : 'otro'
          };
        }
  
        // Si es iOS < 16.4, las notificaciones push no son compatibles aún como PWA
        if (version[0] < 16 || (version[0] === 16 && version[1] < 4)) {
          return {
            compatible: false,
            reason: 'UNSUPPORTED_IOS',
            iosVersion: `${version[0]}.${version[1]}`,
            browser: isSafari ? 'safari' : 'otro'
          };
        }
      }
    } else if (isSafari) {
      // Safari en macOS también tiene limitaciones específicas
      const match = navigator.userAgent.match(/Version\/(\d+)\.(\d+)/);
      if (match) {
        const version = [
          parseInt(match[1], 10),
          parseInt(match[2], 10)
        ];
  
        // Safari < 16.1 no soporta notificaciones push
        if (version[0] < 16 || (version[0] === 16 && version[1] < 1)) {
          return {
            compatible: false,
            reason: 'Tu versión de Safari no soporta notificaciones push. Necesitas Safari 16.1 o superior en macOS Ventura (13.0) o superior.',
            safariVersion: `${version[0]}.${version[1]}`
          };
        }
      }
    }
  
    // Ahora verificamos el soporte de APIs generales
  
    // Verificar si el navegador soporta Service Workers
    if (!('serviceWorker' in navigator)) {
      return {
        compatible: false,
        reason: 'Tu navegador no soporta Service Workers, necesarios para notificaciones push.'
      };
    }
  
    // Verificar si el navegador soporta API Push
    if (!('PushManager' in window)) {
      return {
        compatible: false,
        reason: 'Tu navegador no soporta la API Push, necesaria para notificaciones push.'
      };
    }
  
    // Verificar si el navegador soporta API Notification
    if (!('Notification' in window)) {
      return {
        compatible: false,
        reason: 'Tu navegador no soporta la API de Notificaciones.'
      };
    }
  
    return { compatible: true };
  }
  
  /**
   * Verifica si las notificaciones están habilitadas a nivel de sistema
   */
  export async function checkSystemNotificationsEnabled(): Promise<boolean> {
    try {
      // Verificar si tenemos permiso de notificaciones a nivel web
      if (Notification.permission !== 'granted') {
        return false;
      }
  
      // Intentar mostrar una notificación de prueba silenciosa
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification('test', {
        silent: true,
        tag: 'test-system',
        requireInteraction: false
      });
  
      // Eliminar la notificación de prueba inmediatamente
      setTimeout(() => {
        registration.getNotifications({ tag: 'test-system' }).then(notifications => {
          notifications.forEach(notification => notification.close());
        });
      }, 100);
  
      return true;
    } catch (error) {
      console.log('Error al probar notificaciones del sistema:', error);
      return false;
    }
  }
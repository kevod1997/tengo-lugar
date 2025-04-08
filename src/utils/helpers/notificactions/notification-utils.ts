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
    console.log("⚙️ Comprobando compatibilidad del navegador para notificaciones push");
    console.log("📱 User Agent:", navigator.userAgent);
    
    // Verificar si estamos en HTTPS (obligatorio para notificaciones)
    const isSecureContext = window.isSecureContext;
    console.log("🔒 Contexto seguro (HTTPS):", isSecureContext);
    
    if (!isSecureContext) {
      return {
        compatible: false,
        reason: 'Se requiere una conexión segura (HTTPS) para las notificaciones push.'
      };
    }
  
    // Usar solo userAgent para detección (evitando platform que está obsoleto)
    const userAgent = navigator.userAgent;
    
    // Detección de dispositivos mejorada usando solo userAgent
    const isIOS = /iPhone|iPad|iPod/i.test(userAgent) && !(window as any).MSStream;
    const isWindows = /Windows NT/i.test(userAgent);
    const isMac = /Macintosh/i.test(userAgent);
    const isAndroid = /Android/i.test(userAgent);
    
    // Detectar navegadores
    const isSafari = /Safari/i.test(userAgent) && !/Chrome/i.test(userAgent);
    const isChrome = /Chrome/i.test(userAgent) && !/Edg/i.test(userAgent);
    const isFirefox = /Firefox/i.test(userAgent);
    const isEdge = /Edg/i.test(userAgent);
    
    console.log("📊 Detección de dispositivo:", {
      isIOS,
      isWindows,
      isMac,
      isAndroid,
      isSafari,
      isChrome,
      isFirefox,
      isEdge,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight
    });
    
    // Verificar la resolución del navegador
    const isMobileViewport = window.innerWidth < 768;
    console.log("📐 Viewport móvil:", isMobileViewport);
    
    // Evitar confusiones con simulaciones de viewport móvil en desktop
    if (isMobileViewport && (isWindows || isMac)) {
      console.log("⚠️ Detectado viewport móvil en dispositivo desktop");
    }
  
    // PWA installed check (has standalone mode)
    const isPWA = window.matchMedia('(display-mode: standalone)').matches;
    console.log("📲 Instalado como PWA:", isPWA);
  
    // Verificar iOS específicamente
    if (isIOS) {
      console.log("🍎 Detectado dispositivo iOS");
      // Obtener la versión de iOS
      const match = userAgent.match(/OS (\d+)_(\d+)_?(\d+)?/);
      if (match) {
        const version = [
          parseInt(match[1], 10),
          parseInt(match[2], 10),
        ];
        
        console.log(`📱 Versión iOS detectada: ${version[0]}.${version[1]}`);
  
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
      } else {
        console.warn("⚠️ No se pudo determinar la versión de iOS");
      }
    } else if (isSafari && isMac) {
      console.log("🧭 Detectado Safari en macOS");
      // Safari en macOS también tiene limitaciones específicas
      const match = userAgent.match(/Version\/(\d+)\.(\d+)/);
      if (match) {
        const version = [
          parseInt(match[1], 10),
          parseInt(match[2], 10)
        ];
        
        console.log(`🧭 Versión Safari detectada: ${version[0]}.${version[1]}`);
  
        // Safari < 16.1 no soporta notificaciones push
        if (version[0] < 16 || (version[0] === 16 && version[1] < 1)) {
          return {
            compatible: false,
            reason: 'Tu versión de Safari no soporta notificaciones push. Necesitas Safari 16.1 o superior en macOS Ventura (13.0) o superior.',
            safariVersion: `${version[0]}.${version[1]}`
          };
        }
      } else {
        console.warn("⚠️ No se pudo determinar la versión de Safari");
      }
    }
  
    // Ahora verificamos el soporte de APIs generales
    console.log("🔍 Verificando soporte de APIs...");
  
    // Verificar si el navegador soporta Service Workers
    const supportsServiceWorker = 'serviceWorker' in navigator;
    console.log("👷 Soporte para Service Workers:", supportsServiceWorker);
    if (!supportsServiceWorker) {
      return {
        compatible: false,
        reason: 'Tu navegador no soporta Service Workers, necesarios para notificaciones push.'
      };
    }
  
    // Verificar si el navegador soporta API Push
    const supportsPushManager = 'PushManager' in window;
    console.log("📤 Soporte para API Push:", supportsPushManager);
    if (!supportsPushManager) {
      return {
        compatible: false,
        reason: 'Tu navegador no soporta la API Push, necesaria para notificaciones push.'
      };
    }
  
    // Verificar si el navegador soporta API Notification
    const supportsNotification = 'Notification' in window;
    console.log("🔔 Soporte para API Notification:", supportsNotification);
    if (!supportsNotification) {
      return {
        compatible: false,
        reason: 'Tu navegador no soporta la API de Notificaciones.'
      };
    }
  
    console.log("✅ El navegador es compatible con notificaciones push");
    return { 
      compatible: true,
      deviceInfo: {
        isIOS,
        isWindows,
        isMac,
        isAndroid,
        isSafari,
        isChrome,
        isFirefox,
        isEdge,
        isPWA,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
          isMobile: isMobileViewport
        },
        userAgent
      }
    };
}
  
/**
 * Verifica si las notificaciones están habilitadas a nivel de sistema
 */
export async function checkSystemNotificationsEnabled(): Promise<boolean> {
    console.log("🔍 Verificando si las notificaciones están habilitadas a nivel de sistema");
    try {
      // Verificar si tenemos permiso de notificaciones a nivel web
      const permissionStatus = Notification.permission;
      console.log("🔐 Estado de permiso de notificaciones:", permissionStatus);
      
      if (permissionStatus !== 'granted') {
        console.log("❌ No hay permiso para notificaciones");
        return false;
      }
  
      // Intentar mostrar una notificación de prueba silenciosa
      console.log("🧪 Intentando mostrar notificación de prueba silenciosa");
      const registration = await navigator.serviceWorker.ready;
      console.log("👷 Service Worker listo");
      
      await registration.showNotification('test', {
        silent: true,
        tag: 'test-system',
        requireInteraction: false
      });
      console.log("✓ Notificación de prueba mostrada");
  
      // Eliminar la notificación de prueba inmediatamente
      setTimeout(() => {
        registration.getNotifications({ tag: 'test-system' }).then(notifications => {
          console.log(`🧹 Limpiando ${notifications.length} notificaciones de prueba`);
          notifications.forEach(notification => notification.close());
        });
      }, 100);
  
      console.log("✅ Las notificaciones están habilitadas a nivel de sistema");
      return true;
    } catch (error) {
      console.error('❌ Error al probar notificaciones del sistema:', error);
      return false;
    }
}
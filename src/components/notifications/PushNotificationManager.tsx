// 'use client'

// import { useState, useEffect, useCallback } from 'react'
// import { subscribeUser, unsubscribeUser, sendTestNotification } from '@/actions/notifications/push-notifications'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
// import { toast } from 'sonner'
// import { useApiResponse } from '@/hooks/ui/useApiResponse'
// import { AlertCircle, Info, Bell, Settings, Square } from 'lucide-react'
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'

// interface NotificationResponse {
//   sent: boolean;
//   message?: string;
//   successCount?: number;
//   total?: number;
// }

// function urlBase64ToUint8Array(base64String: string) {
//   const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
//   const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

//   const rawData = window.atob(base64)
//   const outputArray = new Uint8Array(rawData.length)

//   for (let i = 0; i < rawData.length; ++i) {
//     outputArray[i] = rawData.charCodeAt(i)
//   }
//   return outputArray
// }

// // Función para verificar la compatibilidad del navegador
// function checkCompatibility() {
//   // Verificar si estamos en HTTPS (obligatorio para notificaciones)
//   const isSecureContext = window.isSecureContext;
//   if (!isSecureContext) {
//     return {
//       compatible: false,
//       reason: 'Se requiere una conexión segura (HTTPS) para las notificaciones push.'
//     };
//   }

//   // Detectar iOS y Safari primero, antes de verificar API Push
//   const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
//   const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

//   // PWA installed check (has standalone mode)
//   const isPWA = window.matchMedia('(display-mode: standalone)').matches;

//   // Verificar iOS específicamente
//   if (isIOS) {
//     // Obtener la versión de iOS
//     const match = navigator.userAgent.match(/OS (\d+)_(\d+)_?(\d+)?/);
//     if (match) {
//       const version = [
//         parseInt(match[1], 10),
//         parseInt(match[2], 10),
//       ];

//       // Si es iOS pero no está instalado como PWA
//       if (!isPWA) {
//         return {
//           compatible: false,
//           reason: 'NEEDS_PWA_INSTALL',
//           iosVersion: `${version[0]}.${version[1]}`,
//           browser: isSafari ? 'safari' : 'otro'
//         };
//       }

//       // Si es iOS < 16.4, las notificaciones push no son compatibles aún como PWA
//       if (version[0] < 16 || (version[0] === 16 && version[1] < 4)) {
//         return {
//           compatible: false,
//           reason: 'UNSUPPORTED_IOS',
//           iosVersion: `${version[0]}.${version[1]}`,
//           browser: isSafari ? 'safari' : 'otro'
//         };
//       }
//     }
//   } else if (isSafari) {
//     // Safari en macOS también tiene limitaciones específicas
//     const match = navigator.userAgent.match(/Version\/(\d+)\.(\d+)/);
//     if (match) {
//       const version = [
//         parseInt(match[1], 10),
//         parseInt(match[2], 10)
//       ];

//       // Safari < 16.1 no soporta notificaciones push
//       if (version[0] < 16 || (version[0] === 16 && version[1] < 1)) {
//         return {
//           compatible: false,
//           reason: 'Tu versión de Safari no soporta notificaciones push. Necesitas Safari 16.1 o superior en macOS Ventura (13.0) o superior.',
//           safariVersion: `${version[0]}.${version[1]}`
//         };
//       }
//     }
//   }

//   // Ahora verificamos el soporte de APIs generales

//   // Verificar si el navegador soporta Service Workers
//   if (!('serviceWorker' in navigator)) {
//     return {
//       compatible: false,
//       reason: 'Tu navegador no soporta Service Workers, necesarios para notificaciones push.'
//     };
//   }

//   // Verificar si el navegador soporta API Push
//   if (!('PushManager' in window)) {
//     return {
//       compatible: false,
//       reason: 'Tu navegador no soporta la API Push, necesaria para notificaciones push.'
//     };
//   }

//   // Verificar si el navegador soporta API Notification
//   if (!('Notification' in window)) {
//     return {
//       compatible: false,
//       reason: 'Tu navegador no soporta la API de Notificaciones.'
//     };
//   }

//   return { compatible: true };
// }

// // Función para verificar si las notificaciones están habilitadas a nivel de sistema
// async function checkSystemNotificationsEnabled(): Promise<boolean> {
//   try {
//     // Verificar si tenemos permiso de notificaciones a nivel web
//     if (Notification.permission !== 'granted') {
//       return false;
//     }

//     // Intentar mostrar una notificación de prueba silenciosa
//     const registration = await navigator.serviceWorker.ready;
//     await registration.showNotification('test', {
//       silent: true,
//       tag: 'test-system',
//       requireInteraction: false
//     });

//     // Eliminar la notificación de prueba inmediatamente
//     setTimeout(() => {
//       registration.getNotifications({ tag: 'test-system' }).then(notifications => {
//         notifications.forEach(notification => notification.close());
//       });
//     }, 100);

//     return true;
//   } catch (error) {
//     console.log('Error al probar notificaciones del sistema:', error);
//     return false;
//   }
// }

// export function PushNotificationManager() {
//   const [isSupported, setIsSupported] = useState(false)
//   const [subscription, setSubscription] = useState<PushSubscription | null>(null)
//   const [permissionState, setPermissionState] = useState<NotificationPermission | 'unsupported'>('unsupported')
//   const [isLoading, setIsLoading] = useState(false)
//   const [message, setMessage] = useState('')
//   const [error, setError] = useState<string | null>(null)
//   const [isMobile, setIsMobile] = useState(false)
//   const [showPermissionPrompt, setShowPermissionPrompt] = useState(false)
//   const [showExplanationDialog, setShowExplanationDialog] = useState(false)
//   const [showSystemPermissionsGuide, setShowSystemPermissionsGuide] = useState(false)
//   const [showInstallAppPrompt, setShowInstallAppPrompt] = useState(false)
//   const [systemNotificationsDisabled, setSystemNotificationsDisabled] = useState(false)
//   const [isPWAInstalled, setIsPWAInstalled] = useState(false)
//   const [iosVersion, setIosVersion] = useState<string | undefined>(undefined)
//   const { handleResponse } = useApiResponse()

//   // Función para asegurar que el Service Worker esté listo
//   const ensureServiceWorkerReady = useCallback(async () => {
//     try {
//       console.log('Asegurando que el Service Worker esté listo...');

//       // Registrar el Service Worker si aún no está registrado
//       let registration = await navigator.serviceWorker.getRegistration();

//       if (!registration) {
//         console.log('Registrando nuevo Service Worker...');
//         registration = await navigator.serviceWorker.register('/sw.js', {
//           scope: '/',
//           updateViaCache: 'none',
//         });
//       }

//       // Si el Service Worker está instalando o esperando, esperar a que se active
//       if (registration.installing || registration.waiting) {
//         return new Promise<ServiceWorkerRegistration>((resolve) => {
//           const serviceWorker = registration.installing || registration.waiting;

//           serviceWorker?.addEventListener('statechange', (event) => {
//             if ((event.target as ServiceWorker).state === 'activated') {
//               console.log('Service Worker activado');
//               resolve(registration);
//             }
//           });
//         });
//       }

//       // El Service Worker ya está activo
//       console.log('Service Worker ya estaba activo');
//       return registration;
//     } catch (error) {
//       console.error('Error asegurando Service Worker:', error);
//       throw error;
//     }
//   }, []);

//   // Función para solicitar permisos específicamente para móviles
//   const requestPermissionOnMobile = useCallback(async () => {
//     return new Promise<NotificationPermission>(async (resolve) => {
//       try {
//         console.log('Solicitando permiso en móvil...');

//         // En dispositivos móviles, primero verificamos si el Service Worker está listo
//         await ensureServiceWorkerReady();

//         // En algunos navegadores móviles, necesitamos un retraso pequeño después
//         // de la interacción del usuario para que el prompt funcione correctamente
//         setTimeout(async () => {
//           try {
//             // Realizar la solicitud de permiso
//             const permission = await Notification.requestPermission();
//             console.log('Resultado permiso móvil:', permission);
//             resolve(permission);
//           } catch (error) {
//             console.error('Error solicitando permiso móvil:', error);
//             // Si falla, asumimos que es "denied"
//             resolve('denied');
//           }
//         }, 100);
//       } catch (error) {
//         console.error('Error preparando solicitud de permiso móvil:', error);
//         resolve('denied');
//       }
//     });
//   }, [ensureServiceWorkerReady]);

//   useEffect(() => {
//     const isPWA = window.matchMedia('(display-mode: standalone)').matches;
//     setIsPWAInstalled(isPWA);

//     // Listen for changes (in case user installs during session)
//     const mediaQuery = window.matchMedia('(display-mode: standalone)');
//     const listener = (e: MediaQueryListEvent) => setIsPWAInstalled(e.matches);
//     mediaQuery.addEventListener('change', listener);
//     return () => mediaQuery.removeEventListener('change', listener);
//   }, []);

//   useEffect(() => {
//     // Detect mobile
//     const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
//       navigator.userAgent
//     );
//     setIsMobile(isMobileDevice);
//     console.log('¿Es dispositivo móvil?', isMobileDevice);

//     // Verificar compatibilidad
//     const compatibilityResult = checkCompatibility();

//     if (!compatibilityResult.compatible) {
//       console.log('Navegador no compatible:', compatibilityResult.reason);
//       setIsSupported(false);
//       setError(compatibilityResult.reason || 'Razón desconocida');

//       // Store iosVersion if available
//       if ('iosVersion' in compatibilityResult) {
//         setIosVersion(compatibilityResult.iosVersion);
//       }
//       return;
//     }

//     // Verificar estado de permisos actual
//     if ('Notification' in window) {
//       const currentPermission = Notification.permission;
//       setPermissionState(currentPermission);
//       console.log('Estado actual de permisos:', currentPermission);

//       // Configurar listener para cambios de permiso si es posible
//       if ('permissions' in navigator) {
//         navigator.permissions.query({ name: 'notifications' as PermissionName })
//           .then(status => {
//             status.onchange = () => {
//               console.log('Permiso de notificaciones cambiado a:', Notification.permission);
//               setPermissionState(Notification.permission);
//             };
//           })
//           .catch(err => console.log('Error al consultar permisos:', err));
//       }
//     }

//     // Inicializar Service Worker
//     if ('serviceWorker' in navigator && 'PushManager' in window) {
//       setIsSupported(true);
//       console.log('Service Worker y PushManager soportados, inicializando...');

//       // Registrar Service Worker
//       ensureServiceWorkerReady()
//         .then(async (registration) => {
//           console.log('Service Worker listo, verificando suscripción existente...');
//           try {
//             const existingSub = await registration.pushManager.getSubscription();
//             console.log('Suscripción existente:', existingSub ? 'Sí' : 'No');
//             setSubscription(existingSub);
//           } catch (subError) {
//             console.error('Error al verificar suscripción:', subError);
//           }
//         })
//         .catch(err => {
//           console.error('Error al inicializar Service Worker:', err);
//           setError(`Error al inicializar notificaciones: ${err instanceof Error ? err.message : 'Error desconocido'}`);
//         });
//     } else {
//       setIsSupported(false);
//       setError('Tu navegador no soporta notificaciones push.');
//     }
//   }, [ensureServiceWorkerReady]);

//   // Mostrar diálogo explicativo en móviles
//   function initiatePermissionRequest() {
//     setShowExplanationDialog(true);
//   }

//   // Proceder a solicitar permisos después de la explicación
//   async function proceedWithPermissionRequest() {
//     setShowExplanationDialog(false);
//     setShowPermissionPrompt(true);
//   }

//   // Confirmar y solicitar permisos después del diálogo de confirmación
//   async function confirmAndRequestPermissions() {
//     setShowPermissionPrompt(false);
//     subscribeToPushForMobile();
//   }

//   // Versión optimizada para móviles
//   async function subscribeToPushForMobile() {
//     try {
//       setIsLoading(true);
//       setError(null);

//       console.log('Iniciando proceso de suscripción para móvil...');

//       // 1. Asegurarnos de que el Service Worker esté listo
//       const registration = await ensureServiceWorkerReady();
//       console.log('Service Worker listo para suscripción móvil');

//       // 2. Verificar si ya tenemos una suscripción
//       const existingSub = await registration.pushManager.getSubscription();
//       if (existingSub) {
//         console.log('Ya existe una suscripción en el dispositivo móvil');
//         setSubscription(existingSub);
//         const serializedSub = JSON.parse(JSON.stringify(existingSub));
//         const result = await subscribeUser(serializedSub);
//         handleResponse(result);

//         // Verificar si las notificaciones a nivel de sistema funcionan
//         const systemEnabled = await checkSystemNotificationsEnabled();
//         if (!systemEnabled) {
//           console.log('Notificaciones web habilitadas, pero las del sistema están desactivadas');
//           setSystemNotificationsDisabled(true);
//           setShowSystemPermissionsGuide(true);
//           return;
//         }

//         toast.success('¡Notificaciones ya activadas!');
//         return;
//       }

//       // 3. Solicitar permiso específicamente para móviles
//       console.log('Solicitando permiso para móviles...');
//       const permissionResult = await requestPermissionOnMobile();
//       setPermissionState(permissionResult);

//       if (permissionResult !== 'granted') {
//         throw new Error('Permiso de notificaciones denegado');
//       }

//       // 4. Suscribirse una vez que tenemos permiso
//       console.log('Permiso concedido, creando suscripción en móvil...');
//       const newSubscription = await registration.pushManager.subscribe({
//         userVisibleOnly: true,
//         applicationServerKey: urlBase64ToUint8Array(
//           process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
//         ),
//       });

//       console.log('Suscripción creada en móvil:', newSubscription);
//       setSubscription(newSubscription);

//       // 5. Enviar la suscripción al servidor
//       const serializedSub = JSON.parse(JSON.stringify(newSubscription));
//       const result = await subscribeUser(serializedSub);
//       handleResponse(result);

//       // 6. Verificar si las notificaciones a nivel de sistema funcionan
//       const systemEnabled = await checkSystemNotificationsEnabled();
//       if (!systemEnabled) {
//         console.log('Notificaciones web habilitadas, pero las del sistema están desactivadas');
//         setSystemNotificationsDisabled(true);
//         setShowSystemPermissionsGuide(true);
//         return;
//       }

//       toast.success('¡Notificaciones activadas correctamente!');
//     } catch (error) {
//       console.error('Error completo al suscribirse en móvil:', error);

//       if (error instanceof Error) {
//         if (error.name === 'NotAllowedError') {
//           setError('Permiso denegado para recibir notificaciones. En dispositivos móviles, puede que necesites activar las notificaciones en la configuración del navegador.');
//         } else {
//           setError(`Error al suscribirse: ${error.message || 'Error desconocido'}`);
//         }
//       } else {
//         setError('Error desconocido al suscribirse a notificaciones');
//       }

//       toast.error('No se pudo activar las notificaciones');
//     } finally {
//       setIsLoading(false);
//     }
//   }

//   // Versión para navegadores de escritorio
//   async function subscribeToPush() {
//     try {
//       setIsLoading(true);
//       setError(null);

//       console.log('Iniciando proceso de suscripción para escritorio...');

//       // Asegurar que el Service Worker esté listo
//       const registration = await ensureServiceWorkerReady();

//       // Verificar si ya existe una suscripción
//       const existingSub = await registration.pushManager.getSubscription();
//       if (existingSub) {
//         console.log('Ya existe una suscripción en escritorio');
//         setSubscription(existingSub);
//         const serializedSub = JSON.parse(JSON.stringify(existingSub));
//         await subscribeUser(serializedSub);
//         toast.success('¡Notificaciones ya activadas!');
//         return;
//       }

//       // Solicitar permiso explícitamente
//       console.log('Solicitando permiso en escritorio...');
//       const permissionResult = await Notification.requestPermission();
//       setPermissionState(permissionResult);

//       if (permissionResult !== 'granted') {
//         throw new Error('Permiso de notificaciones denegado');
//       }

//       // Suscribirse a las notificaciones
//       console.log('Permiso concedido, creando suscripción en escritorio...');
//       const newSubscription = await registration.pushManager.subscribe({
//         userVisibleOnly: true,
//         applicationServerKey: urlBase64ToUint8Array(
//           process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
//         ),
//       });

//       setSubscription(newSubscription);

//       // Enviar al servidor
//       const serializedSub = JSON.parse(JSON.stringify(newSubscription));
//       const result = await subscribeUser(serializedSub);
//       handleResponse(result);

//       toast.success('¡Notificaciones activadas correctamente!');
//     } catch (error) {
//       console.error('Error subscribing to push:', error);

//       if (error instanceof Error) {
//         if (error.name === 'NotAllowedError') {
//           setError('Permiso denegado para recibir notificaciones. Por favor, actívalas en la configuración de tu navegador.');
//           toast.error('Permiso de notificaciones denegado');
//         } else {
//           setError(`Error al suscribirse: ${error.message || 'Error desconocido'}`);
//           toast.error('Error al suscribirse a notificaciones push');
//         }
//       } else {
//         setError('Error desconocido al suscribirse');
//         toast.error('Error al suscribirse a notificaciones push');
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   }

//   async function unsubscribeFromPush() {
//     try {
//       setIsLoading(true);
//       setError(null);

//       if (subscription) {
//         const endpoint = subscription.endpoint;
//         await subscription.unsubscribe();
//         setSubscription(null);

//         // Notificar al servidor
//         const result = await unsubscribeUser(endpoint);
//         handleResponse(result);

//         toast.success('Notificaciones desactivadas correctamente');
//       }
//     } catch (error) {
//       console.error('Error cancelando suscripción:', error);
//       setError(`Error al cancelar suscripción: ${error instanceof Error ? error.message : 'Error desconocido'}`);
//       toast.error('Error al cancelar la suscripción');
//     } finally {
//       setIsLoading(false);
//     }
//   }

//   async function sendNotification() {
//     if (!message.trim()) {
//       toast.error('Por favor ingresa un mensaje');
//       return;
//     }

//     try {
//       setIsLoading(true);
//       setError(null);

//       const result = await sendTestNotification(message);

//       if (result.success && result.data) {
//         const responseData = result.data as NotificationResponse;

//         if (responseData.sent) {
//           toast.success(
//             responseData.message ||
//             `Notificación enviada (${responseData.successCount}/${responseData.total})`
//           );
//         } else {
//           toast.info(
//             responseData.message ||
//             'No se pudo enviar la notificación'
//           );
//         }

//         setMessage('');
//       } else {
//         toast.error(result.message || 'Error al enviar la notificación');
//       }
//     } catch (error) {
//       console.error('Error sending notification:', error);
//       setError(`Error al enviar la notificación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
//       toast.error('Error al enviar la notificación');
//     } finally {
//       setIsLoading(false);
//     }
//   }

//   if (!isSupported) {
//     // Add custom handling for iOS
//     const isIOSInstallNeeded = error === 'NEEDS_PWA_INSTALL';
//     const isIOSUnsupported = error === 'UNSUPPORTED_IOS';
  
//     return (
//       <Card>
//         <CardHeader>
//           <CardTitle>Notificaciones Push</CardTitle>
//           <CardDescription>
//             {isIOSInstallNeeded 
//               ? "Para recibir notificaciones en iOS, necesitas instalar la aplicación en tu pantalla de inicio."
//               : "Tu navegador no soporta notificaciones push."}
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           {isIOSInstallNeeded && (
//             <div className="space-y-4">
//               <div className="flex items-start gap-2 text-amber-500">
//                 <Info className="h-5 w-5 mt-0.5" />
//                 <div>
//                   <p className="text-sm font-medium">Dispositivo iOS detectado</p>
//                   <p className="text-sm">Las notificaciones push en iOS solo funcionan cuando la aplicación está instalada como PWA.</p>
//                 </div>
//               </div>
              
//               <div className="rounded-md bg-muted p-4">
//                 <h4 className="text-sm font-medium">Cómo instalar la aplicación:</h4>
//                 <ol className="mt-2 list-decimal pl-5 text-sm space-y-1">
//                   <li>Toca el botón <span className="inline-flex items-center"><Square className="h-3 w-3 mr-1" />compartir</span> en la barra de navegación</li>
//                   <li>Desplázate y selecciona "Añadir a pantalla de inicio"</li>
//                   <li>Confirma tocando "Añadir"</li>
//                   <li>Usa la aplicación desde tu pantalla de inicio para recibir notificaciones</li>
//                 </ol>
//               </div>
//             </div>
//           )}
          
//           {isIOSUnsupported && (
//             <div className="flex items-start gap-2 text-amber-500">
//               <Info className="h-5 w-5 mt-0.5" />
//               <div>
//                 <p className="text-sm font-medium">iOS {iosVersion} no soporta notificaciones push</p>
//                 <p className="text-sm">Las notificaciones push requieren iOS 16.4 o superior. Por favor, actualiza tu dispositivo.</p>
//               </div>
//             </div>
//           )}
          
//           {!isIOSInstallNeeded && !isIOSUnsupported && error && (
//             <div className="flex items-start gap-2 text-amber-500">
//               <Info className="h-5 w-5 mt-0.5" />
//               <p className="text-sm">{error}</p>
//             </div>
//           )}
//         </CardContent>
        
//         {isIOSInstallNeeded && (
//           <CardFooter>
//             <Button className="w-full" onClick={() => setShowInstallAppPrompt(true)}>
//               Ver instrucciones detalladas
//             </Button>
//           </CardFooter>
//         )}
//       </Card>
//     );
//   }

//   // Render different UI based on permission state
//   return (
//     <>
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Bell className="h-5 w-5" />
//             Notificaciones Push
//           </CardTitle>
//           <CardDescription>
//             {subscription
//               ? 'Estás suscrito a notificaciones push.'
//               : permissionState === 'denied'
//                 ? 'Has bloqueado las notificaciones para este sitio.'
//                 : 'Recibe notificaciones incluso cuando no estás usando la aplicación.'}
//           </CardDescription>
//         </CardHeader>

//         <CardContent>
//           {error && (
//             <div className="flex items-start gap-2 text-amber-500 mb-4">
//               <AlertCircle className="h-5 w-5 mt-0.5" />
//               <p className="text-sm">{error}</p>
//             </div>
//           )}

//           {/* Mostrar mensaje cuando hay problemas a nivel de sistema */}
//           {systemNotificationsDisabled && subscription && (
//             <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950 p-3 rounded-md mb-4">
//               <Info className="h-5 w-5 mt-0.5 text-amber-500" />
//               <div>
//                 <p className="text-sm font-medium">Notificaciones del sistema desactivadas</p>
//                 <p className="text-xs mt-1">
//                   Has permitido las notificaciones web, pero tu dispositivo está bloqueando que se muestren.
//                   <Button
//                     variant="link"
//                     className="p-0 h-auto text-xs"
//                     onClick={() => setShowSystemPermissionsGuide(true)}
//                   >
//                     Más información
//                   </Button>
//                 </p>
//               </div>
//             </div>
//           )}

//           {/* Show instructions for denied permissions */}
//           {permissionState === 'denied' && (
//             <div className="space-y-2 mb-4">
//               <p className="text-sm">
//                 Has bloqueado las notificaciones para este sitio. Para recibirlas, deberás cambiar la configuración en tu navegador.
//               </p>
//               {isMobile && (
//                 <ul className="text-sm list-disc pl-5 space-y-1">
//                   <li>Ve a la configuración de tu navegador</li>
//                   <li>Busca la sección de Permisos o Configuración de sitios</li>
//                   <li>Encuentra este sitio y cambia el permiso de notificaciones</li>
//                 </ul>
//               )}
//             </div>
//           )}

//           {subscription && (
//             <div className="space-y-4">
//               <Input
//                 type="text"
//                 placeholder="Escribe un mensaje para probar"
//                 value={message}
//                 onChange={(e) => setMessage(e.target.value)}
//               />
//             </div>
//           )}
//         </CardContent>

//         <CardFooter className="flex justify-between">
//           {subscription ? (
//             <>
//               <Button variant="outline" onClick={unsubscribeFromPush} disabled={isLoading}>
//                 Cancelar suscripción
//               </Button>
//               <div className="flex gap-2">
//                 {systemNotificationsDisabled && (
//                   <Button
//                     variant="outline"
//                     onClick={() => setShowInstallAppPrompt(true)}
//                   >
//                     Instalar app
//                   </Button>
//                 )}
//                 <Button onClick={sendNotification} disabled={isLoading || !message.trim()}>
//                   Enviar prueba
//                 </Button>
//               </div>
//             </>
//           ) : permissionState === 'denied' ? (
//             <div className="flex gap-2 w-full justify-between">
//               <Button variant="outline" onClick={() => {
//                 if (isMobile) {
//                   toast.info('Por favor, cambia los permisos de notificaciones en la configuración de tu navegador');
//                 } else {
//                   window.open('about:settings');
//                 }
//               }}>
//                 <Settings className="h-4 w-4 mr-2" />
//                 Ir a configuración
//               </Button>
//               <Button onClick={() => setShowInstallAppPrompt(true)}>
//                 Instalar app
//               </Button>
//             </div>
//           ) : (
//             <Button
//               onClick={isMobile ? initiatePermissionRequest : subscribeToPush}
//               disabled={isLoading}
//             >
//               <Bell className="h-4 w-4 mr-2" />
//               Activar notificaciones
//             </Button>
//           )}
//         </CardFooter>
//       </Card>

//       {/* Diálogo explicativo sobre notificaciones para móviles */}
//       <Dialog open={showExplanationDialog} onOpenChange={setShowExplanationDialog}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Sobre las notificaciones push</DialogTitle>
//             <DialogDescription>
//               Las notificaciones push te permiten recibir alertas importantes incluso cuando no estás usando la aplicación.
//             </DialogDescription>
//           </DialogHeader>
//           <div className="space-y-4 py-4">
//             <div className="flex flex-col space-y-2">
//               <h4 className="font-medium">¿Para qué se utilizan?</h4>
//               <p className="text-sm text-muted-foreground">
//                 Te enviaremos notificaciones sobre:
//               </p>
//               <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
//                 <li>Actualizaciones sobre tus viajes</li>
//                 <li>Nuevas reservas o solicitudes</li>
//                 <li>Recordatorios importantes</li>
//                 <li>Promociones y ofertas especiales</li>
//               </ul>
//             </div>
//             <div className="flex flex-col space-y-2">
//               <h4 className="font-medium">¿Cómo funcionan en dispositivos móviles?</h4>
//               <p className="text-sm text-muted-foreground">
//                 En tu dispositivo móvil, aparecerá una solicitud de permiso del navegador.
//                 Debes seleccionar Permitir para recibir notificaciones.
//               </p>
//             </div>
//           </div>
//           <DialogFooter>
//             <Button variant="outline" onClick={() => setShowExplanationDialog(false)}>
//               Cancelar
//             </Button>
//             <Button onClick={proceedWithPermissionRequest}>
//               Continuar
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Diálogo de confirmación antes de solicitar permisos */}
//       <Dialog open={showPermissionPrompt} onOpenChange={setShowPermissionPrompt}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Permitir notificaciones</DialogTitle>
//             <DialogDescription>
//               Para recibir notificaciones, necesitamos tu permiso.
//             </DialogDescription>
//           </DialogHeader>
//           <div className="py-4">
//             <p className="text-sm">
//               Aparecerá un diálogo del navegador solicitando permiso. Para continuar recibiendo notificaciones, selecciona Permitir.
//             </p>
//             <div className="mt-4 p-4 border rounded bg-muted/50">
//               <p className="text-center text-sm">
//                 <strong>¡Importante!</strong> En algunos navegadores móviles, si rechazas este permiso, podría ser difícil activarlo nuevamente.
//               </p>
//             </div>
//           </div>
//           <DialogFooter>
//             <Button variant="outline" onClick={() => setShowPermissionPrompt(false)}>
//               Cancelar
//             </Button>
//             <Button onClick={confirmAndRequestPermissions}>
//               Solicitar permiso
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Diálogo con instrucciones para habilitar notificaciones a nivel de sistema */}
//       <Dialog open={showSystemPermissionsGuide} onOpenChange={setShowSystemPermissionsGuide}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Habilitar notificaciones del sistema</DialogTitle>
//             <DialogDescription>
//               El navegador requiere permisos adicionales para mostrar notificaciones.
//             </DialogDescription>
//           </DialogHeader>
//           <div className="space-y-4 py-2">
//             <p className="text-sm">
//               Aunque has permitido las notificaciones web, tu navegador no puede mostrarlas porque las
//               notificaciones del sistema están desactivadas para Chrome.
//             </p>

//             <div className="space-y-2">
//               <h4 className="font-medium">Sigue estos pasos:</h4>
//               <ol className="list-decimal pl-5 space-y-2 text-sm">
//                 <li>Abre la aplicación <strong>Configuración</strong> de tu dispositivo</li>
//                 <li>Busca la sección <strong>Aplicaciones</strong> o <strong>Administrador de aplicaciones</strong></li>
//                 <li>Encuentra y selecciona el navegador <strong>Chrome</strong> (o el que estés usando)</li>
//                 <li>Toca <strong>Notificaciones</strong></li>
//                 <li>Activa <strong>Permitir notificaciones</strong></li>
//                 <li>Vuelve a esta página y reinicia el proceso</li>
//               </ol>
//             </div>

//             <div className="mt-4 p-3 bg-blue-50 rounded-md dark:bg-blue-950">
//               <h4 className="font-medium">Otra alternativa:</h4>
//               <p className="text-sm mt-1">
//                 Puedes instalar nuestra aplicación para recibir notificaciones de manera más confiable.
//               </p>
//             </div>
//           </div>
//           <DialogFooter className="flex flex-col sm:flex-row gap-2">
//             <Button variant="outline" onClick={() => setShowSystemPermissionsGuide(false)}>
//               Lo intentaré después
//             </Button>
//             <Button onClick={() => {
//               setShowSystemPermissionsGuide(false);
//               setShowInstallAppPrompt(true);
//             }}>
//               Ver opciones de instalación
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Diálogo para instalar la aplicación como alternativa */}
//       <Dialog open={showInstallAppPrompt} onOpenChange={setShowInstallAppPrompt}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Instalar como aplicación</DialogTitle>
//             <DialogDescription>
//               Instala Tengo Lugar como una aplicación para una mejor experiencia.
//             </DialogDescription>
//           </DialogHeader>
//           <div className="space-y-4 py-2">
//             <p className="text-sm">
//               Al instalar nuestra aplicación web en tu dispositivo:
//             </p>

//             <ul className="list-disc pl-5 space-y-1 text-sm">
//               <li>Recibirás notificaciones de manera más confiable</li>
//               <li>Tendrás acceso rápido desde tu pantalla de inicio</li>
//               <li>Disfrutarás de una experiencia similar a una app nativa</li>
//               <li>No ocupará espacio adicional en tu dispositivo</li>
//             </ul>

//             <div className="bg-muted p-3 rounded-md mt-2">
//               <h4 className="font-medium">¿Cómo instalar?</h4>
//               <p className="text-sm mt-1">
//                 En la mayoría de navegadores, busca la opción Añadir a pantalla de inicio o Instalar aplicación en el menú del navegador.
//               </p>
//             </div>
//           </div>
//           <DialogFooter>
//             <Button onClick={() => setShowInstallAppPrompt(false)}>
//               Entendido
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </>
//   );
// }

'use client'

import { useState, useEffect, useCallback } from 'react'
import { subscribeUser, unsubscribeUser, sendTestNotification } from '@/actions/notifications/push-notifications'
import { toast } from 'sonner'
import { useApiResponse } from '@/hooks/ui/useApiResponse'
import { UnsupportedBrowserCard } from './UnsupportedBrowserCard'
import { NotificationCard } from './NotificationCard'
import { checkBrowserCompatibility, checkSystemNotificationsEnabled, urlBase64ToUint8Array } from '@/utils/helpers/notificactions/notification-utils'
import { ExplanationDialog } from './dialogs/ExplanationDialog'
import { PermissionDialog } from './dialogs/PermissionDialog'
import { SystemPermissionsDialog } from './dialogs/SystemPermissionDialog'
import { InstallAppDialog } from './dialogs/InstallAppDialog'
import { authClient } from '@/lib/auth-client'

interface NotificationResponse {
  sent: boolean;
  message?: string;
  successCount?: number;
  total?: number;
}

export function PushNotificationManager() {
  const { data } = authClient.useSession();

  const [isSupported, setIsSupported] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [permissionState, setPermissionState] = useState<NotificationPermission | 'unsupported'>('unsupported')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false)
  const [showExplanationDialog, setShowExplanationDialog] = useState(false)
  const [showSystemPermissionsGuide, setShowSystemPermissionsGuide] = useState(false)
  const [showInstallAppPrompt, setShowInstallAppPrompt] = useState(false)
  const [systemNotificationsDisabled, setSystemNotificationsDisabled] = useState(false)
  const [isPWAInstalled, setIsPWAInstalled] = useState(false)
  const [iosVersion, setIosVersion] = useState<string | undefined>(undefined)
  const { handleResponse } = useApiResponse()

  // Función para asegurar que el Service Worker esté listo
  const ensureServiceWorkerReady = useCallback(async () => {
    try {
      console.log('Asegurando que el Service Worker esté listo...');

      // Registrar el Service Worker si aún no está registrado
      let registration = await navigator.serviceWorker.getRegistration();

      if (!registration) {
        console.log('Registrando nuevo Service Worker...');
        registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none',
        });
      }

      // Si el Service Worker está instalando o esperando, esperar a que se active
      if (registration.installing || registration.waiting) {
        return new Promise<ServiceWorkerRegistration>((resolve) => {
          const serviceWorker = registration.installing || registration.waiting;

          serviceWorker?.addEventListener('statechange', (event) => {
            if ((event.target as ServiceWorker).state === 'activated') {
              console.log('Service Worker activado');
              resolve(registration);
            }
          });
        });
      }

      // El Service Worker ya está activo
      console.log('Service Worker ya estaba activo');
      return registration;
    } catch (error) {
      console.error('Error asegurando Service Worker:', error);
      throw error;
    }
  }, []);

  // Función para solicitar permisos específicamente para móviles
  const requestPermissionOnMobile = useCallback(async () => {
    return new Promise<NotificationPermission>(async (resolve) => {
      try {
        console.log('Solicitando permiso en móvil...');

        // En dispositivos móviles, primero verificamos si el Service Worker está listo
        await ensureServiceWorkerReady();

        // En algunos navegadores móviles, necesitamos un retraso pequeño después
        // de la interacción del usuario para que el prompt funcione correctamente
        setTimeout(async () => {
          try {
            // Realizar la solicitud de permiso
            const permission = await Notification.requestPermission();
            console.log('Resultado permiso móvil:', permission);
            resolve(permission);
          } catch (error) {
            console.error('Error solicitando permiso móvil:', error);
            // Si falla, asumimos que es "denied"
            resolve('denied');
          }
        }, 100);
      } catch (error) {
        console.error('Error preparando solicitud de permiso móvil:', error);
        resolve('denied');
      }
    });
  }, [ensureServiceWorkerReady]);

  useEffect(() => {
    const isPWA = window.matchMedia('(display-mode: standalone)').matches;
    setIsPWAInstalled(isPWA);

    // Listen for changes (in case user installs during session)
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const listener = (e: MediaQueryListEvent) => setIsPWAInstalled(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  useEffect(() => {
    // Detect mobile
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    setIsMobile(isMobileDevice);
    console.log('¿Es dispositivo móvil?', isMobileDevice);

    // Verificar compatibilidad
    const compatibilityResult = checkBrowserCompatibility();

    if (!compatibilityResult.compatible) {
      console.log('Navegador no compatible:', compatibilityResult.reason);
      setIsSupported(false);
      setError(compatibilityResult.reason || 'Razón desconocida');

      // Store iosVersion if available
      if ('iosVersion' in compatibilityResult) {
        setIosVersion(compatibilityResult.iosVersion);
      }
      return;
    }

    // Verificar estado de permisos actual
    if ('Notification' in window) {
      const currentPermission = Notification.permission;
      setPermissionState(currentPermission);
      console.log('Estado actual de permisos:', currentPermission);

      // Configurar listener para cambios de permiso si es posible
      if ('permissions' in navigator) {
        navigator.permissions.query({ name: 'notifications' as PermissionName })
          .then(status => {
            status.onchange = () => {
              console.log('Permiso de notificaciones cambiado a:', Notification.permission);
              setPermissionState(Notification.permission);
            };
          })
          .catch(err => console.log('Error al consultar permisos:', err));
      }
    }

    // Inicializar Service Worker
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      console.log('Service Worker y PushManager soportados, inicializando...');

      // Registrar Service Worker
      ensureServiceWorkerReady()
        .then(async (registration) => {
          console.log('Service Worker listo, verificando suscripción existente...');
          try {
            const existingSub = await registration.pushManager.getSubscription();
            console.log('Suscripción existente:', existingSub ? 'Sí' : 'No');
            setSubscription(existingSub);
          } catch (subError) {
            console.error('Error al verificar suscripción:', subError);
          }
        })
        .catch(err => {
          console.error('Error al inicializar Service Worker:', err);
          setError(`Error al inicializar notificaciones: ${err instanceof Error ? err.message : 'Error desconocido'}`);
        });
    } else {
      setIsSupported(false);
      setError('Tu navegador no soporta notificaciones push.');
    }
  }, [ensureServiceWorkerReady]);


  // Mostrar diálogo explicativo en móviles
  function initiatePermissionRequest() {
    setShowExplanationDialog(true);
  }

  // Proceder a solicitar permisos después de la explicación
  async function proceedWithPermissionRequest() {
    setShowExplanationDialog(false);
    setShowPermissionPrompt(true);
  }

  // Confirmar y solicitar permisos después del diálogo de confirmación
  async function confirmAndRequestPermissions() {
    setShowPermissionPrompt(false);
    subscribeToPushForMobile();
  }

  // Versión optimizada para móviles
  async function subscribeToPushForMobile() {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Iniciando proceso de suscripción para móvil...');

      // 1. Asegurarnos de que el Service Worker esté listo
      const registration = await ensureServiceWorkerReady();
      console.log('Service Worker listo para suscripción móvil');

      // 2. Verificar si ya tenemos una suscripción
      const existingSub = await registration.pushManager.getSubscription();
      if (existingSub) {
        console.log('Ya existe una suscripción en el dispositivo móvil');
        setSubscription(existingSub);
        const serializedSub = JSON.parse(JSON.stringify(existingSub));
        const result = await subscribeUser(serializedSub);
        handleResponse(result);

        // Verificar si las notificaciones a nivel de sistema funcionan
        const systemEnabled = await checkSystemNotificationsEnabled();
        if (!systemEnabled) {
          console.log('Notificaciones web habilitadas, pero las del sistema están desactivadas');
          setSystemNotificationsDisabled(true);
          setShowSystemPermissionsGuide(true);
          return;
        }

        toast.success('¡Notificaciones ya activadas!');
        return;
      }

      // 3. Solicitar permiso específicamente para móviles
      console.log('Solicitando permiso para móviles...');
      const permissionResult = await requestPermissionOnMobile();
      setPermissionState(permissionResult);

      if (permissionResult !== 'granted') {
        throw new Error('Permiso de notificaciones denegado');
      }

      // 4. Suscribirse una vez que tenemos permiso
      console.log('Permiso concedido, creando suscripción en móvil...');
      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      });

      console.log('Suscripción creada en móvil:', newSubscription);
      setSubscription(newSubscription);

      // 5. Enviar la suscripción al servidor
      const serializedSub = JSON.parse(JSON.stringify(newSubscription));
      const result = await subscribeUser(serializedSub);
      handleResponse(result);

      // 6. Verificar si las notificaciones a nivel de sistema funcionan
      const systemEnabled = await checkSystemNotificationsEnabled();
      if (!systemEnabled) {
        console.log('Notificaciones web habilitadas, pero las del sistema están desactivadas');
        setSystemNotificationsDisabled(true);
        setShowSystemPermissionsGuide(true);
        return;
      }

      toast.success('¡Notificaciones activadas correctamente!');
    } catch (error) {
      console.error('Error completo al suscribirse en móvil:', error);

      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          setError('Permiso denegado para recibir notificaciones. En dispositivos móviles, puede que necesites activar las notificaciones en la configuración del navegador.');
        } else {
          setError(`Error al suscribirse: ${error.message || 'Error desconocido'}`);
        }
      } else {
        setError('Error desconocido al suscribirse a notificaciones');
      }

      toast.error('No se pudo activar las notificaciones');
    } finally {
      setIsLoading(false);
    }
  }

  // Versión para navegadores de escritorio
  async function subscribeToPush() {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Iniciando proceso de suscripción para escritorio...');

      // Asegurar que el Service Worker esté listo
      const registration = await ensureServiceWorkerReady();

      // Verificar si ya existe una suscripción
      const existingSub = await registration.pushManager.getSubscription();
      if (existingSub) {
        console.log('Ya existe una suscripción en escritorio');
        setSubscription(existingSub);
        const serializedSub = JSON.parse(JSON.stringify(existingSub));
        await subscribeUser(serializedSub);
        toast.success('¡Notificaciones ya activadas!');
        return;
      }

      // Solicitar permiso explícitamente
      console.log('Solicitando permiso en escritorio...');
      const permissionResult = await Notification.requestPermission();
      setPermissionState(permissionResult);

      if (permissionResult !== 'granted') {
        throw new Error('Permiso de notificaciones denegado');
      }

      // Suscribirse a las notificaciones
      console.log('Permiso concedido, creando suscripción en escritorio...');
      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      });

      setSubscription(newSubscription);

      // Enviar al servidor
      const serializedSub = JSON.parse(JSON.stringify(newSubscription));
      const result = await subscribeUser(serializedSub);
      handleResponse(result);

      toast.success('¡Notificaciones activadas correctamente!');
    } catch (error) {
      console.error('Error subscribing to push:', error);

      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          setError('Permiso denegado para recibir notificaciones. Por favor, actívalas en la configuración de tu navegador.');
          toast.error('Permiso de notificaciones denegado');
        } else {
          setError(`Error al suscribirse: ${error.message || 'Error desconocido'}`);
          toast.error('Error al suscribirse a notificaciones push');
        }
      } else {
        setError('Error desconocido al suscribirse');
        toast.error('Error al suscribirse a notificaciones push');
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function unsubscribeFromPush() {
    try {
      setIsLoading(true);
      setError(null);

      if (subscription) {
        const endpoint = subscription.endpoint;
        await subscription.unsubscribe();
        setSubscription(null);

        // Notificar al servidor
        const result = await unsubscribeUser(endpoint);
        handleResponse(result);

        toast.success('Notificaciones desactivadas correctamente');
      }
    } catch (error) {
      console.error('Error cancelando suscripción:', error);
      setError(`Error al cancelar suscripción: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      toast.error('Error al cancelar la suscripción');
    } finally {
      setIsLoading(false);
    }
  }

  async function sendNotification() {
    if (!message.trim()) {
      toast.error('Por favor ingresa un mensaje');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await sendTestNotification(message);

      if (result.success && result.data) {
        const responseData = result.data as NotificationResponse;

        if (responseData.sent) {
          toast.success(
            responseData.message ||
            `Notificación enviada (${responseData.successCount}/${responseData.total})`
          );
        } else {
          toast.info(
            responseData.message ||
            'No se pudo enviar la notificación'
          );
        }

        setMessage('');
      } else {
        toast.error(result.message || 'Error al enviar la notificación');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      setError(`Error al enviar la notificación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      toast.error('Error al enviar la notificación');
    } finally {
      setIsLoading(false);
    }
  }

  if(!data) {
    return null;
  }

  if (!isSupported) {
    return <UnsupportedBrowserCard 
      error={error} 
      iosVersion={iosVersion} 
      onShowInstallInstructions={() => setShowInstallAppPrompt(true)} 
    />;
  }

  return (
    <>
      <NotificationCard 
        error={error}
        systemNotificationsDisabled={systemNotificationsDisabled}
        permissionState={permissionState}
        subscription={subscription}
        message={message}
        setMessage={setMessage}
        isLoading={isLoading}
        isMobile={isMobile}
        onUnsubscribe={unsubscribeFromPush}
        onSendNotification={sendNotification}
        onSubscribe={isMobile ? initiatePermissionRequest : subscribeToPush}
        onShowSystemPermissionsGuide={() => setShowSystemPermissionsGuide(true)}
        onShowInstallAppPrompt={() => setShowInstallAppPrompt(true)}
        isPWAInstalled={isPWAInstalled}
      />

      {/* Diálogos */}
      <ExplanationDialog 
        open={showExplanationDialog} 
        onOpenChange={setShowExplanationDialog}
        onProceed={proceedWithPermissionRequest}
      />

      <PermissionDialog 
        open={showPermissionPrompt} 
        onOpenChange={setShowPermissionPrompt}
        onConfirm={confirmAndRequestPermissions}
      />

      <SystemPermissionsDialog 
        open={showSystemPermissionsGuide} 
        onOpenChange={setShowSystemPermissionsGuide}
        onShowInstallOptions={() => {
          setShowSystemPermissionsGuide(false);
          setShowInstallAppPrompt(true);
        }}
      />

      <InstallAppDialog 
        open={showInstallAppPrompt} 
        onOpenChange={setShowInstallAppPrompt}
      />
    </>
  );
}
// Archivo: components/notifications/NotificationCard.tsx
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Info, Bell, Settings } from 'lucide-react'

interface NotificationCardProps {
    error: string | null;
    systemNotificationsDisabled: boolean;
    permissionState: NotificationPermission | 'unsupported';
    subscription: PushSubscription | null;
    message: string;
    setMessage: (message: string) => void;
    isLoading: boolean;
    isMobile: boolean;
    onUnsubscribe: () => Promise<void>;
    onSendNotification: () => Promise<void>;
    onSubscribe: () => void;
    onShowSystemPermissionsGuide: () => void;
    onShowInstallAppPrompt: () => void;
    isPWAInstalled: boolean;
}

export function NotificationCard({
    error,
    systemNotificationsDisabled,
    permissionState,
    subscription,
    message,
    setMessage,
    isLoading,
    isMobile,
    onUnsubscribe,
    onSendNotification,
    onSubscribe,
    onShowSystemPermissionsGuide,
    onShowInstallAppPrompt,
    isPWAInstalled,
}: NotificationCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notificaciones Push
                </CardTitle>
                <CardDescription>
                    {subscription
                        ? 'Estás suscrito a notificaciones push.'
                        : permissionState === 'denied'
                            ? 'Has bloqueado las notificaciones para este sitio.'
                            : 'Recibe notificaciones incluso cuando no estás usando la aplicación.'}
                </CardDescription>
            </CardHeader>

            <CardContent>
                {error && (
                    <div className="flex items-start gap-2 text-amber-500 mb-4">
                        <AlertCircle className="h-5 w-5 mt-0.5" />
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                {!subscription && !isPWAInstalled && (
                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-md">
                        <p className="text-sm">
                            <strong>Consejo:</strong> Instala esta aplicación en tu dispositivo para una experiencia mejor y notificaciones más confiables.
                        </p>
                    </div>
                )}

                {/* Mostrar mensaje cuando hay problemas a nivel de sistema */}
                {systemNotificationsDisabled && subscription && (
                    <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950 p-3 rounded-md mb-4">
                        <Info className="h-5 w-5 mt-0.5 text-amber-500" />
                        <div>
                            <p className="text-sm font-medium">Notificaciones del sistema desactivadas</p>
                            <p className="text-xs mt-1">
                                Has permitido las notificaciones web, pero tu dispositivo está bloqueando que se muestren.
                                <Button
                                    variant="link"
                                    className="p-0 h-auto text-xs"
                                    onClick={onShowSystemPermissionsGuide}
                                >
                                    Más información
                                </Button>
                            </p>
                        </div>
                    </div>
                )}

                {/* Show instructions for denied permissions */}
                {permissionState === 'denied' && (
                    <div className="space-y-2 mb-4">
                        <p className="text-sm">
                            Has bloqueado las notificaciones para este sitio. Para recibirlas, deberás cambiar la configuración en tu navegador.
                        </p>
                        {isMobile && (
                            <ul className="text-sm list-disc pl-5 space-y-1">
                                <li>Ve a la configuración de tu navegador</li>
                                <li>Busca la sección de Permisos o Configuración de sitios</li>
                                <li>Encuentra este sitio y cambia el permiso de notificaciones</li>
                            </ul>
                        )}
                    </div>
                )}

                {subscription && (
                    <div className="space-y-4">
                        <Input
                            type="text"
                            placeholder="Escribe un mensaje para probar"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                    </div>
                )}
            </CardContent>

            <CardFooter className="flex justify-between">
                {subscription ? (
                    <>
                        <Button variant="outline" onClick={onUnsubscribe} disabled={isLoading}>
                            Cancelar suscripción
                        </Button>
                        <div className="flex gap-2">
                            {systemNotificationsDisabled && (
                                <Button
                                    variant="outline"
                                    onClick={onShowInstallAppPrompt}
                                >
                                    Instalar app
                                </Button>
                            )}
                            <Button onClick={onSendNotification} disabled={isLoading || !message.trim()}>
                                Enviar prueba
                            </Button>
                        </div>
                    </>
                ) : permissionState === 'denied' ? (
                    <div className="flex gap-2 w-full justify-between">
                        <Button variant="outline" onClick={() => {
                            if (isMobile) {
                                window.alert('Por favor, cambia los permisos de notificaciones en la configuración de tu navegador');
                            } else {
                                window.open('about:settings');
                            }
                        }}>
                            <Settings className="h-4 w-4 mr-2" />
                            Ir a configuración
                        </Button>
                        <Button onClick={onShowInstallAppPrompt}>
                            Instalar app
                        </Button>
                    </div>
                ) : (
                    <Button
                        onClick={onSubscribe}
                        disabled={isLoading}
                    >
                        <Bell className="h-4 w-4 mr-2" />
                        Activar notificaciones
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
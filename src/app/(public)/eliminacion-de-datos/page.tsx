import Header from "@/components/header/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon, TrashIcon, ClockIcon, ShieldCheckIcon } from "lucide-react"
import Link from "next/link"

export default function EliminacionDatosPage() {
  return (
    <>
      <Header
        breadcrumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Eliminación de Datos' },
        ]}
        showBackButton={true}
      />

      <div className="page-content max-w-4xl mx-auto">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-destructive/10 rounded-full">
                <TrashIcon className="h-8 w-8 text-destructive" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              Eliminación de Datos de Usuario
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Información sobre cómo solicitar la eliminación completa de tu cuenta 
              y todos los datos asociados en Tengo Lugar.
            </p>
          </div>

          {/* Alerta Importante */}
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>Información Importante</AlertTitle>
            <AlertDescription>
              La eliminación de datos es un proceso permanente e irreversible. Una vez completado, 
              no podrás recuperar tu cuenta ni la información asociada.
            </AlertDescription>
          </Alert>

          <div className="space-y-6">

            {/* Qué Datos se Eliminan */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <ShieldCheckIcon className="h-5 w-5 text-green-600" />
                  ¿Qué Datos se Eliminan?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground mb-4">
                  Cuando solicites la eliminación de tu cuenta, eliminaremos permanentemente:
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-green-700">Información Personal</h4>
                    <ul className="space-y-1 text-muted-foreground text-sm">
                      <li>• Nombre y apellido</li>
                      <li>• Dirección de correo electrónico</li>
                      <li>• Número de teléfono</li>
                      <li>• Fecha de nacimiento</li>
                      <li>• Fotografías de perfil</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2 text-green-700">Documentos de Verificación</h4>
                    <ul className="space-y-1 text-muted-foreground text-sm">
                      <li>• Documento de identidad</li>
                      <li>• Licencia de conducir</li>
                      <li>• Documentos del vehículo</li>
                      <li>• Pólizas de seguro</li>
                      <li>• Archivos adjuntos</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2 text-green-700">Información de Viajes</h4>
                    <ul className="space-y-1 text-muted-foreground text-sm">
                      <li>• Historial de viajes como conductor</li>
                      <li>• Historial de viajes como pasajero</li>
                      <li>• Ubicaciones frecuentes</li>
                      <li>• Preferencias de viaje</li>
                      <li>• Calificaciones y reseñas</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2 text-green-700">Datos de Sesión</h4>
                    <ul className="space-y-1 text-muted-foreground text-sm">
                      <li>• Tokens de autenticación</li>
                      <li>• Historial de inicio de sesión</li>
                      <li>• Cookies y datos almacenados</li>
                      <li>• Configuraciones personalizadas</li>
                      <li>• Logs de actividad</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Proceso de Eliminación */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <ClockIcon className="h-5 w-5 text-blue-600" />
                  Proceso de Eliminación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold">Solicitud de Eliminación</h4>
                      <p className="text-muted-foreground text-sm">
                        Contacta nuestro equipo de soporte enviando un correo a{' '}
                        <span className="font-medium text-foreground">info@tengolugar.store</span> 
                        {' '}desde la dirección de email asociada a tu cuenta.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold">Verificación de Identidad</h4>
                      <p className="text-muted-foreground text-sm">
                        Verificaremos tu identidad para asegurar que la solicitud provenga 
                        del titular legítimo de la cuenta.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold">Confirmación Final</h4>
                      <p className="text-muted-foreground text-sm">
                        Te enviaremos una confirmación final por correo electrónico. 
                        Tendrás 7 días para cancelar la solicitud si cambias de opinión.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-semibold text-sm">
                      4
                    </div>
                    <div>
                      <h4 className="font-semibold">Eliminación Completa</h4>
                      <p className="text-muted-foreground text-sm">
                        Procederemos a eliminar permanentemente todos tus datos. 
                        Este proceso puede tomar hasta 30 días hábiles para completarse totalmente.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tiempo de Procesamiento */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Tiempo de Procesamiento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Cronología del Proceso</h4>
                  <ul className="space-y-2 text-blue-800 text-sm">
                    <li>• <strong>Inmediato:</strong> Desactivación de la cuenta</li>
                    <li>• <strong>7 días:</strong> Período de gracia para cancelar la solicitud</li>
                    <li>• <strong>30 días:</strong> Eliminación completa de todos los datos</li>
                    <li>• <strong>90 días:</strong> Eliminación de copias de seguridad (cumplimiento Meta)</li>
                  </ul>
                </div>
                
                <p className="text-muted-foreground text-sm">
                  *Los tiempos pueden variar según el volumen de datos y requisitos de cumplimiento legal.
                </p>
              </CardContent>
            </Card>

            {/* Datos que se Conservan Temporalmente */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Datos que se Conservan Temporalmente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground mb-4">
                  Por razones legales y de seguridad, algunos datos pueden conservarse temporalmente:
                </p>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold mb-2">Registros de Transacciones (90 días)</h4>
                    <p className="text-muted-foreground text-sm">
                      Información básica sobre transacciones para cumplir con obligaciones fiscales y contables.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Logs de Seguridad (180 días)</h4>
                    <p className="text-muted-foreground text-sm">
                      Registros de acceso y actividad para investigaciones de seguridad en curso.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Comunicaciones Legales (7 años)</h4>
                    <p className="text-muted-foreground text-sm">
                      Correspondencia relacionada con asuntos legales o regulatorios.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Alternativas a la Eliminación */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Alternativas a la Eliminación Completa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground mb-4">
                  Antes de solicitar la eliminación completa, considera estas alternativas:
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Desactivación Temporal</h4>
                    <p className="text-muted-foreground text-sm">
                      Pausa tu cuenta sin eliminar datos. Puedes reactivarla cuando desees.
                    </p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Actualización de Privacidad</h4>
                    <p className="text-muted-foreground text-sm">
                      Revisa y actualiza tu configuración de privacidad en lugar de eliminar todo.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información de Contacto */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Contacto para Eliminación de Datos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-red-900 mb-2">Información Requerida en tu Solicitud</h4>
                  <ul className="space-y-1 text-red-800 text-sm">
                    <li>• Dirección de email de la cuenta</li>
                    <li>• Nombre completo registrado</li>
                    <li>• Motivo de la eliminación (opcional)</li>
                    <li>• Confirmación: &quot;Solicito la eliminación completa de mi cuenta&quot;</li>
                  </ul>
                </div>

                <div className="space-y-2 text-muted-foreground">
                  <p><strong>Email de Soporte:</strong> info@tengolugar.store</p>
                  <p><strong>Asunto sugerido:</strong> &quot;Solicitud de eliminación de datos - [Tu nombre]&quot;</p>
                  <p><strong>Tiempo de respuesta:</strong> 2-3 días hábiles</p>
                </div>
              </CardContent>
            </Card>

            {/* Derechos del Usuario */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Tus Derechos de Protección de Datos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Además del derecho a la eliminación, también tienes derecho a:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• <strong>Acceder</strong> a todos los datos que tenemos sobre ti</li>
                  <li>• <strong>Rectificar</strong> información incorrecta o incompleta</li>
                  <li>• <strong>Portar</strong> tus datos a otra plataforma</li>
                  <li>• <strong>Oponerte</strong> al procesamiento de ciertos datos</li>
                  <li>• <strong>Limitar</strong> el procesamiento de tus datos</li>
                </ul>
              </CardContent>
            </Card>

          </div>

          <Separator className="my-8" />

          {/* Footer */}
          <div className="text-center space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>
                Para más información sobre el manejo de tus datos, consulta nuestra{' '}
                <Link href="/politica-de-privacidad" className="text-primary hover:underline">
                  Política de Privacidad
                </Link>
                {' '}y nuestros{' '}
                <Link href="/terminos-y-condiciones" className="text-primary hover:underline">
                  Términos y Condiciones
                </Link>
              </p>
            </div>
            
            <Alert className="max-w-md mx-auto">
              <InfoIcon className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Esta página cumple con los requisitos de eliminación de datos de Meta/Facebook 
                para aplicaciones que utilizan Facebook Login.
              </AlertDescription>
            </Alert>
          </div>

        </div>
      </div>
    </>
  )
}
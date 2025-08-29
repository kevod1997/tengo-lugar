// app/(public)/politica-de-privacidad/page.tsx
import Header from "@/components/header/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

export default function PoliticaPrivacidadPage() {
  return (
    <>
      <Header
        breadcrumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Política de Privacidad' },
        ]}
        showBackButton={true}
      />

      <div className="page-content max-w-4xl mx-auto">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-foreground">
              Política de Privacidad
            </h1>
            <p className="text-muted-foreground">
              Última actualización: {new Date().toLocaleDateString('es-AR')}
            </p>
          </div>

          {/* Introducción */}
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground leading-relaxed">
                En <strong>Tengo Lugar</strong>, respetamos tu privacidad y nos comprometemos a proteger
                tu información personal. Esta Política de Privacidad explica cómo recopilamos, usamos,
                divulgamos y protegemos tu información cuando utilizas nuestra plataforma de viajes compartidos.
              </p>
            </CardContent>
          </Card>

          {/* Secciones */}
          <div className="space-y-6">

            {/* Información que Recopilamos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">1. Información que Recopilamos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Información de Cuenta</h4>
                  <p className="text-muted-foreground">
                    Nombre, dirección de correo electrónico, número de teléfono, fecha de nacimiento,
                    género y fotografía de perfil.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Información de Redes Sociales</h4>
                  <p className="text-muted-foreground">
                    Cuando inicias sesión con Google o Facebook, recopilamos tu nombre, email, 
                    foto de perfil y ID de usuario público de estas plataformas. No accedemos 
                    a tu lista de amigos ni publicamos en tu nombre.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Información de Verificación</h4>
                  <p className="text-muted-foreground">
                    Documento de identidad, licencia de conducir, información del vehículo y documentos
                    de seguros para conductores verificados.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Información de Viajes</h4>
                  <p className="text-muted-foreground">
                    Ubicaciones de origen y destino, rutas, horarios, calificaciones y comentarios.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Información de Comunicaciones</h4>
                  <p className="text-muted-foreground">
                    Mensajes de chat entre conductores y pasajeros a través de nuestro sistema 
                    de mensajería integrado, incluyendo metadatos como fechas y horas.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Cómo Usamos tu Información */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">2. Cómo Usamos tu Información</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Facilitar la conexión entre conductores y pasajeros</li>
                  <li>• Verificar la identidad de los usuarios para mayor seguridad</li>
                  <li>• Procesar pagos y transacciones</li>
                  <li>• Proporcionar atención al cliente</li>
                  <li>• Mejorar nuestros servicios y funcionalidades</li>
                  <li>• Enviar notificaciones importantes sobre tu cuenta</li>
                  <li>• Cumplir con obligaciones legales y regulatorias</li>
                </ul>
              </CardContent>
            </Card>

            {/* Compartir Información */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">3. Compartir tu Información</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Con Otros Usuarios</h4>
                  <p className="text-muted-foreground">
                    Compartimos información básica del perfil (nombre, foto, calificaciones) con otros
                    usuarios para facilitar los viajes compartidos.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Proveedores de Servicios</h4>
                  <p className="text-muted-foreground">
                    Trabajamos con terceros de confianza para procesar pagos, verificar identidades
                    y proporcionar servicios de mapas.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Cumplimiento Legal</h4>
                  <p className="text-muted-foreground">
                    Podemos divulgar información cuando sea requerido por ley o para proteger los
                    derechos y seguridad de nuestros usuarios.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Seguridad */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">4. Seguridad de tu Información</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Implementamos medidas de seguridad técnicas y organizativas apropiadas para proteger
                  tu información personal contra acceso no autorizado, alteración, divulgación o destrucción.
                  Esto incluye encriptación de datos, acceso restringido y monitoreo continuo de nuestros sistemas.
                </p>
              </CardContent>
            </Card>

            {/* Tus Derechos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">5. Tus Derechos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-muted-foreground">
                  <li>• <strong>Acceso:</strong> Solicitar una copia de tu información personal</li>
                  <li>• <strong>Rectificación:</strong> Corregir información inexacta o incompleta</li>
                  <li>• <strong>Eliminación:</strong> Solicitar la eliminación de tu cuenta y datos</li>
                  <li>• <strong>Portabilidad:</strong> Recibir tus datos en formato estructurado</li>
                  <li>• <strong>Oposición:</strong> Oponerte al procesamiento de tus datos</li>
                </ul>
                <p className="text-muted-foreground">
                  Para ejercer cualquiera de estos derechos, puedes visitarnos en{' '}
                  <Link href="/eliminacion-de-datos" className="text-primary hover:underline">
                    Eliminación de Datos
                  </Link>
                  {' '}o contactarnos directamente.
                </p>
              </CardContent>
            </Card>

            {/* Retención de Datos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">6. Retención de Datos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Conservamos tu información personal mientras tu cuenta esté activa o según sea necesario
                  para brindarte servicios. También podemos conservar cierta información durante períodos
                  adicionales cuando sea requerido por ley o para proteger nuestros intereses legítimos.
                </p>
              </CardContent>
            </Card>

            {/* Cookies */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">7. Cookies y Tecnologías Similares</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  Utilizamos cookies y tecnologías similares para mejorar tu experiencia, recordar tus
                  preferencias y analizar el uso de nuestra plataforma.
                </p>
                <div>
                  <h4 className="font-semibold mb-2">Cookies de Terceros</h4>
                  <p className="text-muted-foreground">
                    Cuando usas el inicio de sesión social, se pueden establecer cookies de Google 
                    y Facebook para mantener tu sesión autenticada. También utilizamos cookies de 
                    Google Maps para los servicios de mapas y geolocalización.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Tokens de Sesión</h4>
                  <p className="text-muted-foreground">
                    Utilizamos tokens JWT (JSON Web Tokens) para mantener tu sesión activa y 
                    comunicarnos con servicios externos como el sistema de chat integrado.
                  </p>
                </div>
                <p className="text-muted-foreground">
                  Puedes controlar las cookies a través de la configuración de tu navegador.
                </p>
              </CardContent>
            </Card>

            {/* Menores */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">8. Menores de Edad</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Nuestros servicios están dirigidos a personas mayores de 18 años. No recopilamos
                  intencionalmente información personal de menores de edad sin el consentimiento
                  verificable de los padres.
                </p>
              </CardContent>
            </Card>

            {/* Cambios */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">9. Cambios a esta Política</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Podemos actualizar esta Política de Privacidad ocasionalmente. Te notificaremos sobre
                  cambios significativos publicando la nueva política en nuestra plataforma y, cuando
                  corresponda, enviándote una notificación por correo electrónico.
                </p>
              </CardContent>
            </Card>

            {/* Contacto */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">10. Contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Si tienes preguntas sobre esta Política de Privacidad o sobre el manejo de tu
                  información personal, puedes contactarnos:
                </p>
                <div className="space-y-2 text-muted-foreground">
                  <p><strong>Email:</strong> info@tengolugar.store</p>
                  <p><strong>Dirección:</strong> Argentina</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  También puedes actualizar tu información personal en cualquier momento desde la
                  sección <Link href="/perfil" className="text-primary hover:underline">Perfil</Link> de
                  tu cuenta.
                </p>
              </CardContent>
            </Card>

          </div>

          <Separator className="my-8" />

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Esta Política de Privacidad forma parte de nuestros{' '}
              <Link href="/terminos-y-condiciones" className="text-primary hover:underline">
                Términos y Condiciones
              </Link>
            </p>
          </div>

        </div>
      </div>
    </>
  )
}
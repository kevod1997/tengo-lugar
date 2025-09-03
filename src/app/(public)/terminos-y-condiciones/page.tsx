import Header from "@/components/header/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

export default function TerminosCondicionesPage() {
  return (
    <>
      <Header
        breadcrumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Términos y Condiciones' },
        ]}
        showBackButton={true}
      />

      <div className="page-content max-w-4xl mx-auto">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-foreground">
              Términos y Condiciones
            </h1>
            <p className="text-muted-foreground">
              Última actualización: {new Date().toLocaleDateString('es-AR')}
            </p>
          </div>

          {/* Introducción */}
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground leading-relaxed">
                Bienvenido a <strong>Tengo Lugar</strong>. Estos Términos y Condiciones rigen el uso 
                de nuestra plataforma de viajes compartidos. Al acceder o utilizar nuestros servicios, 
                aceptas cumplir con estos términos. Si no estás de acuerdo, por favor no uses nuestra plataforma.
              </p>
            </CardContent>
          </Card>

          {/* Información de la Empresa */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Información de la Empresa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Razón Social</h4>
                <p className="text-muted-foreground">O M EXPRESS SRL</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">CUIT</h4>
                <p className="text-muted-foreground">30-69623064-8</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Domicilio Legal</h4>
                <p className="text-muted-foreground">
                  Corrientes Av 1312, 9, Capital Federal (1043), Capital Federal, Argentina
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Secciones */}
          <div className="space-y-6">

            {/* Definiciones */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">1. Definiciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">&quot;Plataforma&quot;</h4>
                  <p className="text-muted-foreground">
                    Se refiere al sitio web, aplicación móvil y todos los servicios relacionados de Tengo Lugar.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">&quot;Usuario&quot;</h4>
                  <p className="text-muted-foreground">
                    Cualquier persona que utilice la plataforma, ya sea como conductor o pasajero.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">&quot;Viaje&quot;</h4>
                  <p className="text-muted-foreground">
                    El servicio de transporte compartido coordinado a través de nuestra plataforma.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Uso de la Plataforma */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">2. Uso de la Plataforma</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Elegibilidad</h4>
                  <p className="text-muted-foreground">
                    Debes tener al menos 18 años para usar nuestros servicios. Al registrarte, 
                    confirmas que cumples con este requisito de edad.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Registro y Cuenta</h4>
                  <p className="text-muted-foreground">
                    Debes proporcionar información precisa y mantenerla actualizada. Eres responsable 
                    de mantener la confidencialidad de tu cuenta y contraseña.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Verificación</h4>
                  <p className="text-muted-foreground">
                    Los conductores deben completar un proceso de verificación que incluye documentos 
                    de identidad, licencia de conducir válida y documentos del vehículo.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Responsabilidades del Conductor */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">3. Responsabilidades del Conductor</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Poseer licencia de conducir válida y vigente</li>
                  <li>• Mantener el vehículo en condiciones seguras y legales</li>
                  <li>• Contar con seguro vehicular vigente</li>
                  <li>• Cumplir con todas las leyes de tránsito</li>
                  <li>• Tratar a los pasajeros con respeto y cortesía</li>
                  <li>• Mantener actualizada la información del vehículo</li>
                  <li>• No discriminar por motivos de raza, género, religión u orientación sexual</li>
                </ul>
              </CardContent>
            </Card>

            {/* Responsabilidades del Pasajero */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">4. Responsabilidades del Pasajero</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Llegar puntualmente al punto de encuentro acordado</li>
                  <li>• Tratar al conductor y otros pasajeros con respeto</li>
                  <li>• No consumir alcohol ni sustancias ilegales durante el viaje</li>
                  <li>• No fumar en el vehículo sin autorización del conductor</li>
                  <li>• Respetar las reglas establecidas por el conductor</li>
                  <li>• Notificar cancelaciones con tiempo suficiente</li>
                  <li>• Pagar la tarifa acordada</li>
                </ul>
              </CardContent>
            </Card>

            {/* Reservas y Cancelaciones */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">5. Reservas y Cancelaciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Proceso de Reserva</h4>
                  <p className="text-muted-foreground">
                    Las reservas están sujetas a confirmación del conductor. El conductor puede 
                    aprobar o rechazar una solicitud de reserva.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Cancelaciones</h4>
                  <p className="text-muted-foreground">
                    Las cancelaciones deben realizarse con al menos 2 horas de anticipación. 
                    Cancelaciones tardías o no presentarse pueden afectar tu calificación.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Pagos y Tarifas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">6. Pagos y Tarifas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Método de Pago</h4>
                  <p className="text-muted-foreground">
                    Los pagos se realizan directamente entre conductor y pasajero. La plataforma 
                    no procesa pagos ni cobra comisiones.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Tarifas</h4>
                  <p className="text-muted-foreground">
                    Las tarifas son establecidas por el conductor y deben ser transparentes y 
                    acordadas antes del viaje.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Conducta Prohibida */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">7. Conducta Prohibida</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Usar la plataforma para actividades ilegales</li>
                  <li>• Acosar, amenazar o discriminar a otros usuarios</li>
                  <li>• Proporcionar información falsa o engañosa</li>
                  <li>• Usar múltiples cuentas para el mismo usuario</li>
                  <li>• Intentar hackear o comprometer la seguridad de la plataforma</li>
                  <li>• Publicar contenido ofensivo o inapropiado</li>
                  <li>• Usar la plataforma para fines comerciales no autorizados</li>
                </ul>
              </CardContent>
            </Card>

            {/* Sistema de Calificaciones */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">8. Sistema de Calificaciones y Reseñas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Calificaciones</h4>
                  <p className="text-muted-foreground">
                    Los usuarios pueden calificar y reseñar sus experiencias. Las calificaciones 
                    deben ser honestas y basadas en la experiencia real del viaje.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Consecuencias</h4>
                  <p className="text-muted-foreground">
                    Calificaciones consistentemente bajas pueden resultar en la suspensión 
                    o terminación de la cuenta.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Servicios de Terceros */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">9. Servicios de Terceros</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Integración con Terceros</h4>
                  <p className="text-muted-foreground">
                    Utilizamos servicios de terceros incluyendo Google Maps para geolocalización, 
                    sistemas de chat integrados, y servicios de autenticación social (Google, Facebook).
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Responsabilidad</h4>
                  <p className="text-muted-foreground">
                    No somos responsables por el contenido, políticas o prácticas de servicios 
                    de terceros. Su uso está sujeto a sus propios términos y condiciones.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Limitación de Responsabilidad */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">10. Limitación de Responsabilidad</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Tengo Lugar actúa como intermediario entre conductores y pasajeros. No somos responsables 
                  por los daños, lesiones o pérdidas que puedan ocurrir durante los viajes. Los usuarios 
                  participan bajo su propio riesgo y deben contar con seguros adecuados.
                </p>
              </CardContent>
            </Card>

            {/* Modificaciones */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">11. Modificaciones a los Términos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Nos reservamos el derecho de modificar estos términos en cualquier momento. 
                  Los cambios significativos serán notificados a través de la plataforma y por 
                  correo electrónico. El uso continuado después de los cambios constituye 
                  aceptación de los nuevos términos.
                </p>
              </CardContent>
            </Card>

            {/* Terminación */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">12. Terminación de la Cuenta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Por el Usuario</h4>
                  <p className="text-muted-foreground">
                    Puedes eliminar tu cuenta en cualquier momento visitando la página de{' '}
                    <Link href="/eliminacion-de-datos" className="text-primary hover:underline">
                      Eliminación de Datos
                    </Link>.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Por la Plataforma</h4>
                  <p className="text-muted-foreground">
                    Podemos suspender o terminar cuentas por violación de estos términos, 
                    comportamiento inapropiado o por razones de seguridad.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Ley Aplicable */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">13. Ley Aplicable y Jurisdicción</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Estos términos se rigen por las leyes de la República Argentina. Cualquier 
                  disputa será resuelta en los tribunales competentes de Argentina.
                </p>
              </CardContent>
            </Card>

            {/* Contacto */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">14. Contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Si tienes preguntas sobre estos Términos y Condiciones, puedes contactarnos:
                </p>
                <div className="space-y-2 text-muted-foreground">
                  <p><strong>Email:</strong> info@tengolugar.store</p>
                  <p><strong>Dirección:</strong> Argentina</p>
                </div>
              </CardContent>
            </Card>

          </div>

          <Separator className="my-8" />

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Estos Términos y Condiciones complementan nuestra{' '}
              <Link href="/politica-de-privacidad" className="text-primary hover:underline">
                Política de Privacidad
              </Link>
            </p>
          </div>

        </div>
      </div>
    </>
  )
}
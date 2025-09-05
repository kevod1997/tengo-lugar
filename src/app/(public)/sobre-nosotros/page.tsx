import Header from "@/components/header/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Shield, Users, Zap, Heart, MapPin, Phone, Mail } from "lucide-react"
import Link from "next/link"

export default function SobreNosotrosPage() {
  return (
    <>
      <Header
        breadcrumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Sobre Nosotros' },
        ]}
        showBackButton={true}
      />

      <div className="page-content max-w-4xl mx-auto">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-foreground">
              Sobre Nosotros
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Conocé la historia detrás de Tengo Lugar y nuestro compromiso con el transporte compartido en Argentina
            </p>
          </div>

          {/* Nuestra Historia */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                Nuestra Historia
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                <strong>Tengo Lugar</strong> nació con la visión de revolucionar la forma en que las personas 
                se trasladan por Argentina. Creemos que compartir viajes no solo reduce costos, sino que también 
                construye comunidad y cuida el medio ambiente.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Como plataforma de transporte compartido, conectamos conductores con asientos disponibles 
                con pasajeros que buscan una alternativa económica, segura y confiable para sus viajes.
              </p>
            </CardContent>
          </Card>

          {/* Nuestra Misión */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Nuestra Misión
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Hacer que el transporte compartido sea accesible, seguro y conveniente para todos los argentinos. 
                Nuestro objetivo es reducir los costos de transporte mientras creamos conexiones genuinas entre las personas.
              </p>
            </CardContent>
          </Card>

          {/* Nuestros Valores */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Nuestros Valores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Seguridad Primero</h4>
                  <p className="text-sm text-muted-foreground">
                    Verificamos a todos nuestros conductores y mantenemos los más altos estándares de seguridad.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Transparencia Total</h4>
                  <p className="text-sm text-muted-foreground">
                    Precios claros, políticas transparentes y comunicación honesta en todo momento.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Comunidad Unida</h4>
                  <p className="text-sm text-muted-foreground">
                    Fomentamos conexiones reales entre las personas y construimos comunidad.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Innovación Constante</h4>
                  <p className="text-sm text-muted-foreground">
                    Mejoramos continuamente nuestra plataforma para ofrecer la mejor experiencia.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información de la Empresa */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Información Legal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/30 p-4 rounded-lg space-y-3">
                <div>
                  <h4 className="font-semibold mb-1 text-foreground">Marca Comercial</h4>
                  <p className="text-muted-foreground">Tengo Lugar</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1 text-foreground">Razón Social</h4>
                  <p className="text-muted-foreground">O M EXPRESS S.R.L.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1 text-foreground">CUIT</h4>
                  <p className="text-muted-foreground">30-69623064-8</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1 text-foreground">Domicilio Legal</h4>
                  <p className="text-muted-foreground">
                    Corrientes Av 1312, 9, Capital Federal (1043), Capital Federal, Argentina
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                <strong>Tengo Lugar</strong> es la marca comercial bajo la cual O M EXPRESS S.R.L. 
                opera la plataforma de transporte compartido, brindando servicios de intermediación 
                entre conductores y pasajeros en toda Argentina.
              </p>
            </CardContent>
          </Card>

          {/* Contacto */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Contactanos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    ¿Tenés preguntas, sugerencias o necesitás ayuda? Estamos aquí para ayudarte.
                  </p>
                  
                  <div className="space-y-3">
                    <Link 
                      href="mailto:info@tengolugar.store"
                      className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Mail className="w-5 h-5" />
                      <span>info@tengolugar.store</span>
                    </Link>
                    <Link 
                      href="tel:2284380031"
                      className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Phone className="w-5 h-5" />
                      <span>2284-380031</span>
                    </Link>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <MapPin className="w-5 h-5" />
                      <span>Argentina</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">Horarios de Atención</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Lunes a Viernes: 9:00 - 18:00</p>
                    <p>Sábados: 9:00 - 13:00</p>
                    <p>Domingos: Cerrado</p>
                  </div>
                  
                  <div className="pt-4">
                    <p className="text-sm text-muted-foreground">
                      Para soporte urgente durante viajes, utilizá el sistema de chat integrado en la plataforma.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator className="my-8" />

          {/* Footer Links */}
          <div className="text-center text-sm text-muted-foreground space-y-2">
            <p>
              Conocé más sobre nuestras políticas en{' '}
              <Link href="/terminos-y-condiciones" className="text-primary hover:underline">
                Términos y Condiciones
              </Link>
              {' '}y{' '}
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
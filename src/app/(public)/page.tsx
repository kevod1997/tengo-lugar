import Header from "@/components/header/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getGoogleMapsConfig } from '@/services/env/env-service'
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import TechnicalProblemsPage from '@/components/TechnicalProblems'
import TripSearchForm from "./buscar-viaje/components/TripSearchForm"
import { ArrowRight, Sparkles, Users, Shield, Zap } from "lucide-react"
import Link from "next/link"

export default async function HomePage() {
  const [googleMaps, session] = await Promise.all([
    getGoogleMapsConfig(),
    auth.api.getSession({ headers: await headers() })
  ]);

  if (!googleMaps.available) {
    return <TechnicalProblemsPage reason="search_unavailable" />
  }
  
  return (
    <>
      <Header breadcrumbs={[{ label: 'Inicio', href: '/' }]} showBackButton={false} />
      
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4">
          
          {/* Hero Section */}
          <section className="pt-16 pb-12 text-center space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/50 rounded-full text-sm text-primary font-medium">
                <Sparkles className="w-4 h-4" />
                Bienvenido al futuro del transporte compartido
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
                Viajá mejor,
                <br />
                <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  gastá menos
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                La plataforma que conecta conductores y pasajeros para viajes más inteligentes, 
                seguros y económicos por toda Argentina.
              </p>
            </div>

            {/* Search Form - Hero CTA */}
            <div className="max-w-md md:max-w-full mx-auto">
              <Card className="border-border shadow-2xl shadow-primary/10 bg-card">
                <CardContent className="p-6 md:p-8">
                  <div className="text-center mb-6">
                    <h2 className="text-lg font-semibold text-card-foreground mb-2">
                      ¿A dónde vas?
                    </h2>
                  </div>
                  
                  <TripSearchForm
                    apiKey={googleMaps.apiKey!}
                    initialValues={{}}
                    redirectToSearch={true}
                  />
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Social Proof */}
          <section className="py-12 border-t border-border">
            <div className="text-center space-y-8">
              <p className="text-sm text-muted-foreground font-medium tracking-wide uppercase">
                Construyendo el futuro del transporte
              </p>
              
              <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">100%</div>
                  <div className="text-sm text-muted-foreground">Seguro</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">24/7</div>
                  <div className="text-sm text-muted-foreground">Soporte</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">-60%</div>
                  <div className="text-sm text-muted-foreground">Ahorro</div>
                </div>
              </div>
            </div>
          </section>

          {/* Value Propositions */}
          <section className="py-20">
            <div className="grid gap-12 max-w-4xl mx-auto">
              
              {/* For Passengers */}
              <div className="text-center space-y-8">
                <div className="space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary/70 rounded-2xl">
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">
                    Para pasajeros
                  </h3>
                  <p className="text-lg text-muted-foreground max-w-md mx-auto">
                    Viajá cómodo, seguro y por menos de la mitad del precio. 
                    Conectate con conductores verificados en tu zona.
                  </p>
                </div>
                
                {!session && (
                  <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Link href="/crear-cuenta" className="inline-flex items-center gap-2">
                      Empezar a viajar
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                )}
              </div>

              {/* Separator */}
              <div className="w-px h-16 bg-border mx-auto"></div>

              {/* For Drivers */}
              <div className="text-center space-y-8">
                <div className="space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/70 rounded-2xl">
                    <Zap className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">
                    Para conductores
                  </h3>
                  <p className="text-lg text-muted-foreground max-w-md mx-auto">
                    Convertí tus viajes en ingresos. Cubrí gastos de combustible 
                    y ganá dinero extra compartiendo tu auto.
                  </p>
                </div>
                
                <Button asChild size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/5">
                  <Link href={session ? "/perfil?setup=driver" : "/crear-cuenta"} className="inline-flex items-center gap-2">
                    Empezar a conducir
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>

          {/* Features Grid */}
          <section className="py-20 bg-muted/30 -mx-4 px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center space-y-4 mb-16">
                <h2 className="text-3xl font-bold text-foreground">
                  ¿Por qué elegirnos?
                </h2>
                <p className="text-lg text-muted-foreground">
                  La plataforma más segura y confiable para viajar compartiendo
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-card rounded-xl shadow-sm border border-border">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Totalmente seguro
                  </h3>
                  <p className="text-muted-foreground">
                    Conductores verificados, seguros incluidos y soporte 24/7
                  </p>
                </div>

                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-card rounded-xl shadow-sm border border-border">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Super fácil
                  </h3>
                  <p className="text-muted-foreground">
                    Reservá en segundos y viajá sin complicaciones
                  </p>
                </div>

                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-card rounded-xl shadow-sm border border-border">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Ahorro real
                  </h3>
                  <p className="text-muted-foreground">
                    Hasta 60% menos que otros medios de transporte
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="py-20">
            <div className="text-center space-y-8 max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold text-foreground">
                Listo para empezar?
              </h2>
              <p className="text-lg text-muted-foreground">
                Unite a la revolución del transporte compartido en Argentina
              </p>
              
              {!session ? (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Link href="/crear-cuenta">
                      Crear cuenta gratis
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="border-border hover:bg-accent">
                    <Link href="/login">
                      Ya tengo cuenta
                    </Link>
                  </Button>
                </div>
              ) : (
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Link href="/buscar-viaje">
                    Buscar viajes
                  </Link>
                </Button>
              )}
            </div>
          </section>

        </div>
      </main>
    </>
  )
}
// app/not-found.tsx
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="md:min-h-screen flex flex-col max-sm:mt-20">
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="relative h-20 w-20 rounded-full overflow-hidden">
                <Image
                  src="/imgs/logo.png"
                  alt="Tengo Lugar Logo"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
            
            <div>
              <h1 className="text-6xl font-bold text-primary/80">404</h1>
              <h2 className="text-2xl font-semibold text-foreground mt-2">
                Página no encontrada
              </h2>
            </div>
          </CardHeader>

          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              Lo sentimos, la página que estás buscando no existe o ha sido movida.
            </p>
            
            <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
              <Search className="h-4 w-4 inline mr-2" />
              ¿Intentabas buscar un viaje? Prueba desde la página principal.
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            {/* ✅ Solo navegación con Links - Sin JavaScript */}
            <div className="flex gap-2 w-full">
              <Button asChild className="flex-1">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Ir al inicio
                </Link>
              </Button>
              
              <Button variant="outline" asChild className="flex-1">
                <Link href="/buscar-viaje">
                  <Search className="mr-2 h-4 w-4" />
                  Buscar viajes
                </Link>
              </Button>
            </div>

          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
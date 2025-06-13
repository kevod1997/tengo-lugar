// components/footer/footer.tsx
import Link from "next/link"
import { Facebook, Instagram, Mail, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-muted/30 border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground">
              Tengo Lugar
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              La plataforma que conecta conductores y pasajeros para viajes más inteligentes y económicos.
            </p>
            
            {/* Social Media */}
            <div className="flex gap-3">
              <Link 
                href="https://facebook.com/tengolugar" 
                className="flex items-center justify-center w-9 h-9 bg-card border border-border rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </Link>
              <Link 
                href="https://instagram.com/tengolugar" 
                className="flex items-center justify-center w-9 h-9 bg-card border border-border rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* About Us */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">
              Acerca de nosotros
            </h4>
            <nav className="space-y-3">
              <Link 
                href="/sobre-nosotros" 
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Sobre nosotros
              </Link>
              <Link 
                href="/centro-de-ayuda" 
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Centro de ayuda
              </Link>
              <Link 
                href="/blog" 
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Blog de viaje
              </Link>
            </nav>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">
              Legal
            </h4>
            <nav className="space-y-3">
              <Link 
                href="/terminos-y-condiciones" 
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Términos y condiciones
              </Link>
              <Link 
                href="/politica-de-privacidad" 
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Política de privacidad
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">
              Contacto
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>info.tengo@gmail.com</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>Argentina</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Tengo Lugar. Todos los derechos reservados.
          </p>
          <p className="text-xs text-muted-foreground">
            Hecho con ❤️ en Argentina
          </p>
        </div>
      </div>
    </footer>
  )
}
import { Link } from 'react-router-dom'
import { Instagram, Phone, MapPin, Mail } from 'lucide-react'
import { LOGO_URL } from '@/lib/constants'

export function Footer() {
  return (
    <footer className="bg-accent/30 pt-16 pb-8 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="mb-4">
              <img
                src={LOGO_URL}
                alt="Viveiro Floresta Logo"
                className="h-12 w-auto"
              />
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Transformando espaços em refúgios naturais. Projetos paisagísticos
              personalizados para o seu bem-estar.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-foreground">Navegação</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/" className="hover:text-primary">
                  Início
                </Link>
              </li>
              <li>
                <Link to="/planos" className="hover:text-primary">
                  Planos e Preços
                </Link>
              </li>
              <li>
                <Link to="/projetos" className="hover:text-primary">
                  Projetos Reais
                </Link>
              </li>
              <li>
                <Link to="/area-cliente" className="hover:text-primary">
                  Área do Cliente
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-foreground">Contato</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-0.5 shrink-0" />
                <span>(64) 98453-6263</span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-0.5 shrink-0" />
                <span>viveirofloresta@hotmail.com</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>
                  Rua Amapá, 539, Centro
                  <br />
                  CEP: 75600-000
                  <br />
                  Goiatuba, GO
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-foreground">Redes Sociais</h4>
            <div className="flex gap-4">
              <a
                href="https://instagram.com/viveirofloresta"
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-white rounded-full shadow-sm hover:shadow-md hover:text-pink-600 transition-all"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Siga @viveirofloresta
            </p>
          </div>
        </div>

        <div className="border-t border-border pt-8 text-center text-xs text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} Floresta Paisagismo. Todos os
            direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}

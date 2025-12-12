import { Link } from 'react-router-dom'
import { Trees, Instagram, Facebook, Phone } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-accent/30 pt-16 pb-8 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Trees className="h-6 w-6 text-primary" />
              <span className="font-heading font-bold text-lg text-foreground">
                FLORESTA
              </span>
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
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" /> (11) 99999-9999
              </li>
              <li>contato@florestapaisagismo.com</li>
              <li>São Paulo, SP</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-foreground">Redes Sociais</h4>
            <div className="flex gap-4">
              <a
                href="#"
                className="p-2 bg-white rounded-full shadow-sm hover:shadow-md hover:text-primary transition-all"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-white rounded-full shadow-sm hover:shadow-md hover:text-primary transition-all"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
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

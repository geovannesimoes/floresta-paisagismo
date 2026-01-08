import { Link, useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { useScroll } from '@/hooks/use-scroll'
import { LOGO_URL } from '@/lib/constants'
import { useSiteSettings } from '@/hooks/use-site-settings'

export function Header() {
  const scrolled = useScroll(50)
  const location = useLocation()
  const isHome = location.pathname === '/'
  const { settings } = useSiteSettings()

  const navLinks = [
    { name: 'Início', path: '/' },
    { name: 'Planos', path: '/planos' },
    { name: 'Projetos', path: '/projetos' },
    { name: 'Área do Cliente', path: '/area-cliente' },
  ]

  const logoUrl = settings?.logo_url || LOGO_URL

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled || !isHome
          ? 'glass-header py-2 shadow-md bg-white/95 backdrop-blur-md'
          : 'bg-transparent py-4',
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <img
            src={logoUrl}
            alt="Viveiro Floresta Logo"
            className={cn(
              'h-12 w-auto transition-all duration-300',
              !scrolled && isHome && !settings?.logo_url
                ? 'brightness-0 invert'
                : '',
            )}
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path
            return (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  'text-sm font-medium transition-all px-4 py-2 rounded-full',
                  isActive
                    ? scrolled || !isHome
                      ? 'bg-primary/10 text-primary font-bold'
                      : 'bg-white text-primary font-bold shadow-md'
                    : scrolled || !isHome
                      ? 'text-foreground hover:bg-muted'
                      : 'text-white hover:bg-white/20',
                )}
              >
                {link.name}
              </Link>
            )
          })}
          <div className="ml-4">
            <Button
              asChild
              className="bg-primary hover:bg-forest text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 rounded-full"
            >
              <Link to="/planos">Escolher meu plano</Link>
            </Button>
          </div>
        </nav>

        {/* Mobile Nav */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu
                className={cn(
                  scrolled || !isHome ? 'text-foreground' : 'text-white',
                )}
              />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[80%] sm:w-[385px]">
            <nav className="flex flex-col gap-6 mt-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    'text-lg font-medium transition-colors border-b pb-2',
                    location.pathname === link.path
                      ? 'text-primary border-primary font-bold'
                      : 'text-foreground hover:text-primary',
                  )}
                >
                  {link.name}
                </Link>
              ))}
              <Button asChild className="w-full mt-4 bg-primary text-white">
                <Link to="/planos">Escolher meu plano</Link>
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}

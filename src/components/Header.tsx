import { Link, useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { useScroll } from '@/hooks/use-scroll'
import { LOGO_URL } from '@/lib/constants'

export function Header() {
  const scrolled = useScroll(50)
  const location = useLocation()
  const isHome = location.pathname === '/'

  const navLinks = [
    { name: 'Início', path: '/' },
    { name: 'Planos', path: '/planos' },
    { name: 'Projetos', path: '/projetos' },
    { name: 'Área do Cliente', path: '/area-cliente' },
  ]

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
            src={LOGO_URL}
            alt="Viveiro Floresta Logo"
            className={cn(
              'h-12 w-auto transition-all duration-300',
              !scrolled && isHome ? 'brightness-0 invert' : '',
            )}
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary relative group',
                scrolled || !isHome
                  ? 'text-foreground'
                  : 'text-white hover:text-white/80',
                location.pathname === link.path && 'font-bold text-primary',
              )}
            >
              {link.name}
              <span
                className={cn(
                  'absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full',
                  location.pathname === link.path && 'w-full',
                )}
              ></span>
            </Link>
          ))}
          <Button
            asChild
            className="bg-primary hover:bg-forest text-white shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            <Link to="/planos">Escolher meu plano</Link>
          </Button>
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
                  className="text-lg font-medium text-foreground hover:text-primary transition-colors border-b pb-2"
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

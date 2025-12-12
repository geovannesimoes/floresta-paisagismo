import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, Trees } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const isHome = location.pathname === '/'

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
        scrolled || !isHome ? 'glass-header py-2' : 'bg-transparent py-4',
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <Trees
            className={cn(
              'h-8 w-8 transition-colors duration-300',
              scrolled || !isHome ? 'text-primary' : 'text-white',
            )}
          />
          <div className="flex flex-col">
            <span
              className={cn(
                'font-heading font-bold text-lg leading-tight transition-colors duration-300',
                scrolled || !isHome ? 'text-foreground' : 'text-white',
              )}
            >
              FLORESTA
            </span>
            <span
              className={cn(
                'text-xs tracking-wider transition-colors duration-300',
                scrolled || !isHome ? 'text-muted-foreground' : 'text-white/80',
              )}
            >
              PAISAGISMO
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                scrolled || !isHome
                  ? 'text-foreground'
                  : 'text-white hover:text-white/80',
              )}
            >
              {link.name}
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
                  className="text-lg font-medium text-foreground hover:text-primary transition-colors"
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

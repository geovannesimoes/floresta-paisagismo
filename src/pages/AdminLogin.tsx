import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trees, Lock, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    // If already logged in, redirect to admin
    if (localStorage.getItem('floresta_admin_auth') === 'true') {
      navigate('/admin')
    }
  }, [navigate])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API delay for demo authentication
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (username === 'ADMIN' && password === 'admin123') {
      localStorage.setItem('floresta_admin_auth', 'true')
      toast({
        title: 'Acesso concedido',
        description: 'Bem-vindo de volta ao painel administrativo.',
      })
      navigate('/admin')
    } else {
      toast({
        title: 'Acesso negado',
        description: 'Usuário ou senha incorretos.',
        variant: 'destructive',
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2 text-primary">
            <Trees className="h-10 w-10" />
            <span className="font-heading font-bold text-2xl text-foreground">
              Floresta Admin
            </span>
          </div>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Login Administrativo
            </CardTitle>
            <CardDescription className="text-center">
              Entre com suas credenciais para gerenciar o sistema
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Usuário</Label>
                <Input
                  id="username"
                  placeholder="Ex: ADMIN"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  autoComplete="username"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-9"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Autenticando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          <p>
            Demo: Usuário <strong>ADMIN</strong> / Senha{' '}
            <strong>admin123</strong>
          </p>
        </div>
      </div>
    </div>
  )
}

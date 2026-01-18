import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { authService } from '@/services/authService'

const formSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
})

export function LoginForm() {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { toast } = useToast()
  const { signIn } = useAuth()
  const [resetSent, setResetSent] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true)
    const { error } = await signIn(values.email, values.password)
    setLoading(false)

    if (error) {
      toast({
        title: 'Erro ao entrar',
        description: 'Verifique suas credenciais.',
        variant: 'destructive',
      })
    } else {
      toast({ title: 'Bem-vindo de volta!' })
    }
  }

  const handleForgotPassword = async () => {
    const email = form.getValues('email')
    if (!email) {
      toast({ title: 'Digite seu e-mail primeiro', variant: 'destructive' })
      return
    }

    setLoading(true)
    const { error } = await authService.resetPassword(email)
    setLoading(false)

    if (error) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      setResetSent(true)
      toast({
        title: 'E-mail enviado',
        description: 'Verifique sua caixa de entrada.',
      })
    }
  }

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input placeholder="seu@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between items-center">
                  <FormLabel>Senha</FormLabel>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs text-primary hover:underline"
                    disabled={loading || resetSent}
                  >
                    {resetSent ? 'Enviado!' : 'Esqueceu a senha?'}
                  </button>
                </div>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      aria-label={
                        showPassword ? 'Ocultar senha' : 'Mostrar senha'
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              'Entrar'
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}

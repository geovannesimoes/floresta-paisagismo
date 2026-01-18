import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
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
import { authService } from '@/services/authService'
import { formatCpfCnpj, formatPhone } from '@/lib/utils'

const formSchema = z.object({
  full_name: z.string().min(3, 'Nome muito curto'),
  email: z.string().email('E-mail inválido'),
  cpf: z.string().refine((val) => {
    const digits = val.replace(/\D/g, '')
    return digits.length === 11
  }, 'CPF inválido'),
  whatsapp: z.string().refine((val) => {
    const digits = val.replace(/\D/g, '')
    return digits.length >= 10
  }, 'Número inválido'),
})

interface RegisterFormProps {
  onSuccess: () => void
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: '',
      email: '',
      cpf: '',
      whatsapp: '',
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true)
    try {
      const { error } = await authService.registerClient({
        full_name: values.full_name,
        email: values.email,
        cpf: values.cpf.replace(/\D/g, ''),
        whatsapp: values.whatsapp.replace(/\D/g, ''),
      })

      if (error) {
        // Handle Edge Function Custom Errors (409 Conflict)
        if (error.message) {
          throw new Error(error.message)
        }
        throw new Error('Erro ao criar conta. Tente novamente mais tarde.')
      }

      // Success Feedback - Privacy Focused (No temp password in UI)
      toast({
        title: 'Sucesso!',
        description:
          'Conta criada com sucesso. Enviamos uma senha temporária para o seu e-mail.',
        duration: 6000,
      })

      onSuccess()
    } catch (e: any) {
      toast({
        title: 'Atenção',
        description: e.message,
        variant: 'destructive',
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Completo</FormLabel>
              <FormControl>
                <Input placeholder="Seu nome" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="cpf"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CPF</FormLabel>
                <FormControl>
                  <Input
                    placeholder="000.000.000-00"
                    {...field}
                    onChange={(e) =>
                      field.onChange(formatCpfCnpj(e.target.value))
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="whatsapp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>WhatsApp</FormLabel>
                <FormControl>
                  <Input
                    placeholder="(00) 00000-0000"
                    {...field}
                    onChange={(e) =>
                      field.onChange(formatPhone(e.target.value))
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            'Criar Conta'
          )}
        </Button>
      </form>
    </Form>
  )
}

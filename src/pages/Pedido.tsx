import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Check, Loader2, ArrowLeft, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { ordersService } from '@/services/ordersService'
import { plansService, Plan } from '@/services/plansService'
import { formatCpfCnpj, formatPhone } from '@/lib/utils'

const formSchema = z.object({
  client_name: z.string().min(3, 'Nome muito curto'),
  client_email: z.string().email('E-mail inválido'),
  client_cpf_cnpj: z.string().refine((val) => {
    const digits = val.replace(/\D/g, '')
    return digits.length === 11 || digits.length === 14
  }, 'CPF/CNPJ inválido'),
  client_whatsapp: z.string().refine((val) => {
    const digits = val.replace(/\D/g, '')
    return digits.length >= 10
  }, 'Número inválido'),
  property_type: z.string().min(1, 'Selecione o tipo de imóvel'),
  dimensions: z.string().optional(),
  preferences: z.string().optional(),
  notes: z.string().optional(),
})

export default function Pedido() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [plan, setPlan] = useState<Plan | null>(null)

  const planSlug = searchParams.get('plan')

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client_name: '',
      client_email: '',
      client_cpf_cnpj: '',
      client_whatsapp: '',
      property_type: '',
      dimensions: '',
      preferences: '',
      notes: '',
    },
  })

  useEffect(() => {
    const loadPlan = async () => {
      if (!planSlug) {
        navigate('/planos')
        return
      }

      try {
        const { data, error } = await plansService.getPlanBySlug(planSlug)
        if (error || !data) {
          toast({
            title: 'Plano não encontrado',
            description: 'Por favor selecione um plano válido.',
            variant: 'destructive',
          })
          navigate('/planos')
          return
        }
        setPlan(data)
      } catch (e) {
        console.error(e)
        navigate('/planos')
      } finally {
        setLoading(false)
      }
    }

    loadPlan()
  }, [planSlug, navigate, toast])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!plan) return
    setSubmitting(true)

    try {
      const { data, error } = await ordersService.createOrder({
        ...values,
        client_cpf_cnpj: values.client_cpf_cnpj.replace(/\D/g, ''),
        client_whatsapp: values.client_whatsapp.replace(/\D/g, ''),
        plan: plan.name,
        plan_id: plan.id,
        plan_snapshot_name: plan.name,
        plan_snapshot_price_cents: plan.price_cents,
        plan_snapshot_features: plan.features?.map((f) => f.text) || [],
      })

      if (error) throw error

      if (data) {
        navigate('/pagamento', {
          state: {
            orderId: data.id,
            orderCode: data.code,
            planName: plan.name,
            priceCents: plan.price_cents,
          },
        })
      }
    } catch (e: any) {
      toast({
        title: 'Erro ao criar pedido',
        description: e.message,
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    )
  }

  if (!plan) return null

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-24 font-body">
      <div className="container mx-auto px-4 max-w-5xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/planos')}
          className="mb-6 hover:bg-gray-200"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Planos
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Seus Dados</CardTitle>
                <CardDescription>
                  Precisamos dessas informações para criar seu projeto.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="client_name"
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
                        name="client_email"
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
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="client_cpf_cnpj"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CPF / CNPJ</FormLabel>
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
                        name="client_whatsapp"
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

                    <Separator className="my-4" />

                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">Sobre o Projeto</h3>

                      <FormField
                        control={form.control}
                        name="property_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de Imóvel</FormLabel>
                            <FormControl>
                              <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                {...field}
                              >
                                <option value="">Selecione...</option>
                                <option value="Casa">Casa</option>
                                <option value="Apartamento">
                                  Apartamento (Varanda)
                                </option>
                                <option value="Comercial">Comercial</option>
                                <option value="Sítio/Chácara">
                                  Sítio / Chácara
                                </option>
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="dimensions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Dimensões Aproximadas (Opcional)
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ex: 50m², 10x5m..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Observações Iniciais (Opcional)
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Conte um pouco sobre o que você deseja..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full text-lg h-12 mt-6"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      ) : (
                        'Ir para Pagamento'
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 border-primary/20 shadow-md">
              <CardHeader className="bg-primary/5 border-b pb-4">
                <CardTitle className="text-xl">Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {plan.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="block font-bold text-xl text-primary">
                      R$ {(plan.price_cents / 100).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide text-gray-500">
                    Incluso no Pacote:
                  </h4>
                  {/* Full Feature List - No Truncation */}
                  <ul className="space-y-3">
                    {plan.features?.map((feature) => (
                      <li
                        key={feature.id}
                        className="flex items-start gap-3 text-sm"
                      >
                        <div className="mt-0.5 rounded-full bg-green-100 p-1">
                          <Check className="h-3 w-3 text-green-600" />
                        </div>
                        <span className="text-gray-700 leading-tight">
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 border-t p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mx-auto">
                  <ShieldCheck className="h-4 w-4 text-green-600" />
                  Pagamento 100% Seguro via Asaas
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

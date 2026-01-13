import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Upload,
  X,
  AlertTriangle,
  ChevronLeft,
  Loader2,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { ordersService } from '@/services/ordersService'
import { PLAN_DETAILS, PlanName } from '@/lib/plan-constants'

const formSchema = z.object({
  client_name: z
    .string()
    .min(3, { message: 'Nome deve ter pelo menos 3 caracteres' }),
  client_email: z.string().email({ message: 'Email inválido' }),
  client_whatsapp: z
    .string()
    .min(10, { message: 'WhatsApp deve ter DDD + número' }),
  property_type: z.string({ required_error: 'Selecione o tipo de imóvel' }),
  dimensions: z
    .string()
    .min(1, { message: 'Informe as dimensões aproximadas' }),
  preferences: z.string().optional(),
  notes: z.string().optional(),
})

export default function Pedido() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingText, setLoadingText] = useState('')

  // Retrieve plan from URL query params (preferred)
  const planParam = searchParams.get('plan')

  // Resolve Plan Details
  const planDetails = planParam
    ? PLAN_DETAILS[planParam as PlanName]
    : undefined
  const plan = planParam
  // Parse price from string (e.g. "399,00" -> 399.00)
  const price = planDetails
    ? parseFloat(planDetails.price.replace(/\./g, '').replace(',', '.'))
    : 0

  // If no valid plan is selected, redirect back to plans
  useEffect(() => {
    if (!plan || !planDetails) {
      toast({
        title: 'Plano não selecionado',
        description: 'Por favor, escolha um plano para continuar.',
        variant: 'destructive',
      })
      navigate('/planos')
    }
  }, [plan, planDetails, navigate, toast])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client_name: '',
      client_email: '',
      client_whatsapp: '',
      property_type: '',
      dimensions: '',
      preferences: '',
      notes: '',
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      setFiles((prev) => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files)
      // Filter images only
      const validFiles = newFiles.filter((file) =>
        file.type.startsWith('image/'),
      )
      if (validFiles.length < newFiles.length) {
        toast({
          title: 'Arquivo inválido',
          description: 'Apenas imagens são permitidas.',
          variant: 'destructive',
        })
      }
      setFiles((prev) => [...prev, ...validFiles])
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (files.length === 0) {
      toast({
        title: 'Fotos necessárias',
        description: 'Por favor, adicione pelo menos uma foto do espaço.',
        variant: 'destructive',
      })
      return
    }

    if (!plan || !price) return

    setLoading(true)
    setLoadingText('Criando seu pedido...')

    try {
      // 1. Create Order and Checkout
      const checkoutResult = await ordersService.createCheckout({
        ...values,
        plan,
        price,
      })

      if (checkoutResult.error) {
        throw new Error(checkoutResult.error)
      }

      const { orderCode, checkoutUrl } = checkoutResult

      // 2. Upload Photos
      setLoadingText('Enviando fotos...')

      // Upload sequentially to avoid overwhelming connection/storage logic if many files
      let uploadErrors = 0
      for (const file of files) {
        const { error: uploadError } = await ordersService.uploadOrderPhoto(
          orderCode,
          file,
        )
        if (uploadError) {
          console.error('Error uploading photo:', uploadError)
          uploadErrors++
        }
      }

      if (uploadErrors > 0) {
        toast({
          title: 'Atenção',
          description: `Algumas fotos não puderam ser enviadas. Você pode tentar novamente na área do cliente.`,
          variant: 'destructive',
        })
      }

      // 3. Redirect
      setLoadingText('Redirecionando para pagamento...')

      // Save orderCode to local storage for recovery if needed
      localStorage.setItem(
        'lastOrder',
        JSON.stringify({ code: orderCode, url: checkoutUrl }),
      )

      window.location.href = checkoutUrl
    } catch (error: any) {
      console.error('Order submission error:', error)
      toast({
        title: 'Erro ao processar pedido',
        description:
          error.message || 'Ocorreu um erro inesperado. Tente novamente.',
        variant: 'destructive',
      })
      setLoading(false)
    }
  }

  if (!plan) return null

  return (
    <div className="min-h-screen bg-stone-50 py-8 px-4 font-body">
      <div className="max-w-3xl mx-auto">
        <Button
          variant="ghost"
          className="mb-6 pl-0 hover:bg-transparent hover:text-primary"
          onClick={() => navigate('/planos')}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Voltar para Planos
        </Button>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-heading font-semibold mb-6">
                  Dados do Pedido
                </h2>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Dados Pessoais
                      </h3>
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="client_email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>E-mail</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="seu@email.com"
                                  type="email"
                                  {...field}
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
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Sobre o Espaço
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="property_type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipo de Imóvel</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione..." />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Casa">Casa</SelectItem>
                                  <SelectItem value="Apartamento">
                                    Apartamento
                                  </SelectItem>
                                  <SelectItem value="Comercial">
                                    Comercial
                                  </SelectItem>
                                  <SelectItem value="Outro">Outro</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="dimensions"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Dimensões Aprox.</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Ex: 5x10m, 50m²"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="preferences"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preferências (Opcional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Gosto de plantas tropicais, pedras, etc."
                                className="resize-none"
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
                            <FormLabel>Observações (Opcional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Alguma informação adicional importante?"
                                className="resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-heading font-semibold">
                    Fotos do Espaço
                  </h2>
                  <span className="text-xs text-muted-foreground">
                    Mínimo 1 foto
                  </span>
                </div>

                <div
                  className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center transition-colors hover:bg-muted/30 cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                      <Upload className="h-6 w-6" />
                    </div>
                    <p className="font-medium">Clique ou arraste fotos aqui</p>
                    <p className="text-sm text-muted-foreground">
                      Procure mostrar vários ângulos do local
                    </p>
                  </div>
                </div>

                {files.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="relative aspect-square rounded-lg overflow-hidden group border bg-muted"
                      >
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => removeFile(index)}
                          className="absolute top-1 right-1 bg-black/50 hover:bg-destructive text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                Ao continuar, você será redirecionado para o ambiente seguro da
                Asaas para concluir o pagamento.
              </p>
            </div>

            <Button
              className="w-full h-12 text-lg"
              size="lg"
              disabled={loading}
              onClick={form.handleSubmit(onSubmit)}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {loadingText}
                </>
              ) : (
                'Pagar com Segurança'
              )}
            </Button>
          </div>

          <div className="space-y-6">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h3 className="font-heading font-semibold mb-4">
                  Resumo do Pedido
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b">
                    <span className="text-muted-foreground">
                      Plano Escolhido
                    </span>
                    <span className="font-medium text-primary">{plan}</span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total</span>
                    <span>
                      {price.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </span>
                  </div>
                  <div className="pt-4 space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Projeto Personalizado</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Suporte via WhatsApp</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Entrega Digital</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

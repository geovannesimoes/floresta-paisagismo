import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload, X, Loader2, ArrowLeft, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { ordersService } from '@/services/ordersService'
import { useSeo } from '@/hooks/use-seo'
import { formatCpfCnpj, formatPhone } from '@/lib/utils'
import { Plan } from '@/services/plansService'

const formSchema = z.object({
  nome: z.string().min(3, 'Nome muito curto'),
  email: z.string().email('E-mail inválido'),
  cpfCnpj: z.string().refine((val) => {
    const digits = val.replace(/\D/g, '')
    return digits.length === 11 || digits.length === 14
  }, 'CPF ou CNPJ inválido'),
  whatsapp: z.string().refine((val) => {
    const digits = val.replace(/\D/g, '')
    return digits.length === 10 || digits.length === 11
  }, 'Número inválido'),
  tipoImovel: z.string({ required_error: 'Selecione o tipo de imóvel' }),
  medidas: z.string().optional(),
  preferencias: z.string().optional(),
  observacoes: z.string().optional(),
})

export default function Pedido() {
  useSeo({
    title: 'Finalizar Pedido | Floresta Paisagismo',
    description: 'Envie as informações do seu projeto e finalize seu pedido.',
  })

  const { state } = useLocation()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [photos, setPhotos] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (state?.selectedPlan) {
      setSelectedPlan(state.selectedPlan)
    } else {
      // Redirect if no plan selected
      navigate('/planos')
    }
  }, [state, navigate])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      email: '',
      cpfCnpj: '',
      whatsapp: '',
      medidas: '',
      preferencias: '',
      observacoes: '',
    },
  })

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newPhotos = Array.from(e.target.files)
      setPhotos([...photos, ...newPhotos])
    }
  }

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index))
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!selectedPlan) return

    if (photos.length === 0) {
      toast({
        title: 'Fotos necessárias',
        description: 'Por favor, envie pelo menos uma foto do seu espaço.',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Create Order using Secure RPC with snapshot data
      const { data: order, error } = await ordersService.createOrder({
        client_name: values.nome,
        client_email: values.email,
        client_cpf_cnpj: values.cpfCnpj.replace(/\D/g, ''),
        client_whatsapp: values.whatsapp.replace(/\D/g, ''),
        property_type: values.tipoImovel,
        dimensions: values.medidas,
        preferences: values.preferencias,
        notes: values.observacoes,
        plan: selectedPlan.name, // Legacy field
        status: 'Aguardando Pagamento',

        // New Snapshot Fields
        plan_id: selectedPlan.id,
        plan_snapshot_name: selectedPlan.name,
        plan_snapshot_price_cents: selectedPlan.price_cents,
        plan_snapshot_features: selectedPlan.features?.map((f) => f.text) || [],
      })

      if (error || !order) {
        throw error || new Error('Falha ao criar pedido')
      }

      // Upload Photos using the internal ID (UUID)
      const uploadPromises = photos.map((photo) =>
        ordersService.uploadOrderPhoto(order.id, photo),
      )

      await Promise.all(uploadPromises)

      // Navigate passing necessary data for payment processing
      navigate('/pagamento', {
        state: {
          orderId: order.id,
          orderCode: order.code,
          planName: selectedPlan.name,
          priceCents: selectedPlan.price_cents, // Pass cents
          clientEmail: values.email,
        },
      })
    } catch (error: any) {
      console.error(error)
      toast({
        title: 'Erro ao enviar pedido',
        description:
          error.message ||
          'Ocorreu um erro ao salvar seu pedido. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!selectedPlan) return null

  return (
    <div className="pt-32 pb-16 min-h-screen bg-stone-50">
      <div className="container mx-auto px-4 max-w-6xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/planos')}
          className="mb-8 pl-0 hover:bg-transparent hover:text-primary transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Planos
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-foreground">
            Vamos começar seu projeto
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Preencha os detalhes abaixo para personalizarmos seu jardim.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-border">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="nome"
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="cpfCnpj"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CPF/CNPJ</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="CPF ou CNPJ"
                              {...field}
                              onChange={(e) => {
                                field.onChange(formatCpfCnpj(e.target.value))
                              }}
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
                              placeholder="(XX) XXXXX-XXXX"
                              {...field}
                              onChange={(e) => {
                                field.onChange(formatPhone(e.target.value))
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="tipoImovel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo do Imóvel</FormLabel>
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
                              <SelectItem value="Loja">Loja</SelectItem>
                              <SelectItem value="Terreno">Terreno</SelectItem>
                              <SelectItem value="Chácara">Chácara</SelectItem>
                              <SelectItem value="Outro">Outro</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="medidas"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medidas Aproximadas (Opcional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Ex: 10m x 5m, ou 'quintal pequeno em L'"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="preferencias"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferências e Estilo (Opcional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Ex: Quero um jardim tropical com rede, pouca manutenção, gosto de cores vibrantes..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Upload Section */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <FormLabel className="text-base">
                        Fotos do Espaço
                      </FormLabel>
                      <span className="text-xs text-muted-foreground">
                        Mínimo 1 foto
                      </span>
                    </div>

                    <div className="border-2 border-dashed border-input rounded-xl p-8 text-center hover:bg-accent/30 transition-colors relative bg-stone-50">
                      <Input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="flex flex-col items-center justify-center pointer-events-none">
                        <div className="bg-white p-3 rounded-full shadow-sm mb-4">
                          <Upload className="h-6 w-6 text-primary" />
                        </div>
                        <p className="font-medium text-foreground">
                          Clique ou arraste fotos aqui
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Procure mostrar vários ângulos do local
                        </p>
                      </div>
                    </div>

                    {photos.length > 0 && (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mt-4">
                        {photos.map((photo, index) => (
                          <div
                            key={index}
                            className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 border shadow-sm"
                          >
                            <img
                              src={URL.createObjectURL(photo)}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removePhoto(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="block lg:hidden">
                    <Button
                      type="submit"
                      className="w-full text-lg h-14 rounded-full font-bold shadow-lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />{' '}
                          Processando...
                        </>
                      ) : (
                        'Ir para Pagamento'
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>

          {/* Summary Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <Card className="shadow-lg border-primary/20 overflow-hidden">
                <CardHeader className="bg-primary/5 pb-4 border-b">
                  <CardTitle className="text-lg text-primary">
                    Resumo do Pedido
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-xl">
                        Projeto {selectedPlan.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedPlan.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    {selectedPlan.features?.slice(0, 4).map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        <span>{feature.text}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-end border-t pt-4 mb-6">
                    <span className="font-medium text-muted-foreground">
                      Total
                    </span>
                    <span className="text-3xl font-bold text-foreground">
                      R${' '}
                      {(selectedPlan.price_cents / 100)
                        .toFixed(2)
                        .replace('.', ',')}
                    </span>
                  </div>

                  <Button
                    onClick={form.handleSubmit(onSubmit)}
                    className="w-full text-lg h-12 rounded-full font-bold shadow-md"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      'Comprar Agora'
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground mt-4">
                    Pagamento seguro via PIX ou Cartão
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

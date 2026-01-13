import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload, X, Loader2, ArrowLeft } from 'lucide-react'
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
import { useToast } from '@/hooks/use-toast'
import { ordersService } from '@/services/ordersService'
import { useSeo } from '@/hooks/use-seo'

const formSchema = z.object({
  nome: z.string().min(3, 'Nome muito curto'),
  email: z.string().email('E-mail inválido'),
  whatsapp: z.string().min(10, 'Número inválido'),
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

  const [selectedPlan, setSelectedPlan] = useState('Ipê')
  const [photos, setPhotos] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (state?.selectedPlan) {
      setSelectedPlan(state.selectedPlan)
    }
  }, [state])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      email: '',
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
      // Create Order
      const { data: order, error } = await ordersService.createOrder({
        client_name: values.nome,
        client_email: values.email,
        client_whatsapp: values.whatsapp,
        property_type: values.tipoImovel,
        dimensions: values.medidas,
        preferences: values.preferencias,
        notes: values.observacoes,
        plan: selectedPlan,
        status: 'Aguardando Pagamento',
      })

      if (error || !order) throw error || new Error('Failed to create order')

      // Upload Photos using the internal ID (UUID)
      const uploadPromises = photos.map((photo) =>
        ordersService.uploadOrderPhoto(order.id, photo),
      )
      await Promise.all(uploadPromises)

      // Navigate passing both ID (for internal use) and Code (for display)
      navigate('/pagamento', {
        state: {
          orderId: order.id,
          orderCode: order.code,
          planName: selectedPlan,
        },
      })
    } catch (error: any) {
      console.error(error)
      toast({
        title: 'Erro ao enviar pedido',
        description: 'Tente novamente mais tarde.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="pt-32 pb-16 min-h-screen bg-stone-50">
      <div className="container mx-auto px-4 max-w-3xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/planos')}
          className="mb-8 pl-0 hover:bg-transparent hover:text-primary transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Planos
        </Button>

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-heading font-bold text-foreground">
            Vamos começar seu projeto
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Você escolheu o{' '}
            <span className="font-bold text-primary">
              Projeto {selectedPlan}
            </span>
            .
            <br />
            Precisamos de alguns detalhes para criar algo único para você.
          </p>
        </div>

        <div className="bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-border">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                  name="whatsapp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>WhatsApp</FormLabel>
                      <FormControl>
                        <Input placeholder="(XX) XXXXX-XXXX" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <FormLabel className="text-base">Fotos do Espaço</FormLabel>
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

              <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg text-sm text-amber-900 flex gap-3 items-start">
                <div className="mt-0.5 min-w-[4px] h-4 rounded-full bg-amber-500" />
                <p>
                  Seus dados e fotos estão seguros conosco. Após o envio, você
                  será redirecionado para o pagamento seguro.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full text-lg h-14 rounded-full font-bold shadow-lg hover:shadow-xl transition-all"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />{' '}
                    Processando...
                  </>
                ) : (
                  'Continuar para o Pagamento'
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}

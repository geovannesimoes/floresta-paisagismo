import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload, X, Loader2 } from 'lucide-react'
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
import { useStore, type Order } from '@/lib/store'

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
  const { state } = useLocation()
  const navigate = useNavigate()
  const { addOrder } = useStore()
  const { toast } = useToast()

  const [selectedPlan, setSelectedPlan] = useState<string>('Completo')
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

    // Simulate image processing (convert to base64 placeholder or use dummy url)
    const photoUrls = photos.map(
      (_, index) =>
        `https://img.usecurling.com/p/800/600?q=garden%20${index + 1}`,
    )

    // Create Order
    const order = addOrder({
      clientName: values.nome,
      clientEmail: values.email,
      clientWhatsapp: values.whatsapp,
      propertyType: values.tipoImovel,
      dimensions: values.medidas,
      preferences: values.preferencias,
      notes: values.observacoes,
      plan: selectedPlan as Order['plan'],
      photos: photoUrls,
    })

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsSubmitting(false)
    navigate('/pagamento', {
      state: { orderId: order.id, planName: selectedPlan },
    })
  }

  return (
    <div className="pt-24 pb-16 min-h-screen bg-accent/20">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-heading font-bold">
            Detalhes do Seu Projeto
          </h1>
          <p className="text-muted-foreground mt-2">
            Você escolheu o{' '}
            <span className="font-bold text-primary">{selectedPlan}</span>.
            Preencha os dados abaixo para continuarmos.
          </p>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-border">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                        placeholder="Ex: 10m x 5m, ou 'quintal pequeno'"
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
                    <FormLabel>Preferências (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ex: Quero um jardim tropical, pouca manutenção..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Upload Section */}
              <div className="space-y-4">
                <FormLabel>Fotos do Espaço</FormLabel>
                <div className="border-2 border-dashed border-input rounded-lg p-8 text-center hover:bg-accent/50 transition-colors relative">
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center pointer-events-none">
                    <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                    <p className="font-medium text-sm">
                      Clique ou arraste fotos aqui
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Formatos: JPG, PNG
                    </p>
                  </div>
                </div>

                {photos.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mt-4">
                    {photos.map((photo, index) => (
                      <div
                        key={index}
                        className="relative group aspect-square rounded-md overflow-hidden bg-gray-100"
                      >
                        <img
                          src={URL.createObjectURL(photo)}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md text-sm text-yellow-800">
                Após enviar as fotos, você seguirá para o pagamento para
                iniciarmos o projeto.
              </div>

              <Button
                type="submit"
                className="w-full text-lg h-12"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{' '}
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

import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle2, Loader2, QrCode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ordersService } from '@/services/ordersService'
import { useToast } from '@/hooks/use-toast'

export default function Pagamento() {
  const location = useLocation()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState<'processing' | 'payment' | 'success'>(
    'processing',
  )
  const [displayId, setDisplayId] = useState<number | null>(null)

  const orderId = location.state?.orderId
  const planName = location.state?.planName

  useEffect(() => {
    if (!orderId) {
      navigate('/')
      return
    }

    // Simulate initial loading of payment gateway
    const timer = setTimeout(() => {
      setLoading(false)
      setStep('payment')
    }, 2000)

    return () => clearTimeout(timer)
  }, [orderId, navigate])

  const handleSimulatePayment = async () => {
    setLoading(true)

    try {
      // Update order status in DB
      const { data, error } = await ordersService.updateOrderStatus(
        orderId,
        'Recebido',
      )

      if (error) throw error

      if (data) {
        setDisplayId(data.display_id)
      }

      setStep('success')
    } catch (error) {
      console.error(error)
      toast({
        title: 'Erro no pagamento',
        description: 'Não foi possível confirmar o pagamento. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (step === 'processing' || (step === 'payment' && loading)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
        <h2 className="text-xl font-semibold">Conectando ao Asaas...</h2>
        <p className="text-muted-foreground">Gerando sua cobrança segura.</p>
      </div>
    )
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-fade-in-up">
          <CheckCircle2 className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-3xl font-heading font-bold mb-4">
          Pagamento Confirmado!
        </h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          Seu pedido <strong>#{displayId || orderId?.slice(0, 8)}</strong> foi
          recebido com sucesso. Nossa equipe já vai começar a trabalhar no seu
          projeto.
        </p>
        <div className="space-y-4">
          <Button
            onClick={() => navigate(`/area-cliente`)}
            className="w-full md:w-auto"
          >
            Acessar Área do Cliente
          </Button>
          <br />
          <Button variant="link" onClick={() => navigate('/')}>
            Voltar ao Início
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-24 pb-16 min-h-screen bg-accent/20">
      <div className="container mx-auto px-4 max-w-md">
        <Card>
          <CardHeader className="text-center border-b">
            <CardTitle>Checkout Seguro</CardTitle>
            <p className="text-sm text-muted-foreground">
              ID Interno: {orderId?.slice(0, 8)}
            </p>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>{planName}</span>
              <span>R$ 897,00</span>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border text-center space-y-4">
              <p className="text-sm font-medium">Pague via Pix (Simulado)</p>
              <div className="mx-auto bg-white p-2 w-48 h-48 border rounded flex items-center justify-center">
                <QrCode className="w-40 h-40 text-black" />
              </div>
              <p className="text-xs text-muted-foreground break-all">
                00020126360014BR.GOV.BCB.PIX0114+55119999999952040000530398654041.005802BR5919FLORESTA
                PAISAGISMO6009SAO PAULO62070503***6304E2CA
              </p>
            </div>

            <Button
              onClick={handleSimulatePayment}
              className="w-full h-12 text-lg"
            >
              Confirmar Pagamento
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Ambiente Seguro. Processado por Asaas.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

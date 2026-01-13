import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle2, Loader2, QrCode, Copy } from 'lucide-react'
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
  // Store the final code to display after successful payment update
  const [confirmedCode, setConfirmedCode] = useState<string>('')

  // State passed from Pedido page
  const orderId = location.state?.orderId
  const initialOrderCode = location.state?.orderCode
  const planName = location.state?.planName
  const clientEmail = location.state?.clientEmail

  useEffect(() => {
    // If we don't have ID or Code, redirect to home
    if (!orderId || !initialOrderCode) {
      navigate('/')
      return
    }

    // Set initial confirmed code from navigation state
    setConfirmedCode(initialOrderCode)

    // Simulate initial loading of payment gateway
    const timer = setTimeout(() => {
      setLoading(false)
      setStep('payment')
    }, 2000)

    return () => clearTimeout(timer)
  }, [orderId, initialOrderCode, navigate])

  const handleSimulatePayment = async () => {
    if (!clientEmail) {
      toast({
        title: 'Erro de sessão',
        description: 'Dados do pedido incompletos. Tente refazer o pedido.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      // Update order status securely via RPC using ID, Code and Email
      const { data, error } = await ordersService.confirmPayment(
        orderId,
        confirmedCode,
        clientEmail,
      )

      if (error) throw error

      if (data) {
        // Ensure we update with the fresh code from DB if it changed (unlikely but safe)
        setConfirmedCode(data.code)
      }

      setStep('success')
    } catch (error: any) {
      console.error(error)
      toast({
        title: 'Erro no pagamento',
        description:
          error.message ||
          'Não foi possível confirmar o pagamento. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (confirmedCode) {
      navigator.clipboard.writeText(confirmedCode)
      toast({ title: 'Código copiado!' })
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-fade-in-up mx-auto">
          <CheckCircle2 className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-3xl font-heading font-bold mb-4">
          Pagamento Confirmado!
        </h1>

        <div className="bg-muted/50 p-6 rounded-lg max-w-md w-full mx-auto mb-8 border">
          <p className="text-sm text-muted-foreground mb-2">
            Seu código do pedido é
          </p>
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-3xl font-mono font-bold tracking-wider text-primary">
              {confirmedCode}
            </span>
            <Button
              size="icon"
              variant="ghost"
              onClick={copyToClipboard}
              title="Copiar código"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Salve este código. Você precisará dele para acessar a Área do
            Cliente.
          </p>
        </div>

        <div className="max-w-md mx-auto text-left space-y-4 mb-8 bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="font-bold text-lg">Próximos Passos:</h3>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
              <span>Sua compra foi confirmada com sucesso.</span>
            </li>
            <li className="flex gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
              <span>Você receberá este código e a confirmação por e-mail.</span>
            </li>
            <li className="flex gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
              <span>
                Seu projeto está sendo confeccionado pela nossa equipe.
              </span>
            </li>
            <li className="flex gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
              <span>
                Você será avisado por e-mail quando tudo estiver pronto.
              </span>
            </li>
            <li className="flex gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
              <span>
                Acompanhe o status a qualquer momento na Área do Cliente.
              </span>
            </li>
          </ul>
        </div>

        <div className="space-y-4 w-full max-w-xs mx-auto">
          <Button
            onClick={() => navigate(`/area-cliente`)}
            className="w-full"
            size="lg"
          >
            Acessar Área do Cliente
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="w-full"
          >
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
              Pedido:{' '}
              <span className="font-mono font-bold">{confirmedCode}</span>
            </p>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>{planName}</span>
              <span>
                {planName === 'Lírio'
                  ? 'R$ 399,00'
                  : planName === 'Ipê'
                    ? 'R$ 699,00'
                    : 'R$ 999,00'}
              </span>
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

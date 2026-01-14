import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { asaasCheckoutService } from '@/services/asaasCheckout'
import { PLAN_DETAILS, PlanName } from '@/lib/plan-constants'

export default function Pagamento() {
  const location = useLocation()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null)

  // State passed from Pedido page
  const orderId = location.state?.orderId
  const orderCode = location.state?.orderCode
  const planName = location.state?.planName

  const planPrice = planName
    ? Number(PLAN_DETAILS[planName as PlanName]?.price.replace(',', '.'))
    : 0

  useEffect(() => {
    // If we don't have ID or Code, redirect to home
    if (!orderId || !orderCode || !planName) {
      navigate('/')
      return
    }

    const initiateCheckout = async () => {
      setLoading(true)
      setError(null)

      try {
        const { checkoutUrl, error: serviceError } =
          await asaasCheckoutService.createCheckout({
            orderId,
            orderCode,
            planName,
            price: planPrice,
            siteUrl: window.location.origin,
          })

        if (serviceError) {
          throw new Error(serviceError)
        }

        if (!checkoutUrl) {
          throw new Error('Não foi possível gerar o link de pagamento')
        }

        setCheckoutUrl(checkoutUrl)

        // Automatic redirect
        window.location.href = checkoutUrl
      } catch (err: any) {
        console.error('Checkout Flow Error:', err)
        setError(err.message)
        setLoading(false)
        toast({
          title: 'Erro no Pagamento',
          description: err.message,
          variant: 'destructive',
        })
      }
    }

    initiateCheckout()
  }, [orderId, orderCode, planName, navigate, planPrice, toast])

  return (
    <div className="pt-24 pb-16 min-h-screen bg-accent/20 flex flex-col items-center justify-center">
      <div className="container mx-auto px-4 max-w-md">
        <Card className="text-center shadow-xl">
          <CardHeader>
            <CardTitle>Redirecionando para Pagamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 py-6">
            {loading ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
                <p className="text-muted-foreground">
                  Aguarde, estamos gerando sua cobrança segura no Asaas...
                </p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center gap-4">
                <AlertCircle className="h-12 w-12 text-red-500" />
                <div className="space-y-2">
                  <p className="text-red-600 font-medium">Ocorreu um erro:</p>
                  <p className="text-sm text-muted-foreground bg-muted p-2 rounded border border-border">
                    {error}
                  </p>
                </div>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="mt-2"
                >
                  Tentar Novamente
                </Button>
                <Button
                  variant="link"
                  onClick={() => navigate('/')}
                  className="text-muted-foreground"
                >
                  Voltar ao Início
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Se você não foi redirecionado automaticamente, clique abaixo:
                </p>
                {checkoutUrl && (
                  <Button asChild size="lg" className="w-full">
                    <a href={checkoutUrl}>Abrir Pagamento</a>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

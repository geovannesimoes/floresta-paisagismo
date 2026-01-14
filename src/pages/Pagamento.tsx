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
      try {
        const { checkoutUrl, error } =
          await asaasCheckoutService.createCheckout({
            orderId,
            orderCode,
            planName,
            price: planPrice,
            siteUrl: window.location.origin,
          })

        if (error || !checkoutUrl) {
          throw new Error(error || 'Não foi possível gerar o link de pagamento')
        }

        setCheckoutUrl(checkoutUrl)

        // Automatic redirect
        window.location.href = checkoutUrl
      } catch (err: any) {
        console.error(err)
        setError(err.message)
        setLoading(false)
        toast({
          title: 'Erro',
          description: 'Falha ao iniciar pagamento. Tente novamente.',
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
                <p className="text-red-600 font-medium">{error}</p>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                >
                  Tentar Novamente
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

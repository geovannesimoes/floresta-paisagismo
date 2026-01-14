import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { CheckCircle2, Loader2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ordersService } from '@/services/ordersService'
import { useToast } from '@/hooks/use-toast'

export default function PagamentoSucesso() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const orderCode = searchParams.get('code')
  const [loading, setLoading] = useState(true)
  const [verified, setVerified] = useState(false)

  useEffect(() => {
    const checkStatus = async () => {
      if (!orderCode) return // Wait for user/interaction or handle missing code

      try {
        const { data } = await ordersService.getOrderByCode(orderCode)
        if (data) {
          // We can show success even if status is pending because they returned from gateway
          setVerified(true)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }

    if (orderCode) {
      checkStatus()
    } else {
      setLoading(false)
    }
  }, [orderCode])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50/50 px-4 py-12">
      <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-xl text-center border border-green-100">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>

        <h1 className="text-3xl font-heading font-bold mb-4 text-green-900">
          Pagamento Recebido!
        </h1>

        <p className="text-muted-foreground mb-8 text-lg">
          Obrigado pela sua compra. Seu projeto já está na nossa fila de
          produção.
        </p>

        {orderCode && (
          <div className="bg-muted p-4 rounded-lg mb-8">
            <p className="text-sm text-muted-foreground mb-1">
              Código do Pedido
            </p>
            <p className="text-2xl font-mono font-bold tracking-wider">
              {orderCode}
            </p>
          </div>
        )}

        <div className="space-y-4">
          <Button
            onClick={() => navigate('/area-cliente')}
            className="w-full h-12 text-lg"
          >
            Acessar Área do Cliente
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="w-full"
          >
            Voltar para Início
          </Button>
        </div>
      </div>
    </div>
  )
}

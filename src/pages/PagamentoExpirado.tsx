import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Clock, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ordersService, Order } from '@/services/ordersService'

export default function PagamentoExpirado() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Support both new 'orderCode' and legacy 'code'
  const orderCode = searchParams.get('orderCode') || searchParams.get('code')

  const [loading, setLoading] = useState(!!orderCode)
  const [order, setOrder] = useState<Order | null>(null)

  useEffect(() => {
    if (orderCode) {
      ordersService.getOrderByCode(orderCode).then(({ data }) => {
        if (data && data.length > 0) setOrder(data[0])
        setLoading(false)
      })
    }
  }, [orderCode])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-amber-50/50 px-4 font-body">
      <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-xl text-center border border-amber-100 animate-fade-in-up">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="h-10 w-10 text-amber-600" />
        </div>

        <h1 className="text-3xl font-heading font-bold mb-4 text-amber-900">
          Pagamento Expirado
        </h1>

        <p className="text-muted-foreground mb-8 text-lg">
          O prazo para pagamento deste pedido expirou. Para continuar com seu
          projeto, por favor realize um novo pedido.
        </p>

        {loading ? (
          <div className="flex justify-center mb-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : order ? (
          <div className="bg-amber-50 p-4 rounded-lg mb-8 text-sm text-amber-800">
            Pedido <strong>#{order.code}</strong> atualizado para: <br />
            <span className="font-bold uppercase">{order.status}</span>
          </div>
        ) : null}

        <div className="space-y-4">
          <Button
            onClick={() => navigate('/planos')}
            className="w-full h-12 text-lg bg-amber-600 hover:bg-amber-700"
          >
            Ver Planos Novamente <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="w-full border-amber-200 text-amber-900 hover:bg-amber-50"
          >
            Voltar para Início
          </Button>
        </div>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { XCircle, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ordersService, Order } from '@/services/ordersService'

export default function PagamentoCancelado() {
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-red-50/50 px-4 font-body">
      <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-xl text-center border border-red-100 animate-fade-in-up">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="h-10 w-10 text-red-600" />
        </div>

        <h1 className="text-3xl font-heading font-bold mb-4 text-red-900">
          Pagamento Cancelado
        </h1>

        <p className="text-muted-foreground mb-8 text-lg">
          O processo de pagamento foi cancelado ou não pôde ser concluído.
          Nenhuma cobrança foi realizada no seu cartão.
        </p>

        {loading ? (
          <div className="flex justify-center mb-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : order ? (
          <div className="bg-red-50 p-4 rounded-lg mb-8 text-sm text-red-800">
            Pedido <strong>#{order.code}</strong> permanece como: <br />
            <span className="font-bold uppercase">{order.status}</span>
          </div>
        ) : null}

        <div className="space-y-4">
          <Button
            onClick={() => navigate('/planos')}
            className="w-full h-12 text-lg"
            variant="default"
          >
            Tentar Novamente <ArrowRight className="ml-2 h-4 w-4" />
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

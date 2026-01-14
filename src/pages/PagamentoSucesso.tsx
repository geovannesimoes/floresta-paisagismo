import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  CheckCircle2,
  Loader2,
  ArrowRight,
  Package,
  Receipt,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ordersService, Order } from '@/services/ordersService'
import { useToast } from '@/hooks/use-toast'

export default function PagamentoSucesso() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const orderCode = searchParams.get('orderCode') || searchParams.get('code')
  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState<Order | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderCode) {
        setLoading(false)
        return
      }

      try {
        // Fetch order by code
        const { data } = await ordersService.getOrderByCode(orderCode)
        if (data && data.length > 0) {
          setOrder(data[0])
        } else {
          setNotFound(true)
        }
      } catch (e) {
        console.error('Error fetching order:', e)
        toast({
          title: 'Erro ao carregar pedido',
          description: 'Não foi possível buscar os detalhes do seu pedido.',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderCode, toast])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50/50">
        <Loader2 className="h-10 w-10 text-green-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50/50 px-4 py-12 font-body">
      <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-xl text-center border border-green-100 animate-fade-in-up">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>

        <h1 className="text-3xl font-heading font-bold mb-4 text-green-900">
          Pagamento Recebido!
        </h1>

        <p className="text-muted-foreground mb-8 text-lg">
          Obrigado pela sua compra. Seu projeto já está na nossa fila de
          produção e em breve você receberá atualizações.
        </p>

        {order ? (
          <div className="bg-muted/50 p-6 rounded-xl mb-8 border border-border text-left space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-lg shadow-sm">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Código do Pedido
                </p>
                <p className="text-xl font-mono font-bold tracking-wider text-foreground">
                  #{order.code}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 border-t pt-4">
              <div className="p-3 bg-white rounded-lg shadow-sm">
                <Receipt className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Detalhes</p>
                <p className="font-medium">
                  Projeto {order.plan_snapshot_name || order.plan}
                </p>
                {order.plan_snapshot_price_cents && (
                  <p className="text-sm text-muted-foreground">
                    R${' '}
                    {(order.plan_snapshot_price_cents / 100)
                      .toFixed(2)
                      .replace('.', ',')}
                  </p>
                )}
              </div>
            </div>

            <div className="text-center pt-2">
              <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase">
                Status: {order.status}
              </span>
            </div>
          </div>
        ) : notFound ? (
          <div className="bg-yellow-50 p-4 rounded-lg mb-8 text-sm text-yellow-800">
            <p className="font-bold">Aviso:</p>
            Pagamento confirmado, mas não foi possível carregar os detalhes do
            pedido no momento. Verifique seu e-mail para mais informações ou
            entre em contato com o suporte informando o código do pagamento.
          </div>
        ) : null}

        <div className="space-y-4">
          <Button
            onClick={() => navigate('/area-cliente')}
            className="w-full h-12 text-lg shadow-lg hover:shadow-xl transition-all"
            size="lg"
          >
            Acessar Área do Cliente <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="w-full text-muted-foreground hover:text-foreground"
          >
            Voltar para Início
          </Button>
        </div>
      </div>
    </div>
  )
}

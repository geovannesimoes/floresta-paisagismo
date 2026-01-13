import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  CheckCircle2,
  Loader2,
  Copy,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { ordersService, Order } from '@/services/ordersService'
import { useSeo } from '@/hooks/use-seo'

export default function PagamentoSucesso() {
  useSeo({
    title: 'Pedido Confirmado | Floresta Paisagismo',
    description: 'Acompanhe o status do seu pedido.',
  })

  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const code = searchParams.get('code')
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [polling, setPolling] = useState(false)

  const fetchOrder = async () => {
    if (!code) return
    setPolling(true)
    const { data } = await ordersService.getOrderByCode(code)
    if (data) {
      setOrder(data)
    }
    setLoading(false)
    setPolling(false)
  }

  useEffect(() => {
    if (!code) {
      // Try to recover from local storage or redirect home
      const last = localStorage.getItem('lastOrder')
      if (last) {
        try {
          const { code: savedCode } = JSON.parse(last)
          if (savedCode) {
            navigate(`/pagamento/sucesso?code=${savedCode}`, { replace: true })
            return
          }
        } catch (e) {}
      }
      navigate('/')
      return
    }

    fetchOrder()
  }, [code, navigate])

  const copyToClipboard = () => {
    if (code) {
      navigator.clipboard.writeText(code)
      toast({ title: 'Código copiado!' })
    }
  }

  const isPaid = order?.payment_status === 'PAID'
  const isPending = order?.payment_status === 'PENDING'

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Pedido não encontrado</h1>
        <p className="text-muted-foreground mb-6">
          Não conseguimos localizar o pedido com o código fornecido.
        </p>
        <Button onClick={() => navigate('/')}>Voltar ao Início</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 px-4 py-12 text-center font-body">
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-lg border border-border max-w-lg w-full">
        {isPaid ? (
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-fade-in-up">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
          </div>
        ) : (
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center animate-pulse">
              <Loader2 className="h-10 w-10 text-yellow-600 animate-spin" />
            </div>
          </div>
        )}

        <h1 className="text-3xl font-heading font-bold mb-4 text-foreground">
          {isPaid ? 'Pagamento Confirmado!' : 'Aguardando Confirmação'}
        </h1>

        <p className="text-muted-foreground mb-8">
          {isPaid
            ? 'Obrigado pela confiança! Seu projeto já está em nossa fila de produção.'
            : 'Estamos aguardando a confirmação do banco. Se você já pagou, isso pode levar alguns minutos.'}
        </p>

        <div className="bg-muted/30 p-4 rounded-xl mb-8 border border-border">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1 font-bold">
            Código do Pedido
          </p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-4xl font-mono font-bold text-primary tracking-widest">
              {code}
            </span>
            <Button
              size="icon"
              variant="ghost"
              onClick={copyToClipboard}
              title="Copiar código"
              className="h-8 w-8"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Guarde este código para acessar a Área do Cliente.
          </p>
        </div>

        {isPaid ? (
          <div className="text-left space-y-4 mb-8 bg-green-50/50 p-6 rounded-lg border border-green-100">
            <h3 className="font-bold text-lg text-green-900">
              Próximos Passos:
            </h3>
            <ul className="space-y-3 text-sm text-green-800">
              <li className="flex gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                <span>
                  Confirmação enviada para <strong>{order.client_email}</strong>
                  .
                </span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                <span>Nossa equipe analisará suas fotos e medidas.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                <span>
                  Você será notificado quando o projeto estiver pronto.
                </span>
              </li>
            </ul>
          </div>
        ) : (
          <div className="mb-8">
            <Button
              variant="outline"
              onClick={fetchOrder}
              disabled={polling}
              className="w-full"
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${polling ? 'animate-spin' : ''}`}
              />
              Atualizar Status
            </Button>
            {order.asaas_invoice_url && (
              <Button asChild variant="link" className="mt-2 text-blue-600">
                <a
                  href={order.asaas_invoice_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visualizar Fatura / Tentar Pagar Novamente
                </a>
              </Button>
            )}
          </div>
        )}

        <div className="space-y-3">
          <Button
            onClick={() => navigate(`/area-cliente`)}
            className="w-full h-12 text-lg rounded-full"
            size="lg"
          >
            Acessar Área do Cliente
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="w-full"
          >
            Voltar ao Início
          </Button>
        </div>
      </div>
    </div>
  )
}

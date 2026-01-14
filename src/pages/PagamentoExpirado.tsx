import { useNavigate, useSearchParams } from 'react-router-dom'
import { Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PagamentoExpirado() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const orderCode = searchParams.get('code')

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-amber-50/50 px-4">
      <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-xl text-center border border-amber-100">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="h-10 w-10 text-amber-600" />
        </div>

        <h1 className="text-3xl font-heading font-bold mb-4 text-amber-900">
          Pagamento Expirado
        </h1>

        <p className="text-muted-foreground mb-8 text-lg">
          O prazo para pagamento deste pedido expirou. Por favor, realize um
          novo pedido.
        </p>

        <div className="space-y-4">
          <Button
            onClick={() => navigate('/planos')}
            className="w-full h-12 text-lg"
          >
            Ver Planos Novamente
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

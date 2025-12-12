import { useState } from 'react'
import { Search, Download, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useStore, Order } from '@/lib/store'
import { useToast } from '@/hooks/use-toast'

export default function AreaCliente() {
  const { getOrder } = useStore()
  const { toast } = useToast()

  const [orderId, setOrderId] = useState('')
  const [email, setEmail] = useState('')
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()

    // Simple demo override
    if (orderId === 'DEMO' || orderId === 'demo') {
      const demo = getOrder('DEMO-1234')
      if (demo) {
        setCurrentOrder(demo)
        setIsAuthenticated(true)
        return
      }
    }

    const order = getOrder(orderId)

    if (order && order.clientEmail.toLowerCase() === email.toLowerCase()) {
      setCurrentOrder(order)
      setIsAuthenticated(true)
    } else {
      toast({
        title: 'Pedido não encontrado',
        description: 'Verifique o número do pedido e o e-mail.',
        variant: 'destructive',
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Recebido':
        return 'bg-blue-500'
      case 'Aguardando Pagamento':
        return 'bg-yellow-500'
      case 'Em Produção':
        return 'bg-orange-500'
      case 'Enviado':
        return 'bg-green-600'
      default:
        return 'bg-gray-500'
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="pt-24 pb-16 min-h-screen bg-accent/20 flex items-center justify-center">
        <div className="container mx-auto px-4 max-w-md">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Área do Cliente</CardTitle>
              <p className="text-muted-foreground">Acompanhe seu projeto</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Número do Pedido
                  </label>
                  <Input
                    placeholder="Ex: DEMO-1234"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    E-mail Cadastrado
                  </label>
                  <Input
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Acessar Pedido
                </Button>
                <div className="text-center text-xs text-muted-foreground mt-4">
                  <p>
                    Para testar, use Pedido: <strong>DEMO</strong>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-24 pb-16 min-h-screen bg-background">
      <div className="container mx-auto px-4 max-w-5xl">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => setIsAuthenticated(false)}
        >
          &larr; Sair
        </Button>

        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="flex-1">
            <h1 className="text-3xl font-heading font-bold mb-2">
              Olá, {currentOrder?.clientName.split(' ')[0]}
            </h1>
            <p className="text-muted-foreground">
              Aqui estão os detalhes do seu projeto.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-accent/30 p-4 rounded-lg">
            <Package className="h-10 w-10 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Status Atual</p>
              <Badge
                className={`${getStatusColor(currentOrder?.status || '')} hover:${getStatusColor(currentOrder?.status || '')} text-white`}
              >
                {currentOrder?.status}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Order Info */}
          <Card className="md:col-span-1 h-fit">
            <CardHeader>
              <CardTitle className="text-lg">Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Pedido</span>
                <span className="font-medium">#{currentOrder?.id}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Plano</span>
                <span className="font-medium">{currentOrder?.plan}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Data</span>
                <span className="font-medium">
                  {new Date(currentOrder?.createdAt || '').toLocaleDateString(
                    'pt-BR',
                  )}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Prazo Estimado</span>
                <span className="font-medium">7 dias úteis</span>
              </div>
            </CardContent>
          </Card>

          {/* Project Gallery or Placeholder */}
          <div className="md:col-span-2 space-y-8">
            {currentOrder?.status === 'Enviado' && currentOrder.finalImages ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Seu Projeto Finalizado</h2>
                  <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" /> Baixar Tudo (ZIP)
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {currentOrder.finalImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="group relative rounded-lg overflow-hidden shadow-md"
                    >
                      <img
                        src={img.url}
                        alt={img.title}
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-4 text-center">
                        <h3 className="font-bold text-lg mb-2">{img.title}</h3>
                        <Button size="sm" variant="secondary">
                          <Download className="h-4 w-4 mr-2" /> Baixar Imagem
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-accent/20 rounded-xl p-12 text-center border-2 border-dashed border-border">
                <div className="mx-auto bg-white w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-sm">
                  <Package className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-2">Projeto em Andamento</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Nossa equipe está trabalhando no seu paisagismo. Você receberá
                  uma notificação assim que as imagens estiverem prontas.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Search, Download, Package, List, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useStore, Order } from '@/lib/store'
import { useToast } from '@/hooks/use-toast'
import { Separator } from '@/components/ui/separator'

export default function AreaCliente() {
  const { getOrder, orders } = useStore()
  const { toast } = useToast()

  const [orderId, setOrderId] = useState('')
  const [email, setEmail] = useState('')
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)
  const [userOrders, setUserOrders] = useState<Order[]>([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()

    // Demo bypass
    if (orderId.toUpperCase() === 'DEMO') {
      const demo = getOrder('DEMO-1234')
      if (demo) {
        setCurrentOrder(demo)
        setUserOrders([demo])
        setIsAuthenticated(true)
        return
      }
    }

    const order = getOrder(orderId)

    if (order && order.clientEmail.toLowerCase() === email.toLowerCase()) {
      setCurrentOrder(order)

      // Find all orders for this email
      const allUserOrders = orders.filter(
        (o) => o.clientEmail.toLowerCase() === email.toLowerCase(),
      )
      setUserOrders(allUserOrders)

      setIsAuthenticated(true)
    } else {
      toast({
        title: 'Pedido não encontrado',
        description: 'Verifique o número do pedido e o e-mail.',
        variant: 'destructive',
      })
    }
  }

  const handleSwitchOrder = (order: Order) => {
    setCurrentOrder(order)
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
          <Card className="shadow-xl border-t-4 border-t-primary">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-heading">
                Área do Cliente
              </CardTitle>
              <CardDescription>
                Digite seus dados para acessar seus projetos
              </CardDescription>
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
                    className="h-11"
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
                    className="h-11"
                  />
                </div>
                <Button type="submit" className="w-full h-11 text-lg">
                  Acessar Pedido
                </Button>
                <div className="text-center text-xs text-muted-foreground mt-4 bg-muted p-2 rounded">
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
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              setIsAuthenticated(false)
              setOrderId('')
              setEmail('')
              setCurrentOrder(null)
            }}
          >
            &larr; Sair
          </Button>
          <span className="text-sm text-muted-foreground hidden sm:inline-block">
            Logado como: {currentOrder?.clientEmail}
          </span>
        </div>

        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="flex-1">
            <h1 className="text-3xl font-heading font-bold mb-2">
              Olá, {currentOrder?.clientName.split(' ')[0]}
            </h1>
            <p className="text-muted-foreground">
              Acompanhe o andamento e visualize os detalhes do seu projeto de
              paisagismo.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-accent/10 p-4 rounded-lg border border-accent/20">
            <Package className="h-10 w-10 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">
                Status do Pedido Atual
              </p>
              <Badge
                className={`${getStatusColor(currentOrder?.status || '')} hover:${getStatusColor(currentOrder?.status || '')} text-white mt-1`}
              >
                {currentOrder?.status}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Order Info Sidebar */}
          <div className="md:col-span-4 lg:col-span-3 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <List className="h-4 w-4" /> Seus Pedidos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {userOrders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => handleSwitchOrder(order)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                      currentOrder?.id === order.id
                        ? 'bg-primary/5 border-primary/30'
                        : 'hover:bg-muted border-transparent'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-sm">#{order.id}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full text-white ${getStatusColor(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {order.plan}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Detalhes do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Plano</span>
                  <span className="font-medium">{currentOrder?.plan}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Imóvel</span>
                  <span className="font-medium">
                    {currentOrder?.propertyType}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Data</span>
                  <span className="font-medium">
                    {new Date(currentOrder?.createdAt || '').toLocaleDateString(
                      'pt-BR',
                    )}
                  </span>
                </div>
                {currentOrder?.dimensions && (
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Medidas</span>
                    <span className="font-medium">
                      {currentOrder.dimensions}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Project Gallery */}
          <div className="md:col-span-8 lg:col-span-9 space-y-8">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Entrega do Projeto:{' '}
                <span className="text-primary">#{currentOrder?.id}</span>
              </h2>

              {currentOrder?.status === 'Enviado' &&
              currentOrder.finalImages &&
              currentOrder.finalImages.length > 0 ? (
                <div className="space-y-8">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-green-50 p-4 rounded-lg border border-green-100 text-green-800">
                    <div>
                      <h3 className="font-bold">Seu projeto está pronto!</h3>
                      <p className="text-sm mt-1">
                        Abaixo você encontra as imagens em alta resolução e o
                        detalhamento.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="bg-white border-green-200 text-green-700 hover:bg-green-100 gap-2"
                    >
                      <Download className="h-4 w-4" /> Baixar Tudo
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {currentOrder.finalImages.map((img, idx) => (
                      <div
                        key={idx}
                        className="group relative rounded-xl overflow-hidden shadow-md border bg-gray-50 hover:shadow-xl transition-all"
                      >
                        <div className="aspect-[4/3] overflow-hidden">
                          <img
                            src={img.url}
                            alt={img.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                        <div className="p-4 bg-white border-t">
                          <h3 className="font-bold text-lg">{img.title}</h3>
                        </div>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="icon"
                            variant="secondary"
                            className="rounded-full shadow-lg"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-accent/10 rounded-xl p-12 text-center border-2 border-dashed border-accent/30">
                  <div className="mx-auto bg-white w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-sm">
                    <Package className="h-10 w-10 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">
                    {currentOrder?.status === 'Recebido'
                      ? 'Analisando seu pedido...'
                      : currentOrder?.status === 'Aguardando Pagamento'
                        ? 'Aguardando confirmação de pagamento'
                        : 'Projeto em Andamento'}
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-6">
                    {currentOrder?.status === 'Em Produção'
                      ? 'Nossa equipe de arquitetos paisagistas já está trabalhando no seu projeto. Em breve você receberá as primeiras visualizações.'
                      : 'Assim que o status mudar para "Enviado", suas imagens aparecerão aqui.'}
                  </p>
                  {currentOrder?.status === 'Aguardando Pagamento' && (
                    <Button variant="default" className="gap-2">
                      Ir para Pagamento <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Customer Support Info */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <h4 className="font-semibold text-blue-900">
                  Precisa de ajuda?
                </h4>
                <p className="text-sm text-blue-800/80">
                  Fale com nosso suporte sobre alterações ou dúvidas.
                </p>
              </div>
              <Button
                variant="outline"
                className="border-blue-200 text-blue-700 hover:bg-blue-100"
              >
                Falar no WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

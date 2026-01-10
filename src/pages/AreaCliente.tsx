import { useState } from 'react'
import {
  Search,
  Download,
  Package,
  List,
  ArrowRight,
  FileText,
  Send,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { ordersService, Order } from '@/services/ordersService'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export default function AreaCliente() {
  const { toast } = useToast()

  const [orderId, setOrderId] = useState('')
  const [email, setEmail] = useState('')
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [revisionText, setRevisionText] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await ordersService.getClientOrder(email, orderId)

      if (error || !data) {
        throw new Error('Pedido não encontrado')
      }

      setCurrentOrder(data)
    } catch (error) {
      toast({
        title: 'Acesso negado',
        description: 'Verifique o ID do pedido (UUID) e o e-mail.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRequestRevision = async () => {
    if (!currentOrder || !revisionText.trim()) return

    const { error } = await ordersService.requestRevision(
      currentOrder.id,
      revisionText,
    )

    if (error) {
      toast({ title: 'Erro ao solicitar revisão', variant: 'destructive' })
    } else {
      toast({ title: 'Solicitação enviada!' })
      setRevisionText('')
      // Refresh order data
      handleLogin({ preventDefault: () => {} } as any)
    }
  }

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase()
    if (s.includes('recebido')) return 'bg-blue-500'
    if (s.includes('pagamento')) return 'bg-yellow-500'
    if (s.includes('produção')) return 'bg-orange-500'
    if (s.includes('enviado')) return 'bg-green-600'
    return 'bg-gray-500'
  }

  const canRequestRevision =
    currentOrder &&
    (currentOrder.plan === 'Jasmim' || currentOrder.plan === 'Ipê') &&
    (!currentOrder.revisions ||
      currentOrder.revisions.length < (currentOrder.plan === 'Jasmim' ? 2 : 1))

  if (!currentOrder) {
    return (
      <div className="pt-24 pb-16 min-h-screen bg-accent/20 flex items-center justify-center">
        <div className="container mx-auto px-4 max-w-md">
          <Card className="shadow-xl border-t-4 border-t-primary">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-heading">
                Área do Cliente
              </CardTitle>
              <CardDescription>
                Digite o ID do pedido (fornecido no checkout) e seu e-mail.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    ID do Pedido (UUID)
                  </label>
                  <Input
                    placeholder="Ex: 550e8400-e29b..."
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
                <Button
                  type="submit"
                  className="w-full h-11 text-lg"
                  disabled={loading}
                >
                  {loading ? 'Buscando...' : 'Acessar Pedido'}
                </Button>
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
              setOrderId('')
              setEmail('')
              setCurrentOrder(null)
            }}
          >
            &larr; Sair
          </Button>
          <span className="text-sm text-muted-foreground hidden sm:inline-block">
            Logado como: {currentOrder.client_email}
          </span>
        </div>

        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="flex-1">
            <h1 className="text-3xl font-heading font-bold mb-2">
              Olá, {currentOrder.client_name.split(' ')[0]}
            </h1>
            <p className="text-muted-foreground">
              Acompanhe o andamento e baixe seus arquivos.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-accent/10 p-4 rounded-lg border border-accent/20">
            <Package className="h-10 w-10 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">
                Status do Pedido #{currentOrder.display_id}
              </p>
              <Badge
                className={`${getStatusColor(currentOrder.status)} text-white mt-1`}
              >
                {currentOrder.status}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Sidebar Info */}
          <div className="md:col-span-4 lg:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Detalhes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Plano</span>
                  <span className="font-medium">{currentOrder.plan}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Imóvel</span>
                  <span className="font-medium">
                    {currentOrder.property_type}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Data</span>
                  <span className="font-medium">
                    {new Date(currentOrder.created_at).toLocaleDateString(
                      'pt-BR',
                    )}
                  </span>
                </div>
                {currentOrder.revisions &&
                  currentOrder.revisions.length > 0 && (
                    <div className="pt-2">
                      <span className="font-semibold block mb-2">
                        Histórico de Revisões
                      </span>
                      <ul className="space-y-2">
                        {currentOrder.revisions.map((rev) => (
                          <li
                            key={rev.id}
                            className="text-xs bg-muted p-2 rounded"
                          >
                            <span className="font-bold">{rev.status}</span>:{' '}
                            {rev.description}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="md:col-span-8 lg:col-span-9 space-y-8">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Arquivos do Projeto
              </h2>

              {currentOrder.deliverables &&
              currentOrder.deliverables.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentOrder.deliverables.map((item) => (
                    <div
                      key={item.id}
                      className="group relative rounded-xl overflow-hidden shadow-sm border hover:shadow-md transition-all flex flex-col"
                    >
                      {item.type === 'image' ? (
                        <div className="aspect-video bg-gray-100">
                          <img
                            src={item.url}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="aspect-video bg-gray-50 flex items-center justify-center">
                          <FileText className="h-12 w-12 text-muted-foreground/50" />
                        </div>
                      )}
                      <div className="p-4 flex-grow">
                        <h3 className="font-bold text-sm mb-1">{item.title}</h3>
                        <p className="text-xs text-muted-foreground uppercase">
                          {item.type}
                        </p>
                      </div>
                      <div className="p-4 pt-0">
                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          className="w-full"
                        >
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="mr-2 h-3 w-3" /> Baixar
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  Nenhum arquivo disponível ainda.
                  {currentOrder.status === 'Enviado'
                    ? ' Entre em contato com o suporte.'
                    : ' Aguarde a finalização do projeto.'}
                </div>
              )}
            </div>

            {/* Revision Request Section */}
            {canRequestRevision && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-bold mb-4">Solicitar Revisão</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Seu plano permite revisões. Descreva o que gostaria de
                  alterar.
                </p>
                <Textarea
                  value={revisionText}
                  onChange={(e) => setRevisionText(e.target.value)}
                  placeholder="Descreva detalhadamente as alterações desejadas..."
                  className="mb-4"
                />
                <Button
                  onClick={handleRequestRevision}
                  disabled={!revisionText.trim()}
                >
                  <Send className="mr-2 h-4 w-4" /> Enviar Solicitação
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import {
  Download,
  Package,
  FileText,
  Send,
  LogOut,
  Loader2,
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
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { authService, CustomerProfile } from '@/services/authService'
import {
  ordersService,
  Order,
  OrderDeliverable,
} from '@/services/ordersService'
import { DELIVERABLE_SECTIONS } from '@/lib/plan-constants'
import { ClientAuth } from '@/components/auth/ClientAuth'
import { ForcePasswordChange } from '@/components/auth/ForcePasswordChange'

export default function AreaCliente() {
  const { toast } = useToast()
  const { user, signOut, loading: authLoading } = useAuth()

  // Standard Login State (Legacy)
  const [orderCode, setOrderCode] = useState('')
  const [email, setEmail] = useState('')
  const [legacyLoading, setLegacyLoading] = useState(false)

  // App Data State
  const [orders, setOrders] = useState<Order[]>([])
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)
  const [revisionText, setRevisionText] = useState('')
  const [profile, setProfile] = useState<CustomerProfile | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(false)

  useEffect(() => {
    if (user && user.email) {
      loadUserData()
    } else {
      setOrders([])
      setCurrentOrder(null)
      setProfile(null)
    }
  }, [user])

  const loadUserData = async () => {
    if (!user?.email) return
    setLoadingProfile(true)

    try {
      // 1. Load Profile
      const { data: profileData } = await authService.getProfile(user.id)
      if (profileData) setProfile(profileData)

      // 2. Load Orders
      const { data } = await ordersService.getOrdersByEmail(user.email)
      if (data && data.length > 0) {
        setOrders(data)
        // Auto select newest order if not selected
        if (!currentOrder) {
          const details = await ordersService.getOrderWithRelations(data[0].id)
          if (details.data) setCurrentOrder(details.data)
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingProfile(false)
    }
  }

  const handleLegacyLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLegacyLoading(true)

    try {
      const normalizedCode = orderCode.trim().replace('#', '').toUpperCase()
      const normalizedEmail = email.trim().toLowerCase()

      if (normalizedCode.length !== 8) {
        throw new Error('Código deve ter 8 caracteres.')
      }

      // Secure Fetch using standardized Code
      const { data, error } = await ordersService.getClientOrder(
        normalizedEmail,
        normalizedCode,
      )

      if (error || !data) {
        throw new Error('Pedido não encontrado')
      }

      setCurrentOrder(data)
      toast({ title: 'Acesso concedido!' })
    } catch (error: any) {
      toast({
        title: 'Acesso negado',
        description:
          error.message === 'Pedido não encontrado'
            ? 'E-mail ou código do pedido inválidos.'
            : error.message,
        variant: 'destructive',
      })
    } finally {
      setLegacyLoading(false)
    }
  }

  const handleLogout = async () => {
    if (user) {
      await signOut()
    }
    setOrderCode('')
    setEmail('')
    setCurrentOrder(null)
    setOrders([])
    setProfile(null)
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
      // Refresh current order to show new revision
      if (user && user.email) {
        const details = await ordersService.getOrderWithRelations(
          currentOrder.id,
        )
        if (details.data) setCurrentOrder(details.data)
      } else {
        const { data } = await ordersService.getClientOrder(
          currentOrder.client_email,
          currentOrder.code,
        )
        if (data) setCurrentOrder(data)
      }
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

  // Simplified logic for revision check based on features snapshot if available
  const canRequestRevision = (() => {
    if (!currentOrder) return false

    // Use snapshot features if available to determine if revision is allowed
    if (currentOrder.plan_snapshot_features) {
      const hasRevisionFeature = currentOrder.plan_snapshot_features.some((f) =>
        f.toLowerCase().includes('revisão'),
      )
      if (!hasRevisionFeature) return false
    }

    // Fallback logic based on plan name if no snapshot (legacy support)
    if (
      !currentOrder.plan_snapshot_features &&
      currentOrder.plan !== 'Jasmim' &&
      currentOrder.plan !== 'Ipê'
    ) {
      return false
    }

    // Check revision count limit
    const maxRevisions =
      currentOrder.plan_snapshot_features?.some((f) =>
        f.includes('2 rodadas'),
      ) || currentOrder.plan === 'Jasmim'
        ? 2
        : 1

    return (
      !currentOrder.revisions || currentOrder.revisions.length < maxRevisions
    )
  })()

  // Simplified Grouping logic using hardcoded sections but checking against snapshot features
  const groupDeliverables = (items: OrderDeliverable[], features: string[]) => {
    const isSectionAllowed = (sectionName: string) => {
      const sectionItems =
        DELIVERABLE_SECTIONS[sectionName as keyof typeof DELIVERABLE_SECTIONS]
      if (!sectionItems) return true

      // If we have features snapshot, check against it
      if (features && features.length > 0) {
        return sectionItems.some((item) => features.includes(item))
      }

      return true // Fallback to show all if no snapshot
    }

    const groups: Record<string, OrderDeliverable[]> = {
      Projeto: [],
      'Sugestão de plantas': [],
      'Guia de manutenção básico': [],
      'Guia detalhado de plantio': [],
    }

    Object.keys(groups).forEach((key) => {
      if (!isSectionAllowed(key)) {
        delete groups[key]
      }
    })

    groups['Outros'] = []

    items.forEach((item) => {
      let matched = false
      for (const [section, keywords] of Object.entries(DELIVERABLE_SECTIONS)) {
        if (keywords.includes(item.title) && groups[section]) {
          groups[section].push(item)
          matched = true
          break
        }
      }

      if (!matched) {
        groups['Outros'].push(item)
      }
    })

    return groups
  }

  // Auth Handling
  if (authLoading || loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    )
  }

  // Handle Forced Password Change
  if (user && profile?.must_change_password) {
    return (
      <ForcePasswordChange
        userId={user.id}
        onComplete={() =>
          setProfile({ ...profile, must_change_password: false })
        }
      />
    )
  }

  // Not Logged In View
  if (!user && !currentOrder) {
    return (
      <div className="pt-24 pb-16 min-h-screen bg-accent/10 flex flex-col items-center justify-center">
        <div className="container mx-auto px-4 max-w-lg w-full space-y-8">
          {/* Legacy Form */}
          <Card className="shadow-lg border-t-4 border-t-primary">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-heading">
                Acesso Rápido ao Pedido
              </CardTitle>
              <CardDescription>
                Acompanhe o status com seu código e e-mail.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLegacyLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Código do pedido (8 caracteres)
                  </label>
                  <Input
                    placeholder="Ex: A1B2C3D4"
                    value={orderCode}
                    onChange={(e) => setOrderCode(e.target.value)}
                    className="h-11 font-mono uppercase"
                    maxLength={8}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    E-mail Cadastrado
                  </label>
                  <Input
                    placeholder="exemplo@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-11 text-lg"
                  disabled={legacyLoading}
                >
                  {legacyLoading ? 'Buscando...' : 'Acessar Pedido'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-accent/10 px-2 text-muted-foreground">
                Ou
              </span>
            </div>
          </div>

          {/* New Account Auth */}
          <ClientAuth />
        </div>
      </div>
    )
  }

  // Logged In View
  const groupedDeliverables = currentOrder?.deliverables
    ? groupDeliverables(
        currentOrder.deliverables,
        currentOrder.plan_snapshot_features || [],
      )
    : null

  return (
    <div className="pt-24 pb-16 min-h-screen bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <Button variant="outline" className="gap-2" onClick={handleLogout}>
            <LogOut className="h-4 w-4" /> Sair
          </Button>
          <span className="text-sm text-muted-foreground hidden sm:inline-block">
            {user
              ? `Conta: ${user.email}`
              : `Acesso Rápido: ${currentOrder?.client_email}`}
          </span>
        </div>

        {user && (
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-3">Seus Pedidos</h2>
            {orders.length === 0 ? (
              <div className="p-4 border rounded-lg bg-gray-50 text-muted-foreground text-sm">
                Nenhum pedido encontrado para este e-mail.
              </div>
            ) : (
              <div className="flex gap-3 flex-wrap">
                {orders.map((o) => (
                  <Button
                    key={o.id}
                    variant={currentOrder?.id === o.id ? 'default' : 'outline'}
                    className="h-auto py-2 flex flex-col items-start gap-1"
                    onClick={async () => {
                      const details = await ordersService.getOrderWithRelations(
                        o.id,
                      )
                      if (details.data) setCurrentOrder(details.data)
                    }}
                  >
                    <span className="font-bold">#{o.code}</span>
                    <span className="text-xs opacity-90">{o.plan}</span>
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}

        {!currentOrder && (
          <div className="text-center py-12 text-muted-foreground">
            Selecione um pedido acima para ver os detalhes.
          </div>
        )}

        {currentOrder && (
          <>
            <div className="flex flex-col md:flex-row gap-6 mb-8 mt-8">
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
                    Código do Pedido{' '}
                    <span className="font-mono font-bold">
                      #{currentOrder.code}
                    </span>
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
              <div className="md:col-span-4 lg:col-span-3 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Detalhes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">Plano</span>
                      <span className="font-medium">
                        {currentOrder.plan_snapshot_name || currentOrder.plan}
                      </span>
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

              <div className="md:col-span-8 lg:col-span-9 space-y-8">
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Arquivos do Projeto
                  </h2>

                  {groupedDeliverables &&
                  Object.values(groupedDeliverables).flat().length > 0 ? (
                    <div className="space-y-8">
                      {Object.entries(groupedDeliverables).map(
                        ([groupName, items]) => {
                          if (items.length === 0) return null
                          return (
                            <div key={groupName}>
                              <h3 className="font-bold text-lg mb-3 border-b pb-2 text-gray-700">
                                {groupName}
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {items.map((item) => (
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
                                      <h3 className="font-bold text-sm mb-1">
                                        {item.title}
                                      </h3>
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
                                          <Download className="mr-2 h-3 w-3" />{' '}
                                          Baixar
                                        </a>
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        },
                      )}
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

                {canRequestRevision && (
                  <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h2 className="text-xl font-bold mb-4">
                      Solicitar Revisão
                    </h2>
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
          </>
        )}
      </div>
    </div>
  )
}

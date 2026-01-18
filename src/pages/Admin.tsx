import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  LogOut,
  Plus,
  Trash,
  Edit,
  Image as ImageIcon,
  Save,
  Loader2,
  Settings,
  Package,
  Palette,
  LayoutTemplate,
  List,
  Mail,
  Upload,
  AlertTriangle,
} from 'lucide-react'
import { differenceInDays, addDays } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { LOGO_URL } from '@/lib/constants'
import { cn } from '@/lib/utils'
import {
  projectsService,
  Project,
  ProjectMedia,
} from '@/services/projectsService'
import { siteSettingsService } from '@/services/siteSettingsService'
import { ordersService, Order } from '@/services/ordersService'
import { useSiteSettings } from '@/hooks/use-site-settings'
import { PlansManager } from '@/components/admin/PlansManager'
import { OrderChecklist } from '@/components/admin/OrderChecklist'
import { OrderFiles } from '@/components/admin/OrderFiles'
import { DeadlineTracker } from '@/components/admin/DeadlineTracker'
import { NotificationSettings } from '@/components/admin/NotificationSettings'
import { HeroSlidesManager } from '@/components/admin/HeroSlidesManager'

// Constants for Routes
const VALID_ROUTES = [
  { label: 'Início', value: '/' },
  { label: 'Planos', value: '/planos' },
  { label: 'Projetos (Galeria)', value: '/projetos' },
  { label: 'Pedido (Checkout)', value: '/pedido' },
  { label: 'Área do Cliente', value: '/area-cliente' },
]

export default function Admin() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { signOut, user, loading: authLoading } = useAuth()
  const { settings, refreshSettings } = useSiteSettings()

  // State
  const [projects, setProjects] = useState<Project[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [settingsForm, setSettingsForm] = useState<any>({})

  // Dialogs & Modals
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false)
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false)

  // Selections
  const [editingProject, setEditingProject] = useState<Partial<Project>>({})
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  // Loading states
  const [loading, setLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [checklistRefreshKey, setChecklistRefreshKey] = useState(0)

  // Media Upload State
  const [mediaList, setMediaList] = useState<ProjectMedia[]>([])

  // Deliverable Upload State
  const [deliverableFiles, setDeliverableFiles] = useState<File[]>([])
  const [deliverableCategory, setDeliverableCategory] = useState<string>('')
  const [deliverableCustomTitle, setDeliverableCustomTitle] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [pData, oData] = await Promise.all([
        projectsService.getProjects(),
        ordersService.getOrders(),
      ])
      setProjects(pData.data || [])
      setOrders(oData.data || [])
    } catch (error) {
      console.error('Failed to load admin data', error)
      toast({
        title: 'Erro ao carregar dados',
        description: 'Verifique sua conexão.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    // Wait for auth loading to complete
    if (authLoading) return

    if (!user) {
      navigate('/admin/login')
      return
    }

    // Load data only if authenticated
    loadData()
  }, [user, authLoading, navigate, loadData])

  useEffect(() => {
    if (settings) {
      setSettingsForm(settings)
    }
  }, [settings])

  const refreshSelectedOrder = async (orderId: string) => {
    try {
      const { data } = await ordersService.getOrderWithRelations(orderId)
      if (data) {
        setSelectedOrder(data)
        setOrders((prev) => prev.map((o) => (o.id === orderId ? data : o)))
      }
    } catch (e) {
      console.error('Error refreshing order', e)
    }
  }

  const handleLogout = async () => {
    await signOut()
    navigate('/admin/login')
  }

  // --- SETTINGS ACTIONS ---
  const handleSaveSettings = async () => {
    if (!settings?.id) return
    setLoading(true)
    try {
      const { data } = await siteSettingsService.updateSettings(
        settings.id,
        settingsForm,
      )
      if (data) {
        siteSettingsService.cacheSettings(data)
      }
      refreshSettings()
      toast({ title: 'Configurações salvas com sucesso!' })
    } catch (e) {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleSettingsUpload = async (file: File, field: string) => {
    setLoading(true)
    const { url } = await siteSettingsService.uploadAsset(file)
    if (url) {
      setSettingsForm({ ...settingsForm, [field]: url })
      toast({ title: 'Upload concluído' })
    }
    setLoading(false)
  }

  // --- PROJECT ACTIONS ---
  const handleSaveProject = async () => {
    if (!editingProject.title) return
    setLoading(true)
    try {
      if (editingProject.id) {
        await projectsService.updateProject(editingProject.id, editingProject)
      } else {
        await projectsService.createProject({
          title: editingProject.title!,
          description: editingProject.description || '',
          client_name: editingProject.client_name || '',
          is_featured: editingProject.is_featured || false,
          status: editingProject.status || 'Em Andamento',
        })
      }
      setIsProjectDialogOpen(false)
      loadData()
      toast({ title: 'Projeto salvo!' })
    } catch (e) {
      toast({ title: 'Erro ao salvar projeto', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProject = async (id: string) => {
    setLoading(true)
    try {
      await projectsService.deleteProject(id)
      loadData()
      toast({ title: 'Projeto removido com sucesso' })
    } catch (e) {
      toast({ title: 'Erro ao remover projeto', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  // --- ORDER ACTIONS ---
  const handleUpdateOrderStatus = async (status: string) => {
    if (!selectedOrder) return

    const { data: updatedOrder } = await ordersService.updateOrderStatus(
      selectedOrder.id,
      status,
      selectedOrder,
    )

    if (updatedOrder) {
      await refreshSelectedOrder(updatedOrder.id)
    }
    toast({ title: 'Status atualizado e cliente notificado' })
  }

  const handleUploadDeliverables = async (isRevision = false) => {
    if (!selectedOrder || deliverableFiles.length === 0) return

    // If it's a revision, force specific category/type
    const categoryToUse = isRevision
      ? 'Projeto Revisado'
      : deliverableCategory === 'Outros'
        ? deliverableCustomTitle
        : deliverableCategory || deliverableCustomTitle

    if (!categoryToUse) {
      toast({ title: 'Defina um título ou categoria', variant: 'destructive' })
      return
    }

    const type = isRevision ? 'revised_project' : undefined

    setIsUploading(true)
    try {
      const uploadPromises = deliverableFiles.map((file) =>
        ordersService.uploadDeliverable(
          selectedOrder.id,
          file,
          categoryToUse,
          type,
        ),
      )

      const results = await Promise.all(uploadPromises)
      const successfulUploads = results.filter((r) => r.data)

      if (successfulUploads.length > 0) {
        await refreshSelectedOrder(selectedOrder.id)

        toast({
          title: `${successfulUploads.length} arquivo(s) enviado(s)!`,
          description: isRevision
            ? 'Revisão enviada e status atualizado.'
            : undefined,
        })
        setDeliverableFiles([])
        setDeliverableCategory('')
        setDeliverableCustomTitle('')

        // Auto-check items if matched
        if (!isRevision) {
          const { data: checklist } = await ordersService.getChecklist(
            selectedOrder.id,
          )
          if (checklist) {
            const targetItem = checklist.find((i) => i.text === categoryToUse)
            if (targetItem && !targetItem.is_done) {
              await ordersService.toggleChecklistItem(targetItem.id, true)
              setChecklistRefreshKey((prev) => prev + 1)
              toast({
                title: 'Checklist atualizado',
                description: `Item "${targetItem.text}" marcado como concluído.`,
              })
            }
          }
        }
      }
    } catch (e) {
      toast({ title: 'Erro ao enviar', variant: 'destructive' })
    } finally {
      setIsUploading(false)
    }
  }

  const renderDeadlineCell = (order: Order) => {
    if (
      !order.status.toLowerCase().includes('recebido') &&
      !order.status.toLowerCase().includes('produção') &&
      !order.status.toLowerCase().includes('enviado')
    ) {
      return <span className="text-muted-foreground">—</span>
    }

    if (order.status.toLowerCase().includes('enviado') || order.delivered_at) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Concluído
        </span>
      )
    }

    if (order.paid_at) {
      const startDate = new Date(order.paid_at)
      const deadlineDays = order.delivery_deadline_days || 7
      const deadlineDate = addDays(startDate, deadlineDays)
      const today = new Date()
      const daysRemaining = differenceInDays(deadlineDate, today)

      if (daysRemaining < 0) {
        return (
          <span className="text-red-600 font-bold">
            Atrasado {Math.abs(daysRemaining)} dias
          </span>
        )
      }

      return (
        <span className="text-orange-600 font-medium">
          {daysRemaining} dias restantes
        </span>
      )
    }

    return <span className="text-muted-foreground">Aguardando</span>
  }

  // Check active revision request
  const hasActiveRevision = (order: Order | null) => {
    return order?.revisions?.some(
      (r) =>
        r.status === 'Pendente' ||
        r.status === 'Requested' ||
        r.status === 'open',
    )
  }

  if (authLoading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    )

  return (
    <div className="min-h-screen bg-gray-50 font-body">
      <header className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={settings?.logo_url || LOGO_URL}
              className="h-10 w-auto"
              alt="Logo"
            />
            <span className="font-bold text-lg text-gray-500 border-l pl-3 hidden sm:inline">
              CMS
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleLogout} size="sm">
              <LogOut className="h-4 w-4 mr-2" /> Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="bg-white border p-1">
            <TabsTrigger
              value="orders"
              className="data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              <Package className="h-4 w-4 mr-2" /> Pedidos
            </TabsTrigger>
            <TabsTrigger
              value="projects"
              className="data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              <ImageIcon className="h-4 w-4 mr-2" /> Projetos
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              <Settings className="h-4 w-4 mr-2" /> Configurações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Gestão de Pedidos</CardTitle>
                <CardDescription>
                  Acompanhe e gerencie entregas dos clientes
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Plano</TableHead>
                      <TableHead>Prazo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => {
                      const revisionRequested = hasActiveRevision(order)
                      return (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono font-bold">
                            {order.code}
                            {revisionRequested && (
                              <Badge
                                variant="destructive"
                                className="ml-2 whitespace-nowrap"
                              >
                                Revisão solicitada
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {order.client_name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {order.client_email}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">
                              Projeto {order.plan_snapshot_name || order.plan}
                            </span>
                          </TableCell>
                          <TableCell>{renderDeadlineCell(order)}</TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs text-white ${
                                order.status.includes('Recebido')
                                  ? 'bg-blue-500'
                                  : order.status.includes('Pagamento')
                                    ? 'bg-yellow-500'
                                    : order.status.includes('Enviado')
                                      ? 'bg-green-600'
                                      : 'bg-gray-500'
                              }`}
                            >
                              {order.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                refreshSelectedOrder(order.id)
                                setDeliverableFiles([])
                                setDeliverableCategory('')
                                setIsOrderDialogOpen(true)
                              }}
                            >
                              Ver Detalhes
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ... Projects Content ... */}
          <TabsContent value="projects">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Portfolio de Projetos</CardTitle>
                  <CardDescription>
                    Gerencie os projetos exibidos no site
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingProject({})
                    setMediaList([])
                    setIsProjectDialogOpen(true)
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" /> Novo Projeto
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Destaque</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>{p.title}</TableCell>
                        <TableCell>
                          {p.is_featured ? '⭐ Sim' : 'Não'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingProject(p)
                                setMediaList(p.media || [])
                                setIsProjectDialogOpen(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Excluir Projeto?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    Cancelar
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteProject(p.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Sim, Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ... Settings Content ... */}
          <TabsContent value="settings">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                <nav className="space-y-1" aria-label="Settings sections">
                  <a
                    href="#palette"
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-white text-gray-900 hover:bg-gray-50 border"
                  >
                    <Palette className="mr-3 h-5 w-5 text-gray-500" /> Cores &
                    Identidade
                  </a>
                  <a
                    href="#carousel"
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-white text-gray-900 hover:bg-gray-50 border"
                  >
                    <LayoutTemplate className="mr-3 h-5 w-5 text-gray-500" />{' '}
                    Hero (Carrossel)
                  </a>
                  <a
                    href="#notifications"
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-white text-gray-900 hover:bg-gray-50 border"
                  >
                    <Mail className="mr-3 h-5 w-5 text-gray-500" /> Notificações
                  </a>
                  <a
                    href="#plans"
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-white text-gray-900 hover:bg-gray-50 border"
                  >
                    <List className="mr-3 h-5 w-5 text-gray-500" /> Planos &
                    Preços
                  </a>
                  <a
                    href="#hero"
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-white text-gray-900 hover:bg-gray-50 border"
                  >
                    <LayoutTemplate className="mr-3 h-5 w-5 text-gray-500" />{' '}
                    Hero (Texto Principal)
                  </a>
                  <a
                    href="#cta"
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-white text-gray-900 hover:bg-gray-50 border"
                  >
                    <LayoutTemplate className="mr-3 h-5 w-5 text-gray-500" />{' '}
                    CTA Section
                  </a>
                </nav>
                <div className="mt-6">
                  <Button
                    onClick={handleSaveSettings}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin mr-2" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Salvar Tudo
                  </Button>
                </div>
              </div>

              <div className="lg:col-span-3 space-y-8">
                {/* Palette Section */}
                <section id="palette" className="scroll-mt-20">
                  <Card>
                    <CardHeader>
                      <CardTitle>Identidade Visual</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Cor Primária (Hex)</Label>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              className="w-12 h-10 p-1"
                              value={settingsForm.primary_color || '#346a32'}
                              onChange={(e) =>
                                setSettingsForm({
                                  ...settingsForm,
                                  primary_color: e.target.value,
                                })
                              }
                            />
                            <Input
                              value={settingsForm.primary_color || ''}
                              onChange={(e) =>
                                setSettingsForm({
                                  ...settingsForm,
                                  primary_color: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Cor de Destaque (Hex)</Label>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              className="w-12 h-10 p-1"
                              value={settingsForm.accent_color || '#ffd700'}
                              onChange={(e) =>
                                setSettingsForm({
                                  ...settingsForm,
                                  accent_color: e.target.value,
                                })
                              }
                            />
                            <Input
                              value={settingsForm.accent_color || ''}
                              onChange={(e) =>
                                setSettingsForm({
                                  ...settingsForm,
                                  accent_color: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Logo do Site</Label>
                        <div className="flex items-center gap-4">
                          {settingsForm.logo_url && (
                            <img
                              src={settingsForm.logo_url}
                              className="h-12 border p-1 rounded"
                            />
                          )}
                          <Input
                            type="file"
                            onChange={(e) =>
                              e.target.files?.[0] &&
                              handleSettingsUpload(
                                e.target.files[0],
                                'logo_url',
                              )
                            }
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </section>

                <section id="carousel" className="scroll-mt-20">
                  <HeroSlidesManager />
                </section>

                <section id="notifications" className="scroll-mt-20">
                  <NotificationSettings />
                </section>

                <section id="plans" className="scroll-mt-20">
                  <PlansManager />
                </section>

                <section id="hero" className="scroll-mt-20">
                  <Card>
                    <CardHeader>
                      <CardTitle>Hero Section (Texto & Overlay)</CardTitle>
                      <CardDescription>
                        Este texto aparecerá sobre as imagens do carrossel.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Imagem de Fundo (Fallback)</Label>
                        <CardDescription>
                          Usada caso não haja slides ativos.
                        </CardDescription>
                        <div className="flex gap-4">
                          {settingsForm.hero_image_url && (
                            <img
                              src={settingsForm.hero_image_url}
                              className="h-20 w-32 object-cover rounded"
                            />
                          )}
                          <Input
                            type="file"
                            onChange={(e) =>
                              e.target.files?.[0] &&
                              handleSettingsUpload(
                                e.target.files[0],
                                'hero_image_url',
                              )
                            }
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Título Principal</Label>
                        <Input
                          value={settingsForm.hero_title || ''}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              hero_title: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Subtítulo</Label>
                        <Textarea
                          value={settingsForm.hero_subtitle || ''}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              hero_subtitle: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Texto do Botão</Label>
                          <Input
                            value={settingsForm.hero_button_text || ''}
                            onChange={(e) =>
                              setSettingsForm({
                                ...settingsForm,
                                hero_button_text: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Link do Botão</Label>
                          <Select
                            value={settingsForm.hero_button_link || '/'}
                            onValueChange={(value) =>
                              setSettingsForm({
                                ...settingsForm,
                                hero_button_link: value,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um link" />
                            </SelectTrigger>
                            <SelectContent>
                              {VALID_ROUTES.map((route) => (
                                <SelectItem
                                  key={route.value}
                                  value={route.value}
                                >
                                  {route.label} ({route.value})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </section>

                <section id="cta" className="scroll-mt-20">
                  <Card>
                    <CardHeader>
                      <CardTitle>CTA Section (Chamada Final)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Imagem de Fundo (Opcional)</Label>
                        <div className="flex gap-4">
                          {settingsForm.cta_background_image_url && (
                            <img
                              src={settingsForm.cta_background_image_url}
                              className="h-20 w-32 object-cover rounded"
                            />
                          )}
                          <Input
                            type="file"
                            onChange={(e) =>
                              e.target.files?.[0] &&
                              handleSettingsUpload(
                                e.target.files[0],
                                'cta_background_image_url',
                              )
                            }
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Título CTA</Label>
                        <Input
                          value={settingsForm.cta_title || ''}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              cta_title: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Texto CTA</Label>
                        <Textarea
                          value={settingsForm.cta_text || ''}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              cta_text: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Texto do Botão</Label>
                          <Input
                            value={settingsForm.cta_button_text || ''}
                            onChange={(e) =>
                              setSettingsForm({
                                ...settingsForm,
                                cta_button_text: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Link do Botão</Label>
                          <Select
                            value={settingsForm.cta_button_link || '/'}
                            onValueChange={(value) =>
                              setSettingsForm({
                                ...settingsForm,
                                cta_button_link: value,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um link" />
                            </SelectTrigger>
                            <SelectContent>
                              {VALID_ROUTES.map((route) => (
                                <SelectItem
                                  key={route.value}
                                  value={route.value}
                                >
                                  {route.label} ({route.value})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </section>
              </div>
            </div>
          </TabsContent>

          {/* Order Modal */}
          <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Gerenciar Pedido</DialogTitle>
              </DialogHeader>
              {selectedOrder && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    {/* Order details content */}
                    <div className="bg-muted p-4 rounded-lg text-sm">
                      <p>
                        <strong>Código:</strong>{' '}
                        <span className="font-mono font-bold">
                          {selectedOrder.code}
                        </span>
                      </p>
                      <p>
                        <strong>Cliente:</strong> {selectedOrder.client_name}
                      </p>
                      <p>
                        <strong>Email:</strong> {selectedOrder.client_email}
                      </p>
                      <p>
                        <strong>Status:</strong> {selectedOrder.status}
                      </p>
                      {selectedOrder.notes && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <strong>Notas:</strong>
                          <p className="whitespace-pre-wrap">
                            {selectedOrder.notes}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Alterar Status</Label>
                      <Select
                        value={selectedOrder.status}
                        onValueChange={handleUpdateOrderStatus}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Aguardando Pagamento">
                            Aguardando Pagamento
                          </SelectItem>
                          <SelectItem value="Recebido">Recebido</SelectItem>
                          <SelectItem value="Em Produção">
                            Em Produção
                          </SelectItem>
                          <SelectItem value="Enviado">Enviado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <DeadlineTracker order={selectedOrder} />

                    <OrderFiles
                      order={selectedOrder}
                      onRefresh={() => refreshSelectedOrder(selectedOrder.id)}
                    />
                  </div>
                  <div className="space-y-6">
                    {/* Revision Alert Section */}
                    {hasActiveRevision(selectedOrder) && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-4 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center gap-2 text-amber-800 font-bold">
                          <AlertTriangle className="h-5 w-5" />
                          Solicitação de Revisão
                        </div>
                        <div className="text-sm text-amber-900 bg-white/50 p-2 rounded">
                          {selectedOrder.revisions
                            ?.filter((r) => r.status === 'Pendente')
                            .map((r, i) => (
                              <p key={i} className="mb-1">
                                "{r.description}"
                              </p>
                            ))}
                        </div>
                        <div className="space-y-2">
                          <Label className="text-amber-900">
                            Enviar Projeto Revisado
                          </Label>
                          <Input
                            type="file"
                            multiple
                            onChange={(e) =>
                              setDeliverableFiles(
                                Array.from(e.target.files || []),
                              )
                            }
                            className="bg-white"
                          />
                          <Button
                            onClick={() => handleUploadDeliverables(true)}
                            disabled={
                              isUploading || deliverableFiles.length === 0
                            }
                            className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                          >
                            {isUploading ? (
                              <Loader2 className="animate-spin mr-2 h-4 w-4" />
                            ) : (
                              <Upload className="mr-2 h-4 w-4" />
                            )}
                            Enviar Revisão e Resolver
                          </Button>
                        </div>
                      </div>
                    )}

                    <OrderChecklist
                      order={selectedOrder}
                      refreshKey={checklistRefreshKey}
                    />

                    {/* Standard Upload section */}
                    <div className="border rounded-lg p-4 bg-white">
                      <h4 className="font-bold mb-4">
                        Enviar Arquivos / Entregáveis
                      </h4>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label>Categoria</Label>
                          <Select
                            value={deliverableCategory}
                            onValueChange={setDeliverableCategory}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo de arquivo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Projeto (PDF/Imagem)">
                                Projeto (PDF/Imagem)
                              </SelectItem>
                              <SelectItem value="Sugestão de plantas ideais">
                                Sugestão de plantas
                              </SelectItem>
                              <SelectItem value="Guia de manutenção básico">
                                Guia de manutenção
                              </SelectItem>
                              <SelectItem value="Lista de compras completa">
                                Lista de compras
                              </SelectItem>
                              <SelectItem value="Outros">
                                Outros / Personalizado
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {deliverableCategory === 'Outros' && (
                          <div className="space-y-2">
                            <Label>Título Personalizado</Label>
                            <Input
                              value={deliverableCustomTitle}
                              onChange={(e) =>
                                setDeliverableCustomTitle(e.target.value)
                              }
                              placeholder="Ex: Rascunho Inicial"
                            />
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label>Arquivo(s)</Label>
                          <Input
                            type="file"
                            multiple
                            onChange={(e) =>
                              setDeliverableFiles(
                                Array.from(e.target.files || []),
                              )
                            }
                          />
                        </div>

                        <Button
                          onClick={() => handleUploadDeliverables(false)}
                          disabled={isUploading}
                          className="w-full"
                        >
                          {isUploading ? (
                            <Loader2 className="animate-spin mr-2 h-4 w-4" />
                          ) : null}
                          Enviar Arquivo(s)
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <Dialog
            open={isProjectDialogOpen}
            onOpenChange={setIsProjectDialogOpen}
          >
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Editar Projeto</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Label>Título</Label>
                <Input
                  value={editingProject.title || ''}
                  onChange={(e) =>
                    setEditingProject({
                      ...editingProject,
                      title: e.target.value,
                    })
                  }
                />
                <Button onClick={handleSaveProject}>Salvar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </Tabs>
      </main>
    </div>
  )
}

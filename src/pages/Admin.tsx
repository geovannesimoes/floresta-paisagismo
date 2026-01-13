import { useState, useEffect } from 'react'
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
  Info,
  CheckCircle,
  X,
  Eye,
} from 'lucide-react'
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { LOGO_URL } from '@/lib/constants'
import {
  projectsService,
  Project,
  ProjectMedia,
} from '@/services/projectsService'
import { siteSettingsService } from '@/services/siteSettingsService'
import { ordersService, Order } from '@/services/ordersService'
import { useSiteSettings } from '@/hooks/use-site-settings'
import {
  PLAN_DETAILS,
  DELIVERABLE_CATEGORIES,
  PlanName,
} from '@/lib/plan-constants'

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

  // Media Upload State
  const [newMediaUrl, setNewMediaUrl] = useState('')
  const [newMediaFile, setNewMediaFile] = useState<File | null>(null)
  const [newMediaType, setNewMediaType] = useState<
    'before' | 'after' | 'gallery'
  >('gallery')
  const [mediaList, setMediaList] = useState<ProjectMedia[]>([])

  // Deliverable Upload State
  const [deliverableFiles, setDeliverableFiles] = useState<File[]>([])
  const [deliverableCategory, setDeliverableCategory] = useState<string>('')
  const [deliverableCustomTitle, setDeliverableCustomTitle] = useState('')

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  useEffect(() => {
    if (settings) {
      setSettingsForm(settings)
    }
  }, [settings])

  const loadData = async () => {
    setLoading(true)
    const [pData, oData] = await Promise.all([
      projectsService.getProjects(),
      ordersService.getOrders(),
    ])
    setProjects(pData.data || [])
    setOrders(oData.data || [])
    setLoading(false)
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
      await siteSettingsService.updateSettings(settings.id, settingsForm)
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

  const handleAddMedia = async () => {
    if (!editingProject.id || (!newMediaUrl && !newMediaFile)) return
    setIsUploading(true)
    try {
      let finalUrl = newMediaUrl
      if (newMediaFile) {
        const { url } = await projectsService.uploadImage(newMediaFile)
        if (url) finalUrl = url
      }
      const { data } = await projectsService.addMedia({
        project_id: editingProject.id,
        url: finalUrl,
        type: newMediaType,
      })
      if (data) {
        setMediaList([...mediaList, data])
      }
      toast({ title: 'Mídia adicionada' })
      setNewMediaFile(null)
      setNewMediaUrl('')
    } catch (e) {
      toast({ title: 'Erro no upload', variant: 'destructive' })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteMedia = async (mediaId: string) => {
    try {
      await projectsService.deleteMedia(mediaId)
      setMediaList(mediaList.filter((m) => m.id !== mediaId))
      toast({ title: 'Imagem removida' })
    } catch (e) {
      toast({ title: 'Erro ao remover imagem', variant: 'destructive' })
    }
  }

  // --- ORDER ACTIONS ---
  const handleUpdateOrderStatus = async (status: string) => {
    if (!selectedOrder) return
    await ordersService.updateOrderStatus(selectedOrder.id, status)
    setSelectedOrder({ ...selectedOrder, status })
    loadData()
    toast({ title: 'Status atualizado' })
  }

  const handleUploadDeliverables = async () => {
    if (!selectedOrder || deliverableFiles.length === 0) return

    const titleToUse =
      deliverableCategory === 'Outros'
        ? deliverableCustomTitle
        : deliverableCategory || deliverableCustomTitle

    if (!titleToUse) {
      toast({ title: 'Defina um título ou categoria', variant: 'destructive' })
      return
    }

    setIsUploading(true)
    try {
      const uploadPromises = deliverableFiles.map((file) =>
        ordersService.uploadDeliverable(selectedOrder.id, file, titleToUse),
      )

      const results = await Promise.all(uploadPromises)

      const successfulUploads = results
        .filter((r) => r.data)
        .map((r) => r.data!)

      if (successfulUploads.length > 0) {
        setSelectedOrder({
          ...selectedOrder,
          deliverables: [
            ...(selectedOrder.deliverables || []),
            ...successfulUploads,
          ],
        })
        toast({ title: `${successfulUploads.length} arquivo(s) enviado(s)!` })
        setDeliverableFiles([])
        setDeliverableCategory('')
        setDeliverableCustomTitle('')
      }
    } catch (e) {
      toast({ title: 'Erro ao enviar', variant: 'destructive' })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteDeliverable = async (id: string) => {
    if (!selectedOrder) return
    try {
      const { error } = await ordersService.deleteDeliverable(id)
      if (error) throw error

      setSelectedOrder({
        ...selectedOrder,
        deliverables: selectedOrder.deliverables?.filter((d) => d.id !== id),
      })
      toast({ title: 'Arquivo removido' })
    } catch (e) {
      toast({ title: 'Erro ao remover arquivo', variant: 'destructive' })
    }
  }

  // --- HELPERS ---
  const getPlanDetails = (planName: string) => {
    return (
      PLAN_DETAILS[planName as PlanName] || {
        price: '?',
        checklist: [],
      }
    )
  }

  const getPlanChecklist = (plan: string) => {
    const details = PLAN_DETAILS[plan as PlanName]
    return details ? details.checklist : DELIVERABLE_CATEGORIES
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
              <Settings className="h-4 w-4 mr-2" /> Site Settings
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
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => {
                      const planInfo = getPlanDetails(order.plan)
                      return (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono font-bold">
                            {order.code}
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
                              Projeto {order.plan}
                            </span>
                          </TableCell>
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
                                setSelectedOrder(order)
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

          {/* ... Projects and Settings Tabs ... */}
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
                                    Esta ação não pode ser desfeita. Isso
                                    excluirá permanentemente o projeto e todas
                                    as imagens associadas.
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
                    href="#hero"
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-white text-gray-900 hover:bg-gray-50 border"
                  >
                    <LayoutTemplate className="mr-3 h-5 w-5 text-gray-500" />{' '}
                    Hero Section
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

                {/* Hero Section */}
                <section id="hero" className="scroll-mt-20">
                  <Card>
                    <CardHeader>
                      <CardTitle>Hero Section (Topo)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Imagem de Fundo</Label>
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

                {/* CTA Section */}
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

          {/* ORDER MODAL */}
          <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Gerenciar Pedido</DialogTitle>
              </DialogHeader>
              {selectedOrder && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="bg-muted p-4 rounded-lg text-sm">
                      <p>
                        <strong>Código:</strong>{' '}
                        <span className="font-mono font-bold">{selectedOrder.code}</span>
                      </p>
                      <p>
                        <strong>Internal ID:</strong>{' '}
                        <span className="font-mono text-xs">{selectedOrder.id}</span>
                      </p>
                      <p>
                        <strong>Cliente:</strong> {selectedOrder.client_name}
                      </p>
                      <p>
                        <strong>Email:</strong> {selectedOrder.client_email}
                      </p>
                      <p>
                        <strong>Plano:</strong> Projeto {selectedOrder.plan} — R${' '}
                        {getPlanDetails(selectedOrder.plan).price}
                      </p>
                      <p>
                        <strong>Imóvel:</strong> {selectedOrder.property_type}
                      </p>
                      <p>
                        <strong>Medidas:</strong>{' '}
                        {selectedOrder.dimensions || 'N/A'}
                      </p>
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
                          <SelectItem value="Em Produção">Em Produção</SelectItem>
                          <SelectItem value="Enviado">Enviado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <h4 className="font-bold mb-2">Fotos Enviadas</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {selectedOrder.photos?.map((p) => (
                          <a
                            key={p.id}
                            href={p.url}
                            target="_blank"
                            className="block aspect-square bg-gray-100 rounded overflow-hidden"
                          >
                            <img
                              src={p.url}
                              className="w-full h-full object-cover"
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold">Checklist de Entrega</h4>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              Itens marcados já possuem arquivos enviados.
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>

                      <div className="space-y-2 mb-6">
                        {getPlanChecklist(selectedOrder.plan).map((item) => {
                          const fileCount =
                            selectedOrder.deliverables?.filter(
                              (d) => d.title === item,
                            ).length || 0
                          const isComplete = fileCount > 0

                          return (
                            <div
                              key={item}
                              className="flex items-center gap-2 text-sm"
                            >
                              {isComplete ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <div className="h-4 w-4 rounded-full border border-gray-300" />
                              )}
                              <span
                                className={
                                  isComplete
                                    ? 'text-green-700 font-medium'
                                    : 'text-gray-600'
                                }
                              >
                                {item} {fileCount > 1 && `(${fileCount})`}
                              </span>
                            </div>
                          )
                        })}
                      </div>

                      <h4 className="font-bold mb-4 border-t pt-4">
                        Upload de Arquivos
                      </h4>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <Label>Categoria</Label>
                          <Select
                            value={deliverableCategory}
                            onValueChange={setDeliverableCategory}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo..." />
                            </SelectTrigger>
                            <SelectContent>
                              {DELIVERABLE_CATEGORIES.map((item) => (
                                <SelectItem key={item} value={item}>
                                  {item}
                                </SelectItem>
                              ))}
                              <SelectItem value="Outros">Outros</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {deliverableCategory === 'Outros' && (
                          <Input
                            placeholder="Título personalizado"
                            value={deliverableCustomTitle}
                            onChange={(e) =>
                              setDeliverableCustomTitle(e.target.value)
                            }
                          />
                        )}

                        <div className="space-y-1">
                          <Label>Arquivos</Label>
                          <Input
                            type="file"
                            multiple
                            onChange={(e) =>
                              setDeliverableFiles(
                                Array.from(e.target.files || []),
                              )
                            }
                          />
                          <p className="text-xs text-muted-foreground">
                            {deliverableFiles.length} arquivo(s) selecionado(s)
                          </p>
                        </div>

                        <Button
                          className="w-full"
                          disabled={isUploading || deliverableFiles.length === 0}
                          onClick={handleUploadDeliverables}
                        >
                          {isUploading ? 'Enviando...' : 'Enviar Arquivos'}
                        </Button>
                      </div>

                      <div className="mt-4 space-y-2">
                        {selectedOrder.deliverables?.map((d) => (
                          <div
                            key={d.id}
                            className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded"
                          >
                            <span className="truncate flex-1 pr-2">
                              {d.title}
                            </span>
                            <div className="flex items-center gap-2">
                              <a
                                href={d.url}
                                target="_blank"
                                className="text-blue-600 hover:underline flex items-center gap-1"
                              >
                                <Eye className="h-3 w-3" /> Ver
                              </a>
                              <button
                                onClick={() => handleDeleteDeliverable(d.id)}
                                className="text-red-500 hover:text-red-700 flex items-center gap-1 ml-2"
                              >
                                <Trash className="h-3 w-3" /> Excluir
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {selectedOrder.revisions &&
                      selectedOrder.revisions.length > 0 && (
                        <div className="border border-red-200 bg-red-50 p-4 rounded-lg">
                          <h4 className="font-bold text-red-800 mb-2">
                            Solicitações de Revisão
                          </h4>
                          {selectedOrder.revisions.map((rev) => (
                            <div
                              key={rev.id}
                              className="text-sm mb-2 pb-2 border-b border-red-100 last:border-0"
                            >
                              <p>{rev.description}</p>
                              <span className="text-xs text-muted-foreground">
                                {new Date(rev.created_at).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* PROJECT MODAL */}
          <Dialog
            open={isProjectDialogOpen}
            onOpenChange={setIsProjectDialogOpen}
          >
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Editar Projeto</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
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
                  </div>
                  <div className="flex items-center gap-2 mt-8">
                    <input
                      type="checkbox"
                      checked={editingProject.is_featured || false}
                      onChange={(e) =>
                        setEditingProject({
                          ...editingProject,
                          is_featured: e.target.checked,
                        })
                      }
                      className="w-4 h-4"
                    />
                    <Label>Destaque na Home?</Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea
                    value={editingProject.description || ''}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        description: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-bold mb-2">Galeria de Imagens</h4>
                  <div className="flex gap-2 items-end mb-4">
                    <div className="flex-1">
                      <Input
                        type="file"
                        onChange={(e) =>
                          setNewMediaFile(e.target.files?.[0] || null)
                        }
                      />
                    </div>
                    <Select
                      value={newMediaType}
                      onValueChange={(v: any) => setNewMediaType(v)}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="before">Antes</SelectItem>
                        <SelectItem value="after">Depois</SelectItem>
                        <SelectItem value="gallery">Galeria</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={handleAddMedia} disabled={isUploading}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {mediaList.map((m) => (
                      <div
                        key={m.id}
                        className="relative aspect-square bg-gray-100 rounded overflow-hidden group"
                      >
                        <img src={m.url} className="w-full h-full object-cover" />
                        <div className="absolute bottom-0 left-0 w-full bg-black/60 text-white text-xs p-1 text-center">
                          {m.type}
                        </div>
                        <button
                          onClick={() => handleDeleteMedia(m.id!)}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <Button
                  onClick={handleSaveProject}
                  disabled={loading}
                  className="w-full mt-4"
                >
                  Salvar Projeto
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    )
}

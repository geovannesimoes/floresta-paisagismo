import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Eye,
  Upload,
  Trash,
  Edit,
  Plus,
  Save,
  LayoutDashboard,
  LogOut,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  DialogTrigger,
} from '@/components/ui/dialog'
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
import { Textarea } from '@/components/ui/textarea'
import { useStore, Order, OrderStatus, FeaturedProject } from '@/lib/store'
import { useToast } from '@/hooks/use-toast'

export default function Admin() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const {
    orders,
    updateOrderStatus,
    updateOrderFinalImages,
    config,
    updateHeroImage,
    addFeaturedProject,
    updateFeaturedProject,
    removeFeaturedProject,
  } = useStore()

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  // CMS State
  const [heroInput, setHeroInput] = useState(config.heroImage)
  const [projectForm, setProjectForm] = useState<Partial<FeaturedProject>>({})
  const [isEditingProject, setIsEditingProject] = useState(false)
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false)

  // Auth Check
  useEffect(() => {
    const isAuth = localStorage.getItem('floresta_admin_auth') === 'true'
    if (!isAuth) {
      navigate('/admin/login')
    }
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('floresta_admin_auth')
    navigate('/admin/login')
    toast({ title: 'Sessão encerrada' })
  }

  // Prevent flash of content
  if (localStorage.getItem('floresta_admin_auth') !== 'true') {
    return null
  }

  const handleStatusChange = (id: string, status: OrderStatus) => {
    updateOrderStatus(id, status)
    if (selectedOrder && selectedOrder.id === id) {
      setSelectedOrder({ ...selectedOrder, status })
    }
    toast({ title: 'Status atualizado!' })
  }

  const handleAdminUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedOrder && e.target.files) {
      const newImages = Array.from(e.target.files).map((file, i) => ({
        title: `Imagem do Projeto ${i + 1}`,
        url: URL.createObjectURL(file),
      }))
      updateOrderFinalImages(selectedOrder.id, newImages)
      // Automatically set status to Enviado if it wasn't already
      if (selectedOrder.status !== 'Enviado') {
        updateOrderStatus(selectedOrder.id, 'Enviado')
        setSelectedOrder({
          ...selectedOrder,
          finalImages: newImages,
          status: 'Enviado',
        })
      } else {
        setSelectedOrder({
          ...selectedOrder,
          finalImages: newImages,
        })
      }
      toast({ title: 'Imagens enviadas e projeto atualizado!' })
    }
  }

  const handleSaveHero = () => {
    updateHeroImage(heroInput)
    toast({ title: 'Imagem da capa atualizada!' })
  }

  const handleEditProject = (project: FeaturedProject) => {
    setProjectForm(project)
    setIsEditingProject(true)
    setIsProjectDialogOpen(true)
  }

  const handleNewProject = () => {
    setProjectForm({})
    setIsEditingProject(false)
    setIsProjectDialogOpen(true)
  }

  const handleSaveProject = () => {
    if (
      !projectForm.title ||
      !projectForm.description ||
      !projectForm.before ||
      !projectForm.after
    ) {
      toast({ title: 'Preencha todos os campos', variant: 'destructive' })
      return
    }

    if (isEditingProject && projectForm.id) {
      updateFeaturedProject(projectForm as FeaturedProject)
      toast({ title: 'Projeto atualizado!' })
    } else {
      addFeaturedProject(projectForm as Omit<FeaturedProject, 'id'>)
      toast({ title: 'Projeto adicionado!' })
    }
    setIsProjectDialogOpen(false)
  }

  const handleDeleteProject = (id: string) => {
    if (confirm('Tem certeza que deseja remover este projeto?')) {
      removeFeaturedProject(id)
      toast({ title: 'Projeto removido' })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-primary" />
            <span className="font-bold text-lg">Floresta Backoffice</span>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" /> Sair
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList>
            <TabsTrigger value="orders">Pedidos</TabsTrigger>
            <TabsTrigger value="cms">Gestão de Conteúdo (CMS)</TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciamento de Pedidos</CardTitle>
                <CardDescription>
                  Acompanhe e atualize o status dos projetos.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Plano</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-xs">
                          {order.id}
                        </TableCell>
                        <TableCell>{order.clientName}</TableCell>
                        <TableCell>{order.plan}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                              order.status === 'Enviado'
                                ? 'bg-green-100 text-green-800'
                                : order.status === 'Em Produção'
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {order.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedOrder(order)}
                              >
                                <Eye className="h-4 w-4 mr-2" /> Detalhes
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>
                                  Detalhes do Pedido #{selectedOrder?.id}
                                </DialogTitle>
                              </DialogHeader>
                              {selectedOrder && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                  <div className="space-y-6">
                                    <div className="bg-gray-50 p-4 rounded-lg border space-y-3">
                                      <h3 className="font-semibold flex items-center gap-2">
                                        Dados do Cliente
                                      </h3>
                                      <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                          <p className="text-muted-foreground">
                                            Nome
                                          </p>
                                          <p className="font-medium">
                                            {selectedOrder.clientName}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-muted-foreground">
                                            WhatsApp
                                          </p>
                                          <p className="font-medium">
                                            {selectedOrder.clientWhatsapp}
                                          </p>
                                        </div>
                                        <div className="col-span-2">
                                          <p className="text-muted-foreground">
                                            Email
                                          </p>
                                          <p className="font-medium">
                                            {selectedOrder.clientEmail}
                                          </p>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="space-y-3">
                                      <h3 className="font-semibold">
                                        Informações do Projeto
                                      </h3>
                                      <div className="space-y-2 text-sm border p-4 rounded-lg">
                                        <p>
                                          <strong>Tipo:</strong>{' '}
                                          {selectedOrder.propertyType}
                                        </p>
                                        <p>
                                          <strong>Medidas:</strong>{' '}
                                          {selectedOrder.dimensions ||
                                            'Não informado'}
                                        </p>
                                        <p>
                                          <strong>Preferências:</strong>{' '}
                                          {selectedOrder.preferences ||
                                            'Nenhuma'}
                                        </p>
                                        <p>
                                          <strong>Observações:</strong>{' '}
                                          {selectedOrder.notes || 'Nenhuma'}
                                        </p>
                                      </div>
                                    </div>

                                    <div>
                                      <h3 className="font-semibold mb-2">
                                        Fotos enviadas pelo cliente
                                      </h3>
                                      <div className="flex gap-2 overflow-x-auto pb-2">
                                        {selectedOrder.photos.map(
                                          (photo, i) => (
                                            <a
                                              key={i}
                                              href={photo}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                            >
                                              <img
                                                src={photo}
                                                alt={`Cliente ${i}`}
                                                className="h-24 w-24 object-cover rounded-md border hover:opacity-80 transition-opacity"
                                              />
                                            </a>
                                          ),
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="space-y-6">
                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 space-y-4">
                                      <h3 className="font-semibold text-blue-900">
                                        Gerenciar Status
                                      </h3>
                                      <div>
                                        <Label>Status Atual</Label>
                                        <Select
                                          value={selectedOrder.status}
                                          onValueChange={(val: OrderStatus) =>
                                            handleStatusChange(
                                              selectedOrder.id,
                                              val,
                                            )
                                          }
                                        >
                                          <SelectTrigger className="bg-white">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="Recebido">
                                              Recebido
                                            </SelectItem>
                                            <SelectItem value="Aguardando Pagamento">
                                              Aguardando Pagamento
                                            </SelectItem>
                                            <SelectItem value="Em Produção">
                                              Em Produção
                                            </SelectItem>
                                            <SelectItem value="Enviado">
                                              Enviado (Finalizado)
                                            </SelectItem>
                                            <SelectItem value="Cancelado">
                                              Cancelado
                                            </SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>

                                    <div className="border-t pt-4">
                                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                                        <Upload className="h-4 w-4" /> Entrega
                                        do Projeto
                                      </h3>
                                      <p className="text-sm text-muted-foreground mb-4">
                                        Faça upload das imagens finais aqui. O
                                        status mudará automaticamente para
                                        "Enviado".
                                      </p>

                                      <div className="flex items-center gap-4">
                                        <Input
                                          type="file"
                                          multiple
                                          accept="image/*"
                                          onChange={handleAdminUpload}
                                        />
                                      </div>

                                      {selectedOrder.finalImages &&
                                        selectedOrder.finalImages.length >
                                          0 && (
                                          <div className="mt-4">
                                            <p className="text-sm font-medium text-green-600 mb-2">
                                              {selectedOrder.finalImages.length}{' '}
                                              imagens disponíveis para o
                                              cliente:
                                            </p>
                                            <div className="grid grid-cols-3 gap-2">
                                              {selectedOrder.finalImages.map(
                                                (img, i) => (
                                                  <img
                                                    key={i}
                                                    src={img.url}
                                                    className="w-full h-20 object-cover rounded border"
                                                  />
                                                ),
                                              )}
                                            </div>
                                          </div>
                                        )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CMS Tab */}
          <TabsContent value="cms" className="space-y-6">
            {/* Hero Image Section */}
            <Card>
              <CardHeader>
                <CardTitle>Imagem da Capa (Home)</CardTitle>
                <CardDescription>
                  A imagem principal que aparece no topo da página inicial.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="w-full md:w-1/2">
                    <img
                      src={heroInput}
                      alt="Hero Preview"
                      className="w-full h-48 object-cover rounded-lg border bg-gray-100"
                      onError={(e) =>
                        (e.currentTarget.src =
                          'https://via.placeholder.com/800x400?text=Erro+na+Imagem')
                      }
                    />
                  </div>
                  <div className="w-full md:w-1/2 space-y-4">
                    <div className="space-y-2">
                      <Label>URL da Imagem</Label>
                      <div className="flex gap-2">
                        <Input
                          value={heroInput}
                          onChange={(e) => setHeroInput(e.target.value)}
                          placeholder="https://..."
                        />
                        <Button onClick={handleSaveHero}>
                          <Save className="h-4 w-4 mr-2" /> Salvar
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Recomendado: 1920x1080px. Use uma URL pública de imagem.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Featured Projects Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Projetos em Destaque</CardTitle>
                  <CardDescription>
                    Gerencie a seção "Antes e Depois" da página inicial.
                  </CardDescription>
                </div>
                <Button onClick={handleNewProject}>
                  <Plus className="h-4 w-4 mr-2" /> Novo Projeto
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Imagem (Depois)</TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {config.featuredProjects.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell>
                          <img
                            src={project.after}
                            className="w-16 h-12 object-cover rounded border"
                            alt={project.title}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {project.title}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-md truncate">
                          {project.description}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEditProject(project)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => handleDeleteProject(project.id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {config.featuredProjects.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center py-8 text-muted-foreground"
                        >
                          Nenhum projeto em destaque. Adicione um para exibir na
                          home.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Dialog for Add/Edit Project */}
      <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditingProject ? 'Editar Projeto' : 'Novo Projeto em Destaque'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Título do Projeto</Label>
              <Input
                value={projectForm.title || ''}
                onChange={(e) =>
                  setProjectForm({ ...projectForm, title: e.target.value })
                }
                placeholder="Ex: Jardim Tropical"
              />
            </div>

            <div className="space-y-2">
              <Label>Breve Descrição</Label>
              <Textarea
                value={projectForm.description || ''}
                onChange={(e) =>
                  setProjectForm({
                    ...projectForm,
                    description: e.target.value,
                  })
                }
                placeholder="Descreva a transformação..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Foto "Antes" (URL)</Label>
                <Input
                  value={projectForm.before || ''}
                  onChange={(e) =>
                    setProjectForm({ ...projectForm, before: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label>Foto "Depois" (URL)</Label>
                <Input
                  value={projectForm.after || ''}
                  onChange={(e) =>
                    setProjectForm({ ...projectForm, after: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
            </div>

            {(projectForm.before || projectForm.after) && (
              <div className="grid grid-cols-2 gap-4 mt-2">
                {projectForm.before && (
                  <img
                    src={projectForm.before}
                    className="w-full h-24 object-cover rounded bg-gray-100"
                  />
                )}
                {projectForm.after && (
                  <img
                    src={projectForm.after}
                    className="w-full h-24 object-cover rounded bg-gray-100"
                  />
                )}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsProjectDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveProject}>Salvar Projeto</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

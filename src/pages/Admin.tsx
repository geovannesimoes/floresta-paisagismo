import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  LogOut,
  Plus,
  Trash,
  Edit,
  Image as ImageIcon,
  Save,
  X,
  Loader2,
  Leaf,
  Hammer,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { LOGO_URL } from '@/lib/constants'
import {
  projectsService,
  Project,
  ProjectMedia,
} from '@/services/projectsService'

export default function Admin() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { signOut, user, loading: authLoading } = useAuth()

  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Partial<Project>>({})
  const [mediaList, setMediaList] = useState<ProjectMedia[]>([])

  // Media Form State
  const [newMediaUrl, setNewMediaUrl] = useState('')
  const [newMediaType, setNewMediaType] = useState<
    'before' | 'after' | 'gallery'
  >('gallery')
  const [newMediaPlants, setNewMediaPlants] = useState('')
  const [newMediaMaterials, setNewMediaMaterials] = useState('')

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    const { data, error } = await projectsService.getProjects()
    if (error) {
      toast({ title: 'Erro ao carregar projetos', variant: 'destructive' })
    } else {
      setProjects(data || [])
    }
    setLoading(false)
  }, [toast])

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/admin/login')
    }
  }, [user, authLoading, navigate])

  useEffect(() => {
    if (user) {
      fetchProjects()
    }
  }, [user, fetchProjects])

  const handleLogout = async () => {
    await signOut()
    navigate('/admin/login')
  }

  const handleSaveProject = async () => {
    if (!editingProject.title) {
      toast({ title: 'O título é obrigatório', variant: 'destructive' })
      return
    }

    try {
      let savedProject: Project

      if (editingProject.id) {
        // Update
        const { data, error } = await projectsService.updateProject(
          editingProject.id,
          editingProject,
        )
        if (error) throw error
        savedProject = data
        toast({ title: 'Projeto atualizado com sucesso' })
      } else {
        // Create
        const { data, error } = await projectsService.createProject({
          title: editingProject.title!,
          description: editingProject.description || '',
          client_name: editingProject.client_name || '',
          is_featured: editingProject.is_featured || false,
          status: editingProject.status || 'Em Andamento',
        })
        if (error) throw error
        savedProject = data
        toast({ title: 'Projeto criado com sucesso' })
      }

      setEditingProject(savedProject)
      fetchProjects()
      // Keep dialog open to add media
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar projeto',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const handleDeleteProject = async (id: string) => {
    if (
      !confirm('Tem certeza? Isso apagará todas as fotos e dados do projeto.')
    )
      return

    const { error } = await projectsService.deleteProject(id)
    if (error) {
      toast({ title: 'Erro ao excluir', variant: 'destructive' })
    } else {
      toast({ title: 'Projeto excluído' })
      fetchProjects()
    }
  }

  const handleAddMedia = async () => {
    if (!editingProject.id || !newMediaUrl) return

    try {
      const { data, error } = await projectsService.addMedia({
        project_id: editingProject.id,
        url: newMediaUrl,
        type: newMediaType,
        plants_used: newMediaPlants,
        materials_used: newMediaMaterials,
      })
      if (error) throw error

      // Update local state
      const updatedMedia = [...mediaList, data]
      setMediaList(updatedMedia)

      // Update project list state to reflect changes immediately
      const updatedProjects = projects.map((p) =>
        p.id === editingProject.id ? { ...p, media: updatedMedia } : p,
      )
      setProjects(updatedProjects)

      // Reset form
      setNewMediaUrl('')
      setNewMediaPlants('')
      setNewMediaMaterials('')
      toast({ title: 'Mídia adicionada' })
    } catch (error: any) {
      toast({
        title: 'Erro ao adicionar mídia',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const handleDeleteMedia = async (id: string) => {
    try {
      const { error } = await projectsService.deleteMedia(id)
      if (error) throw error

      const updatedMedia = mediaList.filter((m) => m.id !== id)
      setMediaList(updatedMedia)

      const updatedProjects = projects.map((p) =>
        p.id === editingProject.id ? { ...p, media: updatedMedia } : p,
      )
      setProjects(updatedProjects)
    } catch (error: any) {
      toast({ title: 'Erro ao remover mídia', variant: 'destructive' })
    }
  }

  const openProjectDialog = (project?: Project) => {
    if (project) {
      setEditingProject(project)
      setMediaList(project.media || [])
    } else {
      setEditingProject({ is_featured: false, status: 'Em Andamento' })
      setMediaList([])
    }
    setIsProjectDialogOpen(true)
  }

  if (authLoading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    )

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              title="Ir para o site"
            >
              <img src={LOGO_URL} alt="Logo" className="h-10 w-auto" />
              <span className="font-bold text-lg text-gray-500 border-l pl-3">
                CMS & Gestão
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline-block">
              {user?.email}
            </span>
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" /> Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Projetos</h1>
          <Button onClick={() => openProjectDialog()}>
            <Plus className="h-4 w-4 mr-2" /> Novo Projeto
          </Button>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="featured">Home (Destaques)</TabsTrigger>
            <TabsTrigger value="clients">Clientes</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Destaque</TableHead>
                      <TableHead>Mídia</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                        </TableCell>
                      </TableRow>
                    ) : projects.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-8 text-muted-foreground"
                        >
                          Nenhum projeto encontrado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      projects.map((project) => (
                        <TableRow key={project.id}>
                          <TableCell className="font-medium">
                            {project.title}
                          </TableCell>
                          <TableCell>{project.client_name || '-'}</TableCell>
                          <TableCell>
                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                              {project.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            {project.is_featured ? '⭐ Sim' : 'Não'}
                          </TableCell>
                          <TableCell>
                            {project.media?.length || 0} fotos
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openProjectDialog(project)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => handleDeleteProject(project.id)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="featured">
            <div className="text-sm text-muted-foreground mb-4">
              Projetos marcados como "Destaque" aparecem na página inicial.
            </div>
            {projects.filter((p) => p.is_featured).length === 0 && (
              <div className="text-center py-10 bg-white rounded-lg border">
                Nenhum projeto em destaque. Edite um projeto e marque "Destaque
                na Home".
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Dialog
          open={isProjectDialogOpen}
          onOpenChange={setIsProjectDialogOpen}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProject.id ? 'Editar Projeto' : 'Novo Projeto'}
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
              {/* Left Column: Project Details */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Título do Projeto</Label>
                  <Input
                    value={editingProject.title || ''}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        title: e.target.value,
                      })
                    }
                    placeholder="Ex: Jardim Tropical da Família Silva"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Nome do Cliente (Opcional)</Label>
                  <Input
                    value={editingProject.client_name || ''}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        client_name: e.target.value,
                      })
                    }
                    placeholder="Ex: João da Silva"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={editingProject.status}
                      onValueChange={(val) =>
                        setEditingProject({ ...editingProject, status: val })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Em Andamento">
                          Em Andamento
                        </SelectItem>
                        <SelectItem value="Concluído">Concluído</SelectItem>
                        <SelectItem value="Cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end pb-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingProject.is_featured || false}
                        onChange={(e) =>
                          setEditingProject({
                            ...editingProject,
                            is_featured: e.target.checked,
                          })
                        }
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm font-medium">
                        Destaque na Home
                      </span>
                    </label>
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
                    placeholder="Detalhes sobre o projeto..."
                    rows={5}
                  />
                </div>

                <Button onClick={handleSaveProject} className="w-full">
                  <Save className="h-4 w-4 mr-2" /> Salvar Detalhes
                </Button>
              </div>

              {/* Right Column: Media Management */}
              <div className="space-y-4 border-l pl-0 md:pl-8">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" /> Mídia & Detalhes
                  </h3>
                  {!editingProject.id && (
                    <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                      Salve o projeto primeiro
                    </span>
                  )}
                </div>

                {editingProject.id ? (
                  <div className="space-y-4">
                    <div className="bg-muted/30 p-4 rounded-lg space-y-3 border">
                      <div className="space-y-2">
                        <Label>URL da Imagem</Label>
                        <Input
                          value={newMediaUrl}
                          onChange={(e) => setNewMediaUrl(e.target.value)}
                          placeholder="https://..."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Tipo</Label>
                          <Select
                            value={newMediaType}
                            onValueChange={(val: any) => setNewMediaType(val)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="gallery">Galeria</SelectItem>
                              <SelectItem value="before">Antes</SelectItem>
                              <SelectItem value="after">Depois</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Plantas (Opcional)</Label>
                          <Input
                            value={newMediaPlants}
                            onChange={(e) => setNewMediaPlants(e.target.value)}
                            placeholder="Ex: Palmeiras, Bromélias"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Materiais (Opcional)</Label>
                        <Input
                          value={newMediaMaterials}
                          onChange={(e) => setNewMediaMaterials(e.target.value)}
                          placeholder="Ex: Madeira Cumaru, Pedra Seixo"
                        />
                      </div>

                      <Button
                        onClick={handleAddMedia}
                        size="sm"
                        variant="secondary"
                        className="w-full"
                      >
                        Adicionar Foto
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2">
                      {mediaList.map((media) => (
                        <div
                          key={media.id}
                          className="relative group border rounded-lg overflow-hidden bg-white shadow-sm"
                        >
                          <img
                            src={media.url}
                            className="w-full h-32 object-cover"
                          />
                          <div className="p-2 text-xs">
                            <div className="font-bold uppercase text-[10px] text-primary mb-1">
                              {media.type}
                            </div>
                            {(media.plants_used || media.materials_used) && (
                              <div className="flex gap-1 flex-wrap">
                                {media.plants_used && (
                                  <Leaf className="h-3 w-3 text-green-600" />
                                )}
                                {media.materials_used && (
                                  <Hammer className="h-3 w-3 text-stone-600" />
                                )}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() =>
                              media.id && handleDeleteMedia(media.id)
                            }
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg border border-dashed text-muted-foreground text-sm">
                    Preencha os dados e salve para adicionar fotos.
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}

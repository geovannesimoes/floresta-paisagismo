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
  Upload,
  Settings,
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { LOGO_URL } from '@/lib/constants'
import {
  projectsService,
  Project,
  ProjectMedia,
} from '@/services/projectsService'
import { siteSettingsService } from '@/services/siteSettingsService'
import { useSiteSettings } from '@/hooks/use-site-settings'

export default function Admin() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { signOut, user, loading: authLoading } = useAuth()
  const { settings, refreshSettings } = useSiteSettings()

  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Partial<Project>>({})
  const [mediaList, setMediaList] = useState<ProjectMedia[]>([])

  // Media Form State
  const [newMediaUrl, setNewMediaUrl] = useState('')
  const [newMediaFile, setNewMediaFile] = useState<File | null>(null)
  const [newMediaType, setNewMediaType] = useState<
    'before' | 'after' | 'gallery'
  >('gallery')
  const [newMediaPlants, setNewMediaPlants] = useState('')
  const [newMediaMaterials, setNewMediaMaterials] = useState('')
  const [newMediaDescription, setNewMediaDescription] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  // Settings State
  const [isSettingsUploading, setIsSettingsUploading] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [heroFile, setHeroFile] = useState<File | null>(null)

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
    if (!authLoading && !user) navigate('/admin/login')
  }, [user, authLoading, navigate])

  useEffect(() => {
    if (user) fetchProjects()
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
        const { data, error } = await projectsService.updateProject(
          editingProject.id,
          editingProject,
        )
        if (error) throw error
        savedProject = data
        toast({ title: 'Projeto atualizado com sucesso' })
      } else {
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
    if (!editingProject.id) return
    if (!newMediaUrl && !newMediaFile) {
      toast({
        title: 'Selecione uma imagem',
        description: 'Faça upload de um arquivo ou insira uma URL.',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsUploading(true)
      let finalUrl = newMediaUrl

      if (newMediaFile) {
        const { url, error } = await projectsService.uploadImage(newMediaFile)
        if (error) throw error
        if (url) finalUrl = url
      }

      const { data, error } = await projectsService.addMedia({
        project_id: editingProject.id,
        url: finalUrl,
        type: newMediaType,
        description: newMediaDescription,
        plants_used: newMediaPlants,
        materials_used: newMediaMaterials,
      })
      if (error) throw error

      setMediaList([...mediaList, data])
      setProjects(
        projects.map((p) =>
          p.id === editingProject.id
            ? { ...p, media: [...(p.media || []), data] }
            : p,
        ),
      )

      setNewMediaUrl('')
      setNewMediaFile(null)
      setNewMediaPlants('')
      setNewMediaMaterials('')
      setNewMediaDescription('')
      toast({ title: 'Mídia adicionada' })
    } catch (error: any) {
      toast({
        title: 'Erro ao adicionar mídia',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteMedia = async (id: string) => {
    try {
      const { error } = await projectsService.deleteMedia(id)
      if (error) throw error
      const updatedMedia = mediaList.filter((m) => m.id !== id)
      setMediaList(updatedMedia)
      setProjects(
        projects.map((p) =>
          p.id === editingProject.id ? { ...p, media: updatedMedia } : p,
        ),
      )
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
    setNewMediaFile(null)
    setNewMediaUrl('')
  }

  const handleUpdateSettings = async (type: 'logo' | 'hero') => {
    const file = type === 'logo' ? logoFile : heroFile
    if (!file || !settings?.id) return

    setIsSettingsUploading(true)
    try {
      const { url, error } = await siteSettingsService.uploadAsset(file)
      if (error || !url) throw error || new Error('Upload failed')

      const updates =
        type === 'logo' ? { logo_url: url } : { hero_image_url: url }
      const { error: updateError } = await siteSettingsService.updateSettings(
        settings.id,
        updates,
      )

      if (updateError) throw updateError

      toast({
        title: type === 'logo' ? 'Logo atualizado' : 'Imagem Hero atualizada',
      })
      if (type === 'logo') setLogoFile(null)
      else setHeroFile(null)

      refreshSettings()
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setIsSettingsUploading(false)
    }
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
          <Link
            to="/"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img
              src={settings?.logo_url || LOGO_URL}
              alt="Logo"
              className="h-10 w-auto"
            />
            <span className="font-bold text-lg text-gray-500 border-l pl-3">
              CMS & Gestão
            </span>
          </Link>
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
          <h1 className="text-2xl font-bold">Painel Administrativo</h1>
          <Button onClick={() => openProjectDialog()}>
            <Plus className="h-4 w-4 mr-2" /> Novo Projeto
          </Button>
        </div>

        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="bg-white border">
            <TabsTrigger value="projects">Projetos</TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Configurações do Site
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Destaque</TableHead>
                      <TableHead>Mídia</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                        </TableCell>
                      </TableRow>
                    ) : projects.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          Nenhum projeto encontrado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      projects.map((project) => (
                        <TableRow key={project.id}>
                          <TableCell className="font-medium">
                            {project.title}
                          </TableCell>
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

          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Logo da Empresa</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-6 bg-gray-100 rounded-lg flex items-center justify-center">
                    <img
                      src={settings?.logo_url || LOGO_URL}
                      alt="Logo atual"
                      className="max-h-20 w-auto"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Novo Logo</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/png, image/jpeg, image/svg+xml"
                        onChange={(e) =>
                          setLogoFile(e.target.files?.[0] || null)
                        }
                      />
                      <Button
                        onClick={() => handleUpdateSettings('logo')}
                        disabled={!logoFile || isSettingsUploading}
                      >
                        {isSettingsUploading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Imagem de Capa (Hero)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-video w-full bg-gray-100 rounded-lg overflow-hidden relative">
                    <img
                      src={
                        settings?.hero_image_url ||
                        'https://img.usecurling.com/p/1920/1080?q=garden&dpr=2'
                      }
                      alt="Hero atual"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nova Imagem</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={(e) =>
                          setHeroFile(e.target.files?.[0] || null)
                        }
                      />
                      <Button
                        onClick={() => handleUpdateSettings('hero')}
                        disabled={!heroFile || isSettingsUploading}
                      >
                        {isSettingsUploading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
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
                    placeholder="Ex: Jardim Tropical"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Cliente (Opcional)</Label>
                  <Input
                    value={editingProject.client_name || ''}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        client_name: e.target.value,
                      })
                    }
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
                        <SelectValue />
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
                        className="h-4 w-4 rounded border-gray-300 text-primary"
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
                    rows={5}
                  />
                </div>

                <Button onClick={handleSaveProject} className="w-full">
                  <Save className="h-4 w-4 mr-2" /> Salvar Detalhes
                </Button>
              </div>

              <div className="space-y-4 border-l pl-0 md:pl-8">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" /> Mídia & Detalhes
                </h3>

                {editingProject.id ? (
                  <div className="space-y-4">
                    <div className="bg-muted/30 p-4 rounded-lg space-y-3 border">
                      <Tabs defaultValue="upload" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="upload">Upload</TabsTrigger>
                          <TabsTrigger value="url">Link</TabsTrigger>
                        </TabsList>
                        <TabsContent value="upload" className="space-y-2">
                          <Label>Selecione o arquivo</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="file"
                              accept="image/png, image/jpeg, image/webp"
                              onChange={(e) =>
                                setNewMediaFile(e.target.files?.[0] || null)
                              }
                              className="cursor-pointer"
                            />
                            {newMediaFile && (
                              <span className="text-xs text-green-600 font-bold whitespace-nowrap">
                                Selecionado
                              </span>
                            )}
                          </div>
                        </TabsContent>
                        <TabsContent value="url" className="space-y-2">
                          <Label>URL da Imagem</Label>
                          <Input
                            value={newMediaUrl}
                            onChange={(e) => setNewMediaUrl(e.target.value)}
                            placeholder="https://..."
                          />
                        </TabsContent>
                      </Tabs>

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
                          <Label>Descrição</Label>
                          <Input
                            value={newMediaDescription}
                            onChange={(e) =>
                              setNewMediaDescription(e.target.value)
                            }
                            placeholder="Legenda da foto"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Plantas</Label>
                          <Input
                            value={newMediaPlants}
                            onChange={(e) => setNewMediaPlants(e.target.value)}
                            placeholder="Ex: Palmeiras"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Materiais</Label>
                          <Input
                            value={newMediaMaterials}
                            onChange={(e) =>
                              setNewMediaMaterials(e.target.value)
                            }
                            placeholder="Ex: Madeira"
                          />
                        </div>
                      </div>

                      <Button
                        onClick={handleAddMedia}
                        size="sm"
                        variant="secondary"
                        className="w-full"
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Upload className="h-4 w-4 mr-2" />
                        )}
                        {isUploading ? 'Enviando...' : 'Adicionar Foto'}
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
                            alt={media.description || 'Project media'}
                          />
                          <div className="p-2 text-xs">
                            <div className="font-bold uppercase text-[10px] text-primary mb-1">
                              {media.type}
                            </div>
                            <div className="truncate text-muted-foreground">
                              {media.description}
                            </div>
                            {(media.plants_used || media.materials_used) && (
                              <div className="flex gap-1 flex-wrap mt-1">
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
                    Salve o projeto para adicionar fotos.
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

import { useState, useEffect } from 'react'
import { Plus, Trash, ArrowUp, ArrowDown, Loader2, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
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
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { heroSlidesService, HeroSlide } from '@/services/heroSlidesService'

export function HeroSlidesManager() {
  const { toast } = useToast()
  const [slides, setSlides] = useState<HeroSlide[]>([])
  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSlide, setEditingSlide] = useState<Partial<HeroSlide>>({})
  const [newImageFile, setNewImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    loadSlides()
  }, [])

  const loadSlides = async () => {
    setLoading(true)
    const { data } = await heroSlidesService.getSlides(false)
    if (data) setSlides(data)
    setLoading(false)
  }

  const handleCreate = () => {
    setEditingSlide({
      is_active: true,
      sort_order: slides.length,
      image_url: '',
    })
    setNewImageFile(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (slide: HeroSlide) => {
    setEditingSlide(slide)
    setNewImageFile(null)
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      setUploading(true)
      let finalImageUrl = editingSlide.image_url

      if (newImageFile) {
        const { url, error } = await heroSlidesService.uploadImage(newImageFile)
        if (error || !url) throw new Error('Falha no upload da imagem')
        finalImageUrl = url
      }

      if (!finalImageUrl) {
        toast({ title: 'Imagem é obrigatória', variant: 'destructive' })
        setUploading(false)
        return
      }

      const slideData = { ...editingSlide, image_url: finalImageUrl }
      // Explicitly ignoring text fields as per requirement

      if (slideData.id) {
        await heroSlidesService.updateSlide(slideData.id, slideData)
      } else {
        await heroSlidesService.createSlide(slideData)
      }

      setIsDialogOpen(false)
      loadSlides()
      toast({ title: 'Slide salvo com sucesso!' })
    } catch (e: any) {
      toast({
        title: 'Erro ao salvar',
        description: e.message,
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este slide?')) return

    setLoading(true)
    await heroSlidesService.deleteSlide(id)
    loadSlides()
  }

  const moveSlide = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === slides.length - 1) return

    const newSlides = [...slides]
    const targetIndex = direction === 'up' ? index - 1 : index + 1

    const itemA = newSlides[index]
    const itemB = newSlides[targetIndex]

    setLoading(true)
    await Promise.all([
      heroSlidesService.updateSlide(itemA.id, { sort_order: targetIndex }),
      heroSlidesService.updateSlide(itemB.id, { sort_order: index }),
    ])

    loadSlides()
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Hero (Imagens de Fundo)</CardTitle>
          <CardDescription>
            Gerencie as imagens que aparecem no carrossel de fundo. O texto é
            fixo e configurado na seção "Hero (Texto Principal)".
          </CardDescription>
        </div>
        <Button onClick={handleCreate} size="sm">
          <Plus className="h-4 w-4 mr-2" /> Nova Imagem
        </Button>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="text-center py-4">
            <Loader2 className="animate-spin inline" />
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Imagem</TableHead>
              <TableHead>Ativo</TableHead>
              <TableHead>Ordem</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {slides.map((slide, idx) => (
              <TableRow key={slide.id}>
                <TableCell>
                  <img
                    src={slide.image_url}
                    alt="Slide"
                    className="h-12 w-20 object-cover rounded bg-gray-100"
                  />
                </TableCell>
                <TableCell>
                  <Switch checked={slide.is_active} disabled />
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => moveSlide(idx, 'up')}
                      disabled={idx === 0}
                    >
                      <ArrowUp className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => moveSlide(idx, 'down')}
                      disabled={idx === slides.length - 1}
                    >
                      <ArrowDown className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(slide)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500"
                    onClick={() => handleDelete(slide.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {slides.length === 0 && !loading && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-muted-foreground"
                >
                  Nenhuma imagem configurada. Será usada a imagem padrão.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingSlide.id ? 'Editar Imagem' : 'Nova Imagem'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Imagem de Fundo</Label>
                <div className="flex gap-4 items-start">
                  {(editingSlide.image_url || newImageFile) && (
                    <div className="w-32 h-20 bg-gray-100 rounded overflow-hidden shrink-0 border">
                      {newImageFile ? (
                        <img
                          src={URL.createObjectURL(newImageFile)}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={editingSlide.image_url}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  )}
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setNewImageFile(e.target.files?.[0] || null)
                      }
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Recomendado: 1920x1080px (Horizontal)
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Switch
                  checked={editingSlide.is_active}
                  onCheckedChange={(c) =>
                    setEditingSlide({ ...editingSlide, is_active: c })
                  }
                />
                <Label>Ativo (Visível no site)</Label>
              </div>

              <Button
                onClick={handleSave}
                className="w-full mt-4"
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{' '}
                    Salvando...
                  </>
                ) : (
                  'Salvar Imagem'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

import {
  FileText,
  Image as ImageIcon,
  Download,
  Trash2,
  Loader2,
} from 'lucide-react'
import { useState } from 'react'
import { format } from 'date-fns'
import { Order, ordersService } from '@/services/ordersService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
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
import { useToast } from '@/hooks/use-toast'

interface OrderFilesProps {
  order: Order
  onRefresh?: () => void
}

export function OrderFiles({ order, onRefresh }: OrderFilesProps) {
  const { toast } = useToast()
  const photos = order.photos || []
  const deliverables = order.deliverables || []
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Sort deliverables by created_at descending (newest first)
  const sortedDeliverables = [...deliverables].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const { error } = await ordersService.deleteDeliverable(id)
      if (error) throw error

      toast({ title: 'Arquivo removido com sucesso' })
      if (onRefresh) onRefresh()
    } catch (e) {
      toast({ title: 'Erro ao remover arquivo', variant: 'destructive' })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Customer Photos Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
            Arquivos enviados pelo cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          {photos.length > 0 ? (
            <ScrollArea className="h-full max-h-[200px] w-full rounded-md border p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {photos.map((photo: any) => (
                  <div
                    key={photo.id}
                    className="relative group aspect-square rounded-md overflow-hidden border bg-muted"
                  >
                    <img
                      src={photo.url}
                      alt="Upload do cliente"
                      className="object-cover w-full h-full transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        asChild
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8"
                      >
                        <a
                          href={photo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-sm text-muted-foreground italic text-center py-4 border rounded-md border-dashed">
              Nenhuma foto enviada pelo cliente.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admin Deliverables History Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            Entregáveis enviados (histórico)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedDeliverables.length > 0 ? (
            <ScrollArea className="h-full max-h-[250px] w-full rounded-md border">
              <div className="divide-y">
                {sortedDeliverables.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start gap-3 overflow-hidden">
                      <div className="mt-1 bg-primary/10 p-2 rounded text-primary shrink-0">
                        {item.type === 'image' ? (
                          <ImageIcon className="h-4 w-4" />
                        ) : (
                          <FileText className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p
                          className="font-medium text-sm truncate"
                          title={item.title}
                        >
                          {item.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(
                            new Date(item.created_at),
                            "dd/MM/yyyy 'às' HH:mm",
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        asChild
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Baixar/Visualizar"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            disabled={deletingId === item.id}
                          >
                            {deletingId === item.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Excluir arquivo?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Isso removerá permanentemente o arquivo "
                              {item.title}". O cliente não poderá mais
                              acessá-lo.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(item.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-sm text-muted-foreground italic text-center py-4 border rounded-md border-dashed">
              Nenhum entregável enviado ainda.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

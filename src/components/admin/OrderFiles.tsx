import {
  FileText,
  Image as ImageIcon,
  Download,
  ExternalLink,
} from 'lucide-react'
import { format } from 'date-fns'
import { Order } from '@/services/ordersService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

interface OrderFilesProps {
  order: Order
}

export function OrderFiles({ order }: OrderFilesProps) {
  const photos = order.photos || []
  const deliverables = order.deliverables || []

  // Sort deliverables by created_at descending (newest first)
  const sortedDeliverables = [...deliverables].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )

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
                          <ExternalLink className="h-4 w-4" />
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
                    <Button
                      asChild
                      size="sm"
                      variant="ghost"
                      className="shrink-0 ml-2"
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

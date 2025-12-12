import { useState } from 'react'
import { Eye, Edit, Save, Upload } from 'lucide-react'
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
import { useStore, Order, OrderStatus } from '@/lib/store'
import { useToast } from '@/hooks/use-toast'

export default function Admin() {
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const { orders, updateOrderStatus, updateOrderFinalImages } = useStore()
  const { toast } = useToast()

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === 'admin123') {
      setIsAuthenticated(true)
    } else {
      toast({ title: 'Senha incorreta', variant: 'destructive' })
    }
  }

  const handleStatusChange = (id: string, status: OrderStatus) => {
    updateOrderStatus(id, status)
    toast({ title: 'Status atualizado!' })
  }

  // Simplified upload simulation for admin
  const handleAdminUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedOrder && e.target.files) {
      // In a real app, upload to storage. Here, just create fake URLs
      const newImages = Array.from(e.target.files).map((file, i) => ({
        title: `Imagem do Projeto ${i + 1}`,
        url: URL.createObjectURL(file), // Local preview url
      }))
      updateOrderFinalImages(selectedOrder.id, newImages)
      updateOrderStatus(selectedOrder.id, 'Enviado')
      toast({ title: 'Imagens enviadas e pedido finalizado!' })
      // Update local state to reflect changes in modal
      setSelectedOrder({
        ...selectedOrder,
        finalImages: newImages,
        status: 'Enviado',
      })
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <form
          onSubmit={handleLogin}
          className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm"
        >
          <h1 className="text-2xl font-bold mb-6 text-center">
            Admin Backoffice
          </h1>
          <Input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4"
          />
          <Button type="submit" className="w-full">
            Entrar
          </Button>
        </form>
      </div>
    )
  }

  return (
    <div className="p-8 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Gerenciamento de Pedidos</h1>
          <Button variant="outline" onClick={() => setIsAuthenticated(false)}>
            Sair
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
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
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.clientName}</TableCell>
                  <TableCell>{order.plan}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
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
                      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>
                            Detalhes do Pedido #{selectedOrder?.id}
                          </DialogTitle>
                        </DialogHeader>
                        {selectedOrder && (
                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-muted-foreground">
                                  Cliente
                                </Label>
                                <p className="font-medium">
                                  {selectedOrder.clientName}
                                </p>
                                <p className="text-sm">
                                  {selectedOrder.clientEmail}
                                </p>
                                <p className="text-sm">
                                  {selectedOrder.clientWhatsapp}
                                </p>
                              </div>
                              <div>
                                <Label className="text-muted-foreground">
                                  Plano
                                </Label>
                                <p className="font-medium">
                                  {selectedOrder.plan}
                                </p>
                                <Label className="text-muted-foreground mt-2">
                                  Pagamento ID
                                </Label>
                                <p className="text-sm font-mono">
                                  {selectedOrder.paymentId || 'Pendente'}
                                </p>
                              </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-md space-y-2">
                              <p>
                                <strong>Tipo:</strong>{' '}
                                {selectedOrder.propertyType}
                              </p>
                              <p>
                                <strong>Medidas:</strong>{' '}
                                {selectedOrder.dimensions || '-'}
                              </p>
                              <p>
                                <strong>Preferências:</strong>{' '}
                                {selectedOrder.preferences || '-'}
                              </p>
                              <p>
                                <strong>Obs:</strong>{' '}
                                {selectedOrder.notes || '-'}
                              </p>
                            </div>

                            <div>
                              <Label>Status do Pedido</Label>
                              <Select
                                defaultValue={selectedOrder.status}
                                onValueChange={(val: OrderStatus) =>
                                  handleStatusChange(selectedOrder.id, val)
                                }
                              >
                                <SelectTrigger>
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
                                    Enviado
                                  </SelectItem>
                                  <SelectItem value="Cancelado">
                                    Cancelado
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label>Fotos do Cliente</Label>
                              <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
                                {selectedOrder.photos.map((photo, i) => (
                                  <img
                                    key={i}
                                    src={photo}
                                    className="h-24 w-24 object-cover rounded-md border"
                                  />
                                ))}
                              </div>
                            </div>

                            <div className="border-t pt-4">
                              <Label>Upload do Projeto Final</Label>
                              <div className="mt-2 flex items-center gap-4">
                                <Input
                                  type="file"
                                  multiple
                                  onChange={handleAdminUpload}
                                />
                              </div>
                              {selectedOrder.finalImages && (
                                <div className="mt-2">
                                  <p className="text-sm text-green-600 font-medium">
                                    {selectedOrder.finalImages.length} imagens
                                    enviadas.
                                  </p>
                                </div>
                              )}
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
        </div>
      </div>
    </div>
  )
}

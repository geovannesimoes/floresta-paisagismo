import { differenceInDays, format } from 'date-fns'
import { Clock, CalendarCheck, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Order } from '@/services/ordersService'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface DeadlineTrackerProps {
  order: Order
}

export function DeadlineTracker({ order }: DeadlineTrackerProps) {
  const isPaid = !!order.paid_at
  const isDelivered = !!order.delivered_at

  if (!isPaid) {
    return (
      <Card className="bg-gray-50 border-dashed">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Clock className="h-4 w-4" /> Prazo de Entrega
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            O prazo iniciará automaticamente após a confirmação do pagamento
            (Status: Recebido).
          </p>
        </CardContent>
      </Card>
    )
  }

  const startDate = new Date(order.paid_at!)
  const endDate = order.delivered_at ? new Date(order.delivered_at) : new Date()

  const elapsedDays = differenceInDays(endDate, startDate)
  const deadlineDays = order.delivery_deadline_days || 7 // Default fallback
  const remainingDays = deadlineDays - elapsedDays
  const isLate = remainingDays < 0 && !isDelivered

  if (isDelivered) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-green-800 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> Projeto Concluído
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm text-green-700">
          <div className="flex justify-between">
            <span>Início:</span>
            <span className="font-mono">{format(startDate, 'dd/MM/yyyy')}</span>
          </div>
          <div className="flex justify-between">
            <span>Entregue em:</span>
            <span className="font-mono">{format(endDate, 'dd/MM/yyyy')}</span>
          </div>
          <div className="flex justify-between border-t border-green-200 pt-1 mt-1 font-medium">
            <span>Tempo Total:</span>
            <span>{elapsedDays} dia(s)</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={cn(
        'border',
        isLate ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200',
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle
          className={cn(
            'text-sm font-bold flex items-center gap-2',
            isLate ? 'text-red-800' : 'text-blue-800',
          )}
        >
          {isLate ? (
            <AlertCircle className="h-4 w-4" />
          ) : (
            <CalendarCheck className="h-4 w-4" />
          )}
          {isLate ? 'Prazo Excedido' : 'Acompanhamento de Prazo'}
        </CardTitle>
      </CardHeader>
      <CardContent
        className={cn(
          'space-y-2 text-sm',
          isLate ? 'text-red-700' : 'text-blue-700',
        )}
      >
        <div className="flex justify-between">
          <span>Iniciado em:</span>
          <span className="font-mono">{format(startDate, 'dd/MM/yyyy')}</span>
        </div>
        <div className="flex justify-between">
          <span>Meta de Entrega:</span>
          <span className="font-mono font-medium">{deadlineDays} dias</span>
        </div>

        <div className="my-2 h-2 w-full bg-white/50 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full',
              isLate ? 'bg-red-500' : 'bg-blue-500',
            )}
            style={{
              width: `${Math.min(100, (elapsedDays / deadlineDays) * 100)}%`,
            }}
          />
        </div>

        <div className="flex justify-between border-t pt-2 border-current/10">
          <span>Dias Decorridos:</span>
          <span className="font-bold">{elapsedDays}</span>
        </div>
        <div className="flex justify-between font-bold text-base">
          <span>{isLate ? 'Atrasado em:' : 'Restam:'}</span>
          <span>{Math.abs(remainingDays)} dias</span>
        </div>
      </CardContent>
    </Card>
  )
}

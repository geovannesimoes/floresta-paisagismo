import { useState, useEffect } from 'react'
import { CheckCircle, Circle, Loader2, Info } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  ordersService,
  OrderChecklistItem,
  Order,
} from '@/services/ordersService'
import { cn } from '@/lib/utils'

interface OrderChecklistProps {
  order: Order
}

export function OrderChecklist({ order }: OrderChecklistProps) {
  const [items, setItems] = useState<OrderChecklistItem[]>([])
  const [loading, setLoading] = useState(false)
  const [toggling, setToggling] = useState<string | null>(null)

  useEffect(() => {
    const loadChecklist = async () => {
      setLoading(true)
      try {
        // 1. Try to fetch existing items
        const { data } = await ordersService.getChecklist(order.id)

        if (data && data.length > 0) {
          setItems(data)
        } else {
          // 2. If empty, initialize
          const planName = order.plan_snapshot_name || order.plan
          const { data: newItems } = await ordersService.initChecklist(
            order.id,
            planName,
          )
          if (newItems) setItems(newItems)
        }
      } catch (e) {
        console.error('Failed to load checklist', e)
      } finally {
        setLoading(false)
      }
    }

    loadChecklist()
  }, [order.id, order.plan_snapshot_name, order.plan])

  const handleToggle = async (item: OrderChecklistItem) => {
    setToggling(item.id)
    try {
      const newState = !item.is_done
      await ordersService.toggleChecklistItem(item.id, newState)

      setItems(
        items.map((i) => (i.id === item.id ? { ...i, is_done: newState } : i)),
      )
    } catch (e) {
      console.error('Error toggling item', e)
    } finally {
      setToggling(null)
    }
  }

  if (loading && items.length === 0) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-bold">Checklist de Entrega</h4>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              Marque os itens conforme são concluídos.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              'flex items-center gap-3 p-2 rounded-md transition-colors cursor-pointer hover:bg-gray-50',
              item.is_done ? 'bg-green-50/50' : '',
            )}
            onClick={() => handleToggle(item)}
          >
            <div
              className={cn(
                'shrink-0 transition-colors',
                item.is_done ? 'text-green-500' : 'text-gray-300',
              )}
            >
              {toggling === item.id ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : item.is_done ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <Circle className="h-5 w-5" />
              )}
            </div>
            <span
              className={cn(
                'text-sm font-medium select-none',
                item.is_done
                  ? 'text-green-900 line-through decoration-green-900/30'
                  : 'text-gray-700',
              )}
            >
              {item.text}
            </span>
          </div>
        ))}
        {items.length === 0 && !loading && (
          <p className="text-sm text-muted-foreground italic">
            Nenhum item na checklist.
          </p>
        )}
      </div>
    </div>
  )
}

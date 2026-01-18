import { useState, useEffect } from 'react'
import {
  Plus,
  Edit,
  Trash,
  Check,
  X,
  ArrowUp,
  ArrowDown,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
import { plansService, Plan, PlanFeature } from '@/services/plansService'

export function PlansManager() {
  const { toast } = useToast()
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Partial<Plan>>({})
  const [features, setFeatures] = useState<Partial<PlanFeature>[]>([])

  useEffect(() => {
    loadPlans()
  }, [])

  const loadPlans = async () => {
    setLoading(true)
    const { data } = await plansService.getPlans(false) // Fetch all, including inactive
    if (data) setPlans(data)
    setLoading(false)
  }

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan)
    setFeatures(plan.features || [])
    setIsDialogOpen(true)
  }

  const handleCreate = () => {
    setEditingPlan({
      is_active: true,
      price_cents: 0,
      sort_order: plans.length + 1,
      slug: '',
      name: '',
      description: '',
      cta: 'Escolher',
    })
    setFeatures([])
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!editingPlan.name || !editingPlan.slug) {
      toast({ title: 'Nome e Slug são obrigatórios', variant: 'destructive' })
      return
    }

    try {
      setLoading(true)
      let planId = editingPlan.id

      if (planId) {
        await plansService.updatePlan(planId, editingPlan)
      } else {
        const { data } = await plansService.createPlan(editingPlan)
        if (data) planId = data.id
      }

      // Handle features
      if (planId && features.length > 0) {
        // 1. Delete all features for this plan (simplification for ordering)
        if (editingPlan.features) {
          for (const f of editingPlan.features) {
            await plansService.deleteFeature(f.id)
          }
        }

        // 2. Insert new features
        for (let i = 0; i < features.length; i++) {
          await plansService.createFeature({
            plan_id: planId,
            text: features[i].text,
            sort_order: i + 1,
          })
        }
      }

      setIsDialogOpen(false)
      loadPlans()
      toast({ title: 'Plano salvo com sucesso' })
    } catch (e) {
      toast({ title: 'Erro ao salvar plano', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        'Tem certeza? Isso pode afetar pedidos históricos se não houver snapshot.',
      )
    )
      return

    setLoading(true)
    await plansService.deletePlan(id)
    loadPlans()
    setLoading(false)
  }

  const handleAddFeature = () => {
    setFeatures([...features, { text: '', sort_order: features.length + 1 }])
  }

  const handleRemoveFeature = (index: number) => {
    const newFeatures = [...features]
    newFeatures.splice(index, 1)
    setFeatures(newFeatures)
  }

  const handleFeatureChange = (index: number, text: string) => {
    const newFeatures = [...features]
    newFeatures[index].text = text
    setFeatures(newFeatures)
  }

  const moveFeature = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === features.length - 1) return

    const newFeatures = [...features]
    const targetIndex = direction === 'up' ? index - 1 : index + 1

    ;[newFeatures[index], newFeatures[targetIndex]] = [
      newFeatures[targetIndex],
      newFeatures[index],
    ]
    setFeatures(newFeatures)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Planos e Preços</CardTitle>
          <CardDescription>Gerencie os pacotes disponíveis</CardDescription>
        </div>
        <Button onClick={handleCreate} size="sm">
          <Plus className="h-4 w-4 mr-2" /> Novo Plano
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
              <TableHead>Nome</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Ativo</TableHead>
              <TableHead>Ordem</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map((plan) => (
              <TableRow key={plan.id}>
                <TableCell className="font-medium">{plan.name}</TableCell>
                <TableCell>
                  R$ {(plan.price_cents / 100).toFixed(2).replace('.', ',')}
                </TableCell>
                <TableCell>
                  {plan.is_active ? (
                    <Check className="text-green-500 h-4 w-4" />
                  ) : (
                    <X className="text-red-500 h-4 w-4" />
                  )}
                </TableCell>
                <TableCell>{plan.sort_order}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(plan)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500"
                    onClick={() => handleDelete(plan.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPlan.id ? 'Editar Plano' : 'Novo Plano'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input
                    value={editingPlan.name || ''}
                    onChange={(e) =>
                      setEditingPlan({ ...editingPlan, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slug (URL amigável)</Label>
                  <Input
                    value={editingPlan.slug || ''}
                    onChange={(e) =>
                      setEditingPlan({
                        ...editingPlan,
                        slug: e.target.value.toLowerCase().replace(/\s+/g, '-'),
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Preço (R$)</Label>
                  <Input
                    value={
                      editingPlan.price_cents
                        ? (editingPlan.price_cents / 100).toFixed(2)
                        : '0.00'
                    }
                    onChange={(e) => {
                      const val = parseFloat(e.target.value.replace(',', '.'))
                      setEditingPlan({
                        ...editingPlan,
                        price_cents: Math.round(val * 100),
                      })
                    }}
                    type="number"
                    step="0.01"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ordem de Exibição</Label>
                  <Input
                    type="number"
                    value={editingPlan.sort_order || 0}
                    onChange={(e) =>
                      setEditingPlan({
                        ...editingPlan,
                        sort_order: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingPlan.is_active}
                    onCheckedChange={(c) =>
                      setEditingPlan({ ...editingPlan, is_active: c })
                    }
                  />
                  <Label>Ativo</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingPlan.highlight}
                    onCheckedChange={(c) =>
                      setEditingPlan({ ...editingPlan, highlight: c })
                    }
                  />
                  <Label>Destaque (Recomendado)</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={editingPlan.description || ''}
                  onChange={(e) =>
                    setEditingPlan({
                      ...editingPlan,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2 border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-center mb-2">
                  <Label>Itens Inclusos (Features)</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAddFeature}
                  >
                    <Plus className="h-3 w-3 mr-1" /> Adicionar
                  </Button>
                </div>
                <div className="space-y-2">
                  {features.map((f, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <Input
                        value={f.text || ''}
                        onChange={(e) =>
                          handleFeatureChange(idx, e.target.value)
                        }
                      />
                      <div className="flex flex-col gap-0.5">
                        <button
                          onClick={() => moveFeature(idx, 'up')}
                          className="text-gray-500 hover:text-black disabled:opacity-30"
                          disabled={idx === 0}
                        >
                          <ArrowUp className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => moveFeature(idx, 'down')}
                          className="text-gray-500 hover:text-black disabled:opacity-30"
                          disabled={idx === features.length - 1}
                        >
                          <ArrowDown className="h-3 w-3" />
                        </button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 p-2 h-8 w-8"
                        onClick={() => handleRemoveFeature(idx)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {features.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      Nenhum item adicionado.
                    </p>
                  )}
                </div>
              </div>

              <Button
                onClick={handleSave}
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

import { useState, useEffect } from 'react'
import { Plus, Trash, Mail, Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { notificationSettingsService } from '@/services/notificationSettingsService'

export function NotificationSettings() {
  const [emails, setEmails] = useState<string[]>([])
  const [newEmail, setNewEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    const { data } = await notificationSettingsService.getAdminEmails()
    if (data) setEmails(data)
    setLoading(false)
  }

  const handleAdd = () => {
    if (!newEmail || !newEmail.includes('@')) {
      toast({ title: 'E-mail inválido', variant: 'destructive' })
      return
    }
    if (emails.includes(newEmail)) {
      toast({ title: 'E-mail já adicionado', variant: 'destructive' })
      return
    }
    setEmails([...emails, newEmail])
    setNewEmail('')
  }

  const handleRemove = (emailToRemove: string) => {
    setEmails(emails.filter((e) => e !== emailToRemove))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await notificationSettingsService.updateAdminEmails(emails)
      toast({ title: 'Configurações de notificação salvas!' })
    } catch (e) {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" /> Notificações Administrativas
        </CardTitle>
        <CardDescription>
          Defina quais endereços receberão alertas de novos pedidos e revisões.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="flex gap-2">
              <Input
                placeholder="novo@admin.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              />
              <Button onClick={handleAdd} variant="secondary">
                <Plus className="h-4 w-4 mr-2" /> Adicionar
              </Button>
            </div>

            <div className="space-y-2">
              {emails.length === 0 && (
                <p className="text-sm text-muted-foreground italic">
                  Nenhum e-mail configurado.
                </p>
              )}
              {emails.map((email) => (
                <div
                  key={email}
                  className="flex justify-between items-center p-3 border rounded bg-gray-50"
                >
                  <span className="text-sm">{email}</span>
                  <button
                    onClick={() => handleRemove(email)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? (
                <Loader2 className="animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Salvar Alterações
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}

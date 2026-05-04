'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { toast } from '@/components/ui/toaster'
import { Plus, Users } from 'lucide-react'
import { formatDate } from '@/lib/utils'

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  RH: 'Recursos Humanos',
  FINANCEIRO: 'Financeiro',
  JURIDICO: 'Jurídico',
  CANDIDATO: 'Candidato',
}

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-purple-100 text-purple-700',
  RH: 'bg-blue-100 text-blue-700',
  FINANCEIRO: 'bg-green-100 text-green-700',
  JURIDICO: 'bg-indigo-100 text-indigo-700',
  CANDIDATO: 'bg-gray-100 text-gray-600',
}

interface Props {
  users: any[]
}

export function UsuariosManager({ users }: Props) {
  const router = useRouter()
  const [dialog, setDialog] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'RH' })

  const internalUsers = users.filter((u) => u.role !== 'CANDIDATO')
  const candidates = users.filter((u) => u.role === 'CANDIDATO')

  async function handleCreate() {
    if (!form.name || !form.email || !form.password) {
      toast({ title: 'Preencha todos os campos', variant: 'destructive' })
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/admin/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
      toast({ title: 'Usuário criado com sucesso!', variant: 'success' })
      setDialog(false)
      setForm({ name: '', email: '', password: '', role: 'RH' })
      router.refresh()
    } catch (e: any) {
      toast({ title: e.message || 'Erro ao criar usuário', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Equipe Interna ({internalUsers.length})</CardTitle>
          <Button size="sm" onClick={() => setDialog(true)}>
            <Plus className="h-4 w-4 mr-2" /> Novo Usuário
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {internalUsers.length === 0 ? (
            <div className="p-8 text-center text-gray-400">Nenhum usuário interno</div>
          ) : (
            <div className="divide-y">
              {internalUsers.map((u) => (
                <div key={u.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{u.name}</p>
                    <p className="text-xs text-gray-500">{u.email}</p>
                    <p className="text-xs text-gray-400">Cadastrado em {formatDate(u.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${ROLE_COLORS[u.role] || 'bg-gray-100'}`}>
                      {ROLE_LABELS[u.role] || u.role}
                    </span>
                    <span className={`h-2 w-2 rounded-full ${u.active ? 'bg-green-400' : 'bg-gray-300'}`} title={u.active ? 'Ativo' : 'Inativo'} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            Candidatos ({candidates.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {candidates.length === 0 ? (
            <div className="p-8 text-center text-gray-400">Nenhum candidato</div>
          ) : (
            <div className="divide-y max-h-64 overflow-y-auto">
              {candidates.map((u) => (
                <div key={u.id} className="flex items-center justify-between px-6 py-3">
                  <div>
                    <p className="text-sm text-gray-900">{u.name}</p>
                    <p className="text-xs text-gray-500">{u.email}</p>
                  </div>
                  <p className="text-xs text-gray-400">{formatDate(u.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Usuário Interno</DialogTitle>
            <DialogDescription>Crie um usuário da equipe de análise.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome completo</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome" />
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@empresa.com" />
            </div>
            <div className="space-y-2">
              <Label>Senha inicial</Label>
              <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Mínimo 6 caracteres" />
            </div>
            <div className="space-y-2">
              <Label>Perfil de acesso</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RH">Recursos Humanos</SelectItem>
                  <SelectItem value="FINANCEIRO">Financeiro</SelectItem>
                  <SelectItem value="JURIDICO">Jurídico</SelectItem>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={loading}>
              {loading ? 'Criando...' : 'Criar Usuário'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

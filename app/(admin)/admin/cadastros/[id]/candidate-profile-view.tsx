'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { StatusBadge, DocumentStatusBadge } from '@/components/status-badge'
import { StatusTimeline } from '@/components/status-timeline'
import { toast } from '@/components/ui/toaster'
import { Role } from '@/types'
import { can } from '@/lib/permissions'
import { formatDate, formatDateTime, formatFileSize, getHiringTypeLabel } from '@/lib/utils'
import { CheckCircle, XCircle, AlertCircle, FileText, Eye, ArrowLeft, Printer } from 'lucide-react'

interface Props {
  profile: any
  userRole: Role
  currentUserId: string
}

function InfoRow({ label, value }: { label: string; value?: string | number | null | boolean }) {
  return (
    <div className="flex flex-col py-2 border-b border-gray-100">
      <span className="text-xs text-gray-400">{label}</span>
      <span className="text-sm text-gray-900 font-medium mt-0.5">{value == null ? '-' : String(value)}</span>
    </div>
  )
}

const STATUS_OPTIONS = [
  { value: 'ENVIADO_PARA_ANALISE', label: 'Enviado para Análise' },
  { value: 'DOCUMENTACAO_PENDENTE', label: 'Documentação Pendente' },
  { value: 'EM_ANALISE_RH', label: 'Em Análise - RH' },
  { value: 'EM_ANALISE_FINANCEIRA', label: 'Em Análise - Financeiro' },
  { value: 'EM_ANALISE_JURIDICA', label: 'Em Análise - Jurídico' },
  { value: 'APROVADO', label: 'Aprovado' },
  { value: 'REPROVADO', label: 'Reprovado' },
  { value: 'CONTRATO_GERADO', label: 'Contrato Gerado' },
  { value: 'CONTRATO_ASSINADO', label: 'Contrato Assinado' },
  { value: 'FINALIZADO', label: 'Finalizado' },
]

export function CandidateProfileView({ profile, userRole, currentUserId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [approveDialog, setApproveDialog] = useState(false)
  const [rejectDialog, setRejectDialog] = useState(false)
  const [correctionDialog, setCorrectionDialog] = useState(false)
  const [statusDialog, setStatusDialog] = useState(false)
  const [observation, setObservation] = useState('')
  const [correctionMessage, setCorrectionMessage] = useState('')
  const [correctionItems, setCorrectionItems] = useState([{ field: '', desc: '' }])
  const [newStatus, setNewStatus] = useState(profile.status)
  const [analysisData, setAnalysisData] = useState({
    rhOpinion: profile.internalAnalysis?.rhOpinion || '',
    financialOpinion: profile.internalAnalysis?.financialOpinion || '',
    legalOpinion: profile.internalAnalysis?.legalOpinion || '',
    commercialObservation: profile.internalAnalysis?.commercialObservation || '',
    finalRecommendation: profile.internalAnalysis?.finalRecommendation || '',
    riskNotes: profile.internalAnalysis?.riskNotes || '',
  })

  async function callApi(url: string, body: any) {
    setLoading(true)
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error()
      return true
    } catch {
      toast({ title: 'Erro na operação', variant: 'destructive' })
      return false
    } finally {
      setLoading(false)
    }
  }

  async function handleApprove() {
    const ok = await callApi(`/api/admin/cadastros/${profile.id}/status`, {
      status: 'APROVADO', observation, action: 'Cadastro aprovado',
    })
    if (ok) { toast({ title: 'Cadastro aprovado!', variant: 'success' }); setApproveDialog(false); router.refresh() }
  }

  async function handleReject() {
    const ok = await callApi(`/api/admin/cadastros/${profile.id}/status`, {
      status: 'REPROVADO', observation, action: 'Cadastro reprovado',
    })
    if (ok) { toast({ title: 'Cadastro reprovado', variant: 'destructive' }); setRejectDialog(false); router.refresh() }
  }

  async function handleChangeStatus() {
    const ok = await callApi(`/api/admin/cadastros/${profile.id}/status`, {
      status: newStatus, observation, action: `Status alterado para ${newStatus}`,
    })
    if (ok) { toast({ title: 'Status alterado', variant: 'success' }); setStatusDialog(false); router.refresh() }
  }

  async function handleRequestCorrection() {
    const ok = await callApi(`/api/admin/cadastros/${profile.id}/correcao`, {
      message: correctionMessage,
      items: correctionItems.filter((i) => i.field || i.desc),
    })
    if (ok) { toast({ title: 'Solicitação enviada!', variant: 'success' }); setCorrectionDialog(false); router.refresh() }
  }

  async function handleDocAction(docId: string, status: string, obs?: string) {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/documentos/${docId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, observation: obs }),
      })
      if (!res.ok) throw new Error()
      toast({ title: status === 'APROVADO' ? 'Documento aprovado' : 'Documento recusado', variant: status === 'APROVADO' ? 'success' : 'destructive' })
      router.refresh()
    } catch {
      toast({ title: 'Erro ao atualizar documento', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  async function saveAnalysis() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/cadastros/${profile.id}/analise`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(analysisData),
      })
      if (!res.ok) throw new Error()
      toast({ title: 'Análise salva', variant: 'success' })
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const canApprove = can(userRole, 'canApproveCandidates')
  const canReject = can(userRole, 'canRejectCandidates')
  const canCorrection = can(userRole, 'canRequestCorrection')
  const canChangeStatus = can(userRole, 'canChangeStatus')
  const canViewBank = can(userRole, 'canViewBankData')
  const canViewAnalysis = can(userRole, 'canViewInternalAnalysis')

  const tabs = ['resumo', 'pessoal', 'empresa', 'socios', 'documentos', canViewBank && 'bancarios', 'comercial', canViewAnalysis && 'analise', 'historico'].filter(Boolean) as string[]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link href="/admin/cadastros">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {profile.fullName || profile.companyData?.corporateName || profile.user.name}
            </h1>
            <p className="text-sm text-gray-500">{profile.user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={profile.status} />
          {can(userRole, 'canGeneratePDF') && (
            <Link href={`/admin/cadastros/${profile.id}/pdf`} target="_blank">
              <Button variant="outline" size="sm"><Printer className="h-4 w-4 mr-1" />PDF</Button>
            </Link>
          )}
          {canChangeStatus && (
            <Button variant="outline" size="sm" onClick={() => setStatusDialog(true)}>Alterar Status</Button>
          )}
          {canCorrection && !['APROVADO', 'REPROVADO'].includes(profile.status) && (
            <Button variant="warning" size="sm" onClick={() => setCorrectionDialog(true)}>
              <AlertCircle className="h-4 w-4 mr-1" />Correção
            </Button>
          )}
          {canReject && !['REPROVADO', 'APROVADO'].includes(profile.status) && (
            <Button variant="destructive" size="sm" onClick={() => setRejectDialog(true)}>
              <XCircle className="h-4 w-4 mr-1" />Reprovar
            </Button>
          )}
          {canApprove && profile.status !== 'APROVADO' && (
            <Button variant="success" size="sm" onClick={() => setApproveDialog(true)}>
              <CheckCircle className="h-4 w-4 mr-1" />Aprovar
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="resumo">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-gray-100 p-1">
          {tabs.map((tab) => (
            <TabsTrigger key={tab} value={tab} className="text-xs">
              {tab === 'pessoal' ? 'Dados Pessoais' : tab === 'bancarios' ? 'Banco' : tab === 'analise' ? 'Análise Interna' : tab === 'historico' ? 'Histórico' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="resumo">
          <Card><CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-0">
            <InfoRow label="Nome completo" value={profile.fullName} />
            <InfoRow label="CPF" value={profile.cpf} />
            <InfoRow label="CNPJ" value={profile.companyData?.cnpj} />
            <InfoRow label="Cidade/UF" value={profile.city && profile.state ? `${profile.city}/${profile.state}` : null} />
            <InfoRow label="Celular" value={profile.mobile} />
            <InfoRow label="E-mail" value={profile.email || profile.user.email} />
            <InfoRow label="Tipo de contratação" value={profile.hiringType ? getHiringTypeLabel(profile.hiringType) : null} />
            <InfoRow label="Área de atuação" value={profile.commercialInfo?.operationArea} />
            <InfoRow label="Enviado em" value={formatDate(profile.submittedAt)} />
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="pessoal">
          <Card><CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-0">
            <InfoRow label="Nome completo" value={profile.fullName} />
            <InfoRow label="CPF" value={profile.cpf} />
            <InfoRow label="Nome do pai" value={profile.fatherName} />
            <InfoRow label="Nome da mãe" value={profile.motherName} />
            <InfoRow label="Gênero" value={profile.gender} />
            <InfoRow label="Nacionalidade" value={profile.nationality} />
            <InfoRow label="Naturalidade" value={profile.birthplace} />
            <InfoRow label="Data de nascimento" value={formatDate(profile.birthDate)} />
            <InfoRow label="Estado civil" value={profile.maritalStatus} />
            <InfoRow label="Filhos" value={profile.hasChildren ? `Sim (${profile.childrenCount})` : 'Não'} />
            <InfoRow label="Endereço" value={profile.address} />
            <InfoRow label="Número / Complemento" value={`${profile.number || ''}${profile.complement ? ', ' + profile.complement : ''}`} />
            <InfoRow label="Bairro / Cidade / UF" value={`${profile.district || ''} - ${profile.city || ''}/${profile.state || ''}`} />
            <InfoRow label="CEP" value={profile.zipCode} />
            <InfoRow label="Telefone / Celular" value={`${profile.phone || ''} / ${profile.mobile || ''}`} />
            <InfoRow label="E-mail" value={profile.email} />
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="empresa">
          {profile.companyData ? (
            <Card><CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-0">
              <InfoRow label="Razão social" value={profile.companyData.corporateName} />
              <InfoRow label="Nome fantasia" value={profile.companyData.tradeName} />
              <InfoRow label="CNPJ" value={profile.companyData.cnpj} />
              <InfoRow label="Inscrição estadual" value={profile.companyData.stateRegistration} />
              <InfoRow label="Endereço" value={`${profile.companyData.address || ''}, ${profile.companyData.number || ''} - ${profile.companyData.city || ''}/${profile.companyData.state || ''}`} />
              <InfoRow label="Telefone" value={profile.companyData.phone} />
              <InfoRow label="E-mail" value={profile.companyData.email} />
            </CardContent></Card>
          ) : <Card><CardContent className="p-8 text-center text-gray-400">Sem dados de empresa</CardContent></Card>}
        </TabsContent>

        <TabsContent value="socios">
          {profile.partners?.length > 0 ? (
            <div className="space-y-4">
              {profile.partners.map((p: any, i: number) => (
                <Card key={p.id}>
                  <CardHeader><CardTitle className="text-sm">Sócio {i + 1}: {p.fullName}</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-0">
                    <InfoRow label="CPF" value={p.cpf} />
                    <InfoRow label="RG" value={p.rg} />
                    <InfoRow label="Estado civil" value={p.maritalStatus} />
                    <InfoRow label="Profissão" value={p.profession} />
                    <InfoRow label="Endereço" value={p.address} />
                    <InfoRow label="Telefone" value={p.phone} />
                    <InfoRow label="E-mail" value={p.email} />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : <Card><CardContent className="p-8 text-center text-gray-400">Nenhum sócio cadastrado</CardContent></Card>}
        </TabsContent>

        <TabsContent value="documentos">
          <div className="space-y-3">
            {profile.documents?.length === 0 && (
              <Card><CardContent className="p-8 text-center text-gray-400">Nenhum documento enviado</CardContent></Card>
            )}
            {profile.documents?.map((doc: any) => (
              <Card key={doc.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <FileText className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium">{doc.documentType}</p>
                          <DocumentStatusBadge status={doc.status} />
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{doc.originalName} — {formatFileSize(doc.size)}</p>
                        <p className="text-xs text-gray-400">Enviado: {formatDateTime(doc.uploadedAt)}</p>
                        {doc.adminObservation && <p className="text-xs text-gray-600 mt-1">Obs: {doc.adminObservation}</p>}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0 flex-wrap">
                      <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm"><Eye className="h-3 w-3 mr-1" />Ver</Button>
                      </a>
                      {can(userRole, 'canApproveDocuments') && doc.status !== 'APROVADO' && (
                        <Button variant="success" size="sm" onClick={() => handleDocAction(doc.id, 'APROVADO')}>
                          <CheckCircle className="h-3 w-3 mr-1" />Aprovar
                        </Button>
                      )}
                      {can(userRole, 'canApproveDocuments') && doc.status !== 'RECUSADO' && (
                        <Button variant="destructive" size="sm" onClick={() => handleDocAction(doc.id, 'RECUSADO', 'Documento recusado')}>
                          <XCircle className="h-3 w-3 mr-1" />Recusar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {canViewBank && (
          <TabsContent value="bancarios">
            {profile.bankData ? (
              <Card><CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-0">
                <InfoRow label="Banco" value={profile.bankData.bank} />
                <InfoRow label="Agência" value={profile.bankData.agency} />
                <InfoRow label="Conta" value={profile.bankData.account} />
                <InfoRow label="Tipo" value={profile.bankData.accountType} />
                <InfoRow label="Titular" value={profile.bankData.accountHolder} />
                <InfoRow label="CPF/CNPJ titular" value={profile.bankData.holderCpfCnpj} />
                <InfoRow label="Chave Pix" value={profile.bankData.pixKey} />
              </CardContent></Card>
            ) : <Card><CardContent className="p-8 text-center text-gray-400">Sem dados bancários</CardContent></Card>}
          </TabsContent>
        )}

        <TabsContent value="comercial">
          {profile.commercialInfo ? (
            <Card><CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-0">
              <InfoRow label="Área de atuação" value={profile.commercialInfo.operationArea} />
              <InfoRow label="Região" value={profile.commercialInfo.operationRegion} />
              <InfoRow label="Experiência" value={profile.commercialInfo.marketExperienceTime} />
              <InfoRow label="Empresas representadas" value={profile.commercialInfo.representedCompanies} />
              <InfoRow label="CORE/COREMAT" value={profile.commercialInfo.hasCore ? `Sim - ${profile.commercialInfo.coreNumber}` : 'Não'} />
              <InfoRow label="Validade CORE" value={formatDate(profile.commercialInfo.coreExpirationDate)} />
              <InfoRow label="Observações" value={profile.commercialInfo.observations} />
            </CardContent></Card>
          ) : <Card><CardContent className="p-8 text-center text-gray-400">Sem informações comerciais</CardContent></Card>}
        </TabsContent>

        {canViewAnalysis && (
          <TabsContent value="analise">
            <Card>
              <CardHeader><CardTitle className="text-base">Análise Interna</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {can(userRole, 'canAddRHOpinion') && (
                  <div className="space-y-2">
                    <Label>Parecer do RH</Label>
                    <Textarea value={analysisData.rhOpinion} onChange={(e) => setAnalysisData((p) => ({ ...p, rhOpinion: e.target.value }))} rows={3} />
                  </div>
                )}
                {can(userRole, 'canAddFinancialOpinion') && (
                  <div className="space-y-2">
                    <Label>Parecer Financeiro</Label>
                    <Textarea value={analysisData.financialOpinion} onChange={(e) => setAnalysisData((p) => ({ ...p, financialOpinion: e.target.value }))} rows={3} />
                  </div>
                )}
                {can(userRole, 'canAddLegalOpinion') && (
                  <div className="space-y-2">
                    <Label>Parecer Jurídico</Label>
                    <Textarea value={analysisData.legalOpinion} onChange={(e) => setAnalysisData((p) => ({ ...p, legalOpinion: e.target.value }))} rows={3} />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Riscos Identificados</Label>
                  <Textarea value={analysisData.riskNotes} onChange={(e) => setAnalysisData((p) => ({ ...p, riskNotes: e.target.value }))} rows={2} />
                </div>
                <div className="space-y-2">
                  <Label>Recomendação Final</Label>
                  <Textarea value={analysisData.finalRecommendation} onChange={(e) => setAnalysisData((p) => ({ ...p, finalRecommendation: e.target.value }))} rows={2} />
                </div>
                <Button onClick={saveAnalysis} disabled={loading}>Salvar Análise</Button>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="historico">
          <Card><CardContent className="p-6"><StatusTimeline items={profile.statusHistories} /></CardContent></Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <Dialog open={approveDialog} onOpenChange={setApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aprovar Cadastro</DialogTitle>
            <DialogDescription>Confirme a aprovação de {profile.fullName || profile.user.name}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Observação (opcional)</Label>
            <Textarea value={observation} onChange={(e) => setObservation(e.target.value)} rows={3} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialog(false)}>Cancelar</Button>
            <Button variant="success" onClick={handleApprove} disabled={loading}>
              <CheckCircle className="h-4 w-4 mr-2" />Confirmar Aprovação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectDialog} onOpenChange={setRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reprovar Cadastro</DialogTitle>
            <DialogDescription>Informe o motivo da reprovação.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Motivo *</Label>
            <Textarea value={observation} onChange={(e) => setObservation(e.target.value)} rows={3} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleReject} disabled={loading || !observation}>
              <XCircle className="h-4 w-4 mr-2" />Confirmar Reprovação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={correctionDialog} onOpenChange={setCorrectionDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Solicitar Correção</DialogTitle>
            <DialogDescription>Informe o que precisa ser corrigido pelo candidato.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Mensagem ao candidato *</Label>
              <Textarea value={correctionMessage} onChange={(e) => setCorrectionMessage(e.target.value)} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Itens específicos</Label>
              {correctionItems.map((item, i) => (
                <div key={i} className="grid grid-cols-2 gap-2">
                  <input className="border rounded px-2 py-1 text-sm" placeholder="Campo" value={item.field}
                    onChange={(e) => { const u = [...correctionItems]; u[i].field = e.target.value; setCorrectionItems(u) }} />
                  <input className="border rounded px-2 py-1 text-sm" placeholder="Descrição" value={item.desc}
                    onChange={(e) => { const u = [...correctionItems]; u[i].desc = e.target.value; setCorrectionItems(u) }} />
                </div>
              ))}
              <Button variant="outline" size="sm" type="button"
                onClick={() => setCorrectionItems([...correctionItems, { field: '', desc: '' }])}>
                + Item
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCorrectionDialog(false)}>Cancelar</Button>
            <Button variant="warning" onClick={handleRequestCorrection} disabled={loading || !correctionMessage}>
              <AlertCircle className="h-4 w-4 mr-2" />Enviar Solicitação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={statusDialog} onOpenChange={setStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Status</DialogTitle>
            <DialogDescription>Selecione o novo status do cadastro.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="space-y-2">
              <Label>Observação</Label>
              <Textarea value={observation} onChange={(e) => setObservation(e.target.value)} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialog(false)}>Cancelar</Button>
            <Button onClick={handleChangeStatus} disabled={loading}>Salvar Status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

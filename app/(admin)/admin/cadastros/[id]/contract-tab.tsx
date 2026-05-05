'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/toaster'
import { Role } from '@/types'
import { can } from '@/lib/permissions'
import { renderContractHtml } from '@/lib/contracts/render-contract-html'
import type { ContractData } from '@/lib/contracts/render-contract-html'
import { formatDateTime } from '@/lib/utils'
import {
  FileText, Save, Eye, Download, CheckCircle, Send, XCircle, Clock, AlertTriangle, Plus, Trash2
} from 'lucide-react'

interface Props {
  profile: any
  userRole: Role
  currentUserId: string
}

const CONTRACT_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  NAO_GERADO: { label: 'Não Gerado', color: 'bg-gray-100 text-gray-700' },
  RASCUNHO: { label: 'Rascunho', color: 'bg-yellow-100 text-yellow-700' },
  GERADO: { label: 'Gerado', color: 'bg-blue-100 text-blue-700' },
  ENVIADO_ASSINATURA: { label: 'Enviado p/ Assinatura', color: 'bg-purple-100 text-purple-700' },
  ASSINADO: { label: 'Assinado', color: 'bg-green-100 text-green-700' },
  CANCELADO: { label: 'Cancelado', color: 'bg-red-100 text-red-700' },
}

const HISTORY_ACTION_LABELS: Record<string, string> = {
  RASCUNHO_CRIADO: 'Rascunho criado',
  RASCUNHO_ATUALIZADO: 'Rascunho atualizado',
  CONTRATO_GERADO: 'Contrato gerado',
  CONTRATO_BAIXADO: 'Contrato baixado',
  ENVIADO_PARA_ASSINATURA: 'Enviado para assinatura',
  CONTRATO_ASSINADO: 'Contrato assinado',
  CONTRATO_CANCELADO: 'Contrato cancelado',
}

const DEFAULT_COMMISSIONS = [
  { category: 'Massas e similares', minPercent: 1, maxPercent: 3, observation: '' },
  { category: 'Farináceos e similares', minPercent: 1, maxPercent: 5, observation: '' },
  { category: 'Cafés', minPercent: 1, maxPercent: 5, observation: '' },
  { category: 'Biscoitos e similares', minPercent: 1, maxPercent: 4, observation: '' },
  { category: 'Conservas e enlatados', minPercent: 1, maxPercent: 4, observation: '' },
  { category: 'Condimentos e especiarias', minPercent: 1, maxPercent: 5, observation: '' },
  { category: 'Guloseimas', minPercent: 1, maxPercent: 5, observation: '' },
  { category: 'Balas e chicletes', minPercent: 1, maxPercent: 4, observation: '' },
  { category: 'Doces e derivados do leite', minPercent: 1, maxPercent: 5, observation: '' },
  { category: 'Ração animal', minPercent: 1, maxPercent: 4, observation: '' },
]

function toDateInputValue(date: string | null | undefined): string {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

export function ContractTab({ profile, userRole, currentUserId }: Props) {
  const isPj = profile.hiringType === 'REPRESENTANTE_PJ'
  const canGenerate = can(userRole, 'canGenerateContract')
  const canSign = can(userRole, 'canSignContract')

  const [loading, setLoading] = useState(false)
  const [loadingGenerate, setLoadingGenerate] = useState(false)
  const [contract, setContract] = useState<any>(null)
  const [showPreview, setShowPreview] = useState(false)
  const previewRef = useRef<HTMLIFrameElement>(null)

  // Representada
  const [representada, setRepresentada] = useState({
    razaoSocial: 'FÓRMULA DISTRIBUIDORA DE ALIMENTOS LTDA',
    cnpj: '13.555.022/0001-60',
    endereco: 'Rua São José, 69, Jardim América',
    cidade: 'Várzea Grande',
    uf: 'MT',
    cep: '78110-800',
    representanteLegal: 'HELBERTY KOWALSKI GONÇALVES',
    representanteCpf: '013.808.871-35',
    representanteRg: '13665359/SSP-MT',
  })

  // Configurações
  const [config, setConfig] = useState({
    operationZone: '',
    signatureCity: 'Várzea Grande',
    signatureState: 'MT',
    signatureDate: '',
    startDate: '',
    endDate: '',
    prazoIndeterminado: true,
    notes: '',
  })

  // Comissões
  const [commissions, setCommissions] = useState(DEFAULT_COMMISSIONS)

  // Testemunhas
  const [witnesses, setWitnesses] = useState([
    { witnessOrder: 1, name: 'VALMIR JOSE DA SILVA', cpf: '395.847.041-68' },
    { witnessOrder: 2, name: 'MARIA APARECIDA BARBOSA', cpf: '672.862.671-91' },
  ])

  // Carregar contrato existente
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/cadastros/${profile.id}/contrato`)
        if (!res.ok) return
        const data = await res.json()
        if (data.contract) {
          const c = data.contract
          setContract(c)
          setRepresentada({
            razaoSocial: c.representadaRazaoSocial ?? representada.razaoSocial,
            cnpj: c.representadaCnpj ?? representada.cnpj,
            endereco: c.representadaEndereco ?? representada.endereco,
            cidade: c.representadaCidade ?? representada.cidade,
            uf: c.representadaUf ?? representada.uf,
            cep: c.representadaCep ?? representada.cep,
            representanteLegal: c.representadaRepresentanteLegal ?? representada.representanteLegal,
            representanteCpf: c.representadaRepresentanteCpf ?? representada.representanteCpf,
            representanteRg: c.representadaRepresentanteRg ?? representada.representanteRg,
          })
          setConfig({
            operationZone: c.operationZone ?? '',
            signatureCity: c.signatureCity ?? 'Várzea Grande',
            signatureState: c.signatureState ?? 'MT',
            signatureDate: toDateInputValue(c.signatureDate),
            startDate: toDateInputValue(c.startDate),
            endDate: toDateInputValue(c.endDate),
            prazoIndeterminado: !c.endDate,
            notes: c.notes ?? '',
          })
          if (c.commissions?.length > 0) setCommissions(c.commissions)
          if (c.witnesses?.length > 0) setWitnesses(c.witnesses)
        }
      } catch { /* sem contrato ainda */ }
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.id])

  function buildPayload() {
    return {
      representadaRazaoSocial: representada.razaoSocial,
      representadaCnpj: representada.cnpj,
      representadaEndereco: representada.endereco,
      representadaCidade: representada.cidade,
      representadaUf: representada.uf,
      representadaCep: representada.cep,
      representadaRepresentanteLegal: representada.representanteLegal,
      representadaRepresentanteCpf: representada.representanteCpf,
      representadaRepresentanteRg: representada.representanteRg,
      operationZone: config.operationZone,
      signatureCity: config.signatureCity,
      signatureState: config.signatureState,
      signatureDate: config.signatureDate || null,
      startDate: config.startDate || null,
      endDate: config.prazoIndeterminado ? null : (config.endDate || null),
      notes: config.notes || null,
      commissions,
      witnesses,
    }
  }

  async function handleSaveDraft() {
    setLoading(true)
    try {
      const payload = buildPayload()
      const method = contract ? 'PUT' : 'POST'
      const res = await fetch(`/api/admin/cadastros/${profile.id}/contrato`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Erro')
      }
      const data = await res.json()
      setContract(data.contract)
      toast({ title: 'Rascunho salvo!', variant: 'success' })
    } catch (e: any) {
      toast({ title: e.message || 'Erro ao salvar', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  function buildContractData(): ContractData {
    const firstPartner = profile.partners?.[0]
    const repName = isPj ? (profile.companyData?.corporateName ?? '') : (profile.fullName ?? '')
    const repEndereco = isPj ? (profile.companyData?.address ?? '') : (profile.address ?? '')
    const repCidade = isPj ? (profile.companyData?.city ?? '') : (profile.city ?? '')
    const repUf = isPj ? (profile.companyData?.state ?? '') : (profile.state ?? '')

    return {
      representadaRazaoSocial: representada.razaoSocial,
      representadaCnpj: representada.cnpj,
      representadaEndereco: representada.endereco,
      representadaCidade: representada.cidade,
      representadaUf: representada.uf,
      representadaCep: representada.cep,
      representadaRepresentanteLegal: representada.representanteLegal,
      representadaRepresentanteCpf: representada.representanteCpf,
      representadaRepresentanteRg: representada.representanteRg,

      representanteRazaoSocial: repName,
      representanteNomeFantasia: profile.companyData?.tradeName,
      representanteCnpj: isPj ? profile.companyData?.cnpj : undefined,
      representanteCpf: !isPj ? profile.cpf : undefined,
      representanteRg: undefined,
      representanteEndereco: repEndereco,
      representanteNumero: isPj ? profile.companyData?.number : profile.number,
      representanteComplemento: isPj ? profile.companyData?.complement : profile.complement,
      representanteBairro: isPj ? profile.companyData?.district : profile.district,
      representanteCidade: repCidade,
      representanteUf: repUf,
      representanteCep: isPj ? profile.companyData?.zipCode : profile.zipCode,
      representanteTelefone: isPj ? profile.companyData?.phone : profile.phone,
      representanteEmail: isPj ? profile.companyData?.email : profile.email,
      representanteCore: profile.commercialInfo?.hasCore ? profile.commercialInfo.coreNumber : undefined,
      representanteCoreValidade: profile.commercialInfo?.coreExpirationDate
        ? new Date(profile.commercialInfo.coreExpirationDate).toLocaleDateString('pt-BR')
        : undefined,
      socioNome: firstPartner?.fullName,
      socioCpf: firstPartner?.cpf,
      socioRg: firstPartner?.rg,

      operationZone: config.operationZone || '[ZONA DE ATUAÇÃO NÃO INFORMADA]',
      signatureCity: config.signatureCity || 'Várzea Grande',
      signatureState: config.signatureState || 'MT',
      signatureDate: config.signatureDate
        ? new Date(config.signatureDate).toLocaleDateString('pt-BR')
        : '[DATA NÃO INFORMADA]',
      startDate: config.startDate ? new Date(config.startDate).toLocaleDateString('pt-BR') : undefined,
      endDate: config.prazoIndeterminado ? undefined : (config.endDate ? new Date(config.endDate).toLocaleDateString('pt-BR') : undefined),
      prazoIndeterminado: config.prazoIndeterminado,
      notes: config.notes || undefined,

      commissions,
      witness1Name: witnesses[0]?.name ?? 'TESTEMUNHA 1',
      witness1Cpf: witnesses[0]?.cpf ?? '000.000.000-00',
      witness2Name: witnesses[1]?.name ?? 'TESTEMUNHA 2',
      witness2Cpf: witnesses[1]?.cpf ?? '000.000.000-00',
    }
  }

  function handlePreview() {
    const html = renderContractHtml(buildContractData())
    setShowPreview(true)
    setTimeout(() => {
      if (previewRef.current) {
        const doc = previewRef.current.contentDocument
        if (doc) {
          doc.open()
          doc.write(html)
          doc.close()
        }
      }
    }, 100)
  }

  async function handleGenerate() {
    // Salvar primeiro se não existe
    if (!contract) {
      await handleSaveDraft()
    }
    setLoadingGenerate(true)
    try {
      const res = await fetch(`/api/admin/cadastros/${profile.id}/contrato/generate`, {
        method: 'POST',
      })
      if (!res.ok) {
        const err = await res.json()
        const msgs = err.errors ? err.errors.join('\n• ') : (err.error ?? 'Erro')
        throw new Error(msgs)
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const repName = isPj ? (profile.companyData?.corporateName ?? 'representante') : (profile.fullName ?? 'representante')
      a.download = `contrato-${repName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.docx`
      a.click()
      URL.revokeObjectURL(url)
      // Recarregar dados do contrato
      const reload = await fetch(`/api/admin/cadastros/${profile.id}/contrato`)
      if (reload.ok) {
        const data = await reload.json()
        setContract(data.contract)
      }
      toast({ title: 'Contrato gerado e baixado!', variant: 'success' })
    } catch (e: any) {
      toast({ title: e.message || 'Erro ao gerar contrato', variant: 'destructive' })
    } finally {
      setLoadingGenerate(false)
    }
  }

  async function handleStatusChange(status: string, observation?: string) {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/cadastros/${profile.id}/contrato/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, observation }),
      })
      if (!res.ok) throw new Error()
      const reload = await fetch(`/api/admin/cadastros/${profile.id}/contrato`)
      if (reload.ok) {
        const data = await reload.json()
        setContract(data.contract)
      }
      toast({ title: 'Status atualizado!', variant: 'success' })
    } catch {
      toast({ title: 'Erro ao atualizar status', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const statusInfo = CONTRACT_STATUS_LABELS[contract?.status ?? 'NAO_GERADO']
  const repName = isPj ? (profile.companyData?.corporateName ?? profile.user?.name) : (profile.fullName ?? profile.user?.name)
  const repDoc = isPj ? profile.companyData?.cnpj : profile.cpf

  // Alertas de dados faltantes
  const missingFields: string[] = []
  if (!repName) missingFields.push('Nome/Razão social')
  if (isPj && !profile.companyData?.cnpj) missingFields.push('CNPJ')
  if (!isPj && !profile.cpf) missingFields.push('CPF')
  if (!profile.commercialInfo?.hasCore || !profile.commercialInfo?.coreNumber) missingFields.push('CORE/COREMAT')
  const repAddr = isPj ? profile.companyData?.address : profile.address
  if (!repAddr) missingFields.push('Endereço')

  return (
    <div className="space-y-4">
      {/* Cards de resumo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500">Status do Contrato</p>
            <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-semibold ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500">Representante</p>
            <p className="text-sm font-medium mt-1 truncate">{repName ?? '-'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500">CPF / CNPJ</p>
            <p className="text-sm font-medium mt-1">{repDoc ?? '-'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500">Última atualização</p>
            <p className="text-sm font-medium mt-1">{contract?.updatedAt ? formatDateTime(contract.updatedAt) : '-'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerta de dados faltantes */}
      {missingFields.length > 0 && (
        <Card className="border-yellow-300 bg-yellow-50">
          <CardContent className="p-4 flex gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-yellow-800">Dados obrigatórios ausentes no cadastro:</p>
              <ul className="text-xs text-yellow-700 mt-1 list-disc list-inside">
                {missingFields.map((f) => <li key={f}>{f}</li>)}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botões de ação */}
      {canGenerate && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={handleSaveDraft} disabled={loading}>
                <Save className="h-4 w-4 mr-1" />Salvar Rascunho
              </Button>
              <Button variant="outline" size="sm" onClick={handlePreview}>
                <Eye className="h-4 w-4 mr-1" />Pré-visualizar
              </Button>
              <Button size="sm" onClick={handleGenerate} disabled={loadingGenerate || missingFields.length > 0}>
                <FileText className="h-4 w-4 mr-1" />
                {loadingGenerate ? 'Gerando...' : 'Gerar Contrato (DOCX)'}
              </Button>
              {contract?.status === 'GERADO' && (
                <Button variant="outline" size="sm" onClick={() => handleStatusChange('ENVIADO_ASSINATURA')} disabled={loading}>
                  <Send className="h-4 w-4 mr-1" />Enviar para Assinatura
                </Button>
              )}
              {contract?.status === 'ENVIADO_ASSINATURA' && canSign && (
                <Button variant="outline" size="sm" className="border-green-500 text-green-700"
                  onClick={() => handleStatusChange('ASSINADO', 'Contrato marcado como assinado')} disabled={loading}>
                  <CheckCircle className="h-4 w-4 mr-1" />Marcar como Assinado
                </Button>
              )}
              {contract && !['CANCELADO', 'ASSINADO'].includes(contract.status) && (
                <Button variant="destructive" size="sm"
                  onClick={() => handleStatusChange('CANCELADO', 'Contrato cancelado')} disabled={loading}>
                  <XCircle className="h-4 w-4 mr-1" />Cancelar Contrato
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* SEÇÃO 2: Dados da Representada */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Dados da Representada (Fórmula)</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Razão Social</Label>
            <Input value={representada.razaoSocial} onChange={(e) => setRepresentada((p) => ({ ...p, razaoSocial: e.target.value }))} className="text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">CNPJ</Label>
            <Input value={representada.cnpj} onChange={(e) => setRepresentada((p) => ({ ...p, cnpj: e.target.value }))} className="text-sm" />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label className="text-xs">Endereço</Label>
            <Input value={representada.endereco} onChange={(e) => setRepresentada((p) => ({ ...p, endereco: e.target.value }))} className="text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Cidade</Label>
            <Input value={representada.cidade} onChange={(e) => setRepresentada((p) => ({ ...p, cidade: e.target.value }))} className="text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">UF</Label>
              <Input value={representada.uf} onChange={(e) => setRepresentada((p) => ({ ...p, uf: e.target.value }))} className="text-sm" maxLength={2} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">CEP</Label>
              <Input value={representada.cep} onChange={(e) => setRepresentada((p) => ({ ...p, cep: e.target.value }))} className="text-sm" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Representante Legal</Label>
            <Input value={representada.representanteLegal} onChange={(e) => setRepresentada((p) => ({ ...p, representanteLegal: e.target.value }))} className="text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">CPF do Representante Legal</Label>
              <Input value={representada.representanteCpf} onChange={(e) => setRepresentada((p) => ({ ...p, representanteCpf: e.target.value }))} className="text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">RG do Representante Legal</Label>
              <Input value={representada.representanteRg} onChange={(e) => setRepresentada((p) => ({ ...p, representanteRg: e.target.value }))} className="text-sm" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SEÇÃO 3: Dados do Representante (somente leitura) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Dados do Representante (do cadastro)</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-0">
          {[
            ['Nome / Razão Social', repName],
            ['CPF / CNPJ', repDoc],
            ['Endereço', isPj ? profile.companyData?.address : profile.address],
            ['Cidade / UF', isPj
              ? (profile.companyData?.city && profile.companyData?.state ? `${profile.companyData.city}/${profile.companyData.state}` : null)
              : (profile.city && profile.state ? `${profile.city}/${profile.state}` : null)],
            ['CEP', isPj ? profile.companyData?.zipCode : profile.zipCode],
            ['Telefone', isPj ? profile.companyData?.phone : profile.phone],
            ['E-mail', isPj ? profile.companyData?.email : profile.email],
            ['CORE/COREMAT', profile.commercialInfo?.hasCore ? profile.commercialInfo.coreNumber : null],
            ['Validade CORE', profile.commercialInfo?.coreExpirationDate
              ? new Date(profile.commercialInfo.coreExpirationDate).toLocaleDateString('pt-BR') : null],
            ['1.º Sócio', profile.partners?.[0]?.fullName],
            ['CPF do Sócio', profile.partners?.[0]?.cpf],
          ].map(([label, value]) => (
            <div key={label as string} className="flex flex-col py-2 border-b border-gray-100">
              <span className="text-xs text-gray-400">{label}</span>
              <span className={`text-sm mt-0.5 font-medium ${!value ? 'text-red-400 italic' : 'text-gray-900'}`}>
                {value ?? 'Não informado'}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* SEÇÃO 4: Configurações do Contrato */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Configurações do Contrato</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1 sm:col-span-2">
            <Label className="text-xs">Zona de Atuação *</Label>
            <Textarea
              value={config.operationZone}
              onChange={(e) => setConfig((p) => ({ ...p, operationZone: e.target.value }))}
              rows={2}
              placeholder="Ex: região do Coxipó, CPA e Várzea Grande"
              className="text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Data de Início</Label>
            <Input type="date" value={config.startDate} onChange={(e) => setConfig((p) => ({ ...p, startDate: e.target.value }))} className="text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs flex items-center gap-2">
              Prazo
              <label className="flex items-center gap-1 font-normal cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.prazoIndeterminado}
                  onChange={(e) => setConfig((p) => ({ ...p, prazoIndeterminado: e.target.checked }))}
                />
                Indeterminado
              </label>
            </Label>
            {!config.prazoIndeterminado && (
              <Input type="date" value={config.endDate} onChange={(e) => setConfig((p) => ({ ...p, endDate: e.target.value }))} className="text-sm" />
            )}
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Cidade de Assinatura *</Label>
            <Input value={config.signatureCity} onChange={(e) => setConfig((p) => ({ ...p, signatureCity: e.target.value }))} className="text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">UF de Assinatura</Label>
              <Input value={config.signatureState} onChange={(e) => setConfig((p) => ({ ...p, signatureState: e.target.value }))} className="text-sm" maxLength={2} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Data de Assinatura *</Label>
              <Input type="date" value={config.signatureDate} onChange={(e) => setConfig((p) => ({ ...p, signatureDate: e.target.value }))} className="text-sm" />
            </div>
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label className="text-xs">Observações / Particularidades</Label>
            <Textarea value={config.notes} onChange={(e) => setConfig((p) => ({ ...p, notes: e.target.value }))} rows={2} className="text-sm" />
          </div>
        </CardContent>
      </Card>

      {/* SEÇÃO 5: Comissões */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Comissões – Anexo I</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-3 py-2 border text-xs font-semibold">Categoria</th>
                  <th className="px-3 py-2 border text-xs font-semibold w-24 text-center">Mín (%)</th>
                  <th className="px-3 py-2 border text-xs font-semibold w-24 text-center">Máx (%)</th>
                  <th className="px-3 py-2 border text-xs font-semibold">Observação</th>
                  <th className="px-2 py-2 border w-10"></th>
                </tr>
              </thead>
              <tbody>
                {commissions.map((c, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-2 py-1 border">
                      <Input value={c.category} className="text-xs h-7 border-0 shadow-none focus-visible:ring-0"
                        onChange={(e) => {
                          const u = [...commissions]; u[i] = { ...u[i], category: e.target.value }; setCommissions(u)
                        }} />
                    </td>
                    <td className="px-2 py-1 border">
                      <Input type="number" value={c.minPercent} min={0} max={100} step={0.5}
                        className="text-xs h-7 border-0 shadow-none focus-visible:ring-0 text-center"
                        onChange={(e) => {
                          const u = [...commissions]; u[i] = { ...u[i], minPercent: parseFloat(e.target.value) }; setCommissions(u)
                        }} />
                    </td>
                    <td className="px-2 py-1 border">
                      <Input type="number" value={c.maxPercent} min={0} max={100} step={0.5}
                        className="text-xs h-7 border-0 shadow-none focus-visible:ring-0 text-center"
                        onChange={(e) => {
                          const u = [...commissions]; u[i] = { ...u[i], maxPercent: parseFloat(e.target.value) }; setCommissions(u)
                        }} />
                    </td>
                    <td className="px-2 py-1 border">
                      <Input value={c.observation ?? ''} className="text-xs h-7 border-0 shadow-none focus-visible:ring-0"
                        onChange={(e) => {
                          const u = [...commissions]; u[i] = { ...u[i], observation: e.target.value }; setCommissions(u)
                        }} />
                    </td>
                    <td className="px-1 py-1 border text-center">
                      <button onClick={() => setCommissions(commissions.filter((_, j) => j !== i))}
                        className="text-red-400 hover:text-red-600">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button variant="outline" size="sm" className="mt-2 text-xs"
            onClick={() => setCommissions([...commissions, { category: 'Nova categoria', minPercent: 1, maxPercent: 5, observation: '' }])}>
            <Plus className="h-3 w-3 mr-1" />Adicionar categoria
          </Button>
        </CardContent>
      </Card>

      {/* SEÇÃO 6: Testemunhas */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Testemunhas</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {witnesses.map((w, i) => (
            <div key={i} className="space-y-2 p-3 border rounded-lg">
              <p className="text-xs font-semibold text-gray-600">Testemunha {i + 1}</p>
              <div className="space-y-1">
                <Label className="text-xs">Nome</Label>
                <Input value={w.name} className="text-sm"
                  onChange={(e) => {
                    const u = [...witnesses]; u[i] = { ...u[i], name: e.target.value }; setWitnesses(u)
                  }} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">CPF</Label>
                <Input value={w.cpf} className="text-sm"
                  onChange={(e) => {
                    const u = [...witnesses]; u[i] = { ...u[i], cpf: e.target.value }; setWitnesses(u)
                  }} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* SEÇÃO 7: Pré-visualização */}
      {showPreview && (
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Pré-visualização do Contrato</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handlePreview}>Atualizar prévia</Button>
              <Button size="sm" variant="ghost" onClick={() => setShowPreview(false)}>Fechar</Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <iframe
              ref={previewRef}
              className="w-full border-0 rounded-b-lg"
              style={{ height: '600px' }}
              title="Pré-visualização do Contrato"
            />
          </CardContent>
        </Card>
      )}

      {/* SEÇÃO 8: Histórico */}
      {contract?.history?.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Histórico do Contrato</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {contract.history.map((h: any) => (
                <div key={h.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-3.5 w-3.5 text-blue-600" />
                    </div>
                    <div className="w-px flex-1 bg-gray-200 mt-1" />
                  </div>
                  <div className="pb-3">
                    <p className="text-sm font-medium">{HISTORY_ACTION_LABELS[h.action] ?? h.action}</p>
                    {h.observation && <p className="text-xs text-gray-500">{h.observation}</p>}
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDateTime(h.createdAt)}
                      {h.createdBy?.name && ` — ${h.createdBy.name}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

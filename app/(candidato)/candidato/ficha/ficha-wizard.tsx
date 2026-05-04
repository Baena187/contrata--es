'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { toast } from '@/components/ui/toaster'
import { ChevronLeft, ChevronRight, Save, Send, Eye } from 'lucide-react'
import { Step1Identificacao } from './steps/step1-identificacao'
import { Step2TipoContratacao } from './steps/step2-tipo-contratacao'
import { Step3Empresa } from './steps/step3-empresa'
import { Step4Socios } from './steps/step4-socios'
import { Step5DadosBancarios } from './steps/step5-dados-bancarios'
import { Step6Comercial } from './steps/step6-comercial'
import { Step7Declaracoes } from './steps/step7-declaracoes'
import { Step8Revisao } from './steps/step8-revisao'

const STEPS = [
  { id: 1, title: 'Identificação' },
  { id: 2, title: 'Tipo de Contratação' },
  { id: 3, title: 'Dados da Empresa' },
  { id: 4, title: 'Sócios/Titulares' },
  { id: 5, title: 'Dados Bancários' },
  { id: 6, title: 'Informações Comerciais' },
  { id: 7, title: 'Declarações' },
  { id: 8, title: 'Revisão e Envio' },
]

interface FichaWizardProps {
  profile: any
  isEditable: boolean
}

export function FichaWizard({ profile, isEditable }: FichaWizardProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    // Step 1
    fullName: profile.fullName || '',
    fatherName: profile.fatherName || '',
    motherName: profile.motherName || '',
    gender: profile.gender || '',
    nationality: profile.nationality || 'Brasileiro(a)',
    birthplace: profile.birthplace || '',
    birthDate: profile.birthDate ? new Date(profile.birthDate).toISOString().split('T')[0] : '',
    maritalStatus: profile.maritalStatus || '',
    hasChildren: profile.hasChildren ?? false,
    childrenCount: profile.childrenCount || 0,
    address: profile.address || '',
    number: profile.number || '',
    complement: profile.complement || '',
    district: profile.district || '',
    city: profile.city || '',
    state: profile.state || '',
    zipCode: profile.zipCode || '',
    phone: profile.phone || '',
    mobile: profile.mobile || '',
    email: profile.email || '',
    cpf: profile.cpf || '',

    // Step 2
    hiringType: profile.hiringType || '',

    // Step 3 - Company
    corporateName: profile.companyData?.corporateName || '',
    tradeName: profile.companyData?.tradeName || '',
    cnpj: profile.companyData?.cnpj || '',
    stateRegistration: profile.companyData?.stateRegistration || '',
    companyAddress: profile.companyData?.address || '',
    companyNumber: profile.companyData?.number || '',
    companyComplement: profile.companyData?.complement || '',
    companyDistrict: profile.companyData?.district || '',
    companyCity: profile.companyData?.city || '',
    companyState: profile.companyData?.state || '',
    companyZipCode: profile.companyData?.zipCode || '',
    companyPhone: profile.companyData?.phone || '',
    companyEmail: profile.companyData?.email || '',

    // Step 4 - Partners
    partners: profile.partners || [],

    // Step 5 - Bank
    bank: profile.bankData?.bank || '',
    agency: profile.bankData?.agency || '',
    account: profile.bankData?.account || '',
    accountType: profile.bankData?.accountType || '',
    accountHolder: profile.bankData?.accountHolder || '',
    holderCpfCnpj: profile.bankData?.holderCpfCnpj || '',
    pixKey: profile.bankData?.pixKey || '',

    // Step 6 - Commercial
    operationArea: profile.commercialInfo?.operationArea || '',
    operationRegion: profile.commercialInfo?.operationRegion || '',
    marketExperienceTime: profile.commercialInfo?.marketExperienceTime || '',
    representedCompanies: profile.commercialInfo?.representedCompanies || '',
    previousExperience: profile.commercialInfo?.previousExperience || '',
    hasCore: profile.commercialInfo?.hasCore ?? false,
    coreNumber: profile.commercialInfo?.coreNumber || '',
    coreExpirationDate: profile.commercialInfo?.coreExpirationDate
      ? new Date(profile.commercialInfo.coreExpirationDate).toISOString().split('T')[0]
      : '',
    observations: profile.commercialInfo?.observations || '',

    // Step 7 - Declarations
    declaration1: false,
    declaration2: false,
    declaration3: false,
    declaration4: false,
  })

  const updateFormData = useCallback((updates: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...updates }))
  }, [])

  const progress = Math.round(((currentStep - 1) / (STEPS.length - 1)) * 100)

  async function saveData() {
    setSaving(true)
    try {
      const res = await fetch('/api/candidatos/ficha', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!res.ok) throw new Error()
      toast({ title: 'Rascunho salvo', variant: 'success' })
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  async function submitForm() {
    setSubmitting(true)
    try {
      // Salvar primeiro
      await fetch('/api/candidatos/ficha', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      // Depois enviar
      const res = await fetch('/api/candidatos/ficha/submit', {
        method: 'POST',
      })
      if (!res.ok) throw new Error()
      toast({ title: 'Cadastro enviado para análise!', variant: 'success' })
      router.push('/candidato/dashboard')
      router.refresh()
    } catch {
      toast({ title: 'Erro ao enviar cadastro', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  const needsCompanyData = ['REPRESENTANTE_PJ'].includes(formData.hiringType)
  const effectiveSteps = STEPS.filter((s) => {
    if (s.id === 3 && !needsCompanyData) return false
    if (s.id === 4 && !needsCompanyData) return false
    return true
  })

  const currentStepIndex = effectiveSteps.findIndex((s) => s.id === currentStep)
  const isFirst = currentStepIndex === 0
  const isLast = currentStepIndex === effectiveSteps.length - 1

  function goNext() {
    const next = effectiveSteps[currentStepIndex + 1]
    if (next) setCurrentStep(next.id)
  }

  function goPrev() {
    const prev = effectiveSteps[currentStepIndex - 1]
    if (prev) setCurrentStep(prev.id)
  }

  if (!isEditable) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Minha Ficha</h2>
          <span className="rounded-full bg-gray-100 text-gray-600 px-3 py-1 text-sm">
            Somente leitura
          </span>
        </div>
        <Step8Revisao formData={formData} readOnly />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Minha Ficha de Cadastro</h2>
        <Button variant="outline" size="sm" onClick={saveData} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Salvando...' : 'Salvar Rascunho'}
        </Button>
      </div>

      {/* Progresso */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium text-gray-700">
              Etapa {currentStepIndex + 1} de {effectiveSteps.length}: {effectiveSteps[currentStepIndex]?.title}
            </span>
            <span className="text-gray-400">{progress}% completo</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex gap-1 mt-3 overflow-x-auto">
            {effectiveSteps.map((step, idx) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={`flex-1 min-w-0 py-1.5 px-2 text-xs rounded transition-colors ${
                  step.id === currentStep
                    ? 'bg-blue-600 text-white font-medium'
                    : idx < currentStepIndex
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {step.title}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conteúdo da etapa */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{effectiveSteps[currentStepIndex]?.title}</CardTitle>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && (
            <Step1Identificacao data={formData} onChange={updateFormData} />
          )}
          {currentStep === 2 && (
            <Step2TipoContratacao data={formData} onChange={updateFormData} />
          )}
          {currentStep === 3 && (
            <Step3Empresa data={formData} onChange={updateFormData} />
          )}
          {currentStep === 4 && (
            <Step4Socios data={formData} onChange={updateFormData} />
          )}
          {currentStep === 5 && (
            <Step5DadosBancarios data={formData} onChange={updateFormData} />
          )}
          {currentStep === 6 && (
            <Step6Comercial data={formData} onChange={updateFormData} />
          )}
          {currentStep === 7 && (
            <Step7Declaracoes data={formData} onChange={updateFormData} />
          )}
          {currentStep === 8 && (
            <Step8Revisao formData={formData} />
          )}
        </CardContent>
      </Card>

      {/* Navegação */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={goPrev}
          disabled={isFirst}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Anterior
        </Button>

        <div className="flex gap-3">
          <Button variant="outline" onClick={saveData} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>

          {isLast ? (
            <Button onClick={submitForm} disabled={submitting} variant="success">
              <Send className="h-4 w-4 mr-2" />
              {submitting ? 'Enviando...' : 'Enviar para Análise'}
            </Button>
          ) : (
            <Button onClick={goNext}>
              Próximo
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

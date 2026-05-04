'use client'

import { getHiringTypeLabel } from '@/lib/utils'
import { CheckCircle, XCircle } from 'lucide-react'

interface Props {
  formData: any
  readOnly?: boolean
}

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex flex-col sm:flex-row sm:gap-4 py-1.5 border-b border-gray-100">
      <span className="text-xs text-gray-500 w-40 flex-shrink-0">{label}</span>
      <span className="text-sm text-gray-900 font-medium">{value || '-'}</span>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-800 bg-gray-50 px-3 py-2 rounded-md mb-3">
        {title}
      </h3>
      <div className="px-3 space-y-0.5">{children}</div>
    </div>
  )
}

export function Step8Revisao({ formData, readOnly }: Props) {
  const {
    fullName, cpf, birthDate, gender, maritalStatus, nationality, birthplace,
    hasChildren, childrenCount, address, number, complement, district, city, state, zipCode,
    phone, mobile, email, fatherName, motherName,
    hiringType, corporateName, tradeName, cnpj, companyAddress, companyCity, companyState,
    partners, bank, agency, account, accountType, accountHolder, holderCpfCnpj, pixKey,
    operationArea, operationRegion, marketExperienceTime, representedCompanies, hasCore, coreNumber, coreExpirationDate,
    declaration1, declaration2, declaration3, declaration4,
  } = formData

  const allDeclarations = declaration1 && declaration2 && declaration3 && declaration4

  return (
    <div className="space-y-2">
      {!readOnly && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 mb-4">
          <p className="text-sm text-blue-800">
            Revise todas as informações antes de enviar. Após o envio, você não poderá editar sem solicitação do RH.
          </p>
        </div>
      )}

      <Section title="Identificação Pessoal">
        <InfoRow label="Nome completo" value={fullName} />
        <InfoRow label="CPF" value={cpf} />
        <InfoRow label="Nome do pai" value={fatherName} />
        <InfoRow label="Nome da mãe" value={motherName} />
        <InfoRow label="Gênero" value={gender} />
        <InfoRow label="Nacionalidade" value={nationality} />
        <InfoRow label="Naturalidade" value={birthplace} />
        <InfoRow label="Data de nascimento" value={birthDate} />
        <InfoRow label="Estado civil" value={maritalStatus} />
        <InfoRow label="Filhos" value={hasChildren ? `Sim (${childrenCount})` : 'Não'} />
        <InfoRow label="Endereço" value={`${address}, ${number}${complement ? ', ' + complement : ''} - ${district}, ${city}/${state} - CEP ${zipCode}`} />
        <InfoRow label="Telefone" value={phone} />
        <InfoRow label="Celular" value={mobile} />
        <InfoRow label="E-mail" value={email} />
      </Section>

      <Section title="Tipo de Contratação">
        <InfoRow label="Tipo" value={hiringType ? getHiringTypeLabel(hiringType) : '-'} />
      </Section>

      {hiringType === 'REPRESENTANTE_PJ' && (
        <>
          <Section title="Dados da Empresa">
            <InfoRow label="Razão social" value={corporateName} />
            <InfoRow label="Nome fantasia" value={tradeName} />
            <InfoRow label="CNPJ" value={cnpj} />
            <InfoRow label="Endereço empresa" value={companyAddress ? `${companyAddress}, ${companyCity}/${companyState}` : '-'} />
          </Section>

          {partners && partners.length > 0 && (
            <Section title={`Sócios/Titulares (${partners.length})`}>
              {partners.map((p: any, i: number) => (
                <div key={i} className="py-2">
                  <InfoRow label={`Sócio ${i + 1}`} value={p.fullName} />
                  <InfoRow label="CPF" value={p.cpf} />
                  <InfoRow label="E-mail" value={p.email} />
                </div>
              ))}
            </Section>
          )}
        </>
      )}

      <Section title="Dados Bancários">
        <InfoRow label="Banco" value={bank} />
        <InfoRow label="Agência" value={agency} />
        <InfoRow label="Conta" value={account} />
        <InfoRow label="Tipo" value={accountType} />
        <InfoRow label="Titular" value={accountHolder} />
        <InfoRow label="CPF/CNPJ titular" value={holderCpfCnpj} />
        <InfoRow label="Chave Pix" value={pixKey} />
      </Section>

      <Section title="Informações Comerciais">
        <InfoRow label="Área de atuação" value={operationArea} />
        <InfoRow label="Região" value={operationRegion} />
        <InfoRow label="Experiência" value={marketExperienceTime} />
        <InfoRow label="CORE/COREMAT" value={hasCore ? `Sim - ${coreNumber} (válido até ${coreExpirationDate})` : 'Não'} />
      </Section>

      <Section title="Declarações">
        <div className="space-y-2 py-2">
          {[declaration1, declaration2, declaration3, declaration4].map((d, i) => (
            <div key={i} className="flex items-center gap-2">
              {d ? (
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
              )}
              <span className={`text-xs ${d ? 'text-gray-700' : 'text-red-500'}`}>
                {d ? 'Declaração aceita' : 'Pendente'} - Declaração {i + 1}
              </span>
            </div>
          ))}
          {!allDeclarations && !readOnly && (
            <p className="text-xs text-red-500 mt-2">
              Todas as declarações precisam ser aceitas na etapa anterior antes de enviar.
            </p>
          )}
        </div>
      </Section>
    </div>
  )
}

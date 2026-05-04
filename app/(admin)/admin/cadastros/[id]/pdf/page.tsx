import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { formatDate, formatDateTime, getHiringTypeLabel } from '@/lib/utils'

export default async function PdfPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const profile = await prisma.candidateProfile.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      companyData: true,
      partners: true,
      bankData: true,
      commercialInfo: true,
      documents: { orderBy: { uploadedAt: 'asc' } },
      declarations: { orderBy: { acceptedAt: 'asc' } },
      internalAnalysis: true,
    },
  })

  if (!profile) notFound()

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <title>Ficha Cadastral - {profile.fullName || profile.user.name}</title>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: Arial, sans-serif; font-size: 11px; color: #1a1a1a; padding: 20px; }
          h1 { font-size: 18px; text-align: center; margin-bottom: 4px; }
          h2 { font-size: 13px; background: #1e3a5f; color: white; padding: 6px 10px; margin: 16px 0 8px; }
          h3 { font-size: 11px; font-weight: bold; margin: 10px 0 4px; color: #333; }
          .subtitle { text-align: center; color: #555; margin-bottom: 16px; font-size: 10px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
          td, th { padding: 4px 8px; border: 1px solid #ccc; vertical-align: top; }
          th { background: #f5f5f5; font-weight: bold; width: 30%; }
          .section { margin-bottom: 12px; }
          .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: bold; }
          .approved { background: #d1fae5; color: #065f46; }
          .pending { background: #fef3c7; color: #92400e; }
          .rejected { background: #fee2e2; color: #991b1b; }
          .footer { margin-top: 40px; border-top: 2px solid #ccc; padding-top: 16px; }
          .signature-area { display: flex; gap: 40px; margin-top: 20px; }
          .signature-line { flex: 1; border-top: 1px solid #333; padding-top: 4px; text-align: center; font-size: 10px; }
          .internal-area { background: #f9fafb; border: 2px solid #e5e7eb; padding: 16px; margin-top: 20px; }
          @media print {
            body { padding: 0; }
            button { display: none; }
          }
        `}</style>
      </head>
      <body>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Cabeçalho */}
          <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '2px solid #1e3a5f', paddingBottom: '16px' }}>
            <h1>FICHA DE CADASTRO PARA CONTRATAÇÃO</h1>
            <p className="subtitle">Portal de Cadastro e Análise de Representantes</p>
            <div style={{ marginTop: '8px', fontSize: '10px', color: '#666' }}>
              <span>Gerado em: {formatDateTime(new Date())} | </span>
              <span>Status: {profile.status}</span>
            </div>
          </div>

          {/* Identificação */}
          <h2>1. IDENTIFICAÇÃO PESSOAL</h2>
          <table>
            <tbody>
              <tr><th>Nome Completo</th><td>{profile.fullName || '-'}</td></tr>
              <tr><th>CPF</th><td>{profile.cpf || '-'}</td></tr>
              <tr><th>Nome do Pai</th><td>{profile.fatherName || '-'}</td></tr>
              <tr><th>Nome da Mãe</th><td>{profile.motherName || '-'}</td></tr>
              <tr><th>Data de Nascimento</th><td>{formatDate(profile.birthDate)}</td></tr>
              <tr><th>Gênero</th><td>{profile.gender || '-'}</td></tr>
              <tr><th>Estado Civil</th><td>{profile.maritalStatus || '-'}</td></tr>
              <tr><th>Nacionalidade</th><td>{profile.nationality || '-'}</td></tr>
              <tr><th>Naturalidade</th><td>{profile.birthplace || '-'}</td></tr>
              <tr><th>Filhos</th><td>{profile.hasChildren ? `Sim (${profile.childrenCount})` : 'Não'}</td></tr>
            </tbody>
          </table>

          <h3>Endereço Residencial</h3>
          <table>
            <tbody>
              <tr><th>Endereço</th><td>{`${profile.address || ''}, ${profile.number || ''}${profile.complement ? ', ' + profile.complement : ''}`}</td></tr>
              <tr><th>Bairro / Cidade / UF</th><td>{`${profile.district || ''} - ${profile.city || ''}/${profile.state || ''}`}</td></tr>
              <tr><th>CEP</th><td>{profile.zipCode || '-'}</td></tr>
              <tr><th>Telefone / Celular</th><td>{`${profile.phone || ''} / ${profile.mobile || ''}`}</td></tr>
              <tr><th>E-mail</th><td>{profile.email || profile.user.email}</td></tr>
            </tbody>
          </table>

          {/* Tipo de contratação */}
          <h2>2. TIPO DE CONTRATAÇÃO</h2>
          <table>
            <tbody>
              <tr><th>Tipo</th><td>{profile.hiringType ? getHiringTypeLabel(profile.hiringType) : '-'}</td></tr>
            </tbody>
          </table>

          {/* Empresa */}
          {profile.companyData && (
            <>
              <h2>3. DADOS DA EMPRESA</h2>
              <table>
                <tbody>
                  <tr><th>Razão Social</th><td>{profile.companyData.corporateName || '-'}</td></tr>
                  <tr><th>Nome Fantasia</th><td>{profile.companyData.tradeName || '-'}</td></tr>
                  <tr><th>CNPJ</th><td>{profile.companyData.cnpj || '-'}</td></tr>
                  <tr><th>Insc. Estadual</th><td>{profile.companyData.stateRegistration || '-'}</td></tr>
                  <tr><th>Endereço</th><td>{profile.companyData.address} {profile.companyData.number} - {profile.companyData.city}/{profile.companyData.state}</td></tr>
                  <tr><th>Telefone / E-mail</th><td>{profile.companyData.phone} / {profile.companyData.email}</td></tr>
                </tbody>
              </table>
            </>
          )}

          {/* Sócios */}
          {profile.partners?.length > 0 && (
            <>
              <h2>4. SÓCIOS / TITULARES</h2>
              {profile.partners.map((p: any, i: number) => (
                <div key={i} style={{ marginBottom: '10px' }}>
                  <h3>Sócio {i + 1}</h3>
                  <table>
                    <tbody>
                      <tr><th>Nome</th><td>{p.fullName}</td></tr>
                      <tr><th>CPF / RG</th><td>{p.cpf} / {p.rg}</td></tr>
                      <tr><th>Estado Civil</th><td>{p.maritalStatus}</td></tr>
                      <tr><th>Profissão</th><td>{p.profession}</td></tr>
                      <tr><th>Contato</th><td>{p.phone} | {p.email}</td></tr>
                    </tbody>
                  </table>
                </div>
              ))}
            </>
          )}

          {/* Dados bancários */}
          {profile.bankData && (
            <>
              <h2>5. DADOS BANCÁRIOS</h2>
              <table>
                <tbody>
                  <tr><th>Banco</th><td>{profile.bankData.bank}</td></tr>
                  <tr><th>Agência / Conta</th><td>{profile.bankData.agency} / {profile.bankData.account} ({profile.bankData.accountType})</td></tr>
                  <tr><th>Titular</th><td>{profile.bankData.accountHolder} — {profile.bankData.holderCpfCnpj}</td></tr>
                  <tr><th>Chave Pix</th><td>{profile.bankData.pixKey || '-'}</td></tr>
                </tbody>
              </table>
            </>
          )}

          {/* Comercial */}
          {profile.commercialInfo && (
            <>
              <h2>6. INFORMAÇÕES COMERCIAIS</h2>
              <table>
                <tbody>
                  <tr><th>Área de Atuação</th><td>{profile.commercialInfo.operationArea}</td></tr>
                  <tr><th>Região</th><td>{profile.commercialInfo.operationRegion}</td></tr>
                  <tr><th>Experiência</th><td>{profile.commercialInfo.marketExperienceTime}</td></tr>
                  <tr><th>Empresas Representadas</th><td>{profile.commercialInfo.representedCompanies}</td></tr>
                  <tr><th>CORE/COREMAT</th><td>{profile.commercialInfo.hasCore ? `Sim — ${profile.commercialInfo.coreNumber} (Válido até ${formatDate(profile.commercialInfo.coreExpirationDate)})` : 'Não'}</td></tr>
                </tbody>
              </table>
            </>
          )}

          {/* Documentos */}
          {profile.documents?.length > 0 && (
            <>
              <h2>7. DOCUMENTOS ENVIADOS</h2>
              <table>
                <thead>
                  <tr><th>Documento</th><th>Arquivo</th><th>Data Envio</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {profile.documents.map((doc: any) => (
                    <tr key={doc.id}>
                      <td>{doc.documentType}</td>
                      <td>{doc.originalName}</td>
                      <td>{formatDate(doc.uploadedAt)}</td>
                      <td>
                        <span className={`badge ${doc.status === 'APROVADO' ? 'approved' : doc.status === 'RECUSADO' ? 'rejected' : 'pending'}`}>
                          {doc.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {/* Declarações */}
          <h2>8. DECLARAÇÕES LGPD</h2>
          <table>
            <tbody>
              {profile.declarations?.map((d: any, i: number) => (
                <tr key={i}>
                  <th style={{ width: '60%' }}>{d.declarationType}</th>
                  <td>Aceite em: {formatDateTime(d.acceptedAt)} | IP: {d.ipAddress || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Área de assinatura */}
          <div className="footer">
            <p style={{ textAlign: 'center', marginBottom: '8px' }}>
              Local e data: ___________________________________, ___/___/______
            </p>
            <div className="signature-area">
              <div className="signature-line">
                <div style={{ height: '50px' }}></div>
                Assinatura do Candidato / Representante Legal
              </div>
              <div className="signature-line">
                <div style={{ height: '50px' }}></div>
                Assinatura da Empresa / Responsável
              </div>
            </div>
          </div>

          {/* Área interna */}
          <div className="internal-area" style={{ marginTop: '30px' }}>
            <h2 style={{ margin: '-16px -16px 12px', background: '#374151' }}>USO EXCLUSIVO DA EMPRESA</h2>
            {profile.internalAnalysis && (
              <>
                {profile.internalAnalysis.rhOpinion && <p><strong>Parecer RH:</strong> {profile.internalAnalysis.rhOpinion}</p>}
                {profile.internalAnalysis.financialOpinion && <p><strong>Parecer Financeiro:</strong> {profile.internalAnalysis.financialOpinion}</p>}
                {profile.internalAnalysis.legalOpinion && <p><strong>Parecer Jurídico:</strong> {profile.internalAnalysis.legalOpinion}</p>}
                {profile.internalAnalysis.finalRecommendation && <p><strong>Recomendação Final:</strong> {profile.internalAnalysis.finalRecommendation}</p>}
              </>
            )}
            <div style={{ marginTop: '20px', display: 'flex', gap: '20px' }}>
              <div style={{ flex: 1, borderTop: '1px solid #999', paddingTop: '4px', textAlign: 'center', fontSize: '10px' }}>
                Aprovador / Data
              </div>
              <div style={{ flex: 1, borderTop: '1px solid #999', paddingTop: '4px', textAlign: 'center', fontSize: '10px' }}>
                Parecer Final
              </div>
            </div>
          </div>

          {/* Botão imprimir */}
          <div style={{ textAlign: 'center', marginTop: '20px' }} className="no-print">
            <button
              onClick={() => window.print()}
              style={{ padding: '8px 24px', background: '#1e3a5f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}
            >
              Imprimir / Salvar PDF
            </button>
          </div>
        </div>
        <script dangerouslySetInnerHTML={{ __html: 'window.print && window.addEventListener("load", ()=>{})' }} />
      </body>
    </html>
  )
}

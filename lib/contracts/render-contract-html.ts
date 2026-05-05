export interface ContractData {
  // Representada
  representadaRazaoSocial: string
  representadaCnpj: string
  representadaEndereco: string
  representadaCidade: string
  representadaUf: string
  representadaCep: string
  representadaRepresentanteLegal: string
  representadaRepresentanteCpf: string
  representadaRepresentanteRg: string

  // Representante
  representanteRazaoSocial: string
  representanteNomeFantasia?: string
  representanteCnpj?: string
  representanteCpf?: string
  representanteRg?: string
  representanteEndereco: string
  representanteNumero?: string
  representanteComplemento?: string
  representanteBairro?: string
  representanteCidade: string
  representanteUf: string
  representanteCep?: string
  representanteTelefone?: string
  representanteEmail?: string
  representanteCore?: string
  representanteCoreValidade?: string
  socioNome?: string
  socioCpf?: string
  socioRg?: string

  // Configurações
  operationZone: string
  signatureCity: string
  signatureState: string
  signatureDate: string
  startDate?: string
  endDate?: string
  prazoIndeterminado: boolean
  notes?: string

  // Comissões
  commissions: Array<{
    category: string
    minPercent: number
    maxPercent: number
    observation?: string
  }>

  // Testemunhas
  witness1Name: string
  witness1Cpf: string
  witness2Name: string
  witness2Cpf: string
}

export function renderContractHtml(data: ContractData): string {
  const isPj = !!data.representanteCnpj

  const enderecoCompleto = [
    data.representanteEndereco,
    data.representanteNumero,
    data.representanteComplemento,
    data.representanteBairro,
    `${data.representanteCidade}/${data.representanteUf}`,
    data.representanteCep ? `CEP ${data.representanteCep}` : '',
  ]
    .filter(Boolean)
    .join(', ')

  const prazoTexto = data.prazoIndeterminado
    ? 'por prazo indeterminado'
    : `por prazo determinado, com vigência até ${data.endDate || '___/___/______'}`

  const comissoesLinhas = data.commissions
    .map(
      (c) =>
        `<tr>
          <td style="padding:6px 10px;border:1px solid #ccc;">${c.category}</td>
          <td style="padding:6px 10px;border:1px solid #ccc;text-align:center;">${c.minPercent}%</td>
          <td style="padding:6px 10px;border:1px solid #ccc;text-align:center;">${c.maxPercent}%</td>
          <td style="padding:6px 10px;border:1px solid #ccc;">${c.observation || '-'}</td>
        </tr>`
    )
    .join('')

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"/>
<title>Contrato de Representação Comercial</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: "Times New Roman", Times, serif; font-size: 12pt; color: #000; background: #fff; }
  .page { max-width: 800px; margin: 0 auto; padding: 40px 60px; }
  h1 { font-size: 14pt; text-align: center; text-transform: uppercase; font-weight: bold; margin-bottom: 6px; }
  h2 { font-size: 12pt; text-align: center; font-weight: bold; margin-bottom: 24px; text-decoration: underline; }
  .clausula { margin-bottom: 18px; }
  .clausula-titulo { font-weight: bold; text-transform: uppercase; margin-bottom: 6px; }
  p { text-align: justify; line-height: 1.6; margin-bottom: 10px; }
  .partes { margin: 20px 0; border: 1px solid #ccc; padding: 16px; background: #f9f9f9; }
  .parte { margin-bottom: 12px; }
  .parte-titulo { font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #ccc; margin-bottom: 6px; padding-bottom: 4px; }
  .assinaturas { margin-top: 60px; }
  .assinatura-linha { display: flex; gap: 60px; margin-top: 50px; }
  .assinatura-bloco { flex: 1; text-align: center; }
  .assinatura-bloco .linha { border-top: 1px solid #000; padding-top: 6px; font-size: 10pt; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
  th { background: #e8e8e8; padding: 6px 10px; border: 1px solid #ccc; text-align: left; font-size: 10pt; }
  td { font-size: 10pt; }
  .testemunhas { margin-top: 40px; }
  .testemunhas .assinatura-linha { margin-top: 30px; }
  .anexo { page-break-before: always; margin-top: 40px; }
  .no-print { display: block; text-align: center; margin: 30px 0; }
  @media print {
    .no-print { display: none; }
    .page { padding: 20px 40px; }
  }
</style>
</head>
<body>
<div class="page">

<div class="no-print">
  <button onclick="window.print()" style="padding:10px 28px;background:#1e3a5f;color:#fff;border:none;border-radius:4px;font-size:13px;cursor:pointer;margin-right:10px;">
    Imprimir / Salvar PDF
  </button>
</div>

<h1>Contrato de Representação Comercial</h1>
<h2>Lei nº 4.886/65 e suas alterações</h2>

<div class="partes">
  <div class="parte">
    <div class="parte-titulo">Representada</div>
    <p><strong>${data.representadaRazaoSocial}</strong>, pessoa jurídica de direito privado, inscrita no CNPJ sob o n.º <strong>${data.representadaCnpj}</strong>, com sede na ${data.representadaEndereco}, CEP ${data.representadaCep}, Município de ${data.representadaCidade}, Estado de ${data.representadaUf}, neste ato representada por seu sócio-administrador <strong>${data.representadaRepresentanteLegal}</strong>, brasileiro, ${data.representadaRepresentanteLegal.toLowerCase().includes('a') ? 'casada' : 'casado'}, empresário, portador do CPF n.º <strong>${data.representadaRepresentanteCpf}</strong> e RG <strong>${data.representadaRepresentanteRg}</strong>.</p>
  </div>
  <div class="parte">
    <div class="parte-titulo">Representante</div>
    <p><strong>${data.representanteRazaoSocial}</strong>${isPj ? `, pessoa jurídica de direito privado, inscrita no CNPJ sob o n.º <strong>${data.representanteCnpj}</strong>` : `, pessoa física, inscrita no CPF sob o n.º <strong>${data.representanteCpf}</strong>${data.representanteRg ? `, portadora do RG <strong>${data.representanteRg}</strong>` : ''}`}, com ${isPj ? 'sede' : 'endereço'} no ${enderecoCompleto}${data.representanteCore ? `, inscrita no COREMAT sob o n.º <strong>${data.representanteCore}</strong>${data.representanteCoreValidade ? `, com validade até ${data.representanteCoreValidade}` : ''}` : ''}.${data.socioNome ? ` Representada neste ato por <strong>${data.socioNome}</strong>${data.socioCpf ? `, CPF n.º ${data.socioCpf}` : ''}.` : ''}</p>
  </div>
</div>

<p>Resolvem as partes acima identificadas celebrar o presente <strong>CONTRATO DE REPRESENTAÇÃO COMERCIAL</strong>, regido pela Lei n.º 4.886/65 e suas alterações, mediante as seguintes cláusulas e condições:</p>

<div class="clausula">
  <div class="clausula-titulo">Cláusula Primeira – Do Objeto</div>
  <p>O presente contrato tem por objeto a representação comercial autônoma, sem vínculo empregatício, pela qual o(a) REPRESENTANTE se obriga a promover, por conta da REPRESENTADA, a realização de negócios mercantis, angariando pedidos de compra e venda de mercadorias fabricadas e/ou comercializadas pela REPRESENTADA na área delimitada neste instrumento.</p>
</div>

<div class="clausula">
  <div class="clausula-titulo">Cláusula Segunda – Da Exclusividade</div>
  <p>A representação comercial objeto deste contrato será exercida com exclusividade, ficando o(a) REPRESENTANTE impedido(a) de representar, na mesma área e ramo de atividade, outros fabricantes ou fornecedores de produtos concorrentes aos da REPRESENTADA, salvo autorização expressa e por escrito.</p>
</div>

<div class="clausula">
  <div class="clausula-titulo">Cláusula Terceira – Das Obrigações do Representante</div>
  <p>São obrigações do(a) REPRESENTANTE: (a) promover ativamente os produtos da REPRESENTADA na área de atuação; (b) encaminhar regularmente pedidos e informações de mercado; (c) manter registro regular no CORE/COREMAT; (d) não praticar atos que possam comprometer a imagem da REPRESENTADA; (e) guardar sigilo sobre informações comerciais e estratégicas da REPRESENTADA.</p>
</div>

<div class="clausula">
  <div class="clausula-titulo">Cláusula Quarta – Da Área de Atuação</div>
  <p>A área de atuação do(a) REPRESENTANTE compreende: <strong>${data.operationZone}</strong>.</p>
  <p>Fica vedada a atuação em outras regiões sem prévia autorização escrita da REPRESENTADA.</p>
</div>

<div class="clausula">
  <div class="clausula-titulo">Cláusula Quinta – Das Comissões</div>
  <p>Pela representação ora contratada, o(a) REPRESENTANTE fará jus a comissões sobre os pedidos aprovados e efetivamente entregues, conforme percentuais definidos no Anexo I deste contrato, que é parte integrante do presente instrumento.</p>
  <p>As comissões serão calculadas sobre o valor líquido das mercadorias, excluídos impostos, fretes e devoluções, e pagas mensalmente após a confirmação do recebimento pelo cliente.</p>
</div>

<div class="clausula">
  <div class="clausula-titulo">Cláusula Sexta – Do Prazo</div>
  <p>O presente contrato é celebrado ${prazoTexto}, com início em <strong>${data.startDate || '___/___/______'}</strong>, podendo ser rescindido por qualquer das partes mediante comunicação prévia de 30 (trinta) dias.</p>
</div>

<div class="clausula">
  <div class="clausula-titulo">Cláusula Sétima – Da Rescisão</div>
  <p>O presente contrato poderá ser rescindido por qualquer das partes, mediante aviso prévio de 30 (trinta) dias. Em caso de rescisão sem justa causa pela REPRESENTADA, serão devidas ao(à) REPRESENTANTE as verbas indenizatórias previstas na Lei n.º 4.886/65. Em caso de rescisão por justa causa devidamente comprovada, não serão devidas indenizações.</p>
</div>

<div class="clausula">
  <div class="clausula-titulo">Cláusula Oitava – Das Disposições Gerais</div>
  <p>As partes elegem o Foro da Comarca de <strong>${data.signatureCity}/${data.signatureState}</strong> para dirimir quaisquer dúvidas oriundas do presente contrato, com renúncia expressa a qualquer outro, por mais privilegiado que seja.</p>
  ${data.notes ? `<p><strong>Observações:</strong> ${data.notes}</p>` : ''}
</div>

<p>E, por estarem justas e contratadas, as partes assinam o presente instrumento em 02 (duas) vias de igual teor e forma, na presença das testemunhas abaixo.</p>

<div class="assinaturas">
  <p style="text-align:center;margin-bottom:40px;"><strong>${data.signatureCity}/${data.signatureState}, ${data.signatureDate}</strong></p>
  <div class="assinatura-linha">
    <div class="assinatura-bloco">
      <div class="linha">
        <strong>${data.representadaRazaoSocial}</strong><br/>
        CNPJ: ${data.representadaCnpj}<br/>
        Representada por: ${data.representadaRepresentanteLegal}
      </div>
    </div>
    <div class="assinatura-bloco">
      <div class="linha">
        <strong>${data.representanteRazaoSocial}</strong><br/>
        ${isPj ? `CNPJ: ${data.representanteCnpj}` : `CPF: ${data.representanteCpf}`}<br/>
        Representante
      </div>
    </div>
  </div>

  <div class="testemunhas">
    <p style="font-weight:bold;margin-top:30px;">Testemunhas:</p>
    <div class="assinatura-linha">
      <div class="assinatura-bloco">
        <div class="linha">
          ${data.witness1Name}<br/>CPF: ${data.witness1Cpf}
        </div>
      </div>
      <div class="assinatura-bloco">
        <div class="linha">
          ${data.witness2Name}<br/>CPF: ${data.witness2Cpf}
        </div>
      </div>
    </div>
  </div>
</div>

<!-- ANEXO I -->
<div class="anexo">
  <h1>Anexo I – Tabela de Comissões</h1>
  <p style="margin:16px 0;">Referente ao Contrato de Representação Comercial firmado entre <strong>${data.representadaRazaoSocial}</strong> e <strong>${data.representanteRazaoSocial}</strong>.</p>

  <table>
    <thead>
      <tr>
        <th>Categoria de Produto</th>
        <th style="text-align:center;width:100px;">Mínimo (%)</th>
        <th style="text-align:center;width:100px;">Máximo (%)</th>
        <th>Observação</th>
      </tr>
    </thead>
    <tbody>
      ${comissoesLinhas}
    </tbody>
  </table>

  <p style="margin-top:16px;">As comissões acima são calculadas sobre o valor líquido dos pedidos efetivamente entregues e recebidos.</p>

  <div class="assinaturas" style="margin-top:50px;">
    <p style="text-align:center;margin-bottom:30px;"><strong>${data.signatureCity}/${data.signatureState}, ${data.signatureDate}</strong></p>
    <div class="assinatura-linha">
      <div class="assinatura-bloco">
        <div class="linha">
          <strong>${data.representadaRazaoSocial}</strong>
        </div>
      </div>
      <div class="assinatura-bloco">
        <div class="linha">
          <strong>${data.representanteRazaoSocial}</strong>
        </div>
      </div>
    </div>
  </div>
</div>

</div>
</body>
</html>`
}

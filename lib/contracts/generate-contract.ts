import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  HeadingLevel,
  PageBreak,
  UnderlineType,
} from 'docx'
import type { ContractData } from './render-contract-html'

function bold(text: string) {
  return new TextRun({ text, bold: true })
}

function normal(text: string) {
  return new TextRun({ text })
}

function clausulaTitulo(text: string) {
  return new Paragraph({
    children: [new TextRun({ text: text.toUpperCase(), bold: true })],
    spacing: { before: 280, after: 120 },
  })
}

function paragrafo(children: TextRun[], spacing = { before: 0, after: 160 }) {
  return new Paragraph({
    children,
    alignment: AlignmentType.JUSTIFIED,
    spacing,
  })
}

function linha(text = '') {
  return new Paragraph({ children: [normal(text)], spacing: { before: 0, after: 80 } })
}

export async function generateContractDocx(data: ContractData): Promise<Buffer> {
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

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Título
          new Paragraph({
            children: [new TextRun({ text: 'CONTRATO DE REPRESENTAÇÃO COMERCIAL', bold: true, size: 28 })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Lei nº 4.886/65 e suas alterações',
                underline: { type: UnderlineType.SINGLE },
                size: 24,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),

          // Partes
          new Paragraph({
            children: [bold('REPRESENTADA:')],
            spacing: { before: 200, after: 80 },
          }),
          paragrafo([
            bold(data.representadaRazaoSocial),
            normal(
              `, pessoa jurídica de direito privado, inscrita no CNPJ sob o n.º `
            ),
            bold(data.representadaCnpj),
            normal(
              `, com sede na ${data.representadaEndereco}, CEP ${data.representadaCep}, Município de ${data.representadaCidade}, Estado de ${data.representadaUf}, neste ato representada por seu sócio-administrador `
            ),
            bold(data.representadaRepresentanteLegal),
            normal(
              `, brasileiro, casado, empresário, portador do CPF n.º `
            ),
            bold(data.representadaRepresentanteCpf),
            normal(` e RG `),
            bold(data.representadaRepresentanteRg),
            normal('.'),
          ]),

          new Paragraph({
            children: [bold('REPRESENTANTE:')],
            spacing: { before: 200, after: 80 },
          }),
          paragrafo([
            bold(data.representanteRazaoSocial),
            normal(
              isPj
                ? `, pessoa jurídica de direito privado, inscrita no CNPJ sob o n.º `
                : `, pessoa física, inscrita no CPF sob o n.º `
            ),
            bold(isPj ? data.representanteCnpj || '' : data.representanteCpf || ''),
            ...(data.representanteRg && !isPj
              ? [normal(', portadora do RG '), bold(data.representanteRg)]
              : []),
            normal(`, com ${isPj ? 'sede' : 'endereço'} no ${enderecoCompleto}`),
            ...(data.representanteCore
              ? [
                  normal(`, inscrita no COREMAT sob o n.º `),
                  bold(data.representanteCore),
                  ...(data.representanteCoreValidade
                    ? [normal(`, com validade até ${data.representanteCoreValidade}`)]
                    : []),
                ]
              : []),
            normal('.'),
            ...(data.socioNome
              ? [
                  normal(` Representada neste ato por `),
                  bold(data.socioNome),
                  ...(data.socioCpf ? [normal(`, CPF n.º ${data.socioCpf}`)] : []),
                  normal('.'),
                ]
              : []),
          ]),

          paragrafo(
            [
              normal(
                'Resolvem as partes acima identificadas celebrar o presente '
              ),
              bold('CONTRATO DE REPRESENTAÇÃO COMERCIAL'),
              normal(
                ', regido pela Lei n.º 4.886/65 e suas alterações, mediante as seguintes cláusulas e condições:'
              ),
            ],
            { before: 280, after: 200 }
          ),

          // Cláusulas
          clausulaTitulo('Cláusula Primeira – Do Objeto'),
          paragrafo([
            normal(
              'O presente contrato tem por objeto a representação comercial autônoma, sem vínculo empregatício, pela qual o(a) REPRESENTANTE se obriga a promover, por conta da REPRESENTADA, a realização de negócios mercantis, angariando pedidos de compra e venda de mercadorias fabricadas e/ou comercializadas pela REPRESENTADA na área delimitada neste instrumento.'
            ),
          ]),

          clausulaTitulo('Cláusula Segunda – Da Exclusividade'),
          paragrafo([
            normal(
              'A representação comercial objeto deste contrato será exercida com exclusividade, ficando o(a) REPRESENTANTE impedido(a) de representar, na mesma área e ramo de atividade, outros fabricantes ou fornecedores de produtos concorrentes aos da REPRESENTADA, salvo autorização expressa e por escrito.'
            ),
          ]),

          clausulaTitulo('Cláusula Terceira – Das Obrigações do Representante'),
          paragrafo([
            normal(
              'São obrigações do(a) REPRESENTANTE: (a) promover ativamente os produtos da REPRESENTADA na área de atuação; (b) encaminhar regularmente pedidos e informações de mercado; (c) manter registro regular no CORE/COREMAT; (d) não praticar atos que possam comprometer a imagem da REPRESENTADA; (e) guardar sigilo sobre informações comerciais e estratégicas da REPRESENTADA.'
            ),
          ]),

          clausulaTitulo('Cláusula Quarta – Da Área de Atuação'),
          paragrafo([
            normal('A área de atuação do(a) REPRESENTANTE compreende: '),
            bold(data.operationZone),
            normal('.'),
          ]),
          paragrafo([
            normal(
              'Fica vedada a atuação em outras regiões sem prévia autorização escrita da REPRESENTADA.'
            ),
          ]),

          clausulaTitulo('Cláusula Quinta – Das Comissões'),
          paragrafo([
            normal(
              'Pela representação ora contratada, o(a) REPRESENTANTE fará jus a comissões sobre os pedidos aprovados e efetivamente entregues, conforme percentuais definidos no Anexo I deste contrato, que é parte integrante do presente instrumento.'
            ),
          ]),
          paragrafo([
            normal(
              'As comissões serão calculadas sobre o valor líquido das mercadorias, excluídos impostos, fretes e devoluções, e pagas mensalmente após a confirmação do recebimento pelo cliente.'
            ),
          ]),

          clausulaTitulo('Cláusula Sexta – Do Prazo'),
          paragrafo([
            normal('O presente contrato é celebrado '),
            bold(prazoTexto),
            normal(`, com início em `),
            bold(data.startDate || '___/___/______'),
            normal(
              ', podendo ser rescindido por qualquer das partes mediante comunicação prévia de 30 (trinta) dias.'
            ),
          ]),

          clausulaTitulo('Cláusula Sétima – Da Rescisão'),
          paragrafo([
            normal(
              'O presente contrato poderá ser rescindido por qualquer das partes, mediante aviso prévio de 30 (trinta) dias. Em caso de rescisão sem justa causa pela REPRESENTADA, serão devidas ao(à) REPRESENTANTE as verbas indenizatórias previstas na Lei n.º 4.886/65. Em caso de rescisão por justa causa devidamente comprovada, não serão devidas indenizações.'
            ),
          ]),

          clausulaTitulo('Cláusula Oitava – Das Disposições Gerais'),
          paragrafo([
            normal(
              `As partes elegem o Foro da Comarca de `
            ),
            bold(`${data.signatureCity}/${data.signatureState}`),
            normal(
              ' para dirimir quaisquer dúvidas oriundas do presente contrato, com renúncia expressa a qualquer outro, por mais privilegiado que seja.'
            ),
          ]),
          ...(data.notes
            ? [paragrafo([bold('Observações: '), normal(data.notes)])]
            : []),

          paragrafo([
            normal(
              'E, por estarem justas e contratadas, as partes assinam o presente instrumento em 02 (duas) vias de igual teor e forma, na presença das testemunhas abaixo.'
            ),
          ]),

          // Data e local
          new Paragraph({
            children: [
              bold(`${data.signatureCity}/${data.signatureState}, ${data.signatureDate}`),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 600 },
          }),

          // Assinaturas
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({ children: [normal('_'.repeat(40))], alignment: AlignmentType.CENTER }),
                      new Paragraph({ children: [bold(data.representadaRazaoSocial)], alignment: AlignmentType.CENTER }),
                      new Paragraph({ children: [normal(`CNPJ: ${data.representadaCnpj}`)], alignment: AlignmentType.CENTER }),
                      new Paragraph({ children: [normal('REPRESENTADA')], alignment: AlignmentType.CENTER }),
                    ],
                    borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({ children: [normal('_'.repeat(40))], alignment: AlignmentType.CENTER }),
                      new Paragraph({ children: [bold(data.representanteRazaoSocial)], alignment: AlignmentType.CENTER }),
                      new Paragraph({ children: [normal(isPj ? `CNPJ: ${data.representanteCnpj}` : `CPF: ${data.representanteCpf}`)], alignment: AlignmentType.CENTER }),
                      new Paragraph({ children: [normal('REPRESENTANTE')], alignment: AlignmentType.CENTER }),
                    ],
                    borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                  }),
                ],
              }),
            ],
          }),

          // Testemunhas
          new Paragraph({ children: [bold('TESTEMUNHAS:')], spacing: { before: 600, after: 200 } }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({ children: [normal('_'.repeat(40))], alignment: AlignmentType.CENTER }),
                      new Paragraph({ children: [normal(data.witness1Name)], alignment: AlignmentType.CENTER }),
                      new Paragraph({ children: [normal(`CPF: ${data.witness1Cpf}`)], alignment: AlignmentType.CENTER }),
                    ],
                    borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({ children: [normal('_'.repeat(40))], alignment: AlignmentType.CENTER }),
                      new Paragraph({ children: [normal(data.witness2Name)], alignment: AlignmentType.CENTER }),
                      new Paragraph({ children: [normal(`CPF: ${data.witness2Cpf}`)], alignment: AlignmentType.CENTER }),
                    ],
                    borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                  }),
                ],
              }),
            ],
          }),

          // ANEXO I
          new Paragraph({ children: [new PageBreak()] }),
          new Paragraph({
            children: [new TextRun({ text: 'ANEXO I – TABELA DE COMISSÕES', bold: true, size: 28 })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),
          paragrafo([
            normal('Referente ao Contrato de Representação Comercial firmado entre '),
            bold(data.representadaRazaoSocial),
            normal(' e '),
            bold(data.representanteRazaoSocial),
            normal('.'),
          ]),

          // Tabela de comissões
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [bold('Categoria')], alignment: AlignmentType.CENTER })], shading: { fill: 'E8E8E8' } }),
                  new TableCell({ children: [new Paragraph({ children: [bold('Mínimo (%)')], alignment: AlignmentType.CENTER })], shading: { fill: 'E8E8E8' } }),
                  new TableCell({ children: [new Paragraph({ children: [bold('Máximo (%)')], alignment: AlignmentType.CENTER })], shading: { fill: 'E8E8E8' } }),
                  new TableCell({ children: [new Paragraph({ children: [bold('Observação')], alignment: AlignmentType.CENTER })], shading: { fill: 'E8E8E8' } }),
                ],
              }),
              ...data.commissions.map(
                (c) =>
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph({ children: [normal(c.category)] })] }),
                      new TableCell({ children: [new Paragraph({ children: [normal(`${c.minPercent}%`)], alignment: AlignmentType.CENTER })] }),
                      new TableCell({ children: [new Paragraph({ children: [normal(`${c.maxPercent}%`)], alignment: AlignmentType.CENTER })] }),
                      new TableCell({ children: [new Paragraph({ children: [normal(c.observation || '-')] })] }),
                    ],
                  })
              ),
            ],
          }),

          new Paragraph({
            children: [normal('As comissões acima são calculadas sobre o valor líquido dos pedidos efetivamente entregues e recebidos.')],
            spacing: { before: 200, after: 600 },
            alignment: AlignmentType.JUSTIFIED,
          }),

          new Paragraph({
            children: [bold(`${data.signatureCity}/${data.signatureState}, ${data.signatureDate}`)],
            alignment: AlignmentType.CENTER,
            spacing: { after: 600 },
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({ children: [normal('_'.repeat(40))], alignment: AlignmentType.CENTER }),
                      new Paragraph({ children: [bold(data.representadaRazaoSocial)], alignment: AlignmentType.CENTER }),
                    ],
                    borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({ children: [normal('_'.repeat(40))], alignment: AlignmentType.CENTER }),
                      new Paragraph({ children: [bold(data.representanteRazaoSocial)], alignment: AlignmentType.CENTER }),
                    ],
                    borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                  }),
                ],
              }),
            ],
          }),
        ],
      },
    ],
  })

  return Buffer.from(await Packer.toBuffer(doc))
}

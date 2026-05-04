import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  const adminPassword = await bcrypt.hash('admin123', 12)
  const rhPassword = await bcrypt.hash('rh123', 12)
  const financeiroPassword = await bcrypt.hash('financeiro123', 12)
  const juridicoPassword = await bcrypt.hash('juridico123', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@empresa.com' },
    update: {},
    create: { name: 'Administrador', email: 'admin@empresa.com', passwordHash: adminPassword, role: 'ADMIN' },
  })

  const rh = await prisma.user.upsert({
    where: { email: 'rh@empresa.com' },
    update: {},
    create: { name: 'Analista RH', email: 'rh@empresa.com', passwordHash: rhPassword, role: 'RH' },
  })

  await prisma.user.upsert({
    where: { email: 'financeiro@empresa.com' },
    update: {},
    create: { name: 'Analista Financeiro', email: 'financeiro@empresa.com', passwordHash: financeiroPassword, role: 'FINANCEIRO' },
  })

  await prisma.user.upsert({
    where: { email: 'juridico@empresa.com' },
    update: {},
    create: { name: 'Analista Jurídico', email: 'juridico@empresa.com', passwordHash: juridicoPassword, role: 'JURIDICO' },
  })

  console.log('✅ Usuários internos criados')

  // Candidato 1 - Aprovado
  const candidato1Password = await bcrypt.hash('candidato123', 12)
  const user1 = await prisma.user.upsert({
    where: { email: 'joao.silva@email.com' },
    update: {},
    create: { name: 'João Silva Santos', email: 'joao.silva@email.com', passwordHash: candidato1Password, role: 'CANDIDATO' },
  })

  const profile1 = await prisma.candidateProfile.upsert({
    where: { userId: user1.id },
    update: {},
    create: {
      userId: user1.id,
      status: 'APROVADO',
      hiringType: 'REPRESENTANTE_PJ',
      fullName: 'João Silva Santos',
      fatherName: 'José Santos',
      motherName: 'Maria Silva',
      gender: 'MASCULINO',
      nationality: 'Brasileiro',
      birthplace: 'São Paulo - SP',
      birthDate: new Date('1985-06-15'),
      maritalStatus: 'CASADO',
      hasChildren: true,
      childrenCount: 2,
      address: 'Rua das Flores',
      number: '123',
      complement: 'Apto 45',
      district: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310-100',
      phone: '(11) 3333-4444',
      mobile: '(11) 99999-8888',
      email: 'joao.silva@email.com',
      cpf: '123.456.789-00',
      submittedAt: new Date('2024-01-15'),
    },
  })

  await prisma.companyData.upsert({
    where: { candidateProfileId: profile1.id },
    update: {},
    create: {
      candidateProfileId: profile1.id,
      corporateName: 'JS Representações Comerciais Ltda',
      tradeName: 'JS Representações',
      cnpj: '12.345.678/0001-90',
      stateRegistration: '123.456.789.000',
      address: 'Av. Paulista',
      number: '1000',
      complement: 'Sala 101',
      district: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310-100',
      phone: '(11) 3333-5555',
      email: 'contato@jsrepresentacoes.com.br',
    },
  })

  await prisma.bankData.upsert({
    where: { candidateProfileId: profile1.id },
    update: {},
    create: {
      candidateProfileId: profile1.id,
      bank: 'Itaú',
      agency: '1234',
      account: '56789-0',
      accountType: 'CORRENTE',
      accountHolder: 'JS Representações Comerciais Ltda',
      holderCpfCnpj: '12.345.678/0001-90',
      pixKey: 'contato@jsrepresentacoes.com.br',
    },
  })

  await prisma.commercialInfo.upsert({
    where: { candidateProfileId: profile1.id },
    update: {},
    create: {
      candidateProfileId: profile1.id,
      operationArea: 'Materiais de Construção',
      operationRegion: 'Grande São Paulo',
      marketExperienceTime: '15 anos',
      representedCompanies: 'Votorantim, Eternit, Portobello',
      previousExperience: 'Representante comercial há 15 anos no segmento de construção civil',
      hasCore: true,
      coreNumber: 'SP-12345',
      coreExpirationDate: new Date('2025-12-31'),
      observations: 'Carteira consolidada de clientes na região metropolitana',
    },
  })

  await prisma.statusHistory.create({
    data: { candidateProfileId: profile1.id, oldStatus: null, newStatus: 'RASCUNHO', action: 'Cadastro criado', createdById: user1.id },
  })
  await prisma.statusHistory.create({
    data: { candidateProfileId: profile1.id, oldStatus: 'RASCUNHO', newStatus: 'ENVIADO_PARA_ANALISE', action: 'Cadastro enviado para análise', createdById: user1.id },
  })
  await prisma.statusHistory.create({
    data: { candidateProfileId: profile1.id, oldStatus: 'ENVIADO_PARA_ANALISE', newStatus: 'APROVADO', action: 'Cadastro aprovado', observation: 'Documentação completa e situação financeira ok', createdById: rh.id },
  })

  // Candidato 2 - Em análise RH
  const candidato2Password = await bcrypt.hash('candidato123', 12)
  const user2 = await prisma.user.upsert({
    where: { email: 'maria.oliveira@email.com' },
    update: {},
    create: { name: 'Maria Oliveira Costa', email: 'maria.oliveira@email.com', passwordHash: candidato2Password, role: 'CANDIDATO' },
  })

  const profile2 = await prisma.candidateProfile.upsert({
    where: { userId: user2.id },
    update: {},
    create: {
      userId: user2.id,
      status: 'EM_ANALISE_RH',
      hiringType: 'REPRESENTANTE_PJ',
      fullName: 'Maria Oliveira Costa',
      fatherName: 'Carlos Oliveira',
      motherName: 'Ana Costa',
      gender: 'FEMININO',
      nationality: 'Brasileira',
      birthplace: 'Rio de Janeiro - RJ',
      birthDate: new Date('1990-03-22'),
      maritalStatus: 'SOLTEIRO',
      hasChildren: false,
      address: 'Rua das Acácias',
      number: '456',
      district: 'Ipanema',
      city: 'Rio de Janeiro',
      state: 'RJ',
      zipCode: '22420-030',
      mobile: '(21) 98888-7777',
      email: 'maria.oliveira@email.com',
      cpf: '987.654.321-00',
      submittedAt: new Date('2024-02-10'),
    },
  })

  await prisma.companyData.upsert({
    where: { candidateProfileId: profile2.id },
    update: {},
    create: {
      candidateProfileId: profile2.id,
      corporateName: 'MO Comércio e Representações Ltda',
      tradeName: 'MO Representações',
      cnpj: '98.765.432/0001-10',
      city: 'Rio de Janeiro',
      state: 'RJ',
    },
  })

  await prisma.statusHistory.create({
    data: { candidateProfileId: profile2.id, oldStatus: null, newStatus: 'RASCUNHO', action: 'Cadastro criado', createdById: user2.id },
  })
  await prisma.statusHistory.create({
    data: { candidateProfileId: profile2.id, oldStatus: 'RASCUNHO', newStatus: 'ENVIADO_PARA_ANALISE', action: 'Cadastro enviado para análise', createdById: user2.id },
  })
  await prisma.statusHistory.create({
    data: { candidateProfileId: profile2.id, oldStatus: 'ENVIADO_PARA_ANALISE', newStatus: 'EM_ANALISE_RH', action: 'Em análise pelo RH', createdById: rh.id },
  })

  // Candidato 3 - Documentação pendente
  const candidato3Password = await bcrypt.hash('candidato123', 12)
  const user3 = await prisma.user.upsert({
    where: { email: 'pedro.fernandes@email.com' },
    update: {},
    create: { name: 'Pedro Fernandes Lima', email: 'pedro.fernandes@email.com', passwordHash: candidato3Password, role: 'CANDIDATO' },
  })

  const profile3 = await prisma.candidateProfile.upsert({
    where: { userId: user3.id },
    update: {},
    create: {
      userId: user3.id,
      status: 'DOCUMENTACAO_PENDENTE',
      hiringType: 'REPRESENTANTE_PF',
      fullName: 'Pedro Fernandes Lima',
      gender: 'MASCULINO',
      nationality: 'Brasileiro',
      birthplace: 'Belo Horizonte - MG',
      birthDate: new Date('1978-11-08'),
      maritalStatus: 'DIVORCIADO',
      hasChildren: true,
      childrenCount: 1,
      address: 'Rua dos Inconfidentes',
      number: '789',
      district: 'Savassi',
      city: 'Belo Horizonte',
      state: 'MG',
      zipCode: '30140-120',
      mobile: '(31) 97777-6666',
      email: 'pedro.fernandes@email.com',
      cpf: '456.789.123-00',
      submittedAt: new Date('2024-02-20'),
    },
  })

  await prisma.statusHistory.create({
    data: { candidateProfileId: profile3.id, oldStatus: null, newStatus: 'RASCUNHO', action: 'Cadastro criado', createdById: user3.id },
  })
  await prisma.statusHistory.create({
    data: { candidateProfileId: profile3.id, oldStatus: 'RASCUNHO', newStatus: 'ENVIADO_PARA_ANALISE', action: 'Cadastro enviado para análise', createdById: user3.id },
  })
  await prisma.statusHistory.create({
    data: { candidateProfileId: profile3.id, oldStatus: 'ENVIADO_PARA_ANALISE', newStatus: 'DOCUMENTACAO_PENDENTE', action: 'Documentação pendente solicitada', observation: 'Comprovante de endereço e CORE precisam ser atualizados', createdById: rh.id },
  })

  await prisma.correctionRequest.create({
    data: {
      candidateProfileId: profile3.id,
      message: 'Por favor, envie a documentação atualizada conforme solicitado.',
      status: 'PENDENTE',
      createdById: rh.id,
      items: {
        create: [
          { fieldName: 'Comprovante de Endereço', description: 'Deve ser dos últimos 3 meses' },
          { fieldName: 'Registro CORE', description: 'Registro CORE está vencido, envie o atual' },
        ],
      },
    },
  })

  console.log('✅ Candidatos de teste criados')
  console.log('\n📋 Credenciais:')
  console.log('ADMIN:      admin@empresa.com / admin123')
  console.log('RH:         rh@empresa.com / rh123')
  console.log('FINANCEIRO: financeiro@empresa.com / financeiro123')
  console.log('JURÍDICO:   juridico@empresa.com / juridico123')
  console.log('CANDIDATO 1 (Aprovado):   joao.silva@email.com / candidato123')
  console.log('CANDIDATO 2 (Em análise): maria.oliveira@email.com / candidato123')
  console.log('CANDIDATO 3 (Pendente):   pedro.fernandes@email.com / candidato123')
}

main()
  .catch((e) => { console.error('❌ Erro no seed:', e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })

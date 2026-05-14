import { NextRequest, NextResponse } from 'next/server'
import { getAuthCookie } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { isValidCPF, isValidCNPJ } from '@/lib/validations'
import { logger } from '@/lib/logger'

export async function PUT(request: NextRequest) {
  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  try {
    const user = await getAuthCookie()
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const profile = await prisma.candidateProfile.findUnique({ where: { userId: user.userId } })
    if (!profile) return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })

    if (body.cpf && !isValidCPF(body.cpf)) {
      return NextResponse.json({ error: 'CPF inválido.' }, { status: 400 })
    }
    if (body.cnpj && !isValidCNPJ(body.cnpj)) {
      return NextResponse.json({ error: 'CNPJ inválido.' }, { status: 400 })
    }

    // Atualizar perfil principal
    await prisma.candidateProfile.update({
      where: { userId: user.userId },
      data: {
        fullName: body.fullName || null,
        fatherName: body.fatherName || null,
        motherName: body.motherName || null,
        gender: body.gender || null,
        nationality: body.nationality || null,
        birthplace: body.birthplace || null,
        birthDate: body.birthDate ? new Date(body.birthDate) : null,
        maritalStatus: body.maritalStatus || null,
        hasChildren: body.hasChildren ?? null,
        childrenCount: body.childrenCount || null,
        address: body.address || null,
        number: body.number || null,
        complement: body.complement || null,
        district: body.district || null,
        city: body.city || null,
        state: body.state || null,
        zipCode: body.zipCode || null,
        phone: body.phone || null,
        mobile: body.mobile || null,
        email: body.email || null,
        cpf: body.cpf || null,
        hiringType: body.hiringType || null,
      },
    })

    // Dados da empresa
    if (body.corporateName || body.cnpj) {
      await prisma.companyData.upsert({
        where: { candidateProfileId: profile.id },
        update: {
          corporateName: body.corporateName || null,
          tradeName: body.tradeName || null,
          cnpj: body.cnpj || null,
          stateRegistration: body.stateRegistration || null,
          address: body.companyAddress || null,
          number: body.companyNumber || null,
          complement: body.companyComplement || null,
          district: body.companyDistrict || null,
          city: body.companyCity || null,
          state: body.companyState || null,
          zipCode: body.companyZipCode || null,
          phone: body.companyPhone || null,
          email: body.companyEmail || null,
        },
        create: {
          candidateProfileId: profile.id,
          corporateName: body.corporateName || null,
          tradeName: body.tradeName || null,
          cnpj: body.cnpj || null,
          stateRegistration: body.stateRegistration || null,
          address: body.companyAddress || null,
          number: body.companyNumber || null,
          complement: body.companyComplement || null,
          district: body.companyDistrict || null,
          city: body.companyCity || null,
          state: body.companyState || null,
          zipCode: body.companyZipCode || null,
          phone: body.companyPhone || null,
          email: body.companyEmail || null,
        },
      })
    }

    // Sócios
    if (body.partners && Array.isArray(body.partners)) {
      await prisma.partner.deleteMany({ where: { candidateProfileId: profile.id } })
      if (body.partners.length > 0) {
        await prisma.partner.createMany({
          data: body.partners.map((p: any) => ({
            candidateProfileId: profile.id,
            fullName: p.fullName || null,
            cpf: p.cpf || null,
            rg: p.rg || null,
            maritalStatus: p.maritalStatus || null,
            profession: p.profession || null,
            address: p.address || null,
            phone: p.phone || null,
            email: p.email || null,
          })),
        })
      }
    }

    // Dados bancários
    if (body.bank || body.account) {
      await prisma.bankData.upsert({
        where: { candidateProfileId: profile.id },
        update: {
          bank: body.bank || null,
          agency: body.agency || null,
          account: body.account || null,
          accountType: body.accountType || null,
          accountHolder: body.accountHolder || null,
          holderCpfCnpj: body.holderCpfCnpj || null,
          pixKey: body.pixKey || null,
        },
        create: {
          candidateProfileId: profile.id,
          bank: body.bank || null,
          agency: body.agency || null,
          account: body.account || null,
          accountType: body.accountType || null,
          accountHolder: body.accountHolder || null,
          holderCpfCnpj: body.holderCpfCnpj || null,
          pixKey: body.pixKey || null,
        },
      })
    }

    // Informações comerciais
    if (body.operationArea || body.operationRegion) {
      await prisma.commercialInfo.upsert({
        where: { candidateProfileId: profile.id },
        update: {
          operationArea: body.operationArea || null,
          operationRegion: body.operationRegion || null,
          marketExperienceTime: body.marketExperienceTime || null,
          representedCompanies: body.representedCompanies || null,
          previousExperience: body.previousExperience || null,
          hasCore: body.hasCore ?? null,
          coreNumber: body.coreNumber || null,
          coreExpirationDate: body.coreExpirationDate ? new Date(body.coreExpirationDate) : null,
          observations: body.observations || null,
        },
        create: {
          candidateProfileId: profile.id,
          operationArea: body.operationArea || null,
          operationRegion: body.operationRegion || null,
          marketExperienceTime: body.marketExperienceTime || null,
          representedCompanies: body.representedCompanies || null,
          previousExperience: body.previousExperience || null,
          hasCore: body.hasCore ?? null,
          coreNumber: body.coreNumber || null,
          coreExpirationDate: body.coreExpirationDate ? new Date(body.coreExpirationDate) : null,
          observations: body.observations || null,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('FICHA PUT', 'Erro ao salvar ficha', error)
    return NextResponse.json({ error: 'Erro ao salvar' }, { status: 500 })
  }
}

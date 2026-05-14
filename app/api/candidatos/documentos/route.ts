import { randomUUID } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { getAuthCookie } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'

const MAX_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthCookie()
    if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })

    const formData = await request.formData()
    const file = formData.get('file') as File
    const documentType = formData.get('documentType') as string

    if (!file || !documentType) {
      return NextResponse.json({ error: 'Arquivo e tipo sao obrigatorios' }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Arquivo muito grande (max. 10MB)' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Tipo de arquivo nao permitido' }, { status: 400 })
    }

    const profile = await prisma.candidateProfile.findUnique({ where: { userId: user.userId } })
    if (!profile) return NextResponse.json({ error: 'Perfil nao encontrado' }, { status: 404 })

    const ext = file.name.split('.').pop() || 'bin'
    const fileName = `${documentType}-${Date.now()}.${ext}`
    const documentId = randomUUID()

    const existing = await prisma.document.findFirst({
      where: { candidateProfileId: profile.id, documentType },
    })
    if (existing) {
      await prisma.document.delete({ where: { id: existing.id } })
    }

    const useBlobStorage = !!process.env.BLOB_READ_WRITE_TOKEN
    let fileUrl: string
    let blobUrl: string | undefined
    let fileData: Buffer | undefined

    if (useBlobStorage) {
      const blob = await put(`documentos/${profile.id}/${fileName}`, file, {
        access: 'public',
        contentType: file.type,
      })
      blobUrl = blob.url
      fileUrl = blob.url
    } else {
      const bytes = await file.arrayBuffer()
      fileData = Buffer.from(bytes)
      fileUrl = `/api/candidatos/documentos/${documentId}/arquivo`
    }

    await prisma.document.create({
      data: {
        id: documentId,
        candidateProfileId: profile.id,
        documentType,
        fileName,
        originalName: file.name,
        fileUrl,
        blobUrl,
        mimeType: file.type,
        size: file.size,
        fileData,
        status: 'ENVIADO',
        uploadedAt: new Date(),
      },
    })

    await prisma.statusHistory.create({
      data: {
        candidateProfileId: profile.id,
        oldStatus: profile.status,
        newStatus: profile.status,
        action: `Documento enviado: ${documentType}`,
        observation: file.name,
        createdById: user.userId,
      },
    })

    return NextResponse.json({ success: true, fileUrl })
  } catch (error) {
    logger.error('DOCUMENTO UPLOAD', 'Erro ao salvar documento', error)
    return NextResponse.json({ error: 'Erro ao salvar documento' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_ROLES, getAuthCookie } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'

function contentDisposition(fileName: string) {
  const safeName = fileName.replace(/[\r\n"]/g, '_')
  return `inline; filename="${safeName}"`
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthCookie()
    if (!user) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })

    const { id } = await params
    const doc = await prisma.document.findUnique({
      where: { id },
      include: { candidateProfile: { select: { userId: true } } },
    })

    if (!doc) return NextResponse.json({ error: 'Documento nao encontrado' }, { status: 404 })

    const canAccess =
      doc.candidateProfile.userId === user.userId ||
      ADMIN_ROLES.includes(user.role)

    if (!canAccess) return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })

    if (doc.blobUrl) {
      return NextResponse.redirect(doc.blobUrl)
    }

    if (!doc.fileData) {
      if (doc.fileUrl.startsWith('/uploads/')) {
        return NextResponse.redirect(new URL(doc.fileUrl, request.url))
      }
      return NextResponse.json({ error: 'Arquivo nao encontrado' }, { status: 404 })
    }

    const fileBody = new Blob([new Uint8Array(doc.fileData)], { type: doc.mimeType })

    return new NextResponse(fileBody, {
      headers: {
        'Content-Type': doc.mimeType,
        'Content-Length': String(doc.size),
        'Content-Disposition': contentDisposition(doc.originalName),
        'Cache-Control': 'private, max-age=0, must-revalidate',
      },
    })
  } catch (error) {
    logger.error('DOCUMENTO ARQUIVO', 'Erro ao servir arquivo', error)
    return NextResponse.json({ error: 'Erro ao abrir documento' }, { status: 500 })
  }
}

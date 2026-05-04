'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DocumentStatusBadge } from '@/components/status-badge'
import { toast } from '@/components/ui/toaster'
import { Upload, FileText, RefreshCw, Download, Eye, Trash2, CheckCircle } from 'lucide-react'
import { DOCUMENT_TYPES } from '@/types'
import { formatFileSize, formatDate } from '@/lib/utils'
import { HiringType } from '@/types'

interface DocumentUploadAreaProps {
  profile: any
  isEditable: boolean
}

export function DocumentUploadArea({ profile, isEditable }: DocumentUploadAreaProps) {
  const router = useRouter()
  const [uploading, setUploading] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeDocType, setActiveDocType] = useState<string | null>(null)

  const hiringType = profile.hiringType as HiringType | null
  const requiredDocs = hiringType
    ? DOCUMENT_TYPES.filter((d) => d.hiringTypes.includes(hiringType))
    : DOCUMENT_TYPES

  const existingDocs: Record<string, any> = {}
  profile.documents?.forEach((doc: any) => {
    existingDocs[doc.documentType] = doc
  })

  function handleUploadClick(docTypeKey: string) {
    setActiveDocType(docTypeKey)
    fileInputRef.current?.click()
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !activeDocType) return

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      toast({ title: 'Arquivo muito grande', description: 'O arquivo deve ter no máximo 10MB', variant: 'destructive' })
      return
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      toast({ title: 'Formato inválido', description: 'Aceito: PDF, JPG, PNG, DOC, DOCX', variant: 'destructive' })
      return
    }

    setUploading(activeDocType)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('documentType', activeDocType)

      const res = await fetch('/api/candidatos/documentos', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error()
      toast({ title: 'Documento enviado com sucesso!', variant: 'success' })
      router.refresh()
    } catch {
      toast({ title: 'Erro ao enviar documento', variant: 'destructive' })
    } finally {
      setUploading(null)
      setActiveDocType(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const approvedCount = Object.values(existingDocs).filter((d: any) => d.status === 'APROVADO').length
  const totalRequired = requiredDocs.filter((d) => d.required).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Documentos</h2>
          <p className="text-sm text-gray-500 mt-1">
            {approvedCount} de {totalRequired} documentos obrigatórios aprovados
          </p>
        </div>
      </div>

      {!hiringType && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <p className="text-sm text-yellow-800">
              Primeiro preencha o tipo de contratação na sua ficha para ver os documentos necessários.
            </p>
          </CardContent>
        </Card>
      )}

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        onChange={handleFileChange}
      />

      <div className="space-y-4">
        {requiredDocs.map((docType) => {
          const existing = existingDocs[docType.key]
          const isUploading = uploading === docType.key
          const isApproved = existing?.status === 'APROVADO'
          const isRejected = existing?.status === 'RECUSADO'

          return (
            <Card
              key={docType.key}
              className={`transition-colors ${isApproved ? 'border-green-200 bg-green-50' : isRejected ? 'border-red-200 bg-red-50' : ''}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0 ${
                      isApproved ? 'bg-green-100' : isRejected ? 'bg-red-100' : 'bg-gray-100'
                    }`}>
                      {isApproved ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <FileText className={`h-5 w-5 ${isRejected ? 'text-red-400' : 'text-gray-400'}`} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-gray-900">{docType.name}</p>
                        {docType.required && (
                          <span className="text-xs text-red-500">* Obrigatório</span>
                        )}
                        {existing && <DocumentStatusBadge status={existing.status} />}
                      </div>
                      {docType.description && (
                        <p className="text-xs text-gray-500 mt-0.5">{docType.description}</p>
                      )}
                      {existing && (
                        <div className="mt-2 text-xs text-gray-500 space-y-1">
                          <p>Arquivo: {existing.originalName} ({formatFileSize(existing.size)})</p>
                          <p>Enviado em: {formatDate(existing.uploadedAt)}</p>
                          {existing.adminObservation && (
                            <p className={`font-medium ${isRejected ? 'text-red-600' : 'text-gray-600'}`}>
                              Obs: {existing.adminObservation}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {existing && (
                      <a href={existing.fileUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3 mr-1" /> Ver
                        </Button>
                      </a>
                    )}
                    {isEditable && (!existing || isRejected) && (
                      <Button
                        variant={isRejected ? 'destructive' : 'outline'}
                        size="sm"
                        onClick={() => handleUploadClick(docType.key)}
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <span className="flex items-center gap-1">
                            <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Enviando...
                          </span>
                        ) : isRejected ? (
                          <span className="flex items-center gap-1"><RefreshCw className="h-3 w-3" /> Reenviar</span>
                        ) : existing ? (
                          <span className="flex items-center gap-1"><RefreshCw className="h-3 w-3" /> Substituir</span>
                        ) : (
                          <span className="flex items-center gap-1"><Upload className="h-3 w-3" /> Enviar</span>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

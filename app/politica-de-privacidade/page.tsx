import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function PoliticaPrivacidadePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-8">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-8 prose prose-sm max-w-none">
          <h1>Política de Privacidade</h1>
          <p><strong>Última atualização:</strong> 2024</p>

          <h2>1. Informações coletadas</h2>
          <p>
            Para fins de análise cadastral e avaliação pré-contratual, coletamos dados pessoais como:
            nome, CPF, RG, endereço, dados de contato, dados empresariais e informações bancárias.
          </p>

          <h2>2. Finalidade do tratamento</h2>
          <p>Os dados são utilizados exclusivamente para:</p>
          <ul>
            <li>Análise cadastral e avaliação pré-contratual</li>
            <li>Verificação de documentos e antecedentes</li>
            <li>Eventual formalização de contrato</li>
            <li>Cumprimento de obrigações legais</li>
            <li>Exercício regular de direitos</li>
          </ul>

          <h2>3. Base legal</h2>
          <p>
            O tratamento é realizado com base no consentimento do titular, execução de contrato e
            cumprimento de obrigação legal, conforme previsto na Lei nº 13.709/2018 (LGPD).
          </p>

          <h2>4. Compartilhamento</h2>
          <p>
            Os dados não são compartilhados com terceiros, exceto quando necessário para cumprimento
            de obrigação legal ou quando autorizado pelo titular.
          </p>

          <h2>5. Segurança</h2>
          <p>
            Adotamos medidas técnicas e organizacionais para proteger seus dados contra acesso não
            autorizado, uso indevido, alteração ou divulgação.
          </p>

          <h2>6. Direitos do titular</h2>
          <p>Você tem direito a:</p>
          <ul>
            <li>Confirmar a existência do tratamento</li>
            <li>Acessar seus dados</li>
            <li>Corrigir dados incompletos ou desatualizados</li>
            <li>Solicitar a exclusão dos dados</li>
            <li>Revogar o consentimento</li>
          </ul>

          <h2>7. Contato</h2>
          <p>
            Para exercer seus direitos ou esclarecer dúvidas sobre nossa Política de Privacidade,
            entre em contato pelo e-mail: dpo@empresa.com
          </p>
        </div>
      </div>
    </div>
  )
}

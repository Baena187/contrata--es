# Portal de Cadastro e Análise de Representantes

Sistema web completo para pré-cadastro, análise e aprovação de representantes comerciais.

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** + shadcn/ui
- **Prisma ORM** + PostgreSQL (Neon)
- **JWT** (autenticação com cookies httpOnly)

## Instalação e Execução

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` se necessário (o arquivo já vem configurado para desenvolvimento local).

### 3. Criar banco de dados e executar seed

```bash
npx prisma db push
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
```

Ou use o script combinado:

```bash
npm run setup
```

### 4. Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:3000

---

## Credenciais de Teste

| Perfil | E-mail | Senha |
|--------|--------|-------|
| Admin | admin@empresa.com | admin123 |
| RH | rh@empresa.com | rh123 |
| Financeiro | financeiro@empresa.com | financeiro123 |
| Jurídico | juridico@empresa.com | juridico123 |
| Candidato 1 (Aprovado) | joao.silva@email.com | candidato123 |
| Candidato 2 (Em análise) | maria.oliveira@email.com | candidato123 |
| Candidato 3 (Pendente) | pedro.fernandes@email.com | candidato123 |

---

## Rotas do Sistema

### Públicas
- `/login` — Login
- `/cadastro` — Criar conta de candidato
- `/politica-de-privacidade`

### Área do Candidato
- `/candidato/dashboard` — Painel do candidato
- `/candidato/ficha` — Formulário multi-etapas
- `/candidato/documentos` — Upload de documentos
- `/candidato/status` — Acompanhar status
- `/candidato/pendencias` — Ver pendências do RH

### Área Administrativa
- `/admin/dashboard` — Dashboard com métricas
- `/admin/cadastros` — Listagem com filtros
- `/admin/cadastros/[id]` — Perfil completo com abas
- `/admin/cadastros/[id]/pdf` — Ficha para impressão/PDF
- `/admin/pendencias` — Cadastros com pendência
- `/admin/aprovados` — Cadastros aprovados
- `/admin/reprovados` — Cadastros reprovados
- `/admin/relatorios` — Relatórios e estatísticas
- `/admin/usuarios` — Gerenciar equipe (ADMIN)
- `/admin/configuracoes` — Configurações (ADMIN)

---

## Funcionalidades

### Candidato
- Criar conta e fazer login
- Formulário multi-etapas com progresso (8 etapas)
- Salvar rascunho a qualquer momento
- Upload de documentos (PDF, JPG, PNG, DOC, DOCX, máx 10MB)
- Aceite de declarações LGPD registrado com timestamp
- Envio para análise
- Acompanhar status em tempo real
- Ver e resolver pendências solicitadas pelo RH

### RH / Admin
- Dashboard com métricas e cards de status
- Listagem com filtros avançados (busca, status, tipo, UF)
- Perfil completo em abas (dados pessoais, empresa, sócios, documentos, banco, comercial, análise)
- Aprovar/recusar documentos individualmente
- Aprovar ou reprovar cadastro com observação
- Solicitar correção com itens específicos
- Alterar status manualmente
- Análise interna (parecer RH, financeiro, jurídico)
- Histórico completo de ações
- Geração de ficha em PDF para impressão

### Segurança
- Senhas com bcrypt (cost 12)
- JWT em cookie httpOnly
- Middleware de proteção de rotas
- Controle de permissões por perfil (RBAC)
- Candidato só acessa seu próprio cadastro
- Dados bancários acessíveis apenas para Admin, RH autorizado e Financeiro

---

## Estrutura do Projeto

```
├── app/
│   ├── (auth)/          # Login, cadastro
│   ├── (candidato)/     # Área do candidato
│   ├── (admin)/         # Área administrativa
│   └── api/             # API routes
├── components/
│   ├── ui/              # Componentes base (shadcn)
│   ├── admin/           # Sidebar, header admin
│   └── candidato/       # Header, nav candidato
├── lib/
│   ├── auth.ts          # JWT utilities
│   ├── db.ts            # Prisma client
│   ├── permissions.ts   # RBAC
│   └── utils.ts         # Helpers
├── prisma/
│   ├── schema.prisma    # Schema do banco
│   └── seed.ts          # Dados iniciais
├── types/
│   └── index.ts         # Types TypeScript
└── middleware.ts         # Proteção de rotas
```

---

## Migrar para PostgreSQL (Produção)

1. No `.env`, altere:
```
DATABASE_URL="postgresql://user:password@host:5432/database"
```

2. No `prisma/schema.prisma`, altere:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

3. Execute:
```bash
npx prisma migrate dev
npm run db:seed
```

---

## Comandos Úteis

```bash
npm run dev          # Iniciar em desenvolvimento
npm run build        # Build para produção
npm run db:push      # Sincronizar schema com banco
npm run db:seed      # Popular banco com dados de teste
npm run db:studio    # Abrir Prisma Studio (GUI do banco)
npm run db:migrate   # Criar migration
```

---

## Deploy no Netlify

O projeto inclui `netlify.toml`; o Netlify deve usar:

```bash
npm run build
```

Como pasta publicada, use:

```bash
.next
```

Configure tambem as variaveis em **Site configuration > Environment variables**:

```bash
DATABASE_URL="..."
JWT_SECRET="uma-chave-forte"
NEXTAUTH_URL="https://seu-site.netlify.app"
MAX_FILE_SIZE=10485760
```

Para producao real, use um banco externo persistente. SQLite local (`file:./dev.db`) nao e adequado para Netlify/serverless. Se usar PostgreSQL, atualize o `provider` do datasource Prisma para `postgresql`, rode `npx prisma db push` no banco de producao e depois execute o seed se precisar dos usuarios iniciais.

> Atualizacao Neon: veja `DEPLOY_NEON.md`. O Prisma agora esta configurado para PostgreSQL/Neon com `DATABASE_URL` e `DIRECT_URL`, e os uploads sao salvos no banco.

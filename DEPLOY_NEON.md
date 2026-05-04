# Neon setup

Este projeto agora usa PostgreSQL/Neon no Prisma.

## Variaveis obrigatorias

No `.env` local e no Netlify, configure:

```bash
DATABASE_URL="postgresql://user:password@ep-example-pooler.region.aws.neon.tech/neondb?sslmode=require&connect_timeout=15"
DIRECT_URL="postgresql://user:password@ep-example.region.aws.neon.tech/neondb?sslmode=require&connect_timeout=15"
JWT_SECRET="uma-chave-forte"
NEXTAUTH_URL="https://seu-site.netlify.app"
MAX_FILE_SIZE=10485760
```

Use `DATABASE_URL` com o host pooled do Neon, contendo `-pooler`.
Use `DIRECT_URL` com o host direto do Neon, sem `-pooler`.

## Criar tabelas no Neon

Depois de configurar o `.env` com URLs reais:

```bash
npm run db:push
```

Para criar os usuarios de teste:

```bash
npm run db:seed
```

## Netlify

O `netlify.toml` ja define:

```bash
npm run build
```

como comando de build e `.next` como pasta publicada. O build nao cria tabelas no Neon; rode `npm run db:push` uma vez antes de usar o app em producao.

## Uploads

Os documentos enviados sao gravados no banco em `Document.fileData`, entao tambem ficam persistidos no Neon. Isso resolve o problema de uploads sumirem em ambiente serverless.

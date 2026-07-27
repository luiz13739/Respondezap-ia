# RespondeZap AI

SaaS que usa inteligência artificial para ajudar empresas a responder clientes no WhatsApp.
Primeira versão: autenticação, dashboard, perfil da empresa e geração de respostas (mockada, pronta para plugar uma IA real).

## Stack

- **Next.js 14** (App Router) + **React 18**
- **Tailwind CSS** para estilização
- **Supabase** para autenticação (e-mail/senha) e banco de dados (Postgres)
- Camada de IA isolada em `lib/ai/`, pronta para receber uma API real (OpenAI, Anthropic, etc.)

## Pré-requisitos

- Node.js 18 ou superior
- Uma conta gratuita em [supabase.com](https://supabase.com)

## Como executar localmente

### 1. Instalar as dependências

```bash
npm install
```

### 2. Criar o projeto no Supabase

1. Crie um novo projeto em [app.supabase.com](https://app.supabase.com).
2. Vá em **SQL Editor** e execute o conteúdo do arquivo [`supabase/schema.sql`](./supabase/schema.sql). Isso cria as tabelas `profiles`, `companies` e `responses`, além das políticas de segurança (RLS).
3. Vá em **Project Settings → API** e copie:
   - `Project URL`
   - `anon public key`

### 3. Configurar as variáveis de ambiente

Copie o arquivo de exemplo e preencha com as chaves do passo anterior:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-publica
AI_API_KEY=
```

> `AI_API_KEY` fica reservada para quando você conectar uma API de IA real (ver seção abaixo).

### 4. Rodar o projeto

```bash
npm run dev
```

Acesse **http://localhost:3000** — você será redirecionado para a tela de login.

## Estrutura de pastas

```
respondezap-ai/
├── app/                          # Rotas (App Router do Next.js)
│   ├── layout.tsx                # Layout raiz (fonte, metadata)
│   ├── page.tsx                  # Redireciona "/" para "/login"
│   ├── globals.css               # Estilos globais + diretivas do Tailwind
│   ├── login/page.tsx            # Tela de login
│   ├── cadastro/page.tsx         # Tela de cadastro
│   ├── esqueci-senha/page.tsx    # Recuperação de senha
│   └── dashboard/
│       ├── layout.tsx            # Aplica o DashboardShell (sidebar) a todas as páginas internas
│       ├── page.tsx              # Dashboard: card de respostas geradas + "Nova resposta"
│       ├── minha-empresa/page.tsx    # Formulário com os dados da empresa
│       └── gerar-resposta/page.tsx   # Geração de resposta com IA
│
├── components/
│   ├── ui/                       # Design system (componentes reutilizáveis)
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Textarea.tsx
│   │   ├── Select.tsx
│   │   └── Card.tsx
│   └── layout/
│       ├── Sidebar.tsx           # Menu lateral (desktop)
│       └── DashboardShell.tsx    # Sidebar + topbar/drawer responsivo (mobile)
│
├── lib/
│   ├── types.ts                  # Tipos compartilhados (Company, GeneratedResponse, etc.)
│   ├── supabase/
│   │   ├── client.ts             # Cliente Supabase para o navegador
│   │   ├── server.ts             # Cliente Supabase para Server Components
│   │   └── middleware.ts         # Lógica de proteção de rotas
│   └── ai/
│       └── generateResponse.ts   # Função central de geração de resposta (hoje mockada)
│
├── supabase/
│   └── schema.sql                # Tabelas, tipos e políticas de segurança (RLS)
│
├── middleware.ts                 # Protege /dashboard e redireciona usuários já logados
├── tailwind.config.ts            # Paleta de cores (verde #25D366), sombras, animações
└── .env.local.example
```

## Fluxo de autenticação

- `middleware.ts` roda em toda requisição e usa `lib/supabase/middleware.ts` para checar a sessão.
- Sem sessão → tentativa de acessar `/dashboard/*` redireciona para `/login`.
- Com sessão → tentativa de acessar `/login` ou `/cadastro` redireciona para `/dashboard`.
- O cadastro (`app/cadastro/page.tsx`) usa `supabase.auth.signUp`. Se a confirmação por e-mail estiver ativada no seu projeto Supabase (padrão), o usuário recebe um link de confirmação antes de conseguir entrar.

## Como plugar uma IA real (próximo passo)

Toda a geração de resposta passa por uma única função: `lib/ai/generateResponse.ts`. Ela hoje devolve um texto simulado para a tela funcionar sem depender de credenciais externas. Para conectar uma IA de verdade:

1. Crie um Route Handler em `app/api/generate-response/route.ts`.
2. Nele, monte o prompt usando a mensagem do cliente + os dados da empresa (`nome`, `segmento`, `produtos_servicos`, `tone`), e chame a API de IA escolhida usando a variável `AI_API_KEY`.
3. Troque o corpo de `generateResponse()` para fazer um `fetch("/api/generate-response")` em vez do mock.
4. Nenhuma outra tela precisa mudar — o restante do app já consome essa função.

## Próximos passos sugeridos

- Histórico completo de respostas geradas (a tabela `responses` já grava tudo).
- Integração direta com a API do WhatsApp Business.
- Convite de múltiplos usuários por empresa (hoje a V1 assume 1 empresa por usuário).
- Planos e cobrança (Stripe).

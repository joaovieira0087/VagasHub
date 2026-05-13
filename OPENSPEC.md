# 🧠 OPENSPEC — Portal VagasHub (Documentação Viva)

> **Última atualização:** 2026-05-13  
> **Versão:** 1.0.0  
> **Propósito:** Este arquivo é a "Single Source of Truth" do projeto. Qualquer IA que leia este documento deve ser capaz de entender, manter e evoluir o portal sem perda de contexto.

---

## 1. 📋 Visão Geral do Produto

| Item | Descrição |
|---|---|
| **Nome** | VagasHub |
| **Propósito** | Portal público de vagas de emprego otimizado para tráfego vindo de WhatsApp |
| **Modelo de Negócio** | Monetização via Google AdSense (3 slots estratégicos por página) |
| **Público-Alvo** | Usuários mobile-first vindos de grupos de emprego no WhatsApp |
| **Filosofia UX** | **Zero Friction** — sem login, sem cadastro, sem barreira alguma para o visitante |

### Fluxo Principal do Usuário
1. Recebe link no WhatsApp → Abre página da vaga (`/vaga/[slug]`)
2. Lê descrição da vaga (visualiza anúncios AdSense)
3. Clica em "Candidatar-se Agora" → Redirecionado para link externo
4. Opcionalmente navega por categorias na Home (`/`)

### Fluxo do Admin
1. Acessa URL secreta `/painel-exclusivo-gerar-vaga`
2. Digita `ADMIN_SECRET_KEY` (sem e-mail/senha)
3. Cria vagas, gerencia categorias, desativa vagas
4. Copia link formatado para WhatsApp com um clique

---

## 2. 🛠️ Stack Técnica

### Dependências Principais (package.json)
| Pacote | Versão | Propósito |
|---|---|---|
| `next` | `16.2.6` | Framework (App Router) |
| `react` / `react-dom` | `19.2.4` | UI Runtime |
| `tailwindcss` | `^4` | CSS (via `@tailwindcss/postcss`) |
| `@supabase/ssr` | `^0.10.3` | Supabase client SSR-safe |
| `@supabase/supabase-js` | `^2.105.3` | Supabase client base (admin) |
| `react-markdown` | `^10.1.0` | Renderização de Markdown nas descrições |
| `remark-gfm` | `^4.0.1` | Plugin GFM para react-markdown |

### Configuração CSS
- **Tailwind CSS v4** com `@tailwindcss/postcss` (PostCSS plugin)
- Design System completo definido em `src/app/globals.css` via `@theme inline`
- Tema: **Dark Mode Premium** (fundo `#0B0D1A`)
- Fonte: **Inter** (Google Fonts, carregada via `next/font`)

### Variáveis de Ambiente (`.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui   # NUNCA expor no client
ADMIN_SECRET_KEY=minha-senha-ultra-secreta-2024       # Senha do painel admin
NEXT_PUBLIC_SITE_URL=http://localhost:3000             # Base URL para links
```

---

## 3. 🔌 Arquitetura de Conexão Supabase

O projeto usa **3 clientes Supabase** distintos:

| Arquivo | Tipo | Usa | Onde é usado |
|---|---|---|---|
| `src/lib/supabase/client.ts` | `createBrowserClient` | `anon_key` | Componentes `'use client'` |
| `src/lib/supabase/server.ts` | `createServerClient` | `anon_key` + cookies | Server Components, `generateMetadata` |
| `src/lib/supabase/admin.ts` | `createClient` (base) | `service_role_key` | Server Actions (bypassa RLS) |

### Regras Críticas
- **Client:** Usado apenas para leitura pública (respeita RLS).
- **Server:** Usado na Home e na página de detalhe da vaga. É `async` pois usa `await cookies()`.
- **Admin:** Usado **exclusivamente** em `src/lib/actions/vagas.ts`. Bypassa RLS para INSERT/UPDATE/DELETE. **Nunca importar em componentes client.**

---

## 4. 🗄️ Arquitetura de Dados (Supabase/PostgreSQL)

### Schema SQL: `supabase/migrations/001_initial_schema.sql`

#### Tabela `categorias`
| Coluna | Tipo | Constraint |
|---|---|---|
| `id` | `UUID` | PK, `gen_random_uuid()` |
| `nome` | `TEXT` | NOT NULL |
| `slug` | `TEXT` | NOT NULL, UNIQUE |

**RLS:** SELECT público (`true`). INSERT/UPDATE/DELETE somente via `service_role`.

#### Tabela `empresa`
| Coluna | Tipo | Constraint |
|---|---|---|
| `id` | `UUID` | PK, `gen_random_uuid()` |
| `nome` | `TEXT` | NOT NULL |
| `vendas` | `TEXT` | Nullable — reservado para uso futuro |
| `logo_url` | `TEXT` | Nullable |

**RLS:** SELECT público (`true`).

#### Tabela `vagas`
| Coluna | Tipo | Constraint |
|---|---|---|
| `id` | `UUID` | PK, `gen_random_uuid()` |
| `titulo` | `TEXT` | NOT NULL |
| `slug` | `TEXT` | NOT NULL, UNIQUE |
| `descricao` | `TEXT` | Nullable (suporta Markdown) |
| `id_categoria` | `UUID` | FK → `categorias(id)`, ON DELETE SET NULL — **Legacy, usar `vagas_categorias`** |
| `id_empresa` | `UUID` | FK → `empresa(id)`, ON DELETE SET NULL |
| `link_externo` | `TEXT` | Nullable |
| `status` | `TEXT` | NOT NULL, DEFAULT `'ativa'` |
| `visualizacoes` | `INTEGER` | NOT NULL, DEFAULT `0` |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT `now()` |

**RLS:** SELECT público somente onde `status = 'ativa'`.

#### Função RPC
```sql
increment_visualizacoes(vaga_id UUID) → VOID
-- SECURITY DEFINER — incrementa visualizacoes sem precisar de service_role
```

#### Tabela `vagas_categorias` (Junção N:N)
| Coluna | Tipo | Constraint |
|---|---|---|
| `vaga_id` | `UUID` | PK, FK → `vagas(id)` ON DELETE CASCADE |
| `categoria_id` | `UUID` | PK, FK → `categorias(id)` ON DELETE CASCADE |

**RLS:** SELECT público (`true`).
**Migration:** `supabase/migrations/002_multi_categorias.sql`

#### Índices
- `idx_vagas_status`, `idx_vagas_slug`, `idx_vagas_id_categoria`, `idx_vagas_created_at`
- `idx_categorias_slug`
- `idx_vc_vaga`, `idx_vc_categoria`

#### Categorias Iniciais (seed)
Tecnologia, Administrativo, Vendas, Limpeza, Logística, Saúde, Educação, Construção Civil, Atendimento, Marketing

### Relação N:N (Multi-Categorias)

Cada vaga pode ter **até 10 categorias** via tabela de junção `vagas_categorias`.

- A Home filtra via junction: busca `vaga_ids` da junction → fetcha vagas com ALL categories
- O Admin usa multi-select de tags clicáveis (badges com toggle)
- A coluna `empresa.vendas` **não é mais usada** para gerar filtros na barra de categorias
- A coluna `vagas.id_categoria` é mantida para backward compat (recebe o primeiro ID selecionado)

**Tipo TypeScript:** `VagaCompleta { ..., vagas_categorias: { categorias: Categoria }[], empresa: Empresa | null }`

---

## 5. 📁 Estrutura de Arquivos

```
c:\sites_vagas01\
├── .env.local                          # Variáveis de ambiente
├── next.config.ts                      # Config Next.js (vazia por ora)
├── package.json
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql      # Schema completo do banco
├── src/
│   ├── app/
│   │   ├── globals.css                 # Design System completo (Tailwind v4 @theme)
│   │   ├── layout.tsx                  # Root Layout (Inter font, Header, Footer)
│   │   ├── page.tsx                    # HOME — listagem + categorias unificadas
│   │   ├── not-found.tsx               # Página 404 customizada
│   │   ├── vaga/
│   │   │   └── [slug]/
│   │   │       └── page.tsx            # DETALHE — Markdown, CTA, relacionadas
│   │   └── painel-exclusivo-gerar-vaga/
│   │       ├── layout.tsx              # Layout admin (robots: noindex)
│   │       └── page.tsx                # ADMIN — Criar/listar/desativar vagas
│   ├── components/
│   │   ├── Header.tsx                  # Navbar sticky com logo VagasHub
│   │   ├── Footer.tsx                  # Rodapé com copyright
│   │   ├── VagaCard.tsx                # Card da vaga (Server Component)
│   │   ├── VagaCardSkeleton.tsx        # Skeleton loading
│   │   ├── CategoriaBar.tsx            # Barra de chips horizontal (Client)
│   │   └── AdSlot.tsx                  # Placeholder AdSense (Client)
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts              # Browser client (anon)
│   │   │   ├── server.ts              # Server client (anon + cookies)
│   │   │   └── admin.ts               # Admin client (service_role)
│   │   ├── actions/
│   │   │   └── vagas.ts               # Server Actions (criarVaga, listarCategorias, etc.)
│   │   └── utils/
│   │       ├── slug.ts                # Geração de slugs (com e sem sufixo)
│   │       ├── tempo.ts               # Formatação de tempo relativo (pt-BR)
│   │       └── whatsapp.ts            # Geração de texto/link para WhatsApp
│   └── types/
│       └── database.ts                # Tipos TS (Vaga, Empresa, Categoria, etc.)
```

---

## 6. 🎯 Regras de Negócio e UX

### Zero Friction (Visitante)
- Nenhum login, nenhum cadastro, nenhuma barreira
- Toda listagem e detalhe são públicos via RLS (`status = 'ativa'`)
- Visualizações incrementadas automaticamente via RPC `SECURITY DEFINER`

### Segurança Admin
- **URL secreta:** `/painel-exclusivo-gerar-vaga` (não há link público para ela)
- **Autenticação:** Campo de senha comparado contra `process.env.ADMIN_SECRET_KEY` no servidor
- **Sem sessão:** Senha digitada a cada ação (sem cookies de sessão admin)
- **SEO bloqueado:** `robots: { index: false, follow: false }` no layout admin

### Slugs
- **Vagas:** `gerarSlug()` → normaliza + adiciona sufixo Base36 do timestamp (`-xxxx`)
- **Categorias:** `gerarSlugCategoria()` → normaliza sem sufixo (categorias são únicas por nome)

### Links WhatsApp
- `gerarTextoWhatsApp(titulo, url)` → texto formatado com emojis e bold markdown
- `gerarUrlVaga(slug)` → monta URL completa usando `NEXT_PUBLIC_SITE_URL`
- `copiarParaClipboard(texto)` → Clipboard API com fallback `execCommand`

### AdSense (3 Slots Estratégicos)
1. **Header Ad** — Topo da Home e topo do detalhe da vaga
2. **Inline Ad** — A cada 5 vagas na Home; entre conteúdo e CTA no detalhe
3. **Sticky Bottom Ad** — Fixo no rodapé mobile (apenas `< sm`) no detalhe

> ⚠️ **Atualmente são placeholders.** O componente `AdSlot.tsx` exibe apenas texto "PUBLICIDADE". Substituir pelo `<ins className="adsbygoogle" ...>` quando a conta AdSense for aprovada.

### SEO
- Metadata dinâmica por vaga via `generateMetadata()` (título, descrição, OpenGraph)
- Root metadata: título template `%s | VagasHub`, keywords, OG locale `pt_BR`
- `theme-color: #0B0D1A` para barra do navegador mobile
- Página 404 customizada com CTA de retorno

---

## 7. 🎨 Design System (globals.css)

### Paleta de Cores
| Token | Hex | Uso |
|---|---|---|
| `background` | `#0B0D1A` | Fundo principal |
| `surface` | `#12152B` | Superfícies base |
| `surface-card` | `#1A1D35` | Cards |
| `surface-elevated` | `#222640` | Elementos elevados |
| `primary` | `#6C63FF` | Ações principais |
| `accent` | `#00D4AA` | CTAs, destaques |
| `danger` | `#FF6B6B` | Erros, exclusão |
| `warning` | `#FFB84D` | Alertas |
| `success` | `#34D399` | Sucesso |

### Componentes CSS Globais
- `.glass-card` — Glassmorphism com blur + hover lift
- `.btn-primary` — Gradient purple com glow hover
- `.btn-cta` — Gradient accent (verde), full-width, para "Candidatar-se"
- `.badge` / `.badge-primary` / `.badge-accent` / `.badge-active` — Chips de categoria
- `.ad-slot` — Container dashed para AdSense
- `.markdown-content` — Estilos para renderização de Markdown
- `.container-app` — Container responsivo (max 720px mobile, 1080px desktop)
- `.skeleton` — Shimmer loading animation
- `.scroll-hidden` — Scrollbar oculta (barra de categorias)

### Animações
- `fadeIn` — Fade + translateY(8px)
- `slideUp` — Fade + translateY(20px)
- `shimmer` — Background gradient animado (skeletons)
- `scaleIn` — Scale(0.95) → Scale(1)
- `pulse-soft` — Opacity pulse

---

## 8. 🔄 Server Actions (`src/lib/actions/vagas.ts`)

Todas validam `ADMIN_SECRET_KEY` antes de executar. Usam `createAdminClient()`.

| Action | Descrição |
|---|---|
| `criarVaga(input)` | Busca/cria empresa → gera slug → insere vaga |
| `listarCategorias()` | Retorna todas as categorias (sem senha — leitura pública) |
| `criarCategoria(nome, senha)` | Insere nova categoria com slug gerado |
| `excluirVaga(id, senha)` | Soft-delete: muda `status` para `'inativa'` |
| `listarVagasAdmin(senha)` | Lista TODAS as vagas (ativas e inativas) com joins |

### Fluxo de `criarVaga`:
1. Valida senha
2. Busca empresa por nome → se existe, atualiza campos opcionais; se não, cria nova
3. Gera slug com `gerarSlug(titulo)`
4. Insere na tabela `vagas` com status `'ativa'`, visualizações `0`
5. Retorna `{ success, vaga: { id, slug, titulo } }`

---

## 9. ✅ Status Atual

### Funcional (Implementado)
- [x] Home com listagem de vagas ativas (Server Component + Suspense)
- [x] Filtro por categorias (chips horizontais com scroll)
- [x] Categorias Dinâmicas (unificação `categorias` + `empresa.vendas`)
- [x] Ranking de categorias por contagem de vagas
- [x] Página de detalhe da vaga com Markdown rendering
- [x] Vagas relacionadas (mesma categoria)
- [x] Contador de visualizações (RPC `increment_visualizacoes`)
- [x] SEO dinâmico com `generateMetadata`
- [x] Painel Admin completo (criar, listar, desativar vagas)
- [x] Criação inline de categorias no painel
- [x] Geração de link formatado para WhatsApp com cópia para clipboard
- [x] Design System dark-mode completo (glassmorphism, gradients, animations)
- [x] Skeleton loading states
- [x] Página 404 customizada
- [x] 3 slots de AdSense posicionados (placeholders)
- [x] Schema SQL com RLS, índices e seed data

### Resolvido Recentemente
- [x] **✅ Conexão Supabase restaurada** — `.env.local` atualizado com credenciais reais do projeto `aaxgppernvmtdvhvnqpk`
- [x] **✅ Schema SQL aplicado** — 10 categorias seed confirmadas no banco (Tecnologia, Administrativo, Vendas, etc.)
- [x] **✅ Fetch failed corrigido** — Causa raiz: placeholders no `.env.local`. Clientes agora validam env vars no boot
- [x] **✅ Error handling** — Server Actions com try/catch robusto, mensagens acionáveis em português
- [x] **✅ Trailing slash + trim()** — Clientes removem `/` final e espaços em branco automaticamente
- [x] **✅ PGRST116 handling** — `criarVaga` trata corretamente o erro "no rows found" ao buscar empresa
- [x] **✅ Validação HTTP** — Home (`/`) e Admin retornando 200 OK, `listarCategorias()` retornando 10 categorias
- [x] **✅ AdSense Ready (Páginas Legais)** — Rotas `/privacidade`, `/termos` e `/sobre` integradas.
- [x] **✅ Branding & UI** — Nova logomarca VagasHub integrada ao Header/Footer, configuração de Favicon, refinamento do Footer (`border-white/5`), e padronização de layout (padding/min-h-screen) nas páginas institucionais.
- [x] **✅ Rotas Dinâmicas de Categoria** — Refatorado de filtros Client-Side para SSR (`/categoria/[slug]`), gerando Pageviews independentes para SEO e AdSense.
- [x] **✅ Monetização Máxima** — Implementada repetição de AdSlots in-feed (1 a cada 4 vagas) e um banner fixo no rodapé.
- [x] **✅ SEO e Social Sharing** — Configuração do Open Graph em detalhes da vaga (OG:Image dinâmico), e criação de `sitemap.xml` e `robots.txt` para indexação avançada no Google.

### Pendente
- [ ] **AdSense real:** Substituir placeholders em `AdSlot.tsx` pelo script Google AdSense quando conta aprovada
- [ ] **Imagens externas:** `next.config.ts` está vazio — configurar `images.remotePatterns` se logos forem URLs externas
- [ ] **Deploy:** Configurar variáveis de ambiente no Vercel e atualizar `NEXT_PUBLIC_SITE_URL` para domínio de produção
- [ ] **Rate limiting:** Sem proteção contra spam no admin
- [ ] **Analytics:** Sem Google Analytics ou tracking além do contador de views

---

## 10. 🚨 Armadilhas e Gotchas

1. **Next.js 16.2.6** — Versão mais recente, pode ter breaking changes vs documentação online. `params` e `searchParams` são `Promise` (precisam de `await`).
2. **Tailwind v4** — Usa `@theme inline` ao invés de `tailwind.config.js`. Não há arquivo de config separado.
3. **`createServerClient` é async** — O `server.ts` exporta `async function createClient()` porque `cookies()` retorna Promise no Next.js 15+.
4. **RLS bloqueia vagas inativas** — A policy `vagas_select_ativas` só permite SELECT onde `status = 'ativa'`. O admin usa `service_role` para ver todas.
5. **Slug com sufixo temporal** — Vagas geram slugs com `-xxxx` (Base36 do timestamp). Isso garante unicidade mas torna slugs menos legíveis.
6. **Soft delete** — `excluirVaga` não deleta do banco, apenas muda `status` para `'inativa'`.
7. **Sem middleware.ts** — O projeto não usa middleware. Sessões Supabase não são refreshed automaticamente (irrelevante pois não há auth de usuário).

---

## 11. 📐 Decisões Arquiteturais

| Decisão | Justificativa |
|---|---|
| Server Components para listagem | Performance: dados carregados no servidor, zero JS no client para cards |
| SSR em Rotas de Categoria (`/categoria/[slug]`) | SEO e Pageviews: Cada categoria é indexada individualmente e gera nova visualização de página no AdSense, aumentando RPM. |
| Componentização de `VagasList` | Permite reutilizar a lógica de injeção de Ads "In-Feed" em múltiplas páginas. |
| Client Component para AdSlot | Preparação para script AdSense que requer DOM |
| Admin sem auth real | Simplicidade máxima — único operador, senha no `.env` |
| Markdown nas descrições | Flexibilidade para formatar vagas com títulos, listas, bold, links |
| Categorias dinâmicas via `vendas` | Permite criar "tags" por empresa sem alterar schema do banco |
| Container max 720px mobile | Otimizado para leitura mobile (largura de feed social) |

---

## 12. 📝 Changelog

| Data | Mudança |
|---|---|
| 2026-05-13 | SEO & SOCIAL: Implementado Open Graph (WhatsApp previews), `sitemap.xml` e `robots.txt` gerados automaticamente. Adicionada URL base ao layout. |
| 2026-05-13 | MONETIZAÇÃO & SSR: Criadas Rotas Dinâmicas de Categoria (`/categoria/[slug]`). Refatorada UI para links reais (SEO). Implementada arquitetura de Monetização Máxima (Ad fixo no footer, Ads in-feed a cada 4 cards). |
| 2026-05-13 | BRANDING & UI: Implementação da nova logomarca (Header/Footer), Favicon, e refinamento de layout (min-h-screen, pb-32) nas páginas legais. |
| 2026-05-13 | ADSENSE READY: Criadas páginas legais e institucionais (/privacidade, /termos, /sobre) e integradas ao Footer. |
| 2026-05-13 | MULTI-CATEGORIAS: Tabela `vagas_categorias` (N:N), multi-select no Admin, filtro via junction na Home, removido merge de `vendas` |
| 2026-05-13 | CONEXÃO RESTAURADA: `.env.local` com credenciais reais. Home e Admin 200 OK |
| 2026-05-13 | DEBUG: Hardened 3 clientes Supabase + Server Actions com validação, trim(), try/catch |
| 2026-05-13 | OPENSPEC.md criado — snapshot completo do estado do projeto |
| 2026-05-08 | Projeto iniciado — stack definida, schema criado, pages implementadas |

---

> **PROTOCOLO:** Este arquivo deve ser atualizado ao final de cada tarefa, correção de bug ou alteração de código. A seção "Status Atual" é a fonte de verdade para o progresso do projeto.

# 🧠 OPENSPEC — EduTrack AI (Documentação Viva)

> **Última atualização:** 2026-05-26  
> **Versão:** 1.0.0 — Stack MongoDB  
> **Autor da Migração:** Agente Antigravity (TIER 4)  
> **Propósito:** Este arquivo é a **"Single Source of Truth"** do projeto EduTrack AI. Qualquer IA ou desenvolvedor que leia este documento deve ser capaz de entender, manter e evoluir o sistema sem perda de contexto. Migração completa da camada de persistência de Xano para **MongoDB**.

---

## 1. 📋 Visão Geral do Produto

| Item | Descrição |
|---|---|
| **Nome** | EduTrack AI |
| **Propósito** | Assistente educacional personalizado que organiza a vida acadêmica do estudante, rastreia progresso e gera insights inteligentes via IA |
| **Público-Alvo** | Estudantes universitários e do ensino médio/técnico que precisam gerenciar disciplinas, tarefas e tempo de estudo |
| **Filosofia UX** | **Mobile-First & Zero Overhead** — interface limpa, produtiva, com feedback visual instantâneo |
| **Modelo de Operação** | Aplicativo híbrido (Mobile + Web) com backend próprio em Python e persistência NoSQL |
| **Diferencial** | Motor de IA embarcado que calcula progresso ponderado, prediz riscos acadêmicos e gera insights acionáveis automaticamente |

### Fluxo Principal do Estudante
1. **Registro/Login** → Autenticação via JWT (e-mail + senha com bcrypt)
2. **Cadastro de Disciplinas** → Nome, professor, carga horária, período (datas)
3. **Criação de Tarefas** → Vinculadas a uma disciplina, com estimativa de tempo e prazo
4. **Execução & Tracking** → Transição de status (`pendente → em_andamento → concluída`) com registro de tempo real
5. **Dashboard** → Visão consolidada com gráficos de volumetria por disciplina
6. **Insights de IA** → Feedback automático sobre variância de tempo, progresso ponderado e predições de conclusão

---

## 2. 🛠️ Stack Técnica — Arquitetura de Integração

### Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                 │
│              FlutterFlow (Mobile + Web)                         │
│         Mobile-First · Tema Claro/Escuro                        │
│         Dart/Flutter · Widgets Responsivos                      │
└──────────────────────┬──────────────────────────────────────────┘
                       │ HTTPS / REST API (JSON)
                       │ Authorization: Bearer <JWT>
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Engine Python)                       │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐ │
│  │  Framework    │  │  Auth Layer  │  │  Motor de IA          │ │
│  │  FastAPI /    │  │  JWT + bcrypt│  │  Progresso Ponderado  │ │
│  │  Flask        │  │  Middleware  │  │  Predição Acadêmica   │ │
│  │              │  │  de Segurança│  │  Geração de Insights  │ │
│  └──────┬───────┘  └──────────────┘  └───────────────────────┘ │
│         │                                                       │
│  ┌──────┴───────┐  ┌──────────────┐  ┌───────────────────────┐ │
│  │  Rotas CRUD  │  │  Aggregation │  │  Relatórios PDF       │ │
│  │  /users      │  │  Pipelines   │  │  Push Notifications   │ │
│  │  /subjects   │  │  Dashboard   │  │  Scheduler (cron)     │ │
│  │  /tasks      │  │  Analytics   │  │                       │ │
│  └──────────────┘  └──────────────┘  └───────────────────────┘ │
└──────────────────────┬──────────────────────────────────────────┘
                       │ pymongo / motor (driver oficial)
                       │ Connection String: mongodb+srv://
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BANCO DE DADOS                                │
│                  MongoDB (Atlas / Self-Hosted)                   │
│                                                                 │
│  ┌──────────┐  ┌────────────┐  ┌────────────────┐              │
│  │  users   │  │  subjects  │  │ academic_tasks │              │
│  │ (Auth)   │  │ (Matérias) │  │ (Tarefas)      │              │
│  └──────────┘  └────────────┘  └────────────────┘              │
│                                                                 │
│  JSON Schema Validation · Índices Compostos · TTL Indexes       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    GOVERNANÇA                                    │
│  OpenSpec (Documentação Viva) + Gemini Code Assist (Copiloto)   │
└─────────────────────────────────────────────────────────────────┘
```

### Dependências Python (Planejadas)

| Pacote | Versão Mínima | Propósito |
|---|---|---|
| `fastapi` | `>=0.110` | Framework de API REST assíncrono |
| `uvicorn` | `>=0.29` | Servidor ASGI para FastAPI |
| `pymongo` | `>=4.7` | Driver síncrono oficial do MongoDB |
| `motor` | `>=3.4` | Driver assíncrono do MongoDB (async/await) |
| `python-jose[cryptography]` | `>=3.3` | Geração e validação de tokens JWT |
| `passlib[bcrypt]` | `>=1.7` | Hashing seguro de senhas (bcrypt) |
| `pydantic` | `>=2.7` | Validação de schemas e serialização |
| `python-dotenv` | `>=1.0` | Carregamento de variáveis de ambiente |
| `reportlab` | `>=4.1` | Geração de relatórios em PDF |
| `apscheduler` | `>=3.10` | Agendamento de tarefas (push notifications) |

### Variáveis de Ambiente (`.env`)

```env
# --- MongoDB ---
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/edutrack?retryWrites=true&w=majority
MONGO_DB_NAME=edutrack

# --- JWT ---
JWT_SECRET_KEY=chave-secreta-jwt-super-segura-2026
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=1440   # 24 horas

# --- App ---
APP_HOST=0.0.0.0
APP_PORT=8000
APP_ENV=development           # development | staging | production

# --- Push Notifications (futuro) ---
FIREBASE_CREDENTIALS_PATH=./firebase-service-account.json
```

---

## 3. 🗄️ Modelo de Dados NoSQL (MongoDB Collections)

> **Convenções:**
> - Todos os atributos em `snake_case`
> - Chaves de referência baseadas em `ObjectId`
> - Datas armazenadas como tipo nativo `ISODate` do MongoDB
> - Nenhum campo `null` sem propósito explícito — preferir omissão do campo

---

### 3.1 Coleção: `users`

**Propósito:** Armazenar credenciais de autenticação e perfil básico de cada estudante.

#### Documento Exemplo (BSON)

```json
{
  "_id": ObjectId("665d2a1b9c3f4a001e8b4567"),
  "name": "João Victor Vieira",
  "email": "joao.vieira@university.edu",
  "password_hash": "$2b$12$LJ3m5...",
  "created_at": ISODate("2026-05-26T20:00:00.000Z")
}
```

#### Schema de Validação (JSON Schema)

```javascript
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "email", "password_hash", "created_at"],
      properties: {
        name: {
          bsonType: "string",
          minLength: 2,
          maxLength: 120,
          description: "Nome completo do estudante — obrigatório"
        },
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
          description: "E-mail único — obrigatório, usado como login"
        },
        password_hash: {
          bsonType: "string",
          description: "Hash bcrypt da senha — NUNCA armazenar senha em texto puro"
        },
        created_at: {
          bsonType: "date",
          description: "Data de criação da conta"
        }
      }
    }
  }
});
```

#### Índices

```javascript
db.users.createIndex({ "email": 1 }, { unique: true, name: "idx_users_email_unique" });
db.users.createIndex({ "created_at": -1 }, { name: "idx_users_created_at" });
```

---

### 3.2 Coleção: `subjects`

**Propósito:** Representar as disciplinas/matérias de cada estudante, vinculadas por `user_id`.

#### Documento Exemplo (BSON)

```json
{
  "_id": ObjectId("665d2b3c9c3f4a001e8b4568"),
  "user_id": ObjectId("665d2a1b9c3f4a001e8b4567"),
  "name": "Estruturas de Dados",
  "teacher": "Prof. Dr. Carlos Silva",
  "workload": 80,
  "description": "Listas, filas, pilhas, árvores, grafos e algoritmos de ordenação",
  "start_date": ISODate("2026-02-10T00:00:00.000Z"),
  "end_date": ISODate("2026-06-30T00:00:00.000Z")
}
```

#### Schema de Validação (JSON Schema)

```javascript
db.createCollection("subjects", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["user_id", "name", "workload", "start_date", "end_date"],
      properties: {
        user_id: {
          bsonType: "objectId",
          description: "Referência ao dono (users._id) — obrigatório"
        },
        name: {
          bsonType: "string",
          minLength: 2,
          maxLength: 200,
          description: "Nome da disciplina — obrigatório"
        },
        teacher: {
          bsonType: "string",
          maxLength: 200,
          description: "Nome do professor — opcional"
        },
        workload: {
          bsonType: "int",
          minimum: 1,
          maximum: 2000,
          description: "Carga horária total em horas — obrigatório, mín. 1"
        },
        description: {
          bsonType: "string",
          maxLength: 2000,
          description: "Descrição livre da disciplina — opcional"
        },
        start_date: {
          bsonType: "date",
          description: "Data de início do período letivo — obrigatório"
        },
        end_date: {
          bsonType: "date",
          description: "Data de término do período letivo — obrigatório"
        }
      }
    }
  }
});
```

#### Índices

```javascript
// Índice composto para queries filtradas por usuário (OBRIGATÓRIO em toda query)
db.subjects.createIndex({ "user_id": 1, "name": 1 }, { name: "idx_subjects_user_name" });

// Índice para ordenação temporal
db.subjects.createIndex({ "user_id": 1, "end_date": 1 }, { name: "idx_subjects_user_enddate" });
```

---

### 3.3 Coleção: `academic_tasks`

**Propósito:** Representar tarefas acadêmicas vinculadas a disciplinas, com rastreamento de tempo e status.

#### Documento Exemplo (BSON)

```json
{
  "_id": ObjectId("665d2c4d9c3f4a001e8b4569"),
  "subject_id": ObjectId("665d2b3c9c3f4a001e8b4568"),
  "title": "Implementar Árvore AVL em Python",
  "description": "Implementar inserção, remoção e balanceamento com testes unitários",
  "estimated_time": 180,
  "real_time": 0,
  "due_date": ISODate("2026-04-15T23:59:59.000Z"),
  "status": "pendente"
}
```

#### Estados Válidos — Máquina de Transição

```
┌───────────┐      start()      ┌──────────────┐     complete()    ┌────────────┐
│  pendente  │ ───────────────► │  em_andamento │ ────────────────► │  concluída │
└───────────┘                   └──────────────┘                    └────────────┘
                                       │
                                       │ pause()
                                       ▼
                                ┌──────────────┐
                                │   pendente   │  (volta ao início)
                                └──────────────┘
```

| Status | Valor no Banco | Descrição |
|---|---|---|
| Pendente | `"pendente"` | Tarefa criada, aguardando início |
| Em Andamento | `"em_andamento"` | Estudante está trabalhando ativamente |
| Concluída | `"concluida"` | Tarefa finalizada, `real_time` registrado |

#### Schema de Validação (JSON Schema)

```javascript
db.createCollection("academic_tasks", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["subject_id", "title", "estimated_time", "due_date", "status"],
      properties: {
        subject_id: {
          bsonType: "objectId",
          description: "Referência à disciplina (subjects._id) — obrigatório"
        },
        title: {
          bsonType: "string",
          minLength: 3,
          maxLength: 300,
          description: "Título da tarefa — obrigatório"
        },
        description: {
          bsonType: "string",
          maxLength: 5000,
          description: "Descrição detalhada — opcional"
        },
        estimated_time: {
          bsonType: "int",
          minimum: 1,
          description: "Tempo estimado em minutos — obrigatório"
        },
        real_time: {
          bsonType: "int",
          minimum: 0,
          description: "Tempo real gasto em minutos — default 0"
        },
        due_date: {
          bsonType: "date",
          description: "Prazo de entrega — obrigatório"
        },
        status: {
          bsonType: "string",
          enum: ["pendente", "em_andamento", "concluida"],
          description: "Estado atual da tarefa — obrigatório"
        }
      }
    }
  }
});
```

#### Índices

```javascript
// Índice primário: busca de tarefas por disciplina + status (usado em queries de dashboard)
db.academic_tasks.createIndex(
  { "subject_id": 1, "status": 1 },
  { name: "idx_tasks_subject_status" }
);

// Índice para alertas de prazo (push notifications)
db.academic_tasks.createIndex(
  { "due_date": 1, "status": 1 },
  { name: "idx_tasks_duedate_status" }
);

// Índice para queries de analytics (variância de tempo)
db.academic_tasks.createIndex(
  { "subject_id": 1, "estimated_time": 1, "real_time": 1 },
  { name: "idx_tasks_subject_times" }
);
```

---

### 3.4 Diagrama de Relacionamento entre Coleções

```
┌──────────────┐           ┌──────────────────┐           ┌────────────────────┐
│    users     │           │    subjects       │           │  academic_tasks    │
│──────────────│    1:N    │──────────────────│    1:N    │────────────────────│
│ _id (PK)     │◄─────────│ user_id (FK)      │◄─────────│ subject_id (FK)    │
│ name         │           │ _id (PK)          │           │ _id (PK)           │
│ email (UQ)   │           │ name              │           │ title              │
│ password_hash│           │ teacher           │           │ description        │
│ created_at   │           │ workload          │           │ estimated_time     │
│              │           │ description       │           │ real_time          │
│              │           │ start_date        │           │ due_date           │
│              │           │ end_date          │           │ status             │
└──────────────┘           └──────────────────┘           └────────────────────┘

Regra de Segurança: TODA query de subjects filtra por user_id do JWT.
                    TODA query de academic_tasks resolve subject_id → user_id para isolamento.
```

---

## 4. 🔐 Autenticação e Segurança

### 4.1 Fluxo de Registro

```
Cliente (FlutterFlow)                    Engine Python                         MongoDB
       │                                       │                                  │
       │──── POST /api/auth/register ──────────►│                                  │
       │     { name, email, password }         │                                  │
       │                                       │── Valida schema (Pydantic) ──────│
       │                                       │── Verifica duplicata (email) ────►│
       │                                       │◄── Resultado da busca ───────────│
       │                                       │                                  │
       │                                       │── bcrypt.hash(password) ─────────│
       │                                       │── db.users.insert_one({...}) ───►│
       │                                       │◄── { inserted_id } ─────────────│
       │                                       │                                  │
       │                                       │── Gera JWT (user_id + exp) ─────│
       │◄──── 201 { token, user } ─────────────│                                  │
```

### 4.2 Fluxo de Login

```
Cliente (FlutterFlow)                    Engine Python                         MongoDB
       │                                       │                                  │
       │──── POST /api/auth/login ─────────────►│                                  │
       │     { email, password }               │                                  │
       │                                       │── db.users.find_one({email}) ───►│
       │                                       │◄── user_doc ────────────────────│
       │                                       │                                  │
       │                                       │── bcrypt.verify(password,        │
       │                                       │      user_doc.password_hash) ────│
       │                                       │                                  │
       │                                       │── Gera JWT (user_id + exp) ─────│
       │◄──── 200 { token, user } ─────────────│                                  │
```

### 4.3 Estrutura do Token JWT

```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "665d2a1b9c3f4a001e8b4567",
    "email": "joao.vieira@university.edu",
    "name": "João Victor Vieira",
    "iat": 1716753600,
    "exp": 1716840000
  }
}
```

| Campo | Tipo | Descrição |
|---|---|---|
| `sub` | `string` | `_id` do usuário (ObjectId serializado como string) |
| `email` | `string` | E-mail do usuário (para referência rápida) |
| `name` | `string` | Nome do usuário (para UI sem query extra) |
| `iat` | `int` | Timestamp de emissão (Unix epoch) |
| `exp` | `int` | Timestamp de expiração (iat + 24h por padrão) |

### 4.4 Middleware de Segurança — Isolamento de Documentos

> [!CAUTION]
> **REGRA INVIOLÁVEL:** Toda operação `find`, `update_one`, `delete_one` nas coleções `subjects` e `academic_tasks` **DEVE** incluir o filtro de `user_id` extraído do JWT. Nenhuma exceção é tolerada.

```python
# middleware/auth.py — Pseudocódigo do middleware de autenticação

from fastapi import Request, HTTPException, Depends
from jose import jwt, JWTError
from bson import ObjectId

async def get_current_user(request: Request) -> dict:
    """Extrai e valida o user_id do token JWT presente no header Authorization."""
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    
    if not token:
        raise HTTPException(status_code=401, detail="Token não fornecido")
    
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Token inválido")
        return {"user_id": ObjectId(user_id), "email": payload.get("email")}
    except JWTError:
        raise HTTPException(status_code=401, detail="Token expirado ou inválido")


# Exemplo de uso em rota protegida:
@router.get("/api/subjects")
async def list_subjects(current_user: dict = Depends(get_current_user)):
    """Retorna SOMENTE as disciplinas do usuário autenticado."""
    subjects = await db.subjects.find(
        {"user_id": current_user["user_id"]}  # ← FILTRO OBRIGATÓRIO
    ).to_list(length=100)
    return subjects
```

#### Cadeia de Isolamento para `academic_tasks`

Como `academic_tasks` não possui `user_id` diretamente (referencia `subject_id`), o isolamento exige uma **verificação em dois passos**:

```python
@router.get("/api/tasks/{subject_id}")
async def list_tasks(subject_id: str, current_user: dict = Depends(get_current_user)):
    """Lista tarefas somente se a disciplina pertencer ao usuário."""
    
    # PASSO 1: Verificar se a disciplina pertence ao usuário
    subject = await db.subjects.find_one({
        "_id": ObjectId(subject_id),
        "user_id": current_user["user_id"]  # ← ISOLAMENTO
    })
    
    if not subject:
        raise HTTPException(status_code=404, detail="Disciplina não encontrada")
    
    # PASSO 2: Buscar tarefas da disciplina validada
    tasks = await db.academic_tasks.find(
        {"subject_id": ObjectId(subject_id)}
    ).to_list(length=500)
    
    return tasks
```

---

## 5. 🎯 Especificação do MVP — Fluxos Core

### 5.1 Mapa de Rotas da API (REST)

#### Autenticação (`/api/auth`)

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `POST` | `/api/auth/register` | ❌ | Registro de novo estudante |
| `POST` | `/api/auth/login` | ❌ | Login com e-mail + senha → JWT |
| `GET` | `/api/auth/me` | ✅ | Retorna perfil do usuário autenticado |

#### Disciplinas (`/api/subjects`)

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `GET` | `/api/subjects` | ✅ | Listar disciplinas do usuário |
| `POST` | `/api/subjects` | ✅ | Criar nova disciplina |
| `GET` | `/api/subjects/{id}` | ✅ | Detalhe de uma disciplina |
| `PUT` | `/api/subjects/{id}` | ✅ | Atualizar disciplina |
| `DELETE` | `/api/subjects/{id}` | ✅ | Excluir disciplina e suas tarefas |

#### Tarefas Acadêmicas (`/api/tasks`)

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `GET` | `/api/tasks?subject_id={id}` | ✅ | Listar tarefas de uma disciplina |
| `POST` | `/api/tasks` | ✅ | Criar nova tarefa |
| `GET` | `/api/tasks/{id}` | ✅ | Detalhe de uma tarefa |
| `PUT` | `/api/tasks/{id}` | ✅ | Atualizar tarefa (título, desc, estimativa) |
| `PATCH` | `/api/tasks/{id}/status` | ✅ | Transição de status (máquina de estados) |
| `PATCH` | `/api/tasks/{id}/track-time` | ✅ | Incrementar `real_time` (operação atômica) |
| `DELETE` | `/api/tasks/{id}` | ✅ | Excluir tarefa |

#### Dashboard & Analytics (`/api/dashboard`)

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `GET` | `/api/dashboard/summary` | ✅ | Volumetria de tarefas por disciplina |
| `GET` | `/api/dashboard/progress` | ✅ | Progresso ponderado global |
| `GET` | `/api/dashboard/predictions` | ✅ | Predições de conclusão por disciplina |
| `GET` | `/api/dashboard/insights` | ✅ | Insights inteligentes de IA |

#### Relatórios (`/api/reports`)

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `GET` | `/api/reports/weekly-pdf` | ✅ | Gera e retorna relatório semanal em PDF |

---

### 5.2 Operações CRUD — Payloads e Exemplos

#### Criar Disciplina — `POST /api/subjects`

**Request:**
```json
{
  "name": "Estruturas de Dados",
  "teacher": "Prof. Dr. Carlos Silva",
  "workload": 80,
  "description": "Listas, filas, pilhas, árvores, grafos",
  "start_date": "2026-02-10",
  "end_date": "2026-06-30"
}
```

**Response (201):**
```json
{
  "success": true,
  "subject": {
    "_id": "665d2b3c9c3f4a001e8b4568",
    "name": "Estruturas de Dados",
    "teacher": "Prof. Dr. Carlos Silva",
    "workload": 80,
    "description": "Listas, filas, pilhas, árvores, grafos",
    "start_date": "2026-02-10T00:00:00Z",
    "end_date": "2026-06-30T00:00:00Z"
  }
}
```

**Operação MongoDB:**
```python
result = await db.subjects.insert_one({
    "user_id": current_user["user_id"],  # Injetado pelo middleware
    "name": payload.name,
    "teacher": payload.teacher,
    "workload": payload.workload,
    "description": payload.description,
    "start_date": datetime.fromisoformat(payload.start_date),
    "end_date": datetime.fromisoformat(payload.end_date)
})
```

---

#### Criar Tarefa — `POST /api/tasks`

**Request:**
```json
{
  "subject_id": "665d2b3c9c3f4a001e8b4568",
  "title": "Implementar Árvore AVL",
  "description": "Inserção, remoção e balanceamento com testes",
  "estimated_time": 180,
  "due_date": "2026-04-15"
}
```

**Response (201):**
```json
{
  "success": true,
  "task": {
    "_id": "665d2c4d9c3f4a001e8b4569",
    "subject_id": "665d2b3c9c3f4a001e8b4568",
    "title": "Implementar Árvore AVL",
    "description": "Inserção, remoção e balanceamento com testes",
    "estimated_time": 180,
    "real_time": 0,
    "due_date": "2026-04-15T23:59:59Z",
    "status": "pendente"
  }
}
```

**Operação MongoDB:**
```python
# Validação de ownership (subject pertence ao user)
subject = await db.subjects.find_one({
    "_id": ObjectId(payload.subject_id),
    "user_id": current_user["user_id"]
})
if not subject:
    raise HTTPException(404, "Disciplina não encontrada")

result = await db.academic_tasks.insert_one({
    "subject_id": ObjectId(payload.subject_id),
    "title": payload.title,
    "description": payload.description,
    "estimated_time": payload.estimated_time,
    "real_time": 0,           # Sempre inicia em 0
    "due_date": datetime.fromisoformat(payload.due_date),
    "status": "pendente"      # Sempre inicia como pendente
})
```

---

### 5.3 Transição de Status — Operações Atômicas

#### `PATCH /api/tasks/{id}/status`

**Request:**
```json
{
  "new_status": "em_andamento"
}
```

**Lógica de Validação da Máquina de Estados:**

```python
# Transições válidas
VALID_TRANSITIONS = {
    "pendente":      ["em_andamento"],
    "em_andamento":  ["concluida", "pendente"],  # pode pausar
    "concluida":     []                           # estado final
}

async def update_task_status(task_id: str, new_status: str, current_user: dict):
    task = await get_task_with_ownership(task_id, current_user)
    
    current_status = task["status"]
    
    if new_status not in VALID_TRANSITIONS.get(current_status, []):
        raise HTTPException(
            status_code=422,
            detail=f"Transição inválida: {current_status} → {new_status}"
        )
    
    # Atualização atômica com $set
    result = await db.academic_tasks.update_one(
        {"_id": ObjectId(task_id)},
        {"$set": {"status": new_status}}
    )
    
    return {"success": True, "previous": current_status, "current": new_status}
```

---

### 5.4 Tracking de Tempo — Operador Atômico `$inc`

#### `PATCH /api/tasks/{id}/track-time`

**Request:**
```json
{
  "minutes_to_add": 45
}
```

**Operação MongoDB (atômica, thread-safe):**

```python
async def track_time(task_id: str, minutes: int, current_user: dict):
    """Incrementa real_time de forma atômica usando $inc."""
    
    task = await get_task_with_ownership(task_id, current_user)
    
    if task["status"] != "em_andamento":
        raise HTTPException(422, "Só é possível registrar tempo em tarefas 'em_andamento'")
    
    if minutes <= 0:
        raise HTTPException(422, "Minutos devem ser positivos")
    
    # $inc é atômico — seguro para acessos concorrentes
    result = await db.academic_tasks.update_one(
        {"_id": ObjectId(task_id)},
        {"$inc": {"real_time": minutes}}
    )
    
    updated_task = await db.academic_tasks.find_one({"_id": ObjectId(task_id)})
    
    return {
        "success": True,
        "real_time_total": updated_task["real_time"],
        "minutes_added": minutes
    }
```

> [!NOTE]
> O operador `$inc` do MongoDB é **atômico no nível do documento**, garantindo consistência mesmo com múltiplas requisições simultâneas. Não há risco de race conditions ao incrementar `real_time`.

---

### 5.5 Dashboard — Aggregation Pipelines

#### `GET /api/dashboard/summary`

**Pipeline de Agregação para Volumetria por Disciplina:**

```python
async def get_dashboard_summary(current_user: dict):
    """Retorna contagem de tarefas agrupadas por disciplina e status."""
    
    # Buscar subject_ids do usuário
    user_subject_ids = await db.subjects.distinct(
        "_id",
        {"user_id": current_user["user_id"]}
    )
    
    pipeline = [
        # Filtrar tarefas das disciplinas do usuário
        {"$match": {"subject_id": {"$in": user_subject_ids}}},
        
        # Agrupar por disciplina e status
        {"$group": {
            "_id": {
                "subject_id": "$subject_id",
                "status": "$status"
            },
            "count": {"$sum": 1},
            "total_estimated": {"$sum": "$estimated_time"},
            "total_real": {"$sum": "$real_time"}
        }},
        
        # Reagrupar por disciplina
        {"$group": {
            "_id": "$_id.subject_id",
            "status_breakdown": {
                "$push": {
                    "status": "$_id.status",
                    "count": "$count",
                    "total_estimated": "$total_estimated",
                    "total_real": "$total_real"
                }
            },
            "total_tasks": {"$sum": "$count"}
        }},
        
        # Lookup para trazer nome da disciplina
        {"$lookup": {
            "from": "subjects",
            "localField": "_id",
            "foreignField": "_id",
            "as": "subject_info"
        }},
        
        {"$unwind": "$subject_info"},
        
        # Projeção final
        {"$project": {
            "_id": 0,
            "subject_id": "$_id",
            "subject_name": "$subject_info.name",
            "workload": "$subject_info.workload",
            "total_tasks": 1,
            "status_breakdown": 1
        }},
        
        {"$sort": {"subject_name": 1}}
    ]
    
    result = await db.academic_tasks.aggregate(pipeline).to_list(length=100)
    return result
```

**Response Exemplo:**
```json
{
  "summary": [
    {
      "subject_id": "665d2b3c9c3f4a001e8b4568",
      "subject_name": "Estruturas de Dados",
      "workload": 80,
      "total_tasks": 12,
      "status_breakdown": [
        { "status": "concluida", "count": 7, "total_estimated": 600, "total_real": 720 },
        { "status": "em_andamento", "count": 2, "total_estimated": 240, "total_real": 90 },
        { "status": "pendente", "count": 3, "total_estimated": 360, "total_real": 0 }
      ]
    },
    {
      "subject_id": "665d2b4d9c3f4a001e8b4570",
      "subject_name": "Banco de Dados II",
      "workload": 60,
      "total_tasks": 8,
      "status_breakdown": [
        { "status": "concluida", "count": 5, "total_estimated": 300, "total_real": 280 },
        { "status": "pendente", "count": 3, "total_estimated": 180, "total_real": 0 }
      ]
    }
  ]
}
```

---

## 6. 🤖 Funcionalidades Avançadas — Motor de IA

### 6.1 Cálculo Estatístico de Progresso Ponderado

**Fórmula Matemática:**

$$
\text{Progresso Ponderado} = \frac{\sum_{i=1}^{n} (\text{CargaHorária}_i \times \%\text{Conclusão}_i)}{\sum_{i=1}^{n} \text{CargaHorária}_i}
$$

Onde:
- **n** = número de disciplinas do usuário
- **CargaHorária_i** = campo `workload` da disciplina *i*
- **%Conclusão_i** = `(tarefas concluídas / total de tarefas)` da disciplina *i*

**Implementação Python:**

```python
# services/analytics.py

async def calculate_weighted_progress(current_user: dict) -> dict:
    """
    Calcula o progresso ponderado do estudante considerando a carga horária
    de cada disciplina como peso proporcional.
    
    Disciplinas com maior carga horária têm MAIS impacto no progresso global.
    """
    
    subjects = await db.subjects.find(
        {"user_id": current_user["user_id"]}
    ).to_list(length=100)
    
    if not subjects:
        return {"weighted_progress": 0.0, "subjects_detail": []}
    
    numerator = 0.0    # Σ (carga_horaria × %conclusão)
    denominator = 0.0  # Σ carga_horaria
    subjects_detail = []
    
    for subject in subjects:
        workload = subject["workload"]
        subject_id = subject["_id"]
        
        # Contagem de tarefas por status via aggregation
        task_counts = await db.academic_tasks.aggregate([
            {"$match": {"subject_id": subject_id}},
            {"$group": {
                "_id": "$status",
                "count": {"$sum": 1}
            }}
        ]).to_list(length=10)
        
        # Mapear contagens
        count_map = {item["_id"]: item["count"] for item in task_counts}
        total = sum(count_map.values())
        completed = count_map.get("concluida", 0)
        
        # Percentual de conclusão da disciplina
        completion_pct = (completed / total * 100) if total > 0 else 0.0
        
        # Acumular para média ponderada
        numerator += workload * completion_pct
        denominator += workload
        
        subjects_detail.append({
            "subject_id": str(subject_id),
            "subject_name": subject["name"],
            "workload": workload,
            "total_tasks": total,
            "completed_tasks": completed,
            "completion_percentage": round(completion_pct, 2)
        })
    
    weighted_progress = round(numerator / denominator, 2) if denominator > 0 else 0.0
    
    return {
        "weighted_progress": weighted_progress,
        "total_workload": denominator,
        "subjects_detail": subjects_detail
    }
```

**Response Exemplo — `GET /api/dashboard/progress`:**

```json
{
  "weighted_progress": 62.14,
  "total_workload": 140,
  "subjects_detail": [
    {
      "subject_id": "665d2b3c9c3f4a001e8b4568",
      "subject_name": "Estruturas de Dados",
      "workload": 80,
      "total_tasks": 12,
      "completed_tasks": 7,
      "completion_percentage": 58.33
    },
    {
      "subject_id": "665d2b4d9c3f4a001e8b4570",
      "subject_name": "Banco de Dados II",
      "workload": 60,
      "total_tasks": 8,
      "completed_tasks": 5,
      "completion_percentage": 62.50
    }
  ]
}
```

> **Verificação manual:** (80 × 58.33 + 60 × 62.50) / (80 + 60) = (4666.4 + 3750) / 140 = **60.12%** ✓

---

### 6.2 Predição Acadêmica

**Objetivo:** Estimar se o ritmo atual do estudante permitirá completar todas as tarefas antes do `end_date` de cada disciplina.

**Lógica de Predição:**

```python
# services/prediction.py

from datetime import datetime, timezone

async def predict_completion(current_user: dict) -> list:
    """
    Para cada disciplina, calcula:
    1. Velocidade média de conclusão (tarefas/dia)
    2. Tarefas restantes
    3. Dias restantes até end_date
    4. Predição: conseguirá terminar a tempo?
    """
    
    subjects = await db.subjects.find(
        {"user_id": current_user["user_id"]}
    ).to_list(length=100)
    
    predictions = []
    now = datetime.now(timezone.utc)
    
    for subject in subjects:
        subject_id = subject["_id"]
        end_date = subject["end_date"]
        
        # Buscar todas as tarefas da disciplina
        tasks = await db.academic_tasks.find(
            {"subject_id": subject_id}
        ).to_list(length=500)
        
        total_tasks = len(tasks)
        if total_tasks == 0:
            continue
        
        completed_tasks = [t for t in tasks if t["status"] == "concluida"]
        pending_tasks = total_tasks - len(completed_tasks)
        
        # Calcular velocidade média (tarefas concluídas por dia)
        if completed_tasks:
            # Tempo decorrido desde o início da disciplina
            days_elapsed = max((now - subject["start_date"]).days, 1)
            velocity = len(completed_tasks) / days_elapsed  # tarefas/dia
        else:
            velocity = 0
        
        # Dias restantes até o fim
        days_remaining = max((end_date - now).days, 0)
        
        # Predição
        if pending_tasks == 0:
            status = "completed"
            message = "✅ Todas as tarefas foram concluídas!"
            predicted_completion_date = None
        elif velocity > 0:
            days_needed = pending_tasks / velocity
            predicted_completion_date = now + timedelta(days=days_needed)
            
            if days_needed <= days_remaining:
                status = "on_track"
                buffer_days = days_remaining - days_needed
                message = (
                    f"📗 No ritmo atual, você concluirá "
                    f"{int(days_needed)} dias antes do prazo "
                    f"(folga de {int(buffer_days)} dias)."
                )
            else:
                status = "at_risk"
                deficit_days = days_needed - days_remaining
                message = (
                    f"🚨 ALERTA: No ritmo atual, você precisará de "
                    f"mais {int(deficit_days)} dias além do prazo. "
                    f"Aumente o ritmo de estudo!"
                )
        else:
            status = "no_data"
            predicted_completion_date = None
            message = (
                "⚠️ Nenhuma tarefa concluída ainda. "
                "Comece a trabalhar para gerar predições."
            )
        
        predictions.append({
            "subject_id": str(subject_id),
            "subject_name": subject["name"],
            "total_tasks": total_tasks,
            "completed_tasks": len(completed_tasks),
            "pending_tasks": pending_tasks,
            "velocity_per_day": round(velocity, 3),
            "days_remaining": days_remaining,
            "predicted_completion_date": (
                predicted_completion_date.isoformat() 
                if predicted_completion_date else None
            ),
            "status": status,
            "message": message
        })
    
    return predictions
```

**Response Exemplo — `GET /api/dashboard/predictions`:**

```json
{
  "predictions": [
    {
      "subject_id": "665d2b3c9c3f4a001e8b4568",
      "subject_name": "Estruturas de Dados",
      "total_tasks": 12,
      "completed_tasks": 7,
      "pending_tasks": 5,
      "velocity_per_day": 0.065,
      "days_remaining": 35,
      "predicted_completion_date": "2026-08-11T20:00:00Z",
      "status": "at_risk",
      "message": "🚨 ALERTA: No ritmo atual, você precisará de mais 42 dias além do prazo. Aumente o ritmo de estudo!"
    },
    {
      "subject_id": "665d2b4d9c3f4a001e8b4570",
      "subject_name": "Banco de Dados II",
      "total_tasks": 8,
      "completed_tasks": 5,
      "pending_tasks": 3,
      "velocity_per_day": 0.125,
      "days_remaining": 35,
      "predicted_completion_date": "2026-06-19T20:00:00Z",
      "status": "on_track",
      "message": "📗 No ritmo atual, você concluirá 24 dias antes do prazo (folga de 11 dias)."
    }
  ]
}
```

---

### 6.3 Geração de Insights Inteligentes

**Objetivo:** Motor de IA que compara `estimated_time` vs `real_time` para detectar padrões e gerar feedback acionável.

```python
# services/insights.py

async def generate_insights(current_user: dict) -> list:
    """
    Analisa variância entre tempo estimado e tempo real de cada disciplina.
    Gera insights categorizados por severidade.
    """
    
    subjects = await db.subjects.find(
        {"user_id": current_user["user_id"]}
    ).to_list(length=100)
    
    insights = []
    
    for subject in subjects:
        subject_id = subject["_id"]
        
        # Agregar tempos das tarefas concluídas
        time_agg = await db.academic_tasks.aggregate([
            {"$match": {
                "subject_id": subject_id,
                "status": "concluida"
            }},
            {"$group": {
                "_id": None,
                "total_estimated": {"$sum": "$estimated_time"},
                "total_real": {"$sum": "$real_time"},
                "task_count": {"$sum": 1}
            }}
        ]).to_list(length=1)
        
        if not time_agg:
            continue
        
        agg = time_agg[0]
        total_estimated = agg["total_estimated"]
        total_real = agg["total_real"]
        
        if total_estimated == 0:
            continue
        
        # Calcular variância percentual
        variance = ((total_real - total_estimated) / total_estimated) * 100
        variance_rounded = round(variance, 1)
        
        # Classificar insight por severidade
        if variance > 30:
            status = "critical"
            message = (
                f"🔴 CRÍTICO: O tempo real em '{subject['name']}' "
                f"superou a estimativa em {variance_rounded}%. "
                f"Reavalie profundamente suas estimativas e método de estudo."
            )
        elif variance > 15:
            status = "warning"
            message = (
                f"🟡 Atenção: O tempo real gasto em '{subject['name']}' "
                f"superou a estimativa em {variance_rounded}%. "
                f"Revise suas metas de estudo."
            )
        elif variance > 0:
            status = "info"
            message = (
                f"🔵 Info: '{subject['name']}' teve um leve excedente "
                f"de {variance_rounded}% sobre a estimativa. Normal, "
                f"mas fique atento."
            )
        elif variance > -15:
            status = "success"
            message = (
                f"🟢 Excelente: Você está dentro da estimativa em "
                f"'{subject['name']}' (variância de {variance_rounded}%). "
                f"Continue assim!"
            )
        else:
            status = "overestimate"
            message = (
                f"💡 Dica: Suas estimativas para '{subject['name']}' "
                f"estão {abs(variance_rounded)}% acima do real. "
                f"Considere ajustar para baixo para maior precisão."
            )
        
        insights.append({
            "status": status,
            "subject_id": str(subject_id),
            "subject_name": subject["name"],
            "total_estimated_minutes": total_estimated,
            "total_real_minutes": total_real,
            "variance_percentage": variance_rounded,
            "tasks_analyzed": agg["task_count"],
            "insight_message": message
        })
    
    # Ordenar por severidade (critical primeiro)
    severity_order = {"critical": 0, "warning": 1, "info": 2, "overestimate": 3, "success": 4}
    insights.sort(key=lambda x: severity_order.get(x["status"], 99))
    
    return insights
```

**Response Exemplo — `GET /api/dashboard/insights`:**

```json
{
  "insights": [
    {
      "status": "warning",
      "subject_id": "665d2b3c9c3f4a001e8b4568",
      "subject_name": "Estruturas de Dados",
      "total_estimated_minutes": 600,
      "total_real_minutes": 753,
      "variance_percentage": 25.5,
      "tasks_analyzed": 7,
      "insight_message": "🟡 Atenção: O tempo real gasto em 'Estruturas de Dados' superou a estimativa em 25.5%. Revise suas metas de estudo."
    },
    {
      "status": "success",
      "subject_id": "665d2b4d9c3f4a001e8b4570",
      "subject_name": "Banco de Dados II",
      "total_estimated_minutes": 300,
      "total_real_minutes": 280,
      "variance_percentage": -6.7,
      "tasks_analyzed": 5,
      "insight_message": "🟢 Excelente: Você está dentro da estimativa em 'Banco de Dados II' (variância de -6.7%). Continue assim!"
    }
  ],
  "generated_at": "2026-05-26T20:05:00Z"
}
```

---

### 6.4 Relatórios Semanais em PDF

**Pipeline de Geração:**

```python
# services/reports.py

from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Table, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from io import BytesIO

async def generate_weekly_report(current_user: dict) -> BytesIO:
    """
    Gera relatório PDF semanal contendo:
    1. Resumo de progresso ponderado
    2. Detalhamento por disciplina
    3. Insights de IA
    4. Predições de conclusão
    """
    
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    elements = []
    styles = getSampleStyleSheet()
    
    # Header
    elements.append(Paragraph(
        f"📊 EduTrack AI — Relatório Semanal",
        styles['Title']
    ))
    elements.append(Paragraph(
        f"Estudante: {current_user['name']} | Gerado em: {datetime.now().strftime('%d/%m/%Y %H:%M')}",
        styles['Normal']
    ))
    elements.append(Spacer(1, 20))
    
    # Progresso Ponderado
    progress = await calculate_weighted_progress(current_user)
    elements.append(Paragraph(
        f"Progresso Ponderado Global: {progress['weighted_progress']}%",
        styles['Heading2']
    ))
    
    # Tabela por disciplina
    table_data = [["Disciplina", "CH", "Concluídas", "Total", "% Conclusão"]]
    for s in progress["subjects_detail"]:
        table_data.append([
            s["subject_name"],
            str(s["workload"]) + "h",
            str(s["completed_tasks"]),
            str(s["total_tasks"]),
            f"{s['completion_percentage']}%"
        ])
    
    elements.append(Table(table_data))
    elements.append(Spacer(1, 20))
    
    # Insights
    insights = await generate_insights(current_user)
    elements.append(Paragraph("Insights de IA", styles['Heading2']))
    for insight in insights:
        elements.append(Paragraph(insight["insight_message"], styles['Normal']))
        elements.append(Spacer(1, 8))
    
    doc.build(elements)
    buffer.seek(0)
    return buffer
```

---

### 6.5 Push Notifications — Gatilhos Automáticos

**Gatilhos baseados em `due_date` e `status`:**

| Gatilho | Condição MongoDB | Ação |
|---|---|---|
| Prazo em 48h | `due_date ≤ now + 2 dias` AND `status ≠ "concluida"` | Push: "⏰ Tarefa X vence em 2 dias!" |
| Prazo em 24h | `due_date ≤ now + 1 dia` AND `status ≠ "concluida"` | Push: "🚨 Tarefa X vence AMANHÃ!" |
| Prazo vencido | `due_date < now` AND `status ≠ "concluida"` | Push: "❌ Tarefa X está atrasada!" |
| Disciplina em risco | Predição `at_risk` | Push semanal: "📉 Disciplina X precisa de atenção" |

**Scheduler (APScheduler):**

```python
# services/notifications.py

from apscheduler.schedulers.asyncio import AsyncIOScheduler

scheduler = AsyncIOScheduler()

@scheduler.scheduled_job('cron', hour=8, minute=0)  # Todo dia às 8h
async def check_deadlines():
    """Verifica tarefas com prazo próximo e dispara push notifications."""
    
    now = datetime.now(timezone.utc)
    threshold_48h = now + timedelta(hours=48)
    threshold_24h = now + timedelta(hours=24)
    
    # Tarefas com prazo em 48h (que ainda não estão concluídas)
    urgent_tasks = await db.academic_tasks.find({
        "due_date": {"$lte": threshold_48h, "$gt": now},
        "status": {"$ne": "concluida"}
    }).to_list(length=500)
    
    for task in urgent_tasks:
        # Resolver user_id via subject
        subject = await db.subjects.find_one({"_id": task["subject_id"]})
        if subject:
            hours_remaining = (task["due_date"] - now).total_seconds() / 3600
            await send_push_notification(
                user_id=subject["user_id"],
                title="⏰ Prazo se aproximando!",
                body=f"'{task['title']}' vence em {int(hours_remaining)}h",
                data={"task_id": str(task["_id"])}
            )
    
    # Tarefas já atrasadas
    overdue_tasks = await db.academic_tasks.find({
        "due_date": {"$lt": now},
        "status": {"$ne": "concluida"}
    }).to_list(length=500)
    
    for task in overdue_tasks:
        subject = await db.subjects.find_one({"_id": task["subject_id"]})
        if subject:
            days_overdue = (now - task["due_date"]).days
            await send_push_notification(
                user_id=subject["user_id"],
                title="❌ Tarefa atrasada!",
                body=f"'{task['title']}' está {days_overdue} dia(s) atrasada",
                data={"task_id": str(task["_id"])}
            )
```

---

## 7. 🏗️ Estrutura de Arquivos do Projeto (Backend Python)

```
edutrack-api/
├── .env                              # Variáveis de ambiente (NÃO versionar)
├── .env.example                      # Template das variáveis
├── requirements.txt                  # Dependências Python (pip freeze)
├── main.py                           # Entrypoint FastAPI + Uvicorn
├── config.py                         # Carregamento de .env + constantes
│
├── database/
│   ├── __init__.py
│   ├── connection.py                 # Conexão MongoDB (motor AsyncIOMotorClient)
│   └── schemas/
│       ├── users_schema.js           # JSON Schema Validation — users
│       ├── subjects_schema.js        # JSON Schema Validation — subjects
│       └── academic_tasks_schema.js  # JSON Schema Validation — academic_tasks
│
├── middleware/
│   ├── __init__.py
│   └── auth.py                       # JWT validation + get_current_user
│
├── models/
│   ├── __init__.py
│   ├── user.py                       # Pydantic models (UserCreate, UserResponse, etc.)
│   ├── subject.py                    # Pydantic models (SubjectCreate, SubjectResponse)
│   └── task.py                       # Pydantic models (TaskCreate, TaskStatusUpdate, etc.)
│
├── routes/
│   ├── __init__.py
│   ├── auth.py                       # POST /register, /login, GET /me
│   ├── subjects.py                   # CRUD /subjects
│   ├── tasks.py                      # CRUD /tasks + status + track-time
│   ├── dashboard.py                  # GET /summary, /progress, /predictions, /insights
│   └── reports.py                    # GET /weekly-pdf
│
├── services/
│   ├── __init__.py
│   ├── analytics.py                  # calculate_weighted_progress()
│   ├── prediction.py                 # predict_completion()
│   ├── insights.py                   # generate_insights()
│   ├── reports.py                    # generate_weekly_report() — PDF
│   └── notifications.py             # Scheduler + push notification triggers
│
└── tests/
    ├── __init__.py
    ├── test_auth.py                  # Testes de registro/login/JWT
    ├── test_subjects.py              # Testes CRUD disciplinas + isolamento
    ├── test_tasks.py                 # Testes CRUD tarefas + máquina de estados
    └── test_analytics.py            # Testes de progresso ponderado + predições
```

---

## 8. 📐 Governança OpenSpec e Diretrizes de Desenvolvimento

### 8.1 Fluxo de Trabalho (Papéis)

| Papel | Responsável | Ações |
|---|---|---|
| **Arquiteto de Soluções** | Estudante (João Victor) | Define rotas, payloads, regras de negócio em arquivos de **Proposals** |
| **Executor Técnico** | Agente IA (Antigravity / Gemini Code Assist) | Codifica schemas, rotas Python, validações e testes |
| **Revisor** | Estudante | Aprova PRs, valida conformidade com a spec, homologa no FlutterFlow |

### 8.2 Ciclo de Desenvolvimento

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  1. PROPOSAL │────►│  2. SPEC     │────►│  3. CODE     │────►│  4. REVIEW   │
│  (Estudante) │     │  (OpenSpec)  │     │  (Agente IA) │     │  (Estudante) │
│              │     │              │     │              │     │              │
│  Define rota │     │  Documenta   │     │  Implementa  │     │  Valida &    │
│  e payload   │     │  no OPENSPEC │     │  rota + test │     │  Homologa    │
└──────────────┘     └──────────────┘     └──────────────┘     └──────┬───────┘
                                                                       │
                                                                       ▼
                                                              ┌──────────────┐
                                                              │  5. DEPLOY   │
                                                              │  + TRACKING  │
                                                              │  (tasks.md)  │
                                                              └──────────────┘
```

### 8.3 Regras de Auditoria

> [!IMPORTANT]
> Todo progresso técnico, refatoração e migração de stack (Xano → MongoDB) **DEVE** ser rastreado no arquivo central `tasks.md`, seguindo o padrão:
> ```markdown
> - [x] Tarefa concluída
> - [/] Tarefa em andamento
> - [ ] Tarefa pendente
> ```

### 8.4 Padrões de Codificação

| Regra | Descrição |
|---|---|
| **Nomenclatura** | Atributos: `snake_case`. Classes Python: `PascalCase`. Rotas: `kebab-case` |
| **Validação** | Todo input externo passa por Pydantic antes de tocar o MongoDB |
| **Erros** | Respostas de erro seguem `{ "detail": "mensagem", "code": "ERRO_TIPO" }` |
| **Logs** | Usar `logging` do Python com nível INFO em produção, DEBUG em dev |
| **Segredos** | ZERO segredos hardcoded. Tudo via `.env` + `python-dotenv` |
| **Testes** | Toda rota CRUD deve ter pelo menos 1 teste de sucesso e 1 de falha |

---

## 9. ⚡ Métricas de Desempenho Não-Funcionais

### 9.1 Metas de Latência

| Operação | Meta | Estratégia |
|---|---|---|
| Autenticação (Login/Register) | ≤ 500ms | bcrypt rounds: 12 (balanceado) |
| CRUD simples (find/insert/update) | ≤ 200ms | Índices compostos nas queries |
| Dashboard Summary (aggregation) | ≤ 2s | Pipeline otimizado + `$match` antes de `$group` |
| Progresso Ponderado | ≤ 2s | Cache em memória com TTL de 5 min |
| Predição Acadêmica | ≤ 2s | Queries paralelas com `asyncio.gather` |
| Geração de Insights | ≤ 2s | Aggregation pipeline single-pass |
| Relatório PDF | ≤ 5s | Geração assíncrona com buffer em memória |

### 9.2 Escalabilidade

| Métrica | Meta | Estratégia |
|---|---|---|
| Usuários simultâneos | ≥ 1000 | Connection pooling do Motor (async) |
| Documentos por coleção | ≤ 10M | Índices compostos + TTL para dados antigos |
| Tamanho do documento | ≤ 16MB (limite BSON) | Campos `description` limitados a 5000 chars |
| Conexões MongoDB | Pool: 10-100 | `maxPoolSize=100` no connection string |

### 9.3 Estratégia de Índices (Resumo Consolidado)

| Coleção | Índice | Tipo | Propósito |
|---|---|---|---|
| `users` | `email` | Unique | Login + prevenção de duplicatas |
| `users` | `created_at` | Descendente | Ordenação por data de cadastro |
| `subjects` | `user_id + name` | Composto | Listagem por usuário |
| `subjects` | `user_id + end_date` | Composto | Queries de predição temporal |
| `academic_tasks` | `subject_id + status` | Composto | Dashboard + contagens |
| `academic_tasks` | `due_date + status` | Composto | Scheduler de notificações |
| `academic_tasks` | `subject_id + estimated_time + real_time` | Composto | Analytics de variância |

> [!TIP]
> Use `db.collection.explain("executionStats")` para validar que todas as queries utilizam os índices planejados. Nenhuma query de produção deve resultar em `COLLSCAN` (scan completo de coleção).

---

## 10. 🚨 Armadilhas e Gotchas

1. **ObjectId como string no JSON:** O MongoDB retorna `ObjectId()`, mas a API REST serializa como `string`. Converter com `str(doc["_id"])` antes de retornar e `ObjectId(id_str)` ao receber.

2. **`academic_tasks` não tem `user_id` direto:** O isolamento de segurança exige **sempre** validar ownership via `subjects.find_one({_id: subject_id, user_id: user_id})` antes de qualquer operação em tasks.

3. **`$inc` aceita valores negativos:** O operador `$inc` permite decrementar. A rota `track-time` **DEVE** validar `minutes_to_add > 0` antes de aplicar.

4. **`bcrypt` é CPU-bound:** Hashing de senha com bcrypt bloqueia o event loop. Usar `loop.run_in_executor()` ou a lib `passlib` com suporte a async.

5. **Timezone-awareness:** Todas as datas devem ser armazenadas em UTC (`timezone.utc`). O FlutterFlow converte para o timezone local do dispositivo na exibição.

6. **JSON Schema Validation é síncrono:** O MongoDB valida schemas no `insert` e `update`. Erros de validação retornam `WriteError` com código 121 — tratar no Python para mensagens legíveis.

7. **`motor` vs `pymongo`:** O `motor` é assíncrono (para FastAPI). O `pymongo` é síncrono (para scripts/cron). Não misturar em rotas assíncronas.

8. **Limites de agregação:** Pipelines de `$aggregate` processam em memória por padrão (limite de 100MB). Para datasets grandes, usar `allowDiskUse=True`.

---

## 11. ✅ Status Atual do Projeto

### Documentação (TIER 4 — Stack MongoDB)

- [x] Visão geral do produto e fluxos principais
- [x] Arquitetura de integração (FlutterFlow + Python + MongoDB)
- [x] Modelo de dados NoSQL completo (3 coleções)
- [x] JSON Schema Validation para todas as coleções
- [x] Estratégia de índices documentada
- [x] Diagrama de relacionamento entre coleções
- [x] Fluxos de autenticação (Register + Login) com JWT
- [x] Middleware de segurança e isolamento de documentos
- [x] Mapa de rotas REST completo (17 endpoints)
- [x] Operações CRUD com payloads de request/response
- [x] Máquina de estados de tarefas com transições válidas
- [x] Tracking de tempo com operador atômico `$inc`
- [x] Dashboard com aggregation pipelines
- [x] Cálculo de Progresso Ponderado (fórmula + implementação)
- [x] Predição Acadêmica (velocidade + dias restantes)
- [x] Motor de Insights Inteligentes (variância de tempo)
- [x] Relatórios semanais em PDF
- [x] Push Notifications (scheduler + gatilhos)
- [x] Estrutura de arquivos do backend Python
- [x] Governança OpenSpec e fluxo de trabalho
- [x] Métricas de desempenho não-funcionais
- [x] Armadilhas e gotchas documentadas

### Pendente (Próximas Fases)

- [ ] **Implementação do Backend Python:** Codificar rotas, middleware e services conforme esta spec
- [ ] **Setup do MongoDB Atlas:** Criar cluster, configurar IP whitelist, obter connection string
- [ ] **JSON Schema Validation:** Aplicar schemas via `db.createCollection()` ou `db.command("collMod")`
- [ ] **Criação de Índices:** Executar scripts de indexação em ambiente de staging
- [ ] **Integração FlutterFlow:** Configurar API calls do FlutterFlow apontando para a Engine Python
- [ ] **Testes de Integração:** Validar fluxos end-to-end (register → criar disciplina → criar tarefa → dashboard)
- [ ] **Firebase Push Notifications:** Integrar SDK Firebase para push via FlutterFlow
- [ ] **Deploy:** Containerizar backend (Docker) e configurar CI/CD
- [ ] **Rate Limiting:** Implementar throttling na API (ex: `slowapi`)
- [ ] **Monitoramento:** Configurar logging centralizado e alertas de performance

---

## 12. 📝 Changelog

| Data | Versão | Mudança |
|---|---|---|
| 2026-05-26 | 1.0.0 | **TIER 4 — MIGRAÇÃO COMPLETA:** Geração da Documentação Viva do EduTrack AI com stack MongoDB. Mapeamento de 3 coleções NoSQL, 17 endpoints REST, motor de IA (progresso ponderado, predição, insights), scheduler de notificações, relatórios PDF, e governança OpenSpec. Migração integral de Xano para MongoDB documentada. |

---

> **PROTOCOLO:** Este arquivo deve ser atualizado ao final de cada tarefa, correção de bug ou alteração de código. A seção "Status Atual" é a fonte de verdade para o progresso do projeto. Toda refatoração da stack antiga (Xano) para MongoDB deve ser registrada no Changelog com data e versão.

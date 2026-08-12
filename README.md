# SportFlow — Front-end

Interface web do sistema SportFlow, desenvolvida com **React 19 + TypeScript + Vite 7 + Tailwind CSS v4**, para gestão de atletas e empresas esportivas.

---

## 🛠️ Stack

| Tecnologia | Versão | Uso |
|---|---|---|
| React | ^19.1 | UI Framework |
| TypeScript | ~5.9 | Tipagem estática |
| Vite | ^7.1 | Build tool / Dev server |
| Tailwind CSS | ^4.1 | Estilização utilitária |
| React Router DOM | ^7.9 | Roteamento SPA |
| Axios | ^1.13 | Cliente HTTP |
| Lucide React | ^0.552 | Ícones |
| react-to-print | ^3.3 | Impressão de fichas de atleta |
| ESLint | ^9.36 | Linting |
| Prettier | — | Formatação |

---

## 📁 Estrutura de Pastas

```
SportFlow-frontEnd/
├── src/
│   ├── App.tsx                    # Roteador principal + guards de rota
│   ├── main.tsx                   # Entry point
│   ├── assets/                    # Imagens e recursos estáticos
│   ├── components/
│   │   ├── Footer/                # Rodapé
│   │   ├── Menu/
│   │   │   └── TopBar.tsx         # Barra de navegação superior
│   │   ├── Modal/
│   │   │   └── ModalBase.tsx      # Modal genérico reutilizável
│   │   ├── Print/
│   │   │   └── PrintContainer.tsx # Container oculto para impressão
│   │   └── ProtectedRoute/        # HOC de rota protegida
│   ├── contexts/
│   │   ├── AuthContext.tsx        # Contexto de autenticação global
│   │   └── ThemeContext.tsx       # Contexto de tema
│   ├── hooks/
│   │   ├── useModal.tsx           # Hook para controle de modais
│   │   └── usePrint.ts            # Hook para impressão de fichas
│   ├── pages/
│   │   ├── LandingPage/           # Página inicial pública (login incluso)
│   │   ├── Home/                  # Lista de atletas com busca, edição e impressão
│   │   ├── Athletes/              # Formulário de cadastro/edição de atleta
│   │   │   └── AthletePrintCard.tsx # Cartão de impressão da ficha do atleta
│   │   ├── Enterprise/            # Detalhes/edição da empresa
│   │   ├── User/                  # Perfil do usuário logado
│   │   ├── Reports/               # Página de relatórios
│   │   └── AdminPanel/            # Painel exclusivo do Super Admin
│   ├── routes/
│   │   └── ProtectedRoute.tsx     # Componente de rota com guard de autenticação
│   ├── services/
│   │   ├── api.ts                 # Instância Axios + interceptors JWT/refresh
│   │   ├── athletesService.ts     # CRUD de atletas
│   │   ├── enterpriseService.ts   # Busca de empresas
│   │   └── userService.ts         # Perfil do usuário
│   ├── styles/
│   │   └── App.css                # Estilos globais
│   └── utils/
│       └── util.ts                # Formatadores (CPF, telefone, CEP, data)
├── public/
├── index.html
├── vite.config.ts
├── tailwind.config.*
├── tsconfig.json
└── package.json
```

---

## 🔐 Autenticação & Perfis de Usuário

O contexto de autenticação ([`AuthContext.tsx`](src/contexts/AuthContext.tsx)) gerencia tokens JWT e dados do usuário via `localStorage`.

### Perfis (`UserRole`)

| Role | `is_admin` | `enterprise_id` | Acesso |
|---|---|---|---|
| `superadmin` | `true` | `null` | Painel Admin (`/admin`), tudo |
| `gestor` | `true` | `!= null` | Área da empresa + atletas |
| `funcionario` | `false` | `!= null` | Área de atletas |

### Fluxo de Tokens
1. Login → `access_token` + `refresh_token` salvos no `localStorage`
2. Axios intercepta toda requisição e injeta o `Bearer token`
3. Em caso de `401`, o interceptor tenta renovar o token via `POST /api/refresh`
4. Múltiplas requisições simultâneas aguardam o refresh em uma fila (`failedRequestsQueue`)
5. Se o refresh falhar → evento global `auth:logout` redireciona para a LandingPage

---

## 🗺️ Rotas do Front-end

| Rota | Página | Proteção |
|---|---|---|
| `/` | `LandingPage` | Pública |
| `/home` | `Home` | Autenticado |
| `/athletes` | `Athletes` (cadastro) | Autenticado |
| `/athletes/:id` | `Athletes` (edição) | Autenticado |
| `/enterprise` | `Enterprise` | Autenticado |
| `/user` | `User` | Autenticado |
| `/reports` | `Reports` | Autenticado |
| `/admin` | `AdminPanel` | Apenas **Super Admin** |

> O guard `SuperAdminRoute` verifica `is_admin === true && enterprise_id === null`. Se não for Super Admin, redireciona para `/home`.

---

## 📄 Páginas & Funcionalidades

### 🏠 Home (`/home`)
- Listagem paginada de atletas da empresa
- **Busca em tempo real** por nome do atleta
- Ações por atleta: **Editar**, **Excluir**, **Imprimir ficha**
- Impressão via `react-to-print` com layout formatado (`AthletePrintCard`)
- Integração com `enterpriseService` para exibir o nome da empresa

### 🏃 Athletes (`/athletes` e `/athletes/:id`)
- Formulário completo de **cadastro e edição** de atleta
- Campos: nome, nascimento, gênero, estado civil, posição, CPF, endereço completo, telefones, e-mail, nome dos pais, observações
- **Upload de foto** com validação de proporção 3:4 (tolerância de 2%)
- Preview da foto no formulário
- Máscara automática de CPF, telefone e CEP (via `utils/util.ts`)
- Ao editar via URL `/athletes/:id`, carrega dados do atleta automaticamente
- Usa `FormData` com `multipart/form-data` para envio de fotos
- Para update usa `_method: PUT` (Laravel method spoofing)

### 🏢 Enterprise (`/enterprise`)
- Exibe e edita os dados da empresa do usuário logado
- Upload de logo da empresa
- Campos completos: razão social, nome fantasia, CNPJ, IE, endereço, contato

### 👤 User (`/user`)
- Perfil do usuário logado
- Atualização de nome e e-mail

### 📊 Reports (`/reports`)
- Página de relatórios (em desenvolvimento)

### 🛡️ AdminPanel (`/admin`)
- **Exclusivo para Super Admin**
- Listagem de todas as empresas cadastradas
- Criação de novas empresas (formulário completo com campos de endereço)
- Criação de usuários vinculados a empresas específicas
- Navegação entre empresas com `ChevronRight`

---

## ⚙️ Serviços de API (`src/services/`)

### `api.ts`
- Instância global do Axios com `baseURL: http://localhost:8080/api/`
- Interceptor de **request**: injeta `Authorization: Bearer <token>`
- Interceptor de **response**: refresh automático de token em `401`
- Fila de requisições para evitar múltiplos refreshes simultâneos

### `athletesService.ts`
| Função | Método | Endpoint |
|---|---|---|
| `createAthlete(data)` | `POST` | `/athletes` |
| `getAthletes(params)` | `GET` | `/athletes` |
| `getAthleteById(id)` | `GET` | `/athletes/:id` |
| `getAthletesByName(name)` | `GET` | `/athletes?search=` |
| `updateAthlete(id, data)` | `POST` + `_method=PUT` | `/athletes/:id` |
| `deleteAthlete(id)` | `DELETE` | `/athletes/:id` |

### `enterpriseService.ts`
| Função | Método | Endpoint |
|---|---|---|
| `getEnterprises(params)` | `GET` | `/enterprises` |

### `userService.ts`
| Função | Método | Endpoint |
|---|---|---|
| Atualização de perfil | `PUT` | `/user` |

---

## 🧩 Hooks Customizados

### `useModal`
Controla o estado de modais de confirmação, sucesso e erro.  
Expõe: `openConfirm`, `openSuccess`, `openError`, `close`, `modalState`.

### `usePrint`
Wrapper sobre `react-to-print` para impressão de fichas de atleta.  
Recebe `contentRef` e `documentTitle`.

---

## 🚀 Instalação e Execução Local

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor de desenvolvimento
npm run dev

# A aplicação estará disponível em:
# http://localhost:5173
```

> **Atenção:** O back-end deve estar rodando em `http://localhost:8080` para que a API funcione corretamente. Configure o endereço em `src/services/api.ts` se necessário.

---

## 🐳 Executar via Docker

Na **raiz do monorepo** (`/SportFlow`):

```bash
docker-compose up -d
```

O container do front-end (`react_app`) executa `npm install && npm run dev --host --port 5173` automaticamente.

Acesse: [`http://localhost:5173`](http://localhost:5173)

---

## 🔧 Scripts Disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento (Vite HMR) |
| `npm run build` | Build de produção (TypeScript + Vite) |
| `npm run lint` | Executa ESLint |
| `npm run preview` | Preview local do build de produção |

---

## 🗂️ Utilitários (`src/utils/util.ts`)

| Função | Descrição |
|---|---|
| `formatDocument(value)` | Máscara CPF ou CNPJ |
| `formatPhone(value)` | Máscara de telefone/celular |
| `formatZipCode(value)` | Máscara de CEP |
| `formatDate(value)` | Formatação de data para exibição |
| `formatCPF(value)` | Máscara específica de CPF |

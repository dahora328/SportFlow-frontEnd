# SportFlow FrontEnd

Aplicacao web para gestao esportiva com foco no fluxo de atletas, autenticacao e navegacao entre modulos principais do sistema. Este projeto foi construido com React + TypeScript e utiliza Vite para desenvolvimento e build.

## Visao geral

O front-end do SportFlow entrega:

- cadastro e edicao de atletas com upload de foto;
- listagem e gerenciamento de atletas;
- fluxo de autenticacao com tokens;
- paginas auxiliares como landing page, home, relatorios e cadastro de usuario.

## Stack utilizada

- React 19
- TypeScript
- Vite
- React Router DOM
- Axios
- Tailwind CSS
- ESLint

## Funcionalidades principais

- **Autenticacao**
  - armazenamento de `access_token` e `refresh_token` no `localStorage`;
  - renovacao automatica de token em respostas `401` via interceptor do Axios.

- **Modulo de atletas**
  - criacao e atualizacao com `multipart/form-data`;
  - upload de foto com validacao de proporcao 3x4;
  - carregamento de dados para edicao por rota (`/athletes/:id`).

- **Navegacao**
  - rotas com React Router;
  - barra superior exibida de forma condicional conforme a rota.

## Rotas da aplicacao

- `/` - Landing Page
- `/register` - Cadastro de usuario
- `/home` - Pagina inicial interna
- `/athletes` - Cadastro de atleta
- `/athletes/:id` - Edicao de atleta
- `/reports` - Relatorios
- `/user` - Area de usuario

## Requisitos

- Node.js 18+ (recomendado)
- npm 9+

## Como executar o projeto

1. Instale as dependencias:

```bash
npm install
```

2. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

3. Acesse no navegador:

```txt
http://localhost:5173
```

## Scripts disponiveis

- `npm run dev` - inicia ambiente de desenvolvimento
- `npm run build` - gera build de producao
- `npm run preview` - sobe o build localmente para validacao
- `npm run lint` - executa verificacoes de lint

## Configuracao da API

Atualmente, a instancia Axios esta configurada com base fixa em:

`http://localhost:80/api/`

Arquivo de referencia: `src/services/api.ts`.

Se necessario, ajuste esse valor para o endpoint do seu backend.

## Estrutura de pastas (resumo)

```txt
src/
  components/    # componentes reutilizaveis (menu, modal, etc.)
  contexts/      # contexto de autenticacao e tema
  hooks/         # hooks customizados
  pages/         # paginas da aplicacao
  routes/        # protecao/organizacao de rotas
  services/      # integracao com API (axios e servicos)
  styles/        # estilos globais
  utils/         # funcoes utilitarias
```

## Observacoes

- Este repositorio depende do backend para funcionalidades de autenticacao e atletas.
- Caso o backend esteja indisponivel, requisicoes que dependem da API irao falhar.

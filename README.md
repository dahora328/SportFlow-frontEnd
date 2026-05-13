# SportFlow FrontEnd

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)](#roadmap)

Aplicacao web para gestao esportiva com foco no fluxo de atletas, autenticacao e
navegacao entre modulos principais do sistema.

## Sobre o projeto

O SportFlow FrontEnd foi criado para oferecer uma experiencia simples e
eficiente para operacoes do dia a dia esportivo, principalmente no cadastro e
gerenciamento de atletas.

### Principais entregas

- cadastro, edicao e organizacao de atletas;
- upload de foto com validacao de proporcao 3x4;
- autenticacao com token e refresh automatico;
- navegação entre modulos como landing page, home, relatorios e usuario.

## Stack

- React 19
- TypeScript
- Vite
- React Router DOM
- Axios
- Tailwind CSS
- ESLint

## Preview da interface

> Adicione imagens reais do projeto nos caminhos abaixo para melhorar a
> apresentacao no GitHub.

![Landing Page](./docs/screenshots/landing-page.png)
![Tela de Home](./docs/screenshots/home.png)
![Cadastro de Atleta](./docs/screenshots/athletes-form.png)

## Fluxo de autenticacao

- tokens `access_token` e `refresh_token` sao persistidos no `localStorage`;
- requests autenticadas recebem `Authorization: Bearer <token>` via interceptor;
- em caso de `401`, o app tenta refresh automaticamente;
- se o refresh falhar, os dados de sessao sao limpos.

Arquivo principal: `src/services/api.ts`.

## Rotas da aplicacao

| Rota            | Descricao              |
| --------------- | ---------------------- |
| `/`             | Landing Page           |
| `/register`     | Cadastro de usuario    |
| `/home`         | Pagina inicial interna |
| `/athletes`     | Cadastro de atleta     |
| `/athletes/:id` | Edicao de atleta       |
| `/reports`      | Relatorios             |
| `/user`         | Area do usuario        |

## Como rodar localmente

### 1) Requisitos

- Node.js 18+
- npm 9+

### 2) Instalar dependencias

```bash
npm install
```

### 3) Executar em desenvolvimento

```bash
npm run dev
```

A aplicacao ficara disponivel em:

```txt
http://localhost:5173
```

## Scripts

```bash
npm run dev      # ambiente de desenvolvimento
npm run build    # build de producao
npm run preview  # preview do build
npm run lint     # analise de lint
```

## Configuracao da API

A base atual da API esta definida como:

`http://localhost:80/api/`

Para trocar o backend, ajuste a `baseURL` no arquivo `src/services/api.ts`.

## Estrutura do projeto

```txt
src/
  components/    # componentes reutilizaveis (menu, modal etc.)
  contexts/      # contextos globais (auth, tema)
  hooks/         # hooks customizados
  pages/         # paginas/telas
  routes/        # protecao e fluxo de rotas
  services/      # camada de API e servicos
  styles/        # estilos globais
  utils/         # utilitarios
```

## Roadmap

- [x] CRUD principal de atletas
- [x] Upload de foto no cadastro de atletas
- [x] Fluxo de autenticacao com refresh de token
- [ ] Protecao de rotas por perfil de usuario
- [ ] Testes automatizados (unitarios/integracao)
- [ ] Pipeline CI para lint + build
- [ ] Melhorias de UX em estados de erro e carregamento

## Contribuicao

1. Crie uma branch para sua feature: `git checkout -b feat/minha-feature`
2. Faça commits descritivos
3. Abra um Pull Request com contexto e imagens (quando houver alteracao visual)

## Observacoes

- Este front-end depende do backend para autenticacao e operacoes de atletas.
- Se a API estiver indisponivel, funcionalidades dependentes de rede podem
  falhar.

# Histórico de Versões

## Índice

- [20/01/2026](#20012026)
- [30/12/2025](#30122025)
- [29/12/2025](#29122025)
- [16/11/2025](#16112025)
- [11/12/2025](#11122025)
- [28/11/2025](#28112025)
- [25/11/2025](#25112025)
- [21/11/2025](#21112025)
- [19/11/2025](#19112025)
- [18/11/2025](#18112025)
- [17/11/2025](#17112025)
- [10/11/2025](#10112025)
- [09/11/2025](#09112025)
- [04/11/2025](#04112025)

## [20/01/2026]

- Arrumar a data de nacimento o ano está deixando informar mais de 4 digitos.
  (Erro de sistema)

## [30/12/2025]

- Criação do tela inicial do sistema. (Em desenvolvimento)

## [29/12/2025]

- Melhorar o menu, parte do perfil pois estava clicando e ficava sempre aberto,
  agora quando passa o mouse ele abre e fecha quando sai
- Remove comandos não utilizados

## [16/11/2025]

- Mudança para componente modal genérico.
- Usar o hook modal.
- Aplicando o modal genérico no sistema.
- Delete o modal alerta antigo.

## [11/12/2025]

- Mudança da rota login para rota correta /login pois antes estava na
  landingpage.
- Adicionado no contexto Autenticação.
- Pegar o id do usuário que está logado na sesão do sistema.
- Página em branco.
- Adicionado headrs content-type e accept.
- Adicionado idi do usuário na interface LoginResponse.
- Adicionado componente ProtectedRoute.

## [28/11/2025]

- Foi implementando o refresh do token automaticamente no front end.
- Adicionado modal para teste. Não foi utilizado ainda.

## [25/11/2025]

- Modificado a tela de atletas pois estava apenas para cadastro, agora fica.
  tanto para cadastro quanto para edição.
- Adicionado o campo ID para conseguir fazer a busca do atleta selecionado.
- Criação do histórico de mudanças do sistema.
- Função para recuperar o usuário acrescentada no services do usuário.
- Recuperar o usuário que está logado, para gravar no atleta pois estava de
  forma estática
- Implementação de mais funções utils (Formatar celular, CEP e Documento(CPF e
  CNPJ)).
- Implementação de deletar atleta.

## [21/11/2025]

- Adicionada rota de comentário no atleta.
- Função e rota para recuperar atleta por ID.
- Alterada requisição de salvar nos campos gênero e estado civil.
- Função de obter por ID para editar atletas.
- Contexto de logout.
- Adicionada autenticação no projeto com token JWT.

## [19/11/2025]

- Adicionadas funções utilitárias e ícones de lixeira e edição na tabela.
- Adicionado ícone de logout.
- Serviços de usuário.
- Adicionadas funções utilitárias ao projeto.
- Adicionada função para recuperar todos os atletas.
- Modificado ícone no campo de senha.
- Adicionado `owner_id` na requisição de criação para todos os atletas.
- Corrigido nome da rota de Atletas.
- Funcionalidade: adicionado modal de login na janela principal.
- Funcionalidade: redirecionamento de rota para a home.
- Funcionalidade: modal de login.
- Funcionalidade: função de criar e logar usuário.
- Funcionalidade: adicionado interceptors para token JWT.

## [18/11/2025]

- Funcionalidade: adicionado Login.
- Funcionalidade: adicionado serviços nas rotas com Axios.
- Funcionalidade: adicionada landing page nas rotas.
- Funcionalidade: adicionado login nas rotas.
- Funcionalidade: teste de JSON na requisição do front-end.
- Funcionalidade: editar Usuário.
- Funcionalidade: adicionada rota de relatório.
- Adicionado Axios ao projeto.

## [17/11/2025]

- Funcionalidade: botão para voltar à página inicial.
- Funcionalidade: adicionado link para a página de usuário.
- Funcionalidade: adicionada rota de usuário.

## [10/11/2025]

- Funcionalidade: Readme.
- Funcionalidade: layout nas páginas de Atletas e Home.
- Funcionalidade: página Home.
- Adicionado o logo da equipe.
- Funcionalidade: Readme com resumo do aplicativo.
- Funcionalidade: changelog nas modificações do aplicativo.

## [09/11/2025]

- Implementado formulário de registro de atletas.
- Adicionado Link e Roteador na Barra Superior (TopBar).
- Modificada descrição no menu.
- Adicionada página de Atletas.
- Adicionado React DOM ao projeto.

## [04/11/2025]

- Corrigida cor do menu e layout.
- Adicionado Menu na Barra Superior (TopBar), removido Menu Lateral (SideBar).
- Adicionado lucide-react.
- Criados componentes iniciais.
- Commit inicial.

```

```

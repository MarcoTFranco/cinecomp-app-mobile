# CineComp App

Aplicativo mobile desenvolvido para o **Desafio Mobile 2026.2 da Comp Júnior**. É um catálogo de filmes com autenticação e CRUD completo, construído com **React Native + Expo**, consumindo a **[CineComp API](https://github.com/jpedroreiss/backend-cinecomp-2026-2)** e com a identidade visual do design **Zeus** (Figma) disponibilizado no desafio.

## Funcionalidades

- **Autenticação:** login com e-mail e senha, cadastro de conta, sessão mantida entre aberturas do app (opcional, "Manter conectado") e logout com confirmação.
- **Rotas protegidas:** todas as telas internas só são acessíveis com usuário autenticado; se o token expirar, a sessão é encerrada automaticamente.
- **CRUD de filmes:** listar, buscar, filtrar por gênero, ver detalhes, cadastrar, editar e excluir (com modal de confirmação).
- **Favoritos:** adicionar e remover filmes dos favoritos.
- **Perfil:** visualizar e editar nome e e-mail.
- **Página inicial:** totais, filmes por gênero, adicionados recentemente e mais bem avaliados.
- **Sidebar (drawer)** para navegação, fixa em tablets grandes na horizontal.
- **Feedback visual:** loading, indicadores de carregamento, toasts de sucesso/erro, estados vazios e de erro com "Tentar novamente", pull-to-refresh e paginação infinita.
- **Responsivo** para celular e tablet (grade de colunas adaptável, layouts lado a lado no tablet).

## Tecnologias

| Tecnologia | Uso |
| --- | --- |
| [React Native](https://reactnative.dev/) + [Expo SDK 57](https://expo.dev/) | Base do app multiplataforma |
| [TypeScript](https://www.typescriptlang.org/) | Tipagem estática |
| [Expo Router](https://docs.expo.dev/router/introduction/) | Navegação por arquivos, drawer e rotas protegidas (`Stack.Protected`) |
| [Axios](https://axios-http.com/) | Cliente HTTP com interceptors |
| [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/) | Armazenamento criptografado do token |
| [Expo Image](https://docs.expo.dev/versions/latest/sdk/image/) | Pôsteres com cache e fallback |
| [Open Sans](https://fonts.google.com/specimen/Open+Sans) (`@expo-google-fonts`) | Tipografia do design Zeus |
| [@expo/vector-icons](https://icons.expo.fyi/) | Ícones (Ionicons) |
| ESLint (`eslint-config-expo`) | Padronização de código |

## Justificativas técnicas

- **React Native + Expo:** recomendação do desafio; permite rodar no celular pelo Expo Go sem configurar Android Studio/Xcode e gera Android, iOS e web a partir do mesmo código.
- **Expo Router:** navegação baseada em arquivos (`src/app`), com suporte nativo a drawer e a **rotas protegidas** (`Stack.Protected`), o que deixa a regra de acesso declarativa em um único lugar.
- **CineComp API:** back-end recomendado pela Comp Júnior, com JWT, CRUD de filmes e favoritos. O design Zeus foi usado como **guia visual** (cores, tipografia, login com painel lateral, sidebar, cards, modais de confirmação e sucesso), adaptado ao domínio de filmes.
- **Context API** para autenticação e mensagens: o estado global do app é pequeno, então não há necessidade de bibliotecas como Redux.
- **Camada de serviços + erros padronizados:** as telas nunca lidam com Axios diretamente; todo erro vira um `AppError` com mensagem amigável em português (sem conexão, servidor indisponível, dados inválidos, sessão expirada, resposta inesperada).
- **Validação das respostas da API:** cada resposta é verificada antes de chegar às telas; um formato inesperado mostra uma mensagem clara em vez de quebrar o app.

## Segurança

- O token JWT é salvo com **SecureStore** (Keychain no iOS / Keystore no Android) com acesso restrito ao dispositivo desbloqueado. Na web não há armazenamento seguro equivalente, então a sessão fica só em memória.
- Com "Manter conectado" desmarcado, o token não é gravado: a sessão termina ao fechar o app.
- **Senhas nunca são armazenadas** nem registradas em log; o campo de senha é limpo após falha de login.
- Bloqueio temporário de 30 s após 5 tentativas de login sem sucesso.
- Respostas `401` em requisições autenticadas encerram a sessão automaticamente.
- Mensagens de erro do servidor (5xx) não são exibidas ao usuário, evitando vazar detalhes internos.
- Validação de dados no cliente (e-mail, tamanho de senha, ano, nota, URL do pôster apenas `http(s)`), além da validação do back-end.
- O arquivo `.env` **não é versionado**. Variáveis `EXPO_PUBLIC_*` ficam visíveis no app compilado, por isso contêm apenas a URL da API, nunca segredos.

## Pré-requisitos

- [Node.js](https://nodejs.org/) (LTS) e npm
- [Git](https://git-scm.com/)
- App **Expo Go** no celular (Android/iOS) **ou** um emulador Android / simulador iOS
- Celular e computador na **mesma rede Wi-Fi** (para testar no aparelho físico)

## Como rodar

### 1. Back-end (CineComp API)

```bash
git clone https://github.com/jpedroreiss/backend-cinecomp-2026-2.git
cd backend-cinecomp-2026-2
npm install
npm run dev
```

A API sobe em `http://localhost:3000` (documentação em `http://localhost:3000/api/docs`). O banco SQLite é criado automaticamente, com filmes de exemplo e um usuário de teste descrito no README do back-end.

### 2. Aplicativo

```bash
git clone https://github.com/MarcoTFranco/cinecomp-app.git
cd cinecomp-app
npm install
```

Crie o arquivo `.env` a partir do exemplo:

```bash
# Linux/macOS
cp .env.example .env

# Windows (PowerShell)
Copy-Item .env.example .env
```

Edite `EXPO_PUBLIC_API_URL` no `.env`:

| Onde o app vai rodar | Valor |
| --- | --- |
| Celular físico (Expo Go) | `http://SEU_IP_LOCAL:3000/api` (descubra o IP com `ipconfig` no Windows ou `ifconfig` no Linux/macOS) |
| Emulador Android | `http://10.0.2.2:3000/api` |
| Simulador iOS / navegador | `http://localhost:3000/api` |

Inicie o app:

```bash
npx expo start
```

Escaneie o QR Code com o Expo Go (Android) ou com a câmera (iOS). Também é possível pressionar `a` para abrir no emulador Android ou `w` para abrir no navegador.

> Se o app mostrar "Sem conexão com o servidor", confira se a API está rodando, se o IP do `.env` está correto e se o firewall permite conexões na porta 3000. Após alterar o `.env`, reinicie com `npx expo start -c`.

### Scripts úteis

```bash
npx tsc --noEmit   # checagem de tipos
npx expo lint      # lint
```

## Estrutura do projeto

```text
cinecomp-app/
├── assets/
│   └── images/zeus/         # Logos e fundo extraídos do Figma Zeus
├── src/
│   ├── app/                 # Rotas (Expo Router): cada arquivo é uma tela
│   │   ├── _layout.tsx      # Providers, fontes e rotas protegidas
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── (drawer)/        # Telas com sidebar (só autenticado)
│   │   │   ├── _layout.tsx  # Drawer + confirmação de logout
│   │   │   ├── index.tsx    # Página inicial
│   │   │   ├── movies.tsx   # Listagem, busca, filtros e paginação
│   │   │   ├── favorites.tsx
│   │   │   └── profile.tsx
│   │   └── movie/
│   │       ├── [id].tsx     # Detalhes do filme
│   │       └── form.tsx     # Cadastro e edição
│   ├── components/          # Componentes reutilizáveis (Button, TextField, MovieCard, modais...)
│   ├── contexts/            # AuthContext e ToastContext
│   ├── hooks/               # useApiQuery, useMovieActions, useResponsive...
│   ├── services/            # API (Axios), serviços, tratamento de erros e token
│   ├── styles/              # Tema: cores, fontes, espaçamentos (tokens do Zeus)
│   ├── types/               # Tipos da API
│   └── utils/               # Formatação, validações e gêneros
├── .env.example
└── app.json
```

## Melhorias futuras

- Recuperação de senha (o design Zeus prevê o fluxo, mas a API ainda não possui o endpoint).
- Upload de pôster pela galeria/câmera em vez de URL.
- Modo escuro e testes automatizados (Jest + Testing Library).

## Licença

MIT

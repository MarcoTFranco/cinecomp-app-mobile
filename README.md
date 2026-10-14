# CineComp App

Aplicativo mobile desenvolvido para o **Desafio Mobile 2026.2 da Comp Júnior**, construído com **React Native + Expo** e consumindo a **CineComp API**.

> 🚧 Projeto em desenvolvimento. Este README será completado ao longo do desafio.

## Tecnologias

- [React Native](https://reactnative.dev/) com [Expo](https://expo.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Expo Router](https://docs.expo.dev/router/introduction/) (navegação com drawer/sidebar)
- [Axios](https://axios-http.com/) (requisições HTTP)
- [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/) (armazenamento seguro do token de sessão)

## Pré-requisitos

- [Node.js](https://nodejs.org/) (versão LTS) e npm
- [Git](https://git-scm.com/)
- App **Expo Go** no celular, ou um emulador Android / simulador iOS
- [CineComp API](https://github.com/jpedroreiss/backend-cinecomp-2026-2) rodando localmente

## Como rodar

1. Clone o repositório e instale as dependências:

   ```bash
   git clone https://github.com/MarcoTFranco/cinecomp-app.git
   cd cinecomp-app
   npm install
   ```

2. Crie o arquivo `.env` a partir do exemplo:

   ```bash
   # Linux/macOS
   cp .env.example .env

   # Windows (PowerShell)
   Copy-Item .env.example .env
   ```

3. No `.env`, ajuste `EXPO_PUBLIC_API_URL` para o endereço da API:

   - Celular físico: use o IP da sua máquina na rede local (ex.: `http://192.168.0.10:3000/api`)
   - Emulador Android: `http://10.0.2.2:3000/api`

4. Inicie o app:

   ```bash
   npx expo start
   ```

## Segurança

- O arquivo `.env` **não** é versionado; use o `.env.example` como modelo.
- Variáveis `EXPO_PUBLIC_*` ficam visíveis no app compilado: use-as apenas para dados públicos (como a URL da API), nunca para segredos.
- O token de autenticação é salvo com `expo-secure-store` (armazenamento criptografado do dispositivo).

## Licença

MIT
